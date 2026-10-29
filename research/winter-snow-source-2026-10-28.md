# Official snow-source repair — reviewed October 28, 2026

Bounded producer changes:

- scripts/fetchers/snow-report.mjs
- scripts/lib/snow-report.mjs
- scripts/check-snow-source.mjs

No live JSON snapshot, shared display, build or publishing operation is part of this change.

## Why the old producer was unsafe

The old fetcher manufactured calendar-based off-season closures/opening dates, interpreted the absence of closure text as Norquay being open, defaulted missing fresh snow to zero, counted unrelated Lake Louise Open/Closed words and attached fixed historical run/lift totals. None of those methods establishes a current official operating report.

The replacement fetches the official pages in every month. It never classifies overall operation from the calendar, snow values, opening announcements, run totals or facility words. Resort status is null. There are no hardcoded terrain denominators, seasonal dates, generic opening dates or missing-to-zero defaults.

## Primary sources and observed structures

### Sunshine

- Official current conditions: https://www.skibanff.com/the-mountain/mountain-report/current-conditions
- The former /conditions URL redirects to this page.
- The rendered page has a Current Conditions heading and a report Updated label, separately from its forecast update time.
- Upper Mountain Snow Report has explicit 24hr, Base and Cumulative metric labels. Mid Mountain Snow Report is a different measurement location; the adapter does not average or interchange them.
- The October 28 source capture exposed 3 cm / 10 cm / 17 cm for those upper-mountain fields. These are evidence of parser behaviour at review, not values to retain as evergreen content.
- A source opening summary is retained as plain text, separately from null operating status. It is not converted into a promised opening date.

### Lake Louise

- Current official report: https://www.skilouise.com/snow-conditions/
- Reporting methodology: https://www.skilouise.com/things-to-do/how-we-report-snowfall-mountain-conditions/
- The old /conditions/ path did not supply a usable current page in this review.
- The visible report at review has a Conditions & Weather heading, a dated report label and an opening announcement. It exposes no unambiguous current snow, run or lift numbers in its rendered report.
- Raw HTML also contains serialized WordPress editor/shortcode data with historical or disabled values. Those script/template values are not accepted as observations. Current forecast placeholders, marketing statistics and the numbers in SVG paths are not accepted either.
- Lake Louise numeric fields therefore remain null. Its first visible report h4 is retained as a source summary, not an operational classifier. No 164-run/11-lift fallback or arbitrary Open/Closed count remains.
- Numeric extraction can be added only after an active, clearly labelled report structure is verified and covered by regressions. The existing unsupported embedded data is not a reason to guess.

### Mt. Norquay

- Official report: https://banffnorquay.com/conditions/
- The report heading is Daily Conditions Update with a dated Conditions update for label.
- In Current Snowfall the number precedes its period label: Overnight, Last 24 Hours and Last 7 Days are different values. Taking the first number after “24” would select the next period on this layout.
- Lower and upper Snow Base sections have distinct base and Year to Date Snowfall numbers. The adapter explicitly uses Upper Mountain and retains that location in field evidence.
- Runs Open is an explicit numerator/denominator before Status Legend. Its denominator is parsed from the report, rather than attached from a historical resort profile. No lift count is inferred from the list below it.
- The source capture fetched during this review had already changed its own report date to October 29. It explicitly showed 0 cm in the Last 24 Hours field, 0 cm upper base, 8 cm upper YTD and 0 of 80 runs. These values/date are source evidence, not a deduction from our clock.
- Some old forecast markup is explicitly hidden across all device breakpoints. It is excluded; visible Weekly Forecast (or the verified Today's Forecast variant) bounds upper snow extraction so forecast precipitation cannot bleed into base/YTD values.

## Versioned output contract

The top-level compatibility keys updatedAt and resorts remain. Consumers must require schemaVersion 2 and experimental true to reject snapshots from the old inference-based producer.

Top level:

- schemaVersion: 2
- provider: Official resort report pages
- experimental: true
- updatedAt: ISO retrieval-completion timestamp, retained as a compatibility alias
- retrievedAt: same ISO retrieval-completion timestamp
- resorts: one entry per configured official source
- error: present only when every report retrieval/identity is unavailable

Each resort:

- id, name, sourceUrl, website (website is the same official report link)
- retrievedAt: completion time for that source request
- sourceReportedAtText: plain-text source label, or null
- sourceReportDate: explicit source year/month/day as YYYY-MM-DD, or null; never filled from our calendar or a copyright year
- sourceReportedAt: null in this adapter, because the reviewed labels do not provide an offset
- sourceTimeZone: null; a precise UTC report instant/time zone is not invented
- status: null; overall operating status is not inferred
- reportSummary: bounded plain-text source announcement, or null; distinct from status
- baseDepth, newSnow24h, seasonTotal: metric strings such as 0 cm only with directly matched source evidence, otherwise null
- openRuns, totalRuns, openLifts, totalLifts: explicit numbers or null. Only Norquay's verified run numerator/denominator is currently supported; lift values remain null.
- measurements: evidence map for each supplied numeric field with value (number), unit (cm or runs), label and location (string or null)
- parser: experimental-html-v1
- availability: reported-values, partial (identified report, incomplete metrics), or unavailable (retrieval/identity failure)
- error: optional concise explanation

Source identity and an explicit source date are required before publishing numeric fields. Zero is accepted only when it is actually in the labelled source. Invalid values, changed or duplicate labels, a missing section boundary and missing report dates fail closed. The adapters do not estimate a missing period, convert forecast precipitation into observation, or fill another resort's missing values.

## Display handoff and limits

- A fresh retrieval is not a fresh observation. Display sourceReportedAtText/sourceReportDate and apply source-age checks separately from retrieval expiry.
- The source labels have no explicit UTC offset. They must not be passed to Date.parse as though they were verified UTC timestamps. Date-only freshness should remain visibly approximate; an exact source instant is unavailable.
- All extracted values are experimental HTML parsing. Official pages are not a stable documented API; markup changes can make otherwise available values unavailable.
- Display location beside upper-mountain base and cumulative values. These are not resort-wide averages or snow coverage assessments.
- Explicit zero open runs does not establish an overall closure, and a tentative opening summary is not an operating promise.
- Use official source links when values are missing, old or ambiguous. Do not silently restore old inferred snapshots.
- root owns conditions/homepage presentation and legacy-snapshot suppression. No shared display file is changed here.

## Verification

- Offline synthetic regression suite: node scripts/check-snow-source.mjs
- Captured-source regression option: --fixtures followed by Sunshine, Louise and Norquay HTML paths, in that order. Full captures are kept only in /tmp, not committed.
- Optional read-only live check: node scripts/check-snow-source.mjs --live
- Covered: explicit zero versus missing, period/location separation, imperial-only rejection, malformed dates, missing dates, duplicate labels, hidden/template/script data, source identity, parsed denominators, no facility-word status classification, summer fetching, partial failures, wrong redirect hosts and timeout during body reading.
- Focused checks do not invoke the snapshot-writing orchestrator or build the site.
- Offline and captured-source checks passed. The read-only live check also passed at approximately 2026-10-29 05:29 UTC (October 28 Pacific), identifying all three official reports and retaining only the explicitly labelled values described above. No snapshot was written.
