# BanffBound winter expansion and whole-site review

Reviewed 28 October 2026. This record preserves the full objective: a useful, interactive Banff and nearby-town travel site, comprehensive winter planning, strong search foundations and relevant existing affiliate links. It records verified progress and remaining work, rather than treating a single release as proof of being the world's best site.

## Current site overview

The existing Astro site has a large article library, hotel and trail directories, planning tools, activity pages, transport advice and affiliate integrations. The generated-site crawl covers every HTML document, including redirects. This release adds 10 routes: a towns index and six destination guides, a winter stay finder, a first-lesson guide and a ski-day planner. It rebuilds the winter hub, skiing page, resort comparison, ski pass calculator and Canmore/Banff comparison.

The main structural gaps were a thin winter hub, poor routes from broad discovery to a bookable day, missing first-lesson planning, scattered town coverage and misleading confidence in static prices or stale conditions.

## Implemented visitor journeys

| Requirement | Implementation and evidence |
| --- | --- |
| Banff and nearby communities | `/towns/` and Banff, Canmore, Lake Louise, Field/Yoho, Golden and Kananaskis guides; each explains geography, transport, a winter day, seasonal limits, stays and official sources. |
| Winter discovery | `/winter/` links 21 guides and tools, with interest/search filters, an empty state/reset, six seasonal panels, a flexible four-day outline and visible FAQs. |
| First ski or snowboard days | `/learn-to-ski/` covers lesson/ticket/rental inclusions, three resort options, children, check-in, layers, progression and a saved readiness checklist. |
| Interactive ski days | `/ski-day-planner/` uses ability, base, resort, transport and group; includes Canmore/Lake Louise transfer caveats, conservative relative allowances, URL sharing, printing and a saved checklist. |
| Editable multi-day plans | `/trip-builder/` now has seven winter/summer templates and 23 activity ideas. Edit one to seven days, move/remove outings and days, undo, save locally, share validated state or print. Older template links remain supported; incoming links preserve an existing saved trip until an explicit edit. |
| Pass cost comparison | Calculator uses current user-entered CAD quotes, exact resort-day counts, complete multi-day coverage and confirmed shared pass days. No fabricated live price table or unlimited Ikon access. |
| Heli-skiing | Existing canonical guide replaced with Golden/Panorama operator geography, prerequisites, transfers, equipment, quote comparison, weather/cancellation questions and direct official sources. |
| Winter stays and affiliates | Eight contrasting hotel/lodge picks; combined base/party/priority filters; explicit tradeoffs, provider checks, existing property Expedia URLs and commercial labels. |
| Winter activity detail | Twenty-six reviewed specialist, activity, trip, resort and seasonal overrides replace canonical articles; metadata flows to listings. Source records are retained alongside this audit. |
| Search foundations | Production-origin query-free canonicals, absolute social images, visible matching FAQ schema on new hubs/tools, destination/list/article/breadcrumb schema, contextual internal links and a revised `llms.txt`. Redirected articles remain generated but are removed from editorial listings. |
| Content reliability | Dated Parks closure notices, precise tire/ice/tubing guidance, removal of fabricated or unsupported claims from reviewed copy, and source links. |
| Photo planning | `/photo-spots/` retains ten destinations with season/light filters, explicit Jasper geography, source-linked access checks and NRC sun-time resources. Unsafe framing advice and the broken sunrise algorithm were removed. |
| Current conditions | Homepage and conditions page suppress missing/expired snapshots. Weather/roads expire after 6h; trails/snow after 24h. Browser expiry and no-JS fallbacks prevent old static cards looking current. |

## Whole-site technical findings and repairs

The first built-site crawl found seven broken internal links, including malformed generated anchors. All seven were repaired; the garbled Ink Pots introduction and related nested anchors were also cleaned up. The audit checks local routes/assets, selected fragments, H1 counts, canonicals, descriptions, duplicate indexable titles/canonicals and JSON-LD parsing. A duplicate viewpoint pair was consolidated to the existing singular URL with a sourced replacement guide; the small June search report showed traffic on that retained URL and no row for the plural. That historical report was used for URL preservation, not as a current ranking claim. Its machine-readable output is `built-site-audit-2026-10-28.json`.

