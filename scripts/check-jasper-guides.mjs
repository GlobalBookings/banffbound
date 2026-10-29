import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { parseFragment } from 'parse5';

// Exercise the exported full-review bodies offline. Shared integration is root-owned.
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/jasperGuideOverrides.ts'; export { lakeJourneyOverrides, lakeJourneyMetadata } from './src/data/lakeJourneyOverrides.ts'; export { allBlogPosts } from './src/data/blogPosts.ts'; export { blogRedirects } from './src/data/redirects.mjs';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const bodies = model.jasperGuideOverrides, metadata = model.jasperGuideMetadata;
const slugs = ['jasper-national-park', 'jasper-town', 'jasper-canada'];
assert.deepEqual(Object.keys(bodies), slugs);
assert.deepEqual(Object.keys(metadata), slugs);
assert.deepEqual(Object.keys(model.jasperGuideFaqs), slugs);
assert.equal(createHash('sha256').update(JSON.stringify(model.jasperGuideFaqs)).digest('hex'), 'f38b4fc2279b759367a99719a8b417ce3e837296ee9c74609d73be96978093e7', 'All nine original FAQ questions, answers and the existing source-link markup remain verbatim.');
assert.equal(createHash('sha256').update(JSON.stringify({ body: model.lakeJourneyOverrides['jasper-alberta'], metadata: model.lakeJourneyMetadata['jasper-alberta'] })).digest('hex'), 'e8de17369cab65c62389fee61f4853131f3bd6daf8f957061eeb4acf8411c741', 'Already-reviewed Jasper Alberta body and metadata remain exact.');
const expectedPublication = { 'jasper-national-park': '2026-04-06', 'jasper-town': '2026-04-08', 'jasper-canada': '2026-04-06' };
const posts = new Map(model.allBlogPosts.map(post => [post.slug, post]));
const attr = (node, key) => node.attrs?.find(attribute => attribute.name === key)?.value;
const nodes = root => [root, ...(root.childNodes ?? []).flatMap(nodes)];
const text = root => root.tagName === 'script' ? '' : root.nodeName === '#text' ? root.value : (root.childNodes ?? []).map(text).join(' ');
const content = root => text(root).replace(/\s+/g, ' ').trim();
const parsed = {};
for (const slug of slugs) {
  const errors = [];
  const tree = parseFragment(bodies[slug], { onParseError: error => errors.push(error.code) });
  assert.deepEqual(errors, [], `${slug}: valid static HTML fragment`);
  parsed[slug] = tree;
  const all = nodes(tree), prose = content(tree);
  assert.ok(prose.split(/\s+/).length >= 1000, `${slug}: substantive distinct planning guide`);
  assert.equal(posts.get(slug)?.date, expectedPublication[slug], `${slug}: original publication date`);
  assert.equal(model.blogRedirects[slug], undefined, `${slug}: retain canonical route without a new alias`);
  assert.equal(metadata[slug].lastUpdated, '2026-10-29');
  assert.deepEqual(Object.keys(metadata[slug]).sort(), ['description', 'lastUpdated', 'readTime', 'title']);
  assert.ok(metadata[slug].title.includes('Jasper') && metadata[slug].description.length >= 100);
  assert.match(metadata[slug].readTime, /^\d+ min read$/);
  assert.ok(all.filter(node => node.tagName === 'h2').length >= 7);
  assert.equal(all.filter(node => node.tagName === 'h1').length, 0, 'BlogLayout supplies the single page heading.');
  assert.equal(all.filter(node => node.tagName === 'details').length, 3, `${slug}: three complete visible FAQs`);
  for (const detail of all.filter(node => node.tagName === 'details')) {
    assert.equal((detail.childNodes ?? []).filter(node => node.tagName === 'summary').length, 1);
    assert.ok((detail.childNodes ?? []).some(node => node.tagName === 'p' && content(node).length > 80));
  }
  const scripts = all.filter(node => node.tagName === 'script');
  assert.equal(scripts.length, 1, `${slug}: exactly one FAQPage JSON-LD block`);
  assert.equal(attr(scripts[0], 'type'), 'application/ld+json');
  assert.equal(attr(scripts[0], 'src'), undefined);
  const schema = JSON.parse(scripts[0].childNodes.map(node => node.value ?? '').join(''));
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'FAQPage');
  assert.equal(schema.mainEntity.length, model.jasperGuideFaqs[slug].length);
  const visibleFaqs = all.filter(node => node.tagName === 'details');
  for (const [index, faq] of model.jasperGuideFaqs[slug].entries()) {
    const question = schema.mainEntity[index], visible = visibleFaqs[index];
    assert.equal(question['@type'], 'Question');
    assert.equal(question.name, faq.question);
    assert.equal(question.acceptedAnswer['@type'], 'Answer');
    assert.equal(question.acceptedAnswer.text, faq.answer, 'Structured answer uses the canonical model, including its retained source link.');
    assert.equal(content(visible.childNodes.find(node => node.tagName === 'summary')), content(parseFragment(faq.question)), `${slug}: visible/schema question parity`);
    assert.equal(content(visible.childNodes.find(node => node.tagName === 'p')), content(parseFragment(question.acceptedAnswer.text)), `${slug}: visible/schema answer semantic parity`);
  }
  const ids = all.map(node => attr(node, 'id')).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `${slug}: unique section IDs`);
  assert.ok(all.some(node => node.tagName === 'h2' && content(node) === 'Sources and review'));
  assert.match(prose, /Reviewed October 29, 2026/);
  assert.match(prose, /Maligne Canyon/);
  assert.match(prose, /winter recreation/);
  assert.ok(!/\$\s*\d|\d+\s*%|\b44[- ](?:kilomet|km)|9\.6[- ](?:kilomet|km)|I've|I’ve|my training|I always|I've stayed|I’ve stayed|guaranteed wildlife|guaranteed views|less crowded alternative|year-round access/i.test(prose), `${slug}: no inherited rates, synthetic experience, blanket access or old route figures`);
  assert.equal(all.filter(node => ['iframe', 'form', 'img'].includes(node.tagName)).length, 0, 'Complete HTML content; no remote embeds, unverified image or inert form.');
  for (const th of all.filter(node => node.tagName === 'th')) assert.equal(attr(th, 'scope'), 'col');
  const links = all.filter(node => node.tagName === 'a');
  assert.ok(links.some(node => attr(node, 'href') === '/blog/jasper-alberta/'), `${slug}: crosslink existing reviewed Jasper itinerary`);
  for (const anchor of links) {
    const href = attr(anchor, 'href');
    assert.ok(href && content(anchor).length > 3, `${slug}: descriptive native link`);
    assert.equal(nodes(anchor).filter(node => node.tagName === 'a').length, 1, 'No nested anchor chain.');
    assert.ok(!/<|>|javascript:|data:/i.test(href), 'No malformed or unsafe href.');
    if (href.startsWith('/')) continue;
    const url = new URL(href), rel = (attr(anchor, 'rel') ?? '').split(/\s+/);
    assert.equal(url.protocol, 'https:');
    assert.equal(attr(anchor, 'target'), '_blank');
    assert.ok(rel.includes('noopener'));
    if (url.hostname === 'www.expedia.ca') {
      assert.equal(url.pathname, '/Hotel-Search');
      assert.equal(url.searchParams.get('destination'), 'Jasper, Alberta', 'Jasper stay intent must not land in a Banff search.');
      assert.equal(url.searchParams.get('camref'), '1101l3MtWX');
      assert.deepEqual([...url.searchParams.keys()].sort(), ['camref', 'destination']);
      assert.match(content(anchor), /[Ss]earch Jasper accommodation/);
      assert.ok(rel.includes('sponsored'));
    } else if (url.hostname === 'www.getyourguide.com') {
      assert.equal(url.pathname, '/s/'); assert.equal(url.searchParams.get('q'), 'Jasper Alberta activities');
      assert.equal(url.searchParams.get('partner_id'), 'QW960HO');
      assert.deepEqual([...url.searchParams.keys()].sort(), ['partner_id', 'q']);
      assert.ok(rel.includes('sponsored'));
    } else assert.ok(['parks.canada.ca', 'www.parks.canada.ca', '511.alberta.ca', 'www.skimarmot.com', 'www.jasper-alberta.ca', 'www.banffjaspercollection.com', 'www.sundogtours.com', 'www.jasper.travel', 'www.viarail.ca'].includes(url.hostname), `${slug}: primary-source information link ${url.hostname}`);
  }
  assert.match(prose, /affiliate link; BanffBound may earn a commission/);
}

