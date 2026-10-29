# Wellness and winter warm-up review — 28 October 2026

## Exact bounded scope

Edited only `src/pages/wellness.astro`; created `src/data/winterWarmUpOverrides.ts` and this note. Root owns the shared content/metadata/config integration. No fetchers, existing data modules, hotel records, shared components or build outputs were changed.

Existing relevant canonical slugs inventoried:

- `banff-hot-springs-guide` — rewritten, including dated maintenance notice, in-person admission, pool versus park admission, correct separate destination, water supply nuance, accessibility and alternatives.
- `cave-and-basin-guide` — rewritten, including heritage versus bathing distinction, Indigenous context, current winter days and closure blocks, indoor/outdoor limits, access and actual transfer planning.
- `banff-wellness-weekend` — rewritten, replacing a fixed hot-pool/spa/long departure-day itinerary with separate flexible choices and conditional guest/treatment access.
- `banff-hot-springs-history` — not edited; concrete follow-ups below.
- `banff-wellness-retreats` — not edited; concrete follow-ups below.

The wellness landing page removes obsolete rates, made-up guaranteed tour pickup, generic medical benefits, unconditional spa/day access, blanket year-round accessible-walk claims and promises that Upper Hot Springs is always operating. It now distinguishes bathing, booked spas and cultural breaks, with a native choice selector, source links, dated closures and four visible FAQs generated from the same data as its FAQPage schema.

## Current notices, checked directly

### Upper Hot Springs

- https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs
- https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/heures-hours

Both still display the annual maintenance closure from October 13 to early November. There is no exact confirmed reopening date. General daily hours below a closure banner are not evidence that the pool has reopened. All new copy preserves that uncertainty and review date.

The facility uses in-person, first-come admission. No online advance tickets or reservations are available. It is on the Mountain Avenue/Sulphur Mountain outing, separate from the gondola and from Cave and Basin on Cave Avenue.

### Kananaskis spa

- https://knordicspa.com/
- https://knordicspa.com/transformation-journey/ (the former `/transformation/` URL redirects here)
- https://knordicspa.com/faq/

At review the home/FAQ banner says closed October 13 through 30; the transformation page banner says October 13 through 29 and its body announces October 30 reopening as **Yora Nordic Spa Kananaskis**. New copy does not resolve that discrepancy by inventing an actual reopening; it says to confirm operation, available facilities and the reservation directly. The announced name is included alongside Kananaskis Nordic Spa so readers can recognise the operator.

The operator's FAQ describes adults-only 18+ access, arrival-time booking arrangements, no re-entry, optional walk-in access depending on availability, and stairs to pools, bistro and other outdoor facilities. New copy does not claim reservations are universally mandatory, that every new element is open, or that the whole site is step-free. It asks about access after the works. The location is behind Pomeroy Kananaskis Mountain Lodge in Kananaskis Village, with a separate Highway 1/Highway 40 journey from Banff.

## Other primary sources

| Source | URL | Application |
| --- | --- | --- |
| Upper Hot Springs FAQ | https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/faq | Admission, lockers, rental availability, children, park pass and facility guidance; no rates copied |
| Upper Hot Springs accessibility | https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/accessibilite-accessibility | Uphill main-lot approach, accessible spaces, elevator size limits, ramps, changing facilities and aquatic wheelchair request/availability |
| Upper Hot Springs water | https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/debit-flow | Seasonal flow, possible municipal-water supplementation and winter heating; no untouched-spring promise or therapeutic claim |
| Cave and Basin main page | https://parks.canada.ca/lhn-nhs/ab/caveandbasin | Indigenous significance continuing today, exhibits/films and 311 Cave Avenue location |
| Cave and Basin hours | https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours | Winter Thu–Mon 11–5, Christmas Day closure, Dec 14–17 2026 and March 15–18 2027 closure blocks, changeable hours |
| Cave and Basin visit planner | https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit | Two-to-three-hour fuller-site planning allowance and facilities; no assumed fixed visit length |
| Cave and Basin trails | https://parks.canada.ca/lhn-nhs/ab/caveandbasin/activ/sentiers-trails | Upper/lower boardwalks and separate longer trails; check conditions rather than assuming winter access from a summer description |
| Parks Canada hot springs overview | https://www.parks.canada.ca/voyage-travel/experiences/sources-springs | No swimming at Cave and Basin, conservation context, accessible parking/elevator/ramps |
| Fairmont wellness | https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs/wellness.html | Spa 18+; facility access linked to eligible massages/facials/body treatments; salon services differ; reservations and current guest eligibility must be checked |
| Fairmont resort pools | https://www.banff-springs-hotel.com/wellness/resort-pools/ | Aquatic pools and spa thermal experience differ; non-guest/seasonal access restrictions vary, so no unconditional day pass promise |
| Fairmont contact | https://www.banff-springs-hotel.com/contact-us/ | 405 Spray Avenue address |
| The Whyte visit page | https://www.whyte.org/visit | Indoor art/heritage alternative at 111 Bear Street, current exhibitions and holiday closures; no assumed holiday opening or copied admission rate |

## Concrete follow-ups left outside scope

### `banff-hot-springs-history`

The existing body says Upper Hot Springs “remain open for public bathing” and “open year-round” without the present maintenance exception. This contradicts the current dated closure. It also says natural spring water heats the pool without the supplementation/heating nuance supplied by Parks Canada. The exact historic bathing closure year, spring-snail distribution claims and quotations need a separate source audit; they were not verified merely because the operational guides were rewritten.

### `banff-wellness-retreats`

The existing body places **Red Earth Spa at Moose Hotel**. The direct operators identify Red Earth at Banff Caribou Lodge, 521 Banff Avenue (https://redearthspa.com/ and https://banffcariboulodge.com/spa/), while Moose hosts **Meadow Spa & Pools**, 345 Banff Avenue (https://moosehotelandsuites.com/meadow-spa/ and https://banffmeadowspa.com/). The existing text also asserts mandatory Kananaskis reservations, whereas the current FAQ says advance booking is highly recommended and describes availability-based walk-ins. It omits the current closure/name transition and age restrictions, makes unsupported “single best”/nearly-empty-pool claims, and treats particular hotel spa facilities and generic classes as available without checking current products.

These are recorded follow-ups, not claims that either legacy body was fixed in this pass. The new landing page does not link them as its practical booking guides.

## Integration and verification

- Module exports `winterWarmUpOverrides: Record<string,string>` and `winterWarmUpMetadata` with `title`, `description`, `lastUpdated`, `readTime` for the three existing slugs.
- Add the content after legacy modules, apply metadata to the shared `allBlogPosts` merge, and include these actually reviewed slugs in the reviewed-date sitemap logic.
- Review date is `2026-10-28`. It is not a live pool, spa, transit or trail timestamp.
- Existing Expedia `camref=1101l3MtWX` appears only on disclosed hotel searches with `rel="noopener sponsored"`. Such searches do not reserve bathing, spa services or attraction admission.
- Static checks confirm existing blog/town slugs, local hero image availability, paired structural tags and affiliate attributes. The landing FAQs and schema use the same source array. No site build or publishing was performed.
- Root should complete rendered/phone checks for the selector, FAQ/schema, dates, content precedence and final link audit after integration.
