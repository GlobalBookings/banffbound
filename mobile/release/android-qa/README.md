# Exact APK 3 native Android smoke QA

This workflow tests the existing signed **internal-distribution APK 3**, without
rebuilding or editing the app. It first verifies the fixed 78,408,331-byte APK's
SHA-256, ZIP integrity, x86_64 native libraries, embedded JavaScript, package,
version, launcher and signature with installed official Android build tools.
The accepted hash is
`da8e5439d98e42dbbacbb92187aa5ed6265f687514c7781f143db514a3787b96`.

It runs on standard `ubuntu-24.04` in the public repository. GitHub documents
standard public runners as free. The existing Android SDK is used to obtain an
official AOSP API 35 `default;x86_64` image, if needed. SDK-manager stdin is closed;
no licence prompt is answered, `--licenses` is never invoked, and licence-file
hashes must remain unchanged. Missing acceptance, tools, KVM or an appropriate
image fails the job. A disposable runner-user ACL may enable access to `/dev/kvm`.
No Play Services image, Google account, Play Console, Expo login, new plan,
physical device registration, account-verification workaround or signing key is used.
The workflow installs only Ubuntu's `libpulse0` host runtime library, required by
the official emulator even with audio disabled, then requires a clean `ldd`
dependency check before boot. This does not accept Android SDK licence terms.

The emulator has a fresh app sandbox. Official `adb` and UI Automator hierarchy
labels drive the actual installed native UI. Checks must prove:

1. Embedded-app loading, native navigation and distinct captures of Today,
   Explore, My Trip and Essentials.
2. Saving Lake Louise, then seeing it remain saved after real force-stop/relaunch.
3. Editing the synthetic adult count to three, then reading three from the native
   text input after force-stop/relaunch.

The harness never uses app test hooks or replaces network responses. Android
permissions are not automatically granted. Source/config/lock/asset fingerprints
must remain unchanged. Each PNG is captured by `adb exec-out screencap -p`, with
CRC, dimensions and SHA-256 checked; pixels are not edited. Six small PNGs,
redacted public APK/device metadata, app-source fingerprints, the last native UI
hierarchy and bounded logs are retained for **one day**, below a 48 MiB limit.
The APK, emulator disk, full SDK and full logcat are excluded from the artifact.

A passing result describes only this APK on one AOSP API 35 x86_64 emulator.
It does not prove physical/ARM-device behavior, the separate store AAB, Play
eligibility, location/notification permissions, provider transactions, real
network-offline behavior or complete accessibility. Screenshots still need
visual review and any required publishing approval; no store upload occurs.

The first run starts on a PR changing the workflow/harness; after merge it can
also be run from Actions → Native Android APK QA → Run workflow. Parent review
is required before pushing this branch.

Local guard checks do not need an Android SDK:

```sh
python3 -m unittest discover -s mobile/release/android-qa -p '*_test.py'
bash -n mobile/release/android-qa/run-android-qa.sh
```

Official references checked 2026-10-30:

- [GitHub public runner resources and billing](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [Ubuntu 24.04 installed tools](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
- [Android SDK manager](https://developer.android.com/tools/sdkmanager)
- [Official AOSP system-image repository](https://dl.google.com/android/repository/sys-img/android/sys-img2-3.xml)
- [Emulator command line](https://developer.android.com/studio/run/emulator-commandline)
- [Android emulator acceleration](https://developer.android.com/studio/run/emulator-acceleration)
- [adb and native screenshot capture](https://developer.android.com/tools/adb)
