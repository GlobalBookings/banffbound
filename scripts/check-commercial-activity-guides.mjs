// Focused offline rendering of the actual activity template and booking component.
// Only the outer site layout is replaced by a slot fixture; this is not a site build.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';
const root = process.cwd(), require2 = createRequire(path.join(root, 'package.json'));
const compiled = await build({ stdin: { contents: "export * from './src/data/activities.ts';export * from './src/data/activityCampaignTargets.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm' });
const m = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const render = await build({ stdin: { contents: "export {default} from './src/pages/activities/[slug].astro';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'activity-guide-render', setup(b) {
  b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require2.resolve(a.path)).href, external: true }));
  b.onResolve({ filter: /(?:\?astro&type=style|\.css$)/ }, a => ({ path: a.path, namespace: 'inert-style' }));
  b.onLoad({ filter: /.*/, namespace: 'inert-style' }, () => ({ contents: 'export {};' }));
  b.onResolve({ filter: /\.astro$/ }, a => ({ path: path.resolve(a.resolveDir, a.path), namespace: 'actual-astro' }));
  b.onLoad({ filter: /.*/, namespace: 'actual-astro' }, async a => {
    const source = a.path.endsWith('/layouts/BaseLayout.astro') ? '<main id="main-content"><slot /></main>' : await readFile(a.path, 'utf8');
    const c = await transform(source, { filename: a.path, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
    assert.deepEqual(c.diagnostics.filter(d => d.severity === 1), []);
    return { contents: c.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, ''), loader: 'ts', resolveDir: path.dirname(a.path) };
  });
} }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(render.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const credits = JSON.parse(await readFile('src/data/winterActivityPhotoCredits.json', 'utf8'));
const walk = n => [n, ...(n.childNodes || []).flatMap(walk)];
const attr = (n, key) => n?.attrs?.find(a => a.name === key)?.value;
const text = n => n.nodeName === '#text' ? n.value : ['script','style'].includes(n.tagName) ? '' : (n.childNodes || []).map(text).join(' ');
const scriptText = n => (n.childNodes || []).map(x => x.value || '').join('');
const normalize = value => value.replace(/\s+/g, ' ').trim();
const cases = [
  ['ice-climbing', 'gyg-432341'],
  ['yoho-kootenay-winter-tours', 'gyg-1164949'],
  ['banff-food-tours', 'gyg-698951'],
];
function checkGuide(html, activity, offerId) {
  const ns = walk(parseFragment(html)), visible = normalize(text(parseFragment(html)));
  const target = m.resolveActivityBookingTarget('/activities/' + activity.slug + '/');
  assert.equal(target.offerId, offerId);
  assert.equal(target.launchState, 'ready');
  assert.equal(ns.filter(n => attr(n, 'data-activity-booking') !== undefined).length, 1, 'One primary booking wrapper.');
  assert.equal(ns.filter(n => attr(n, 'data-activity-booking-mobile') !== undefined).length, 1, 'One native mobile bar, visible on page load.');
  const mobile = ns.find(n => attr(n, 'data-activity-booking-mobile') !== undefined);
  assert.equal(attr(mobile, 'hidden'), undefined, 'Native booking bar is present before JavaScript or scroll.');
  const mobileNodes = walk(mobile);
  const mobileLink = mobileNodes.find(n => n.tagName === 'a');
  const dismiss = mobileNodes.find(n => n.tagName === 'button');
  assert.equal(mobileNodes.filter(n => n.tagName === 'a').length, 1);
  assert.equal(mobileNodes.filter(n => n.tagName === 'button').length, 1);
  assert.equal(attr(dismiss, 'type'), 'button');
  assert(attr(dismiss, 'aria-label'));
  assert.equal(normalize(text(mobile)).replace(normalize(text(mobileLink)), '').replace(normalize(text(dismiss)), '').trim(), '', 'Compact mobile bar has only CTA and dismiss text.');
  assert(!mobileNodes.some(n => /^(?:p|h[1-6])$/.test(n.tagName || '')));
  const mainNotice = ns.find(n => attr(n, 'id') === attr(mobileLink, 'aria-describedby'));
  assert(mainNotice && !mobileNodes.includes(mainNotice), 'Mobile keeps the main notice as its accessible description.');
  const primary = ns.filter(n => ['article-top', 'article-mobile'].includes(attr(n, 'data-landing-placement')));
  assert.equal(primary.length, 2);
  for (const link of primary) {
    assert.equal(attr(link, 'data-offer-id'), offerId);
    assert.equal(attr(link, 'data-activity-target-id'), target.id);
    assert.equal(attr(link, 'data-guide-id'), activity.slug);
    assert.equal(attr(link, 'data-paid-affiliate-campaign'), target.paidCampaignLabel);
    assert.equal(attr(link, 'data-affiliate-target-path'), new URL(target.bookingUrl).pathname);
    assert.equal(attr(link, 'href'), target.bookingUrl);
    assert(normalize(text(link)).startsWith(target.label));
    const href = new URL(attr(link, 'href'));
    assert.equal(href.searchParams.get('partner_id'), 'QW960HO');
    assert.equal(href.searchParams.get('cmp'), target.campaignLabel, 'SSR remains editorial for organic visitors.');
    assert.equal(attr(link, 'target'), '_blank');
    assert(attr(link, 'rel').includes('sponsored') && attr(link, 'rel').includes('noopener'));
    const notice = ns.find(n => attr(n, 'id') === attr(link, 'aria-describedby'));
    assert(notice && normalize(text(notice)) === target.seasonalNotice);
    assert(ns.indexOf(notice) < ns.indexOf(link));
  }
  assert(visible.includes('Affiliate link. BanffBound may earn from qualifying bookings.'));
  assert(!/Hold paid ads|ad group|missing guide|launchState|PRIVATE|ATTACKER/.test(visible));
  const tables = ns.filter(n => n.tagName === 'table');
  assert.equal(tables.length, 1);
  assert(ns.some(n => n.tagName === 'caption' && normalize(text(n)) === activity.comparison.caption));
  assert.equal(ns.filter(n => n.tagName === 'th' && attr(n, 'scope') === 'col').length, activity.comparison.columns.length);
  assert.equal(ns.filter(n => n.tagName === 'th' && attr(n, 'scope') === 'row').length, activity.comparison.rows.length);
  assert(activity.guideSections.length >= 3);
  for (const section of activity.guideSections) {
    assert(ns.some(n => n.tagName === 'h2' && attr(n, 'id') === section.id && normalize(text(n)) === section.title));
    for (const paragraph of section.paragraphs) assert(visible.includes(paragraph));
  }
  const schemas = ns.filter(n => n.tagName === 'script' && attr(n, 'type') === 'application/ld+json').map(n => JSON.parse(scriptText(n)));
  const article = schemas.find(s => s['@type'] === 'Article');
  assert.equal(article.dateModified, '2026-10-30');
  assert(!Object.hasOwn(article, 'image'), 'An illustrative setting is not a structured-data activity photograph.');
  assert(!schemas.some(s => ['Product','Offer','AggregateRating'].includes(s['@type'])));
  const faq = schemas.find(s => s['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map(f => [f.name, f.acceptedAnswer.text]), activity.faqs.map(f => [f.question, f.answer]));
  const visibleFaqs = ns.filter(n => n.tagName === 'details').map(n => [normalize(text(n.childNodes.find(x => x.tagName === 'summary'))), normalize(text(n.childNodes.find(x => x.tagName === 'p')))]);
  assert.deepEqual(visibleFaqs, activity.faqs.map(f => [f.question, f.answer]));
  for (const source of activity.sources) assert(ns.some(n => n.tagName === 'a' && attr(n, 'href') === source.url && normalize(text(n)).includes(source.label)));
  assert(ns.some(n => n.tagName === 'time' && attr(n, 'datetime') === '2026-10-30'));
  for (const guide of activity.guides) assert(ns.some(n => n.tagName === 'a' && attr(n, 'href') === guide.href));
  const credit = credits.find(p => p.id === activity.photoCreditId);
  assert(credit && credit.src === activity.image);
  assert(ns.some(n => n.tagName === 'a' && attr(n, 'href') === credit.sourceUrl));
  assert(ns.some(n => n.tagName === 'a' && attr(n, 'href') === credit.licenseUrl));
  assert(visible.includes(credit.changeNote) && visible.includes(activity.imageNote));
  const extras = ns.filter(n => attr(n, 'data-landing-placement') === 'article-alternative');
  if (activity.slug === 'banff-food-tours') {
    assert.equal(extras.length, 1);
    const alternative = m.resolveActivityBookingAlternatives(target.guidePath)[0];
    assert.equal(alternative.offerId, 'gyg-285990');
    assert.equal(alternative.label, 'Find out more');
    assert(normalize(text(extras[0])).startsWith(alternative.label));
    assert.equal(alternative.launchState, 'held', 'Public listing unavailability is not lifted by creating a guide.');
    assert.equal(attr(extras[0], 'href'), alternative.bookingUrl);
    assert.equal(attr(extras[0], 'data-offer-id'), alternative.offerId);
    assert.equal(attr(extras[0], 'data-paid-affiliate-campaign'), 'bb_ca_activities_banff_food_tours_castle');
    assert.equal(new URL(attr(extras[0], 'href')).searchParams.get('cmp'), 'banffbound_banff_food_tours_castle');
    assert(ns.some(n => attr(n, 'id') === 'castle-food-experience'));
    const notice = ns.find(n => attr(n, 'id') === attr(extras[0], 'aria-describedby'));
    assert(notice && normalize(text(notice)) === alternative.seasonalNotice && ns.indexOf(notice) < ns.indexOf(extras[0]));
    assert(/usually unavailable/i.test(text(notice)));
  } else assert.equal(extras.length, 0);
  const words = visible.split(/\s+/).length;
  assert(words >= 1000, 'Substantive visible trip planning, beyond a thin product redirect.');
  return words;
}
const results = [];
let fixture;
for (const [slug, offerId] of cases) {
  const activity = m.activities.find(a => a.slug === slug);
  assert(activity && !activity.isExternal);
  await access('public' + activity.image);
  const html = await container.renderToString(Page, { props: { activity }, request: new Request('https://banffbound.com/activities/' + slug + '/?email=PRIVATE&cmp=ATTACKER') });
  const words = checkGuide(html, activity, offerId);
  results.push({ slug, offerId, renderedVisibleWords: words, faqCount: activity.faqs.length, sourceCount: activity.sources.length });
  if (slug === 'banff-food-tours') fixture = { html, activity, offerId };
}
for (const mutate of [
  h => h.replace('data-offer-id="gyg-698951"', 'data-offer-id="gyg-999"'),
  h => h.replace('cmp=banffbound_banff_food_tours', 'cmp=bb_ca_activities_banff_food_tours'),
  h => h.replace('data-paid-affiliate-campaign="bb_ca_activities_banff_food_tours"', ''),
  h => h.replace('scope="col"', 'scope="none"'),
  h => h.replace('Find out more <span', 'Book now <span'),
  h => h.replace('id="castle-food-experience"', 'id="missing-comparison"'),
  h => h.replace('id="castle-booking-notice"', 'id="missing-notice"'),
  h => h.replace('Affiliate link. BanffBound may earn from qualifying bookings.', ''),
  h => h.replace(/(data-activity-booking-mobile[^>]*>)/, '$1<p>Extra mobile copy</p>'),
  h => h.replace('data-activity-booking-mobile', 'data-activity-booking-mobile hidden'),
]) assert.throws(() => checkGuide(mutate(fixture.html), fixture.activity, fixture.offerId));
for (const slug of ['ice-walk-johnston-canyon','northern-lights','snowshoeing']) {
  const activity = m.activities.find(a => a.slug === slug), target = m.resolveActivityBookingTarget('/activities/' + slug + '/');
  const html = await container.renderToString(Page, { props: { activity }, request: new Request('https://banffbound.com/activities/' + slug + '/') });
  const ns = walk(parseFragment(html));
  assert.equal(ns.filter(n => ['article-top','article-mobile'].includes(attr(n, 'data-landing-placement')) && attr(n, 'data-offer-id') === target.offerId).length, 2, 'Existing mapped detail alias gets the same actual CTA.');
}
assert.equal(m.resolveActivityBookingTarget('/activities/ice-walk-johnston-canyon/').launchState, 'held');
assert.equal(m.activityBookingOffers.length, 15);
assert.equal(m.activityCampaignTargets.length, 13);
assert.equal(m.activityCampaignTargets.filter(t => m.resolveActivityBookingTarget(t.guidePath).launchState === 'ready').length, 12);
assert(m.activityCampaignTargets.every(t => t.maximumCpcGBP === 0.07));
const exactKeywords = m.activityCampaignTargets.reduce((s,t) => s+t.exactKeywords.length,0), phraseKeywords = m.activityCampaignTargets.reduce((s,t) => s+t.phraseKeywords.length,0);
console.log(JSON.stringify({ result: 'Commercial activity guide checks passed', renderedPages: 6, newGuideDetails: results, negativeFixtures: 10, products: 15, guideGroups: 13, readyGuideGroups: 12, exactKeywords, phraseKeywords, maximumCpcGBP: 0.07 }, null, 2));
