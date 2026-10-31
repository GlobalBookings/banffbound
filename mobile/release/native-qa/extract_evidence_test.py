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
                    test_count=7, substituted_test=False, missing_browser=False, browser_returned=True, browser_address_visible=False, missing_browser_screen=False,
                    invented_partner_query=False):
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
                    if failed:
                        destination.joinpath('failure.png').write_bytes(png(*dimensions))
                        entries.append({'exportedFileName': 'failure.png', 'suggestedHumanReadableName': 'qa-failure-screen.png'})
                        destination.joinpath('tree.txt').write_text('Fixture accessibility tree\n' * 2000)
                        entries.append({'exportedFileName': 'tree.txt', 'suggestedHumanReadableName': 'qa-failure-tree.txt'})
                    identifiers = list(extract.REQUIRED_TESTS)
                    if substituted_test:
                        identifiers[1] = 'testSomeOtherFlow'
                    groups = [{'testIdentifier': 'BanffBoundUITests/' + name + '()', 'attachments': entries if index == 0 else []}
                              for index, name in enumerate(identifiers)]
                    destination.joinpath('manifest.json').write_text(json.dumps(groups))
                    return subprocess.CompletedProcess(command, 0, '', '')
                raise AssertionError(command)

            with patch.object(extract.subprocess, 'run', fake_xcrun), patch('sys.argv', ['extract-evidence.py', str(root)]), contextlib.redirect_stdout(io.StringIO()):
                code = extract.main()
            return code, json.loads(root.joinpath('evidence/receipt.json').read_text())

    def test_complete_native_evidence_passes_without_upload_approval(self):
        code, receipt = self.run_fixture()
        self.assertEqual(code, 0)
        self.assertTrue(receipt['passed'])
        self.assertFalse(receipt['storeUploadApproved'])
        self.assertEqual([len(device['screenshots']) for device in receipt['devices']], [7, 7])
        self.assertTrue(receipt['screenshotMediaCompatible'])
        self.assertTrue(all(device['testCounts']['passedTests'] == 7 for device in receipt['devices']))
        self.assertTrue(all(len(device['executedTestIdentifiers']) == 7 for device in receipt['devices']))

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
        self.assertTrue(any('all seven real UI tests' in error for error in receipt['errors']))

    def test_seven_different_tests_cannot_replace_original_flow(self):
        code, receipt = self.run_fixture(substituted_test=True)
        self.assertEqual(code, 1)
        self.assertTrue(any('no substituted test' in error for error in receipt['errors']))

    def test_missing_commercial_capture_cannot_pass(self):
        code, receipt = self.run_fixture(missing_screen='store-07-guides')
        self.assertEqual(code, 1)
        self.assertTrue(any('store-07-guides' in error for error in receipt['errors']))

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
