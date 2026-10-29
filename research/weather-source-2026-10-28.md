# Official weather source integration

Verified 28 October 2026 in Mountain Time (responses and checks after 05:00 UTC on 29 October). Scope: `scripts/fetchers/environment-canada.mjs`, its new normalization helper, and a focused read-only check script. No dependency changes, build execution, or writes to `src/data/live`.

## Primary sources and verified coverage

- [ECCC city-page weather documentation](https://eccc-msc.github.io/open-data/msc-data/citypage-weather/readme_citypageweather_en/) explicitly identifies the real-time GeoMet city-page collection as an access method. The collection remains labelled experimental.
- [GeoMet collection metadata](https://api.weather.gc.ca/collections/citypageweather-realtime?f=json) describes current conditions, forecasts, warnings and regional normals for selected Canadian cities. [Banff feature `ab-49`](https://api.weather.gc.ca/collections/citypageweather-realtime/items/ab-49?f=json) returned HTTP 200, `properties.identifier: "ab-49"`, `properties.name.en: "Banff"`, and station `Banff`.
- [Official Banff forecast and alerts](https://weather.gc.ca/en/location/index.html?coords=51.18,-115.57) is the human-readable source link retained in the output.
- [Lake Louise's official page](https://weather.gc.ca/en/location/index.html?coords=51.425,-116.181) identifies the destination as Lake Louise and its observation station as **Yoho National Park**. The integration preserves that station name; it does not claim the observation was taken in Lake Louise.
- The [exact public ECCC JSON endpoint used by that Lake Louise page](https://weather.gc.ca/api/app/v3/en/Location/51.425,-116.181?type=city) returned HTTP 200. Its single result supplied `displayName: "Lake Louise"`, `cgndb: "IACFT"`, `province: "AB"`, `lat: "51.425"`, `lon: "-116.181"`, `observation.timeStamp`, `observation.observedAt`, `dailyFcst.dailyIssuedTimeEpoch`, and explicit `periodHigh`/`periodLow` fields. The endpoint pattern was verified in the official page's [public application JavaScript](https://weather.gc.ca/vue/ssr/js/main.87747521681d72434aaf.js), whose location action requests `${apiUrl}/v3/${language}/Location/${latitude},${longitude}?type=city` with `apiUrl` configured as `api/app`.
- An exact-name GeoMet query for Lake Louise returned no features. The nearby bbox `-117,51,-115.8,51.8` returned Yoho, Kootenay and Golden. The [ECCC city-page catalogue](https://collaboration.cmc.ec.gc.ca/cmc/cmos/public_doc/msc-data/citypage-weather/site_list_en.geojson) contained no Lake Louise entry. Consequently the implementation uses Lake Louise's own official coordinate endpoint, rather than assigning one of those other city feeds to it.

The website API is public and used by ECCC's own page, but no published schema or stability commitment for it was identified in this pass. The parser requires the exact destination name, CGNDB identifier, province and coordinates. Failure, identity changes, or unusable data produce null observations, empty forecasts and the official destination link. There is no third-party or nearby-city fallback.

## Provider time and field treatment

The captured Banff response reported observation `2026-10-29T05:00:00Z`, station `Banff`, temperature `-4.1` C, and forecast issue `2026-10-28T22:00:00Z`. Lake Louise's own page API reported observation `2026-10-29T04:00:00.000Z`, station `Yoho National Park`, temperature `-3.6` C, and forecast issue epoch `1793224800`, which is `2026-10-28T22:00:00.000Z`. These are verification examples, not hardcoded current weather.

- `updatedAt` means retrieval completion only. `current.observedAt` and `forecastIssuedAt` preserve the separate provider times in UTC. No local display text, page modification time, or feed update time is substituted for an observation or issue time.
- Banff forecast rows preserve the explicit weekday wording from `period.value.en`, with `period.textForecastName.en` as the fallback. The source explicitly classifies each temperature as `high` or `low`.
- Lake Louise forecast rows preserve `periodLabel` and its reported `date` when needed to distinguish repeated `Night` labels. Only explicit `periodHigh` and `periodLow` populate the respective fields. The unclassified `temperature.metric` is never used to guess a forecast high or low.
- Day and night rows stay separate. An unreported high or low stays `null`; adjacent rows are never combined. All 12 periods in each checked response were retained.
- Blank strings, null, booleans and non-numeric values do not become zero. Reported zero temperatures, humidity and wind values survive. Banff metric units are checked before labeling values Celsius or km/h. An observation without a valid UTC timestamp or named station is suppressed. An undated forecast is suppressed.
- Missing observation condition text is `Not observed`, independently of forecast conditions. Only a generic thermometer emoji is emitted; no ECCC icon URLs or artwork are copied.
- The existing retrieval-age and provider-age display rules remain the responsibility of the UI. The fetcher retains old provider times so stale information cannot be made fresh by a successful retrieval.

## Attribution and service use

[ECCC's data-server end-use licence](https://eccc-msc.github.io/open-data/licence/readme_en/) permits commercial use subject to its terms, including source acknowledgement and a licence link where possible. The output identifies `provider: "Environment and Climate Change Canada"`, includes `licenceUrl`, and supplies each location's official `sourceUrl`. Use the attribution **Data Source: Environment and Climate Change Canada**, and do not imply ECCC endorsement.

[The city-page Datamart documentation](https://eccc-msc.github.io/open-data/msc-data/citypage-weather/readme_citypageweather-datamart_en/) separately states that commercial use of ECCC icons requires prior explicit consent; this integration does not use them. [The service usage policy](https://eccc-msc.github.io/open-data/usage-policy/readme_en/) recommends meaningful User-Agent headers and avoiding no-cache headers. The fetcher uses a BanffBound identification header, two targeted requests per run, and a timeout covering both response headers and JSON body reading. It does not poll Datamart directory listings.

## Focused verification

Passed:

```sh
node --check scripts/fetchers/environment-canada.mjs
node --check scripts/lib/eccc-weather.mjs
node --check scripts/check-weather-source.mjs
node scripts/check-weather-source.mjs
node scripts/check-weather-source.mjs --fixtures /tmp/banffbound-eccc-banff-response.json /tmp/banffbound-eccc-lake-louise-response.json
node scripts/check-weather-source.mjs --live
git diff --check
git diff --exit-code -- src/data/live
```

Default checks use small source-derived in-code response subsets, so the two temporary full captures are optional. They cover exact source identity, raw observation and issue times, station names, blank/missing/zero values, unit rejection, independent day/night rows, missing-date suppression, HTTP failures, partial availability, schema rejection and aborts while reading a response body. The live check fetched both actual official endpoints and reported 12 periods for each; it never invokes the snapshot-writing orchestrator.

Committed weather snapshot SHA-256 remained `eb921a996abb33582d68c45ec3977c8c5bda1526168fcf5da0386bffd31e1285`. All `src/data/live` files remained unchanged in Git. No production or cached site build was run for this task.
