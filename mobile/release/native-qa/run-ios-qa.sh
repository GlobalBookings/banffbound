#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."
: "${QA_ROOT:?QA_ROOT must point outside the source tree}"
mkdir -p "$QA_ROOT/logs" "$QA_ROOT/results" "$QA_ROOT/evidence"
export CI=1 EXPO_NO_TELEMETRY=1

# Homebrew CocoaPods isolates xcodeproj in its libexec gems. Reuse that installed
# runtime when necessary; do not install tools or change a developer machine.
qa_ruby="$(command -v ruby)"
if ! "$qa_ruby" -r xcodeproj -e 'exit 0' >/dev/null 2>&1; then
  qa_pods_prefix="$(brew --prefix cocoapods)"
  qa_ruby="$(brew --prefix ruby)/bin/ruby"
  export GEM_HOME="$qa_pods_prefix/libexec"
  "$qa_ruby" -r xcodeproj -e 'exit 0'
fi

phase() {
  local name="$1"
  shift
  printf '%s\n' "$name" > "$QA_ROOT/current-phase.txt"
  "$@" 2>&1 | tee "$QA_ROOT/logs/$name.log"
}

fingerprint() {
  node --input-type=module - "$1" <<'NODE'
import { writeFile } from 'node:fs/promises';
import { sourceFingerprint } from './scripts/source-fingerprint.mjs';
const value = await sourceFingerprint(process.cwd());
await writeFile(process.argv[2], JSON.stringify(value, null, 2) + '\n');
NODE
}

fingerprint "$QA_ROOT/source-before.json"
git rev-parse HEAD > "$QA_ROOT/source-commit.txt"
date -u '+%Y-%m-%dT%H:%M:%SZ' > "$QA_ROOT/started-at.txt"
phase receipt-unit-tests python3 -m unittest discover -s release/native-qa -p '*_test.py'
phase toolchain bash -c 'xcodebuild -version; node --version; pod --version'
"$qa_ruby" --version | tee -a "$QA_ROOT/logs/toolchain.log"
"$qa_ruby" -r xcodeproj -e 'puts "xcodeproj #{Xcodeproj::VERSION}"' | tee -a "$QA_ROOT/logs/toolchain.log"
[[ "$(xcodebuild -version | head -n 1)" == 'Xcode 26.6' ]] || { echo 'Expected pinned Xcode 26.6, refusing incompatible defaults.'; exit 1; }
phase npm-ci npm ci --no-audit --no-fund
phase prebuild npx --no-install expo prebuild --platform ios --no-install
phase pods bash -c 'cd ios && pod install'
phase prepare-tests "$qa_ruby" release/native-qa/prepare-ios-ui-tests.rb

# Prebuild must not quietly change package.json, lock, app source, assets or config.
fingerprint "$QA_ROOT/source-after.json"
cmp "$QA_ROOT/source-before.json" "$QA_ROOT/source-after.json"
git diff --exit-code -- . ':!release/native-qa' > "$QA_ROOT/logs/source-diff.log"

xcrun simctl list devices available --json > "$QA_ROOT/available-devices.json"
python3 - "$QA_ROOT" <<'PY'
import json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
available = json.loads((root / 'available-devices.json').read_text())['devices']
chosen = []
for label, name, dimensions in [('iphone', 'iPhone 17 Pro', [1206, 2622]), ('ipad', 'iPad Pro 13-inch (M5)', [2064, 2752])]:
    matches = []
    for runtime, devices in available.items():
        version = re.search(r'\.iOS-(26(?:-\d+)+)$', runtime)
        if not version:
            continue
        for device in devices:
            if device.get('isAvailable') and device['name'] == name:
                matches.append((tuple(map(int, version[1].split('-'))), runtime, device))
    if not matches:
        raise SystemExit(f'No installed compatible iOS26 {name}; never substitute a different screenshot size silently')
    _, runtime, device = max(matches, key=lambda item: item[0])
    chosen.append({'label': label, 'name': name, 'udid': device['udid'], 'runtime': runtime, 'expectedPixels': dimensions})
(root / 'selected-devices.json').write_text(json.dumps(chosen, indent=2) + '\n')
(root / 'devices.tsv').write_text(''.join(f"{d['label']}\t{d['udid']}\n" for d in chosen))
PY

workspace="$(python3 -c 'import json,os;print(json.load(open(os.environ["QA_ROOT"]+"/project.json"))["workspace"])')"
scheme=BanffBoundNativeQA
derived="$QA_ROOT/DerivedData"
phase build xcodebuild build-for-testing \
  -workspace "$workspace" -scheme "$scheme" -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath "$derived" -jobs 2 \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO

app_path="$(find "$derived/Build/Products/Release-iphonesimulator" -maxdepth 1 -name 'BanffBound.app' -type d -print)"
[[ -n "$app_path" && -f "$app_path/main.jsbundle" ]] || { echo 'Release build must embed main.jsbundle; Metro must not be required.'; exit 1; }
shasum -a 256 "$app_path/main.jsbundle" > "$QA_ROOT/embedded-bundle.sha256"
/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app_path/Info.plist" > "$QA_ROOT/bundle-identifier.txt"
[[ "$(cat "$QA_ROOT/bundle-identifier.txt")" == 'com.banffbound.app' ]]

test_failed=0
while IFS=$'\t' read -r label device; do
  # Only one simulator is booted at a time on the standard 7 GB public runner.
  xcrun simctl shutdown all || true
  xcrun simctl boot "$device"
  xcrun simctl bootstatus "$device" -b
  # Fresh sandbox per device; neither screenshots nor tests can include personal data.
  xcrun simctl uninstall "$device" com.banffbound.app >/dev/null 2>&1 || true
  result="$QA_ROOT/results/$label.xcresult"
  if phase "test-$label" xcodebuild test-without-building \
    -workspace "$workspace" -scheme "$scheme" -configuration Release \
    -destination "platform=iOS Simulator,id=$device" \
    -derivedDataPath "$derived" -resultBundlePath "$result" \
    -parallel-testing-enabled NO -maximum-concurrent-test-simulator-destinations 1 \
    -test-timeouts-enabled YES -default-test-execution-time-allowance 150 \
    -maximum-test-execution-time-allowance 240 \
    CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO; then
    printf '0\n' > "$QA_ROOT/test-$label.exit"
  else
    printf '1\n' > "$QA_ROOT/test-$label.exit"
    test_failed=1
  fi
  xcrun simctl shutdown "$device" || true
done < "$QA_ROOT/devices.tsv"

fingerprint "$QA_ROOT/source-final.json"
cmp "$QA_ROOT/source-before.json" "$QA_ROOT/source-final.json"
date -u '+%Y-%m-%dT%H:%M:%SZ' > "$QA_ROOT/finished-at.txt"
printf 'finished\n' > "$QA_ROOT/current-phase.txt"
exit "$test_failed"