The local checkout was initially behind GitHub. Before preparing the release branch, `origin/main` was fetched and inspected: its intervening changes affected only the five automated live-data files. The feature branch starts from that current main. Those snapshots were dated 2 October 2026 and already expired at review time. This is why dated official-report fallbacks are required even when a build succeeds.

The production build remains `npm run build`, including data fetching. `npm run build:cached` reproduces the Astro/Pagefind output without mutating snapshots. CI also runs the generated-site audit on the winter cluster. Local cached builds prove compilation and indexing, not production deployment, data freshness or search rankings.

## Verification record

- Astro production asset build and Pagefind index completed successfully.
- Workspace crawl: 602 generated HTML documents, 559 indexable documents; zero broken internal links, missing local assets, H1/canonical/description issues or JSON-LD parse errors. The 404 page is explicitly noindex.
- A clean archive of release commit `3dee2e7`, with no unrelated untracked public or social files, built and indexed successfully: 601 generated HTML documents, 559 indexable documents and zero audit findings. The trip-planning checks also passed against that archive. See `release-site-audit-2026-10-28.json`.
- Browser checks at desktop and 390px phone width: winter category/search/empty/reset/month selection; ski-planner updates, URL restoration, checklist persistence and query-free canonical; hotel combined filters, no-match/reset and URL state; town-priority recommendations; mobile article tables and correct modified date; production Pagefind result for the heli-ski guide; unavailable conditions fallbacks. All six destination guides fit the phone viewport without horizontal overflow.
- Shared planning logic was checked across all 288 input combinations. Calculator checks include missing days, complete/incomplete quotes, shared-day coverage and date confirmation. A review found and fixed validation of inactive optional inputs; a browser regression check confirmed an unused fractional pass allowance and zero-day quote no longer block a valid two-day comparison.
- Trip editor browser checks passed: seasonal removals/undo, three-outing and seven-day limits, day reordering, old family-template links, URL restoration, query-free canonical, base-matched hotel links, phone layout and invalid incoming links preserving the saved trip. The Node planning checks cover all seven templates and transport regressions.
- Hotel shortlist browser checks passed for combined filters, no-match/reset and the full-kitchen selection; hotel and accommodation layouts fit 390px. Photo season/light filters and reset work at 390px. The plural viewpoint URL restores the new singular guide; the redirect stub is noindex, targets the singular canonical and is excluded from the sitemap.
- Source and component compilation checks passed for the new guides and tools.

## Remaining full-goal work

Production deployment and post-release verification are separate from this local record. Search ranking/revenue outcomes require actual post-release observations; schema and keywords alone are not proof of either.

The whole-site technical crawl is not a factual verification of every legacy article, hotel amenity, restaurant, route or booking term. The linked resort, snowboarding, Christmas, SnowDays and après-ski guides have now been reviewed against current official sources. Continue the broader legacy article and property review. Hotel directory templates now omit undated quoted rates, unverified star classifications and guest-score/count aggregates from cards, map, details and schema; Mount Royal’s dining and maintenance information is corrected. The eight shortlisted hotel records now have sourced facility/room/dining/access details and 21 verified official photos. Lake Louise Inn and Fairmont Chateau Lake Louise booking IDs were corrected from Expedia’s own property pages while retaining the affiliate tag. Lake Louise Inn and Chateau map coordinates match the official property locations. Other directory records still need an editorial audit.

Other follow-up areas: verify real HTTP redirects at the existing host (Cloudflare Pages `_redirects` is not sufficient for DigitalOcean), inspect data-refresh failures including the road API, check attribution/affiliate reporting in the live account, and use current search-performance data to guide the next content improvements. Preserve the established identity and hosting setup.
