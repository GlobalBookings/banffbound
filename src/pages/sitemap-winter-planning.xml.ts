import type { APIRoute } from 'astro';

// This sitemap lets Search Console report on the winter planning pages as a group.
const paths = [
  '/blog/banff-christmas-guide/',
  '/blog/banff-gondola-guide/',
  '/blog/banff-gondola-tickets-guide/',
  '/blog/banff-skiing-guide/',
  '/blog/banff-cabin-rentals/',
  '/winter/',
  '/skiing/',
  '/ski-pass-calculator/',
  '/vacation-rentals/',
  '/trip-cost/',
];

export const GET: APIRoute = ({ site }) => {
  const entries = paths.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
