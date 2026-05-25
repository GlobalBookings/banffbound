# BanffBound Implementation Plan

Cross-referenced from `claude-3-month-12-month-plan-25may.md` and `deep-research-report-chatgpt-25may.md`, filtered against what the site already has. Items marked [DONE] are already implemented. Everything else is new work.

---

## What BanffBound Already Has

Before acting on any recommendation, here's what's already in place:

- [DONE] Article schema on all blog posts (author, datePublished, dateModified)
- [DONE] Hotel schema on hotel directory pages (starRating, priceRange, aggregateRating, geo)
- [DONE] BreadcrumbList component used on blog posts and hotel directory pages
- [DONE] Organization schema on homepage and about page
- [DONE] GA4 tracking with custom events (affiliate_click, cta_click, scroll_depth, time_on_page, trip_builder events)
- [DONE] Expedia affiliate links on hotel pages and blog content
- [DONE] GetYourGuide affiliate links site-wide (inline, widgets, mid-article CTA)
- [DONE] Named author byline (Jack Chittenden) on all blog posts
- [DONE] lastUpdated timestamps on blog posts (auto-managed by content-refresher agent)
- [DONE] Sitemap auto-generated at /sitemap-index.xml
- [DONE] HTTPS, clean short slugs, canonical URLs
- [DONE] About page with author bio
- [DONE] Editorial policy page
- [DONE] llms.txt for AI crawler discoverability
- [DONE] 296 blog posts across 8 categories
- [DONE] 96 hotel directory pages with Expedia deep-links
- [DONE] 81 trail guides with GPS data
- [DONE] Interactive tools: trip builder, trail map, weather, ski calculator, parking, wildlife tracker
- [DONE] Itinerary content: 3-day, 5-day, 7-day, winter, summer, fall, wellness, adventure, photo tour
- [DONE] Internal linking agent runs automatically
- [DONE] Content refresher agent auto-updates declining posts
- [DONE] Automated blog publishing pipeline

---

## Phase 1: Quick Wins (Week 1-2)

These are low-effort, high-impact changes that can be done immediately.

### 1.1 Rewrite titles and meta descriptions on top 10 pages

The ChatGPT report flagged that page titles don't match how users actually search. Update the `<title>` and `meta description` in these pages:

| Page | Current Title Pattern | New Title |
|------|----------------------|-----------|
| `/hiking` | "Hiking in Banff" | "Best Hikes in Banff 2026 — Easy, Moderate & Hard Trails" |
| `/eat-and-drink` | "Eat & Drink in Banff" | "Best Restaurants in Banff — Cafes, Breweries & Local Picks" |
| `/calgary-to-banff` | "Calgary to Banff 2026" | "How to Get from Calgary to Banff — Shuttle, Drive, Bus & Costs" |
| `/` (homepage) | "Your Complete Guide to Banff" | "Banff Trip Planner 2026 — Itineraries, Hotels, Trails & Local Tips" |
| `/monthly-weather` | "Banff Weather by Month" | "Banff Weather by Month — Best Time to Visit, Crowds & Packing" |
| `/camping` | "Banff Camping Guide" | "Banff Camping Guide 2026 — Campgrounds, Reservations & Fees" |
| `/eat-and-drink` | "Eat & Drink in Banff" | "Best Restaurants in Banff — Cafes, Bars & Fine Dining" |
| `/canmore-vs-banff` | "Canmore vs Banff" | "Canmore vs Banff — Where to Stay for Price, Access & Vibe" |
| `/park-pass` | "Banff Park Pass Guide" | "Banff Park Pass 2026 — Prices, Where to Buy & Best Option" |
| `/lakes` | "Lakes" | "Best Lakes in Banff — Louise, Moraine, Minnewanka & More" |

### 1.2 Add social media profile links to footer

Currently missing from the site entirely. Add links to any active profiles (Instagram, Facebook, Pinterest, YouTube, TikTok) in the Footer component. Also add to the Organization schema `sameAs` array.

### 1.3 Fix shuttle countdown default state

The shuttle-reservations page renders `--` placeholders for the countdown timer. Add a `<noscript>` fallback or server-render a human-readable date string so crawlers see meaningful content.

### 1.4 Deep-link GYG affiliate URLs

Both reports flag this as high priority. Currently most GYG links point to the generic Banff city page (`/banff-l284/?partner_id=QW960HO`). Replace with specific tour product links on:
- Category pages (hiking, wildlife, skiing, lakes, etc.)
- Blog posts that mention specific tours (Johnston Canyon ice walk, Banff Gondola, Lake Minnewanka cruise, etc.)

GYG cookie covers the entire order, so deep-linking to a specific product still earns commission on anything else the user adds to cart.

### 1.5 Add Expedia links to the 8 category pages that lack them

Currently only winter, summer, and wellness pages have Expedia hotel links. Add an Expedia CTA to: hiking, lakes, wildlife, skiing, scenic-drives, biking, paddling, accommodation.

