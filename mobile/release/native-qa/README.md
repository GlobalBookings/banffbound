# Native iOS simulator QA

The `Native iOS Simulator QA` GitHub Actions workflow compiles the existing Expo
app as an unsigned **Release** simulator application, with embedded JavaScript.
It generates an isolated XCTest UI target in the temporary prebuilt iOS project;
it does not edit or commit app source, native runtime configuration or EAS settings.
No Apple/Expo credentials, paid runners, external device service or new plan is used.

One build is reused sequentially on iPhone 17 Pro and iPad Pro 13-inch (M5), using
the runner's installed iOS 26 simulators and pinned Xcode 26.6. Build and test
explicitly target arm64; this standard Apple Silicon runner does not need an
x86_64 build. Each destination
must execute and pass nine real UI tests: navigation/capture of Today, Explore,
My Trip and Essentials; saving Lake Louise and verifying it after process
relaunch; changing the synthetic adult count to three and verifying it after
another process relaunch; adding the precise Lake Louise venue to day one and
verifying that association after relaunch; and saving a native offline pack,
reopening its saved status and reading a bundled guide after relaunch; searching
the tour catalogue, reading its provider/disclosure and opening and dismissing
the actual native Safari controller; and searching hotels plus a specific online
guide outside the original bundled guide set; selecting The Bison Restaurant's
actual WebView marker after search and Fit results, then verifying its native
detail, cuisine and reviewed menu action; and selecting multiple map categories,
an area and a sourced toilet, reading facilities and source details, closing the
detail, checking an invalid search and resetting all filters. The first seven
tests, helpers and assertions are preserved byte for byte. The map
tab must host the actual native WebView; external provider availability is not
claimed. The four original store captures precede these mutations. The three
commercial captures show the unfiltered Tours, Stays and Guides catalogues;
their trip header may reflect only the earlier synthetic test state.
Two further captures show the unfiltered map and the restaurant detail reached
from its genuine document marker. The toilet flow uses the ordinary native
result list for the precise Public Washrooms record in Lake Louise. The marker
flow cannot fall back to that result list. Neither map flow requests location
permission or opens a menu, makes a booking or claims tile-provider availability.

After XCTest, the runner reads the actual app-created offline file from each
simulator sandbox and verifies exact canonical guide/place content plus the
UI-edited party, saved place and first-day venue. Only its hash/counts/result
are retained; the personal pack contents are not uploaded.

The artifact contains eighteen unedited native store-screen PNGs, two native
browser-handoff screenshots, a source commit and
fingerprint comparison, embedded bundle SHA-256, XCTest counts and bounded log
tails. On a test failure it also retains at most one diagnostic screenshot and
one bounded accessibility tree per device, plus bounded attachment manifests.
The extractor requires the nine named store captures from each device at the
actual expected dimensions (1206 × 2622 and 2064 × 2752), successful xcodebuild
exits, exactly nine passed tests per device, all nine named flow identities
in the actual result attachment manifest, and zero failures/skips/expected
failures. The original fourteen screenshots remain required. It also requires the
native browser screenshot and a small executed-test observation verifying its
Done control, WebView presence and return to the BanffBound detail. Two executed
map observations must establish the document-marker bridge and the actual
facility/filter/empty-state/reset assertions, while preserving network and
permission limits. Missing
evidence fails the job. It records alpha/transparency compatibility separately.
The existing 48 MiB total evidence limit remains unchanged. Only the small
evidence folder is uploaded for **one day**; applications, Pods,
DerivedData, full result bundles, videos and caches are excluded.

The first run starts when a PR changes this workflow/harness. Once merged, a
maintainer may use Actions → Native iOS Simulator QA → Run workflow, or:

```sh
gh workflow run native-ios-qa.yml --ref main
gh run list --workflow native-ios-qa.yml --limit 1
gh run download RUN_ID --name native-ios-simulator-qa-RUN_ID-ATTEMPT --dir /tmp/banffbound-native-qa-evidence
```

Before publishing screenshots, inspect every PNG and `receipt.json`, retain
approved release evidence before the one-day expiry, and confirm the source
matches the submitted build. Simulator success is distinct from physical-device
TestFlight validation. The browser observation records only domain or query text
that the native address UI exposes. A visible provider host alone is not partner
query or attribution proof, and a hidden address is explicitly recorded as such.
Opening the provider is limited to the public tour link: no booking, login,
consent selection or permission request is performed. This harness does not
validate location/notification permissions, real bookings, external provider
page availability, affiliate attribution, real network-offline
behavior, current map facilities/menu content, surveyed entrances, or physical
device accessibility. It never uploads to App Store Connect
or submits an app for review.

Local harness checks (no Xcode required):

```sh
python3 -m unittest discover -s mobile/release/native-qa -p '*_test.py'
bash -n mobile/release/native-qa/run-ios-qa.sh
ruby -c mobile/release/native-qa/prepare-ios-ui-tests.rb
```

Official references checked 2026-10-30:

- [Apple screenshot sizes and no-alpha requirement](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [GitHub standard public runner billing](https://docs.github.com/en/actions/concepts/billing-and-usage)
- [Installed macOS 26 arm64 image, Xcode and simulators](https://github.com/actions/runner-images/blob/main/images/macos/macos-26-arm64-Readme.md)
- [Expo SDK 57 requirements and Xcode 27 scene caveat](https://expo.dev/changelog/sdk-57)
- [Apple native Safari controller controls and dismissal](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller/)
