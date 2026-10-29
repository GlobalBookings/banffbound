# Vacation rental planning and provider-source review

Reviewed **29 October 2026**. Scope: `src/data/rentals.ts`, `src/data/rentalPlanning.ts`, `src/pages/vacation-rentals/index.astro` and the focused check in this directory. No hotel records, shared templates, sitemap, CI, booking/account, host messages or production systems were changed. This review checks sources and local behaviour; it is not an availability, booking, conversion or individual licensing test.

## Source inventory and provenance

The original rental module had **50** records, all descended from an earlier Vrbo search import. `scripts/parse-vrbo.mjs`, `parse-vrbo-v2.mjs` and `parse-vrbo-v3.mjs` point to the preserved local source artifact:

`/Users/jackchittenden/.factory/artifacts/tool-outputs/fetch_url-toolu_vrtx_014WRgAnNrDTAVgwphaZGp6V-71166236.log`

Artifact SHA-256: `1bd5dd5e7b74de60f232b1e893cff4b59f79b7e95a3c3a1e668f13b3394ec0d0`.

It records a successful [Vrbo Banff search](https://www.vrbo.com/en-ca/search?destination=Banff%2C+Alberta%2C+Canada&adults=2&sort=RECOMMENDED), with a March/April 2026 rendered calendar and `pwa_ts` values in the links. This is old page-state context, **not a reliable independent capture/check date** or evidence of inventory for a visitor's travel dates. All 50 stored Expedia property IDs appear in the artifact. Forty-seven existing target URLs occur literally; the other three are malformed route conversions documented below. Only 13 current display labels appear exactly: many names were shortened or normalized during earlier curation. The page consequently calls them stored/imported listing labels, not exact current provider quotations.

The imported source fields were sparse: capacity was present in 49 records, bedrooms in 39, bathrooms in 46 and type in 49. All 50 had area labels, but these are search labels rather than independently verified street addresses. In particular, a generic `Banff` label did not establish `Downtown Banff`; `Banff Centre` is not automatically a central-town address.

### Former generated claims removed

- Every record had an undated nightly price; 47 had old rating/review fields and 19 had Premier Host flags. Doubled scraped ratings such as `1010` were fed into a mathematically inappropriate normalizer. Those fields are removed from raw and exported rental records, filters, visible cards, scripts and schema. No fresh scores or quotes replace them.
- Missing capacity became two guests; missing bedrooms became a studio; missing bathrooms became one; missing type became House. Missing fields now remain **null**, with “not recorded” visible and distinct unknown-value filters.
- Description/highlight generators treated title words as evidence of hot tubs, mountain views, pets, private entrances, kitchens, walkability and more. Generic fill added WiFi, self check-in, kitchens and laundry without evidence. All those generators and generated fields were removed. An imported name supplies no amenity or eligibility tags.
- Every point was generated from an area centroid, a seeded offset and a spiral. The Harvie Heights centroid itself was misleadingly near Banff. All 50 exported coordinate pairs are now **null** with `coordinateStatus:'unavailable'`; no unit map, pin or precise schema geo remains.
- The old area/type “normalization” made unsupported location/type claims, such as converting generic Banff into Downtown and Aparthotel into Condo. Original area/type labels are preserved as imported data. A separate broad base grouping exists only for filtering those labels; it is not a verified address.

The first screen now provides a useful base/room/transport comparison rather than an unsupported price catalogue. A dated official-source shortlist is separate from the complete 50-lead browsing list. All four base guides, all four room examples and all provider leads render without JavaScript. No generic hero photograph is claimed to show a Banff rental.

## Provider URL corrections and affiliate preservation

All existing **property IDs**, display-label/slug identities and provider photo URLs are retained. **47 target URLs are byte-for-byte unchanged.** Direct primary-provider artifact evidence supports these three route repairs:

| Property / ID | Former module target | Provider target shown in preserved artifact |
| --- | --- | --- |
| Douglas Fir Resort / `904421` | `/en-ca/cottage-rental/p904421` | `https://www.vrbo.com/en-ca/pdp/lo/904421` with `expediaPropertyId=904421` |
| Hidden Ridge Resort / `3845` | `/en-ca/cottage-rental/p3845` | `https://www.vrbo.com/en-ca/pdp/lo/3845` with `expediaPropertyId=3845` |
| Basecamp Suites Banff / `74883714` | `/en-ca/cottage-rental/p74883714` | `https://www.vrbo.com/en-ca/pdp/lo/74883714` with `expediaPropertyId=74883714` |

The parser intended to retain the base path before `?`; the module instead constructed cottage-rental paths for these managed properties. The repair restores those evidenced base paths without carrying old adults, search, date or page-state parameters. It does not assert that the linked provider inventory is the exact room category illustrated by an operator source. Visitors are told to match property, room and complete terms.

The wrapper and values are preserved exactly:

- Endpoint: `https://vrbo.com/affiliate`
- Encoded `landingPage`: the retained or directly corrected provider URL
- `camref=1101l3MtWL`
- `creativeref=1011l63087`
- `adref=PZBJVX1Er0`

These are **VRBO identifiers, distinct from Expedia's affiliate code**. All provider CTAs have `rel="noopener sponsored"` and disclosure appears before the first one. The helper accepts only HTTPS `vrbo.com`/`www.vrbo.com` targets; it does not book, send data to a host or perform a conversion test.

Original `[slug,name,targetURL,ExpediaID,image]` tuple SHA-256: `405c3aeaf10cbce87d2eb29a6c2555efeb4fd824955ed1134dd9d38f4a998656`.

After **only** the three evidenced target-path corrections: `43a366153e55477496a1401dc415a308a4ff3fba5cbb9237892db8ee4afc2690`. The focused check pins this latter identity digest to catch unintended future changes.

## Official-source room examples

These are property/category planning examples reviewed on 29 October, not currently bookable-unit claims or licensing certifications. They use official sources independently of the undated imported room counts. No maximum occupancy is inferred from a resort-level search result.

### Basecamp Suites Banff

[Official property page](https://basecampresorts.com/banffsuites/) identifies **101, 316 Marten Street**, full-kitchen suite categories and a nearby ski-shuttle stop. The [Two Bedroom Suite page](https://basecampresorts.com/room-details/banff-suites-two-bedroom/) lists separate queen bedrooms, sofa bed, bathroom, elevator access, non-pet status and paid parking. The guide asks visitors to confirm sleeping/dining arrangements, actual access needs, vehicle height and current shuttle connections. A footer's Canmore company-office address was not substituted for the Banff property address. No price, fixed walk time, reserved parking or all-rooms accessibility guarantee is copied.

### Douglas Fir Resort and Chalets

[Accommodation categories](https://douglasfir.com/accommodations/) distinguish studios, condos, lofts and two-/three-bedroom A-frame chalets. A chalet or loft label does not guarantee a detached or step-free layout. The [waterpark page](https://douglasfir.com/amenities/indoor-waterpark/) still advertises **26–30 October** maintenance without a year in its visible notice, so the page states the review date and asks for actual reopening confirmation. The [dog policy](https://douglasfir.com/about/pet-policy/) requires advance phone approval for limited outside condos. [FAQ](https://douglasfir.com/faq/) supports local Roam guest passes; these are not general regional or ski-transfer entitlement. No dated closure is turned into a promise of future operation.

### Hidden Ridge Resort

[Official rooms](https://banffhiddenridge.com/rooms/) distinguish one-bedroom condos and loft categories across multiple levels. The [Deluxe One Bedroom Condo](https://banffhiddenridge.com/deluxe-one-bedroom-condo/) documents the bedroom, sofa bed, bathroom, kitchen and address **901 Hidden Ridge Way**. [FAQ](https://banffhiddenridge.com/faq/) qualifies parking as first come, first served, limits pet acceptance to selected rooms with prior confirmation, and lists **Banff local** Roam passes. A private-hot-tub category is not extended to every unit. No fixed shuttle timetable, universal pet acceptance or access guarantee is invented.

### Blackstone Mountain Lodge, Canmore comparison

The [official Two Bedroom Suite](https://www.blackstonelodge.ca/rooms/two-bedroom-suite) provides a sourced Canmore alternative with full kitchen, in-suite laundry, separate bedrooms and two bathrooms. It is linked through its official source and existing reviewed hotel profile; **no new Vrbo listing, ID or affiliate target is invented**. Its [FAQ](https://www.blackstonelodge.ca/faq) says no hotel shuttle and no purpose-built accessible rooms or accessible bathing fixtures. The page makes those material limitations visible and requests an exact category/access/transport check.

## Location, transport and local accommodation rules

- [Town of Banff Accessory Guest Accommodation requirements](https://banff.ca/bedandbreakfast) state that visitor rooms in residential properties need the approved permit and a live-in owner present during guest stays. This is distinguished from managed commercial suite properties. The guide does not declare every platform listing legal or illegal, or certify any imported unit.
- [Canmore accommodation types](https://www.canmore.ca/your-community/planning/accommodation-types) distinguish visitor accommodation, tourist homes and residential dwellings. [Town short-term rental licensing guidance](https://www.canmore.ca/public/download/files/331587) requires appropriate licensing for units and visible licence numbers online. Platform presence alone is not a municipal approval check. No universal claim that every Canmore dwelling can be rented to tourists is made.
- [MD of Bighorn's Harvie Heights page](https://www.mdbighorn.ca/165/Harvie-Heights) identifies the separate hamlet. The guide directs visitors to check the exact unit, manager and applicable local approval instead of applying Banff or Canmore's rules to it. It avoids treating a draft land-use document as a current permit decision.
- [Roam's routes](https://roamtransit.com/schedules-routes/) and [Canmore–Banff Route 3](https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/) establish that regional transit and local/resort connections are distinct. [SkiBig3's shuttle information](https://www.skibig3.com/ski/ski-shuttle/) is the source for checking current eligibility/stops. No imported rental is assigned an unverified shuttle stop, a universal free journey, a departure time or a guaranteed transfer.
- Suggested party/layout, meal, arrival and transport checks are editorial planning advice. Filters do not grant admission, establish terrain safety, reserve facilities or confirm a room's current eligibility.

## Data and page contract

`rentals` still exports 50 stable slug/name/ID records. The visible import contract uses `importedSleeps`, `importedBedrooms` and `importedBathrooms`, each nullable; raw `type` and `area` are nullable. `verificationStatus` is always `historical-provider-import`, `providerDetailsCheckedOn` is null, and `lat`/`lng` are null with unavailable status. Removed review/rate/badge/generated-description fields must not be used by consumers. Repository search found only the assigned rental page consuming this module.

`rentalPlanning.ts` separately supplies four base guides, four operator/category examples, primary sources and their review date. The base/room/transport planner filters those examples; imported-list filters use only clearly labelled stored fields. Missing counts are excluded from minimum filters and can be selected explicitly. The old capacity buckets, which could exclude larger units for a smaller party, are gone.

No-JavaScript users receive complete content, source links and provider CTAs. Unusable controls stay hidden until the actual script initializes. Native labelled inputs/selects, minimum 44px controls, visible focus outlines, reset buttons, empty-state help and polite result counts support keyboard and small-screen use. The map was removed because no sourced unit coordinates exist; no fake replacement pins are offered.

## Focused verification

Run `node research/check-rental-planning-2026-10-29.mjs` from this checkout. Initial result: **352 assertions passed**, including all 50 affiliate targets/parameters, pinned identity digest, absence of unsupported fields or points, nullable missing data, safe target validation, current-source shortlist references, combined/unknown/minimum-count filters, planner modes, base-to-list jumps, reset, valid/invalid URL parameters, internal page links, SSR/no-JavaScript structure and pre-CTA disclosure. Astro source transformation reports **zero diagnostics**. A focused TypeScript `tsc --noEmit` check of the two data modules passed. These checks execute the real client script in a controlled DOM and inspect source/data; they are not a full build, rendered-browser or live booking test. Root owns release integration and production verification.
