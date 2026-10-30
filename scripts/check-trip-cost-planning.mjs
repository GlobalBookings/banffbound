import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';

globalThis.fetch = () => { throw Error('No network in trip budget checks'); };
const compiledData = await build({ entryPoints: ['src/data/tripCostPlanning.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(compiledData.outputFiles[0].text).toString('base64'));
const { tripBudgetCategories: categories, defaultTripBudget: defaults, calculateTripBudget: calculate, formatBudgetMoney: money } = d;
const clone = value => JSON.parse(JSON.stringify(value));
assert.equal(d.tripBudgetReviewedAt, '2026-10-29'); assert.equal(d.tripBudgetFaqs.length, 5);
assert.deepEqual(categories.map(row => row.id), ['lodging','food','activities','transport','arrival','admission','extras']);
const blank = calculate(defaults); assert.equal(blank.errors.length, 0); assert.equal(blank.plans[0].totalCents, null); assert.equal(blank.plans[0].missingCount, 7); assert.equal(blank.plans[0].subtotalCents, 0);
const fixture = clone(defaults);
Object.assign(fixture, { people: '4', days: '6', nights: '5', reserve: '10', confirmed: true });
fixture.plans.a.rooms = '2';
for (const [id, amount] of Object.entries({ lodging: '250.15', food: '40', activities: '900', transport: '450', arrival: '1600', admission: '120', extras: '75.35' })) fixture.plans.a.items[id].amount = amount;
let result = calculate(fixture); assert.deepEqual(result.errors, []);
assert.deepEqual(result.plans[0].rows.map(row => row.cents), [250150,96000,90000,45000,160000,12000,7535]);
assert.equal(result.plans[0].subtotalCents, 660685); assert.equal(result.plans[0].reserveCents, 66069); assert.equal(result.plans[0].totalCents, 726754);
assert.equal(result.plans[0].perPersonCents, 181689); assert.equal(result.plans[0].perPersonDayCents, 30281);
assert.ok(money(726754).includes('7,267.54')); assert.ok(money(0).includes('0.00'));
const comparison = clone(fixture); comparison.compare = true; comparison.plans.b = clone(fixture.plans.a); comparison.plans.b.items.transport.amount = '350';
result = calculate(comparison); assert.equal(result.comparison.state, 'different'); assert.equal(result.comparison.lower, 'b'); assert.equal(result.comparison.differenceCents, 11000);
comparison.plans.b.items.transport.amount = '450'; assert.equal(calculate(comparison).comparison.state, 'tie');
comparison.confirmed = false; assert.equal(calculate(comparison).comparison.state, 'unconfirmed');
comparison.plans.b.items.arrival.mode = 'omit'; result = calculate(comparison); assert.equal(result.comparison.state, 'incomplete'); assert.equal(result.plans[1].totalCents, null); assert.equal(result.plans[1].omittedCount, 1);
const packageInput = clone(fixture); packageInput.plans.a.items.lodging = { mode: 'quoted', amount: '4000', basis: 'trip' }; packageInput.plans.a.rooms = 'not used';
for (const id of ['food','activities']) packageInput.plans.a.items[id] = { mode: 'included', amount: '-999', basis: 'not used' };
result = calculate(packageInput); assert.deepEqual(result.errors, []); assert.equal(result.plans[0].rows[0].cents, 400000); assert.equal(result.plans[0].rows[1].cents, 0); assert.equal(result.plans[0].rows[2].cents, 0);
const bedInput = clone(fixture); bedInput.plans.a.items.lodging = { mode: 'quoted', amount: '55', basis: 'bed-night' }; bedInput.plans.a.rooms = 'unused';
assert.equal(calculate(bedInput).plans[0].rows[0].cents, 110000);
bedInput.plans.a.items.lodging.basis = 'party-night'; assert.equal(calculate(bedInput).plans[0].rows[0].cents, 27500);
bedInput.plans.a.items.food.basis = 'party-day'; assert.equal(calculate(bedInput).plans[0].rows[1].cents, 24000);
bedInput.plans.a.items.food.basis = 'trip'; assert.equal(calculate(bedInput).plans[0].rows[1].cents, 4000);
const dayInput = clone(fixture); dayInput.days = '1'; dayInput.nights = '0'; dayInput.plans.a.rooms = ''; dayInput.plans.a.items.lodging.amount = '';
result = calculate(dayInput); assert.deepEqual(result.errors, []); assert.equal(result.plans[0].rows[0].cents, 0); assert.equal(result.plans[0].complete, true);
const zeroInput = clone(defaults); for (const row of Object.values(zeroInput.plans.a.items)) row.amount = '0';
result = calculate(zeroInput); assert.equal(result.plans[0].totalCents, 0); assert.equal(result.plans[0].missingCount, 0);
const unusedB = clone(fixture); unusedB.plans.b = { rooms: '<script>', items: null }; assert.deepEqual(calculate(unusedB).errors, [], 'Disabled Plan B cannot block Plan A.');
for (const amount of ['-1', '1e3', 'Infinity', 'NaN', '0.001', '1000000.01', '<img src=x>', [], true]) {
  const invalid = clone(fixture); invalid.plans.a.items.food.amount = amount; const output = calculate(invalid);
  assert.ok(output.errors.some(error => error.field === 'budget-a-food-amount')); assert.equal(output.plans.length, 0);
}
for (const [field, value] of [['people','0'],['people','2.5'],['days','91'],['nights','7'],['reserve','100.01']]) { const invalid = clone(fixture); invalid[field] = value; assert.ok(calculate(invalid).errors.some(error => error.field === 'budget-' + field)); }
for (const input of [null, [], undefined, 'cost', {}]) assert.ok(calculate(input).errors.length);
const before = JSON.stringify(fixture); calculate(fixture); assert.equal(JSON.stringify(fixture), before, 'Pure model cannot mutate visitor inputs.');

const pageFilename = path.resolve('src/pages/trip-cost.astro'), source = await readFile(pageFilename, 'utf8');
const page = await transform(source, { filename: pageFilename, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(page.diagnostics.filter(item => item.severity === 1), []);
assert.equal(page.code.split('\n').filter(line => /^export const \$\$metadata = /.test(line)).length, 1);
const renderCode = page.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata = [^\n]*\n/m, '');
const require = createRequire(import.meta.url);
const ssr = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: path.dirname(pageFilename) }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'budget-page-fixtures', setup(builder) {
  builder.onResolve({ filter: /^astro\// }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
  builder.onResolve({ filter: /\?astro&type=style/ }, args => ({ path: args.path, namespace: 'budget-style' })); builder.onLoad({ filter: /.*/, namespace: 'budget-style' }, () => ({ contents: 'export {};' }));
  builder.onResolve({ filter: /\.astro$/ }, args => ({ path: args.path, namespace: 'budget-component' })); builder.onLoad({ filter: /.*/, namespace: 'budget-component' }, () => ({ contents: "import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js';export default createComponent((result,props,slots)=>render`${renderSlot(result,slots.default)}`);" }));
} }] });
let Component; try { Component = (await import('data:text/javascript;base64,' + Buffer.from(ssr.outputFiles[0].text).toString('base64'))).default; } catch (error) { throw Error('Trip budget SSR fixture import: ' + error.message); }
const container = await experimental_AstroContainer.create();
let html; try { html = await container.renderToString(Component, { request: new Request('https://banffbound.com/trip-cost?amount=PRIVATE_DO_NOT_RENDER&camref=ATTACKER') }); } catch (error) { throw Error('Trip budget SSR fixture render: ' + error.message); }
const nodes = root => [root, ...(root.childNodes ?? []).flatMap(nodes)], attr = (node, key) => node.attrs?.find(item => item.name === key)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const content = node => text(node).replace(/\s+/g, ' ').trim(), has = (node, key) => attr(node, key) !== undefined;
const tree = parseFragment(html), all = nodes(tree), byId = id => all.find(node => attr(node, 'id') === id);
assert.equal(all.filter(node => node.tagName === 'h1').length, 1); assert.equal(content(all.find(node => node.tagName === 'h1')), 'Trip Cost Calculator');
const ids = all.map(node => attr(node, 'id')).filter(Boolean); assert.equal(new Set(ids).size, ids.length, 'All control/result IDs unique.');
assert.ok(has(byId('trip-budget-form'), 'hidden')); assert.ok(has(byId('budget-errors'), 'hidden')); assert.ok(has(byId('budget-print'), 'hidden'));
assert.ok(has(byId('budget-b-fields'), 'hidden') && has(byId('budget-b-fields'), 'disabled') && has(byId('budget-b-result'), 'hidden'));
assert.equal(attr(byId('budget-comparison'), 'role'), 'status'); assert.equal(attr(byId('budget-comparison'), 'aria-live'), 'polite'); assert.equal(attr(byId('budget-errors'), 'role'), 'alert');
assert.equal(content(byId('budget-a-total')), 'No total yet'); assert.ok(!has(byId('trip-budget-worksheet'), 'hidden')); assert.ok(all.some(node => node.tagName === 'noscript'));
assert.equal(nodes(byId('trip-budget-worksheet')).filter(node => node.tagName === 'tbody').flatMap(node => node.childNodes.filter(child => child.tagName === 'tr')).length, 10);
for (const node of all.filter(node => ['input','select'].includes(node.tagName) && attr(node, 'type') !== 'hidden')) assert.ok(all.some(label => label.tagName === 'label' && attr(label, 'for') === attr(node, 'id')), 'Missing actual label for ' + attr(node, 'id'));
for (const id of ['a','b']) {
  assert.equal(nodes(byId('budget-' + id + '-result')).filter(node => has(node, 'data-budget-row')).length, 7);
  for (const category of categories) {
    const mode = byId(`budget-${id}-${category.id}-mode`), amount = byId(`budget-${id}-${category.id}-amount`), basis = byId(`budget-${id}-${category.id}-basis`);
    assert.deepEqual(nodes(mode).filter(node => node.tagName === 'option').map(node => attr(node, 'value')), d.tripBudgetModes.map(([value]) => value));
    assert.equal(attr(amount, 'value'), undefined, 'No volatile price default');
    if (category.bases.length > 1) assert.deepEqual(nodes(basis).filter(node => node.tagName === 'option').map(node => [attr(node, 'value'), content(node)]), category.bases.map(tuple => [...tuple]));
    else assert.equal(attr(basis, 'value'), 'trip');
  }
}
assert.ok(nodes(byId('trip-budget-form')).some(node => node.tagName === 'button' && attr(node, 'type') === 'reset'));
const links = all.filter(node => node.tagName === 'a').map(node => attr(node, 'href'));
for (const href of ['/hotels','/trip-builder','/book/banff-hotels/','/book/lake-louise-stays/','/book/banff-winter-activities/','/eat-and-drink/','https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees','https://roamtransit.com/fares/','https://www.skibig3.com/ski/lift-tickets/']) assert.ok(links.includes(href), 'Preserved/verified source and journey link ' + href);
const faqSchema = all.filter(node => node.tagName === 'script' && attr(node, 'type') === 'application/ld+json').map(node => JSON.parse(text(node)));
assert.equal(faqSchema.length, 1); assert.equal(faqSchema[0]['@type'], 'FAQPage'); assert.equal(faqSchema[0].mainEntity.length, 5);
const visibleFaq = all.filter(node => node.tagName === 'details'); assert.equal(visibleFaq.length, 5);
for (const [index, faq] of visibleFaq.entries()) { assert.equal(content(faq.childNodes.find(node => node.tagName === 'summary')), d.tripBudgetFaqs[index].question); assert.equal(content(faq.childNodes.find(node => node.tagName === 'p')), d.tripBudgetFaqs[index].answer); assert.equal(faqSchema[0].mainEntity[index].acceptedAnswer.text, d.tripBudgetFaqs[index].answer); }
assert.ok(!/PRIVATE_DO_NOT_RENDER|ATTACKER|2026 Prices|20-40%|15-25%|Discovery Pass \(\$75|\$105|\$430|\$1,000/.test(html));
assert.ok(source.includes('<TripCostInteractions />'));

const componentSource = await readFile('src/components/TripCostInteractions.astro', 'utf8');
const component = await transform(componentSource, { filename: 'src/components/TripCostInteractions.astro' }); assert.deepEqual(component.diagnostics.filter(item => item.severity === 1), []);
const script = componentSource.match(/<script>([\s\S]*?)<\/script>/)?.[1]; assert.ok(script);
assert.ok(!/localStorage|sessionStorage|fetch\(|document\.cookie|\.innerHTML|\.href\s*=|setAttribute\(['"]href|URLSearchParams|window\.location/.test(script), 'No remote requests, storage, URL inputs, HTML or merchant-link construction.');
const client = await build({ stdin: { contents: script, resolveDir: path.resolve('src/components'), sourcefile: 'TripCostInteractions.ts', loader: 'ts' }, bundle: true, write: false, platform: 'browser', format: 'iife', logLevel: 'silent' });
const code = client.outputFiles[0].text;
function browser({ missing = null, statusFailure = false } = {}) {
  let document;
  class Element {
    constructor(node = {}) { this.id = attr(node, 'id') ?? ''; this.tagName = node.tagName; this.attrs = new Map((node.attrs ?? []).map(item => [item.name, item.value])); this.dataset = {}; this.hidden = has(node, 'hidden'); this.disabled = has(node, 'disabled'); this.checked = has(node, 'checked'); this.value = attr(node, 'value') ?? (node.tagName === 'select' ? attr(nodes(node).find(item => item.tagName === 'option'), 'value') : '') ?? ''; this.listeners = new Map(); this.children = []; this._text = content(node); }
    get textContent() { return this._text; } set textContent(value) { if (this.failTextOnce) { this.failTextOnce = false; throw Error('Status failed'); } this._text = String(value); }
    setAttribute(key, value) { this.attrs.set(key, value); } removeAttribute(key) { this.attrs.delete(key); }
    addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]); } removeEventListener(type, fn) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== fn)); }
    replaceChildren(...children) { this.children = [...children]; this._text = ''; } append(child) { this.children.push(child); }
    focus() { document.activeElement = this; }
    dispatch(type) { const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } }; for (const fn of [...(this.listeners.get(type) ?? [])]) fn(event); return event; }
  }
  const elements = new Map(all.filter(node => attr(node, 'id')).map(node => [attr(node, 'id'), new Element(node)]));
  const rowValues = new Map();
  for (const id of ['a','b']) for (const row of nodes(byId(`budget-${id}-result`)).filter(node => has(node, 'data-budget-row'))) for (const kind of ['value','detail']) rowValues.set(`#budget-${id}-result [data-budget-row="${attr(row, 'data-budget-row')}"] [data-budget-${kind}]`, new Element(nodes(row).find(node => has(node, 'data-budget-' + kind))));
  if (missing) elements.delete(missing); if (statusFailure) elements.get('budget-comparison').failTextOnce = true;
  document = { activeElement: null, listeners: new Map(), querySelector(selector) { return rowValues.get(selector) ?? elements.get(selector.slice(1)) ?? null; }, getElementById(id) { return elements.get(id) ?? null; }, createElement() { return new Element(); }, addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]); } };
  let prints = 0; const window = { print() { prints++; } };
  vm.runInNewContext(code, { document, window, Intl, console });
  return { elements, rowValues, document, form: elements.get('trip-budget-form'), prints: () => prints, node: id => elements.get(id), set(input) {
    for (const key of ['people','days','nights','reserve']) elements.get('budget-' + key).value = input[key]; elements.get('budget-compare').checked = input.compare; elements.get('budget-confirmed').checked = input.confirmed;
    for (const id of ['a','b']) { const plan = input.plans[id]; elements.get(`budget-${id}-rooms`).value = plan.rooms; for (const category of categories) for (const key of ['mode','amount','basis']) elements.get(`budget-${id}-${category.id}-${key}`).value = plan.items[category.id][key]; }
    this.form.dispatch('change');
  } };
}
const b = browser(); assert.equal(b.form.hidden, false); assert.equal(b.form.dataset.budgetReady, 'true'); assert.equal(b.node('budget-print').hidden, false);
b.set(fixture); b.node('budget-a-food-amount').focus(); assert.equal(b.form.dispatch('submit').defaultPrevented, true); assert.equal(b.document.activeElement, b.node('budget-a-food-amount'), 'Calculation retains the submitting visitor’s focus.');
assert.equal(b.node('budget-a-total').textContent, money(726754)); assert.equal(b.node('budget-a-subtotal').textContent, money(660685)); assert.equal(b.node('budget-a-perperson').textContent, money(181689));
assert.ok(b.node('budget-a-summary').textContent.includes('4 people, 6 days and 5 nights'));
b.node('budget-a-food-amount').value = '45'; b.form.dispatch('input'); assert.equal(b.node('budget-a-total').textContent, 'Update your budget', 'Changed inputs cannot leave an apparently current total.');
b.set({ ...comparison, confirmed: true, plans: { a: clone(fixture.plans.a), b: clone(fixture.plans.a) } }); assert.equal(b.node('budget-b-fields').hidden, false); assert.equal(b.node('budget-b-fields').disabled, false); b.form.dispatch('submit'); assert.ok(b.node('budget-comparison').textContent.includes('equal'));
b.node('budget-b-arrival-mode').value = 'omit'; b.form.dispatch('change'); b.form.dispatch('submit'); assert.ok(b.node('budget-comparison').textContent.includes('Both plans need all seven')); assert.ok(b.node('budget-b-total').textContent.includes('entered so far')); assert.equal(b.node('budget-b-arrival-amount').disabled, true);
b.set(fixture); b.node('budget-a-food-amount').value = '-1'; b.form.dispatch('submit'); assert.equal(b.node('budget-errors').hidden, false); assert.equal(b.document.activeElement, b.node('budget-errors')); assert.equal(b.node('budget-a-food-amount').attrs.get('aria-invalid'), 'true');
b.node('budget-print').dispatch('click'); assert.equal(b.prints(), 1);
const resetFocus = new Object(); b.document.activeElement = resetFocus; assert.equal(b.form.dispatch('reset').defaultPrevented, true); assert.equal(b.document.activeElement, resetFocus); assert.equal(b.node('budget-people').value, '2'); assert.equal(b.node('budget-days').value, '5'); assert.equal(b.node('budget-nights').value, '4'); assert.equal(b.node('budget-a-lodging-amount').value, ''); assert.equal(b.node('budget-b-fields').hidden, true); assert.equal(b.node('budget-a-total').textContent, 'No total yet'); assert.equal(b.node('budget-errors').hidden, true);
for (const fn of b.document.listeners.get('astro:page-load') ?? []) fn(); assert.equal(b.form.listeners.get('submit').length, 1, 'Idempotent initialization.');
for (const options of [{ missing: 'budget-b-food-basis' }, { statusFailure: true }]) { const failed = browser(options); assert.equal(failed.form.hidden, true); assert.equal(failed.form.dataset.budgetReady, undefined); assert.equal(failed.node('budget-print').hidden, true); }
b.node('budget-comparison').failTextOnce = true; b.form.dispatch('change'); assert.equal(b.form.hidden, true); assert.equal(b.form.listeners.get('submit').length, 0, 'Runtime failure removes handlers and falls back to complete SSR worksheet.');
assert.deepEqual(links, all.filter(node => node.tagName === 'a').map(node => attr(node, 'href')), 'Client never rewrites native journey URLs.');
console.log('Trip budget checks passed: quote units/party/nights/rooms, seven-category known/included/unknown/omitted coverage, cent rounding/reserve, full comparison gating, zero-night/zero-cost/unused-field validation; actual Astro SSR labels/hidden form/worksheet/5FAQ parity/native links; compiled controller totals/stale edits/Plan B/focus/reset/print/failure cleanup. No network or full build.');
