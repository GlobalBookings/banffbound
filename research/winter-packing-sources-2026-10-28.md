# Banff packing checklist review — 28 October 2026

Scope: `src/pages/packing-list.astro` only, plus this evidence record. Work is on `codex/winter-journey-reliability-2026-10-28`. No shared files, builds or production publication are part of this task.

## Editorial approach

The checklist covers a resort ski day or lesson, winter walking/snowshoeing, skating, summer hiking, paddling, camping, photography, dining, pools/hot springs, driving and flights. It is a packing and booking-organising aid. It neither recommends terrain nor assesses weather, ice, avalanche exposure, road conditions, a participant's ability, or whether a selected activity is operating. No rescue-equipment shopping list is presented as a substitute for training or a route plan.

Month groupings are editorial starters: November–March winter, June–August summer, and the remaining months shoulder season. They are explicitly not a forecast or opening calendar. Selecting skiing, a lesson, skating or snowshoeing also adds winter clothing, including for a spring/summer month; that does not establish seasonal availability. First-lesson selection includes resort ski equipment and booking checks. Summer trail gear, camping equipment and useful original affiliate searches are retained.

## Primary sources and claim boundaries

| Source | Verified information used | How the page limits the claim |
| --- | --- | --- |
| [Parks Canada: Banff winter walking](https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking) | Current winter-route/closure checks, ice cleats and poles, layers, food/water, map, headlamp, emergency supplies, bear spray, communication limitations and avalanche awareness. Summer destinations are not automatically suitable winter routes. | Cleats are a packing option for icy walking; they do not authorize a steep, closed or avalanche-exposed route. The list is not a complete backcountry specification. No month is described as free of avalanche hazard. |
| [Parks Canada: skating](https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating) | Parks Canada does not monitor natural ice for safety or mark potential hazards. This wording was available in the current official indexed result; direct page fetches were intermittent/timeouts during this review. | The checklist directs visitors to an operator-confirmed open rink and current guidance. It gives no thickness threshold or guarantee that a lake is safe, maintained or open. |
| [Avalanche Canada: start here](https://avalanche.ca/start-here) | Avalanche exposure can come from slopes above flat terrain. Training, forecasts and terrain recognition matter; warning signs do not exist at every trailhead. | Equipment and a checked list do not confer avalanche-terrain skills. The page does not produce a route clearance or substitute a gear purchase for training or qualified guidance. |
| [Sunshine: first-timer guide](https://www.skibanff.com/plan/first-time-visitors/first-timers-guide) | Wool/synthetic base layers, warm mid-layers, waterproof outer clothing, gloves, goggles, ski socks, helmet checks, rental/ticket collection and base-to-village gondola arrival. The operator's adult lesson rental add-ons do not automatically include a helmet. | Visitors must confirm their actual package, helmet, fitting/collection and meeting point. No first-day learning guarantee, rental availability guarantee, fixed check-in time or lift-access inclusion is copied. |
| [Parks Canada: camping](https://parks.canada.ca/pn-np/ab/banff/activ/camping) | Reservations/permits, designated campsites, site-specific services, fire restrictions and storage of food/scented items. | Confirm the booked site's actual storage system; a rope is not a universal food-storage solution. No camping season, nightly price or campground opening date is invented. |
| [Transport Canada: boating safety resources](https://tc.canada.ca/en/marine-transportation/marine-safety/boating-safety/boating-safety-resources) | Approved lifejackets, correctly fitted equipment and canoe/kayak rental safety briefing resources. | The page tells users to wear their fitted approved lifejacket/PFD and confirm the boat's kit with the operator. It does not promise that paddling is available or permitted on any selected waterbody. |
| [Alberta: safer winter highways](https://www.alberta.ca/safer-winter-highways) | Vehicle winterization, tires and weather/road preparation. | Verify the actual rental vehicle and tires. The checklist does not claim a national or Alberta-wide legal winter-tire mandate, or that AWD establishes suitability. Current road reports are separate. |
| [BC: passenger-vehicle tire and chain requirements](https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/traveller-information/seasonal/winter-driving/about-winter-tires) | BC requirements apply to designated routes and vehicle/tire specifications. | The page links the current official requirements and asks users to check their actual route. It does not flatten differing route dates or tire definitions into a single Canada-wide rule. |
| [CATSA: outdoor adventure](https://www.catsa-acsta.gc.ca/en/travel-tips/outdoor-adventure) | Bear spray is prohibited in carry-on and checked baggage; camping fuel is prohibited. Clean stoves and other outdoor items have separate rules. The page was modified 9 June 2026. | Arrange bear spray/fuel locally and check the carrier's other equipment rules. Shopping links do not establish permission to fly with equipment. |

Additional current trip checks link directly to [Alberta 511](https://511.alberta.ca/) and [DriveBC](https://www.drivebc.ca/); neither is represented as live data embedded in the checklist.

The former bear-bell shopping item was removed. Parks Canada's [safe-travel-in-bear-country guidance](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/carnivores/~/~/link.aspx?_id=1302A3011D314999915CEA678ADA1473&_z=z) states that bear bells are ineffective. The winter-walking source also explicitly calls for bear spray and understanding its use. No guarantee that any deterrent prevents an encounter is made.

## Checklist, persistence and sharing behavior

- **89 unique, named stable item IDs in eight server-rendered groups.** Every item is present and usable without JavaScript, with native checkbox labels, season/activity hints, notes and source links. No-JavaScript visitors can print using their browser.
- With JavaScript, the page filters by travel month, multiple activities, and all/unpacked/packed view. Progress counts all included items in the selected plan, independent of the packed-status view. Changing selections preserves each actual item's check mark.
- First-lesson selection includes resort ski essentials. Unselecting resort skiing also unselects the lesson to avoid a lesson list without its equipment checks. Ski activity does not imply mountain operations or terrain readiness.
- **Save on this browser is opt-in.** The saved object at `banffbound-packing-v2` contains version, month, allowed activity IDs, view and checked item IDs. Reading, JSON parsing, writing and removal are guarded. Unknown IDs, invalid months/activities and unsupported fields do not become checklist entries or executable markup.
- Saved progress is loaded only from the new stable-ID format. The former `banffbound_packing_list` category/index state is neither migrated nor deleted automatically: its index keys cannot reliably identify the same item after a seasonal change.
- Turning saving off attempts to remove this version's saved state while preserving the current in-memory checklist. If storage removal fails, the UI says it could not clear the browser copy rather than claiming deletion. Failed reads/writes leave the checklist and printing usable.
- **Reset all check marks** clears every item, including filtered-out items, while retaining month/activities. **Reset selections** resets month, activities and packed-status view while retaining check marks. The distinction is stated beside the controls.
- Share links contain only validated month/activity selections. They omit check marks, browser storage and unrelated tracking parameters. Clipboard failure reveals a manually selectable link. Printing uses the current filtered view; the button and explanation say so.

## Affiliate and schema changes

- Retained Amazon Canada search links and the existing `banffbound-20` tag. There are 35 product-search links, each with an explicit affiliate disclosure, `rel="noopener sponsored"` and a descriptive accessible label. They are searches rather than price, review or suitability recommendations.
- Shop anchors are outside checkbox labels, avoiding an interactive link nested inside the label's click target. No merchant script is required to use the checklist.
- Removed the unsupported HowTo schema's free estimated cost and fixed 30-minute completion time. FAQ schema is generated from the same visible questions/answers. It does not claim packing completion confers outdoor safety.

## Journey handoff

The page links to `/learn-to-ski`, `/ski-day-planner`, `/skiing` and `/winter`. The existing planner/snow-school pages are not edited here. A useful inbound first-lesson link is `/packing-list/?activities=skiing,lesson`; a resort day can use `/packing-list/?activities=skiing`. An actual known month may be added using `month=0` through `month=11` (January through December). These parameters select packing categories, not bookings or operating dates.

## Bounded verification

- Astro compiler source check passed with zero diagnostics; no full build was run.
- Executed the actual checklist script in a controlled DOM harness: 144 month/activity combinations; winter, summer and spring lesson examples; stable checked-item behavior across seasonal changes; progress unaffected by the packed-status view; both reset actions; opt-in persistence and restore; invalid/unknown saved data; blocked get/set/remove; invalid URL parameters; unavailable history; clipboard failure/manual-copy path; share links without progress; print dispatch; repeat initialization.
- Checked unique IDs, the preserved affiliate tag, sponsored attributes, source links, static full-list rendering structure and removal of the former cost/time/guarantee claims.
- Parent integration owns the full build and browser/responsive/print rendering checks.
