"""Fail-closed receipt tests. Generated fixture pixels are never release media."""
import contextlib
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


def png(width, height):
    def chunk(kind, payload):
        return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload))
    header = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    pixels = zlib.compress((b'\0' + b'\xff\xff\xff' * width) * height)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', pixels) + chunk(b'IEND', b'')


class ReceiptTest(unittest.TestCase):
    def run_fixture(self, *, failed=0, missing_screen=False, bad_dimensions=False, source_changed=False, missing_bundle=False, missing_offline=False):
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
                    return subprocess.CompletedProcess(command, 0, json.dumps({'totalTestCount': 5, 'passedTests': 5 - failed, 'failedTests': failed, 'skippedTests': 0}), '')
                if command[2:4] == ['export', 'attachments']:
                    destination = Path(command[-1])
                    device = next(device for device in devices if device['label'] == destination.name)
                    dimensions = [1, 1] if bad_dimensions else device['expectedPixels']
                    screens = extract.SCREENS[:-1] if missing_screen else extract.SCREENS
                    entries = []
                    for index, screen in enumerate(screens):
                        filename = f'{index}.png'
                        destination.joinpath(filename).write_bytes(png(*dimensions))
                        entries.append({'exportedFileName': filename, 'suggestedHumanReadableName': screen + '.png'})
                    if failed:
                        destination.joinpath('failure.png').write_bytes(png(*dimensions))
                        entries.append({'exportedFileName': 'failure.png', 'suggestedHumanReadableName': 'qa-failure-screen.png'})
                        destination.joinpath('tree.txt').write_text('Fixture accessibility tree\n' * 2000)
                        entries.append({'exportedFileName': 'tree.txt', 'suggestedHumanReadableName': 'qa-failure-tree.txt'})
                    destination.joinpath('manifest.json').write_text(json.dumps([{'attachments': entries}]))
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
        self.assertEqual([len(device['screenshots']) for device in receipt['devices']], [4, 4])

    def test_real_test_failure_cannot_become_success(self):
        code, receipt = self.run_fixture(failed=1)
        self.assertEqual(code, 1)
        self.assertFalse(receipt['passed'])
        self.assertEqual([len(device['failureDiagnostics']) for device in receipt['devices']], [2, 2])

    def test_missing_named_screenshot_cannot_become_success(self):
        code, receipt = self.run_fixture(missing_screen=True)
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


if __name__ == '__main__':
    unittest.main()
