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

// The source fixture and actual page/controller are exercised offline, without a site build.
globalThis.fetch = () => { throw Error('No network in accessibility planning checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const read = file => readFile(path.join(root, file), 'utf8');
const importCode = code => import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const bundled = await build({ stdin: { contents: "export * from './src/data/accessibilityPlanning.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const data = await importCode(bundled.outputFiles[0].text);

// Literal, source-reviewed measurements catch a changed number/unit even if model and page agree.
const expected = [
  { id: 'fenland', name: 'Fenland Loop', distance: '1.9 km loop', surface: '83% hard soil; 15% gravel; 2% decking', width: '162 / 62 cm', grade: '3 / 26%', crossSlope: '3 / 21%', obstacle: 'Significant roots; first root obstacle 237 m counterclockwise.' },
  { id: 'marsh', name: 'Marsh Trail', distance: '1.5 km one way', surface: '61% hard soil; 25% gravel; 13% firm soil; 1% decking', width: '287 / 200 cm', grade: '3 / 23%', crossSlope: '4 / 18%', obstacle: 'Uneven horse-used trail; mud in wet conditions.' },
  { id: 'minnewanka', name: 'Minnewanka to Stewart Canyon', distance: '1.6 km one way', surface: '49% paved; 47% firm soil; 2% gravel; 2% decking', width: '274 / 100 cm', grade: '5 / 29%', crossSlope: '5 / 31%', obstacle: 'Rough paving at the start; rocks and roots from 1 km, with exposure.' },
];
const ids = expected.map(profile => profile.id);
const fields = ['name', 'distance', 'surface', 'width', 'grade', 'crossSlope', 'obstacle'];
assert.equal(data.accessibilityReviewedAt, '2026-10-29');
assert.deepEqual(data.accessProfiles.map(profile => profile.id), ids);
for (const [index, profile] of expected.entries()) for (const field of fields) assert.equal(data.accessProfiles[index][field], profile[field], `${profile.id}: ${field}`);
const snapshot = JSON.stringify(data.accessProfiles);
const all = { mode: 'all', visibleIds: ids, firstId: null, secondId: null, status: 'All three published profiles are shown.' };
assert.deepEqual(data.buildAccessComparison(), all);
for (const a of expected) for (const b of expected) {
  assert.deepEqual(data.buildAccessComparison(a.id, b.id), {
    mode: a.id === b.id ? 'single' : 'pair', visibleIds: ids.filter(id => id === a.id || id === b.id), firstId: a.id, secondId: b.id,
    status: a.id === b.id ? `Showing ${a.name}. Select a different second profile to compare.` : `Comparing ${a.name} and ${b.name}.`,
  });
}
const poison = { toString() { throw Error('Do not coerce reader values'); }, valueOf() { throw Error('Do not coerce reader values'); } };
const invalid = [undefined, null, true, false, 0, 1, NaN, '', 'Fenland', 'FENLAND', ' fenland', 'fenland ', 'fenland?device=PRIVATE', '<script>', ['fenland'], {}, Object.create(null), poison, new String('fenland'), Symbol('fenland')];
for (const value of invalid) {
  assert.deepEqual(data.buildAccessComparison(value, 'marsh'), all);
  assert.deepEqual(data.buildAccessComparison('fenland', value), all);
  assert.deepEqual(data.buildAccessComparison(value, value), all);
}
data.buildAccessComparison('fenland', 'marsh').visibleIds.pop();
assert.deepEqual(data.buildAccessComparison(), all, 'Caller mutation must not change subsequent comparisons');
assert.equal(JSON.stringify(data.accessProfiles), snapshot);

// Render the real page, BaseLayout and its real Astro children, not a slot-only shell.
const filename = path.join(root, 'src/pages/accessible-trails.astro');
const source = await readFile(filename, 'utf8');
const stripMetadata = code => code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, '');
const compiledPaths = new Set();
const pageBundle = await build({ stdin: { contents: `export { default } from '${filename}';`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'actual-accessibility-astro', setup(builder) {
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
assert.ok(compiledPaths.has(path.join(root, 'src/layouts/BaseLayout.astro')), 'Render the real layout');
const Page = (await importCode(pageBundle.outputFiles[0].text)).default;
const container = await experimental_AstroContainer.create();
const html = await container.renderToString(Page, { request: new Request('https://banffbound.com/accessible-trails/?device=PRIVATE_DEVICE&medical=PRIVATE_MEDICAL&gclid=PRIVATE_CLICK') });
const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, key) => node?.attrs?.find(item => item.name === key)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const normal = value => value.replace(/\s+/g, ' ').trim();
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const checklist = [
  'I have chosen an endpoint and a return journey.',
  'I have checked narrow passages, steep sections and the current surface.',
  'I have confirmed washrooms, resting places and assistance.',
  'The operator has confirmed my actual equipment and party.',
  'I have an alternative and the relevant contact details.',
];
function checkHtml(markup) {
  const nodes = walk(parse(markup));
  const byId = id => { const node = nodes.find(item => attr(item, 'id') === id); assert.ok(node, 'Missing #' + id); return node; };
  const page = nodes.find(node => hasClass(node, 'access-page')); assert.ok(page);
  const body = walk(page);
  assert.equal(attr(nodes.find(node => node.tagName === 'link' && attr(node, 'rel') === 'canonical'), 'href'), 'https://banffbound.com/accessible-trails/');
  assert.equal(normal(text(nodes.find(node => node.tagName === 'h1'))), 'Accessible Banff: Build Your Outing');
  assert.equal(attr(byId('profile-comparison'), 'hidden'), '', 'No-JS comparison form stays hidden');
  assert.equal(attr(byId('profile-compare'), 'type'), 'submit');
  assert.equal(attr(byId('profile-reset'), 'type'), 'button');
  for (const id of ['profile-a', 'profile-b']) {
    const select = byId(id);
    assert.deepEqual(walk(select).filter(node => node.tagName === 'option').map(node => [attr(node, 'value'), text(node)]), expected.map(profile => [profile.id, profile.name]));
    assert.ok(body.some(node => node.tagName === 'label' && attr(node, 'for') === id), 'Explicit select label');
  }
  const secondOptions = walk(byId('profile-b')).filter(node => node.tagName === 'option');
  assert.deepEqual(secondOptions.filter(node => attr(node, 'selected') !== undefined).map(node => attr(node, 'value')), ['marsh']);
  assert.equal(attr(byId('profile-status'), 'role'), 'status');
  assert.equal(attr(byId('profile-status'), 'aria-live'), 'polite');
  assert.equal(attr(byId('profile-status'), 'aria-atomic'), 'true');
  assert.equal(text(byId('profile-status')), all.status);
  const cells = walk(byId('access-table')).filter(node => attr(node, 'data-profile') !== undefined);
  assert.equal(cells.length, 21, 'Complete three-profile table remains in SSR');
  for (const profile of expected) {
    const column = cells.filter(node => attr(node, 'data-profile') === profile.id);
    assert.deepEqual(column.map(node => normal(text(node))), fields.map(field => profile[field]), 'Literal numbers, units, surface mix and obstacles: ' + profile.id);
    for (const cell of column) assert.equal(attr(cell, 'hidden'), undefined, 'All measurements initially visible');
    assert.equal(column[0].tagName, 'th'); assert.equal(attr(column[0], 'scope'), 'col');
  }
  assert.deepEqual(walk(byId('access-table')).filter(node => node.tagName === 'th' && attr(node, 'scope') === 'row').map(node => normal(text(node))), ['Stated distance', 'Surface mix', 'Width: typical / minimum', 'Grade: typical / maximum', 'Cross slope: typical / maximum', 'Obstacles to investigate']);
  assert.ok(body.some(node => node.tagName === 'noscript' && /complete comparison/.test(text(node))));
  assert.equal(body.filter(node => hasClass(node, 'access-sections')).length, 3);
  assert.equal(body.filter(node => node.tagName === 'article' && hasClass(node, 'access-entry')).length, 10);
  assert.ok(!body.some(node => hasClass(node, 'card-grid') || hasClass(node, 'access-card')), 'Editorial ruled sections replace generic cards');
  const checks = body.filter(node => node.tagName === 'input');
  assert.equal(checks.length, 5, 'No extra personal/device fields');
  for (const [index, check] of checks.entries()) {
    assert.equal(attr(check, 'type'), 'checkbox');
    assert.equal(attr(check, 'checked'), undefined);
    for (const key of ['name', 'required', 'onchange', 'onclick']) assert.equal(attr(check, key), undefined);
    const label = body.find(node => node.tagName === 'label' && walk(node).includes(check));
    assert.equal(normal(text(label)), checklist[index]);
  }
  assert.equal(body.filter(node => node.tagName === 'form').length, 1);
  assert.equal(attr(byId('profile-comparison'), 'action'), undefined);
  const details = body.filter(node => node.tagName === 'details');
  assert.equal(details.length, 5);
  assert.deepEqual(details.map(node => ({ question: normal(text(walk(node).find(item => item.tagName === 'summary'))), answer: normal(text(walk(node).find(item => item.tagName === 'p'))) })), data.accessFaqs);
  const schemas = nodes.filter(node => node.tagName === 'script' && attr(node, 'type') === 'application/ld+json').map(node => JSON.parse(text(node)));
  const faq = schemas.filter(item => item['@type'] === 'FAQPage'); assert.equal(faq.length, 1);
  assert.deepEqual(faq[0].mainEntity.map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), data.accessFaqs);
  const hrefs = body.filter(node => node.tagName === 'a').map(node => attr(node, 'href'));
  for (const url of Object.values(data.accessibilitySources)) assert.ok(hrefs.includes(url), 'Visible primary source: ' + url);
  for (const url of ['/blog/accessible-banff/', '/blog/banff-accessible-hikes/', '/packing-list', '/towns', '/winter']) assert.ok(hrefs.includes(url));
  for (const href of hrefs.filter(value => value?.startsWith('#'))) byId(href.slice(1));
  const visible = normal(text(page));
  for (const phrase of ['typical / minimum', 'typical / maximum', 'not cleared winter paths', 'not confirmation of reopening', '2026 season ended October 12', '2026 Alpine Start product had no accessible vehicle', '368 shallow stairs each way', '31 inches wide × 41 inches long', '320 kg', 'no bathing', 'not a blanket free visitor pass', 'do not book services or save personal information']) assert.ok(visible.includes(phrase), phrase);
  assert.ok(body.some(node => node.tagName === 'time' && attr(node, 'datetime') === '2026-10-29'));
  for (const secret of ['PRIVATE_DEVICE', 'PRIVATE_MEDICAL', 'PRIVATE_CLICK']) assert.ok(!markup.includes(secret));
  return cells;
}
checkHtml(html);
// Verify that the checker catches plausible regressions in the actual rendered page.
const mutations = [
  ['width unit/value', value => value.replace('162 / 62 cm', '162 / 62 inches')],
  ['maximum grade', value => value.replace('5 / 29%', '5 / 9%')],
  ['surface mix', value => value.replace('83% hard soil; 15% gravel; 2% decking', '100% paved')],
  ['hidden initial measurement', value => value.replace(/(<td\b[^>]*data-profile="fenland")/, '$1 hidden')],
  ['revealed no-JS form', value => value.replace(/(<form\b[^>]*id="profile-comparison"[^>]*?) hidden/, '$1')],
  ['submit lost', value => value.replace('type="submit"', 'type="button"')],
  ['maximum label lost', value => value.replace('Grade: typical / maximum', 'Grade: typical')],
  ['personal field added', value => value.replace('</form>', '<input type="email" name="email"></form>')],
  ['FAQ mismatch', value => value.replace(/(<summary\b[^>]*>)Which Banff trail works with my wheelchair or stroller\?<\/summary>/, '$1All paths work with every device</summary>')],
  ['winter boundary removed', value => value.replace('not cleared winter paths', 'cleared winter paths')],
  ['future operation implied', value => value.replace('2026 season ended October 12', '2027 season runs all winter')],
  ['editorial layout removed', value => value.replaceAll('access-entry', 'access-card')],
];
for (const [name, mutate] of mutations) { const changed = mutate(html); assert.ok(changed !== html, name + ' fixture must change output'); assert.throws(() => checkHtml(changed), undefined, name + ' must fail'); }

const client = source.match(/<script>([\s\S]*?)<\/script>/)?.[1]; assert.ok(client);
assert.ok(!/fetch\s*\(|XMLHttpRequest|URLSearchParams|FormData|localStorage|sessionStorage|sendBeacon|innerHTML|insertAdjacentHTML|navigator|history\.|location\.|\.clipboard/.test(client), 'Comparison does not collect, persist or transmit personal input');
assert.match(source, /\.access-sections\s*\{[^}]*border-top:/);
assert.match(source, /\.access-entry\s*\{[^}]*border-bottom:/);
assert.match(source, /\[hidden\]\s*\{\s*display\s*:\s*none\s*!important/);
const clientCode = (await build({ stdin: { contents: client, loader: 'ts', resolveDir: path.dirname(filename) }, bundle: true, write: false, platform: 'browser', format: 'iife', logLevel: 'silent' })).outputFiles[0].text;
function runClient(missing) {
  const field = value => ({ value, events: {}, addEventListener(name, handler) { this.events[name] = handler; } });
  const first = field('fenland'), second = field('marsh'), status = { textContent: all.status };
  const checks = checklist.map((_, index) => ({ checked: index % 2 === 0 }));
  const cells = ids.flatMap(id => fields.map(() => ({ hidden: false, dataset: { profile: id } })));
  const form = { hidden: true, events: {}, addEventListener(name, handler) { this.events[name] = handler; }, reset() { first.value = 'fenland'; second.value = 'marsh'; } };
  const reset = field('');
  const elements = { '#profile-comparison': form, '#profile-a': first, '#profile-b': second, '#profile-status': status, '#profile-reset': reset };
  const sandbox = { document: { querySelector(selector) { assert.ok(Object.hasOwn(elements, selector), selector); return selector === missing ? null : elements[selector]; }, querySelectorAll(selector) { assert.equal(selector, '#access-table [data-profile]'); return cells; } } };
  for (const key of ['fetch', 'XMLHttpRequest', 'location', 'history', 'navigator', 'localStorage', 'sessionStorage']) Object.defineProperty(sandbox, key, { get() { throw Error('Unexpected network, URL, device or storage access: ' + key); } });
  vm.runInNewContext(clientCode, sandbox);
  return { first, second, status, checks, cells, form, reset };
}
function checkState(ui, visible, status) {
  assert.deepEqual(ui.cells.filter(cell => !cell.hidden).map(cell => cell.dataset.profile), ids.filter(id => visible.includes(id)).flatMap(id => fields.map(() => id)));
  assert.equal(ui.status.textContent, status);
  assert.deepEqual(ui.checks.map(check => check.checked), [true, false, true, false, true], 'Comparison/reset must not change the independent checklist');
}
const ui = runClient(); assert.equal(ui.form.hidden, false); checkState(ui, ids, all.status);
let clientCases = 0;
for (const first of expected) for (const second of expected) for (const event of ['submit', 'first-change', 'second-change']) {
  ui.first.value = first.id; ui.second.value = second.id;
  let prevented = false;
  if (event === 'submit') { ui.form.events.submit({ preventDefault() { prevented = true; } }); assert.ok(prevented, 'Prevent native navigation/submission'); }
  else (event === 'first-change' ? ui.first : ui.second).events.change();
  const state = data.buildAccessComparison(first.id, second.id); checkState(ui, state.visibleIds, state.status); clientCases++;
}
for (const [first, second] of [['unknown', 'marsh'], ['fenland', 'unknown'], ['fenland?device=PRIVATE', 'marsh'], ['', '']]) { ui.first.value = first; ui.second.value = second; ui.form.events.submit({ preventDefault() {} }); checkState(ui, ids, all.status); clientCases++; }
ui.first.value = 'minnewanka'; ui.second.value = 'minnewanka'; ui.first.events.change();
ui.reset.events.click(); checkState(ui, ids, all.status); assert.equal(ui.first.value, 'fenland'); assert.equal(ui.second.value, 'marsh');
ui.form.events.submit({ preventDefault() {} }); checkState(ui, ['fenland', 'marsh'], 'Comparing Fenland Loop and Marsh Trail.');
for (const missing of ['#profile-comparison', '#profile-a', '#profile-b', '#profile-status']) { const partial = runClient(missing); assert.equal(partial.form.hidden, true); checkState(partial, ids, all.status); assert.deepEqual(Object.keys(partial.form.events), []); }
const withoutReset = runClient('#profile-reset'); assert.equal(withoutReset.form.hidden, false); withoutReset.first.value = 'marsh'; withoutReset.first.events.change(); checkState(withoutReset, ['marsh'], 'Showing Marsh Trail. Select a different second profile to compare.');
assert.equal(JSON.stringify(data.accessProfiles), snapshot, 'Client/model checks leave source features intact');
console.log(`Accessibility planning checks passed:9 ordered model pairs/${invalid.length * 3} invalid-input cases; actual full-layout Astro SSR with21 literal measurement cells,5 native checklist boxes,5 matching FAQs and editorial ruled sections;${clientCases} actual-client submit/change cases, reset/missing controls/privacy boundaries;${mutations.length} meaningful HTML failure fixtures. No network or site build.`);