### 1.6 Make blog mid-article CTA contextual

The `BlogLayout.astro` mid-article CTA is identical on every post ("Plan Your Banff Trip / Browse Tours / Check Hotel Deals"). Make it category-aware:
- Hiking posts: link to specific hiking tour + trail map
- Accommodation posts: link to hotel directory + Expedia
- Food posts: link to restaurant guide + GetYourGuide food tours
- Seasonal posts: link to relevant seasonal page + tours

---

## Phase 2: Monetization Stack (Week 2-4)

Both reports agree this is the single biggest revenue lever.

### 2.1 Sign up for Stay22 (Let Me Allez + Nova AI)

Hotels are the highest-AOV affiliate vertical for Banff. Stay22 routes through Booking.com/Expedia/Hotels.com inventory at higher effective rates than direct programs. Install on every page that mentions accommodation.

### 2.2 Sign up for Viator (via ShareASale)

Run alongside GetYourGuide. For each tour mentioned in content, link to whichever platform has better reviews and price. Viator commission is 8%, same as GYG via Travelpayouts.

### 2.3 Sign up for Discover Cars (direct)

70% of profit per sale, 365-day cookie. Add car rental CTAs to:
- Calgary to Banff page
- All Icefields Parkway content
- All itinerary posts
- Canmore vs Banff page

### 2.4 Sign up for Heymondo travel insurance affiliate

Better fit than SafetyWing for the typical 1-2 week Banff vacationer. Add contextual links to planning pages and itinerary posts.

### 2.5 Sign up for Canada Rail Vacations partner program

3-5% on Rocky Mountaineer packages ($1,500-$10,000 AOV). Create or update Rocky Mountaineer/train content.

### 2.6 Consider Lasso for affiliate link management

Consolidates all affiliate links, adds GA4 event tracking, broken-link detection, and A/B testing. ~$59/mo. Evaluate ROI after Stay22 + Discover Cars are producing revenue.

---

## Phase 3: On-Page CRO (Week 3-5)

### 3.1 Add comparison tables to money pages

Both reports stress that comparison tables earn 25.7% more AI citations and convert significantly better. Add side-by-side comparison tables to:
- Where to stay in Banff (hotels by area/budget)
- Banff vs Jasper
- Sunshine vs Lake Louise vs Norquay
- Calgary to Banff transport options
- Tour comparison (GYG vs Viator vs direct operator)

### 3.2 Add sticky CTA to long-form posts

A fixed-position "Check availability" or "Book this tour" bar that appears after scrolling past the first section. Test on top 10 highest-traffic blog posts first.

### 3.3 Add direct-answer paragraphs for AI Overview optimization

Lead each blog post with a 2-3 sentence direct answer to the page's primary query. Keep sentences under 10 words where possible. This is the format that earns the most LLM citations per the AirOps and Wix Studio research.

### 3.4 Add Trip Builder CTA to relevant blog posts

The trip builder is one of BanffBound's best conversion tools but it's not linked from blog content. Add contextual CTAs on itinerary, planning, and "things to do" posts.

---

## Phase 4: Technical SEO Fixes (Week 4-6)

### 4.1 Consolidate overlapping ski content

The ChatGPT report flagged multiple near-identical ski guide titles that risk cannibalization. Audit all ski-related slugs, pick one pillar page, redirect duplicates.

### 4.2 Server-render interactive tool defaults

The weather page, ski calculator, and shuttle countdown all render empty/placeholder states for crawlers. Add meaningful server-rendered default content that works without JavaScript.

### 4.3 Validate robots.txt and canonical tags

Run a crawl (Screaming Frog or similar) on the full site to verify:
- All pages have correct canonical tags
- No accidental noindex directives
- Sitemap is referenced in robots.txt
- No orphan pages missing from the sitemap

### 4.4 Add BreadcrumbList schema to all pages

Currently only on blog posts and hotel directory. Extend to all category pages, trails, and tools.

### 4.5 Core Web Vitals audit

Run PageSpeed Insights on top 20 URLs. Target:
- LCP under 2.5s
- CLS under 0.1
- INP under 200ms

Fix any failures. Astro's static output should score well but image optimization and font loading need verification.

---

## Phase 5: Content System (Month 2-3)

### 5.1 Create 6-10 high-conversion "money pages"

These are the pages both reports identify as highest revenue potential. Some already exist and just need updating with comparison tables and stacked affiliate links:

