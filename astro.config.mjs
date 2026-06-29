// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://banffbound.com',
  output: 'static',
  integrations: [
    sitemap({
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 0.7,
      filter(page) {
        const excludeSlugs = [
          'banff-ski-slopes', 'banff-ski-area', 'banff-ski-trips', 'big-3-ski-resorts',
          'banff-restaraunts', 'eating-out-in-banff', 'sky-bistro-banff',
          'banff-ski-big-3', 'big-3-ski', 'big-three-ski', 'ski-big-three',
          'ski-big-3-alberta', 'ski-big-3', 'ski-banff', 'banff-ski-hills',
          'banff-ski-areas', 'big3-ski-resort', 'banff-ski', 'banff-ski-resorts',
          'banff-ski-fields',
        ];
        return !excludeSlugs.some(slug => page.includes(`/blog/${slug}`));
      },
      serialize(item) {
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