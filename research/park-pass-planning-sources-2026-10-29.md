# Banff admission and park-pass planning — October 29, 2026

This repairs the existing `/park-pass/` route within BanffBound. The old page charged youth, denied the actual non-stop highway exception, used obsolete amounts, promised all Parks Canada coverage, conflated travel dates with fee units, advertised universal seven-day savings, guessed gate hours/queues and accepted a phone image without checking the issuer. Its visible FAQs also differed from its schema. The replacement retains the page identity and adds a usable admission decision and comparison tool.

## Current primary evidence

All sources below were read on October 29, 2026. No purchase, pass validation, account change or message was made.

- [Banff fees](https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees): published CAD daily adult 12.25, senior 10.75, family/group 24.50; Discovery adult 83.50, senior 71.50, family/group 167.50. Youth 17 and under have free national admission. Adult is 18–64, senior 65+. Family/group is up to seven arriving in one vehicle. The source separately lists commercial admission and service fees. This review uses the admission table only, not a live checkout or a claim about all costs or taxes/fulfilment.
- [Current Banff travel order](https://parks.canada.ca/pn-np/ab/banff/bulletins/7d9a90ac-8cd6-4a47-9051-e2e41121e93b): issued/start September 8, 2026. It requires travel authorization by pass, displayed in the vehicle or presented when requested, with a non-stop Highway 1/Highway 93 South exception. The order gives no end date at this review. Its generic modified footer says 2024; that is not the issue date. The separate older order ending June 18, 2026 is not used as current evidence.
- [Parks Canada Banff pass guide](https://parks.canada.ca/~/~/~/link.aspx?_id=FCF8E7F526E14FFAAA56E097E999F41C&_z=z): the official indexed alias renders the current guide (modified September 28, 2026). The simpler `/visit/passer-passes` URL timed out in research. The guide distinguishes scenic 93 North/1A from non-stop highway transit, says daily admission lasts until 4 pm the following day, names eight national parks for daily admission, and describes signed/non-transferable Discovery Passes and purchase locations. It does not establish each visitor’s chargeable fee-unit count. Its older “100” participation wording differs from the national page’s “80”; the replacement does not publish either number as universal Discovery coverage.
- [National admission, eligibility and expiry calculator](https://parks.canada.ca/voyage-travel/admission): Canada Strong Pass admission ended September 7, 2026; regular fees resumed September 8. The listed periods are historical, not an announced future winter programme. Qualifying annual passes were extended; readers use the official expiry calculator rather than a homemade calculation. Other eligibility categories are linked without asking for personal documents, medical facts, citizenship or service records.
- [Authorized tourism purchase page](https://www.banfflakelouise.com/park-pass-purchase), linked by the official pass guide: seller requires its pass to be printed and displayed on the dashboard. Its purchase conditions are not automatically substituted for every fulfilment method. No queue saving, gate-hours or delivery guarantee is made.
- [Alberta Kananaskis Conservation Pass](https://www.alberta.ca/kananaskis-conservation-pass): separate vehicle-parking rules at covered provincial/public-land sites; Canmore townsite excluded. A national pass does not replace the provincial requirement. The exact parking boundary and applicable exemptions remain an official-map check. This tool does not calculate Kananaskis charges.
- [Parks Canada lake transport](https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise): shuttle and admission coverage are separate. A national pass is not a seat, reservation, parking space or activity ticket. No future shuttle season or availability is inferred.

## Public model and boundaries

`src/data/parkPassPlanning.ts` exports one source-dated cents table and eight FAQ pairs. The page renders all fees, four example purchase rows, source links and FAQs without JavaScript. The initial example is two adults, three chargeable daily-admission units and arrival together in a private vehicle: CAD 73.50 individual daily, 73.50 family/group daily, 167.00 for two adult Discovery Passes, and 167.50 family/group Discovery.

The calculator is for a private party of 1–7. Individual daily and annual prices are multiplied by the entered adult/senior counts; youth admission is free. The group options are included only for the selected one-vehicle arrangement. Car-free/separate arrivals get no assumed group eligibility. Commercial tours and larger groups have explicit official/operator handoffs. The comparison is published-fee arithmetic, not an individual eligibility ruling, pass check or complete checkout quote.

The number of chargeable daily-admission units is entered, not inferred from travel days or hotel nights. The actual 4 pm expiry and seller-confirmed coverage matter. A calculated threshold applies only to these rates, the same party and arrival arrangement; it is not a universal seven-calendar-day recommendation. Individual and group passes have different future coverage. Existing passes and free-admission questions are separate branches, with no price comparison until applicable.

States: `compare`, `transit`, `outside`, `existing`, `eligibility`, `youth`, `invalid`. Unused counts/fee units do not block non-price branches. A youth-only party does not require an adult/senior fee or meaningful fee-unit count. Invalid active fields clear/hide calculated prices and produce a focused alert on submission. Changing branch disables irrelevant party fields. Reset restores the labelled example. No photo identity, synthetic coordinates, payment data, personal documents or health fields are involved.

The progressive controller changes existing text/visibility only. It does not read or write address parameters, storage, cookies, network, clipboard or merchant links. All purchase/source/internal routes are fixed editorial hrefs. Controls stay hidden if required DOM is missing; all source guidance remains readable.

## Focused evidence

`node scripts/check-park-pass-planning.mjs` passes:

- 1,428 independent literal-rate/party/unit cases, including individual versus group minima and youth-only parties;
- eight matching actual Astro-rendered FAQ/schema pairs, four exact default option totals, four published-rate rows, labelled controls and native source links;
- the actual compiled controller over 24 journey/coverage/arrival combinations, inactive fields, invalid active data, price clearing, error focus, reset, idempotence and missing-control fallback;
- query-marker exclusion from SSR and no input URL/storage/network/merchant construction.

The model also passes targeted strict TypeScript checks. Full clean build, global audit, desktop/phone browser checks, CI and exact production identity are recorded by root separately after they occur. This note does not claim those pending outcomes.
