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