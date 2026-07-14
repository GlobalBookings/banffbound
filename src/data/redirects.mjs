// Slug-level 301 consolidations for /blog/<slug>.
// Rendered as robots-noindex + canonical + instant meta-refresh stubs by
// src/pages/blog/[slug].astro, and excluded from the sitemap in astro.config.mjs.
//
// Host note: this site runs on DigitalOcean App Platform (static files in object
// storage) behind the Cloudflare CDN. It is NOT Cloudflare Pages, so the
// public/_redirects file is ignored by the host. This map is the mechanism that
// actually consolidates duplicate ski/winter pages into their canonical pillars.

export const blogRedirects = {
  // ── Generic "Banff ski" duplicates → skiing pillar ──
  'banff-ski-big-3': 'banff-skiing-guide',
  'big-3-ski': 'banff-skiing-guide',
  'big-three-ski': 'banff-skiing-guide',
  'ski-big-three': 'banff-skiing-guide',
  'ski-big-3-alberta': 'banff-skiing-guide',
  'ski-big-3': 'banff-skiing-guide',
  'ski-banff': 'banff-skiing-guide',
  'banff-ski-hills': 'banff-skiing-guide',
  'banff-ski-areas': 'banff-skiing-guide',
  'big3-ski-resort': 'banff-skiing-guide',
  'banff-ski': 'banff-skiing-guide',
  'banff-ski-resorts': 'banff-skiing-guide',
  'banff-ski-slopes': 'banff-skiing-guide',
  'banff-ski-area': 'banff-skiing-guide',
  'banff-ski-mountains': 'banff-skiing-guide',
  'banff-ski-fields': 'banff-skiing-guide',
  'banff-ski-trips': 'banff-skiing-guide',
  'big-3-ski-resorts': 'banff-skiing-guide',
  'big-3-banff': 'banff-skiing-guide',
  'big-three-banff': 'banff-skiing-guide',
  'banff-big-3': 'banff-skiing-guide',

  // ── Mt. Norquay duplicates → Norquay guide ──
  'norquay-ski-resort': 'mt-norquay-guide',
  'mont-norquay': 'mt-norquay-guide',
  'mt-norquay': 'mt-norquay-guide',
  'mount-norquay-banff': 'mt-norquay-guide',
  'norquay-ski-shuttle': 'mt-norquay-guide',

  // ── Sunshine Village duplicates → Sunshine guide ──
  'sunshine-ski-resort-accommodation': 'sunshine-village-guide',
  'banff-sunshine-lodging': 'sunshine-village-guide',
  'sunshine-ski-in-ski-out': 'sunshine-village-guide',
  'sunshine-mountain-lodge': 'sunshine-village-guide',

  // ── Ski accommodation duplicates → ski-in-ski-out ──
  'banff-ski-accommodation': 'banff-ski-in-ski-out',
  'banff-ski-resort-accommodations': 'banff-ski-in-ski-out',

  // ── Ski touring duplicates → ski touring guide ──
  'ski-touring': 'banff-ski-touring',
  'ski-touring-canada': 'banff-ski-touring',
  'ski-touring-canmore': 'banff-ski-touring',
  'backcountry-ski-touring': 'banff-ski-touring',
  'back-country-ski-tours': 'banff-ski-touring',
  'backcountry-skiing-day-tours-canadian-rockies': 'banff-ski-touring',

  // ── Ice walk duplicate → ice walk guide ──
  'banff-icewalk': 'banff-ice-walk-guide',
};
