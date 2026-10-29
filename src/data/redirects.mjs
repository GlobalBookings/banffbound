// Canonical /blog/ alias map. Native segment-prefix HTTP301 rules are configured
// on DigitalOcean for these aliases; the public plan and live verification are
// in research/redirect-alias-plan-2026-10-29.json and its verification receipt.
// Static noindex/canonical/meta-refresh pages remain a deployment fallback.
// The host ignores Cloudflare Pages _redirects files. Do not add unbounded raw
// string-prefix rules: validate canonical isolation and real host semantics.

export const blogRedirects = {
  // Duplicate viewpoint title/intent; retain the singular URL's existing history.
  'banff-views': 'banff-view',
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
