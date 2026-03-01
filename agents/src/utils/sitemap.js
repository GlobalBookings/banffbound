import { createLogger } from '../core/logger.js';

const log = createLogger('sitemap');

export async function fetchSitemapUrls(sitemapIndexUrl) {
  log.info(`Fetching sitemap index: ${sitemapIndexUrl}`);
  const res = await fetch(sitemapIndexUrl);
  const xml = await res.text();

  // Extract child sitemap URLs from the index
  const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  log.info(`Found ${sitemapUrls.length} child sitemap(s)`);

  const allUrls = [];
  for (const url of sitemapUrls) {
    const childRes = await fetch(url);
    const childXml = await childRes.text();
    const pageUrls = [...childXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    allUrls.push(...pageUrls);
  }

  log.info(`Total pages in sitemap: ${allUrls.length}`);
  return allUrls;
}

export function categorizeUrl(url) {
  const path = new URL(url).pathname;
  if (path.startsWith('/blog/')) return 'blog';
  if (path.startsWith('/trails/')) return 'trail';
  if (path.startsWith('/hotel-directory/') && path !== '/hotel-directory/') return 'hotel';
  return 'page';
}
