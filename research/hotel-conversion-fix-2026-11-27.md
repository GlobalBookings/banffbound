# Hotel booking referral and guide release — 27 November 2026

## Corrected booking routes

The previous site largely used direct Expedia property/search URLs with a camref query. The prepared 11 November portal-generated referral routes had not been installed. A fresh browser test of Fairmont Banff Springs showed that the generated route added Expedia affiliate click identifiers while the direct route retained only its raw camref. This establishes a handoff difference, not proof that any historic booking lost credit.

- Installed 70 previously prepared and 20 newly generated Creator Hub links, preserving the account's Canadian camref `1101l3MtWX` and creative reference `1011l87781`.
- Fourteen additional property identities were opened and confirmed in Expedia, including Calgary, Stoneridge and Copperstone. Six formerly generic directory buttons now open Hidden Ridge, Bellstar Suites at Solara, Samesun, Emerald Lake, Pocaterra and Super 8 Canmore directly.
- Corrected previously mismatched Mountaineer, Paradise and Baker Creek IDs using the prepared, verified property targets.
- Static HTML anchors are rewritten during prerender. Dynamic trip-builder links use the same resolver. Native navigation works without JavaScript, cookie consent or a working analytics tag.
- GA4 retains the underlying property URL without query parameters, plus fixed property, placement and paid-cohort labels. No click IDs, email addresses or booking details are added to analytics.

## Pages and mobile booking

Seven profiles were reviewed against current operator sources: Irwin's Mountain Inn, Bow View Lodge, Mount Engadine Lodge, Bellstar Suites at Solara Resort, Samesun Banff Hostel, Super 8 by Wyndham Canmore and Moxy Banff. Their source links and review dates are stored in `src/data/hotelConversionReviews.json`. Unsupported old room counts, dates, coordinates, facilities and photos are cleared before applying the reviewed fields.

- Used visually checked operator property photographs, including the Samesun dorm rather than its destination scenery.
- Corrected Moxy to 555 Banff Avenue, Super 8 to 1506 Bow Valley Trail, and Mount Engadine to remote Spray Valley/Kananaskis.
- Kept Solara's self check-in/no on-site Bellstar front desk and renovation notice, and Bow View's neighbouring-hotel pool distinction visible.
- Added an orange, simple Book now button and a mobile bottom button from initial page load on reviewed property pages. Cookie controls sit above the button.
- Made the six comparison rows become cards on mobile, with booking links inside the viewport.

## Validation

All 81 workflow checks passed locally. Added regression checks cover the generated link registry, exact property destinations, host/publisher guards, date preservation, query minimization, native navigation under consent choices, safe property/cohort reporting, seven new editorial reviews and built static HTML coverage. The built-site audit found 921 generated Expedia anchor occurrences and zero remaining raw own-publisher Expedia anchors. At 390px width, all six comparison links fit within the viewport; the Solara photo loaded and its mobile booking button appeared immediately below the cookie banner without overlap.

A referral test proves a tracking handoff, not a commissioned sale. Bookings and payable commission still require Expedia's transaction reporting; this release does not fabricate purchase conversions or revenue in Google Ads.
