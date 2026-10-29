# Weather planning and outing chooser source record

Reviewed 28 October 2026 in the user's local date. Existing URLs retained: weather, monthly-weather, weather-webcams, what-to-do-today. Source producers have separate weather-source and winter-snow-source records.

## Climate and seasonal interpretation

- ECCC BANFF composite, Canadian Climate Normals 1991–2020:
  https://climate.weather.gc.ca/climate_normals/results_1991_2020_e.html?climate_id=3050519&searchType=stnName_1991&txtStationName_1991=banff&searchMethod=contains
- Normal daily maximum/minimum, January through December (Celsius):
  maximum -3.5, -0.5, 3.7, 9.0, 14.3, 17.9, 22.5, 22.1, 16.7, 9.1, 0.6, -4.6;
  minimum -13.5, -12.6, -8.2, -3.5, 0.5, 4.4, 6.8, 5.8, 2.2, -2.4, -8.2, -13.4.
- These values and composite definition were read from the indexed official ECCC table; the direct database intermittently returned its service-unavailable page. No other site's climate table was used. Complete ECCC normals index: https://climate.weather.gc.ca/climate_normals/index_e.html.
- The source combines the listed BANFF/BANFF CS/BANFF (AUT) records by element. It is not a summit or Lake Louise table. Only the verified temperature variables are reproduced; the previous ungrounded precipitation, snow, sunshine and month-level sunrise times were removed.
- https://parks.canada.ca/pn-np/ab/banff/securite-safety/meteo-weather supports the difference between nearby places, elevation and changing weather within a day. No universal altitude/water prescription, all-trails-open claim or guaranteed clear mornings remains.
- https://nrc.canada.ca/en/research-development/products-services/software-applications/sun-calculator/ is the date/location solar-time resource, with its interpretation notes. No fabricated monthly exact clock replaces it.
- Month plans are editorial suggestions, not live crowd, hotel-price, colour or operating predictions. Winter operations, lake access and trail checks link the reviewed winter/town/transport guides and current official reports.

## Forecast and webcam sources

- Official destination pages: https://weather.gc.ca/en/location/index.html?coords=51.178,-115.571 and https://weather.gc.ca/en/location/index.html?coords=51.425,-116.181. Legacy city/pages/ab-49_metric_e.html returned 404 and was replaced in the homepage and conditions journey.
- https://www.skilouise.com/mountain-cam/, https://www.skibanff.com/webcams and https://banffnorquay.com/webcam/ were opened and identified as the named resort camera pages.
- https://www.banffjaspercollection.com/attractions/banff-gondola/webcam/, https://fairmont.roundshot.com/banff-springs/ and https://fairmont.roundshot.com/lake-louise/ identify the operator viewers. Camera timestamps remain in the viewers; this directory does not mislabel stock images as LIVE.
- Resort report links: https://www.skibanff.com/the-mountain/mountain-report/current-conditions, https://www.skilouise.com/snow-conditions/ and https://banffnorquay.com/conditions/. Lake Louise's former conditions URL was unusable in the source review.
- Weather copies require the reviewed ECCC provider, retrieval within6h, separately valid observation within6h or forecast issue within18h. Source, station, times and data licence are visible. A missing description is not clear weather, and an unreported high/low stays absent.
- Cached HTML rechecks expiry on load, each minute, pageshow and visibility change. Without JavaScript, official links replace date-sensitive values.
- Snow parsing is marked experimental and never determines resort operation. Date-only measurements additionally require the current Mountain Time calendar date and expire at local midnight.

## Outing chooser

The chooser reuses the23 reviewed trip-catalogue ideas and their primary links. Filters cover season, overnight base, outing allowance, interest and the selected base area. Allowances exclude transport and are not an availability or suitability assessment. It does not use temperature, unexpected snowfall or a calendar month to declare a ski resort, natural ice or trail open.

Each card encodes one known activity and the chosen season/base into the validated trip-builder state. Car-free/arranged transport is explicit; the visitor can change it in the builder. Incoming builder links preserve an existing saved trip until an actual edit. Empty filter combinations get an accessible reset.

## Verification scope

Cached production build and generated-site audit passed after integration; real browser checks passed for month/units, camera filtering, outing empty/reset/URL restoration and one-day handoff. A source review found and fixed malformed forecast SSR mapping and a nonexistent March guide link. Backend and calendar-expiry checks cover independent failure modes; they do not prove a source will remain available or the full legacy site is factually reviewed.
