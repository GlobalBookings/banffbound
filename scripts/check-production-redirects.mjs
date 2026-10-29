import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { blogRedirects } from '../src/data/redirects.mjs';

const origin = 'https://banffbound.com';
const manifest = JSON.parse(await readFile(new URL('../research/redirect-alias-plan-2026-10-29.json', import.meta.url), 'utf8'));
const source = await readFile(new URL('../src/data/blogPosts.ts', import.meta.url), 'utf8');
const slugs = new Set([...source.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
const aliases = Object.entries(blogRedirects);
assert.equal(manifest.domain, 'banffbound.com');
assert.equal(manifest.code, 301);
assert.equal(manifest.mappings.length, aliases.length, 'The reviewed host plan must cover the alias map');
for (const [oldSlug, newSlug] of aliases) {
  assert(slugs.has(oldSlug) && slugs.has(newSlug), 'Both source and target require a published record');
  assert(!blogRedirects[newSlug], 'Alias redirects must go directly to a canonical target');
  const planned = manifest.mappings.find(row => row.oldSlug === oldSlug);
  assert.equal(planned?.newSlug, newSlug);
  assert.equal(planned?.destination, `/blog/${newSlug}/`);
  assert(!planned.destination.startsWith(`/blog/${oldSlug}/`), 'A segment prefix must not catch its target');
}
const canonicalSlugs = [...slugs].filter(slug => !blogRedirects[slug]);
for (const slug of canonicalSlugs) {
  assert(!aliases.some(([alias]) => `/blog/${slug}/`.startsWith(`/blog/${alias}/`)), 'A published canonical must not sit beneath an alias');
}
if (!process.argv.includes('--live')) {
  console.log(`Redirect plan checks passed: ${aliases.length} direct mappings, canonical targets and segment-boundary isolation. No network requests.`);
  process.exit(0);
}

const checks = [];
for (const [oldSlug, newSlug] of aliases) {
  for (const suffix of ['', '/']) checks.push({path:`/blog/${oldSlug}${suffix}`,status:301,location:`${origin}/blog/${newSlug}/`,kind:'alias'});
}
for (const slug of new Set(aliases.map(([,target]) => target))) checks.push({path:`/blog/${slug}/`,status:200,kind:'canonical-target'});
for (const [oldSlug,newSlug] of aliases.filter(([slug]) => ['banff-views','banff-ski','banff-icewalk','mt-norquay'].includes(slug))) {
  const query = '?utm_source=redirect-check&probe=a%20b';
  checks.push({path:`/blog/${oldSlug}/${query}`,status:301,location:`${origin}/blog/${newSlug}/${query}`,kind:'query'});
}
const overlapSlugs = canonicalSlugs.filter(slug => aliases.some(([alias]) => slug !== alias && slug.startsWith(alias)));
for (const slug of overlapSlugs) if (!checks.some(check => check.path === `/blog/${slug}/`)) checks.push({path:`/blog/${slug}/`,status:200,kind:'canonical-prefix-overlap'});
for (const path of ['/', '/winter/', '/family-guide/', '/trail-map/', '/hotel-directory/', '/manifest.json']) checks.push({path,status:200,kind:'control'});
checks.push({path:'/blog/banff-views-check/',status:404,kind:'sibling-control'});
checks.push({path:'/blog/banff-views/child',status:301,location:`${origin}/blog/banff-view/`,kind:'documented-descendant'});
let cursor = 0;
const results = new Array(checks.length);
await Promise.all(Array.from({length:6}, async () => {
  while (cursor < checks.length) {
    const index = cursor++, check = checks[index];
    try {
      const response = await fetch(origin + check.path, {method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(20_000),headers:{'Cache-Control':'no-cache','User-Agent':'BanffBound-release-verification/1.0'}});
      const location = response.headers.get('location');
      const passed = response.status === check.status && (check.location ? new URL(location || '', origin).href === check.location : !location);
      results[index] = {...check,actualStatus:response.status,actualLocation:location,passed};
      await response.body?.cancel();
    } catch (error) {
      results[index] = {...check,passed:false,error:error.name};
    }
  }
}));
const report = {checkedAt:new Date().toISOString(),origin,mappings:aliases.length,checks:results.length,passed:results.filter(result=>result.passed).length,results};
await writeFile(new URL('../research/live-http-redirect-verification-2026-10-29.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const failures = results.filter(result=>!result.passed);
console.log(JSON.stringify({checks:results.length,passed:report.passed,failures},null,2));
assert.equal(failures.length,0,'Public redirect verification failed');
