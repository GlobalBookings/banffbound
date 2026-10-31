#!/usr/bin/env python3
"""Extract a small, reviewable receipt; a failed/missing test never becomes a pass."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys

SCREENS = ('store-01-today', 'store-02-explore', 'store-03-my-trip', 'store-04-essentials')
MAX_SCREEN_BYTES = 8 * 1024 * 1024
MAX_ARTIFACT_BYTES = 48 * 1024 * 1024


def read_json(path, fallback=None):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return fallback


def read_text(path):
    try:
        return path.read_text().strip()
    except OSError:
        return None


def png_details(path):
    data = path.read_bytes()
    if len(data) < 33 or data[:8] != b'\x89PNG\r\n\x1a\n' or data[12:16] != b'IHDR':
        raise ValueError('Not a nonempty PNG screenshot')
    width, height, depth, color = struct.unpack('>IIBB', data[16:26])
    # Apple does not accept alpha channels, even in an otherwise opaque capture.
    alpha = color in (4, 6) or b'tRNS' in data
    return {'width': width, 'height': height, 'bitDepth': depth, 'colorType': color,
            'hasAlphaOrTransparency': alpha, 'bytes': len(data),
            'sha256': hashlib.sha256(data).hexdigest()}


def attachment_records(value):
    if isinstance(value, dict):
        if isinstance(value.get('exportedFileName'), str):
            yield value
        for child in value.values():
            yield from attachment_records(child)
    elif isinstance(value, list):
        for child in value:
            yield from attachment_records(child)


def command_json(command, destination):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        destination.with_suffix('.error.txt').write_text((result.stderr or result.stdout)[-16000:])
        return None
    try:
        value = json.loads(result.stdout)
    except ValueError:
        destination.with_suffix('.error.txt').write_text(result.stdout[-16000:])
        return None
    destination.write_text(json.dumps(value, indent=2) + '\n')
    return value


def main():
    root = Path(sys.argv[1]).resolve()
    evidence = root / 'evidence'
    evidence.mkdir(parents=True, exist_ok=True)
    errors = []
    for name in ('source-before.json', 'source-after.json', 'source-final.json', 'project.json', 'selected-devices.json', 'embedded-bundle.sha256', 'bundle-identifier.txt'):
        source = root / name
        if source.is_file():
            shutil.copy2(source, evidence / name)
    # Keep useful failure output without uploading full logs, result bundles, apps or caches.
    for source in sorted((root / 'logs').glob('*.log'))[:12]:
        (evidence / (source.stem + '.tail.log')).write_bytes(source.read_bytes()[-128 * 1024:])
    before = read_json(root / 'source-before.json')
    after = read_json(root / 'source-after.json')
    final = read_json(root / 'source-final.json')
    unchanged = before is not None and before == after == final
    if not unchanged:
        errors.append('Canonical source/config/lock/asset fingerprint was not verified unchanged before and after native QA.')
    bundle_hash = read_text(root / 'embedded-bundle.sha256') or ''
    embedded_verified = re.match(r'^[0-9a-f]{64}\s+.+main\.jsbundle$', bundle_hash) is not None and read_text(root / 'bundle-identifier.txt') == 'com.banffbound.app'
    if not embedded_verified:
        errors.append('Embedded Release JavaScript bundle hash and expected native bundle identifier were not verified.')
    devices = read_json(root / 'selected-devices.json', [])
    if {device.get('label') for device in devices} != {'iphone', 'ipad'}:
        errors.append('Both required simulator destinations were not selected.')
    results = []
    for device in devices:
        label = device['label']
        result = {'device': device, 'testsPassed': False, 'screenshots': [], 'failureDiagnostics': []}
        results.append(result)
        readback = read_json(root / f'offline-readback-{label}.json')
        result['nativeOfflineFileReadback'] = readback
        if readback is not None:
            (evidence / f'{label}-offline-file-readback.json').write_text(json.dumps(readback, indent=2) + '\n')
        if not isinstance(readback, dict) or readback.get('passed') is not True:
            errors.append(f'{label}: native offline file readback was not verified against complete bundled content and UI-edited state.')
        bundle = root / 'results' / f'{label}.xcresult'
        if not bundle.exists():
            errors.append(f'{label}: no native XCTest result bundle; no success inferred.')
            continue
        summary = command_json(['xcrun', 'xcresulttool', 'get', 'test-results', 'summary', '--path', str(bundle)], evidence / f'{label}-test-summary.json')
        if summary:
            counts = {key: summary.get(key) for key in ('totalTestCount', 'passedTests', 'failedTests', 'skippedTests')}
            result['testCounts'] = counts
            result['testsPassed'] = (read_text(root / f'test-{label}.exit') == '0'
                                     and isinstance(counts['totalTestCount'], int) and counts['totalTestCount'] >= 5
                                     and isinstance(counts['passedTests'], int) and counts['passedTests'] >= 5
                                     and counts['failedTests'] == 0 and counts['skippedTests'] == 0)
        if not result['testsPassed']:
            errors.append(f'{label}: require all five real UI tests executed and passed, zero failures/skips and successful xcodebuild exit.')
        exported = root / 'attachments' / label
        exported.mkdir(parents=True, exist_ok=True)
        export = subprocess.run(['xcrun', 'xcresulttool', 'export', 'attachments', '--path', str(bundle), '--output-path', str(exported)], capture_output=True, text=True)
        if export.returncode:
            (evidence / f'{label}-attachment-export.error.txt').write_text((export.stderr or export.stdout)[-16000:])
            errors.append(f'{label}: screenshot attachment export failed.')
            continue
        manifest_path = exported / 'manifest.json'
        if manifest_path.is_file():
            raw_manifest = manifest_path.read_bytes()
            name = f'{label}-attachment-manifest.json' if len(raw_manifest) <= 128 * 1024 else f'{label}-attachment-manifest.truncated.txt'
            (evidence / name).write_bytes(raw_manifest[:128 * 1024])
        manifest = read_json(manifest_path, [])
        records = list(attachment_records(manifest))
        # Retain at most one failure image and one bounded accessibility tree per
        # device, even when an assertion fails before store captures are reached.
        if not result['testsPassed']:
            diagnostic_candidates = sorted(records, key=lambda record: not str(record.get('suggestedHumanReadableName', '')).startswith('qa-failure-'))
            for record in diagnostic_candidates:
                name = str(record.get('suggestedHumanReadableName', ''))
                source = (exported / record['exportedFileName']).resolve()
                if exported.resolve() not in source.parents or not source.is_file():
                    continue
                if 'qa-failure-tree' in name and not any(item['kind'] == 'accessibility-tree' for item in result['failureDiagnostics']):
                    filename = f'{label}-failure-accessibility-tree.txt'
                    (evidence / filename).write_bytes(source.read_bytes()[:24000])
                    result['failureDiagnostics'].append({'kind': 'accessibility-tree', 'file': filename})
                elif ('qa-failure-screen' in name or record.get('isAssociatedWithFailure')) and not any(item['kind'] == 'screenshot' for item in result['failureDiagnostics']):
                    try:
                        details = png_details(source)
                        if details['bytes'] <= MAX_SCREEN_BYTES:
                            filename = f'{label}-failure-screen.png'
                            shutil.copy2(source, evidence / filename)
                            result['failureDiagnostics'].append({'kind': 'screenshot', 'file': filename, **details})
                    except (OSError, ValueError):
                        pass
        for screen in SCREENS:
            matches = [record for record in records if screen in str(record.get('suggestedHumanReadableName', '')) or screen in record['exportedFileName']]
            if len(matches) != 1:
                errors.append(f'{label}: expected one named {screen} native screenshot, found {len(matches)}.')
                continue
            record = matches[0]
            source = (exported / record['exportedFileName']).resolve()
            if exported.resolve() not in source.parents or not source.is_file():
                errors.append(f'{label}/{screen}: invalid exported attachment path.')
                continue
            try:
                details = png_details(source)
                if details['bytes'] > MAX_SCREEN_BYTES:
                    raise ValueError('Screenshot exceeds bounded artifact limit')
                if [details['width'], details['height']] != device['expectedPixels']:
                    raise ValueError(f'Unexpected native pixels: {details["width"]}x{details["height"]}')
                filename = f'{label}-{screen}-{details["width"]}x{details["height"]}.png'
                shutil.copy2(source, evidence / filename)
                result['screenshots'].append({'file': filename, 'attachmentName': record.get('suggestedHumanReadableName'), **details})
            except (OSError, ValueError) as error:
                errors.append(f'{label}/{screen}: {error}')
        if len(result['screenshots']) != len(SCREENS):
            errors.append(f'{label}: four validated primary-screen captures are required.')
    receipt = {
        'kind': 'native-ios-simulator-qa',
        'passed': not errors,
        'sourceCommit': read_text(root / 'source-commit.txt'),
        'sourceFingerprint': before,
        'sourceUnchanged': unchanged,
        'startedAtUTC': read_text(root / 'started-at.txt'),
        'finishedAtUTC': read_text(root / 'finished-at.txt'),
        'lastPhase': read_text(root / 'current-phase.txt'),
        'githubRun': {'repository': os.getenv('GITHUB_REPOSITORY'), 'runId': os.getenv('GITHUB_RUN_ID'), 'attempt': os.getenv('GITHUB_RUN_ATTEMPT')},
        'build': {'requestedConfiguration': 'Release', 'signing': False, 'requestedXcode': '26.6',
                  'requestedArchitectures': ['arm64'], 'onlyActiveArchitecture': True,
                  'metroRequired': False if embedded_verified else None, 'embeddedBundleVerified': embedded_verified,
                  'embeddedBundleSha256': bundle_hash.split()[0] if embedded_verified else None},
        'capture': {'renderer': 'native React Native iOS simulator', 'locale': 'en_US', 'orientation': 'portrait',
                    'method': 'XCUIScreen.main.screenshot attached by executed XCTest', 'pixelEditing': False,
                    'clockOverride': False, 'data': 'fresh simulator defaults; later persistence tests use a public saved place and synthetic party size'},
        'devices': results,
        'requiredFlows': ['Native Today/Explore/My Trip/Essentials capture and Map WebView presence',
                          'Saved place survives process relaunch', 'Edited numeric party size survives process relaunch',
                          'Precise venue remains on chosen day after process relaunch',
                          'Native offline saved status and bundled guide reading after process relaunch',
                          'Actual simulator app file matches full canonical guide/place bundle and UI-edited trip'],
        'errors': errors,
        'limits': ['Unsigned simulator build; distinct from signed TestFlight build 3.',
                   'No physical-device QA, purchase/booking transaction, location permission, notifications, or real offline-network test.',
                   'Screenshots require human visual review and any required release approval before App Store upload.'],
        'storeUploadApproved': False,
        'screenshotMediaCompatible': len(results) == 2 and all(len(result['screenshots']) == 4 and all(not shot['hasAlphaOrTransparency'] for shot in result['screenshots']) for result in results),
        'references': ['https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/',
                       'https://raw.githubusercontent.com/actions/runner-images/main/images/macos/macos-26-arm64-Readme.md'],
    }
    total_bytes = sum(path.stat().st_size for path in evidence.rglob('*') if path.is_file())
    if total_bytes > MAX_ARTIFACT_BYTES:
        receipt['passed'] = False
        receipt['errors'].append('Evidence exceeds the 48 MiB budget; screenshots omitted rather than storing unbounded artifacts.')
        for path in evidence.glob('*.png'):
            path.unlink()
    (evidence / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({'passed': receipt['passed'], 'sourceUnchanged': unchanged, 'devices': len(results), 'errors': receipt['errors']}, indent=2))
    return 0 if receipt['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
