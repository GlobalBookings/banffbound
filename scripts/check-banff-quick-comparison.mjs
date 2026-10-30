import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parse } from 'parse5';
import { schemaNodes } from './verify-cycling-consent-release.mjs';
import { consentHarness, validConsent } from './lib/consent-harness.mjs';

// Actual page/layout SSR and the existing inline controller, entirely offline.
globalThis.fetch = () => { throw Error('No network in Banff quick-comparison checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const filename = path.join(root, 'src/pages/book/banff-hotels.astro');
const source = await readFile(filename, 'utf8');
const importCode = code => import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const bundle = await build({ stdin: { contents: "export * from './src/data/banffHotelLanding.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const model = await importCode(bundle.outputFiles[0].text);
const offers = model.banffHotelLandingOffers;
const ids = ['moose-hotel-suites', 'mount-royal-hotel', 'tunnel-mountain-resort', 'canalta-lodge', 'juniper-hotel', 'fairmont-banff-springs'];
const roomLabels = [
  'Superior One Bedroom Suite', 'Heritage and Centennial king or two-bed categories',
  'One Bedroom Condo; loft categories introduce stairs', 'King with Sofa and Kitchen Loft; check loft stairs',
  'Deluxe King or Two Queen; outlook varies by category', 'Gatehouse Family Room or separate Family Suite',
];
const roomEvidence = [
  ['Superior One Bedroom Suite'], ['Heritage', 'Centennial', 'king or two-bed categories'],
  ['One Bedroom Condo', 'Loft categories', 'introduce stairs'], ['King with Sofa and Kitchen Loft', 'loft stairs'],
  ['Deluxe King', 'Two Queen', 'mountain-facing outlook', 'different positions'], ['Gatehouse Family Room', 'separate Family Suite'],
];
assert.deepEqual(offers.map(offer => offer.slug), ids);
assert.equal(model.banffHotelLandingId, 'banff-hotels');
assert.equal(model.banffHotelLandingCheckedOn, '2026-10-29');
assert.deepEqual(offers.map(offer => offer.expediaPropertyId), ['14703440', '688930', '16324', '888459', '1216217', '13652']);
for (const [i, offer] of offers.entries()) {
  for (const evidence of roomEvidence[i]) assert.ok((offer.room + ' ' + offer.kitchen).includes(evidence), 'Short label must be supported by the existing offer: ' + evidence);
  assert.equal(offer.bookingTargetKind, 'verified-property');
  const url = new URL(offer.expediaUrl); assert.equal(url.origin, 'https://www.expedia.ca');
  assert.equal(url.searchParams.get('camref'), '1101l3MtWX'); assert.deepEqual([...url.searchParams.keys()], ['camref']);
}

const compiledPaths = new Set();
const stripMetadata = code => code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, '');
const renderedBundle = await build({ stdin: { contents: `export { default } from '${filename}';`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'actual-banff-landing', setup(builder) {
  builder.onResolve({ filter: /^astro\// }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
  builder.onResolve({ filter: /(?:\?astro&type=style|\.css$)/ }, args => ({ path: args.path, namespace: 'fixture-style' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture-style' }, () => ({ contents: 'export {};' }));
  builder.onResolve({ filter: /\.astro$/ }, args => ({ path: path.resolve(args.resolveDir, args.path), namespace: 'actual-astro' }));
  builder.onLoad({ filter: /.*/, namespace: 'actual-astro' }, async args => {
    compiledPaths.add(args.path);
    const compiled = await transform(await readFile(args.path, 'utf8'), { filename: args.path, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
    assert.deepEqual(compiled.diagnostics.filter(item => item.severity === 1), [], args.path);
    return { contents: stripMetadata(compiled.code), loader: 'ts', resolveDir: path.dirname(args.path) };
  });
} }] });
for (const file of ['src/layouts/PaidLandingLayout.astro','src/layouts/BaseLayout.astro','src/components/BookingHeader.astro','src/components/BookingFooter.astro']) assert.ok(compiledPaths.has(path.join(root, file)), 'Actual shared chrome: ' + file);
const Page = (await importCode(renderedBundle.outputFiles[0].text)).default;
const container = await experimental_AstroContainer.create();
const html = await container.renderToString(Page, { request: new Request('https://banffbound.com/book/banff-hotels/?base=hillside&email=PRIVATE_EMAIL&gclid=PRIVATE_CLICK') });
const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, key) => node?.attrs?.find(item => item.name === key)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const normal = value => value.replace(/\s+/g, ' ').trim();
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const hidden = node => Boolean(node && (attr(node, 'hidden') !== undefined || attr(node, 'aria-hidden') === 'true' || /display\s*:\s*none/.test(attr(node, 'style') ?? '') || hidden(node.parentNode)));
function inspect(markup) {
  const nodes = walk(parse(markup));
  const byId = id => { const matches = nodes.filter(node => attr(node, 'id') === id); assert.equal(matches.length, 1, '#' + id); return matches[0]; };
  const table = byId('hotel-quick-comparison'), region = byId('hotel-quick-region');
  assert.ok(!hidden(table) && !hidden(region)); assert.equal(attr(region, 'tabindex'), '0'); assert.equal(attr(region, 'role'), 'region');
  assert.equal(attr(region, 'aria-describedby'), 'hotel-comparison-note'); assert.ok(attr(region, 'aria-label'));
  assert.equal(normal(text(walk(table).find(node => node.tagName === 'caption'))), 'Six Banff bases and room categories to compare');
  const rows = walk(table).filter(node => attr(node, 'data-quick-offer') !== undefined);
  assert.deepEqual(rows.map(node => attr(node, 'data-quick-offer')), ids); assert.ok(rows.every(row => !hidden(row)));
  assert.deepEqual(walk(table).filter(node => node.tagName === 'th' && attr(node, 'scope') === 'col').map(node => normal(text(node))), ['Stay and base','Room and cooking','Your dates']);
  const cards = nodes.filter(node => attr(node, 'data-hotel-offer') !== undefined);
  assert.deepEqual(cards.map(node => attr(node, 'id')), ids.map(id => 'stay-' + id)); assert.ok(cards.every(card => !hidden(card)), 'All six detailed cards remain SSR-visible');
  const firstMerchant = nodes.findIndex(node => node.tagName === 'a' && attr(node, 'data-offer-id'));
  assert.ok(nodes.findIndex(node => hasClass(node, 'affiliate-note')) < firstMerchant, 'Disclosure precedes all merchant links');
  assert.ok(nodes.indexOf(table) < nodes.indexOf(byId('banff-hotel-fit')) && nodes.indexOf(table) < nodes.indexOf(cards[0]), 'Comparison precedes filters and tall cards');
  assert.ok(normal(text(byId('hotel-comparison-note'))).includes('always shows all six stays. Filters below narrow the detailed cards only; they do not check availability.'));
  assert.equal(attr(byId('banff-hotel-fit'), 'aria-describedby'), 'hotel-comparison-note'); assert.ok(hidden(byId('banff-hotel-fit')), 'No inert controls without JS');
  assert.equal(attr(byId('hotel-fit-count'), 'role'), 'status'); assert.equal(attr(byId('hotel-fit-count'), 'aria-live'), 'polite'); assert.ok(hidden(byId('hotel-fit-empty')));
  const merchantLinks = nodes.filter(node => node.tagName === 'a' && attr(node, 'data-offer-id'));
  assert.equal(merchantLinks.length, 12);
  for (const [i, offer] of offers.entries()) {
    const row = rows[i], rowNodes = walk(row), cardNodes = walk(cards[i]);
    assert.equal(attr(rowNodes.find(node => node.tagName === 'th'), 'scope'), 'row');
    assert.ok(normal(text(row)).includes(offer.name) && normal(text(row)).includes(offer.address));
    assert.ok(normal(text(row)).includes(model.banffHotelBaseOptions.find(option => option.value === offer.base).label));
    assert.equal(normal(text(rowNodes.find(node => hasClass(node, 'quick-room')))), roomLabels[i]);
    assert.ok(normal(text(row)).includes(offer.kitchen), 'Complete cooking qualification');
    for (const field of ['room','kitchen','facilities','tradeoff']) assert.ok(normal(text(cards[i])).includes(offer[field]), 'Protected detail ' + field);
    if (offer.notice) { const notice = rowNodes.find(node => hasClass(node, 'quick-notice')); assert.ok(notice && !hidden(notice)); assert.ok(normal(text(notice)).includes(offer.notice)); assert.ok(normal(text(cards[i])).includes(offer.notice)); }
    const links = merchantLinks.filter(node => attr(node, 'data-offer-id') === offer.slug);
    assert.deepEqual(links.map(node => attr(node, 'data-landing-placement')), ['comparison-table','detail-card']);
    for (const link of links) { assert.ok(!hidden(link)); assert.equal(attr(link, 'href'), offer.expediaUrl); assert.equal(attr(link, 'data-landing-id'), 'banff-hotels'); assert.equal(attr(link, 'target'), '_blank'); assert.equal(attr(link, 'rel'), 'sponsored noopener'); assert.ok(attr(link, 'aria-label').includes(offer.name)); assert.ok(!(link.attrs ?? []).some(a => /^on/i.test(a.name))); }
    assert.equal(rowNodes.filter(node => node.tagName === 'a' && attr(node, 'href') === '#stay-' + offer.slug).length, 2);
    assert.ok(cardNodes.some(node => node.tagName === 'a' && attr(node, 'href') === offer.profileUrl));
  }
  const scripts = nodes.filter(node => node.tagName === 'script' && attr(node, 'type') === 'application/ld+json').map(node => JSON.parse(text(node)));
  const faqs = scripts.flatMap(doc => schemaNodes(doc, 'FAQPage')); assert.equal(faqs.length, 1);
  assert.deepEqual(faqs[0].mainEntity.map(item => ({ question:item.name, answer:item.acceptedAnswer.text })), model.banffHotelLandingFaqs);
  const details = nodes.filter(node => node.tagName === 'details');
  for (const faq of model.banffHotelLandingFaqs) assert.equal(details.filter(node => normal(text(walk(node).find(child => child.tagName === 'summary'))) === faq.question && normal(text(node)).includes(faq.answer)).length, 1);
  assert.deepEqual(scripts.flatMap(doc => schemaNodes(doc, 'ItemList')), [model.banffHotelLandingSchema.mainEntity]);
  assert.equal(nodes.filter(node => node.tagName === 'header').length, 1); assert.ok(nodes.some(node => hasClass(node, 'booking-header')) && nodes.some(node => hasClass(node, 'booking-footer')));
  assert.ok(!/PRIVATE_EMAIL|PRIVATE_CLICK/.test(markup));
  return { nodes, rows, cards, merchantLinks, byId };
}
const rendered = inspect(html);
let negatives = 0;
const reject = (mutated, message) => { assert.notEqual(mutated, html, 'Fixture must change actual output: ' + message); assert.throws(() => inspect(mutated), message); negatives++; };
const replaceRow = (id, mutate) => html.replace(new RegExp(`<tr\\b[^>]*data-quick-offer="${id}"[^>]*>[\\s\\S]*?<\\/tr>`), mutate);
reject(replaceRow(ids[0], () => ''), 'Missing comparison row');
reject(replaceRow(ids[0], row => row.replace('camref=1101l3MtWX', 'camref=wrong')), 'Altered affiliate URL');
reject(replaceRow(ids[0], row => row.replace('comparison-table', 'query-value')), 'Unreviewed placement');
reject(replaceRow(ids[0], row => row.replace('Suite nook with microwave, mini-fridge and sink; no full cooking kitchen.', 'Full kitchen in every room.')), 'Cooking qualification removed');
reject(replaceRow(ids[1], row => row.replace(/<p\b([^>]*class="quick-notice[^>]*?)>/, '<p$1 hidden>')), 'Hidden material maintenance note');
reject(replaceRow(ids[1], row => row.replace(/<p[^>]*class="quick-notice[^>]*>[\s\S]*?<\/p>/, '')), 'Missing material maintenance note');
reject(replaceRow(ids[2], row => row.replace('loft categories introduce stairs', 'every layout is step-free')), 'Unsupported room assertion');
reject(replaceRow(ids[0], row => row.replace(/<a\b([^>]*class="quick-booking[^>]*?)>/, '<a$1 onclick="collect()">')), 'Unsafe native anchor attribute');
reject(html.replace('id="hotel-quick-region"', 'id="hotel-quick-region" hidden'), 'Hidden no-JS comparison');
reject(html.replace('Filters below narrow the detailed cards only; they do not check availability.', 'Filters check live availability.'), 'Misstated filter purpose');
reject(html.replace('"@type":"FAQPage"', '"@type":"WebPage"'), 'Missing FAQ schema');

const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1]; assert.ok(script);
function harness(search = '', missingId = null) {
  const map = new Map(), documentEvents = {}, state = { activeElement:null };
  const element = node => {
    const item = { id:attr(node, 'id') ?? '', value:attr(node, 'value') ?? '', hidden:hidden(node), dataset:Object.fromEntries((node.attrs ?? []).filter(a => a.name.startsWith('data-')).map(a => [a.name.slice(5).replace(/-([a-z])/g, (_m,c) => c.toUpperCase()),a.value])), textContent:normal(text(node)), listeners:{}, addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }, focus() { state.activeElement=this; } };
    if (node.tagName === 'select') { item.name=attr(node,'name'); item.options=walk(node).filter(child => child.tagName === 'option').map(child => ({value:attr(child,'value')})); item.value=item.options[0].value; }
    return item;
  };
  for (const node of rendered.nodes.filter(node => attr(node, 'id'))) map.set(attr(node,'id'),element(node));
  const cards=rendered.cards.map(node=>map.get(attr(node,'id'))),rows=rendered.rows.map(element),form=map.get('banff-hotel-fit');
  const fire=(id,type)=>{for(const fn of map.get(id).listeners[type]??[])fn({preventDefault(){}});};
  form.reset=()=>{fire('banff-hotel-fit','reset'); for(const id of ['hotel-base','hotel-priority'])map.get(id).value='all';};
  const document={getElementById:id=>id===missingId?null:map.get(id),querySelectorAll:selector=>{assert.equal(selector,'[data-hotel-offer]','Only detail cards may be filtered');return cards;},addEventListener(type,fn){(documentEvents[type]??=[]).push(fn);}};
  Object.defineProperty(document,'activeElement',{get(){return state.activeElement;}});
  vm.runInNewContext(script,{document,window:{location:{search}},URLSearchParams});
  return {map,cards,rows,fire,document,again(){for(const fn of documentEvents['astro:page-load']??[])fn();}};
}
const client=harness(); assert.equal(client.map.get('banff-hotel-fit').hidden,false);
let combinations=0;
for(const base of model.banffHotelBaseOptions)for(const priority of model.banffHotelPriorityOptions){
  const focused=client.map.get('hotel-base');focused.value=base.value;client.map.get('hotel-priority').value=priority.value;focused.focus();client.fire('hotel-base','change');
  const expected=offers.filter(offer=>(base.value==='all'||offer.base===base.value)&&(priority.value==='all'||offer.priorities.includes(priority.value))).map(offer=>offer.slug);
  assert.deepEqual(client.cards.filter(card=>!card.hidden).map(card=>card.id.slice('stay-'.length)),expected);
  assert.ok(client.rows.every(row=>!row.hidden),'Quick comparison stays all six'); assert.equal(client.map.get('hotel-fit-empty').hidden,expected.length!==0); assert.equal(client.document.activeElement,focused);
  assert.ok(client.map.get('hotel-fit-count').textContent.startsWith(String(expected.length)+' ')); combinations++;
}
client.fire('hotel-fit-clear','click'); assert.equal(client.cards.filter(card=>!card.hidden).length,6); assert.ok(client.rows.every(row=>!row.hidden));
client.again(); assert.equal(client.map.get('hotel-base').listeners.change.length,1);
const restored=harness('?base=hillside&priority=cook&email=PRIVATE_EMAIL'); assert.deepEqual(restored.cards.filter(card=>!card.hidden).map(card=>card.id.slice('stay-'.length)),['tunnel-mountain-resort']); assert.ok(restored.rows.every(row=>!row.hidden));
const unknown=harness('?base=%3Cscript%3E&priority=available-now'); assert.equal(unknown.cards.filter(card=>!card.hidden).length,6);
const unavailable=harness('', 'hotel-priority'); assert.equal(unavailable.map.get('banff-hotel-fit').hidden,true); assert.ok(unavailable.cards.every(card=>!card.hidden)&&unavailable.rows.every(row=>!row.hidden));

const firstLink=rendered.merchantLinks[0]; let consentCases=0;
for(const paidSource of ['google','bing'])for(const analytics of [false,true])for(const advertising of [false,true]){
  const h=consentHarness({stored:validConsent({analytics,advertising}),initTracking:true,paidLanding:true,landingId:'banff-hotels',pageHref:`https://banffbound.com/book/banff-hotels/?utm_source=${paidSource}&utm_medium=cpc&gclid=PRIVATE_CLICK&email=PRIVATE_EMAIL`});
  const click=h.linkClick(attr(firstLink,'href'),{landingId:attr(firstLink,'data-landing-id'),offerId:attr(firstLink,'data-offer-id'),placement:attr(firstLink,'data-landing-placement')});
  assert.equal(click.prevented,0); assert.equal(click.link.href,attr(firstLink,'href')); assert.equal(h.opened,0);
  const event=h.commands.find(command=>command[1]==='affiliate_click');assert.equal(Boolean(event),analytics);if(event){assert.equal(event[2].placement,'comparison-table');assert.equal(event[2].offer_id,ids[0]);assert.equal(event[2].paid_source,paidSource);}
  const conversion=h.commands.find(command=>command[1]==='conversion');assert.equal(Boolean(conversion),advertising);if(conversion)assert.equal(conversion[2].value,undefined);
  assert.ok(!/PRIVATE_CLICK|PRIVATE_EMAIL|gclid=|email=/.test(JSON.stringify(h.commands)));consentCases++;
}
console.log(`Banff quick comparison checks passed: actual PaidLandingLayout/BaseLayout SSR; six qualified rows before six intact cards, 12 exact native CTAs, FAQ/schema/chrome; ${combinations} actual-client filter combinations, reset/focus/no-JS/failure/idempotence; ${consentCases} consented fixed-placement cases; ${negatives} material negative regressions. No network, browser, site build or file output.`);
