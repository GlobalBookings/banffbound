# Dining source review — October 29, 2026

## Scope, inventory and prepared status

The raw inventory has **27 restaurants and 5 drink venues, 32 unique slugs**. Restaurants are grouped as13 Banff, 6 Lake Louise, 6 Canmore and 2 Highway 1A / Castle Junction. This batch checked all14 existing non-Banff restaurant identities after starting with the five priorities in `next-dining-and-heli-review-plan-2026-10-29.json`. It did not invent a Post Hotel entry or change the raw inventory.

Owned files: `src/data/restaurantSourceReviews.ts`, `scripts/check-restaurant-source-reviews.mjs`, and this record. Root separately authored `banffDiningSourceReviews.ts` for13 Banff restaurants and5 drink venues, and owns page integration. No raw record, hotel data, existing page, account, booking, external message, Git or hosting was changed by this author.

The local 14 contain **12 selected-fact reviews and 2 pending entries** (PD3 and Trailhead). Root's 18 plus these 14 produce **30 selected-fact entries and 2 pending**, not 32 complete factual or operational reviews. “Details checked” means the stated fields and scope only; it does not mean open, available, suitable for a diet/access need, licensed or recommended by personal experience. The Station has a sourced closure, despite selected identity/location facts.

Raw `src/data/restaurants.ts` SHA256 at the check: `b0fca09bd1de188193c40b4b0803b1209a5e33cdbad5243129fb701728371367`.

## Primary evidence and material corrections

All checks below were made October 29, 2026. Operator pages can change after this dated review. No fixed hours, numerical prices, price bands, ratings, guest quotes or current availability are projected.

