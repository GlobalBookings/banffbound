"""Fail-closed receipt tests. Generated fixture pixels are never release media."""
import contextlib
import functools
import importlib.util
import io
import json
from pathlib import Path
import struct
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import zlib

spec = importlib.util.spec_from_file_location('extract_evidence', Path(__file__).with_name('extract-evidence.py'))
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)


@functools.lru_cache(maxsize=3)
def png(width, height):
    def chunk(kind, payload):
        return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload))
    header = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    pixels = zlib.compress((b'\0' + b'\xff\xff\xff' * width) * height)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', pixels) + chunk(b'IEND', b'')


class ReceiptTest(unittest.TestCase):
    def run_fixture(self, *, failed=0, missing_screen=None, bad_dimensions=False, source_changed=False, missing_bundle=False, missing_offline=False,
                    test_count=9, substituted_test=False, missing_browser=False, browser_returned=True, browser_address_visible=False, missing_browser_screen=False,
                    invented_partner_query=False, missing_map_marker=False, missing_map_filter=False,
                    map_marker_surface='native-webview-document-button', map_facility_field='Access in map data', map_reset=True,
                    missing_input_stage=False, partial_input=False, phone_heading=False, phone_key_not_ready=False,
                    commerce_inputs='complete', ipad_heading=None, map_list_selected=True, map_view_mode='list',
                    map_view_switch_preserved=True, inspect_evidence=None):
        with tempfile.TemporaryDirectory(prefix='banffbound-extractor-unit-fixture-') as directory:
            root = Path(directory)
            root.joinpath('logs').mkdir()
            for name in ('source-before.json', 'source-after.json', 'source-final.json'):
                value = {'fingerprint': 'fixture-only', 'fileCount': 48}
                if source_changed and name == 'source-final.json':
                    value['fingerprint'] = 'mutated-fixture'
                root.joinpath(name).write_text(json.dumps(value))
            if not missing_bundle:
                root.joinpath('embedded-bundle.sha256').write_text('a' * 64 + '  /fixture-only/main.jsbundle')
                root.joinpath('bundle-identifier.txt').write_text('com.banffbound.app')
            devices = [{'label': 'iphone', 'expectedPixels': [1206, 2622]}, {'label': 'ipad', 'expectedPixels': [2064, 2752]}]
            root.joinpath('selected-devices.json').write_text(json.dumps(devices))
            for device in devices:
                root.joinpath('results', device['label'] + '.xcresult').mkdir(parents=True)
                root.joinpath('test-' + device['label'] + '.exit').write_text('1' if failed else '0')
                if not missing_offline:
                    root.joinpath('offline-readback-' + device['label'] + '.json').write_text(json.dumps({'passed': True, 'fixtureOnly': True}))

            def fake_xcrun(command, **_kwargs):
                if command[2:5] == ['get', 'test-results', 'summary']:
                    return subprocess.CompletedProcess(command, 0, json.dumps({'totalTestCount': test_count, 'passedTests': test_count - failed, 'failedTests': failed, 'skippedTests': 0, 'expectedFailures': 0}), '')
                if command[2:4] == ['export', 'attachments']:
                    destination = Path(command[-1])
                    device = next(device for device in devices if device['label'] == destination.name)
                    dimensions = [1, 1] if bad_dimensions else device['expectedPixels']
                    screens = [screen for screen in extract.SCREENS if screen != missing_screen]
                    entries = []
                    for index, screen in enumerate(screens):
                        filename = f'{index}.png'
                        destination.joinpath(filename).write_bytes(png(*dimensions))
                        entries.append({'exportedFileName': filename, 'suggestedHumanReadableName': screen + '.png'})
                    if not missing_browser_screen:
                        destination.joinpath('browser.png').write_bytes(png(*dimensions))
                        entries.append({'exportedFileName': 'browser.png', 'suggestedHumanReadableName': extract.BROWSER_SCREEN + '.png'})
                    if not missing_browser:
                        observation = {
                            'kind': 'native-safari-handoff', 'provider': 'GetYourGuide',
                            'browserAccessibilityBundle': 'com.banffbound.app',
                            'doneButtonObserved': True, 'browserWebViewObserved': True,
                            'returnToDetailVerified': browser_returned,
                            'addressUIObservations': ['getyourguide.com'] if browser_address_visible else [],
                            'visibleProviderHost': 'getyourguide.com' if browser_address_visible else None,
                            'partnerIdVisibleInAddressUI': invented_partner_query, 'campaignVisibleInAddressUI': False,
                            'networkAvailabilityVerified': False, 'purchaseAttempted': False,
                        }
                        destination.joinpath('browser-observation.txt').write_text(json.dumps(observation))
                        entries.append({'exportedFileName': 'browser-observation.txt', 'suggestedHumanReadableName': 'qa-commerce-browser-observation.txt'})
                    observations = {
                        'qa-map-marker-observation': {
                            'kind': 'native-map-marker-detail', 'selectionSurface': map_marker_surface,
                            'webViewObserved': True, 'fitResultsDocumentButtonUsed': True,
                            'markerLabel': 'The Bison Restaurant · Restaurants', 'restaurantTitle': 'The Bison Restaurant',
                            'nativeDetailOpened': True, 'reviewedCuisineObserved': 'Seasonal Canadian',
                            'menuActionObserved': True, 'menuHostObserved': 'www.thebison.ca',
                            'menuOpened': False, 'basemapAvailabilityVerified': False, 'locationPermissionRequested': False,
                        },
                        'qa-map-filter-observation': {
                            'kind': 'native-map-filter-facilities', 'multipleCategoriesSelected': True,
                            'singleCategoryRetainedAfterDeselect': True, 'areaObserved': 'Lake Louise',
                            'searchQuery': 'Public Washrooms', 'facilityTitle': 'Public Washrooms',
                            'facilityCategoryObserved': 'Toilets', 'facilityFieldObserved': map_facility_field,
                            'sourceObserved': 'OpenStreetMap contributors · node/1623434017', 'detailClosed': True,
                            'invalidQueryEmptyStateVerified': True, 'resetRestoredAllFilters': map_reset,
                            'restoredResultCountLabel': '975 places', 'locationPermissionRequested': False,
                            'listViewSelected': map_list_selected, 'viewMode': map_view_mode,
                            'viewSwitchPreservedQueryAndFilters': map_view_switch_preserved,
                        },
                    }
                    for name, observation in observations.items():
                        if ((name == 'qa-map-marker-observation' and missing_map_marker)
                                or (name == 'qa-map-filter-observation' and missing_map_filter)):
                            continue
                        filename = name + '.txt'
                        destination.joinpath(filename).write_text(json.dumps(observation))
                        entries.append({'exportedFileName': filename, 'suggestedHumanReadableName': filename})
                    collections = [('map', tuple((None, query) for query in extract.MAP_INPUT_QUERIES)),
                                   ('commerce', extract.COMMERCE_INPUT_QUERIES)]
                    for collection, queries in collections:
                        if collection == 'commerce' and commerce_inputs == 'missing':
                            continue
                        for index, (section, query) in enumerate(queries):
                            for stage in ('before', 'after'):
                                if (index == 0 and stage == 'after'
                                        and (collection == 'map' and missing_input_stage
                                             or collection == 'commerce' and commerce_inputs in ('missing-stage', 'failed-partial'))):
                                    continue
                                observation = {
                                    'kind': f'native-{collection}-input-observation', 'query': query, 'phase': stage,
                                    'deviceClass': device['label'], 'entryMethod': 'bulk-native-text-without-return',
                                    'typedWithoutReturn': True, 'keyboardReadyBeforeTyping': True,
                                    'searchKeyReadyBeforeTyping': not (collection == 'map' and phone_key_not_ready and device['label'] == 'iphone'),
                                    'beforeValue': query, 'afterValue': query if stage == 'after' else None,
                                    'fieldValue': query, 'keyboardVisible': stage == 'before',
                                    'dismissalMethod': 'not-attempted' if stage == 'before' else 'native-search-key',
                                    'searchReadyForDismissal': stage == 'after', 'headingObserved': False,
                                    'dismissalCompleted': stage == 'after', 'resultCountLabel': 'fixture-only',
                                }
                                if section is not None:
                                    observation['section'] = section
                                if collection == 'map' and partial_input and index == 0 and stage == 'before':
                                    observation['beforeValue'] = observation['fieldValue'] = 'B'
                                if collection == 'map' and phone_heading and device['label'] == 'iphone' and stage == 'after':
                                    observation.update(dismissalMethod='ipad-visible-heading', headingObserved=True,
                                                       headingLabel=extract.INPUT_HEADINGS['map'])
                                if device['label'] == 'ipad' and ipad_heading and stage == 'after':
                                    heading = extract.INPUT_HEADINGS[section or 'map']
                                    observation.update(dismissalMethod='ipad-visible-heading', searchReadyForDismissal=False,
                                                       headingObserved=True, headingLabel=heading if ipad_heading == 'actual' else 'Wrong section heading')
                                    if ipad_heading == 'missing':
                                        observation.pop('headingLabel')
                                if collection == 'commerce' and index == 0:
                                    if commerce_inputs in ('partial-before', 'failed-partial') and stage == 'before':
                                        observation['beforeValue'] = observation['fieldValue'] = 'Bion'
                                    if commerce_inputs == 'partial-after' and stage == 'after':
                                        observation['afterValue'] = observation['fieldValue'] = 'Bion'
                                    if commerce_inputs == 'duplicate' and stage == 'after':
                                        observation['phase'] = 'before'
                                    if commerce_inputs == 'wrong-section' and stage == 'before':
                                        observation['section'] = 'stays'
                                    if commerce_inputs == 'wrong-query' and stage == 'before':
                                        observation['query'] = 'Car-Free Banff Guide'
                                    if commerce_inputs == 'phone-heading' and device['label'] == 'iphone' and stage == 'after':
                                        observation.update(dismissalMethod='ipad-visible-heading', headingObserved=True,
                                                           headingLabel=extract.INPUT_HEADINGS[section])
                                    if commerce_inputs == 'phone-key-not-ready' and device['label'] == 'iphone':
                                        observation['searchKeyReadyBeforeTyping'] = False
                                filename = f'{collection}-input-{index}-{stage}.txt'
                                destination.joinpath(filename).write_text(json.dumps(observation))
                                entries.append({'exportedFileName': filename, 'suggestedHumanReadableName': f'qa-{collection}-input-observation-' + filename})
                    if failed:
                        destination.joinpath('failure.png').write_bytes(png(*dimensions))
                        entries.append({'exportedFileName': 'failure.png', 'suggestedHumanReadableName': 'qa-failure-screen.png'})
                        destination.joinpath('tree.txt').write_text('Fixture accessibility tree\n' * 2000)
                        entries.append({'exportedFileName': 'tree.txt', 'suggestedHumanReadableName': 'qa-failure-tree.txt'})
                    identifiers = list(extract.REQUIRED_TESTS)
                    if substituted_test:
                        identifiers[1] = 'testSomeOtherFlow'
                    def attachment_flow(record):
                        name = record['suggestedHumanReadableName']
                        if name.startswith(('store-05-', 'qa-commerce-')):
                            return 5
                        if name.startswith(('store-06-', 'store-07-')):
                            return 6
                        if name.startswith(('store-08-', 'store-09-', 'qa-map-marker-')):
                            return 7
                        if name.startswith('qa-map-filter-'):
                            return 8
                        return 0
                    groups = [{'testIdentifier': 'BanffBoundUITests/' + name + '()',
                               'attachments': [record for record in entries if attachment_flow(record) == index]}
                              for index, name in enumerate(identifiers)]
                    destination.joinpath('manifest.json').write_text(json.dumps(groups))
                    return subprocess.CompletedProcess(command, 0, '', '')
                raise AssertionError(command)

            with patch.object(extract.subprocess, 'run', fake_xcrun), patch('sys.argv', ['extract-evidence.py', str(root)]), contextlib.redirect_stdout(io.StringIO()):
                code = extract.main()
            if inspect_evidence:
                inspect_evidence(root / 'evidence')
            return code, json.loads(root.joinpath('evidence/receipt.json').read_text())

    def test_complete_native_evidence_passes_without_upload_approval(self):
        code, receipt = self.run_fixture()
        self.assertEqual(code, 0)
        self.assertTrue(receipt['passed'])
        self.assertFalse(receipt['storeUploadApproved'])
        self.assertEqual([len(device['screenshots']) for device in receipt['devices']], [9, 9])
        self.assertTrue(receipt['screenshotMediaCompatible'])
        self.assertTrue(all(device['testCounts']['passedTests'] == 9 for device in receipt['devices']))
        self.assertTrue(all(len(device['executedTestIdentifiers']) == 9 for device in receipt['devices']))
        self.assertTrue(all(device['nativeMapMarkerDetail']['selectionSurface'] == 'native-webview-document-button' for device in receipt['devices']))
        self.assertTrue(all(device['nativeMapFiltersFacilities']['resetRestoredAllFilters'] for device in receipt['devices']))
        self.assertTrue(all(len(device['nativeMapInputObservations']) == 6 for device in receipt['devices']))
        self.assertTrue(all(len(device['nativeCommerceInputObservations']) == 6 for device in receipt['devices']))
        self.assertEqual(sum(len(device[key]) for device in receipt['devices']
                             for key in ('nativeMapInputObservations', 'nativeCommerceInputObservations')), 24)
        self.assertTrue(all(device['nativeMapFiltersFacilities']['listViewSelected'] is True
                            and device['nativeMapFiltersFacilities']['viewMode'] == 'list' for device in receipt['devices']))

    def test_missing_input_stage_cannot_pass(self):
        code, receipt = self.run_fixture(missing_input_stage=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('before/after query pairs' in error for error in receipt['errors']))

    def test_partial_native_input_cannot_pass(self):
        code, receipt = self.run_fixture(partial_input=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('bulk query must be complete' in error for error in receipt['errors']))

    def test_phone_heading_cannot_substitute_for_actual_search_key(self):
        code, receipt = self.run_fixture(phone_heading=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('phone required' in error for error in receipt['errors']))

    def test_phone_keyboard_container_cannot_substitute_for_ready_search_key(self):
        code, receipt = self.run_fixture(phone_key_not_ready=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('bulk query must be complete' in error for error in receipt['errors']))

    def test_failed_run_retains_partial_input_stages_without_claiming_success(self):
        code, receipt = self.run_fixture(failed=1, missing_input_stage=True, partial_input=True)
        self.assertEqual(code, 1)
        self.assertFalse(receipt['passed'])
        self.assertTrue(all(len(device['nativeMapInputObservations']) == 5 for device in receipt['devices']))

    def test_missing_commerce_collection_cannot_pass(self):
        code, receipt = self.run_fixture(commerce_inputs='missing')
        self.assertEqual(code, 1)
        self.assertTrue(any('Successful native commerce input' in error for error in receipt['errors']))
        self.assertTrue(all(device['nativeCommerceInputObservations'] == [] for device in receipt['devices']))

    def test_missing_commerce_stage_cannot_pass_or_hide_retained_stages(self):
        code, receipt = self.run_fixture(commerce_inputs='missing-stage')
        self.assertEqual(code, 1)
        self.assertTrue(any('Successful native commerce input' in error for error in receipt['errors']))
        self.assertTrue(all(len(device['nativeCommerceInputObservations']) == 5 for device in receipt['devices']))

    def test_partial_commerce_input_before_or_after_dismissal_cannot_pass(self):
        for mutation, stage in [('partial-before', 'before'), ('partial-after', 'after')]:
            with self.subTest(stage=stage):
                code, receipt = self.run_fixture(commerce_inputs=mutation)
                self.assertEqual(code, 1)
                self.assertTrue(any('Native commerce bulk query must be complete' in error for error in receipt['errors']))
                for device in receipt['devices']:
                    observations = device['nativeCommerceInputObservations']
                    self.assertEqual(len(observations), 6)
                    observed = next(item for item in observations if item['section'] == 'tours' and item['phase'] == stage)
                    self.assertEqual(observed['fieldValue'], 'Bion')

    def test_commerce_duplicate_or_wrong_section_and_query_cannot_pass(self):
        for mutation, message in [('duplicate', 'Duplicate native commerce input query stage'),
                                  ('wrong-section', 'unexpected native section, query, device or stage'),
                                  ('wrong-query', 'unexpected native section, query, device or stage')]:
            with self.subTest(mutation=mutation):
                code, receipt = self.run_fixture(commerce_inputs=mutation)
                self.assertEqual(code, 1)
                self.assertTrue(any(message in error for error in receipt['errors']))

    def test_commerce_phone_requires_ready_native_search_and_cannot_use_heading_fallback(self):
        for mutation, message in [('phone-heading', 'phone required'),
                                  ('phone-key-not-ready', 'Native commerce bulk query must be complete')]:
            with self.subTest(mutation=mutation):
                code, receipt = self.run_fixture(commerce_inputs=mutation)
                self.assertEqual(code, 1)
                self.assertTrue(any(message in error for error in receipt['errors']))

    def test_ipad_fallback_requires_each_exact_observed_surface_heading(self):
        code, receipt = self.run_fixture(ipad_heading='actual')
        self.assertEqual(code, 0)
        ipad = next(device for device in receipt['devices'] if device['device']['label'] == 'ipad')
        for key in ('nativeMapInputObservations', 'nativeCommerceInputObservations'):
            for observation in ipad[key]:
                if observation['phase'] == 'after':
                    self.assertTrue(observation['headingObserved'])
                    self.assertEqual(observation['headingLabel'], extract.INPUT_HEADINGS[observation.get('section') or 'map'])
        for heading in ('wrong', 'missing'):
            with self.subTest(heading=heading):
                code, receipt = self.run_fixture(ipad_heading=heading)
                self.assertEqual(code, 1)
                self.assertTrue(any('exact observed iPad heading dismissal' in error for error in receipt['errors']))

    def test_failed_run_retains_actual_partial_commerce_without_claiming_completion(self):
        code, receipt = self.run_fixture(failed=1, commerce_inputs='failed-partial')
        self.assertEqual(code, 1)
        self.assertFalse(receipt['passed'])
        for device in receipt['devices']:
            self.assertFalse(device['testsPassed'])
            observations = device['nativeCommerceInputObservations']
            self.assertEqual(len(observations), 5)
            self.assertTrue(any(item['fieldValue'] == 'Bion' for item in observations))
            self.assertFalse(any(item['section'] == 'tours' and item['phase'] == 'after' for item in observations))

    def test_all_24_input_files_preserve_existing_map_names_and_section_bound_commerce_names(self):
        def inspect(evidence):
            expected = set()
            for device in ('iphone', 'ipad'):
                for query in extract.MAP_INPUT_QUERIES:
                    slug = query.replace(' ', '-')
                    for phase in ('before', 'after'):
                        expected.add(f'{device}-map-input-{slug}-{phase}.json')
                for section, query in extract.COMMERCE_INPUT_QUERIES:
                    slug = query.replace(' ', '-')
                    for phase in ('before', 'after'):
                        expected.add(f'{device}-commerce-input-{section}-{slug}-{phase}.json')
            actual = {item.name for item in evidence.glob('*-input-*.json')}
            self.assertEqual(actual, expected)
            self.assertEqual(len(actual), 24)
            guide = json.loads((evidence / 'iphone-commerce-input-guides-concerts-show-planning-before.json').read_text())
            self.assertEqual((guide['section'], guide['query']), ('guides', 'concerts show planning'))
        code, _ = self.run_fixture(inspect_evidence=inspect)
        self.assertEqual(code, 0)

    def test_facilities_flow_requires_the_real_selected_list_view(self):
        for values in ({'map_list_selected': False}, {'map_view_mode': 'map'}):
            with self.subTest(values=values):
                code, receipt = self.run_fixture(**values)
                self.assertEqual(code, 1)
                self.assertTrue(any('Executed map filters' in error for error in receipt['errors']))

    def test_map_view_switch_cannot_lose_the_query_or_filters(self):
        code, receipt = self.run_fixture(map_view_switch_preserved=False)
        self.assertEqual(code, 1)
        self.assertFalse(receipt['passed'])
        self.assertTrue(any('Executed map filters' in error for error in receipt['errors']))

    def test_real_test_failure_cannot_become_success(self):
        code, receipt = self.run_fixture(failed=1)
        self.assertEqual(code, 1)
        self.assertFalse(receipt['passed'])
        self.assertEqual([len(device['failureDiagnostics']) for device in receipt['devices']], [2, 2])

    def test_missing_named_screenshot_cannot_become_success(self):
        code, receipt = self.run_fixture(missing_screen='store-04-essentials')
        self.assertEqual(code, 1)
        self.assertTrue(any('store-04-essentials' in error for error in receipt['errors']))

    def test_wrong_pixels_cannot_become_success(self):
        code, receipt = self.run_fixture(bad_dimensions=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('Unexpected native pixels' in error for error in receipt['errors']))

    def test_source_mutation_cannot_become_success(self):
        code, receipt = self.run_fixture(source_changed=True)
        self.assertEqual(code, 1)
        self.assertFalse(receipt['sourceUnchanged'])

    def test_unverified_bundle_cannot_claim_metro_independence_or_success(self):
        code, receipt = self.run_fixture(missing_bundle=True)
        self.assertEqual(code, 1)
        self.assertFalse(receipt['build']['embeddedBundleVerified'])
        self.assertIsNone(receipt['build']['metroRequired'])

    def test_missing_native_offline_file_readback_cannot_pass(self):
        code, receipt = self.run_fixture(missing_offline=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('offline file readback' in error for error in receipt['errors']))

    def test_only_original_five_tests_cannot_satisfy_new_suite(self):
        code, receipt = self.run_fixture(test_count=5)
        self.assertEqual(code, 1)
        self.assertTrue(any('all nine real UI tests' in error for error in receipt['errors']))

    def test_original_seven_without_map_flows_cannot_satisfy_new_suite(self):
        code, receipt = self.run_fixture(test_count=7)
        self.assertEqual(code, 1)
        self.assertTrue(any('all nine real UI tests' in error for error in receipt['errors']))

    def test_nine_different_tests_cannot_replace_original_flow(self):
        code, receipt = self.run_fixture(substituted_test=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('no substituted test' in error for error in receipt['errors']))

    def test_missing_commercial_capture_cannot_pass(self):
        code, receipt = self.run_fixture(missing_screen='store-07-guides')
        self.assertEqual(code, 1)
        self.assertTrue(any('store-07-guides' in error for error in receipt['errors']))

    def test_each_map_capture_is_required(self):
        for screen in ('store-08-map', 'store-09-map-details'):
            with self.subTest(screen=screen):
                code, receipt = self.run_fixture(missing_screen=screen)
                self.assertEqual(code, 1)
                self.assertTrue(any(screen in error for error in receipt['errors']))

    def test_each_executed_map_observation_is_required(self):
        for field in ('missing_map_marker', 'missing_map_filter'):
            with self.subTest(field=field):
                code, receipt = self.run_fixture(**{field: True})
                self.assertEqual(code, 1)
                self.assertTrue(any('Expected one executed qa-map-' in error for error in receipt['errors']))

    def test_native_result_list_cannot_substitute_for_document_marker(self):
        code, receipt = self.run_fixture(map_marker_surface='native-result-list')
        self.assertEqual(code, 1)
        self.assertTrue(any('Executed map marker' in error for error in receipt['errors']))

    def test_unverified_facilities_or_reset_cannot_pass(self):
        for values in ({'map_facility_field': 'invented facility'}, {'map_reset': False}):
            with self.subTest(values=values):
                code, receipt = self.run_fixture(**values)
                self.assertEqual(code, 1)
                self.assertTrue(any('Executed map filters' in error for error in receipt['errors']))

    def test_missing_browser_ui_observation_cannot_pass(self):
        code, receipt = self.run_fixture(missing_browser=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('native browser observation' in error for error in receipt['errors']))

    def test_browser_without_return_to_app_cannot_pass(self):
        code, receipt = self.run_fixture(browser_returned=False)
        self.assertEqual(code, 1)
        self.assertTrue(any('Safari presentation and return' in error for error in receipt['errors']))

    def test_missing_browser_screen_cannot_pass(self):
        code, receipt = self.run_fixture(missing_browser_screen=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('native browser handoff screenshot' in error for error in receipt['errors']))

    def test_hidden_address_does_not_invent_partner_attribution(self):
        code, receipt = self.run_fixture()
        self.assertEqual(code, 0)
        for device in receipt['devices']:
            observation = device['nativeBrowserHandoff']
            self.assertIsNone(observation['visibleProviderHost'])
            self.assertFalse(observation['partnerIdVisibleInAddressUI'])
            self.assertFalse(observation['campaignVisibleInAddressUI'])
            self.assertFalse(observation['networkAvailabilityVerified'])

    def test_observed_host_still_does_not_claim_partner_query(self):
        code, receipt = self.run_fixture(browser_address_visible=True)
        self.assertEqual(code, 0)
        for device in receipt['devices']:
            self.assertEqual(device['nativeBrowserHandoff']['visibleProviderHost'], 'getyourguide.com')
            self.assertFalse(device['nativeBrowserHandoff']['partnerIdVisibleInAddressUI'])

    def test_partner_query_claim_without_visible_query_cannot_pass(self):
        code, receipt = self.run_fixture(invented_partner_query=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('exact exposed address observations' in error for error in receipt['errors']))

    def test_oversized_artifact_cannot_claim_retained_store_media(self):
        with patch.object(extract, 'MAX_ARTIFACT_BYTES', 1):
            code, receipt = self.run_fixture()
        self.assertEqual(code, 1)
        self.assertFalse(receipt['screenshotMediaCompatible'])
        self.assertTrue(any('48 MiB budget' in error for error in receipt['errors']))


if __name__ == '__main__':
    unittest.main()
