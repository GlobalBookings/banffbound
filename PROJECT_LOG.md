# BanffBound — Project Log

## Site Overview
- **URL:** banffbound-33cfa.ondigitalocean.app (banffbound.com)
- **Stack:** Astro static site on DigitalOcean App Platform
- **Repo:** github.com/GlobalBookings/banffbound
- **Pages:** 443
- **Branch:** main

---

## What's Been Built

### Core Site (Phase 1)
- Astro static site with Banff-themed design system (forest green + gold palette)
- 5 core pages: Home, Things to Do, Eat & Drink, Lakes, Activities
- Global CSS with design tokens, responsive breakpoints
- BLLT-style utility bar header (events, weather, park pass links)
- Footer with site links

### Content Expansion (Phase 2)
- **146 SEO blog posts** targeting high-volume Banff search queries
- Blog index with category filtering
- 9 category pages: Hiking, Skiing, Biking, Paddling, Scenic Drives, Wildlife, Wellness, Arts & Culture, Shopping
- Summer + Winter seasonal pages
- Banff National Park overview page

### Monetization (Phase 3)
- **GetYourGuide** affiliate widget (partner_id: QW960HO) on Tours page
- **Expedia** affiliate search widget (camref: 1101l3MtWX) on Hotels page
- **Amazon Associates** affiliate links (tag: banffbound-20) in gear posts + packing list generator
- **Google Analytics 4** (G-2DP7J42ZW0) with 7 event types
- **Google Ads** conversion tracking (AW-17246982814)

### Hotel Directory (Phase 4)
- 95 hotels scraped from Expedia with Expedia-level detail
- Individual hotel pages with gallery, sticky booking strip, review callout, amenities
- Interactive Leaflet map with 95 plotted markers
- Real Bynder CDN imagery for 15 major hotels
- Hotel schema markup (JSON-LD)
- **URL param auto-filtering** from mega menu (area, type)

### Trail System (Phase 5)
- **70 official Parks Canada trails** across 4 areas (Banff, Lake Louise, Castle Junction, Icefields Parkway)
- Individual trail detail pages at /trails/[slug] with hero, stats bar, Leaflet map, safety tips, nearby trails
- Interactive trail map with filters (difficulty, type, season, text search)
- Grid/Map toggle, color-coded difficulty markers
- JSON-LD structured data (TouristAttraction schema)
- Data source: Parks Canada (Crown copyright, open license)

### Eat & Drink (Phase 6)
- 13 restaurants + 5 bars/cafes with real photos from venue websites
- Full contact details, hours, website/menu/reservation links
- Horizontal card layout with highlight chips
- Multiple rounds of image verification and replacement

### Interactive Tools (Phase 7)
- **Trail Map** (/trail-map) — Leaflet map, 70 trails, filters, grid/map toggle
- **What To Do Today** (/what-to-do-today) — Weather-based suggestions via OpenWeatherMap API
- **Trip Reports** (/trip-reports) — User submissions via localStorage, 10 pre-seeded stories
- **Packing List Generator** (/packing-list) — Month + activity checklist, Amazon affiliate links, localStorage
- **Currency Converter** (/currency-converter) — Live rates from ExchangeRate-API, typical Banff costs
- **Trip Builder** (/trip-builder) — 5 templates, day-by-day itineraries

### Trust & Polish (Phase 8)
- Breadcrumb navigation with JSON-LD BreadcrumbList schema on all inner pages
- Article/Hotel structured data
- Skip-to-content link + focus-visible styling + ARIA roles
- loading=lazy on below-fold images, loading=eager on heroes
- Preconnect hints for external resources
- Last updated timestamps on blog posts
- WCAG AA color contrast verified

### Navigation (Phase 9)
- **BLLT-style mega menu** with 3 dropdowns:
  - Things To Do (15 links + 3 featured image cards)
  - Visitor Info (9 links + 3 featured cards)
  - Where To Stay (8 links + 3 featured cards) — with auto-filter on click
- Direct links: Trip Ideas, Guides
- Mobile: hamburger with accordion sections (no photos)
- Utility bar: events, weather, park pass

### Weather & Webcams
- Live weather tabs (Banff/Lake Louise) via OpenWeatherMap API
- 9 webcam feeds with filtering
- Snow reports for 3 ski resorts (Lake Louise, Sunshine, Norquay)
- OpenWeatherMap API key stored in env

---

## What's Next — Agent System

### Goal
Build autonomous agents that run on a schedule to manage PPC campaigns, discover keyword opportunities, and optimize for affiliate revenue (GetYourGuide, Expedia, Amazon).

### Agent 1: PPC Review (Priority)
- **Schedule:** Daily at 8am
- **Purpose:** Audit Google Ads campaigns, identify waste, auto-pause underperformers, send Slack briefings
- **Inputs:** Google Ads API, affiliate revenue data (GYG, Expedia)
- **Outputs:** Slack alerts, campaign adjustments, ROI reports
- **Status:** Planning — needs Google Ads API setup

### Agent 2: Keyword Miner (Priority)
- **Schedule:** Daily at 10am
- **Purpose:** Discover new keyword opportunities from Search Console, competitor gaps, seasonal trends
- **Inputs:** Google Search Console API, current sitemap/content inventory
- **Outputs:** Keyword queue, content briefs, auto-generate new blog posts if high-confidence
- **Status:** Planning — needs Search Console API setup

### Agent 3: Anomaly Detector (Future)
- **Schedule:** Hourly
- **Purpose:** Monitor traffic, conversion rates, affiliate revenue for anomalies
- **Inputs:** GA4 API, affiliate dashboards
- **Outputs:** Slack/Telegram alerts

### Agent 4: LP Optimizer (Future)
- **Schedule:** Daily at 11am
- **Purpose:** Test landing page variations, optimize conversion paths
- **Inputs:** GA4 API, hotel/trail page performance data
- **Outputs:** A/B test proposals, auto-deploy winning variants

### Agent 5: Content/SEO (Future)
- **Schedule:** Daily at 2pm
- **Purpose:** Identify organic growth opportunities, content gaps, technical SEO issues
- **Inputs:** Search Console API, sitemap, competitor analysis
- **Outputs:** Content queue, SEO fix queue

### Agent 6: CRO Daemon (Future)
- **Schedule:** Continuous
- **Purpose:** Deep hypothesis testing for conversion rate optimization
- **Inputs:** Analytics, heatmaps, user flow data
- **Outputs:** Telegram proposals with statistical backing

---

## API & Credentials Reference

| Service | Key/ID | Status |
|---------|--------|--------|
| GetYourGuide | partner_id: QW960HO | Active |
| Expedia | camref: 1101l3MtWX | Active |
| Amazon Associates | tag: banffbound-20 | Active |
| Google Analytics 4 | G-2DP7J42ZW0 | Active |
| Google Ads | AW-17246982814 | Active (tracking only) |
| OpenWeatherMap | (in .env) | Active |
| Google Ads API | — | Needs setup |
| Google Search Console | — | Needs setup |
| Slack Webhook | — | Needs setup |

---

## Tech Debt / Known Issues
- Some Unsplash images may not be Banff-specific (generic mountain photos)
- Hotel data is a point-in-time scrape; prices/reviews will become stale
- No automated content freshness checking
- Blog posts don't have individual author pages
- No 404 page customization
