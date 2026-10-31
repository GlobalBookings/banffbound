"""Harness guards only. Generated XML/PNG fixtures are never release evidence."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import zlib

spec = importlib.util.spec_from_file_location('android_smoke', Path(__file__).with_name('android_smoke.py'))
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)


def png(width=12, height=24, color=0):
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress((b'\0' + bytes([color, 0, 0]) * width) * height)) + chunk(b'IEND', b''))


class HarnessGuards(unittest.TestCase):
    def test_wrong_apk_cannot_reach_android_tools(self):
        with tempfile.TemporaryDirectory(prefix='banffbound-android-unit-') as directory:
            root = Path(directory)
            (root / 'candidate.apk').write_bytes(b'wrong candidate fixture')
            with patch.object(qa, 'command') as command:
                with self.assertRaisesRegex(ValueError, 'APK identity'):
                    qa.verify_apk(root, 'aapt', 'apksigner')
                command.assert_not_called()

    def test_png_requires_crc_and_complete_chunks(self):
        self.assertEqual(qa.png_details(png())['height'], 24)
        for data in (png()[:-1], png()[:30] + bytes([png()[30] ^ 1]) + png()[31:]):
            with self.assertRaises(ValueError):
                qa.png_details(data)

    def test_editable_selector_ignores_same_named_text_and_foreign_packages(self):
        tree = ET.fromstring('''<hierarchy>
          <node package="com.banffbound.app" text="Adults" bounds="[1,1][30,20]" class="android.widget.TextView"/>
          <node package="com.banffbound.app" text="2" content-desc="Adults" bounds="[1,21][50,55]" class="android.widget.EditText"/>
          <node package="other.app" text="9" content-desc="Adults" bounds="[1,60][50,90]" class="android.widget.EditText"/>
        </hierarchy>''')
        self.assertEqual(qa.locate(tree, 'Adults', [100, 100], editable=True).get('text'), '2')
        with self.assertRaisesRegex(ValueError, 'Ambiguous'):
            qa.locate(tree, 'Adults', [100, 100])

    def test_click_targets_the_labeled_button_ancestor(self):
        tree = ET.fromstring('''<hierarchy><node package="com.banffbound.app" clickable="true" bounds="[1,1][90,50]">
          <node package="com.banffbound.app" text="Explore" bounds="[10,10][50,30]"/>
        </node></hierarchy>''')
        self.assertEqual(qa.locate(tree, 'Explore', [100, 100], clickable=True).get('clickable'), 'true')

    def fixture(self, *, missing_test=False, source_changed=False, license_changed=False, abi='x86_64'):
        with tempfile.TemporaryDirectory(prefix='banffbound-android-receipt-unit-') as directory:
            root = Path(directory)
            (root / 'screenshots').mkdir()
            (root / 'logs').mkdir()
            qa.write_json(root / 'apk-verification.json', {'sha256': qa.APK_SHA256, 'signatureVerified': True})
            qa.write_json(root / 'device.json', {'freshSandbox': True, 'api': 35, 'abi': abi, 'displayPixels': [12, 24]})
            qa.write_json(root / 'source-before.json', {'fingerprint': 'fixture only'})
            qa.write_json(root / 'source-after.json', {'fingerprint': 'changed fixture' if source_changed else 'fixture only'})
            qa.write_json(root / 'licenses-before.json', {'android-sdk-license': 'already accepted fixture'})
            qa.write_json(root / 'licenses-after.json', {'android-sdk-license': 'different fixture' if license_changed else 'already accepted fixture'})
            (root / 'command.exit').write_text('0')
            qa.write_json(root / 'smoke-completed.json', {'allTestsCompleted': True})
            shots = []
            names = [name + '.png' for name in qa.PRIMARY] + ['qa-saved-place-after-force-stop.png', 'qa-trip-edit-after-force-stop.png']
            for index, name in enumerate(names):
                data = png(color=index)
                (root / 'screenshots' / name).write_bytes(data)
                shots.append({'file': name, **qa.png_details(data)})
            tests = [{'name': name, 'passed': True} for name in qa.TESTS]
            qa.write_json(root / 'progress.json', {'tests': tests[:-1] if missing_test else tests, 'screenshots': shots})
            with contextlib.redirect_stdout(io.StringIO()):
                code = qa.finalize(root)
            receipt = qa.read_json(root / 'evidence' / 'receipt.json')
            self.assertFalse(any(path.suffix == '.apk' for path in (root / 'evidence').iterdir()))
            return code, receipt

    def test_complete_fixture_does_not_authorize_store_or_physical_qa(self):
        code, receipt = self.fixture()
        self.assertEqual(code, 0)
        self.assertFalse(receipt['physicalDeviceVerified'])
        self.assertFalse(receipt['storeUploadApproved'])
        self.assertFalse(receipt['googlePlayAccountAccessed'])

    def test_missing_actual_test_or_wrong_environment_cannot_pass(self):
        for change in ({'missing_test': True}, {'source_changed': True}, {'license_changed': True}, {'abi': 'arm64-v8a'}):
            with self.subTest(change=change):
                code, receipt = self.fixture(**change)
                self.assertEqual(code, 1)
                self.assertFalse(receipt['passed'])


if __name__ == '__main__':
    unittest.main()
