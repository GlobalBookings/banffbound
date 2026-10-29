# Town events/news journey — reviewed October 28, 2026

## Scope and source discovery

The Town's current RSS directory explicitly lists the endpoints previously used by the site. They are not replaced speculatively:

- Official feed directory: https://www.banff.ca/Rss.aspx
- Calendar Events category: https://www.banff.ca/RSSFeed.aspx?ModID=58&CID=Events-25
- All News Releases: https://www.banff.ca/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml
- Full calendar, including other categories: https://banff.ca/Calendar.aspx
- Full news releases: https://banff.ca/CivicAlerts.aspx

The RSS directory and calendar identify separate categories for arts, drop-ins, resident programmes and other activities. Events-25 is therefore a selected Town category, not a complete visitor-event calendar. The news feed contains municipal announcements as well as event notices; publication is not proof that an advisory remains in force.

Direct bounded fetches on both official hostnames returned XML. The retained www endpoints gave approximately 7 KB of event XML and 4 KB of news XML. The dated shared snapshot was fetched at approximately 2026-10-29 05:58 UTC (October 28 Pacific) with six validated event items and seven news items. Only the new src/data/live/town-events.json was written. The five existing live JSON files were not refreshed.

## Single bounded retrieval path

- New fetcher: scripts/fetchers/town-events.mjs
- New model/validation helper: src/data/townFeedModel.mjs
- New snapshot: src/data/live/town-events.json
- New browser enhancement: src/utils/townEvents.ts
- Regression checks: scripts/check-town-events.mjs
- Existing orchestrator registry gains only one isolated town-events entry, writing town-events.json.
- Both /events and the homepage event section import that snapshot. All three page-level rss-parser.parseURL calls are removed.

The producer starts event and news requests in parallel with an eight-second per-request deadline, including body reading and parsing. A timeout race also bounds a transport mock that ignores AbortSignal. There are no automatic retries. One source failure preserves the other source's valid results.

The existing rss-parser dependency parses bounded XML strings only; it does not make network requests. Bodies over 512 KB, more than 500 feed items, DTD/entity declarations, malformed XML, unexpected channel identities and unsafe redirect hosts are rejected. No new dependency is added.

## Contract and validation

Top-level marker: schemaVersion 1 and provider Town of Banff RSS. The object includes retrieval completion and separate feeds.events / feeds.news results.

Each feed includes its configured sourceUrl/pageUrl, retrievedAt, sourceUpdatedAt, sourceUpdatedAtText, sourceTimeIssue, status, rejectedCount and items.

- available: verified feed with valid items.
- empty: verified source returned zero raw items.
- partial: some raw items failed validation, even if all were rejected. This never becomes a valid empty feed.
- unavailable: retrieval, XML, identity, size or other validation failed.
- The read model adds stale for expired/future retrieval clocks.

Item detail links must use HTTPS on banff.ca or www.banff.ca, have no credentials or unusual port, and match the known Calendar.aspx?EID=positive-number or CivicAlerts.aspx?aid=positive-number detail form. Additional/duplicate/redirect query parameters are rejected. Third-party URLs, protocol-relative URLs, javascript URLs, malformed IDs and lookalike hosts do not reach the page.

HTML is reduced to bounded plain text and rendered through Astro escaping/textContent. Enclosures are not copied or loaded. Event start/end civil dates must be explicitly supplied in calendarEvent:EventDates in the verified full-date formats; missing, impossible, reversed or ambiguous dates are withheld rather than inferred from publication, the title or our calendar. Times and location remain labelled source text. Unsupported future formats can create a partial result requiring a parser review, not fabricated dates.

Duplicate URL/date occurrences collapse; distinct dated occurrences remain. Events are sorted by explicit start date, and past end dates are filtered at display time. News keeps separately labelled publication timestamps.

## Time semantics and freshness

- retrievedAt records fetch completion, never the build clock.
- Source lastBuildDate is labelled as a feed timestamp, not article modification or event occurrence.
- Item pubDate is publication, not event start.
- Event civil-date filtering uses America/Edmonton, including Mountain Time daylight-saving transitions. Event time text is preserved; confirm the organiser's full schedule.
- RFC publication/feed instants require explicit offsets. Unqualified date strings are not converted into guessed instants.

At review, the Town's lastBuildDate was about an hour later than the actual retrieval instant. The original label is preserved, sourceUpdatedAt is null and sourceTimeIssue explains that the feed clock is unverified. That future time does not make a snapshot fresh.

Retrieval snapshots expire after 24 hours. The server read model rejects expired/future retrieval clocks and revalidates stored links/dates; browser enhancements repeat expiry and event-day checks on load, periodically and on returning to the tab. Missing, failed, partial, valid-empty, no-remaining-date and stale states are worded distinctly. No state claims that nothing is happening across Banff.

Without JavaScript, dated feed result panels are hidden and the official-calendar/news fallback is made visible because expiry cannot be rechecked. The winter festival editorial section, planning guidance and direct source links remain available. Filters are only shown after initialization. Date/search filters, invalid-range guidance, result count, reset and expiry messages use existing DOM elements; no unsafe HTML insertion or browser feed request occurs.

Stored-item read validation uses the same retrieval-plus-five-minute publication bound as normalization. A future stored publication timestamp rejects that item and makes the view partial, even when the event's civil date otherwise looks valid; it does not become a verified empty result.

## Winter planning sources

The planning section is independent of Town feed availability:

- Christmas overview: https://www.banfflakelouise.com/events/christmas
  - Published programme November 12, 2026–January 3, 2027; individual events have selected dates.
- Christmas Spirit: https://www.banfflakelouise.com/events/christmas/christmas-spirit
  - Selected dates and free advance reservation; a free event is not automatic walk-up access.
- Christmas Market: https://banffchristmasmarket.com/
  - Current operator page lists November 19–December 13, 2026 Thursday–Sunday. /events deliberately says selected dates and links the current programme.
- SnowDays: https://www.banfflakelouise.com/events/snowdays
  - Published January 21–February 7, 2027; individual programmes differ.
- Ice Magic: https://www.banfflakelouise.com/events/snowdays/ice-magic
  - Published February 3–7, 2027, times TBC. Eligible accommodation/operator/local access conditions and mandatory event shuttle are separate from an ordinary hotel reservation; event parking unavailable.

Pages link the existing detailed winter festival guides, car-free journey, winter stays and ski-day planner. Dates are expressly for the stated 2026/27 season, not rolled-forward forecasts. Direct source links are labelled as organiser/provider links. No affiliate identifiers or offers are introduced.

## Verification and handoff

- Offline regressions and captured official XML normalization passed: node scripts/check-town-events.mjs --fixtures /tmp/banff-town-events.txt /tmp/banff-town-news.txt
- Covered source identity, available/empty/partial/failure, unsafe links, missing/impossible/reversed dates, separate pub/event dates, Mountain midnight/DST, source-clock drift, snapshot expiry, duplicate occurrences, partial failure, concurrent request count and request/body deadlines.
- Follow-up regressions cover stored 2099 publication dates for events/news, the exact five-minute read-time boundary, and no-JS rules hiding feed results while showing official fallbacks.
- A focused browser-helper DOM harness passed date filtering, search, invalid ranges, reset and expiry without network or unsafe HTML.
- Direct Astro compiler transforms of /events and homepage passed with zero errors. Visible FAQ and schema on /events use the same array.
- Homepage changes are restricted to the old event fetch/imports and event section/script. Non-event content and metadata are unchanged.
- No site build or publication performed. Root owns final browser/build QA, sitemap/llms/CI integration and rollout.
