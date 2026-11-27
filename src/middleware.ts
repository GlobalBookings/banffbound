import { defineMiddleware } from 'astro:middleware';
import { rewriteExpediaAnchors } from './lib/expediaLinks';

// Runs at prerender time on the static site, as well as during local development.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = await response.text();
  const rewritten = rewriteExpediaAnchors(html);
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(rewritten, { status: response.status, statusText: response.statusText, headers });
});
