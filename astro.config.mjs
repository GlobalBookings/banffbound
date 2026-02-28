// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://banffbound.com',
  output: 'static',
  integrations: [sitemap()],
});