#!/usr/bin/env python3
"""Credential-free checks of the exact signed APK; no app hooks or store access."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
import zipfile
import zlib

PACKAGE = 'com.banffbound.app'
APK_SHA256 = 'da8e5439d98e42dbbacbb92187aa5ed6265f687514c7781f143db514a3787b96'
APK_BYTES = 78_408_331
APK_URL = 'https://expo.dev/artifacts/eas/e865A3eiMp4M6HbOLgY9WqXYL-JJaALYKsx-nGZsRko.apk'
APK_SOURCE = 'eb7aa215b74cda24c092dc819f6461ed1b1cba06072bd83aaab2bffe6d96d11e'
PRIMARY = ('01-today', '02-explore', '03-my-trip', '04-essentials')
TESTS = ('native-loading-and-navigation', 'saved-place-survives-force-stop', 'trip-edit-survives-force-stop')
MAX_SCREEN = 8 * 1024 * 1024
MAX_EVIDENCE = 48 * 1024 * 1024


def sha256(path):
    value = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n')


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


def command(args, *, timeout=30, binary=False, check=True):
    result = subprocess.run([str(arg) for arg in args], capture_output=True, timeout=timeout)
    if check and result.returncode:
        # Only disposable-emulator/public-artifact commands are executed here.
        detail = (result.stderr or result.stdout).decode('utf-8', errors='replace')[-1800:]
        raise RuntimeError(f'{Path(str(args[0])).name} returned {result.returncode}: {detail}')
    return result.stdout if binary else result.stdout.decode('utf-8', errors='replace')


def licenses(sdk, destination):
    directory = sdk / 'licenses'
    files = {path.name: sha256(path) for path in sorted(directory.glob('*')) if path.is_file()}
    write_json(destination, files)


def verify_apk(root, aapt, signer):
    path = root / 'candidate.apk'
    if path.stat().st_size != APK_BYTES or sha256(path) != APK_SHA256:
        raise ValueError('APK identity differs from the approved APK3; refusing installation')
    with zipfile.ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise ValueError('APK archive CRC verification failed')
        names = archive.namelist()
        abis = sorted({name.split('/')[1] for name in names if name.startswith('lib/') and name.endswith('.so')})
        if 'x86_64' not in abis or 'assets/index.android.bundle' not in names:
            raise ValueError('Approved APK must contain x86_64 native code and embedded JavaScript')
    badging = command([aapt, 'dump', 'badging', path])
    package = re.search(r"^package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'", badging, re.M)
    activity = re.search(r"^launchable-activity: name='([^']+)'", badging, re.M)
    minimum = re.search(r"^sdkVersion:'(\d+)'", badging, re.M)
    if not package or package.groups() != (PACKAGE, '3', '1.0.0'):
        raise ValueError('APK package/version does not match the approved candidate')
    if not activity or not activity[1].startswith(PACKAGE + '.'):
        raise ValueError('APK launcher is not the expected app activity')
    if not minimum or int(minimum[1]) > 35:
        raise ValueError('APK minimum API is incompatible with the pinned emulator')
    signature = command([signer, 'verify', '--print-certs', path])
    digests = re.findall(r'certificate SHA-256 digest:\s*([0-9a-fA-F]{64})', signature)
    if not digests:
        raise ValueError('APK signature verifier returned no signer digest')
    value = {'sha256': APK_SHA256, 'bytes': APK_BYTES, 'url': APK_URL, 'sourceFingerprintFromBuildReceipt': APK_SOURCE,
             'package': package[1], 'versionCode': package[2], 'versionName': package[3],
             'minimumApi': int(minimum[1]), 'abis': abis, 'embeddedJavaScript': True,
             'signatureVerified': True, 'signerCertificateSha256': sorted(set(d.lower() for d in digests)),
             'launcherActivity': activity[1]}
    write_json(root / 'apk-verification.json', value)
    print(json.dumps({key: value[key] for key in ('sha256', 'bytes', 'package', 'versionCode', 'abis', 'signatureVerified')}))


def png_details(data):
    if not data.startswith(b'\x89PNG\r\n\x1a\n') or len(data) > MAX_SCREEN:
        raise ValueError('Screenshot is not a bounded PNG')
    offset, header, image_data, ended = 8, None, False, False
    while offset + 12 <= len(data):
        size = struct.unpack('>I', data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        payload = data[offset + 8:offset + 8 + size]
        if offset + 12 + size > len(data):
            raise ValueError('Truncated PNG')
        crc = struct.unpack('>I', data[offset + 8 + size:offset + 12 + size])[0]
        if zlib.crc32(kind + payload) != crc:
            raise ValueError('PNG chunk CRC mismatch')
        if kind == b'IHDR':
            if size != 13 or header is not None:
                raise ValueError('Invalid PNG header')
            width, height, depth, color, *_ = struct.unpack('>IIBBBBB', payload)
            header = {'width': width, 'height': height, 'bitDepth': depth, 'colorType': color}
        if kind == b'IDAT' and size:
            image_data = True
        offset += size + 12
        if kind == b'IEND':
            ended = True
            break
    if not header or not image_data or not ended or offset != len(data) or not all(header[k] > 0 for k in ('width', 'height')):
        raise ValueError('Incomplete PNG screenshot')
    return {**header, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def bounds(node, screen):
    match = re.fullmatch(r'\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]', node.get('bounds', ''))
    if not match:
        return None
    left, top, right, bottom = map(int, match.groups())
    left, top, right, bottom = max(0, left), max(0, top), min(screen[0], right), min(screen[1], bottom)
    return (left, top, right, bottom) if left < right and top < bottom else None


def locate(tree, label, screen, *, clickable=False, editable=False):
    parents = {child: parent for parent in tree.iter() for child in parent}
    candidates = []
    for node in tree.iter('node'):
        if node.get('package') != PACKAGE or node.get('enabled') == 'false' or not bounds(node, screen):
            continue
        if editable and node.get('class') != 'android.widget.EditText':
            continue
        values = (node.get('text', ''), node.get('content-desc', ''))
        exact = label in values
        # Icon-bearing Pressables may expose concatenated descriptions.
        if not exact and not any(label in value for value in values):
            continue
        target = node
        if clickable:
            while target is not None and target.get('clickable') != 'true':
                target = parents.get(target)
            if target is None or target.get('package') != PACKAGE or not bounds(target, screen):
                continue
        candidates.append((exact, target))
    if any(exact for exact, _ in candidates):
        candidates = [(exact, node) for exact, node in candidates if exact]
    unique = list({id(node): node for _, node in candidates}.values())
    if len(unique) > 1:
        raise ValueError(f'Ambiguous native UI selector: {label}')
    return unique[0] if unique else None


class NativeUI:
    def __init__(self, root, adb, serial):
        self.root, self.adb, self.serial = root, adb, serial
        self.screen = [1080, 2400]
        self.tests, self.screenshots = [], []

    def call(self, *args, **kwargs):
        return command([self.adb, '-s', self.serial, *args], **kwargs)

    def shell(self, *args, **kwargs):
        return self.call('shell', *args, **kwargs)

    def foreground(self):
        pid = self.shell('pidof', PACKAGE, check=False).strip()
        focus = self.shell('dumpsys', 'window', 'windows')
        activities = self.shell('dumpsys', 'activity', 'activities')
        focused = any(PACKAGE in line and any(marker in line for marker in ('mCurrentFocus', 'mFocusedApp', 'topResumedActivity', 'mResumedActivity'))
                      for line in (focus + activities).splitlines())
        if not pid or not focused:
            raise RuntimeError('Verified app is not running in the foreground')
        return pid.split()[0]

    def dump(self):
        self.foreground()
        # A failed dump must never reuse a stale hierarchy from another screen.
        self.shell('rm', '-f', '/sdcard/banffbound-qa.xml')
        self.shell('uiautomator', 'dump', '--compressed', '/sdcard/banffbound-qa.xml', timeout=25)
        data = self.call('exec-out', 'cat', '/sdcard/banffbound-qa.xml', binary=True)
        if len(data) > 2 * 1024 * 1024:
            raise ValueError('UI hierarchy exceeds bounded capture size')
        (self.root / 'last-ui.xml').write_bytes(data)
        return ET.fromstring(data)

    def wait(self, label, *, clickable=False, editable=False, timeout=25):
        end = time.monotonic() + timeout
        last = None
        while time.monotonic() < end:
            try:
                node = locate(self.dump(), label, self.screen, clickable=clickable, editable=editable)
                if node is not None:
                    return node
            except (ET.ParseError, RuntimeError, subprocess.TimeoutExpired) as error:
                last = str(error)
            time.sleep(0.4)
        raise AssertionError(f'Missing native UI {label}; {last or "not in the current hierarchy"}')

    def tap(self, label, *, editable=False):
        node = self.wait(label, clickable=not editable, editable=editable)
        left, top, right, bottom = bounds(node, self.screen)
        self.shell('input', 'tap', str((left + right) // 2), str((top + bottom) // 2))
        return node

    def scroll_to(self, label, *, editable=False):
        for _ in range(12):
            node = locate(self.dump(), label, self.screen, editable=editable)
            if node is not None:
                return node
            w, h = self.screen
            self.shell('input', 'swipe', str(int(w * .83)), str(int(h * .75)), str(int(w * .83)), str(int(h * .30)), '350')
        raise AssertionError(f'Could not scroll to {label}')

    def capture(self, name):
        self.foreground()
        data = self.call('exec-out', 'screencap', '-p', binary=True)
        details = png_details(data)
        if [details['width'], details['height']] != self.screen:
            raise ValueError('Screenshot pixels differ from the actual emulator display')
        filename = name + '.png'
        (self.root / 'screenshots').mkdir(exist_ok=True)
        (self.root / 'screenshots' / filename).write_bytes(data)
        self.screenshots.append({'file': filename, **details})
        self.progress()

    def progress(self):
        write_json(self.root / 'progress.json', {'tests': self.tests, 'screenshots': self.screenshots})

    def passed(self, name):
        self.tests.append({'name': name, 'passed': True})
        self.progress()

    def launch(self, activity):
        result = self.shell('am', 'start', '-W', '-n', PACKAGE + '/' + activity)
        if 'Status: ok' not in result:
            raise RuntimeError('Android activity did not start successfully')
        self.wait('Hello, adventure.', timeout=60)
        self.wait('Open trip settings')

    def tab(self, name, heading):
        self.tap(name)
        self.wait(heading)

    def relaunch(self, activity):
        self.shell('am', 'force-stop', PACKAGE)
        if self.shell('pidof', PACKAGE, check=False).strip():
            raise RuntimeError('Force-stop did not end the app process')
        self.launch(activity)


def run_smoke(root, adb, serial):
    verified = read_json(root / 'apk-verification.json')
    if not verified or verified.get('sha256') != APK_SHA256 or not verified.get('signatureVerified'):
        raise ValueError('Verified signed APK metadata is required before installing')
    ui = NativeUI(root, adb, serial)
    booted, start = False, time.monotonic()
    while time.monotonic() - start < 240:
        try:
            if ui.shell('getprop', 'sys.boot_completed', timeout=5).strip() == '1':
                booted = True
                break
        except (RuntimeError, subprocess.TimeoutExpired):
            pass
        time.sleep(2)
    if not booted:
        raise RuntimeError('Official emulator did not finish booting within four minutes')
    api, abi = ui.shell('getprop', 'ro.build.version.sdk').strip(), ui.shell('getprop', 'ro.product.cpu.abi').strip()
    if (api, abi) != ('35', 'x86_64'):
        raise ValueError('Emulator API/ABI does not match the pinned AOSP image')
    size = re.findall(r'(\d+)x(\d+)', ui.shell('wm', 'size'))
    if not size:
        raise ValueError('Actual device display size is unavailable')
    ui.screen = list(map(int, size[-1]))
    ui.shell('input', 'keyevent', 'KEYCODE_WAKEUP')
    ui.shell('wm', 'dismiss-keyguard')
    installed = ui.call('install', '--no-streaming', '--no-incremental', root / 'candidate.apk', timeout=120)
    if not re.search(r'^Success\s*$', installed, re.M):
        raise RuntimeError('Exact APK installation did not succeed')
    package = ui.shell('dumpsys', 'package', PACKAGE)
    if not re.search(r'\bversionCode=3\b', package) or 'versionName=1.0.0' not in package:
        raise ValueError('Installed package version does not match verified APK3')
    if ui.shell('pm', 'clear', PACKAGE).strip() != 'Success':
        raise RuntimeError('Could not establish a fresh app sandbox')
    write_json(root / 'device.json', {'api': int(api), 'abi': abi, 'displayPixels': ui.screen, 'serial': serial,
                                    'freshSandbox': True, 'installedPackage': PACKAGE, 'installedVersionCode': 3,
                                    'installResult': 'Success', 'runtimePermissionAutoGrants': False})
    activity = verified['launcherActivity']
    ui.launch(activity)
    ui.capture(PRIMARY[0])
    ui.tab('Explore', 'Find your kind of Banff.')
    ui.wait('Search places')
    ui.wait('View Lake Louise')
    ui.capture(PRIMARY[1])
    ui.tab('My Trip', 'Your trip, your pace.')
    ui.wait('Edit trip details')
    ui.capture(PRIMARY[2])
    ui.tab('Essentials', 'The useful little things.')
    ui.scroll_to('Park-pass planner')
    ui.capture(PRIMARY[3])
    if len({screen['sha256'] for screen in ui.screenshots}) != 4:
        raise ValueError('Primary native screen captures are unexpectedly identical')
    ui.passed(TESTS[0])

    ui.tab('Explore', 'Find your kind of Banff.')
    ui.tap('View Lake Louise')
    ui.tap('Save this place')
    ui.wait('Saved to your places')
    ui.tap('Close panel')
    ui.wait('Unsave Lake Louise')
    ui.tab('Essentials', 'The useful little things.')
    ui.scroll_to('Saved places')
    ui.tap('Saved places')
    ui.wait('Your little collection.')
    ui.wait('Unsave Lake Louise')
    ui.tap('Close panel')
    ui.relaunch(activity)
    ui.tab('Explore', 'Find your kind of Banff.')
    ui.wait('Unsave Lake Louise')
    ui.capture('qa-saved-place-after-force-stop')
    ui.passed(TESTS[1])

    ui.tap('Open trip settings')
    ui.scroll_to('Adults', editable=True)
    field = ui.tap('Adults', editable=True)
    value = field.get('text', '')
    if not re.fullmatch(r'\d{1,2}', value):
        raise ValueError('Adults input did not expose its actual editable numeric value')
    ui.shell('input', 'keyevent', 'KEYCODE_MOVE_END')
    ui.shell('input', 'keyevent', *(['KEYCODE_DEL'] * (len(value) + 1)))
    ui.shell('input', 'text', '3')
    # Back dismisses only a displayed keyboard; it must not close the settings panel.
    tree = ui.dump()
    ime_visible = any('inputmethod' in node.get('package', '') for node in tree.iter('node'))
    input_method = ui.shell('dumpsys', 'input_method')
    if ime_visible or re.search(r'(?:mInputShown|mIsInputViewShown|isInputViewShown)=true', input_method):
        ui.shell('input', 'keyevent', 'KEYCODE_BACK')
    ui.wait('Adults', editable=True)
    ui.scroll_to('Save trip details')
    ui.tap('Save trip details')
    ui.tab('My Trip', 'Your trip, your pace.')
    ui.relaunch(activity)
    ui.tap('Open trip settings')
    ui.scroll_to('Adults', editable=True)
    if ui.wait('Adults', editable=True).get('text') != '3':
        raise AssertionError('Edited adult count did not survive real Android force-stop and relaunch')
    ui.capture('qa-trip-edit-after-force-stop')
    ui.tap('Close panel')
    ui.passed(TESTS[2])
    pid = ui.foreground()
    log = ui.call('logcat', '-d', '-v', 'brief', '--pid=' + pid, timeout=20)
    (root / 'logs' / 'app-logcat.log').write_text(log[-128 * 1024:])
    if re.search(r'FATAL EXCEPTION|Fatal signal|ANR in ' + re.escape(PACKAGE), log):
        raise RuntimeError('Native app fatal/ANR log found')
    write_json(root / 'smoke-completed.json', {'allTestsCompleted': True, 'physicalDeviceVerified': False})


def finalize(root):
    evidence = root / 'evidence'
    evidence.mkdir(parents=True, exist_ok=True)
    apk = read_json(root / 'apk-verification.json')
    device = read_json(root / 'device.json')
    progress = read_json(root / 'progress.json', {'tests': [], 'screenshots': []})
    before, after = read_json(root / 'source-before.json'), read_json(root / 'source-after.json')
    license_before, license_after = read_json(root / 'licenses-before.json'), read_json(root / 'licenses-after.json')
    errors = []
    if read_text(root / 'command.exit') != '0':
        errors.append('Runner command failed; no native success inferred.')
    if not apk or apk.get('sha256') != APK_SHA256 or not apk.get('signatureVerified'):
        errors.append('Exact signed APK identity was not verified.')
    if not device or not device.get('freshSandbox') or device.get('api') != 35 or device.get('abi') != 'x86_64':
        errors.append('Pinned emulator installation was not verified.')
    if before is None or before != after:
        errors.append('Canonical app source/config/lock/assets were not verified unchanged.')
    if license_before is None or license_before != license_after or 'android-sdk-license' not in license_before:
        errors.append('Existing accepted SDK licence files were not verified unchanged.')
    if {test.get('name') for test in progress['tests'] if test.get('passed')} != set(TESTS):
        errors.append('All three actual native smoke/persistence checks must complete.')
    if not read_json(root / 'smoke-completed.json', {}).get('allTestsCompleted'):
        errors.append('Native smoke run did not reach its completed marker.')
    screens = []
    for shot in progress['screenshots']:
        name = shot.get('file', '')
        path = root / 'screenshots' / name
        if Path(name).name != name or not name.endswith('.png') or not path.is_file():
            errors.append('Invalid screenshot evidence path.')
            continue
        try:
            actual = png_details(path.read_bytes())
            if actual != {key: shot[key] for key in actual} or not device or [actual['width'], actual['height']] != device['displayPixels']:
                raise ValueError('Screenshot hash or actual display dimensions changed')
            shutil.copy2(path, evidence / name)
            screens.append(shot)
        except (OSError, ValueError, KeyError) as error:
            errors.append(str(error))
    required = {name + '.png' for name in PRIMARY} | {'qa-saved-place-after-force-stop.png', 'qa-trip-edit-after-force-stop.png'}
    if {shot['file'] for shot in screens} != required:
        errors.append('Six actual native captures, including four primary screens, are required.')
    for path in sorted((root / 'logs').glob('*.log'))[:16]:
        (evidence / (path.stem + '.tail.log')).write_bytes(path.read_bytes()[-128 * 1024:])
    for name in ('source-before.json', 'source-after.json', 'apk-verification.json', 'device.json'):
        if (root / name).is_file():
            shutil.copy2(root / name, evidence / name)
    if (root / 'last-ui.xml').is_file():
        shutil.copy2(root / 'last-ui.xml', evidence / 'last-native-ui.xml')
    receipt = {'kind': 'signed-apk3-native-android-emulator-smoke', 'passed': not errors,
               'sourceCommitForHarness': read_text(root / 'source-commit.txt'),
               'apk': apk, 'device': device, 'sourceUnchangedVerified': before is not None and before == after,
               'sdkLicenseFilesUnchangedVerified': license_before is not None and license_before == license_after,
               'tests': progress['tests'], 'screenshots': screens, 'errors': errors,
               'lastPhase': read_text(root / 'phase.txt'),
               'githubRun': {key: os.getenv(name) for key, name in [('repository', 'GITHUB_REPOSITORY'), ('runId', 'GITHUB_RUN_ID'), ('attempt', 'GITHUB_RUN_ATTEMPT')]},
               'capture': {'method': 'adb exec-out screencap -p', 'pixelEditing': False,
                           'data': 'fresh app sandbox; a public saved place and synthetic adult count only'},
               'physicalDeviceVerified': False, 'googlePlayPublished': False,
               'googlePlayAccountAccessed': False, 'accountVerificationBypass': False,
               'storeUploadApproved': False,
               'limits': ['One AOSP API35 x86_64 emulator; no physical Android or ARM-device validation.',
                          'No Play Console login, account verification workaround, store release, payments or bookings.',
                          'Location, notifications, provider pages, real network-offline behavior and accessibility need separate QA.',
                          'APK3 is an internal-distribution build; these results do not validate the separate store AAB binary.']}
    if sum(path.stat().st_size for path in evidence.rglob('*') if path.is_file()) > MAX_EVIDENCE:
        receipt['passed'] = False
        receipt['errors'].append('Evidence exceeds the 48MiB limit; native screenshots omitted.')
        for path in evidence.glob('*.png'):
            path.unlink()
    write_json(evidence / 'receipt.json', receipt)
    print(json.dumps({'passed': receipt['passed'], 'testsCompleted': len(progress['tests']), 'screenshots': len(screens), 'errors': receipt['errors']}, indent=2))
    return 0 if receipt['passed'] else 1


def main():
    mode, root = sys.argv[1], Path(sys.argv[2]).resolve()
    if mode == 'licenses':
        licenses(root, Path(sys.argv[3]))
    elif mode == 'verify':
        verify_apk(root, sys.argv[3], sys.argv[4])
    elif mode == 'run':
        run_smoke(root, sys.argv[3], sys.argv[4])
    elif mode == 'finalize':
        return finalize(root)
    else:
        raise ValueError('Unknown Android QA operation')
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (AssertionError, ValueError, RuntimeError, OSError, subprocess.TimeoutExpired, zipfile.BadZipFile) as error:
        print(f'Android QA failed: {error}', file=sys.stderr)
        raise SystemExit(1)
