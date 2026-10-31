import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
const root = process.cwd();
const require = createRequire(path.join(root, 'package.json'));
const { build, transform: transformJS } = await import(pathToFileURL(require.resolve('esbuild')).href);
const { transform } = await import(pathToFileURL(require.resolve('@astrojs/compiler')).href);
const { experimental_AstroContainer } = await import(pathToFileURL(require.resolve('astro/container')).href);
const { parse } = await import(pathToFileURL(require.resolve('parse5')).href);
const json = async f => JSON.parse(await readFile(path.join(root, f), 'utf8'));
const adventure = await json('src/data/banffExperienceProducts/adventures.json');
const additional = await json('src/data/banffExperienceProducts/additional.json');
const sourceRecords = [...(Array.isArray(adventure) ? adventure : adventure.products), ...(Array.isArray(additional) ? additional : additional.products)];
const gondola = sourceRecords.find(item => item.productId === '256607');
const ride = sourceRecords.find(item => item.productId === '227587');
assert(gondola && ride);
const actualInventory = (await json('src/data/banffExperienceInventory.json')).products;
const listingOnly = actualInventory.find(item => /horse|cowboy/i.test(item.optionTitle) && ![gondola.productId, ride.productId].includes(item.productId));
assert(listingOnly);
const credits = await json('src/data/winterActivityPhotoCredits.json');
const neutral = credits.find(item => item.id === 'banff-winter-town');
const activity = credits.find(item => item.id === 'gondola-winter');
assert(neutral && activity);
const group = record => ({ id: record.productId === gondola.productId ? 'gondola-fixture' : 'horse-fixture', slug: record.productId === gondola.productId ? 'gondola-fixture' : 'horse-fixture', title: record.title, description: record.description, category: record.category, departure: record.departure, lead: record.lead, sections: record.sections, bookingChecks: record.bookingChecks, faqs: record.faqs, productIds: [record.productId], primaryProductId: record.productId, launchState: record.launchState, notice: record.notice, checkedAt: record.checkedAt });
const oldGroup = { ...group(gondola), existingGuidePath: '/blog/banff-gondola-tickets-guide/', aliases: ['/blog/banff-gondola-guide/'] };
const scopeSection = record => ({ id: 'primary-example', title: 'One option in detail', paragraphs: [`The following example describes ${record.title}. Its details apply to that booking option; compare the other listings separately.`] });
const newGroup = { ...group(ride), productIds: [ride.productId, listingOnly.productId], sections: [scopeSection(ride), ...ride.sections] };
const baseFixture = {
  inventory: { schemaVersion: 1, products: [gondola, ride].map(item => ({ productId: item.productId, productUrl: item.productUrl, optionTitle: item.title })).concat(listingOnly) },
  groups: [oldGroup, newGroup], records: [gondola, ride],
};
const hydrate = async (fixture = baseFixture, render = false) => {
  const fixtureCopy = structuredClone(fixture);
  const result = await build({ stdin: { contents: render ? "export * as data from './src/data/banffExperiences.ts';export {default as Page} from './src/pages/experiences/[slug].astro';export {default as Directory} from './src/pages/experiences/index.astro';export {default as Options} from './src/components/ExperienceOptions.astro';" : "export * from './src/data/banffExperiences.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'actual-source-fixtures', setup(b) {
    b.onResolve({ filter: /banffExperience(?:Products\/[^/]+\.json|Inventory\.json|Groups\.json|Photos)$/ }, a => ({ path: path.resolve(a.resolveDir, a.path), namespace: 'fixture-data' }));
    b.onLoad({ filter: /.*/, namespace: 'fixture-data' }, a => {
      if (a.path.endsWith('banffExperiencePhotos')) return { contents: `export const getExperiencePhoto=()=>(${JSON.stringify(activity)});export const getExperienceHeroPhoto=()=>(${JSON.stringify(neutral)});`, loader: 'js' };
      const value = a.path.endsWith('banffExperienceInventory.json') ? fixtureCopy.inventory : a.path.endsWith('banffExperienceGroups.json') ? fixtureCopy.groups : a.path.endsWith('adventures.json') ? fixtureCopy.records : [];
      return { contents: JSON.stringify(value), loader: 'json' };
    });
    if (!render) return;
    b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true }));
    b.onResolve({ filter: /(?:\?astro&type=style|\.css$)/ }, a => ({ path: a.path, namespace: 'inert-style' }));
    b.onLoad({ filter: /.*/, namespace: 'inert-style' }, () => ({ contents: 'export {};' }));
    b.onResolve({ filter: /\.astro$/ }, a => ({ path: path.resolve(a.resolveDir, a.path), namespace: 'actual-astro' }));
    b.onLoad({ filter: /.*/, namespace: 'actual-astro' }, async a => {
      const source = a.path.endsWith('/layouts/BaseLayout.astro') ? '<html lang="en"><body><main id="main-content" tabindex="-1"><slot /></main></body></html>' : await readFile(a.path, 'utf8');
      const compiled = await transform(source, { filename: a.path, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
      assert.deepEqual(compiled.diagnostics.filter(d => d.severity === 1), []);
      return { contents: compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, ''), loader: 'ts', resolveDir: path.dirname(a.path) };
    });
  } }] });
  return await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
};
async function actualSource() {
  const result = await build({ stdin: { contents: "export * as data from './src/data/banffExperiences.ts';export {default as Page,getStaticPaths} from './src/pages/experiences/[slug].astro';export {default as Directory} from './src/pages/experiences/index.astro';export {default as Options} from './src/components/ExperienceOptions.astro';export {getExperienceHeroPhoto} from './src/data/banffExperiencePhotos.ts';export {activityCampaignTargets} from './src/data/activityCampaignTargets.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'actual-experience-source', setup(b) {
    b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true }));
    b.onResolve({ filter: /(?:\?astro&type=style|\.css$)/ }, a => ({ path: a.path, namespace: 'inert-style' }));
    b.onLoad({ filter: /.*/, namespace: 'inert-style' }, () => ({ contents: 'export {};' }));
    b.onResolve({ filter: /\.astro$/ }, a => ({ path: path.resolve(a.resolveDir, a.path), namespace: 'actual-astro' }));
    b.onLoad({ filter: /.*/, namespace: 'actual-astro' }, async a => {
      const source = a.path.endsWith('/layouts/BaseLayout.astro') ? '<html lang="en"><body><main id="main-content" tabindex="-1"><slot /></main></body></html>' : await readFile(a.path, 'utf8');
      const compiled = await transform(source, { filename: a.path, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
      assert.deepEqual(compiled.diagnostics.filter(d => d.severity === 1), []);
      return { contents: compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, ''), loader: 'ts', resolveDir: path.dirname(a.path) };
    });
  } }] });
  return await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const fixtureData = await hydrate();
