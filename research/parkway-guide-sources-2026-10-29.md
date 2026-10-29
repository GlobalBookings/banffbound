# Parkway guides: full source review, October 29, 2026

## Exact scope

Two retained canonical URLs, with distinct complete bodies:

- `icefields-parkway-guide`: scenic-stop choice, viewpoint versus hike versus commercial attraction, seasonal access and a flexible shortlist. Original publication **2026-01-05** retained.
- `banff-to-jasper-drive`: point-to-point journey, direction/endpoints, gateway or Parkway overnight choices, actual inter-town transport and winter/Jasper arrival. Original publication **2026-02-08** retained.

New module `src/data/parkwayGuideOverrides.ts` exports `parkwayGuideOverrides`, `parkwayGuideMetadata`, `parkwayGuideFaqs` (keyed arrays, five questions each), and `reviewDate = '2026-10-29'`. One FAQ renderer consumes the same arrays for visible details and FAQPage JSON-LD. Metadata has no publication-date property. Both inherited hero images receive generic `imageIsIllustrative: true` and `imageNote`; the existing layout must qualify the image visibly and omit it from Article photographic identity. No image origin or licence is asserted.

Root owns registry/metadata integration, authored-booking context and the complete `/icefields-parkway-planner/` rebuild. No aliases, shared files, old raw content, build output or live data are changed by this author scope. The bodies use purposeful internal accommodation handoffs: reviewed Lake Louise landing/base, Bow Lake stay and Jasper town guide. No new external affiliate URL, ID, room offer or generic booking claim is introduced; existing affiliate identifiers elsewhere remain unchanged.

## Primary road and services evidence

- https://parks.canada.ca/pn-np/ab/banff/visit/promenadedesglaciers-icefieldsparkway — current general travel guidance: remote route, limited seasonal services, summer-only Saskatchewan River Crossing fuel, no winter fuel, variable road conditions and avalanche-control closures. This endpoint loaded in the preceding read-only audit and its current search representation; repeat open attempts during implementation timed out. Independent current winter page and operator notices support the same fuel/closure distinctions below. Access failure is not evidence of an open road or service.
- https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter — current winter road guidance; Parks describes approximately **232 km** between Lake Louise and Jasper. Snow tires marked with a snowflake or **M+S**, **or chains**, required **November 1–March 31 and whenever the Parkway is snow- or ice-covered**. This is the specific 93N rule, not a blanket Alberta rule or BC’s date range. No time-based driving feasibility, maintenance guarantee or whole-route opening is inferred.
- https://www.thecrossingresort.com/ — current operator homepage explicitly says **all services closed for winter**, with return planned for **April 2027, date to be confirmed**. No specific reopening day, fuel availability, inventory or fixed rate is inferred. Its marketing distance from Lake Louise is not mixed with the trailhead reference below.
- https://511.alberta.ca/ — official actual road-report handoff, alongside the site’s `/conditions/` page. Readers must check source timestamps and the relevant sections. An unavailable or old report is not a clear-road indication.
- https://parks.canada.ca/pn-np/ab/jasper/visit/routes-roads — official restrictions and warning that navigation platforms can be inaccurate. An automated detour is not accepted as a verified winter alternative.

### Reserved winter lodging is a separate service question

- https://lodgeatbowlake.com/ — limited winter accommodation advertised from late January to early April, Thursday–Monday; separate summer/fall season. This is reconciled with general winter-services warnings: no dependable roadside fuel or walk-in meal assumption, while a named lodge may have confirmed reserved accommodation/meals. The full room/meal/arrival details belong in `/blog/num-ti-jah-lodge/`, not an invented generic overnight stop.
- https://www.banffjaspercollection.com/plan-your-trip/opening-dates/ — current page lists **Glacier View Lodge closed for the season** and advertises future **2027** Columbia Icefield Adventure/Skywalk dates. Bodies link the calendar rather than promising an opening date, copying an expired 2026 offer or treating a tour ticket as a room reservation.

## Distances, stops and trails

- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking — the only source for the southern body’s numerical trailhead table. **North from the Highway 1 / Highway 93N junction:** Bow Lake parking **36 km**, then **400 m** on the lodge access road; Peyto parking **40 km**; Mistaya parking **72 km**. These are not distances from Lake Louise village, Banff or a hotel.
- Same source: Bow Glacier Falls **3.8 km one way**, **95 m ascent /20 m descent**; Peyto Lookout main approach **0.6 km one way**, separate upper-lot barrier-free approach **0.3 km**. Parking eligibility/access needs separate confirmation. Mistaya’s summary table and expanded detail differ on walking distance, so these bodies deliberately give no walking-distance number for Mistaya.
- https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway — the Peyto access detail explicitly limits upper-lot vehicle access to accessible vehicles and buses. This source supports that eligibility distinction; its inconsistent discovery-table distances are not imported into the body’s junction-origin table.
- Same source: Parker Ridge **2.7 km one way**, **305 m ascent /45 m descent**, with parking described as **40 km north of Saskatchewan Crossing or9 km south of the Icefield Centre**. These published relative origins remain attached. No new absolute route kilometre is calculated.
- Root independently reviewed the operator-linked official Parks map PDF distance chart: https://pcweb2.azureedge.net/-/media/pn-np/ab/jasper/WET4/pdf/visit/depliants-brochures/ete-summer/Summer-on-the-Icefields-Parkway-Guide-2022.pdf . Its **Lake Louise village** chart is a different origin from this body table. Current discovery-page figures also contain inconsistencies; these bodies do not mix them or derive reverse distances from an approximate route total. Root owns the planner’s separately labelled map-origin values.
- https://parks.canada.ca/pn-np/ab/jasper/activ/experience/sentiers-trails/glaciers-icefields — official designated Jasper-side routes and barriers. A summer walking profile does not establish a winter opening, a suitable surface or an itinerary duration. No stop is labelled mandatory.
- https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/glacier-athabasca — explicit unstable-glacier/hidden-crevasse warning and barrier limit. “Toe” is not interpreted as permission to enter glacier ice. No self-guided glacier access instruction is supplied.
- https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports — Bow Lake Water Preservation Zone: paddling prohibited. The lakeside business does not establish a launch or rental exception.

## Transport and current Jasper arrival

- https://www.banffjaspercollection.com/brewster-express/faqs/ — Banff–Jasper described as **May–October**; the winter alternative links to SunDog. Airport service is not automatically an inter-town service. No fare, timetable, luggage allowance or cancellation policy is copied.
- https://www.sundogtours.com/package/jasper-lake-louise-banff-calgary — linked native SunDog operator page displays a winter connector but still labels its season **October 18,2025–April 30,2026** at this review. The guide explicitly treats this as an enquiry route requiring confirmation of actual **2026/27** dates, pickups and connections; no current-running-service or seat claim is made. It does not infer current operation from a booking widget or marketing copy.
- https://parks.canada.ca/pn-np/ab/jasper/gestion-management/serviceimmobilier-realty/retablissement-recovery/pc-recovery — current recovery context after the 2024 wildfire.
- https://parks.canada.ca/pn-np/ab/jasper/bulletins/76ecae58-8a63-480c-8304-dc903837eefd — current order effective August14,2026: Edith Cavell Road/area closed; Maligne Canyon access prohibited in the defined area, including **winter recreation**. The body links the full reviewed Jasper park guide and actual order; an operating town or hotel does not reopen a specific attraction.

## Removed legacy claims and limits

The full replacements remove fabricated local/first-person notes, fixed driving/stop timing, a universal “best” direction for light, unqualified Crossing fuel, arbitrary parking clocks, general summer access promises, glacier-toe wording that could encourage ice entry, a compulsory whole-route stop list and unconfirmed seasonal lodging. The original publication dates remain unchanged. No itinerary feasibility, safe-driving guarantee, open-road state, natural-ice route, room availability, price, cancellation promise or personal visit is established.

`node scripts/check-parkway-guides.mjs` performs local, in-memory source/model validation: exact two keys, original publication, distinct purpose and substantive bodies, one keyed FAQ renderer with visible/schema parity, illustrative metadata, explicit distance origins, seasonal fuel/tire/transport/closure markers, primary native sources and existing internal routes. Negative fixtures reverse legal dates, fuel/closure/ice rules, fabricate prices/visits/ETAs, remove source/FAQ links or corrupt anchors. No network, account transaction, file output or site build is performed.
