# Alberta 511 section reports — source and failure handling

Reviewed 28 October 2026. Bounded implementation: `scripts/fetchers/road-conditions.mjs`, `scripts/lib/road-report.mjs`, `scripts/check-road-source.mjs` and this note. No accounts, credentials, host configuration, orchestrator, UI, dependencies or live JSON snapshots were changed. Root owns the display/CI integration.

## Primary source contract

- [511 Alberta developer documentation](https://511.alberta.ca/developers/doc): developer authentication is required, ordinarily through the `key` query parameter. The published limit is ten calls per sixty seconds.
- [511 Alberta winter-road endpoint documentation](https://511.alberta.ca/help/endpoint/winterroads): the supported endpoint is `https://511.alberta.ca/api/v3/get/winterroads`. It requires a developer key; `format=json` and `lang=en` are documented options. Its report fields are `Id`, `LocationDescription`, `Primary Condition`, `Secondary Conditions`, `Visibility`, `AreaName`, `RoadwayName`, `EncodedPolyline` and integer `LastUpdated` in Unix seconds. Although the table describes secondary conditions as a string, its JSON example uses an array; both text forms are handled without inventing a delimiter.
- [Official 511 Alberta report](https://511.alberta.ca/) is returned as the human-readable source link on success, missing configuration and every failure.

The prior fetcher incorrectly described the API as unkeyed, used v2, collapsed multiple sections into their most common condition, copied the first section's timestamp onto the route, and generated a blanket equipment-law advisory. Those behaviours are removed.

## Server-only key handling and failures

The only environment input is `ALBERTA_511_API_KEY`, read by the server-side fetcher at invocation. No `PUBLIC_`/client variable is introduced. The named variable was absent from the current process at verification. No other secrets were inspected, and no account or key was created or requested.

Without a nonblank key, the fetcher makes **zero network requests**, returns `retrievedAt: null` and an explicit `missing_api_key` error, and retains unavailable road entries with the official source link. This is not represented as a successful fresh retrieval.

With a key, each invocation makes at most one v3 request and does not retry automatically, including on HTTP 429. The key-bearing request URL, key and raw response/request exceptions are never logged or returned. Errors use fixed `{code,message}` objects: `unauthorized` (401), `forbidden` (403), `rate_limited` (429), `http_error`, `timeout`, `request_failed` or `invalid_response`. Rejected HTTP response bodies are not inspected. The abort timer remains active while reading/parsing the JSON body and is cleared in `finally`.

There is no authenticated live-success claim: no developer key was available. The checks exercise successful responses through injected synthetic fixtures only. A real keyed response and actual section-name coverage remain to be verified once an authorised deployment environment provides a key. Repeated execution must still respect the provider's account-wide rate limit; no polling or external scheduling was added here.

## Exact schema v2

Top-level output:

```text
schemaVersion: 2
provider: "511 Alberta"
sourceUrl: "https://511.alberta.ca/"
retrievedAt: ISO UTC string | null
maxReportAgeHours: 6
availability: "available" | "partial" | "unavailable"
highways: Highway[]
error?: { code: string, message: string }
```

Each `Highway` has `id`, `name`, `number`, `availability`, `coverage` and `segments: Segment[]`. All six configured road entries remain present even when no report matches. `coverage` always states: **Reported sections only; complete route coverage is not verified.** Highway availability describes the supplied section reports, never a route being open, clear or safe. No aggregate route `status`, majority `conditions`, shared `lastUpdated` or equipment-law `advisory` is emitted.

Each `Segment` has `id: number|null`, `section`, `roadwayName`, `areaName`, `primaryCondition: string|null`, `secondaryConditions: string[]`, `visibility: string|null`, `reportedAt: ISO UTC string|null`, `availability: "available"|"unavailable"`, `unavailableReason` and `closureReported: boolean`. Source descriptions and condition text are retained per section. Unavailable source text is historical/unknown data, not a current condition: the display must gate it on the section's own availability and report time.

`unavailableReason` is `null`, `missing_source_time`, `invalid_source_time`, `future_source_time`, `stale_source_time` or `missing_condition`. A closure flag is set only for an available section with an explicit exact `Closed`, `Road closed` or `Roadway closed` condition. A stale closure or text such as “Closure lifted” cannot establish a current closure. The actual section detail remains separate from every other section.

## Identity and timestamps

Configured road IDs are `hwy-1-banff`, `hwy-1a-bow-valley`, `hwy-93n`, `hwy-93s`, `lake-minnewanka` and `golf-course-road`. Matching uses explicit whole roadway aliases and recognised area names after whitespace/case normalisation; it does not search location descriptions for a landmark and does not accept an arbitrary name containing “Banff” or “Minnewanka”. The recognised Banff areas are `BANFF`/`BANFF NATIONAL PARK`; 93N additionally accepts explicit Jasper area names, and 93S explicit Kootenay area names. These are conservative configured geographic aliases, not evidence that a live authenticated feed supplies every alias or every section. Bare `Hwy 93` is deliberately ambiguous and does not become 93 South.

A known roadway with a missing/unknown area, an unrecognised roadway suffix, or a missing section description cannot establish coverage. The primary documentation's historical Johnson Lake Road example mentions Lake Minnewanka in its description; it is deliberately not assigned to Lake Minnewanka Road. The Tunnel Mountain Drive example is likewise outside these six configured road groups.

`retrievedAt` is set only after successful JSON retrieval and a recognised array response. Empty/unmatched/stale arrays remain unavailable, even with a retrieval time. HTTP, parsing, timeout, invalid top-level schema and missing-key failures have no retrieval time. Each `LastUpdated` is independently interpreted as an integer number of Unix **seconds**: strings, fractions, negatives, millisecond-sized values and booleans are rejected. A reported zero remains epoch zero and therefore stale, never a missing value or a current report. Future timestamps remain unavailable. No report borrows another section's time.

The six-hour age limit is BanffBound's display policy, not a provider promise that conditions remain unchanged for six hours. A section is unavailable beyond that cutoff. The UI must also expire a previously fresh static page using the same source-time limit. No visibility units are inferred or converted; only the provider's actual text is retained.

## Verification

Passed `node scripts/check-road-source.mjs`, Node syntax checks for all three modules, `git diff --check`, and `git diff --exit-code -- src/data/live`. The standalone default-invocation check also confirmed the actual process had no configured key, made zero network calls, returned schema v2 with six unavailable entries, `retrievedAt: null`, `missing_api_key` and the official source URL.

Fixtures use the documented field names and the two published historical sample rows as exclusion controls, plus clearly synthetic rows for the selected road groups. Checks cover fresh/stale mixed sections, independently retained times, missing/old/future/invalid units, zero ID/time, malformed rows, absent conditions, both secondary-condition forms, unchanged visibility text, ambiguous identities, partial/empty coverage, 401/403/429/503, no retries, unreadable JSON, header/body aborts, and no secret or credential URL in output/diagnostics. No live requests, snapshot writes, build or publication were performed.
