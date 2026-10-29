# Town stay and transport improvements — 29 October 2026

## Scope and dates

Changed only `src/data/towns.ts`, `src/pages/towns/[slug].astro`, new `src/data/townStayPlanning.ts`, new `scripts/check-town-stay-planning.mjs` and this record. No hotel record, property identity, provider URL, image, coordinate, paid landing, shared configuration or tracking change.

The six town guides retain **Guide researched 28 October 2026**. Their shared stay/transport journey now has a separate **updated 29 October 2026** date. This is a real partial change on all six routes: Banff and Lake Louise gain the existing booking comparisons; Canmore gains the comparison/seasonal transport correction; Golden and Kananaskis gain their actual resort handoffs; Field/Yoho explicitly explains that the Banff three-resort planner does not establish a Field/Emerald connection. It is not a new whole-guide or whole-hotel review. Each reused hotel's earlier operator-fact date remains visible, including Blackstone's 28 October date.

The frozen directory has 49 selected-fact profiles, one location-only record and two former-name histories (52 index-eligible records), with 43 legacy leads awaiting review. This work adds no hotel reviews. Six selected-fact examples are used; Boundary's location-only record is explained separately and never included in room matches.

## Primary transport and geography evidence

Sources were read on 29 October 2026. Timetables are dated evidence, not a promise for a later season. No fares, fixed travel times, available rooms or booked connections are inferred.

