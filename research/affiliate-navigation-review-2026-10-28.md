# Affiliate navigation review - 28 October 2026

The global affiliate click handler prevented the anchor default and opened its destination only from the Google Ads event callback. A blocked, unavailable or stalled tracker could therefore stop the visitor reaching the provider. A callback popup also discarded native target and browser gesture behavior.

The handler now records the existing affiliate event and click conversion as best-effort calls, while the original anchor performs navigation. The conversion helper no longer opens a window or supplies a navigation callback. Existing Expedia, GetYourGuide, Amazon and VRBO classification, partner identifiers and Google tag destinations are preserved. No campaign, budget, account or destination setting changed. The obsolete OpenWeather DNS prefetch was removed after the prior weather source replacement.

The primary Google reference describes event_callback as running after an event command is processed: https://developers.google.com/tag-platform/gtagjs/reference/parameters . Provider navigation does not depend on that callback.

`node scripts/check-affiliate-navigation.mjs` executes the real handler and inline helper in an offline browser-shaped sandbox. It covers tracker/helper availability and exceptions, a callback that never arrives, native targets, browser gestures and the existing conversion destination. It sends no actual conversion or booking. These checks establish navigation behavior; they do not establish affiliate attribution, a completed booking or revenue. The existing conversion is a click event, not proof of a purchase.
