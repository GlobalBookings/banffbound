# BanffBound mobile app

Native iOS and Android app, with an installable web companion published at `/app/`.

## Develop

Use a current Node LTS release and the committed lockfile.

```sh
cd mobile
npm ci
npm start
npm run web
```

The app includes 42 curated places, 16 original offline guides, six launch itineraries, guest trip storage, specific saved venue selections, booking tasks, packing, CAD budget estimates, dated park-pass comparisons, official ECCC observations, an online OpenStreetMap, and verified offline trip packs. External links and maps require connectivity.

The mobile catalogue and reviewed website planner/calculators are generated locally by `npm run sync:content`. Pure source modules are copied with provenance hashes so cloud native builds do not depend on files outside this directory. After editing a shared website source, regenerate and review the mobile changes. Never edit generated modules directly.

## Check and build

```sh
npm run typecheck
npm test
node --test web/offline-worker.test.mjs
node scripts/sync-content.mjs --check
npm run export:web
npm run export:native
npx expo-doctor
```

The web export runs `scripts/postexport.mjs`, creating the scoped service worker, manifest, support/privacy pages, asset hashes and source fingerprint. Copy the complete `dist/` directory to the website's `public/app/`, then run `node mobile/scripts/verify-published.mjs` from the repository root. Re-export after source/config/lock changes; the guard rejects stale published assets.

## Native distribution

Expo owner: `spiresdigital`. Project: `bc4566b5-997f-45fa-abca-eabf5b98630c`.
App identifiers: `com.banffbound.app` on both platforms. These identifiers are public configuration, not secrets.

```sh
eas build --platform android --profile preview
eas build --platform all --profile production
```

Preview produces an installable Android APK; production produces store binaries. Signing, developer account access, physical-device validation, screenshots and store review are separate release requirements. The web companion being live does not mean the store apps are published. See `release/README.md` and the release receipts for the actual state.

Keep credentials, Apple profiles, private keys, service-account JSON and personal trip backups out of Git and the web export. EAS archives should contain only this app's sources. Do not archive the unrelated dirty repository checkout for a native release.

## Data and privacy

Trips and notes stay on the device. Shared backups omit private booking notes by default. Importing a backup never imports notification permission or another device's offline-ready status. Budget blanks remain unknown; an entered zero remains zero. Weather validates provider identity and source time and expires after three hours. Banff dates and reminders follow Alberta’s permanent UTC−6 policy from 1 November 2026, even on devices with older timezone data. The app does not infer trail safety, live availability or provider-confirmed bookings.

Web and native storage, notification delivery and operating-system file pickers have different behaviour. Unit tests and successful bundles do not replace signed real-device testing. See `release/browser-qa.json` for the exact browser checks performed.
