// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { viewGuideMetadata } from './src/data/viewGuideOverride.ts';
import { winterResortMetadata } from './src/data/winterResortOverrides.ts';
import { winterSeasonMetadata } from './src/data/winterSeasonOverrides.ts';
import { blogRedirects } from './src/data/redirects.mjs';
import { winterGuideMetadata } from './src/data/winterGuideOverrides.ts';
import { winterTripMetadata } from './src/data/winterTripOverrides.ts';
import { winterActivityMetadata } from './src/data/winterActivityOverrides.ts';
const reviewedBlogSlugs = new Set([...Object.keys(winterGuideMetadata), ...Object.keys(winterActivityMetadata), ...Object.keys(winterTripMetadata), ...Object.keys(winterResortMetadata), ...Object.keys(winterSeasonMetadata), ...Object.keys(viewGuideMetadata)]);

// https://astro.build/config
export default defineConfig({
  site: 'https://banffbound.com',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter(page) {
        // Exclude every consolidated/redirected slug plus a few legacy duplicates.
        const excludeSlugs = [
          ...Object.keys(blogRedirects),
          'banff-restaraunts', 'eating-out-in-banff', 'sky-bistro-banff',
        ];
        return !excludeSlugs.some(slug => page.endsWith(`/blog/${slug}/`) || page.endsWith(`/blog/${slug}`));
      },
      serialize(item) {
        // Date only content actually reviewed; build time is not an editorial update.
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        if (/^\/(winter|learn-to-ski|ski-day-planner|winter-stays|towns)(\/|$)/.test(path) || ['/', '/skiing', '/ski-pass-calculator', '/sunshine-vs-lake-louise-vs-norquay', '/canmore-vs-banff', '/conditions', '/trip-builder', '/hotels', '/accommodation', '/photo-spots'].includes(path) || reviewedBlogSlugs.has(path.replace('/blog/', ''))) {
          item.lastmod = new Date('2026-10-28');
        }
        // Boost priority for high-value pages
        if (item.url === 'https://banffbound.com/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/hotel-directory/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/trails/')) {
          item.priority = 0.8;
          item.changefreq = 'daily';
        } else if (
          item.url.includes('/trip-builder') ||
          item.url.includes('/trail-map') ||
          item.url.includes('/weather') ||
          item.url.includes('/what-to-do-today')
        ) {
          item.priority = 0.9;
          item.changefreq = 'daily';
        }
        return item;
      },
    }),
  ],
});