// Distinct intent and exact decision-changing facts, rather than three rewrites of one road trip.
const park = content(parsed['jasper-national-park']);
const town = content(parsed['jasper-town']);
const canada = content(parsed['jasper-canada']);
assert.equal(new Set(Object.values(metadata).map(item => item.title)).size, 3);
assert.match(park, /current wildfire-area closure order.*prohibits Maligne Canyon access.*winter recreation/);
assert.match(park, /older activity descriptions below its closure banner.*not permission/);
assert.match(park, /neighbouring burned ground can remain closed/);
const fiveLakesTable = nodes(parsed['jasper-national-park']).find(node => node.tagName === 'table' && content(node).includes('Wetland Way'));
assert.ok(fiveLakesTable);
const routeRows = nodes(fiveLakesTable).filter(node => node.tagName === 'tr').slice(1).map(row => (row.childNodes ?? []).filter(node => node.tagName === 'td').map(content));
assert.deepEqual(routeRows.map(row => row.slice(0, 2)), [['Wetland Way', '1.8 km return'], ['Emerald Loop', '5.4 km loop'], ['Valley Loop', '7.7 km loop']]);
assert.match(park, /P15, 9 km south of Jasper townsite/);
assert.match(park, /rolling terrain and short steep hills/);
assert.match(park, /does not.*closed, groomed ski route/);
assert.match(park, /does not monitor natural ice.*month, a frozen appearance/);
assert.match(town, /200 Connaught Drive/);
assert.match(town, /Studio description lists a sink, fridge and microwave.*Kitchen Suite lists a full kitchen/);
assert.match(town, /about 6 km from Jasper/);
assert.match(town, /Marmot Meadows.*not a promise of service to Marmot Basin ski resort/);
assert.match(town, /schedules starting October 13, 2026/);
assert.match(town, /Christmas Day and New Year's Day exceptions/);
assert.match(town, /paid parking operates May 1–October 31/);
assert.match(canada, /Edmonton suits a Jasper-first plan via Highway 16/);
assert.match(canada, /Calgary suits a Banff\/Lake Louise-first sequence/);
assert.match(canada, /approximately 232 km between those endpoints/);
assert.match(canada, /October 2025–April 2026 season panel.*does not confirm 2026–27 departures/);
assert.match(canada, /May–October.*winter travellers to SunDog/);
assert.match(canada, /snow tires or chains November 1–March 31.*other snow\/ice-covered periods/);
assert.match(canada, /all-wheel drive is not the tire requirement/);
assert.match(canada, /two nights in Banff or Lake Louise.*three nights in Jasper/);

// Check actual internal route/fragment targets, including cross-module Jasper Alberta anchors.
const knownBodies = { ...bodies, 'jasper-alberta': model.lakeJourneyOverrides['jasper-alberta'] };
let internalLinks = 0;
for (const [slug, tree] of Object.entries(parsed)) for (const anchor of nodes(tree).filter(node => node.tagName === 'a')) {
  const href = attr(anchor, 'href'); if (!href.startsWith('/')) continue;
  const url = new URL(href, 'https://banffbound.com');
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] === 'blog') {
    assert.ok(posts.has(parts[1]), `${slug}: existing blog target ${href}`);
    if (url.hash && knownBodies[parts[1]]) assert.ok(nodes(parseFragment(knownBodies[parts[1]])).some(node => attr(node, 'id') === url.hash.slice(1)), `Actual cross-guide fragment exists: ${href}`);
  } else if (parts[0] === 'towns' && parts.length === 2) {
    assert.ok(['banff', 'lake-louise'].includes(parts[1]));
    await access('src/pages/towns/[slug].astro');
  } else {
    const path = url.pathname.replace(/\/$/, '');
    try { await access(`src/pages${path}.astro`); } catch { await access(`src/pages${path}/index.astro`); }
  }
  internalLinks++;
}
console.log(`Jasper guide checks passed: exactly three distinct full reviews, nine unchanged FAQs with visible/FAQPage semantic parity, ${internalLinks} valid internal links/fragments, current closure/route/season/transit distinctions, exact Jasper affiliate searches, valid static HTML and protected Jasper Alberta/publication dates. No network or site build.`);
