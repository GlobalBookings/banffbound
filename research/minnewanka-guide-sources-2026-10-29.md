# Lake Minnewanka guide full review — October 29, 2026

## Scope and integration contract

Author-owned new files only:

- `src/data/minnewankaGuideOverrides.ts`
- `scripts/check-minnewanka-guide.mjs`
- this source record

The only body/metadata key is `lake-minnewanka-guide`. Keep its canonical URL and original **2026-02-18** publication from `originalBlogPosts`; this review supplies `lastUpdated: 2026-10-29`, a new title/description/read time and an explicit illustrative-hero qualification. It does not verify the existing photograph's place or conditions. Exports are `minnewankaGuideOverrides`, `minnewankaGuideMetadata`, `minnewankaGuideFaqs` (one five-item array), and `reviewDate`. One renderer produces both the visible FAQ details and FAQPage JSON-LD from that array.

Root owns registry/metadata/page/sitemap/CI integration. No existing lake, trail, town, hotel, affiliate, layout or original-body source was modified. No site build, Git, hosting, account or merchant writes were performed. No new merchant/product ID was introduced. Accommodation uses the existing `/book/banff-hotels/` journey with a local commission disclosure; cruise information links directly to the operator, without representing an offer or available departure.

The editorial purpose is a useful winter **land-based** visit, with a positive sequence (choose the day, confirm travel, enjoy the designated visitor area, return for a Banff meal). The guide separately explains when a named walk or seasonal water trip needs more planning. It does not equate an equipment list, short distance, easy summer grade, seasonal calendar or published attraction programme with suitability or permission today.

## Primary sources checked

All source reading was on October 29, 2026. These are factual scope references, not a persistent live-status feed.

| Primary page | Use in this review |
| --- | --- |
| [Parks seasonal closures](https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures) | Western Minnewanka road driving closure: November–May, wildlife-corridor purpose; no exact annual gate-opening date inferred. |
| [Banff & Lake Louise Tourism: driving the loop](https://www.banfflakelouise.com/experiences/drive-the-minnewanka-loop) | Remaining road access during that closure; eastern Two Jack approach, rather than a winter circuit. |
| [Parks important bulletins](https://parks.canada.ca/pn-np/ab/banff/bulletins) and [Alberta 511](https://511.alberta.ca/) | Reader handoffs for current restrictions and road reports. No individual road segment is declared open by this review. |
| [Roam Route 6](https://roamtransit.com/schedules-routes/lake-minnewanka-route-6/) | Summer-only service, ended October 4, 2026. The guide points to the next published season rather than promising winter transit or a hotel transfer. |
| [Parks winter walking: Banff](https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff) | Stewart Canyon winter listing: 1.5 km one way, day-use kiosk trailhead and icy-surface caveat. |
| [Parks detailed hiking profiles](https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking) | The distinct 1.6 km one-way Stewart hiking profile, surface/bridge description and separate longer Aylmer routes. |
| [Parks Minnewanka seasonal trail restriction](https://parks.canada.ca/pn-np/mtn/ours-bears/gestion-management/ours-bears/minnewanka) | July 10–September 15 boundary beyond Stewart Canyon Bridge and on Aylmer trails; group, bear-spray, dog/cycling restrictions. Link supplies full spacing rule/map. |
| [Parks natural-ice guidance](https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating) | Natural ice is unmonitored and hazards are unmarked. No ice-thickness threshold, frozen-month inference or on-ice activity recommendation reproduced. |
| [Cruise operator location/hours](https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/location-hours/) | Ticket office, rentals and Black Anchor marked closed for the 2026 season; the live page has moved to a 2027 programme. |
| [Cruise operator homepage](https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/) | Different product/rental choices, future dates qualified by weather. No universal duration or included journey/meal inferred. |
| [Parks water-activity order](https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429) | Issued April 15, 2026, effective April 1 until further notice; Minnewanka Special Tactics Zone and specific exceptions. The generic old page-footer modification date is not the order's issue date. |
| [Parks water activities](https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports) | Equipment/certification and motorboat inspection/launch distinctions. Appointment lead time is 48 hours; no public boat docks. No universal drying interval paraphrased. |
| [Parks motorized-watercraft order](https://parks.canada.ca/pn-np/ab/banff/bulletins/731c33db-ab1a-4cfb-a3e2-f123d364c877) | Ballast-system prohibition illustrates why inspection alone is not the complete boat rule. |
| [Parks fishing regulations](https://parks.canada.ca/pn-np/ab/banff/activ/peche-fishing) | Minnewanka reservoir's May 16–September 7, 2026 season and national-park permit distinction; no winter fishing substitute or future-year season invented. |

## Route and status boundaries

`lakePlanning.ts` already correctly gives Minnewanka a view/shore planning scope and prohibits inference of complete winter-loop or lake-ice access. Its water rule already distinguishes prohibited personal paddlecraft from the specified motorboat and lakeshore-rental exceptions. It remains unchanged. The new guide links `/lakes/` and `/lake-faq/` for those related decisions.

`hikingSourceReviews` already correctly reviews `stewart-canyon`, `aylmer-lookout` and `aylmer-pass` as **summer hiking** profiles. Stewart's 1.6 km source figure must not be overwritten by the separately published 1.5 km winter walking description. The winter page's avalanche warning beside Sulphur Mountain is **not** attributed to Stewart Canyon. The guide does not assign a route-specific avalanche classification, directions or clearance to the Aylmer routes; longer winter travel requires a separate assessment.

The [canonical current trail report](https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions) timed out through the research tool. It remains a reader handoff, not a source for any assertion that a trail is open today. Search results contained older September closure reports; the current Parks bulletin index did not list a corresponding active Minnewanka trail closure at the check. Neither observation is sufficient to declare a route open or closed, so no such present-tense claim was authored. The annual bear restriction's end is explicitly not treated as winter clearance.

## Inherited claims removed by the replacement

The replacement drops fabricated personal visits, guaranteed wildlife/viewing patterns, fixed travel and parking promises, a universal 1.5-hour full-length cruise, generic family/access guarantees, a year-round road/complete-loop implication, a casual indefinite shoreline hike, diving/boat-fuel service assertions, trophy-fish claims, winter ice fishing and cross-country travel on the lake. It does not repeat the old assumption that every summer activity is available together. Seasonal boat/rental and food information is dated, and personal-paddling restrictions are made explicit rather than concealed behind generic clean-drain-dry advice.

## Focused verification

Run `node scripts/check-minnewanka-guide.mjs` from the repo. The check bundles only in memory, without a site build or network access. It verifies the exact single canonical slug; original publication; review/illustrative metadata; valid HTML; complete no-JS plan and table; five exact visible/FAQPage Q/A pairs; unique in-page targets; 16 primary-source links; 14 actual internal route handoffs; no invented offer/rating/product schema or merchant IDs; decision-changing road, ice, seasonal-service, fishing, bridge and water-zone distinctions; and consistency with the existing reviewed lake/trail contracts.

Result: **passed** on October 29, 2026. Root still needs the shared registry integration, final site build and rendered release verification.
