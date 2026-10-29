# Winter transport sources — reviewed 28 October 2026

Scope: replacement content and page-local progressive enhancement for src/pages/car-free-banff.astro and src/pages/calgary-to-banff.astro. No shared components, affiliate identifiers, route URLs or global integrations were changed.

## Editorial decisions

- Separate airport arrival planning from choosing and using a car-free overnight base.
- Remove legacy prices, universal departure intervals, fake minute-by-minute arrival promises, old Wi-Fi claims, cost-saving guarantees and the claim that every rental includes winter tires.
- Leave fares with dated booking pages. Compare the whole party, taxes, bags, destination and terms.
- Distinguish Banff, Canmore and Lake Louise; within Lake Louise distinguish village, lakeshore, ski resort and Parks Canada Park and Ride.
- Treat cross-operator connections as unprotected unless booked otherwise. Keep the first/last-service and airport-overnight decisions without promising availability.
- Helpers are planning notes, not timetable/availability calculators. Controls appear after initialization; server-rendered guidance and full static content remain available. Updates use textContent and offer reset.
- Native FAQ and schema come from the same page-local array. Visible and BaseLayout review dates: 2026-10-28.
- Existing Expedia car-rental affiliate identifier retained through CarRentalCTA; local copy explicitly labels it affiliate. Public-service and operator links are direct.

## Airport operators

### Banff Airporter

- https://banffairporter.com/schedule-rates/
  - Distinguishes fall through December 14, 2026 from winter December 15, 2026–May 31, 2027. Do not apply one season's first/last departures to another.
  - Fare footnotes mention GST and possible fuel surcharges; guides defer the final quote.
- https://banffairporter.com/travel-information/
  - Desk inside arrivals between doors 5 and 6; scheduled service does not reach Lake Louise.
  - Banff hotel/address service; Coast Hotel-only Canmore stop needs onward planning.
  - Flight tracking does not hold the scheduled bus; next-available and last-service policies differ.
  - Separate infant/child seat required, child-seat arrangements and baggage capacity need checking.
  - Park pass not included; no park-gate stop.
  - Airportward four-to-five-hour Banff departure guidance is provider advice, not a protected connection.
- https://banffondemand.com/
  - Private-transfer example linked from Airporter's official site; no 24/7, price or availability guarantee asserted.

### Brewster Express

- https://www.banffjaspercollection.com/brewster-express/schedule/
  - Dated winter schedule November 1, 2026–April 30, 2027; only selected departures continue to Lake Louise. Reservations and weather caveats apply.
  - Use detailed dates/columns rather than the generic FAQ's universal 90-minute interval claim.
- https://www.banffjaspercollection.com/brewster-express/locations/
  - Coast Canmore Hotel stop; Banff and selected Lake Louise locations must match booking.
- https://www.banffjaspercollection.com/brewster-express/faqs/
  - Coaches explicitly not wheelchair accessible; Wi-Fi currently unavailable.
  - Intermediate stops possible; hotel pickup can precede the final Banff departure by up to an hour.
  - Flight-delay, modification and last-shuttle terms differ. Sports equipment subject to space.
  - Jasper is seasonal, not a winter continuation sold by these guides.

## Airport and discontinued service

- https://www.yyc.com/en-us/navigatingyyc/groundtransportation.aspx
  - Official rental, public transit, hotel shuttle, taxi, ride-app and accessibility links.
  - Calgary Transit buses connect the airport to the city; no airport LRT station.
  - No immigration, queue or landing-to-hotel timing guarantee.
- https://roamtransit.com/on-it-regional-transit-service-notice-2026/
  - April 8, 2026 notice: Calgary–Canmore–Banff On-It did not operate summer 2026.
- https://www.onitregionaltransit.ca/on-it-banff-and-canmore-services/
  - March 4, 2026 provider notice: On-It no longer provides these services.
  - Legacy $10 summer option removed; no replacement service forecast.

## Roam routes and access

- https://roamtransit.com/schedules-routes/
- https://roamtransit.com/schedules-routes/route-1/
  - Sulphur Mountain / Gondola / Hot Springs connection. Transit does not prove an attraction is open.
