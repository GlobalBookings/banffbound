# BanffBound

Astro static travel site for Banff, Lake Louise, Canmore and the nearby Canadian Rockies. Production domain: https://banffbound.com.

## Development and checks

Use Node 20+ and the committed package lock.

```sh
npm ci
npm run dev
npm run build:cached
npm run audit:site
npm run preview
```

`build:cached` compiles the site and Pagefind search from the committed data snapshots without refreshing them. `build` first runs `scripts/fetch-live-data.mjs`, then compiles and indexes. `fetch-data` updates the six JSON files under `src/data/live/`; review those diffs before committing. A successful build is not a deployment receipt.

`node scripts/check-weather-source.mjs`, `node scripts/check-snow-source.mjs` and `node scripts/check-source-freshness.mjs` check provider identity, missing/zero values, explicit periods, source evidence, failures and clock/calendar expiry without writing snapshots. `node scripts/check-day-ideas.mjs` checks outing constraints and builder handoffs.

`node scripts/check-road-source.mjs` checks key-gated 511 Alberta responses and independent section times. `node scripts/check-town-events.mjs` checks the bounded Town feed snapshot, failure states and date filters. `node scripts/check-affiliate-navigation.mjs` ensures trackers cannot block native booking navigation. These checks use offline fixtures and do not send test bookings or conversions.

`node scripts/check-trail-directory.mjs` exercises actual trail map loading, failures/retry, filtered markers and legacy transport suppression.

`node scripts/check-trip-planner.mjs` checks the real planning module using Astro’s installed compiler: seasonal/legacy templates, invalid shared state, limits, transport advice and affiliate identifiers.

`audit:site` crawls generated HTML for internal routes, fragments, local assets, one H1, production canonicals, descriptions, duplicate indexable titles/canonicals and JSON-LD parse errors. It writes `research/built-site-audit-2026-10-28.json` and fails for route, asset or metadata errors in the winter cluster. It does not verify external availability, travel advice, search rankings or affiliate payouts.

## Main source areas

- `src/pages/`: static pages and dynamic blog/hotel/trail/town routes.
- `src/data/blogPosts.ts`: canonical listing metadata; `allBlogPosts` also retains redirected slugs for generated redirect pages.
- `src/data/blogContent.ts`, `blogContent3.ts`: legacy article HTML. `winterGuideOverrides.ts`, `winterActivityOverrides.ts`, `winterTripOverrides.ts`, `winterResortOverrides.ts` `winterSeasonOverrides.ts`, `winterWarmUpOverrides.ts`, `winterWellnessLegacyOverrides.ts` and `winterLibraryOverrides.ts` replace reviewed winter articles, and their metadata updates flow into the listings.
- `src/data/winterHub.ts`: winter guide directory, month advice and FAQs.
- `src/data/tripPlanner.ts`: seasonal itinerary catalogue, seven templates, validated share-state and transport checks for the editable trip builder.
- `src/data/weatherPlanning.ts`: sourced 1991–2020 temperature normals, seasonal planning and primary camera/report links.
- `src/data/townFeedModel.mjs` and `src/utils/townEvents.ts`: shared Town events/news validation, Mountain Time windows and stale/unavailable states; pages make no feed requests during rendering.
- `src/data/dayIdeas.ts`: outing filters and one-day links using the shared trip catalogue.
- `src/components/WeatherSnapshot.astro`: separately dated ECCC observations and forecast periods, with browser expiry and official-source fallbacks.
- `scripts/lib/eccc-weather.mjs`: validated official Banff and Lake Louise weather responses.
- `src/data/skiPlanning.ts`: ski day planning suggestions and relative time allowances.
- `src/data/towns.ts`: six destination guides.
- `src/data/trailPlanning.ts` and `trailAlternatives.ts`: directory eligibility, park/report identity and source-based route comparison plans.
- `src/data/hotels.ts`: property records with source-verified, indicative or unavailable coordinate provenance; synthetic map positions are not generated.
- `src/utils/dataFreshness.ts`: snapshot age checks and client expiry for the homepage and conditions page.
- `src/components/`, `src/layouts/`, `src/styles/`: shared navigation, metadata, article display and design.
- `public/`: static assets; Pagefind output is generated into `dist/pagefind/`.
- `agents/` and `social-endpoint/`: separate automation projects; they are not part of the Astro build.

## Editorial and affiliate conventions

Keep factual source links and an actual review date. Do not refresh article dates merely because a build ran. A dated conditions snapshot is not a live report; unavailable values must not become zero or an open/safe status. Winter closures, lift operations, ice conditions and transport need official current checks.

Existing partner identifiers:

- Expedia hotels: `camref=1101l3MtWX`; reuse property links in `src/data/hotels.ts`.
- GetYourGuide: `partner_id=QW960HO`.
- Amazon Canada: `tag=banffbound-20`.

Label commercial links and use `rel="sponsored noopener"` for new affiliate links opening in another tab. Direct operator information links must not imply a commercial relationship. Preserve existing partner IDs; a syntactically correct link does not prove a tracked sale.

## Hosting and release

The existing deployment notes describe DigitalOcean App Platform behind Cloudflare, with `main` triggering a production build. Preserve that hosting setup. The host ignores Cloudflare Pages `_redirects` files. Native segment-prefix301 rules now cover the40 reviewed blog aliases, with both slash variants and query preservation verified against production. The actual app rejects exact path matches despite current documentation; use the public mapping plan and live receipt as evidence. Static Astro redirect stubs remain a fallback. `node scripts/check-production-redirects.mjs` checks the source/host-plan mapping offline; add `--live` only for an explicitly intended public response audit. Never commit full app specs or environment values.

Review a scoped branch/PR and validate the final production domain after release. Keep unrelated local automation/social work out of site commits. Source review evidence for this winter expansion is under `research/winter-*-sources-2026-10-28.md` and the current site audit.
