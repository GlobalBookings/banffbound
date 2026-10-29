import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// Offline source/model and actual-client checks; no site build or live availability request.
const compiled = await build({ stdin: {
  contents: "export * from './src/data/activities.ts'; export * from './src/data/activityPlanning.ts'; export { blogPosts } from './src/data/blogPosts.ts'; export { trails } from './src/data/trails.ts';",
  resolveDir: process.cwd(),
}, bundle: true, write: false, format: 'esm', platform: 'node' });
const model = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const { activities, activityContextLabels, activityInterestLabels, activitySearchUrl, activityListSchema } = model;
const expectedSlugs = ['skiing-snowboarding', 'ice-skating', 'ice-walk-johnston-canyon', 'dog-sledding', 'snowshoeing', 'northern-lights', 'hiking', 'canoeing-kayaking', 'mountain-biking', 'white-water-rafting', 'wildlife-viewing', 'via-ferrata'];
assert.deepEqual(activities.map(activity => activity.slug), expectedSlugs, 'All twelve original records remain.');
assert.equal(new Set(expectedSlugs).size, activities.length);
assert.deepEqual(activities.filter(activity => !activity.isExternal).map(activity => activity.slug), ['ice-skating', 'ice-walk-johnston-canyon', 'dog-sledding', 'snowshoeing', 'northern-lights', 'white-water-rafting', 'via-ferrata'], 'Preserve the seven existing detail URLs.');

async function assertInternalRoute(href) {
  assert.ok(href.startsWith('/') && !href.startsWith('//'), `Internal guide URL: ${href}`);
  const path = new URL(href, 'https://banffbound.com').pathname.replace(/\/$/, '');
  if (path.startsWith('/blog/')) {
    assert.ok(model.blogPosts.some(post => path === `/blog/${post.slug}`), `Canonical blog guide exists: ${href}`);
    return;
  }
  if (path.startsWith('/activities/')) {
    assert.ok(activities.some(activity => !activity.isExternal && path === activity.link), `Existing activity detail: ${href}`);
    return;
  }
  if (path.startsWith('/trails/')) {
    assert.ok(model.trails.some(trail => path === `/trails/${trail.slug}`), `Trail route exists: ${href}`);
    return;
  }
  try { await access(`src/pages${path}.astro`); }
  catch { await access(`src/pages${path}/index.astro`); }
}

for (const activity of activities) {
  assert.match(activity.reviewedAt, /^2026-10-29$/);
  assert.ok(activity.locations.length >= 2 && activity.readiness.length >= 3 && activity.logistics.length >= 2);
  assert.ok(activity.sources.length > 0 && activity.guides.length > 0);
  assert.ok(activity.contexts.every(context => context in activityContextLabels));
  assert.ok(activity.interests.every(interest => interest in activityInterestLabels));
  assert.ok(!/\$\s?\d|\d[\d,.–-]*\s?CAD/.test(JSON.stringify(activity)), `No unmaintained fixed price: ${activity.slug}`);
  if (!activity.isExternal) assert.ok(activity.faqs.length > 0, `Visible FAQs: ${activity.slug}`);
  for (const source of activity.sources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(!url.searchParams.has('partner_id') && !url.searchParams.has('camref'), 'Direct source labels must not mask affiliate searches.');
    assert.ok(source.checkedAt <= activity.reviewedAt);
  }
  const search = new URL(activitySearchUrl(activity.gygSearch));
  assert.equal(search.hostname, 'www.getyourguide.com');
  assert.equal(search.searchParams.get('partner_id'), 'QW960HO');
  assert.equal(search.searchParams.get('q'), activity.gygSearch);
  await assertInternalRoute(activity.link);
  for (const guide of activity.guides) await assertInternalRoute(guide.href);
}
assert.equal(new URL(activitySearchUrl('ski & snow / Banff?')).searchParams.get('q'), 'ski & snow / Banff?');
const directorySchema = activityListSchema(activities);
assert.equal(directorySchema.numberOfItems, 12);
assert.ok(directorySchema.itemListElement.every(item => item.item['@type'] === 'WebPage'));
assert.ok(!/isAccessibleForFree|publicAccess|GeoCoordinates/.test(JSON.stringify(directorySchema)));

