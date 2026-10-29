# BanffBound winter expansion and whole-site review

Reviewed 28 October 2026. This record preserves the full objective: a useful, interactive Banff and nearby-town travel site, comprehensive winter planning, strong search foundations and relevant existing affiliate links. It records verified progress and remaining work, rather than treating a single release as proof of being the world's best site.

## Current site overview

The existing Astro site has a large article library, hotel and trail directories, planning tools, activity pages, transport advice and affiliate integrations. The generated-site crawl covers every HTML document, including redirects. This release adds 10 routes: a towns index and six destination guides, a winter stay finder, a first-lesson guide and a ski-day planner. It rebuilds the winter hub, skiing page, resort comparison, ski pass calculator and Canmore/Banff comparison.

The main structural gaps were a thin winter hub, poor routes from broad discovery to a bookable day, missing first-lesson planning, scattered town coverage and misleading confidence in static prices or stale conditions.

## Implemented visitor journeys

| Requirement | Implementation and evidence |
| --- | --- |
| Banff and nearby communities | `/towns/` and Banff, Canmore, Lake Louise, Field/Yoho, Golden and Kananaskis guides; each explains geography, transport, a winter day, seasonal limits, stays and official sources. |
| Winter discovery | `/winter/` links 20 guides and tools, with interest/search filters, an empty state/reset, six seasonal panels, a flexible four-day outline and visible FAQs. |
| First ski or snowboard days | `/learn-to-ski/` covers lesson/ticket/rental inclusions, three resort options, children, check-in, layers, progression and a saved readiness checklist. |
| Interactive ski days | `/ski-day-planner/` uses ability, base, resort, transport and group; includes Canmore/Lake Louise transfer caveats, conservative relative allowances, URL sharing, printing and a saved checklist. |
| Pass cost comparison | Calculator uses current user-entered CAD quotes, exact resort-day counts, complete multi-day coverage and confirmed shared pass days. No fabricated live price table or unlimited Ikon access. |
| Heli-skiing | Existing canonical guide replaced with Golden/Panorama operator geography, prerequisites, transfers, equipment, quote comparison, weather/cancellation questions and direct official sources. |
| Winter stays and affiliates | Eight contrasting hotel/lodge picks; combined base/party/priority filters; explicit tradeoffs, provider checks, existing property Expedia URLs and commercial labels. |
| Winter activity detail | Eighteen reviewed specialist, activity and trip overrides replace canonical articles; metadata flows to listings. Source records are retained alongside this audit. |
| Search foundations | Production-origin query-free canonicals, absolute social images, visible matching FAQ schema on new hubs/tools, destination/list/article/breadcrumb schema, contextual internal links and a revised `llms.txt`. Redirected articles remain generated but are removed from editorial listings. |
| Content reliability | Dated Parks closure notices, precise tire/ice/tubing guidance, removal of fabricated or unsupported claims from reviewed copy, and source links. |
| Current conditions | Homepage and conditions page suppress missing/expired snapshots. Weather/roads expire after 6h; trails/snow after 24h. Browser expiry and no-JS fallbacks prevent old static cards looking current. |

## Whole-site technical findings and repairs

The first built-site crawl found seven broken internal links, including malformed generated anchors. All seven were repaired; the garbled Ink Pots introduction and related nested anchors were also cleaned up. The audit checks local routes/assets, selected fragments, H1 counts, canonicals, descriptions and JSON-LD parsing. Its machine-readable output is `built-site-audit-2026-10-28.json`.

The local checkout was initially behind GitHub. Before preparing the release branch, `origin/main` was fetched and inspected: its intervening changes affected only the five automated live-data files. The feature branch starts from that current main. Those snapshots were dated 2 October 2026 and already expired at review time. This is why dated official-report fallbacks are required even when a build succeeds.

The production build remains `npm run build`, including data fetching. `npm run build:cached` reproduces the Astro/Pagefind output without mutating snapshots. CI also runs the generated-site audit on the winter cluster. Local cached builds prove compilation and indexing, not production deployment, data freshness or search rankings.

## Verification record

- Astro production asset build and Pagefind index completed successfully.
- Workspace crawl: 602 generated HTML documents, 560 indexable documents; zero broken internal links, missing local assets, H1/canonical/description issues or JSON-LD parse errors. The 404 page is explicitly noindex.
- A clean archive of release commit `d18fe5f`, with no unrelated untracked public or social files, also built and indexed successfully: 601 generated HTML documents, 560 indexable documents and zero audit findings. See `release-site-audit-2026-10-28.json`.
- Browser checks at desktop and 390px phone width: winter category/search/empty/reset/month selection; ski-planner updates, URL restoration, checklist persistence and query-free canonical; hotel combined filters, no-match/reset and URL state; town-priority recommendations; mobile article tables and correct modified date; production Pagefind result for the heli-ski guide; unavailable conditions fallbacks. All six destination guides fit the phone viewport without horizontal overflow.
- Shared planning logic was checked across all 288 input combinations. Calculator checks include missing days, complete/incomplete quotes, shared-day coverage and date confirmation. A review found and fixed validation of inactive optional inputs; a browser regression check confirmed an unused fractional pass allowance and zero-day quote no longer block a valid two-day comparison.
- Source and component compilation checks passed for the new guides and tools.

## Remaining full-goal work

Production deployment and post-release verification are separate from this local record. Search ranking/revenue outcomes require actual post-release observations; schema and keywords alone are not proof of either.

The whole-site technical crawl is not a factual verification of every legacy article, hotel amenity, restaurant, route or booking term. Continue source reviews of older resort, Christmas/event, après-ski and other seasonal content, especially articles reached from the broad legacy blog library. Hotel directory templates now omit undated quoted rates, unverified star classifications and guest-score/count aggregates from cards, map, details and schema; Mount Royal’s dining and maintenance information is corrected. Current booking-provider links remain intact. The wider property amenities and photo library still needs an editorial audit.

Other follow-up areas: verify real HTTP redirects at the existing host (Cloudflare Pages `_redirects` is not sufficient for DigitalOcean), inspect data-refresh failures including the road API, check attribution/affiliate reporting in the live account, and use current search-performance data to guide the next content improvements. Preserve the established identity and hosting setup.
