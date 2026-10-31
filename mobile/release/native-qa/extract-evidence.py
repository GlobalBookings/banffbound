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

SCREENS = ('store-01-today', 'store-02-explore', 'store-03-my-trip', 'store-04-essentials',
           'store-05-tours', 'store-06-stays', 'store-07-guides', 'store-08-map', 'store-09-map-details')
REQUIRED_TESTS = ('test01CapturePrimaryScreens', 'test02SavedPlaceSurvivesRelaunch',
                  'test03TripDetailsSurviveRelaunch', 'test04SpecificVenueStaysOnChosenDayAfterRelaunch',
                  'test05OfflinePackAndBundledGuideSurviveRelaunch',
                  'test06TourSearchDisclosureAndNativeBrowserHandoff',
                  'test07StayAndNonlegacyOnlineGuideSearch',
                  'test08MapDocumentMarkerOpensRestaurantDetail',
                  'test09MapCategoriesFacilitiesAndEmptyReset')
BROWSER_SCREEN = 'qa-commerce-browser-screen'
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


def test_identifiers(value):
    """Use executed-result manifest identities, not inferred screenshot counts."""
    if isinstance(value, dict):
        identifier = value.get('testIdentifier')
        if isinstance(identifier, str):
            yield identifier.rsplit('/', 1)[-1].removesuffix('()')
        for child in value.values():
            yield from test_identifiers(child)
    elif isinstance(value, list):
        for child in value:
            yield from test_identifiers(child)


def browser_observation(records, exported):
    matches = [record for record in records if 'qa-commerce-browser-observation' in str(record.get('suggestedHumanReadableName', ''))]
    if len(matches) != 1:
        raise ValueError(f'Expected one actual native browser observation, found {len(matches)}')
    source = (exported / matches[0]['exportedFileName']).resolve()
    if exported.resolve() not in source.parents or not source.is_file() or source.stat().st_size > 16000:
        raise ValueError('Invalid or oversized native browser observation attachment')
    observation = read_json(source)
    required = ('doneButtonObserved', 'browserWebViewObserved', 'returnToDetailVerified')
    if not isinstance(observation, dict) or observation.get('kind') != 'native-safari-handoff' or any(observation.get(key) is not True for key in required):
        raise ValueError('Native Safari presentation and return were not verified by executed UI assertions')
    if observation.get('provider') != 'GetYourGuide' or observation.get('networkAvailabilityVerified') is not False:
        raise ValueError('Browser observation must identify the tested provider and preserve the network-availability limit')
    if observation.get('purchaseAttempted') is not False or observation.get('browserAccessibilityBundle') not in ('com.banffbound.app', 'com.apple.SafariViewService'):
        raise ValueError('Require a native Safari controller observation without a purchase attempt')
    addresses = observation.get('addressUIObservations')
    if not isinstance(addresses, list) or len(addresses) > 4 or any(not isinstance(value, str) or len(value) > 800 for value in addresses):
        raise ValueError('Browser address observations must be small, explicit visible-UI strings')
    exposed = ' '.join(addresses)
    expected_host = 'getyourguide.com' if 'getyourguide.com' in exposed.lower() else None
    if (observation.get('visibleProviderHost') != expected_host
            or observation.get('partnerIdVisibleInAddressUI') is not ('partner_id=QW960HO' in exposed)
            or observation.get('campaignVisibleInAddressUI') is not ('cmp=banffboundapp' in exposed)):
        raise ValueError('Browser domain/query claims must match the exact exposed address observations')
    return observation


def map_observation(records, exported, name):
    matches = [record for record in records if name in str(record.get('suggestedHumanReadableName', ''))]
    if len(matches) != 1:
        raise ValueError(f'Expected one executed {name} observation, found {len(matches)}')
    source = (exported / matches[0]['exportedFileName']).resolve()
    if exported.resolve() not in source.parents or not source.is_file() or source.stat().st_size > 16000:
        raise ValueError('Invalid or oversized native map observation attachment')
    observation = read_json(source)
    if not isinstance(observation, dict) or observation.get('locationPermissionRequested') is not False:
        raise ValueError('Require actual native map observations without a location permission request')
    if name == 'qa-map-marker-observation':
        required = ('webViewObserved', 'fitResultsDocumentButtonUsed', 'nativeDetailOpened', 'menuActionObserved')
        if (observation.get('kind') != 'native-map-marker-detail'
                or observation.get('selectionSurface') != 'native-webview-document-button'
                or any(observation.get(key) is not True for key in required)
                or observation.get('restaurantTitle') != 'The Bison Restaurant'
                or observation.get('reviewedCuisineObserved') != 'Seasonal Canadian'
                or observation.get('menuHostObserved') != 'www.thebison.ca'
                or observation.get('menuOpened') is not False
                or observation.get('basemapAvailabilityVerified') is not False):
            raise ValueError('Executed map marker must open the precise native restaurant detail, cuisine and reviewed menu action')
        label = observation.get('markerLabel')
        if not isinstance(label, str) or len(label) > 300 or 'The Bison Restaurant' not in label or 'Restaurants' not in label:
            raise ValueError('Require the actual named restaurant marker label from the native WebView')
    else:
        required = ('multipleCategoriesSelected', 'singleCategoryRetainedAfterDeselect', 'detailClosed',
                    'invalidQueryEmptyStateVerified', 'resetRestoredAllFilters')
        expected = {'kind': 'native-map-filter-facilities', 'areaObserved': 'Lake Louise',
                    'searchQuery': 'Public Washrooms', 'facilityTitle': 'Public Washrooms',
                    'facilityCategoryObserved': 'Toilets', 'facilityFieldObserved': 'Access in map data',
                    'sourceObserved': 'OpenStreetMap contributors · node/1623434017'}
        if (any(observation.get(key) is not True for key in required)
                or any(observation.get(key) != value for key, value in expected.items())
                or re.fullmatch(r'[1-9][0-9]* places', str(observation.get('restoredResultCountLabel', ''))) is None):
            raise ValueError('Executed map filters must select the precise sourced toilet, show facilities, close, reject an empty query and restore all results')
    return observation


