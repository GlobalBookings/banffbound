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

`build:cached` compiles the site and Pagefind search from the committed data snapshots without refreshing them. `build` first runs `scripts/fetch-live-data.mjs`, then compiles and indexes. `fetch-data` updates the five JSON files under `src/data/live/`; review those diffs before committing. A successful build is not a deployment receipt.

`audit:site` crawls generated HTML for internal routes, fragments, local assets, one H1, production canonicals, descriptions and JSON-LD parse errors. It writes `research/built-site-audit-2026-10-28.json` and fails for route, asset or metadata errors in the winter cluster. It does not verify external availability, travel advice, search rankings or affiliate payouts.

## Main source areas

- `src/pages/`: static pages and dynamic blog/hotel/trail/town routes.
- `src/data/blogPosts.ts`: canonical listing metadata; `allBlogPosts` also retains redirected slugs for generated redirect pages.
- `src/data/blogContent.ts`, `blogContent3.ts`: legacy article HTML. `winterGuideOverrides.ts`, `winterActivityOverrides.ts` and `winterTripOverrides.ts` replace reviewed winter articles, and their metadata updates flow into the listings.
- `src/data/winterHub.ts`: winter guide directory, month advice and FAQs.
- `src/data/skiPlanning.ts`: ski day planning suggestions and relative time allowances.
- `src/data/towns.ts`: six destination guides.
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

The existing deployment notes describe DigitalOcean App Platform behind Cloudflare, with `main` triggering a production build. Preserve that hosting setup. The Cloudflare Pages `_redirects` format is not reliable on this host; Astro-generated redirect stubs are used for blog consolidations. Confirm actual HTTP behavior before changing redirect strategy.

Review a scoped branch/PR and validate the final production domain after release. Keep unrelated local automation/social work out of site commits. Source review evidence for this winter expansion is under `research/winter-*-sources-2026-10-28.md` and the current site audit.
