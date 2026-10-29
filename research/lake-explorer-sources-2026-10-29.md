# Lake explorer and FAQ source review — 29 October 2026

## Finite scope and previous errors

Rebuilt the existing `/lakes` and `/lake-faq` canonical pages using `src/data/lakePlanning.ts`. All nine destinations from the old lakes page remain; Johnson Lake from the old FAQ makes ten shared plans. Nine visible FAQ entries and their schema use one shared array. No canonical lake/article alias is added or removed.

The previous pages included calendar-derived frozen claims, unsourced temperature and medical timing claims, fixed canoe rates, assumed rental/road/shuttle operation, false Peyto shore access, incorrect Emerald geography, guaranteed parking and identical Banff-town coordinates/free-access assertions for every lake. The replacement supplies selected actual journeys, land outings, waterbody rules and source links without those claims. It retains a known Lake Louise tourism image as that scene rather than using it to depict other lakes.

## Primary evidence used

- https://parks.canada.ca/pn-np/ab/banff/activ/nautiques-sports and https://parks.canada.ca/pn-np/ab/banff/bulletins/59933c9d-02a5-4ec9-a2d8-ea0d4dad6429 — waterbody-specific current zones, personal craft restrictions, on-site exceptions and certification. Permission is not an assessment of conditions or an individual participant. No swimming ban is inferred from a paddling restriction.
- https://parks.canada.ca/pn-np/bc/yoho/bulletins/45b1cb4f-7cfc-4a7a-8b92-00770378ca4f — dated Yoho order, current Emerald rental/commercial exceptions and its31March2027 end. Later rules require a fresh check.
- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking — current designated route distinctions, including a real difficult Peyto shore route separate from the viewpoint. No claim that a shore trail does not exist is retained.
- https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise — designated winter Lake Louise lakeshore and Peyto viewpoint, Louise Falls/avalanche limits, and Moraine Road winter endpoint before large avalanche paths. It does not establish access to Moraine Lake in winter.
- https://parks.canada.ca/pn-np/bc/yoho/activ/randonnee-hike/jour-day — Emerald Lake in Yoho, actual shoreline loop and uneven east-side conditions. An Emerald visit is not part of the Lake Louise–Moraine Connector.
- https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise and its `/faq` — lake access/transport distinctions, separate Park and Ride/village/lakeshore and ordinary private-vehicle restrictions. No future booking date or bus operation computed from the clock.
- https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/ — year-round regional service and actual village/lakeshore stops. Older FAQ dates are not copied as current schedules.
- https://roamtransit.com/schedules-routes/lake-minnewanka-route-6/ — seasonal service, actual stops and current top notice that2026 service ended4October. A separately announced future date does not establish operation today.
- https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures — western Minnewanka Loop vehicle closure, separate from the rest of the road network. No complete winter-loop driving promise.
- https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating — natural ice not monitored or hazards marked. The page is not reduced to a thickness-based go/no-go calculator.
- https://www.chateau-lake-louise.com/activities/ice-skating-on-lake-louise/ — designated skating and operator checks. Current rental shop wording says closed/anticipating2026–27; no rink opening is assumed.
- https://tc.canada.ca/en/marine-transportation/marine-safety/boating-safety/choosing-lifejackets-personal-flotation-devices-pfds — fitted flotation and sudden cold-immersion risks, without invented water temperatures or survival times.
- https://www.nps.gov/articles/glacialtillandglacialflour.htm and https://www.nps.gov/glac/learn/nature/waterquality.htm — primary scientific explanation of grinding, sediment transport/suspension and light scattering. These support the general mechanism, not a Banff lake concentration ranking, exact particle size or a promised colour/date.
- https://www.banfflakelouise.com/accessibility — specific viewing-approach planning resources, not whole-route suitability.

## Interaction contract

The lake filters describe selected plans rather than live availability or a safety verdict. Area/outing/season filters combine. Winter rental selections yield no result; the selected reviewed winter shoreline description is Lake Louise, and the winter Moraine Road description is not promoted to a Moraine Lake visit. Three visible sample-day descriptions have optional filter presets. Invalid query values normalize to broad defaults. All ten plans, rule summaries and sample descriptions render without JavaScript.

FAQ topic/search controls use the actual answer text, announce counts, show an empty state and reset. Native details and the complete science explanation remain usable without JavaScript. A three-step diagram describes a physical process, not a simulation or measured observation. Source and affiliate searches remain distinct, retaining GetYourGuideQW960HO and Expedia1101l3MtWX.

`node scripts/check-lake-planning.mjs` passes the actual client scripts and shared filtering functions: seasonal intersections, missing/invalid inputs, preset/empty/reset state, case-insensitive FAQ search/topic intersection and both Astro transforms. Root owns generated-site, browser, clean-source and deployment checks separately.
