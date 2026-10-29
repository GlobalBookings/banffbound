# Editable trip builder — 28 October 2026

`src/data/tripPlanner.ts` replaces the used planning catalogue; the old `tripActivities.ts` is no longer imported by any page. The new builder preserves its five old template URL identifiers while separating summer family trips from winter ideas. It adds two focused winter templates, open rest/travel days, up to seven days and three activities per day, reorder/remove controls, one-step undo, saved selections, validated share links and printing.

Time allowances are editorial estimates for the outing itself. They are not provider schedules, driving times, availability or an assessment of route safety. No current prices are invented and no weather key or static trail-status count is used to select an activity. Multi-area, full-day and car-free journeys produce specific planning checks. Any non-regional activity away from the overnight base needs an outward/return check; driving advice is distinguished from transit connections.

Primary information used:

- [Parks Canada winter walking](https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff) and [Lake Louise snowshoeing](https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise): designated winter outings, changing conditions and closures.
- [Cave and Basin](https://parks.canada.ca/lhn-nhs/ab/caveandbasin): a historic site with seasonal opening days and temporary closures, rather than a swimming facility. The current page lists winter Thursday–Monday opening and a December14–17 maintenance closure, so no unconditional opening promise is made.
- [Tourism transit overview](https://www.banfflakelouise.com/explore-the-park/transit-shuttles) and [Roam](https://roamtransit.com/): distinguish town transit, seasonal lake transport and ski shuttles.
- [Canmore Nordic Centre](https://www.albertaparks.ca/parks/kananaskis/canmore-nordic-centre-pp/): lessons, rentals and current trail reports; park work can change access.
- [Town skating](https://banff.ca/110/Outdoor-Ice-Skating), [Norquay tubing](https://banffnorquay.com/tubing/) and [Parks fat biking](https://parks.canada.ca/pn-np/ab/banff/activ/cyclisme-biking/veloniege-fatbike): activity-specific checks, distinct from assuming natural ice is usable.
- [Banff Gondola](https://www.banffjaspercollection.com/attractions/banff-gondola/), [Minnewanka Cruise](https://www.banffjaspercollection.com/attractions/lake-minnewanka-cruise/), [Moraine/Louise transport](https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise), [Norquay via ferrata](https://banffnorquay.com/via-ferrata/): individual operating calendars and booking/transport requirements.
- [Tourism dining](https://www.banfflakelouise.com/eat-drink) and [Town arts/culture](https://banff.ca/122/Arts-and-Culture): broad town alternatives without invented hours, availability or venue prices.

The builder excludes Johnston Canyon’s main trail and Upper Hot Springs from default selectable outings during their reported closures. Its dated notice links to official status. Heli-skiing links to the separate guided-trip article rather than treating a BC extension as a casual Banff afternoon.

Incoming plan/template links render without overwriting an existing saved plan. Only explicit edits save the incoming plan. The decoder limits length, version, season, base, transport, days and known activity identifiers, rejects cross-season or duplicate activities, and does not insert user strings into HTML. The hotel search follows the selected overnight base and preserves Expedia `camref=1101l3MtWX` with a visible affiliate label.
