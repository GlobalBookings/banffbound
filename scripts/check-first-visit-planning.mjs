import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';

globalThis.fetch = () => { throw Error('No network in first-visit checks'); };
const bundle = async contents => (await build({ stdin: { contents, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' })).outputFiles[0].text;
const data = await import('data:text/javascript;base64,' + Buffer.from(await bundle("export * from './src/data/firstVisitPlanning.ts';")).toString('base64'));
const ids = ['arrival', 'base', 'days', 'access', 'quotes', 'backup'];
assert.equal(data.firstVisitReviewedAt, '2026-10-29');
assert.deepEqual(data.firstVisitSteps.map(step => step.id), ids);
for (let mask = 0; mask < 64; mask++) {
  const checked = ids.filter((_, index) => mask & (1 << index));
  const remaining = ids.filter(id => !checked.includes(id));
  const result = data.buildFirstVisitChecklist(checked);
  assert.deepEqual(result.checkedIds, checked);
  assert.deepEqual(result.remainingIds, remaining);
  assert.equal(result.checkedCount, checked.length);
  assert.equal(result.total, 6);
  assert.equal(result.nextId, remaining[0] ?? null);
  assert.equal(result.nextHref, remaining.length ? '#first-visit-' + remaining[0] : null);
  assert.equal(result.summary, checked.length + ' of 6 planning steps marked');
  assert.ok(!/ready to travel|safe to go|guaranteed|reserved|confirmed booking/i.test(result.summary + result.detail));
}
const poison = { toString() { throw Error('Do not coerce reader values'); } };
for (const value of [null, true, 7, 'arrival', poison, Object.create(null)]) assert.deepEqual(data.buildFirstVisitChecklist(value), data.buildFirstVisitChecklist());
assert.deepEqual(data.buildFirstVisitChecklist(['arrival', 'arrival', 'ARRIVAL', 'backup?email=PRIVATE', poison, 'https://other.example/', 'backup']).checkedIds, ['arrival', 'backup']);

const filename = path.resolve('src/components/FirstVisitPlanningInteractions.astro');
const source = await readFile(filename, 'utf8');
const compiled = await transform(source, { filename, internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(compiled.diagnostics.filter(item => item.severity === 1), []);
const require = createRequire(import.meta.url);
const code = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/export const \$\$metadata =[\s\S]*?\n(?=const \$\$FirstVisitPlanningInteractions =)/, '');
const rendered = await build({ stdin: { contents: code, loader: 'ts', resolveDir: path.dirname(filename) }, bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'first-visit-runtime', setup(builder) {
  builder.onResolve({ filter: /^astro\// }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
  builder.onResolve({ filter: /\?astro&type=style/ }, args => ({ path: args.path, namespace: 'style' }));
  builder.onLoad({ filter: /.*/, namespace: 'style' }, () => ({ contents: 'export {};' }));
} }] });
const Component = (await import('data:text/javascript;base64,' + Buffer.from(rendered.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const html = await container.renderToString(Component, { request: new Request('https://banffbound.com/blog/banff-first-time-tips/?email=PRIVATE_READER_VALUE&gclid=PRIVATE_CLICK_VALUE&arrival=checked') });
const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, key) => node.attrs?.find(item => item.name === key)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const nodes = walk(parseFragment(html));
const byId = id => nodes.find(node => attr(node, 'id') === id);
assert.equal(byId('first-visit-planner').tagName, 'section');
assert.equal(attr(byId('first-visit-status'), 'role'), 'status');
assert.equal(attr(byId('first-visit-status'), 'aria-live'), 'polite');
assert.equal(attr(byId('first-visit-progress'), 'hidden'), '');
assert.equal(attr(byId('first-visit-clear'), 'type'), 'button');
assert.equal(attr(byId('first-visit-next-link'), 'href'), '#first-visit-arrival');
assert.ok(nodes.some(node => node.tagName === 'noscript'));
assert.equal(nodes.filter(node => node.tagName === 'form').length, 0, 'No form endpoint or personal-data submission');
const cards = nodes.filter(node => attr(node, 'data-first-visit-step') !== undefined);
const checkNodes = nodes.filter(node => attr(node, 'data-first-visit-check') !== undefined);
assert.deepEqual(cards.map(node => attr(node, 'data-first-visit-step')), ids);
assert.deepEqual(checkNodes.map(node => attr(node, 'value')), ids);
for (const [index, card] of cards.entries()) {
  assert.equal(attr(card, 'hidden'), undefined, 'Six planning cards remain visible without JavaScript');
  assert.equal(attr(card, 'id'), 'first-visit-' + ids[index]);
  const descendants = walk(card);
  assert.equal(attr(descendants.find(node => attr(node, 'data-first-visit-check-wrap') !== undefined), 'hidden'), '');
  assert.equal(attr(checkNodes[index], 'type'), 'checkbox');
  assert.equal(attr(checkNodes[index], 'checked'), undefined);
  assert.equal(attr(checkNodes[index], 'autocomplete'), 'off');
  assert.ok(descendants.some(node => node.tagName === 'h3' && text(node) === data.firstVisitSteps[index].title));
  assert.deepEqual(descendants.filter(node => node.tagName === 'a').map(node => attr(node, 'href')), data.firstVisitSteps[index].links.map(link => link.href));
}
for (const href of data.firstVisitSteps.flatMap(step => step.links.map(link => link.href))) {
  assert.ok(href.startsWith('/') && !href.startsWith('//') && !/[?#]/.test(href));
  const route = href.replace(/\/$/, '');
  if (!route.startsWith('/blog/')) {
    try { await access('src/pages' + route + '.astro'); }
    catch { await access('src/pages' + route + '/index.astro'); }
  } else assert.ok((await readFile('src/data/blogPosts.ts', 'utf8')).includes("slug: '" + route.slice('/blog/'.length) + "'"));
}
for (const privateValue of ['PRIVATE_READER_VALUE', 'PRIVATE_CLICK_VALUE']) assert.ok(!html.includes(privateValue));

const client = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(client);
assert.ok(!/fetch\s*\(|XMLHttpRequest|URLSearchParams|localStorage|sessionStorage|sendBeacon|innerHTML|insertAdjacentHTML|\.clipboard|\.print\(|history\./.test(client));
const clientCode = (await build({ stdin: { contents: client, loader: 'ts', resolveDir: path.dirname(filename) }, bundle: true, write: false, platform: 'browser', format: 'iife' })).outputFiles[0].text;
function runClient({ missing = false, short = false } = {}) {
  const checks = checkNodes.slice(0, short ? 5 : 6).map(node => ({ value: attr(node, 'value'), checked: true, events: {}, addEventListener(name, handler) { this.events[name] = handler; } }));
  const cards = ids.map(id => ({ dataset: { firstVisitStep: id } }));
  const wraps = ids.map(() => ({ hidden: true }));
  const status = { textContent: 'SSR status' }, detail = { textContent: 'SSR next' };
  const link = { hidden: false, attrs: { href: '#first-visit-arrival' }, setAttribute(key, value) { this.attrs[key] = value; }, removeAttribute(key) { delete this.attrs[key]; } };
  const clear = { events: {}, addEventListener(name, handler) { this.events[name] = handler; } };
  const progress = { hidden: true };
  const elements = { '#first-visit-status': status, '#first-visit-next': detail, '#first-visit-next-link': link, '#first-visit-clear': clear, '#first-visit-progress': progress };
  const section = { querySelector(selector) { assert.ok(Object.hasOwn(elements, selector)); return elements[selector]; }, querySelectorAll(selector) {
    if (selector === '[data-first-visit-check]') return checks;
    if (selector === '[data-first-visit-step]') return cards;
    assert.equal(selector, '[data-first-visit-check-wrap]'); return wraps;
  } };
  const sandbox = { document: { getElementById(id) { assert.equal(id, 'first-visit-planner'); return missing ? null : section; } } };
  for (const key of ['fetch', 'XMLHttpRequest', 'location', 'history', 'navigator', 'localStorage', 'sessionStorage']) Object.defineProperty(sandbox, key, { get() { throw Error('Unexpected network, URL, device or storage access: ' + key); } });
  vm.runInNewContext(clientCode, sandbox);
  return { checks, cards, wraps, status, detail, link, clear, progress };
}
const ui = runClient();
assert.equal(ui.status.textContent, '0 of 6 planning steps marked');
assert.equal(ui.progress.hidden, false);
assert.ok(ui.wraps.every(wrap => !wrap.hidden));
assert.ok(ui.checks.every(check => !check.checked));
ui.checks[5].checked = true; ui.checks[5].events.change();
assert.equal(ui.link.attrs.href, '#first-visit-arrival');
assert.equal(ui.cards[5].dataset.marked, 'true');
for (const [index, check] of ui.checks.entries()) { check.checked = true; check.events.change(); assert.equal(ui.cards[index].dataset.marked, 'true'); }
assert.equal(ui.status.textContent, '6 of 6 planning steps marked');
assert.equal(ui.link.hidden, true); assert.equal(ui.link.attrs.href, undefined);
ui.clear.events.click();
assert.equal(ui.status.textContent, '0 of 6 planning steps marked');
assert.equal(ui.link.hidden, false); assert.equal(ui.link.attrs.href, '#first-visit-arrival');
assert.ok(ui.cards.every(card => card.dataset.marked === 'false'));
ui.checks[0].value = 'https://other.example/?email=PRIVATE'; ui.checks[0].checked = true; ui.checks[0].events.change();
assert.equal(ui.status.textContent, '0 of 6 planning steps marked');
assert.equal(ui.link.attrs.href, '#first-visit-arrival');
assert.equal(runClient({ missing: true }).progress.hidden, true);
assert.equal(runClient({ short: true }).progress.hidden, true);
const page = await readFile('src/pages/blog/[slug].astro', 'utf8');
assert.ok(page.includes("post.slug === 'banff-first-time-tips' && <FirstVisitPlanningInteractions />"));
console.log('First-visit planning checks passed:64 progress combinations, actual six-card Astro SSR/native links/no-JS fallback, compiled client toggle/next/clear/fail-closed behavior, hostile input rejection and no network/URL/storage/device access. No site build or writes.');
