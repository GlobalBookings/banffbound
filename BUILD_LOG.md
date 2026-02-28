# BanffBound.com - Build Log

## Project Overview
- **Domain:** banffbound.com
- **Stack:** Astro (static site generator) + vanilla CSS + client-side JS
- **Hosting:** DigitalOcean App Platform (static site, auto-deploy from GitHub)
- **Repo:** github.com/GlobalBookings/banffbound (branch: main)
- **Analytics:** Google Analytics 4 (G-2DP7J42ZW0)

## Affiliate Integrations
- **GetYourGuide:** Partner ID `QW960HO` (8% commission on bookings)
- **Expedia:** CAMREF `1101l3MtWX` (up to 4% commission on bookings)

## Architecture

### Directory Structure
```
src/
  components/     # Header.astro, Footer.astro (shared nav, footer)
  data/           # blogPosts.ts (blog metadata), tripActivities.ts (trip builder data)
  layouts/        # BaseLayout.astro (main wrapper), BlogLayout.astro (article wrapper)
  pages/          # All route pages (.astro files)
    blog/         # [slug].astro (dynamic blog routes), index.astro (blog listing)
  styles/         # global.css (design tokens, utility classes)
public/           # favicon.svg, favicon.ico, static assets
```

### Key Files
- `astro.config.mjs` - Site config, sitemap integration
- `src/layouts/BaseLayout.astro` - GA4 tracking, OG/Twitter meta, canonical URLs
- `src/data/blogPosts.ts` - All blog post metadata (slug, title, desc, date, category, image)
- `src/data/tripActivities.ts` - Activities database + trip templates with affiliate links
- `src/pages/blog/[slug].astro` - Dynamic blog route with all article content as HTML strings

### Design System
- **Fonts:** Playfair Display (headings) + Inter (body) via Google Fonts
- **Colors:** Primary #1a3a2a (deep green), Accent #c8a96e (gold), BG #fafaf7
- **Components:** .card, .btn, .badge, .tag, .grid-2/3/4, .section, .page-hero
- **Responsive:** Mobile-first, breakpoint at 768px

## Pages Built (41 total)

### Core Pages
| Page | URL | Description |
|------|-----|-------------|
| Homepage | / | Hero slideshow, stats, categories, events, guides, CTAs |
| Things to Do | /things-to-do | 9 attractions with descriptions, seasons, durations |
| Eat & Drink | /eat-and-drink | 9 restaurants + 4 bars/cafes with pricing, cuisine |
| Shopping | /shopping | 9 shops + 3 shopping areas |
| Activities | /activities | 6 winter + 6 summer activities |
| Tours | /tours | GYG widget + 6 featured tours with affiliate links |
| Hotels | /hotels | Expedia search widget + 9 hotels by budget tier |
| Events | /events | Live RSS from banff.ca (events + news) |
| Lakes | /lakes | 9 iconic Banff lakes with access/activity info |
| Scenic Drives | /scenic-drives | 4 scenic drives with stops and tips |
| Wellness | /wellness | Hot springs, spas, yoga, forest bathing |
| Winter Guide | /winter | Complete winter activities guide |
| Summer Guide | /summer | Complete summer activities + monthly calendar |
| Trip Builder | /trip-builder | Interactive day-by-day planner with 5 templates |
| Blog Index | /blog | Categorized blog listing with JS filtering |

### Blog Posts (26 articles)
| Slug | Category | Content |
|------|----------|---------|
| best-time-to-visit-banff | Planning | Month-by-month seasonal guide |
| how-to-get-to-banff | Planning | Transportation from Calgary, Vancouver, Edmonton |
| banff-park-pass-guide | Planning | Pass types, pricing, where to buy |
| 3-day-banff-itinerary | Itineraries | Day-by-day with restaurants and activities |
| 7-day-banff-itinerary | Itineraries | Complete week including Icefields Parkway |
| best-hikes-in-banff | Hiking | 15 hikes across all difficulty levels |
| lake-louise-complete-guide | Guides | Trails, canoeing, dining, seasonal tips |
| moraine-lake-guide | Guides | 2026 shuttle info, hikes, photography |
| icefields-parkway-guide | Guides | 8 must-stop viewpoints, driving tips |
| banff-wildlife-guide | Guides | Species, viewing spots, safety rules |
| banff-in-winter | Seasonal | Skiing, ice walks, hot springs, northern lights |
| banff-in-summer | Seasonal | Hiking, canoeing, crowds, festivals |
| banff-skiing-guide | Seasonal | Big 3 resorts compared, passes, gear rental |
| banff-on-a-budget | Tips | Cheap accommodation, free activities, budget eats |
| banff-with-kids | Tips | Easy hikes, family activities, dining, rainy days |
| banff-photography-spots | Tips | 12 spots with timing and composition tips |
| where-to-stay-in-banff | Accommodation | Areas: downtown, Tunnel Mountain, Lake Louise, Canmore |
| banff-food-guide | Food & Drink | Restaurants, cafes, breweries, budget eats |
| romantic-getaway-banff | Tips | Couples guide with dining and activities |
| rainy-day-banff | Tips | Indoor activities and alternatives |
| fall-larch-season-banff | Seasonal | September larch season guide |
| bow-valley-parkway-guide | Guides | Complete driving guide with stops |
| banff-camping-guide | Guides | Campgrounds, tips, booking info |
| banff-craft-beer-guide | Food & Drink | Breweries and craft beer guide |
| accessible-banff | Tips | Accessibility guide for visitors |
| banff-christmas-guide | Seasonal | Holiday season events and activities |

## SEO Setup
- **Sitemap:** Auto-generated at /sitemap-index.xml via @astrojs/sitemap
- **Meta tags:** OG, Twitter Card, canonical URL on every page
- **GA4:** G-2DP7J42ZW0 tracking on every page
- **Blog structure:** Keyword-targeted slugs matching top search queries

## Affiliate Monetization Points
1. **Tours page:** GYG widget + featured tour cards with booking buttons
2. **Hotels page:** Expedia search widget + hotel cards with "Check Prices" links
3. **Trip Builder:** Every bookable activity has "Book Now" GYG link, every day has Expedia hotel links
4. **Blog posts:** Contextual GYG/Expedia links within article content
5. **Category pages:** Relevant GYG tour links in lakes, scenic drives, winter, summer pages

## Data Sources
- **Events:** banff.ca RSS feeds (fetched at build time)
- **News:** banff.ca news RSS (fetched at build time)
- **Tours widget:** GetYourGuide JavaScript widget (client-side)
- **Hotel search:** Expedia widget script (client-side)

## Deployment
- Push to `main` branch triggers auto-deploy on DigitalOcean App Platform
- Build command: `npm run build`
- Output directory: `dist`
- Domain: banffbound.com (configured in DO App Platform)
- SSL: Auto-provisioned by DigitalOcean

## Content Expansion Notes
- BLLT sitemap has ~400+ URLs covering experiences, blog posts, trip ideas, accommodation listings
- Priority gaps to fill: individual experience pages, horseback riding, climbing/canyoning, fishing, cross-country skiing, fat biking, running, tubing, golf, indoor activities, arts & culture deep dives
- Each new page should include relevant affiliate links and internal cross-links to existing content