| Source | Evidence used and limit |
| --- | --- |
| [Roam Route 12 current route page](https://roamtransit.com/schedules-routes/canmore-local-route-12/) | Current fall/winter route is downtown Canmore–Palliser Lane. The page also carries temporary downtown stop changes. The guide tells visitors to check the actual stop and return rather than permanently copying a temporary stop or time. |
| [Roam 2026 fall/winter service changes](https://roamtransit.com/2026-fall-and-winter-schedule-changes/) | Article dated 30 September 2026 describes the service change starting 28 September: Route 12 serves downtown and Palliser Lane in AM/PM service. Its summer Nordic Centre/Grassi Lakes leg is not a winter connection. The winter Nordic suggestion now requires a separately confirmed outbound/return before the lesson/rental is booked. Other routes' dates in this article are outside this change. |
| [Published 2026 summer Route 12 timetable](https://roamtransit.com/wp-content/uploads/2026/04/2026-Route-12-Schedule-Summer.final_.pdf) | The summer timetable includes Canmore Nordic Centre and Grassi Lakes. The summer filter explicitly calls this **published 2026** service and asks for the actual date/season/stop/last return; it does not guarantee next summer's service. No individual departure time is copied. |
| [Roam Canmore–Banff Route 3](https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/) | Regional Canmore–Banff transit is a separate leg from resort ski buses. A town hotel or hamlet label does not establish a particular property pickup. |
| [Alberta Parks Canmore Nordic Centre](https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/) | The official park page links trail reports, lessons/rentals and facility information. The guide requires a current trail report, opening hours, the appropriate lesson/rental equipment and ski-trail pass; it does not certify a route or snow condition. |
| [Alberta Kananaskis Conservation Pass](https://www.alberta.ca/kananaskis-conservation-pass) | Vehicle parking in the applicable parks/public lands and Nordic facility requirements are separate. The driving note asks for both checks and does not substitute a Banff pass. No price is copied; the municipal Canmore/exemptions questions remain with the official source. |
| [MD of Bighorn hamlets](https://www.mdbighorn.ca/160/Hamlets-Open-Ranching), [municipal wards](https://www.mdbighorn.ca/476/Wards) | Dead Man's Flats and Harvie Heights are separate Bighorn hamlets, not downtown Canmore or Banff town. [Official municipal Harvie Heights planning document](https://www.mdbighorn.ca/DocumentCenter/View/5039) places Harvie Heights near the eastern Banff entrance. No accommodation licensing inference is made. |
| [Copperstone official contact](https://www.copperstoneresort.com/contact-us) | Publisher address is 250 2nd Avenue, Dead Man's Flats. It is presented as a separate hamlet/road base, with groceries and complete transport legs to arrange. No shuttle or local bus stop is invented. |
| [Malcolm official site](https://www.malcolmhotel.ca/) | Publisher identifies its Spring Creek Canmore setting, town connection and current nearby construction notice. No fixed walking time, disturbance guarantee or next-season construction status is copied. |

## Reused operator-fact scopes

These six profiles were already source-reviewed in the frozen hotel ledgers. This comparison adds original room/base tradeoffs; it does not freshen their review dates or generalise a specific category to every room. Existing internal profiles expose the source scope and current confirmation notes.

| Existing slug / retained date | Exact distinction used | Existing primary sources |
| --- | --- | --- |
| `lamphouse-canmore` / 29 October 2026 | Ordinary King/Double Queen versus the multi-level three-bedroom Apartment, kitchen/laundry/bathrooms, stairs and Apartment pet restriction. Dog-friendly King is a separate category. Downtown 610 8 Street. | [Property](https://basecampresorts.com/lamphouse/), [Apartment](https://basecampresorts.com/room-details/lamphouse-apartment/), [dog-friendly King](https://basecampresorts.com/room-details/basecamp-lamphouse-canmore-king-room-dog-friendly/), [address](https://basecampresorts.com/contact/lamphouse/) |
| `malcolm-hotel` / 29 October 2026 | Premium Double Queen has balcony, wet bar/mini-fridge and category-specific no-pets restriction; this is not a full kitchen. Spring Creek address and nearby construction notice. | [Property/current notice](https://www.malcolmhotel.ca/), [named room](https://www.malcolmhotel.ca/Stay/rooms/malcolm-premium-double-queen) |
| `basecamp-lodge-canmore` / 29 October 2026 | Micro Suite with Kitchen versus standard rooms, exact full-kitchen appliances and no-pets restriction. Lodge at 1002 Bow Valley Trail is distinct from Basecamp Resorts. A requested spa shuttle is not an airport/ski transfer. | [Lodge](https://basecampresorts.com/canmorelodge/), [Micro Suite](https://basecampresorts.com/room-details/canmore-lodge-micro-suite-with-kitchen/), [Lodge address](https://basecampresorts.com/contact/canmorelodge/) |
| `blackstone-mountain-lodge` / **28 October 2026** | Hotel-room mini-fridge versus suite full kitchen, reviewed two-bedroom laundry, no hotel shuttle and specific mobility confirmation. 170 Kananaskis Way is Canmore, not Kananaskis Village. | [Official FAQ](https://www.blackstonelodge.ca/faq); retained source scope in `research/winter-hotel-sources-2026-10-28.md` |
| `stoneridge-mountain-resort` / 29 October 2026 | One-, two- and three-bedroom suite categories with kitchens/laundry; exact beds/baths require category confirmation. 30 Lincoln Park is Canmore. Operator airport information uses a Coast Hotel stop, requiring a final property connection. | [Facilities](https://www.stoneridgeresort.ca/amenities/), [address/transport/FAQ](https://www.stoneridgeresort.ca/contact-us/) |
| `copperstone-resort` / 29 October 2026 | Reviewed one-/two-bedroom suites with kitchen/living/laundry, exact layout required. Dead Man's Flats address; no assumed property shuttle/local route. | [Property](https://www.copperstoneresort.com/), [contact/address](https://www.copperstoneresort.com/contact-us) |

Boundary's separately linked `banff-boundary-lodge` profile retains its 28 October **location-only** scope: [condominium-management source](https://peka.ab.ca/client-portal-condo/boundary) documents 1000 Harvie Heights Road. Current unit facilities, operator and a property-wide offer are not verified. It has no card or kitchen match in the six-example comparison.

The underlying room facts and source scopes remain documented in `research/hotel-directory-claim-audit-2026-10-29.md`, `research/hotel-regional-quality-sources-2026-10-29.md` and the prior hotel source records. No new merchant-identity verification is claimed here.

## Destination and operator handoffs

- Banff links to the existing `/book/banff-hotels/` comparison and Lake Louise to `/book/lake-louise-stays/`. These are internal room/location comparisons with their own checked property links, not new hotel offers or provider URLs.
- Golden links to [Kicking Horse snow school](https://kickinghorseresort.com/purchase/telus-winter-snow-school/) and [official arrival information](https://kickinghorseresort.com/discover-kickinghorse/getting-to-kicking-horse-mountain-resort/). The guest must match town/mountain address, lesson meeting point, rental collection and actual return. No age eligibility, departure time or admission promise is inferred.
- Kananaskis links to [Nakiska winter sports school](https://skinakiska.com/purchase/telus-winter-sports-school/) and [official arrival information](https://skinakiska.com/discover-nakiska/getting-to-nakiska/). The latter publishes road and bus information, but a current date, stop and return remain separate checks. No fixed drive time, operator fare or universal hotel pickup is copied.
- The Banff three-resort ski planner handoff is restricted to Banff/Canmore/Lake Louise. Golden/Nakiska use their own operators; Field/Yoho explicitly requires a separately confirmed complete journey.
- The six existing destination Expedia search URLs and `camref=1101l3MtWX` are unchanged. They remain labelled **Search [area] stays on Expedia**, with visible affiliate disclosure and `rel="noopener sponsored"`. The Canmore examples link to the internal reviewed profiles; the model adds no merchant URLs.

## Interactive and no-JavaScript contract

The Canmore section renders six complete cards, area explanations, two separate hamlet notes, the winter journey checklist, all source links and a location-only Boundary explanation without JavaScript. The form is hidden until its actual script initializes. It uses labelled native selects, a reset button, visible focus styles, at least 46px control height and a polite atomic result count. Cards become one column on narrow layouts.

Stable section/control IDs: `canmore-stay-comparison`, `canmore-stay-form`, `canmore-priority`, `canmore-season`, `canmore-transport`, `canmore-filter-purpose`, `canmore-stay-count`, `canmore-stay-notes`, `nearby-hamlets`. Card marker is `data-canmore-stay-id`, profile link marker is `data-canmore-profile`. Boundary is `data-source-scope="location-only"`. Cross-journey markers are `data-town-booking-comparison`, `data-town-resort-lessons`, `data-town-resort-arrival`; the existing source section remains `official-sources` and each town retains its two FAQs.

`buildCanmoreStayPlan` filters only by priority: all = six, town walking = Lamphouse/Malcolm, full cooking = the other five named kitchen categories excluding Malcolm, regional road = Copperstone. **Season/transport alter practical journey notes, not room availability, safety, admission, accessibility, pickup eligibility or hotel ranking.** Defaults are all/winter/transport undecided. Invalid or duplicate URL fields fall back to those defaults. Query keys `town_priority`, `town_season`, `town_transport` preserve unrelated query parameters and the fragment; season `unsure` is retained because it differs from the winter default. Reset clears only those three comparison keys. There is no local storage, fetch, booking automation or added analytics event.

## Focused verification and frozen foundation

`node scripts/check-town-stay-planning.mjs` passed. It exercises the real model and actual template script: six reviewed profiles and inherited dates; 36 bounded priority/season/transport combinations; category counts; winter/summer Route 12 semantics; invalid/duplicate URL input; actual filtering/count/notes/reset/reload; undecided-season persistence; preserved unrelated query/fragment; blocked History API; idempotent initialization; missing form on other town pages; SSR/control/source/operator/affiliate contracts; and an Astro compiler transform. Separate targeted TypeScript checking passed. No full build or network is performed by this check.

The check also verifies the 95-record inventory and hashes of the four frozen hotel files:

```
src/data/hotels.ts                                      2fff1117432d359cfdfea771c5e36153dbf37107e9609e7d5430a7bd9eb34e48
src/data/hotelDirectory.ts                              bba710c243ef3cd64256e51adb8d54898bf200bc0db8090c5b21b197ed44492f
src/pages/hotel-directory/index.astro                   1125c296d95b40f218c4dad2f2a7af9dbbfc861bdd8a65677be7ba60a396dacf
src/pages/hotel-directory/[slug].astro                  c5c80421cb748a2307520e698e128887f23c10c825a4cd51fa7b81c93d151b9d
```

Root owns the final site build, browser QA, production verifier and sitemap dates. This source check is not a deployment receipt or a live operator/room check.