const paths = ['src/pages/activities.astro', 'src/pages/activities/[slug].astro', 'src/pages/things-to-do.astro'];
const pages = await Promise.all(paths.map(path => readFile(path, 'utf8')));
for (let index = 0; index < pages.length; index++) {
  const result = await transform(pages[index], { filename: paths[index] });
  assert.equal(result.diagnostics.filter(diagnostic => diagnostic.severity === 1).length, 0, paths[index]);
  assert.ok(!/isAccessibleForFree|publicAccess|GeoCoordinates/.test(pages[index]), 'Do not make generic attraction price/access/location claims.');
  assert.ok(pages[index].includes('faq.question') && pages[index].includes('faq.answer'), 'Visible FAQ and schema use the same data.');
  for (const [, href] of pages[index].matchAll(/href="(\/[^"#?]*)"/g)) await assertInternalRoute(href);
}
assert.ok(pages[1].includes('camref=1101l3MtWX') && pages[1].includes('rel="noopener sponsored"'));
assert.ok(pages[0].includes('activityImageNote') && pages[1].includes('activityImageNote') && pages[2].includes('Illustrative image;'));
const attractionSource = pages[2].split('---')[1];
const constants = attractionSource.slice(attractionSource.indexOf('const attractions ='));
const { attractions } = new Function(`${constants}; return { attractions };`)();
assert.equal(attractions.length, 9, 'Preserve the nine sightseeing choices.');
for (const attraction of attractions) {
  await assertInternalRoute(attraction.guide);
  assert.equal(new URL(attraction.source).protocol, 'https:');
  assert.ok(attraction.question && attraction.journey && attraction.timing);
}

const client = pages[0].match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(client, 'Read the actual filter script.');
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, { value: id === 'activity-search' ? '' : 'all', hidden: id === 'activity-filters', listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; } });
  return elements.get(id);
};
const cards = activities.map(activity => ({ hidden: false, dataset: {
  seasons: activity.contexts.join(' '), interests: activity.interests.join(' '),
  search: `${activity.name} ${activity.description} ${activity.locations.map(location => location.name).join(' ')}`.toLowerCase(),
}, slug: activity.slug }));
assert.equal(cards.filter(card => !card.hidden).length, 12, 'No-JS model starts with every activity visible.');
assert.ok(!pages[0].match(/<article class="card activity-card"[^>]*\bhidden(?:=|\s|>)/), 'No activity card starts hidden in HTML.');
vm.runInNewContext(client, { document: { getElementById: element, querySelectorAll() { return cards; } }, Array });
const change = () => element('activity-filters').listeners.change();
const visible = () => cards.filter(card => !card.hidden).map(card => card.slug);
assert.equal(element('activity-filters').hidden, false, 'Only JavaScript enables the filters.');
assert.equal(visible().length, 12);
element('activity-season').value = 'winter'; change();
assert.equal(visible().length, 7, 'Winter context includes wildlife without claiming it operates.');
element('activity-interest').value = 'water'; change();
assert.deepEqual(visible(), []);
assert.equal(element('activity-empty').hidden, false);
assert.equal(element('activity-result-count').textContent, '0 of 12 activity guides');
element('activity-filters').listeners.reset({ preventDefault() {} });
assert.equal(visible().length, 12);
assert.equal(element('activity-empty').hidden, true);
element('activity-search').value = '  KiNgMiK  '; element('activity-filters').listeners.input();
assert.deepEqual(visible(), ['dog-sledding'], 'Search is case-insensitive and includes the named operator/location.');
element('activity-filters').listeners.reset({ preventDefault() {} });
element('activity-season').value = 'summer'; element('activity-interest').value = 'climbing'; change();
assert.deepEqual(visible(), ['via-ferrata']);
element('activity-season').value = 'winter'; change();
assert.equal(visible().length, 0, 'Season filters must not imply a summer climb runs in winter.');
element('activity-interest').value = 'wildlife'; change();
assert.deepEqual(visible(), ['wildlife-viewing']);
element('activity-filters').listeners.reset({ preventDefault() {} });
assert.equal(element('activity-search').value, '');
assert.equal(visible().length, 12);

console.log('Activity checks passed: 12 records, 7 detail URLs, 9 sights, source/affiliate/schema contracts, three Astro transforms and actual-client filters.');