- https://roamtransit.com/schedules-routes/route-2/
  - Tunnel Mountain–downtown–Fairmont, year-round; summer campground coverage separate.
- https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/
  - Regional town connection; check temporary stops and first/last service.
- https://roamtransit.com/schedules-routes/routes-5c-and-5t/
- https://roamtransit.com/schedules-routes/canmore-local-route-12/
  - Canmore local, not legacy “Banff Route 5”; does not establish transit to Grassi Lakes/Nordic Centre.
- https://roamtransit.com/schedules-routes/route-7/
  - Banff Centre/Fenlands seasonal service, not Cave and Basin.
- https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/
  - Year-round village/lakeshore route, not a year-round 8S.
- https://roamtransit.com/fares/reservations/winter-reservations/
  - Current 2026/27 policy overrides stale season text in generic FAQs.
  - One-way reservations and same-day round-trip system-wide product are distinct.
  - Include children; correct stop and 20-minute advance arrival required.
  - Village–lakeshore separate fare/capacity rules; no universal free connector or roadside-walk substitution.
  - 8X does not reach ski resort or Parks Park and Ride; no winter Moraine access.
- https://roamtransit.com/schedules-routes/johnston-canyon-regional-route-9/
  - Suspended from October 13 during remediation at review. Roam/Parks estimated end dates differ; neither proves reopening or resumption.
- https://roamtransit.com/schedules-routes/banff-local-route-4/
- https://roamtransit.com/schedules-routes/lake-minnewanka-route-6/
  - Seasonal Cave and Basin / Minnewanka routes, not winter connections.
- https://roamtransit.com/service-updates/
- https://roamtransit.com/fares/
- https://roamtransit.com/about-us/transportation-policies/
  - Ramp/kneeling features; mobility-device size/turning limitations still need confirmation.
  - No dedicated large-luggage storage; carriage beyond manageable lap/foot-space luggage not guaranteed.
- https://www.banff.ca/435/Roam-Public-Transit
  - Participating hotels fund specified local guest passes, not every regional, airport or ski journey.

## Ski shuttles, Parks and roads

- https://www.skibig3.com/ski/ski-shuttle/
  - Eligible-ticket/pass benefit, first-come seats, changing dates/times. No assumed Canmore pickup.
- https://www.skibanff.com/plan/getting-here/free-shuttle
- https://www.skilouise.com/getting-here/
- https://banffnorquay.com/shuttle-service/
  - Separate resort transport; actual eligibility, stop, lesson check-in and last shuttle are distinct from resort closing.
- https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise
  - 2026 shuttle season ended October 12. Check future summer products when published.
  - Personal vehicles prohibited on Moraine Lake Road; summer connector is not winter access.
- https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff
- https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs
  - Existing shared WinterStatusNotice reused on car-free page, unmodified.
- https://parks.canada.ca/pn-np/ab/banff/securite-safety/conduite-driving
  - Banff Highway 93N/93S snow-tire/chain rule November 1–March 31 or snow/ice-covered; specified BC roads differ.
  - Remove universal Alberta Highway 1 November–April law, automatic rental tire fitment and AWD-as-tire-specification assumptions.
- https://511.alberta.ca/
- https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees
  - Date-specific admission rules, including applicable free-admission periods, separate from bus fares.

## Shared integration

None required. Existing /winter, /towns, /winter-stays, /ski-day-planner, /learn-to-ski, /trip-builder, /weather-webcams and /what-to-do-today URLs are linked. Root owns shared metadata/navigation and browser/build QA.

## Focused verification

- Direct Astro compiler transforms of both files: zero errors. No site build run.
- Executed each compiled page script with a minimal DOM harness: all 36 base/season/outing and 15 destination/need combinations returned complete advice; winter Moraine and scheduled Lake Louise operator guards passed; both resets restored defaults.
- FAQ display and schema share one array per page; no unsafe HTML insertion in helper scripts.
- Git diff whitespace check passed for the owned files. Browser/layout QA remains with root.