| Retained slug | Checked source and resulting scope |
| --- | --- |
| `the-alpine-social` | [Chateau Alpine Social](https://www.chateau-lake-louise.com/dine/alpine-social/): at111 Lake Louise Drive in the lakeside hotel; dining contact403-522-1817. Summer walk-in/in-house priority wording remains seasonal. Exact October 26–29, 2026 registered-overnight-guest-only hotel/dining notice retained as dated notice, not permanent exclusivity. |
| `blake-brewpub` | [BLAKE contact](https://www.blakecanmore.com/contact), [menus](https://www.blakecanmore.com/blake-menu), [publisher home](https://www.blakecanmore.com/): BLAKE Brewhouse & Distillery,810 Bow Valley Trail,403-675-3663; ordinary first-come seating and separate functions. Imported Main Street address, phone and unrelated beer brands omitted. Contact hours and a late menu link differ; no fixed kitchen schedule inferred. |
| `the-iron-goat` | [Iron Goat operator](https://www.irongoat.ca/):703 Benchlands Trail,403-609-0222, pub/grill menu and linked reservation route. Main Street and rooftop assertions not carried forward. Exact operator-linked [TouchBistro route](https://www.tbdine.com/book/restaurant/the-iron-goat?idApp=100&language=en-us) preserved. |
| `baker-creek-bistro` | [Baker Creek publisher](https://basecampresorts.com/bakercreek/) and [arrival essentials](https://basecampresorts.com/bakercreek/arrival-essentials/): current Creekside Café/main-office café with grab-and-go breakfast/lunch/snacks. No fine-dinner expectation or historical closure/changeover date invented. Property and front-desk numbers differ by page; no dedicated café phone is asserted. Arrival page's Sundance title is a template inconsistency; its Baker Creek body/address/café section is the bounded evidence used. |
| `pd3-by-blake` | [BLAKE publisher](https://www.blakecanmore.com/), [menu](https://www.blakecanmore.com/blake-menu), [contact](https://www.blakecanmore.com/contact): current separate PD3 identity, pizzeria format, address and service remain unresolved. Related BLAKE enquiry is explicitly labelled; no substitution of BLAKE's address or phone and no closure claim. Third-party/older mentions were not promoted to current operator facts. |
| `lake-louise-station` | [Station operator contact](https://www.lakelouisestation.com/contact):200 Sentinel Road and extended renovation closure under new ownership. No reopening date established. Its later-in-2026 update wording is not a reopened report. Menu, reservation and old phone are withheld; prominent dated review notice supplied. |
| `fairview-dining-room` | [Current Fairview Bar & Restaurant page](https://www.chateau-lake-louise.com/dine/fairview-bar-restaurant/): current name,111 Lake Louise Drive,403-522-1817, menu, guest priority and direct dining enquiry. Same exact October26–29 hotel-access notice. No universal public admission or fixed service timetable. |
| `walliser-stube` | [Walliser Stube operator](https://www.chateau-lake-louise.com/dine/walliser-stube/): lakeside-hotel dinner identity/menu,111 Lake Louise Drive,403-522-1817 and guest priority. Same exact date-specific hotel-access notice. |
| `trailhead-cafe` | [Official destination listing](https://www.banfflakelouise.com/business/trailhead-cafe) confirms its listed name and Samson Mall location. Its linked [operatorFacebook](https://www.facebook.com/lakelouiseAB) could not be fetched. Pending operational/contact/menu verification: no guessed domain, phone, fixed service or closure claim. Tourism source is explicitly distinguished from a verified current operator page. |
| `bill-peytos-cafe` | [Reachable current HI hostel page](https://www.hihostels.ca/en/hostels/hi-lake-louise): on-site café meals/drinks at203 Village Road, general hostel contact403-522-2201. Its Viewmenus link still led to `/en/about/hostels/bill-peytos-cafe`, which returned 404. No dead menu CTA or cached old hours/takeout/reservation policy promoted. Phone is described as hostel general enquiries. |
| `tavern-1883` | [Operator](https://tavern1883.com/) and [dine-in/pickup menu](https://tavern1883.com/menu/):709 9th Street,403-609-2000; larger-group reservation requests depend on the day; stated minors-until 10 pm limit. Incomplete weekday schedule and promotions not projected. |
| `crazyweed-kitchen` | [Operator contact](https://www.crazyweed.ca/contact) and [menu](https://www.crazyweed.ca/menu):1600 Railway Avenue,403-609-2530; dining-room reservations, separate first-come patio/bar and group enquiries. [Native table route](https://www.tbdine.com/canmore/restaurants/crazyweed-kitchen?language=en-us) preserved. No price or dietary-safety guarantee repeated. |
| `the-drake-canmore` | [Current publisher](https://www.drakecanmore.ca/), [restaurant contact](https://www.drakecanmore.ca/contact), [menus](https://www.drakecanmore.ca/menus): Drake Screaming Retriever Restaurant & Brewery at909 Railway Avenue; restaurant phone403-675-2206, separate from inn contact. Exact [operator-linked reservation](https://www.opentable.ca/r/the-drake-pub-canmore) preserved. Conflicting noon/11am wording not copied; late bar operation does not establish food or event admission. |
| `storm-mountain-lodge` | [Cuisine](https://stormmountainlodge.com/cuisine/) and [contact](https://stormmountainlodge.com/contact/): actualHighway 93 South destination aboveCastle Junction, dinner-only indoor room with reservations required,403-762-4155. Cuisine and seasonal contact weekdays conflict, so confirm the actual date. Exact [operator-linked Libro route](https://widgets.libroreserve.com/WEB/QC016588618315/book) retained; widget fetch failed and no availability was tested. Highway 1A remains only the legacy regional browse group; actual road is explicit. |

Other non-operator listings, cached searches or map-looking URLs were not used to establish a current reopening, exact entrance, photograph, licence or surveyed coordinate. The unrelated Post Hotel search result was excluded because there is no such raw record in this inventory.

## Frozen rendering API

`restaurantSourceReviews` contains the14 local records above, with the exported `DiningSourceReview` interface shared by root's Banff module. `buildDiningDirectory(additionalReviews={})` returns `{restaurants,drinkSpots,venues}`. Call it with `banffDiningSourceReviews` for the combined 32. `projectDiningVenue(raw,kind,additionalReviews={})` provides the same per-record projection; the local 14 take precedence for their own slugs. Additional unknown slugs do not create records.

Default `directoryRestaurants`, `directoryDrinkSpots`, `directoryDiningVenues` expose the local review scope only: 12 selected-fact, 2 pending and 18 unreviewed. `getDirectoryRestaurantsByArea(area,additionalReviews={})` supports the combined view. All paths preserve raw slug, kind and order. `importedName` retains the original label separately from a corrected display name. Area is a regional browse group, not an exact street address or map point.

Projected fields are rendering-ready: nullable address/phone/website/menuUrl/reserveUrl, selected description/type/cuisine/highlights, `serviceNote`, `journeyNote`, dated `notices[]`, related `enquiryLinks[]`, and `sourceReview {status,label,checkedOn,scope,sources,notes}`. Selected-fact label is **Details checked**; pending/unreviewed label is **Check details**. No raw operational fallback is used. Source scope and notices must remain visible enough to distinguish a closure or partial check from an active meal recommendation. In particular, Station must have its closure notice and no active Menu/Reserve CTA.

Hours, priceRange, image, lat and lng are always null. Image and coordinate provenance state that the imported values were not verified. Neither Unsplash nor an apparently official image host proves photo identity or licence; neither a street address nor a Google Maps-looking value proves precise GPS, an entrance or accessible route. Text-card rendering needs no universal image warning because the images are withheld. No Restaurant/openingHours/geo/rating/offer schema is provided by this module.

Unknown venues retain a discovery name/area and plain checking guidance, with no unsupported operational or contact fields. A separate review can be supplied through the same typed factory without mutating the raw arrays. Root's 18 provide that complementary scope; this module does not declare the raw 32 fully reviewed.

## Focused verification

`node scripts/check-restaurant-source-reviews.mjs` passed October 29, 2026. It verifies local 14 membership/status, combined30 selected / 2 pending, all 32 slugs/kinds/order, exact raw 27 + 5 preservation, native URLs and nullable fields, sourced Station closure with no menu/reserve link, Chateau date boundaries, PD3/Trailhead limits, all corrected locations/contact purposes, unsafe-URL rejection, output-copy isolation and no raw price/hour/image/GPS leakage. It imports the actual parallel Banff module, performs no network or booking operation, and writes no site build.

Prepared projection frozen for root's page integration. A passing source check is not proof of deployment, venue availability or commercial results.

## Area and dining-format planner

The follow-up scope added only `src/data/diningPlanning.ts`, `src/components/DiningPlanningInteractions.astro` and `scripts/check-dining-planning.mjs`. Root owns the rebuilt `eat-and-drink.astro` page and its server-rendered cards, styles and schema.

The client model is a deliberately small public index of the same 32 stable slugs, regional areas, restaurant/drink kinds and authored dining-format memberships. It has type-only imports. The focused check compares it with the actual `buildDiningDirectory(banffDiningSourceReviews)` result for exact identity, kind, area and order parity. The browser artifact does not import the raw restaurant file or either source-review module, so older unsupported descriptions, photographs, prices and coordinate values are not bundled into the new controller.

Area options are All areas, Banff, Lake Louise, Canmore, and **Parkway & Castle Junction**. The last is a browse group: Storm Mountain's actual Highway 93 South address and journey note remain explicit. Format options are All dining formats, Cafés & bakeries, Restaurant meals, and Pubs, bars & breweries. Memberships come from the checked descriptions and menu/format evidence above and root's companion Banff source record. They can overlap: Bill Peyto's is a café and meal option; a restaurant/brewpub can appear under meals and pub formats. No price, dietary, access, age or availability filter is supplied.

PD3, Trailhead and the Station renovation closure have no active-format membership. They remain in All dining formats, including when narrowed to their area, so their status and source notices stay discoverable. An empty filtered list describes this inventory only; it does not establish that no such venue exists in the town or that venues are closed.

The SSR integration contract is:

- Hidden `form#dining-form` with `select#dining-area`, `select#dining-format`, submit and native reset buttons; options come from `diningFilterOptions` tuples.
- `#dining-status` with `role="status"` and `aria-live="polite"`; hidden `#dining-empty` for an empty result.
- All 32 full cards initially visible, each with a unique `data-dining-slug`; four initially visible containing sections have `data-dining-group`.
- No-JavaScript visitors can read every card, operator/menu/booking link, notice and source. The form is revealed only after the complete DOM contract is checked and initial filtering succeeds.

The actual controller changes card/group `hidden` values and the live count/empty state. It never rebuilds or reparents cards, nor reads or changes their native hrefs. Query keys are only `dining_area` and `dining_format`; unknown values or duplicates default independently. Local history normalisation retains other existing parameters without using them in an operator link. History denial does not disable filtering. Native reset shows the complete list and clears the two filter settings. There is no remote request, vendor embed, storage, clipboard or transmission of reader inputs. On a rendering failure, controls are hidden again, every SSR card/group is restored, and installed listeners are removed.

### Actual page and controller check

`node scripts/check-dining-planning.mjs` passed after root's page landed. The test renders the actual page frontmatter/template in Astro's container with only the unrelated outer layout/components and styles stubbed. It verifies the actual 32 visible cards, four groups, hidden form/empty state, exact option labels and values, native reset, preserved operator/menu/reservation routes, Station closure notice without an active menu/booking CTA, and five visible/schema-identical FAQs. Hostile reader query markers and raw legacy image/address claims are absent from that rendered HTML.

It then executes the actual compiled controller against a DOM fixture derived from that rendered card/group contract. Coverage includes all 20 area/format combinations, keyboard-style select changes with focus retained, reset/submit, query restoration/normalisation, counts, empty results, hidden empty groups, denied history, idempotent page load and complete-list failure cleanup. Native link values and card node order remain intact. The bundler input inventory confirms no raw restaurant/source modules in the browser artifact. This is an offline SSR/client verification, not a claim of visual-browser testing or deployment; root owns release/browser QA.

The installed Astro compiler emits unused metadata that the installed container runtime cannot consume directly. The test fixture removes only that one compiler-generated metadata declaration and import; it does not alter page frontmatter or template behavior. No production change was required for that fixture mismatch.

Both owned focused checks pass. Projection, public index and controller are frozen for root integration/release checks.
