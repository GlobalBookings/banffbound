import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { transform } from '@astrojs/compiler';
import { build } from 'esbuild';

// Offline checks for the finite paddling page; no fetch, site build or availability assertion.
const path = 'src/pages/paddling.astro';
const source = await readFile(path, 'utf8');
const result = await transform(source, { filename: path });
assert.equal(result.diagnostics.filter(item => item.severity === 1).length, 0, 'Astro source compiles.');
const frontmatter = source.split('---')[1];
const constants = frontmatter.slice(frontmatter.indexOf('const waterRulesUrl'));
const data = new Function(`${constants}; return { lakeChoices, riverChoices };`)();
assert.deepEqual(data.lakeChoices.map(item => item.name), ['Lake Louise', 'Moraine Lake', 'Emerald Lake', 'Vermilion Lakes', 'Two Jack Lake', 'Johnson Lake']);
assert.equal(data.riverChoices.length, 4, 'Keep the scenic float and distinct whitewater products.');
assert.match(source, /Do not continue downstream past the town canoe docks towards Bow Falls/);
assert.match(source, /do not paddle through or over Bow Falls/i);
assert.match(data.riverChoices[0].description, /below Bow Falls/);
assert.match(data.lakeChoices[1].rule, /no personal watercraft/i);
assert.match(data.lakeChoices[2].access, /March 31, 2027/);
assert.match(data.lakeChoices[4].rule, /Personal paddlecraft are prohibited at nearby Lake Minnewanka/);
assert.match(source, /48 hours/);
assert.match(source, /30 days/);
assert.match(source, /self-certification permit/);
assert.match(data.lakeChoices[0].access, /closed for the season/);
assert.match(source, /closed for the season and advertises 2027 plans/);
assert.match(source, /2026 season has finished/);
assert.ok(!/relatively warm|warms up nicely|perfect for beginners|past the Bow Falls area|gentle Bow River|4-12°C|calmest conditions|ideal for stand-up/i.test(source), 'Do not restore unsupported warmth, suitability or river-route claims.');
assert.ok(!/\$\s?\d|\d[\d,.–-]*\s?CAD/.test(source), 'No fixed rates.');
assert.match(data.riverChoices[1].description, /Class 2–3.*minimum age of 5/);
assert.match(data.riverChoices[2].description, /Class 3–4.*minimum age of 12/);
for (const item of data.riverChoices.slice(1, 3)) assert.match(item.arrival, /Self-drive only/);
assert.match(data.riverChoices[3].arrival, /2750 Beaverfoot Road, Golden, BC/);
assert.match(data.riverChoices[3].description, /age of 12.*90 lb \(41 kg\)/);
assert.ok(!/<script|\bhidden(?:=|\s|>)/.test(source), 'Planning content does not depend on JavaScript.');
const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Unique section IDs.');
for (const [, id] of source.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `Section target: ${id}`);
const compiled = await build({ stdin: { contents: "export { blogPosts } from './src/data/blogPosts.ts'; export { activitySearchUrl } from './src/data/activityPlanning.ts';", resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm', platform: 'node' });
const model = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].contents).toString('base64')}`);
for (const href of [...source.matchAll(/href="(\/[^"#?]+)"/g)].map(match => match[1]).concat(data.lakeChoices.map(item => item.guide).filter(Boolean))) {
  if (href.startsWith('/blog/')) assert.ok(model.blogPosts.some(post => href === `/blog/${post.slug}`), href);
  else {
    try { await access(`src/pages${href}.astro`); }
    catch { await access(`src/pages${href}/index.astro`); }
  }
}
for (const item of [...data.lakeChoices, ...data.riverChoices]) {
  const url = new URL(item.source || item.url);
  assert.equal(url.protocol, 'https:');
  assert.ok(!url.searchParams.has('partner_id') && !url.searchParams.has('camref'), 'Direct source links remain direct.');
}
const search = new URL(model.activitySearchUrl('Banff canoe kayak rafting'));
assert.equal(search.searchParams.get('partner_id'), 'QW960HO');
assert.equal(search.searchParams.get('q'), 'Banff canoe kayak rafting');
assert.match(source, /camref=1101l3MtWX/);
assert.equal((source.match(/rel="noopener sponsored"/g) || []).length, 2);
assert.match(source, /Search paddling activities on GetYourGuide/);
assert.match(source, /These two search links are affiliate links/);
console.log('Paddling checks passed: Astro transform, 7 water settings, 4 distinct river products, falls/rule/closure regressions, current operator eligibility, SSR content, section/internal links and affiliate contracts.');
