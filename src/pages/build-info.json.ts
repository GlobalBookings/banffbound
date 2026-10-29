import { createBuildProvenance } from '../utils/buildProvenance';

// Astro writes this response as a static file. No deployed backend or runtime filesystem is needed.
export const prerender = true;
export async function GET(): Promise<Response> {
  const receipt = await createBuildProvenance();
  return new Response(`${JSON.stringify(receipt, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
