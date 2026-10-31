#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${QA_ROOT:?QA_ROOT must be an ephemeral runner directory}"
mkdir -p "$QA_ROOT/logs" "$QA_ROOT/evidence"
qa_sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
qa_tools="$qa_sdk/cmdline-tools/latest/bin"
qa_image='system-images;android-35;default;x86_64'
qa_serial='emulator-5554'
qa_emulator_pid=''
export ANDROID_AVD_HOME="$QA_ROOT/avd"
mkdir -p "$ANDROID_AVD_HOME"

phase() {
  local name="$1"; shift
  printf '%s\n' "$name" > "$QA_ROOT/phase.txt"
  "$@" 2>&1 | tee "$QA_ROOT/logs/$name.log"
}
cleanup() {
  local code=$?
  trap - EXIT
  if [[ -x "$qa_sdk/platform-tools/adb" ]]; then
    "$qa_sdk/platform-tools/adb" -s "$qa_serial" emu kill >/dev/null 2>&1 || true
  fi
  if [[ -n "$qa_emulator_pid" ]]; then kill "$qa_emulator_pid" >/dev/null 2>&1 || true; fi
  printf '%s\n' "$code" > "$QA_ROOT/command.exit"
  python3 release/android-qa/android_smoke.py finalize "$QA_ROOT" || code=1
  exit "$code"
}
trap cleanup EXIT
[[ -n "$qa_sdk" && -d "$qa_sdk" ]] || { echo 'Installed Android SDK is required.'; exit 1; }

node --input-type=module - "$QA_ROOT/source-before.json" <<'NODE'
import { writeFile } from 'node:fs/promises';
import { sourceFingerprint } from './scripts/source-fingerprint.mjs';
await writeFile(process.argv[2], JSON.stringify(await sourceFingerprint(process.cwd())) + '\n');
NODE
git rev-parse HEAD > "$QA_ROOT/source-commit.txt"
phase unit-tests python3 -m unittest discover -s release/android-qa -p '*_test.py'
[[ -x "$qa_tools/sdkmanager" && -x "$qa_tools/avdmanager" && -x "$qa_sdk/platform-tools/adb" ]]

# Record accepted licence files. Never invoke --licenses or answer a terms prompt.
python3 release/android-qa/android_smoke.py licenses "$qa_sdk" "$QA_ROOT/licenses-before.json"
[[ -f "$qa_sdk/licenses/android-sdk-license" ]] || { echo 'Existing Android SDK licence acceptance is unavailable; stopping.'; exit 1; }
phase sdk-installed "$qa_tools/sdkmanager" --sdk_root="$qa_sdk" --list_installed
if [[ ! -x "$qa_sdk/emulator/emulator" ]]; then
  phase sdk-emulator "$qa_tools/sdkmanager" --sdk_root="$qa_sdk" --install emulator </dev/null
fi
if [[ ! -f "$qa_sdk/system-images/android-35/default/x86_64/package.xml" ]]; then
  phase sdk-image "$qa_tools/sdkmanager" --sdk_root="$qa_sdk" --install "$qa_image" </dev/null
fi
python3 release/android-qa/android_smoke.py licenses "$qa_sdk" "$QA_ROOT/licenses-after.json"
cmp "$QA_ROOT/licenses-before.json" "$QA_ROOT/licenses-after.json"
[[ -x "$qa_sdk/emulator/emulator" && -f "$qa_sdk/system-images/android-35/default/x86_64/package.xml" ]] || { echo 'Required official image unavailable with existing accepted licences; no terms accepted.'; exit 1; }

# Read the already-built public candidate. No build, signing or Play account is used.
phase apk-download curl --fail --location --proto '=https' --tlsv1.2 --silent --show-error \
  --max-time 180 --output "$QA_ROOT/candidate.apk" \
  https://expo.dev/artifacts/eas/e865A3eiMp4M6HbOLgY9WqXYL-JJaALYKsx-nGZsRko.apk
qa_build_tools="$qa_sdk/build-tools/36.0.0"
[[ -x "$qa_build_tools/aapt" && -x "$qa_build_tools/apksigner" ]] || { echo 'Installed build-tools36.0.0 are required; no SDK licence or extra tool installation.'; exit 1; }
phase apk-verify python3 release/android-qa/android_smoke.py verify "$QA_ROOT" "$qa_build_tools/aapt" "$qa_build_tools/apksigner"
phase emulator-version "$qa_sdk/emulator/emulator" -version
phase adb-version "$qa_sdk/platform-tools/adb" version

[[ -e /dev/kvm ]] || { echo 'Hardware acceleration /dev/kvm unavailable on this runner.'; exit 1; }
if [[ ! -r /dev/kvm || ! -w /dev/kvm ]]; then
  # Only this disposable runner user receives access; no account/service settings change.
  sudo setfacl -m "u:$(id -un):rw" /dev/kvm
fi
phase acceleration "$qa_sdk/emulator/emulator" -accel-check
phase avd "$qa_tools/avdmanager" create avd --force --name banffbound_api35 --package "$qa_image" --device pixel_6 </dev/null
cat >> "$ANDROID_AVD_HOME/banffbound_api35.avd/config.ini" <<'AVD'
hw.keyboard=no
hw.ramSize=2048
hw.cpu.ncore=2
disk.dataPartition.size=2048M
AVD
printf 'emulator-boot\n' > "$QA_ROOT/phase.txt"
"$qa_sdk/emulator/emulator" -avd banffbound_api35 -port 5554 -no-window -no-audio \
  -no-boot-anim -no-snapshot -wipe-data -gpu swiftshader -accel on -memory 2048 -cores 2 \
  -camera-back none -camera-front none > "$QA_ROOT/logs/emulator.log" 2>&1 &
qa_emulator_pid=$!
phase native-smoke python3 release/android-qa/android_smoke.py run "$QA_ROOT" "$qa_sdk/platform-tools/adb" "$qa_serial"
node --input-type=module - "$QA_ROOT/source-after.json" <<'NODE'
import { writeFile } from 'node:fs/promises';
import { sourceFingerprint } from './scripts/source-fingerprint.mjs';
await writeFile(process.argv[2], JSON.stringify(await sourceFingerprint(process.cwd())) + '\n');
NODE
cmp "$QA_ROOT/source-before.json" "$QA_ROOT/source-after.json"
printf 'finished\n' > "$QA_ROOT/phase.txt"