1. **"Moraine Lake 2026: How to Actually Get There"** — shuttle deep-links, parking reality, timing
2. **"Calgary to Banff: Airporter vs Brewster vs Rental Car Cost Breakdown"** — Discover Cars + GYG/Viator
3. **"Best Banff Tours by Category"** — small-group, family, photography, sunrise, day-trips
4. **"Sunshine vs Lake Louise vs Norquay: Honest Comparison"** — comparison table, ski pass calculator link
5. **"Travel Insurance for Banff: Do You Need It?"** — Heymondo affiliate
6. **"What to Pack for Banff in [Season]"** — Amazon Associates + MEC/Backcountry links
7. **"Rocky Mountaineer Review: Is It Worth $1,500+/Night?"** — Canada Rail Vacations affiliate
8. **"Banff Without a Car: Complete Itinerary"** — shuttle links, car-free page, transit info
9. **"Best Banff Hotels by Budget"** — Stay22 maps + Expedia deep-links per hotel
10. **"Icefields Parkway: Every Stop from Banff to Jasper"** — hotels, car rental, tours stacked

### 5.2 Add Amazon Associates links to gear content

Currently zero Amazon links on the site despite tracking code being ready. Add to:
- Packing list page
- Bear spray guide
- Hiking gear mentions in trail guides
- Photography spots (camera gear)

Use Amazon tag `banffbound-20`. Layer in MEC or Backcountry where commissions are higher (4-8% vs Amazon's 1-3%).

---

## Phase 6: Distribution & Authority (Month 3-4)

### 6.1 Launch Pinterest business account

Banff is a visual-first destination. Create 3-5 vertical pins (1000x1500) per money page. Target keywords: "Banff itinerary", "Moraine Lake sunrise", "Canadian Rockies bucket list". Pin 5-10/day consistently.

### 6.2 Launch newsletter with lead magnet

Build when traffic crosses ~15K monthly sessions. Use Kit (free plan up to 10K subscribers). Lead magnet: "Banff Sunrise Cheat Sheet" PDF (Moraine Lake timing, parking reality, free transit map, peak-season tips).

Add signup form to:
- Homepage
- Footer (all pages)
- Blog post endings
- Trip builder completion

### 6.3 Launch a small YouTube channel

Destination videos have evergreen demand. YouTube is the 2nd most-cited social platform in AI search (31.8% of social citations). Start with 10-12 short videos:
- Moraine Lake walking tour
- Banff Gondola POV
- Lake Louise hike
- Icefields Parkway drive
- Johnston Canyon ice walk

Each video description links to the corresponding money page.

### 6.4 Build partner/operator relationships

Reach out to Banff-area operators for:
- Sponsored content ($5-10K revenue target)
- Exclusive discount codes (increases affiliate conversion)
- Guest contributions (link building)

Targets: Banff Hospitality Collective, Pursuit, Banff Trail Riders, Discover Banff Tours.

---

## Phase 7: Long-Term Strategic (Month 4-12)

### 7.1 Expand content silos within banffbound.com

Do NOT create separate sites. Add deeper content under existing domain for:
- Lake Louise (10 posts)
- Canmore (10 posts)
- Icefields Parkway (10 posts)
- Jasper (15 posts) — already started with several Jasper articles

### 7.2 Consider a digital product

Once email list hits 2,500+ subscribers, test a Banff Travel Planner PDF ($19-29). Travel Banff Canada monetizes consults + itineraries + ebook; this is a proven model.

### 7.3 Track exit readiness

If sale is a long-term goal, maintain clean diversified P&L. Current affiliate site multiples: 25-29x monthly profit (average), 30-34x for premium quality. Requirements: diversified traffic sources, branded identity, demonstrable author expertise.

---

## What NOT to Do

Both reports agree on these:

1. **Do not split Lake Louise / Jasper / Canmore into separate sites.** Domain authority compounds; splits dilute.
2. **Do not chase informational top-of-funnel content** ("10 facts about Banff", "Banff in 24 photos"). These bleed traffic to AI Overviews and convert poorly.
3. **Do not invest in FAQ rich-result optimization.** Google confirmed FAQ rich results no longer appear as of May 2026.
4. **Do not chase Booking.com directly.** They terminated small affiliates in 2025. Use Stay22 to access their inventory.
5. **Do not force a Google Business Profile** unless BanffBound has a real physical location or service-area presence.
6. **Do not pay for AAWP** (Amazon-only plugin). If using a link manager, Lasso covers all programs.
7. **Do not prioritize email list building before 15K monthly sessions.** CRO on existing traffic moves revenue faster.

---

## Revenue Targets

| Timeframe | Monthly Revenue Target | Key Revenue Sources |
|-----------|----------------------|---------------------|
| Current | ~$40/month (1 GYG sale/week) | GetYourGuide only |
| Month 3 | $1,500-3,000/month | Stay22 hotels + GYG/Viator tours + Discover Cars |
| Month 6 | $3,000-5,000/month | Above + Heymondo + Amazon + money page traffic growth |
| Month 12 | $5,000-15,000/month | Full stack + email list + Pinterest + YouTube + sponsored content |

---

## Priority Summary

If you can only focus on 3 things:

1. **Install Stay22 for hotel monetization** — single biggest revenue lever
2. **Deep-link all GYG affiliate URLs to specific tours** — immediate conversion lift
3. **Rewrite titles on top 10 pages to match search intent** — immediate CTR improvement
