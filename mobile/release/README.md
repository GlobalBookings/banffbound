# BanffBound release preparation

This runbook describes the release path for the iOS and Android app and its browser companion. A source build, web deployment, native binary and store publication are separate outcomes. Record each outcome against an exact revision and artifact hash.

## Verified access and toolchain

Read-only checks on 30 October 2026 found:

- GitHub remote: `GlobalBookings/banffbound`; the existing CLI connection can access this repository.
- The live GitHub `main` revision at the time of inspection was `7e0162cc6005aec488dc68f49fffe06b19d56c50`. Refresh before making a release branch.
- The repository README describes DigitalOcean App Platform behind Cloudflare, with `main` triggering production builds. Preserve that setup.
- Expo CLI authentication succeeded for `spiresdigital`; the session also has owner access to `spiresdigitals-team`. The approved BanffBound Expo project is now `@spiresdigital/banffbound`, project ID `bc4566b5-997f-45fa-abca-eabf5b98630c`.
- Refreshed Apple CLI authentication identifies **SPIRES DIGITAL LTD**, team `P7A6HRL2B7`, provider `129009564`. Earlier cached metadata describing the team as Individual was stale. The selected iOS bundle ID and Android package are both `com.banffbound.app`; store-record and signed-build verification remain separate steps.
- Full Xcode, Android Studio and the Android SDK were absent. Command Line Tools and CocoaPods were available. Local store builds are therefore not currently ready; EAS cloud builds are the practical first option.
- No `doctl` executable, standard doctl configuration or conventional DigitalOcean token environment variable was found. GitHub-triggered hosting deployment remains the available route identified so far.

These checks do not establish Apple Developer membership, Play Console access, app signing, app ownership or permission for a new paid service.

## Protect the existing checkout

The original checkout contains substantial unrelated staged and unstaged work. Use an isolated clean checkout from freshly fetched `origin/main`, then copy an explicit allowlist of reviewed app files into it. Never stage the original checkout wholesale. Do not copy `.env`, credentials, private research, `node_modules`, local caches or generated native signing files.

Keep source changes in a reviewable branch and PR. Review the final diff, run the app checks and existing site checks appropriate to the exact diff, then release the reviewed revision. Attach the PR to the task after creation. Record the resulting main revision and verify production independently.

## Browser companion

Build the Expo web app for `/app/`, with asset paths rooted under `/app/`. The web export must include the correct title, description, canonical URL and mobile viewport. If offline access is offered in the browser, scope the app service worker to `/app/` and verify its cache manifest contains the app shell, JavaScript and every promised offline asset. The site's existing root service worker does not provide this coverage.

Publish only the reviewed export and its app-specific support/privacy files to `public/app/` in the clean release checkout. The resulting Astro deployment can retain all existing website routes and host the app at `https://banffbound.com/app/`.

Verify on production:

1. `/app/` and its JavaScript/assets return successful responses with suitable content types.
2. The deployed version/hash matches the reviewed artifact.
3. Create, edit and reopen a trip in a real browser.
4. After the app is loaded and offline storage is complete, restart offline and confirm the promised content and edits remain available.
5. Verify a phone-width layout, accessibility navigation, denied permissions and storage failures.
6. Recheck existing key website URLs and the public site build receipt.

A browser deployment is useful immediately but is not an App Store or Google Play release. Store buttons must remain absent or clearly unavailable until real public listing URLs are verified.

## Native builds

After the app passes its implementation checks:

1. Confirm the publishing owner, app name and final bundle/package identifiers. Do not register guessed organisation identifiers.
2. Bind the app to the approved Expo project and record its returned project ID.
3. Confirm Apple Developer and Google Play Console membership, signing authority, support contact and app ownership.
4. Review `eas.json` and the app configuration. Build an Android preview APK and an iOS simulator build where useful; neither establishes an iPhone device or store test.
5. Build production Android AAB and signed iOS IPA with EAS. Record build IDs, URLs, status and artifact hashes.
6. Install and test through the intended tracks. TestFlight requires Apple access and processing; Play requires its own app setup and eligibility checks.
7. Submit the reviewed listings, privacy disclosures, screenshots and binaries. Record store processing and review results separately.
8. Publish only after approval and verify the public store URLs, actual install and first-run journey.

New personal Google Play developer accounts created after 13 November 2023 currently require a closed test with at least 12 testers continuously opted in for 14 days before applying for production access. Confirm the actual account type and current requirements in Play Console. Do not describe store publication as immediate when this gate applies.

## Listing and privacy audit

`store-listing.json` is a draft. Its feature claims must be checked against the final binaries. Screenshots must come from the app itself, and the listing must explain the boundary between bundled/saved content and online maps, weather, external links and bookings.

The existing website privacy policy describes optional website services and is not automatically an accurate native-app policy. Before submission, inspect the actual app and dependencies for local trip storage, OS backups, device location, notifications, crash reporting, analytics, remote images, network providers and affiliate handoffs. Publish the resulting app-specific policy and complete both stores' disclosures consistently. If no account feature exists, do not imply cloud sync or account deletion. Provide a clear local-data reset.

The existing public contact is `hello@banffbound.com`, with the website contact page at `https://banffbound.com/contact/`. Confirm the mailbox is monitored before relying on it for store support. Keep personal booking notes out of default shared exports and analytics.

## Evidence to retain

Mobile CI reproduces the submitted catalogue against the exact reviewed website
snapshot recorded in `reviewed-content-source.json` (commit `4da51e0`). A second
ephemeral checkout receives the actual current mobile tree and runs the unchanged
generator with `--check` and all current mobile tests in that same source context.
The check verifies all 12 `contentProvenance` input
hashes, photo credits, byte-exact generated output and unchanged mobile inputs.
Independent website affiliate updates therefore do not silently replace the
content of a submitted app. To publish newly reviewed app content, explicitly
review a new website revision, regenerate the catalogue and update the pin,
photo-credit hash and matching workflow checkout together. A provenance or output
mismatch fails CI; it is never skipped or automatically accepted.

Create a release receipt containing the source revision, dependency lock hash, test results, content version, export/binary hashes, feed availability, known limitations, web verification and store submission/publication status. Never include tokens, account credentials, private booking notes or full hosting environment specifications.

Primary references: [Expo store builds](https://docs.expo.dev/deploy/build-project/), [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/), [Google Play account testing](https://support.google.com/googleplay/android-developer/answer/14151465).