assert.equal(fixtureData.banffExperienceGroups.length, 2);
assert.equal(fixtureData.newExperienceGuides.length, 1);
assert.equal(fixtureData.experienceProducts.length, 3);
assert.equal(fixtureData.experienceCoverage.complete, true);
assert.equal(fixtureData.experienceCoverage.reviewedProductIds.length, 2);
assert.deepEqual(fixtureData.experienceCoverage.listingOnlyProductIds, [listingOnly.productId]);
assert.equal(fixtureData.getExperienceGroupForPath('banff-gondola-guide').primaryProductId, gondola.productId);
assert.equal(fixtureData.getExperienceGroupForPath('/blog/banff-gondola-guide/?next=BB_TEST_SECRET_9'), undefined);
assert.equal(fixtureData.getExperienceGroupForPath('/blog/banff-gondola-tickets-guide#private'), undefined);
// A family guide can use a reviewed option as an example, but its itinerary and
// provider-specific requirements must never read as promises for every option.
function assertPrimaryDetailScope(group) {
  if (group.options.length < 2 || !group.primary.details) return;
  const primary = group.primary.details;
  const primaryParagraphs = new Set(primary.sections.flatMap(section => section.paragraphs).filter(paragraph => paragraph.length > 60));
  const specificSections = group.sections.flatMap((section, index) => section.paragraphs.some(paragraph => primaryParagraphs.has(paragraph)) ? [index] : []);
  if (!specificSections.length) return;
  const scopeIndex = group.sections.findIndex(section => /^One option in detail$/i.test(section.title) && section.paragraphs.some(paragraph => paragraph.includes(primary.title)));
  assert(scopeIndex >= 0 && specificSections.every(index => scopeIndex < index), group.id + ': explicitly name and scope the primary example before its specific facts.');
}
for (const group of fixtureData.banffExperienceGroups) assertPrimaryDetailScope(group);
const unscopedFixture = structuredClone(fixtureData.newExperienceGuides[0]);
unscopedFixture.sections = unscopedFixture.sections.filter(section => section.title !== 'One option in detail');
assert.throws(() => assertPrimaryDetailScope(unscopedFixture), /scope the primary example/);
const misnamedFixture = structuredClone(fixtureData.newExperienceGuides[0]);
misnamedFixture.sections[0].paragraphs = ['The following details apply to every operator.'];
assert.throws(() => assertPrimaryDetailScope(misnamedFixture), /scope the primary example/);
assert.equal(fixtureData.experienceBookingTarget(fixtureData.newExperienceGuides[0]).title, ride.title, 'The fixed primary CTA names its actual booking option.');
const negative = [
  x => { x.inventory.products[0].productUrl += '?email=BB_TEST_SECRET_9'; },
  x => { x.inventory.products.push(x.inventory.products[0]); },
  x => { x.groups[1].productIds.push('999999999'); },
  x => { x.groups[1].primaryProductId = listingOnly.productId; x.groups[1].launchState = 'ready'; },
  x => { x.groups[1].primaryProductId = listingOnly.productId; x.groups[1].launchState = 'held'; },
  x => { x.groups[0].existingGuidePath = '/blog/banff-fat-biking/'; },
  x => { x.groups[1].slug = x.groups[0].slug; },
  x => { x.groups[1].sections = []; },
  x => { x.records[0].provider = ''; },
  x => { x.records[0].productUrl = x.records[0].productUrl.replace(/\/[^/]+-t\d+\/$/, '/unverified-alias-t256607/'); },
];
for (const mutate of negative) {
  const changed = structuredClone(baseFixture); mutate(changed);
  await assert.rejects(() => hydrate(changed));
}
const rendered = await hydrate(baseFixture, true), container = await experimental_AstroContainer.create();
const walk = node => [node, ...(node.childNodes || []).flatMap(walk)];
const attr = (node, key) => node?.attrs?.find(item => item.name === key)?.value;
const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
const text = node => node.nodeName === '#text' ? node.value : ['script','style'].includes(node.tagName) ? '' : (node.childNodes || []).map(text).join(' ');
const visible = html => text(parse(html)).replace(/\s+/g, ' ');
const newRenderedGroup = rendered.data.banffExperienceGroups.find(item => !item.existingGuidePath);
const page = await container.renderToString(rendered.Page, { props: { group: newRenderedGroup }, request: new Request('https://banffbound.com/experiences/horse-fixture/?email=BB_TEST_SECRET_9&cmp=BB_TEST_CMP_ATTACK_9') });
const ns = walk(parse(page));
assert.equal(ns.filter(n => attr(n, 'data-experience-option') !== undefined).length, 2);
const bar = ns.find(n => attr(n, 'data-activity-booking-mobile') !== undefined);
assert(bar && attr(bar, 'hidden') === undefined);
assert.equal(ns.filter(n => attr(n, 'data-activity-booking') !== undefined).length, 1);
assert(!/BB_TEST_SECRET_9|BB_TEST_CMP_ATTACK_9|listing-only|launchState|unresolved|Hold paid ads/.test(visible(page)));
const hero = ns.find(n => n.tagName === 'header' && attr(n, 'class')?.includes('experience-hero'));
assert.equal(walk(hero).find(n => n.tagName === 'img').attrs.find(a => a.name === 'src').value, neutral.src);
const bodyPhoto = ns.find(n => n.tagName === 'figure' && attr(n, 'class')?.includes('experience-activity-photo'));
assert.equal(walk(bodyPhoto).find(n => n.tagName === 'img').attrs.find(a => a.name === 'src').value, activity.src);
for (const option of newRenderedGroup.options) {
  const card = ns.find(n => attr(n, 'data-experience-option') === option.productId);
  assert(card);
  const links = walk(card).filter(n => n.tagName === 'a' && attr(n, 'data-offer-id') === 'gyg-' + option.productId);
  assert.equal(links.length, 1);
  const url = new URL(attr(links[0], 'href'));
  assert.equal(url.searchParams.get('partner_id'), 'QW960HO');
  assert.equal(url.searchParams.get('cmp'), 'banffbound_experience_' + option.productId);
  assert.equal(attr(links[0], 'data-affiliate-target-path'), url.pathname);
  assert.equal(attr(links[0], 'data-paid-affiliate-campaign'), 'bb_ca_activities_experience_' + option.productId);
  assert(attr(links[0], 'rel').includes('sponsored'));
  if (option.reviewState === 'listing-only') {
    assert(!walk(card).some(n => hasClass(n, 'operator-name')));
    assert(!walk(card).some(n => hasClass(n, 'operator-facts')));
    assert(!walk(card).some(n => hasClass(n, 'operator-planning-notes')));
    assert(text(links[0]).includes('Find out more'));
  }
}
const schema = ns.filter(n => n.tagName === 'script' && attr(n, 'type') === 'application/ld+json').map(n => JSON.parse((n.childNodes || []).map(c => c.value || '').join('')));
assert.equal(schema.find(s => s['@type'] === 'FAQPage').mainEntity.length, newRenderedGroup.faqs.length);
assert(!schema.some(s => ['Product', 'Offer', 'AggregateRating'].includes(s['@type'])));
for (const node of ns.filter(n => attr(n, 'data-content-id') !== undefined)) assert.equal(attr(node, 'data-content-id'), newRenderedGroup.contentId, 'New pages retain their consistent default content ID.');
const overriddenOptions = await container.renderToString(rendered.Options, { props: { group: newRenderedGroup, contentId: 'legacy-guide-fixture' }, request: new Request('https://banffbound.com/blog/legacy-guide-fixture/') });
for (const node of walk(parse(overriddenOptions)).filter(n => attr(n, 'data-content-id') !== undefined)) assert.equal(attr(node, 'data-content-id'), 'legacy-guide-fixture', 'A reused legacy guide supplies its page’s historic content ID.');
const directory = await container.renderToString(rendered.Directory, { request: new Request('https://banffbound.com/experiences/?email=BB_TEST_SECRET_9') });
const dn = walk(parse(directory)), cards = dn.filter(n => attr(n, 'data-experience-card') !== undefined);
assert.equal(cards.length, 2);
assert(!visible(directory).includes('BB_TEST_SECRET_9'));
for (const group of rendered.data.banffExperienceGroups) assert(dn.some(n => n.tagName === 'a' && attr(n, 'href') === group.canonicalPath));
const directorySource = await readFile(path.join(root, 'src/pages/experiences/index.astro'), 'utf8');
const sourceScript = directorySource.match(/<script>\n([\s\S]*?)<\/script>/)[1];
const js = (await transformJS(sourceScript, { loader: 'ts', target: 'es2022' })).code;
const events = {}, controls = { category: { value: 'all' }, departure: { value: 'all' }, search: { value: '' }, form: { hidden: true, addEventListener: (type, fn) => { events[type] = fn; } }, status: { textContent: '' }, empty: { hidden: true } };
const domCards = cards.map(node => ({ hidden: false, dataset: { category: attr(node, 'data-category'), departures: attr(node, 'data-departures'), search: attr(node, 'data-search') } }));
const selectors = { '#experience-filters': controls.form, '#experience-category': controls.category, '#experience-departure': controls.departure, '#experience-search': controls.search, '#experience-results': controls.status, '#experience-empty': controls.empty };
vm.runInNewContext(js, { document: { querySelector: q => selectors[q], querySelectorAll: () => domCards }, requestAnimationFrame: fn => fn() });
assert.equal(controls.form.hidden, false);
controls.search.value = 'there-is-no-such-trip'; events.input(); assert.equal(domCards.filter(c => !c.hidden).length, 0); assert.equal(controls.empty.hidden, false);
controls.search.value = ''; controls.category.value = rendered.data.banffExperienceGroups[0].categoryId; events.change(); assert.equal(domCards.filter(c => !c.hidden).length, rendered.data.banffExperienceGroups.filter(g => g.categoryId === controls.category.value).length);
controls.category.value = 'all'; events.reset(); assert.equal(domCards.filter(c => !c.hidden).length, 2); assert.equal(controls.empty.hidden, true);
const bigFixture = structuredClone(baseFixture), baseIds = new Set(bigFixture.inventory.products.map(item => item.productId));
const extra = actualInventory.filter(item => !baseIds.has(item.productId)).slice(0, 14);
bigFixture.inventory.products.push(...extra); bigFixture.groups[1].productIds.push(...extra.map(item => item.productId));
const bigRendered = await hydrate(bigFixture, true), bigGroup = bigRendered.data.banffExperienceGroups.find(item => !item.existingGuidePath);
const bigHtml = await container.renderToString(bigRendered.Options, { props: { group: bigGroup }, request: new Request('https://banffbound.com/experiences/horse-fixture/') });
const bn = walk(parse(bigHtml)), serverCards = bn.filter(n => attr(n, 'data-experience-option') !== undefined);
assert.equal(serverCards.length, 16); assert(serverCards.every(card => attr(card, 'hidden') === undefined));
const optionSource = await readFile(path.join(root, 'src/components/ExperienceOptions.astro'), 'utf8');
const optionJS = (await transformJS(optionSource.match(/<script>\n([\s\S]*?)<\/script>/)[1], { loader: 'ts', target: 'es2022' })).code;
const optionEvents = {}, optionCards = serverCards.map(node => ({ hidden: false, dataset: { optionSearch: attr(node, 'data-option-search') } }));
const input = { value: '' }, counter = { textContent: '' }, showAll = { hidden: true, textContent: '', addEventListener: (type, fn) => { optionEvents['button-' + type] = fn; } }, optionForm = { hidden: true, addEventListener: (type, fn) => { optionEvents[type] = fn; } };
const section = { dataset: {}, querySelector: selector => ({ '[data-experience-option-controls]': optionForm, '[data-experience-option-search]': input, '[data-experience-option-show-all]': showAll, '[data-experience-option-count]': counter }[selector]), querySelectorAll: () => optionCards };
const pageEvents = {};
vm.runInNewContext(optionJS, { document: { querySelectorAll: () => [section], addEventListener: (type, fn) => { pageEvents[type] = fn; } }, requestAnimationFrame: fn => fn() });
assert.equal(optionForm.hidden, false); assert.equal(optionCards.filter(c => !c.hidden).length, 12); assert.equal(showAll.hidden, false); assert.equal(showAll.textContent, 'Show all 16 options');
optionEvents['button-click'](); assert.equal(optionCards.filter(c => !c.hidden).length, 16); assert.equal(showAll.hidden, true);
input.value = 'there-is-no-such-option'; optionEvents.input(); assert.equal(optionCards.filter(c => !c.hidden).length, 0); assert.equal(showAll.hidden, true);
input.value = ''; optionEvents.reset(); assert.equal(optionCards.filter(c => !c.hidden).length, 12); assert.equal(showAll.hidden, false);
pageEvents['astro:page-load'](); assert.equal(optionCards.filter(c => !c.hidden).length, 12);
let actualResult;
if (!process.argv.includes('--fixtures-only')) {
  const actual = await actualSource();
  assert(actual.data.experienceCoverage.identityCoverageComplete, 'Every production identity must be mapped or explicitly excluded.');
  assert(actual.data.banffExperienceGroups.length > 0 && actual.data.experienceProducts.length > 0);
  assert.equal(actual.data.experienceCoverage.counts.fullyReviewedDescriptions + actual.data.experienceCoverage.counts.listingOnlyProducts, actual.data.experienceCoverage.counts.discoveredProducts);
  for (const target of actual.activityCampaignTargets) {
    for (const legacy of [target.guidePath, ...target.aliases]) {
      const matched = actual.data.getExperienceGroupForPath(legacy);
      assert(matched && matched.primaryProductId === target.primaryOfferId.replace(/^gyg-/, ''), 'Preserve every existing primary guide/alias: ' + legacy);
    }
  }
  const actualPaths = await actual.getStaticPaths();
  assert.deepEqual(actualPaths.map(item => item.params.slug).sort(), actual.data.newExperienceGuides.map(item => item.slug).sort());
  let actualCards = 0, newPageCount = 0;
  for (const group of actual.data.banffExperienceGroups) {
    assert(group.primary.details, group.id + ': every guide has a full-description review for its main option.');
    assertPrimaryDetailScope(group);
    assert.equal(actual.data.experienceBookingTarget(group).title, group.primary.details?.title || group.primary.optionTitle);
    const opts = await container.renderToString(actual.Options, { props: { group }, request: new Request('https://banffbound.com' + group.canonicalPath + '?email=BB_TEST_SECRET_9&cmp=BB_TEST_CMP_ATTACK_9') });
    const nodes = walk(parse(opts)), optionCards = nodes.filter(n => attr(n, 'data-experience-option') !== undefined);
    assert.equal(optionCards.length, group.productIds.length);
    assert(optionCards.every(card => attr(card, 'hidden') === undefined), 'Every native option exists without JS.');
    const forbidden = visible(opts).match(/BB_TEST_SECRET_9|BB_TEST_CMP_ATTACK_9|listing-only|launchState|unresolved|Hold paid ads/);
    assert(!forbidden, group.id + ': ' + (forbidden ? visible(opts).slice(Math.max(0, forbidden.index - 90), forbidden.index + 140) : ''));
    for (const option of group.options) {
      const card = optionCards.find(n => attr(n, 'data-experience-option') === option.productId);
      const link = walk(card).find(n => attr(n, 'data-offer-id') === option.offerId);
      assert(link);
      const href = new URL(attr(link, 'href'));
      assert.equal(href.origin, 'https://www.getyourguide.com');
      assert.equal(href.searchParams.get('partner_id'), 'QW960HO');
      assert.equal(href.searchParams.get('cmp'), 'banffbound_experience_' + option.productId);
      assert.equal(attr(link, 'data-affiliate-target-path'), href.pathname);
      assert.equal(attr(link, 'data-paid-affiliate-campaign'), 'bb_ca_activities_experience_' + option.productId);
      if (!option.details) {
        assert(!walk(card).some(n => hasClass(n, 'operator-name') || hasClass(n, 'operator-facts') || hasClass(n, 'operator-planning-notes')));
        assert(text(link).includes('Find out more'));
      }
    }
    actualCards += optionCards.length;
    if (!group.existingGuidePath) {
      const html = await container.renderToString(actual.Page, { props: { group }, request: new Request('https://banffbound.com' + group.canonicalPath + '?email=BB_TEST_SECRET_9&cmp=BB_TEST_CMP_ATTACK_9') });
      const nodes = walk(parse(html)), bar = nodes.find(n => attr(n, 'data-activity-booking-mobile') !== undefined);
      assert(bar && attr(bar, 'hidden') === undefined);
      assert.equal(nodes.filter(n => attr(n, 'data-activity-booking') !== undefined).length, 1);
      const hero = nodes.find(n => n.tagName === 'header' && attr(n, 'class')?.includes('experience-hero'));
      assert.equal(walk(hero).find(n => n.tagName === 'img').attrs.find(a => a.name === 'src').value, actual.getExperienceHeroPhoto().src);
      assert(nodes.some(n => n.tagName === 'figure' && attr(n, 'class')?.includes('experience-activity-photo')));
      const editorial = nodes.find(n => hasClass(n, 'experience-editorial'));
      assert(editorial);
      if (group.options.length > 1 && group.primary.details) {
        const checks = nodes.find(n => attr(n, 'data-experience-booking-checks') !== undefined);
        assert(checks && text(checks).includes('Checks for this booking option') && text(checks).includes(group.primary.details.title), 'The example’s booking checks name that option, rather than the whole family.');
      }
      for (const section of group.sections) {
        const heading = walk(editorial).find(n => n.tagName === 'h2' && attr(n, 'id') === section.id);
        assert(heading && text(heading).trim() === section.title);
        assert(section.paragraphs.every(paragraph => text(editorial).replace(/\s+/g, ' ').includes(paragraph)), 'Scope and planning text remain visible in the editorial example: ' + group.id);
      }
      assert(!/BB_TEST_SECRET_9|BB_TEST_CMP_ATTACK_9|listing-only|launchState|unresolved|Hold paid ads/.test(visible(html)));
      newPageCount++;
    }
  }
  const html = await container.renderToString(actual.Directory, { request: new Request('https://banffbound.com/experiences/?email=BB_TEST_SECRET_9') });
  assert.equal(walk(parse(html)).filter(n => attr(n, 'data-experience-card') !== undefined).length, actual.data.banffExperienceGroups.length);
  assert(!visible(html).includes('BB_TEST_SECRET_9'));
  actualResult = { ...actual.data.experienceCoverage.counts, groupGuides: actual.data.banffExperienceGroups.length, newGuidesRendered: newPageCount, allOperatorCardsRendered: actualCards, identityCoverageComplete: true, allDescriptionsReviewed: actual.data.experienceCoverage.allDescriptionsReviewed };
}
console.log(JSON.stringify({ result: 'PASS', scope: 'Actual model/template/component/controller source; fixture negatives plus complete production data when present. No provider/calendar, account, browser or full-build proof.', modelNegativeFixtures: negative.length, primaryScopingNegativeFixtures: 2, fixtureAstroRenders: 3, actualDirectoryControllerCases: 3, actualOperatorControllerCases: 5, largeOperatorSSRNativeCards: 16, neutralHeroAndInBodyActivityPhoto: true, originalPageLoadCTA: true, production: actualResult || 'not run (--fixtures-only)' }, null, 2));
