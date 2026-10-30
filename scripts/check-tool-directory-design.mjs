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

globalThis.fetch = () => { throw Error('Tool directory checks are offline'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const read = file => readFile(path.join(root, file), 'utf8');
const review = JSON.parse(await read('research/tool-directory-design-review-2026-10-29.json'));
const source = await read('src/pages/tools.astro');
const clientSource = await read('src/components/ToolDirectoryInteractions.astro');
assert.equal(review.baseline.linkDefinitions, 45); assert.equal(review.baseline.uniqueDestinations, 44);
const baseline = [...new Set(review.baseline.hrefs)];
assert.equal(review.baseline.hrefs.filter(href => href === '/accessible-trails').length, 2);
assert.equal(baseline.length, 44);

// Compile the actual page and full real layout/children in memory. No slot-only page shell.
const compiledPaths = new Set();
const bundle = await build({ stdin: { contents: "export { default } from './src/pages/tools.astro';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'tool-directory-actual-astro', setup(builder) {
  builder.onResolve({ filter: /^astro\// }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
  builder.onResolve({ filter: /(?:\?astro&type=style|\.css$)/ }, args => ({ path: args.path, namespace: 'fixture-style' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture-style' }, () => ({ contents: 'export {};' }));
  builder.onResolve({ filter: /\.astro$/ }, args => ({ path: path.resolve(args.resolveDir, args.path), namespace: 'actual-astro' }));
  builder.onLoad({ filter: /.*/, namespace: 'actual-astro' }, async args => {
    compiledPaths.add(args.path);
    const compiled = await transform(await readFile(args.path, 'utf8'), { filename: args.path, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
    assert.deepEqual(compiled.diagnostics.filter(item => item.severity === 1), [], args.path);
    const code = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, '');
    return { contents: code, loader: 'ts', resolveDir: path.dirname(args.path) };
  });
} }] });
assert.ok(compiledPaths.has(path.join(root, 'src/layouts/BaseLayout.astro')));
assert.ok(compiledPaths.has(path.join(root, 'src/components/ToolDirectoryInteractions.astro')));
const Page = (await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const html = await container.renderToString(Page, { request: new Request('https://banffbound.com/tools/?email=PRIVATE_READER&gclid=PRIVATE_CLICK&tools_query=PRIVATE_SEARCH') });
const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, key) => node?.attrs?.find(item => item.name === key)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const normal = value => value.replace(/\s+/g, ' ').trim();
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const stageIds = ['shape-your-visit', 'choose-an-outing', 'prepare-your-group', 'finish-the-day'];
const stageTitles = ['Shape your visit', 'Choose one main outing', 'Prepare for the people coming', 'Finish the day'];
const topics = ['Winter Planning', 'Trip Planning', 'Dining & Evenings', 'Trail Tools', 'Safety & Wildlife', 'Activities & Adventures', 'Family & Accessibility', 'Lake & Nature Guides'];
const primaryCounts = { 'Winter Planning': 6, 'Trip Planning': 8, 'Dining & Evenings': 2, 'Trail Tools': 6, 'Safety & Wildlife': 8, 'Activities & Adventures': 9, 'Family & Accessibility': 3, 'Lake & Nature Guides': 2 };
function checkHtml(markup) {
  const nodes = walk(parse(markup));
  const byId = id => { const found = nodes.find(node => attr(node, 'id') === id); assert.ok(found, 'Missing #' + id); return found; };
  const directory = byId('tool-directory'), directoryNodes = walk(directory);
  const rows = directoryNodes.filter(node => attr(node, 'data-tool-search') !== undefined);
  assert.equal(rows.length, 44);
  assert.ok(rows.every(node => node.tagName === 'a' && hasClass(node, 'tool-row')));
  const hrefs = rows.map(node => attr(node, 'href'));
  assert.deepEqual([...hrefs].sort(), [...baseline].sort(), 'All exact inherited destinations/fragments/query strings, except the intentional duplicate');
  assert.equal(new Set(hrefs).size, 44);
  assert.equal(attr(byId('tools-find'), 'hidden'), '');
  assert.equal(attr(byId('tools-empty'), 'hidden'), '');
  assert.equal(attr(byId('tools-query'), 'type'), 'search');
  assert.equal(attr(byId('tools-query'), 'name'), undefined);
  assert.equal(attr(byId('tools-category'), 'name'), undefined);
  for (const id of ['tools-query', 'tools-category']) assert.ok(directoryNodes.some(node => node.tagName === 'label' && attr(node, 'for') === id), 'Explicitly associated filter label');
  assert.equal(attr(byId('tools-find'), 'action'), undefined);
  assert.equal(normal(text(byId('tools-status'))), '44 guide and tool links');
  assert.equal(attr(byId('tools-status'), 'role'), 'status');
  assert.equal(attr(byId('tools-status'), 'aria-live'), 'polite');
  assert.equal(attr(byId('tools-status'), 'aria-atomic'), 'true');
  assert.ok(directoryNodes.some(node => node.tagName === 'button' && attr(node, 'type') === 'reset'));
  const options = walk(byId('tools-category')).filter(node => node.tagName === 'option');
  assert.deepEqual(options.map(node => attr(node, 'value')), ['all', ...topics]);
  const stages = directoryNodes.filter(node => attr(node, 'data-tool-stage') !== undefined);
  assert.deepEqual(stages.map(node => attr(node, 'data-tool-stage')), stageIds);
  assert.deepEqual(stages.map(node => walk(node).filter(child => attr(child, 'data-tool-search') !== undefined).length), [14, 17, 11, 2]);
  for (const [index, stage] of stages.entries()) {
    assert.equal(attr(stage, 'hidden'), undefined);
    assert.equal(attr(stage, 'aria-labelledby'), stageIds[index]);
    assert.equal(normal(text(byId(stageIds[index]))), stageTitles[index]);
  }
  const categories = directoryNodes.filter(node => attr(node, 'data-tool-category') !== undefined);
  assert.equal(categories.length, 8);
  assert.deepEqual(categories.map(node => attr(node, 'data-tool-category')).sort(), [...topics].sort());
  for (const category of categories) {
    assert.equal(attr(category, 'hidden'), undefined);
    const name = attr(category, 'data-tool-category');
    assert.equal(walk(category).filter(node => attr(node, 'data-tool-search') !== undefined).length, primaryCounts[name]);
  }
  for (const row of rows) {
    assert.equal(attr(row, 'hidden'), undefined, 'Complete no-JS directory');
    assert.equal(attr(row, 'tabindex'), undefined, 'Native links retain normal keyboard access');
    assert.ok(attr(row, 'data-tool-search').includes(attr(row, 'href')));
    assert.ok(topics.includes(attr(row, 'data-tool-topic')));
    assert.ok((attr(row, 'data-tool-topics') ?? '').split('|').includes(attr(row, 'data-tool-topic')));
    assert.ok(walk(row).some(node => node.tagName === 'h4' && text(node).trim()));
  }
  const accessRow = rows.find(node => attr(node, 'href') === '/accessible-trails');
  assert.equal(attr(accessRow, 'data-tool-topic'), 'Family & Accessibility');
  assert.equal(attr(accessRow, 'data-tool-topics'), 'Family & Accessibility|Trail Tools');
  assert.ok(text(accessRow).includes('Also in Trail Tools'));
  assert.ok(directoryNodes.some(node => node.tagName === 'noscript' && /All 44 destinations/.test(text(node))));
  const schemas = nodes.filter(node => node.tagName === 'script' && attr(node, 'type') === 'application/ld+json').map(node => JSON.parse(text(node)));
  const collection = schemas.filter(schema => schema['@type'] === 'CollectionPage'); assert.equal(collection.length, 1);
  const list = collection[0].mainEntity;
  assert.equal(list['@type'], 'ItemList'); assert.equal(list.numberOfItems, 44); assert.equal(list.itemListElement.length, 44);
  assert.deepEqual(list.itemListElement.map(item => item.position), Array.from({ length: 44 }, (_, i) => i + 1));
  assert.deepEqual(list.itemListElement.map(item => item.item.url), hrefs.map(href => 'https://banffbound.com' + href));
  assert.deepEqual(list.itemListElement.map(item => item.item.name), rows.map(node => normal(text(walk(node).find(child => child.tagName === 'h4')))));
  assert.deepEqual(list.itemListElement.map(item => item.item.description), rows.map(node => normal(text(walk(node).find(child => child.tagName === 'p')))));
  assert.ok(!/best trails for solo|All 12 campgrounds|Wildlife Tracker|Air Quality Tracker|Emergency SOS Card|GPS coordinates|Routes, prices|hotels that welcome your dog/i.test(text(directory)), 'No overbroad directory labels');
  assert.ok(!directoryNodes.some(node => hasClass(node, 'tool-icon') || hasClass(node, 'tool-grid')));
  for (const secret of ['PRIVATE_READER', 'PRIVATE_CLICK', 'PRIVATE_SEARCH']) assert.ok(!markup.includes(secret));
  return { rows, categories, stages, options };
}
const facts = checkHtml(html);
const style = source.match(/<style>([\s\S]*?)<\/style>/)?.[1]; assert.ok(style);
assert.ok(!/box-shadow|translateY|transition:all|\.tool-icon|\.tool-grid/.test(style), 'No raised-card presentation');
assert.match(style, /\.tool-row\s*\{[^}]*border-bottom:/);
assert.match(style, /\.tool-stage\s*\{[^}]*border-top:/);
assert.match(style, /\.tool-info\s*\{\s*min-width:0/);
assert.match(style, /@media\(max-width:480px\)/);
assert.match(style, /\.tool-row:focus-visible/);
assert.match(style, /\[hidden\]\s*\{\s*display:none !important/);
assert.ok(source.includes('var(--font-heading)') && source.includes('var(--font-body)') && source.includes('var(--color-primary)') && source.includes('var(--color-accent)'));
const failures = [
  ['native fragment lost', value => value.replace('href="/blog/banff-heli-skiing/#heli-ski-planner"', 'href="/blog/banff-heli-skiing/"')],
  ['query introduced into destination', value => value.replace(/href="\/winter-stays"(?=[^>]*data-tool-search)/, 'href="/winter-stays?utm_source=unexpected"')],
  ['no-JS row hidden', value => value.replace(/(<a\b[^>]*data-tool-search="[^"]*")/, '$1 hidden')],
  ['form revealed before initialization', value => value.replace(/(<form\b[^>]*id="tools-find"[^>]*?) hidden/, '$1')],
  ['cross-topic lost', value => value.replace(/(data-tool-topics="Family [^"]*)\|Trail Tools"/, '$1"')],
  ['schema count stale', value => value.replace('"numberOfItems":44', '"numberOfItems":45')],
  ['schema positions wrong', value => value.replace('"position":44', '"position":45')],
  ['unsafe label returned', value => value.replace('Prepare solo-outing questions, a return plan and emergency contacts.', 'Best trails for solo hikers guaranteed safe.')],
  ['live status removed', value => value.replace(/(<p\b[^>]*id="tools-status"[^>]*?) aria-live="polite"/, '$1')],
  ['personal collection added', value => value.replace('id="tools-query"', 'id="tools-query" name="email"')],
];
for (const [name, mutate] of failures) { const changed = mutate(html); assert.ok(changed !== html, name + ' fixture must change output'); assert.throws(() => checkHtml(changed), undefined, name); }

const client = clientSource.match(/<script>([\s\S]*?)<\/script>/)?.[1]; assert.ok(client);
assert.ok(!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|URLSearchParams|FormData|innerHTML|insertAdjacentHTML|navigator|location\.|history\./.test(client));
const compileClient = async contents => (await build({ stdin: { contents, loader: 'ts', resolveDir: path.join(root, 'src/components') }, bundle: true, write: false, platform: 'browser', format: 'iife', logLevel: 'silent' })).outputFiles[0].text;
const clientCode = await compileClient(client);
function runClient({ missing, readyState = 'complete', noRows = false, code = clientCode } = {}) {
  const field = value => ({ value, events: {}, addEventListener(name, handler) { (this.events[name] ??= []).push(handler); } });
  const query = field(''), topic = field('all'), status = { textContent: '44 guide and tool links' }, empty = { hidden: true };
  const form = { ...field(''), hidden: true, dataset: {} };
  const rows = (noRows ? [] : facts.rows).map(node => ({ hidden: false, href: attr(node, 'href'), dataset: { toolSearch: attr(node, 'data-tool-search'), toolTopic: attr(node, 'data-tool-topic'), toolTopics: attr(node, 'data-tool-topics') } }));
  const groups = facts.categories.map(node => ({ hidden: false, name: attr(node, 'data-tool-category'), querySelectorAll(selector) { assert.equal(selector, '[data-tool-search]'); return rows.filter(row => row.dataset.toolTopic === this.name); } }));
  const stages = facts.stages.map(node => { const membership = walk(node).filter(child => attr(child, 'data-tool-category') !== undefined).map(child => attr(child, 'data-tool-category')); return { hidden: false, id: attr(node, 'data-tool-stage'), querySelectorAll(selector) { assert.equal(selector, '[data-tool-search]'); return rows.filter(row => membership.includes(row.dataset.toolTopic)); } }; });
  const elements = { 'tools-find': form, 'tools-query': query, 'tools-category': topic, 'tools-status': status, 'tools-empty': empty };
  const events = {};
  const document = { readyState, getElementById(id) { assert.ok(Object.hasOwn(elements, id), id); return id === missing ? null : elements[id]; }, querySelectorAll(selector) { if (selector === '[data-tool-search]') return rows; if (selector === '[data-tool-category]') return groups; assert.equal(selector, '[data-tool-stage]'); return stages; }, addEventListener(name, handler) { (events[name] ??= []).push(handler); } };
  const sandbox = { document };
  for (const key of ['fetch', 'XMLHttpRequest', 'location', 'history', 'navigator', 'localStorage', 'sessionStorage']) Object.defineProperty(sandbox, key, { get() { throw Error('Unexpected network, URL, device or storage access: ' + key); } });
  vm.runInNewContext(code, sandbox);
  return { query, topic, status, empty, form, rows, groups, stages, events };
}
const trigger = (field, name) => { let prevented = false; for (const handler of field.events[name] ?? []) handler({ preventDefault() { prevented = true; } }); return prevented; };
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function expectedHrefs(query, topic) { const words = normalize(query).trim().split(/\s+/).filter(Boolean); return facts.rows.filter(node => (topic === 'all' || attr(node, 'data-tool-topics').split('|').includes(topic)) && words.every(word => normalize(attr(node, 'data-tool-search')).includes(word))).map(node => attr(node, 'href')); }
function assertUi(ui, expectedHrefs) {
  assert.deepEqual(ui.rows.filter(row => !row.hidden).map(row => row.href), expectedHrefs);
  assert.equal(ui.status.textContent, `${expectedHrefs.length} of 44 guide and tool links shown`);
  assert.equal(ui.empty.hidden, expectedHrefs.length !== 0);
  for (const group of [...ui.groups, ...ui.stages]) assert.equal(group.hidden, !group.querySelectorAll('[data-tool-search]').some(row => !row.hidden));
  assert.deepEqual(ui.rows.map(row => row.href), facts.rows.map(node => attr(node, 'href')), 'Filtering never rewrites destinations');
}
const ui = runClient(); assert.equal(ui.form.hidden, false); assert.equal(ui.form.dataset.ready, 'true'); assertUi(ui, facts.rows.map(node => attr(node, 'href')));
const searches = ['', 'budget', 'lessons', 'lakes', 'accessible', 'Trail Tools', 'HELI', '  ski  day  ', 'caf\u00e9', '<img src=x onerror=bad()>', 'NO_MATCH_947'];
let combinations = 0;
for (const topic of ['all', ...topics]) for (const query of searches) {
  ui.topic.value = topic; ui.query.value = query;
  trigger(ui.query, 'input'); assertUi(ui, expectedHrefs(query, topic));
  trigger(ui.topic, 'change'); assertUi(ui, expectedHrefs(query, topic));
  assert.equal(trigger(ui.form, 'submit'), true); assertUi(ui, expectedHrefs(query, topic)); combinations++;
}
for (const [topic, count] of Object.entries({ ...primaryCounts, 'Trail Tools': 7 })) { ui.query.value = ''; ui.topic.value = topic; trigger(ui.topic, 'change'); assert.equal(ui.rows.filter(row => !row.hidden).length, count); }
for (const topic of ['Trail Tools', 'Family & Accessibility']) { ui.query.value = 'accessible'; ui.topic.value = topic; trigger(ui.query, 'input'); assertUi(ui, ['/accessible-trails']); }
ui.query.value = 'lessons'; ui.topic.value = 'all'; trigger(ui.query, 'input'); assert.ok(ui.rows.some(row => row.href === '/learn-to-ski' && !row.hidden));
ui.query.value = 'budget'; trigger(ui.query, 'input'); assertUi(ui, ['/trip-cost']);
ui.query.value = 'NO_MATCH_947'; trigger(ui.query, 'input'); assert.ok(ui.stages.every(stage => stage.hidden));
assert.equal(trigger(ui.form, 'reset'), true); assert.equal(ui.query.value, ''); assert.equal(ui.topic.value, 'all'); assertUi(ui, facts.rows.map(node => attr(node, 'href')));
for (const callback of ui.events['astro:page-load']) { callback(); callback(); }
assert.equal(ui.query.events.input.length, 1); assert.equal(ui.topic.events.change.length, 1); assert.equal(ui.form.events.reset.length, 1);
const delayed = runClient({ readyState: 'loading' }); assert.equal(delayed.form.hidden, true); for (const callback of delayed.events.DOMContentLoaded) callback(); assert.equal(delayed.form.hidden, false); assertUi(delayed, facts.rows.map(node => attr(node, 'href')));
for (const missing of ['tools-find', 'tools-query', 'tools-category', 'tools-status', 'tools-empty']) { const partial = runClient({ missing }); assert.equal(partial.form.hidden, true); assert.ok(partial.rows.every(row => !row.hidden)); assert.equal(partial.status.textContent, '44 guide and tool links'); }
assert.equal(runClient({ noRows: true }).form.hidden, true);
const mutant = client.replace('topics.includes(topic.value)', 'card.dataset.toolTopic===topic.value'); assert.ok(mutant !== client);
const broken = runClient({ code: await compileClient(mutant) }); broken.query.value = 'accessible'; broken.topic.value = 'Trail Tools'; trigger(broken.query, 'input'); assert.throws(() => assertUi(broken, ['/accessible-trails']), undefined, 'Independent client regression catches a lost cross-topic entry');
console.log(`Tool directory design checks passed:44 exact unique destinations (one intentional duplicate removed), actual full-layout Astro SSR/ItemList parity,4 ruled planning stages/8 topics,${combinations} actual-client search/topic combinations via input/change/submit, reset/no-match/missing controls/delayed/idempotent mount/privacy,${failures.length} HTML negatives plus cross-topic client mutation. No browser, network or site build.`);