def validated_screenshot(record, exported, evidence, device, screen):
    source = (exported / record['exportedFileName']).resolve()
    if exported.resolve() not in source.parents or not source.is_file():
        raise ValueError('Invalid exported attachment path')
    details = png_details(source)
    if details['bytes'] > MAX_SCREEN_BYTES:
        raise ValueError('Screenshot exceeds bounded artifact limit')
    if [details['width'], details['height']] != device['expectedPixels']:
        raise ValueError(f'Unexpected native pixels: {details["width"]}x{details["height"]}')
    filename = f'{device["label"]}-{screen}-{details["width"]}x{details["height"]}.png'
    shutil.copy2(source, evidence / filename)
    return {'file': filename, 'attachmentName': record.get('suggestedHumanReadableName'), **details}


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
            counts = {key: summary.get(key) for key in ('totalTestCount', 'passedTests', 'failedTests', 'skippedTests', 'expectedFailures')}
            result['testCounts'] = counts
            result['testsPassed'] = (read_text(root / f'test-{label}.exit') == '0'
                                     and counts['totalTestCount'] == len(REQUIRED_TESTS)
                                     and counts['passedTests'] == len(REQUIRED_TESTS)
                                     and counts['failedTests'] == 0 and counts['skippedTests'] == 0
                                     and counts['expectedFailures'] == 0)
        if not result['testsPassed']:
            errors.append(f'{label}: require all nine real UI tests executed and passed, zero failures/skips/expected failures and successful xcodebuild exit.')
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
        identities = sorted(set(test_identifiers(manifest)))
        result['executedTestIdentifiers'] = identities
        if set(identities) != set(REQUIRED_TESTS):
            result['testsPassed'] = False
            errors.append(f'{label}: actual XCTest attachment manifest must identify all nine required UI flows, with no substituted test.')
        try:
            observation = browser_observation(records, exported)
            result['nativeBrowserHandoff'] = observation
            (evidence / f'{label}-browser-observation.json').write_text(json.dumps(observation, indent=2) + '\n')
        except (OSError, ValueError) as error:
            errors.append(f'{label}: {error}')
        for name, key in [('qa-map-marker-observation', 'nativeMapMarkerDetail'), ('qa-map-filter-observation', 'nativeMapFiltersFacilities')]:
            try:
                observation = map_observation(records, exported, name)
                result[key] = observation
                (evidence / f'{label}-{name}.json').write_text(json.dumps(observation, indent=2) + '\n')
            except (OSError, ValueError) as error:
                errors.append(f'{label}: {error}')
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
            try:
                result['screenshots'].append(validated_screenshot(record, exported, evidence, device, screen))
            except (OSError, ValueError) as error:
                errors.append(f'{label}/{screen}: {error}')
        if len(result['screenshots']) != len(SCREENS):
            errors.append(f'{label}: nine validated primary, commerce and map screen captures are required.')
        browser_matches = [record for record in records if BROWSER_SCREEN in str(record.get('suggestedHumanReadableName', ''))]
        try:
            if len(browser_matches) != 1:
                raise ValueError(f'Expected one native browser handoff screenshot, found {len(browser_matches)}')
            result['browserScreenshot'] = validated_screenshot(browser_matches[0], exported, evidence, device, BROWSER_SCREEN)
        except (OSError, ValueError) as error:
            errors.append(f'{label}: {error}')
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
                          'Tour search, provider disclosure, actual native Safari presentation and return to detail',
                          'Hotel search and a specific online guide outside the original bundled guide set',
                          'Actual native WebView marker opens precise restaurant detail, cuisine and reviewed menu action',
                          'Multiple map categories, area and search select sourced toilet facilities; empty query and reset verified',
                          'Actual simulator app file matches full canonical guide/place bundle and UI-edited trip'],
        'errors': errors,
        'limits': ['Unsigned simulator build; separate from a signed device binary.',
                   'No physical-device QA, purchase/booking transaction, location permission, notifications, or real offline-network test.',
                   'Browser presentation and return do not establish provider availability, a booking or affiliate attribution; address observations report only exposed UI text.',
                   'Map document marker selection and bundled details do not establish street-tile availability, surveyed entrances, current facilities or menu content; no location permission requested.',
                   'Screenshots require human visual review and any required release approval before App Store upload.'],
        'storeUploadApproved': False,
        'screenshotMediaCompatible': len(results) == 2 and all(len(result['screenshots']) == len(SCREENS) and all(not shot['hasAlphaOrTransparency'] for shot in result['screenshots']) for result in results),
        'references': ['https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/',
                       'https://raw.githubusercontent.com/actions/runner-images/main/images/macos/macos-26-arm64-Readme.md'],
    }
    total_bytes = sum(path.stat().st_size for path in evidence.rglob('*') if path.is_file())
    if total_bytes > MAX_ARTIFACT_BYTES:
        receipt['passed'] = False
        receipt['screenshotMediaCompatible'] = False
        receipt['errors'].append('Evidence exceeds the 48 MiB budget; screenshots omitted rather than storing unbounded artifacts.')
        for path in evidence.glob('*.png'):
            path.unlink()
    (evidence / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({'passed': receipt['passed'], 'sourceUnchanged': unchanged, 'devices': len(results), 'errors': receipt['errors']}, indent=2))
    return 0 if receipt['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
