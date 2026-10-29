# Evening planner and dining hub, reviewed 29 October 2026

The progressive comparison belongs to the existing canonical `/blog/banff-nightlife-guide/`. It compares five outing formats, rather than claiming to enumerate tonight’s events or approve admission. The three fully reviewed article bodies have separate source records for nightlife, music and drink offers.

## What the planner uses

- Dinner: the already reviewed dining-discoveries guide and Sophia’s direct reservation information, https://www.pizzeriasophiabanff.com/reservations . No universal child-admission or quiet-room claim is made.
- Bowling: https://www.highrollersbanff.com/ and its separate https://www.highrollersbanff.com/reserve/bowling route. These support 110 Banff Avenue, a lane seating selection distinct from a dining table, and the stated under-18 cutoff at 10 p.m. The planner asks about supervision/session conditions and earlier completion. It copies no price, rate or conflicting weekday offer period.
- Pub music: https://roseandcrown.ca/events/ and the fully reviewed music guide. It uses dated event discovery and does not assume that all pub listings are live bands, all performances start at one time, or a table reserves show admission.
- A dated performance: https://www.banffcentre.ca/events and https://www.banffcentre.ca/maps-directions . A younger-party result is a route to selecting an explicitly suitable event, not a blanket all-ages or seated-show claim. The actual venue, age/content rules, admission and access arrangement remain event-specific.
- Dancing: https://www.dustybootbanff.com/ supports the current venue identity at 120 Banff Avenue, saloon/dance-hall format and published 18+ condition. No old venue name, opening timeline, price or universal night schedule is invented.

Under-18 selection retains dinner, earlier bowling and a suitable dated-event discovery route. It omits the adult pub-music and dance-floor shortlist, explaining that no session is verified here for that younger group. An empty result means no matching format in this small comparison, not sold-out venues or a town-wide admission finding. The ordering of bookings and return planning is original editorial advice.

## Four complete-journey handoffs

- Banff town: https://roamtransit.com/schedules-routes/ ; check the actual lodging address, hills, winter walking conditions and relevant local route.
- Canmore: https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/ ; use the actual date, direction and stops, then the final connection to the property. No final departure is copied or connection guaranteed.
- Lake Louise area: https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/ ; use the current dated timetable/reservation requirements and distinguish village, lakeshore and other property addresses. The operator page retains an older winter-season FAQ, so this planner does not infer a current final bus from it.
- Road base: internal `/conditions/` for current road-source handoffs, plus an explicit outbound/return arrangement to the precise property. No rural venue pickup or hotel shuttle is promised.

## Rendering and interaction

All five complete cards, their native links and a three-step Banff-town plan are server rendered. The form is hidden until required elements are present and its client initializes. The style/group filters change the small shortlist; the base selection changes the complete return steps and its fixed source handoff. Reset returns to five cards and Banff town.

Only allowlisted `evening_style`, `evening_group` and `evening_base` URL values are restored. Duplicate or unknown values fall back to defaults. Unrelated advertising parameters and the fragment remain in place. Reader query values never construct external destinations. The component uses text nodes, no storage, provider SDK, external fetch or purchase event. History failure does not stop interaction; missing required DOM leaves the complete static content available.

## Dining hub scope

`/eat-and-drink/` gains four native guide entry points and a handoff to the existing six-property Banff hotel comparison. An unsupported food-tour availability implication and a broad recurring-happy-hour paragraph are replaced by those reviewed journeys.

The imported restaurant/drink directory has no dated source-review fields and remains pending full factual, venue-identity, photograph and menu review. This release does not claim that inventory has been reviewed. The hub stops rendering its undated hour strings as current guidance, points readers to operators for current hours, and reduces its ItemList to names and operator links instead of repeating unreviewed Restaurant hours, prices, address/phone, coordinates and menus as structured assertions. A bounded Rose & Crown presentation override also replaces its legacy fixed-hours/promotion paragraph with the reviewed dated-calendar route; its unverified pub image is labelled illustrative. Original directory data and records remain preserved for a separate audit.

Validation is in `scripts/check-evening-planning.mjs` and the guide-specific checks. The release verifier covers the actual emitted/deployed controls, cards, dated source facts, FAQs, metadata and hub handoffs. No ads, budgets, merchant transactions, booking confirmations or conversion delivery are asserted.
