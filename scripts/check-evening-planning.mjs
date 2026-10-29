import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// Independent offline expectations + the actual component script, not a reimplementation.
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/eveningPlanning.ts'; export * from './src/data/eveningGuideMarkup.ts'; export {nightlifeGuideOverrides} from './src/data/nightlifeGuideOverrides.ts'; export {reviewedBlogBodies,resolveBlogContent} from './src/data/blogContentRegistry.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const { eveningFormats: formats, eveningFilterOptions: options, defaultEveningFilters: defaults, normaliseEveningFilters: normalise, buildEveningPlan: plan, eveningPlannerHtml: html } = data;
const ids = ['dinner', 'bowling', 'pub-music', 'performance', 'dance'];
const expectedJourneys = {
  banff: 'https://roamtransit.com/schedules-routes/',
  canmore: 'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/',
  louise: 'https://roamtransit.com/schedules-routes/lake-louise-banff-express-route-8x/',
  road: '/conditions/',
};
assert.equal(data.eveningReviewedAt, '2026-10-29');
assert.deepEqual(defaults, { style: 'all', group: 'all', base: 'banff' });
assert.deepEqual(formats.map(format => format.id), ids);
assert.deepEqual(plan().selectedIds, ids);
assert.deepEqual(plan({ group: 'younger' }).selectedIds, ['dinner', 'bowling', 'performance']);
assert.deepEqual(plan({ style: 'music', group: 'younger' }).selectedIds, ['performance']);
assert.deepEqual(plan({ style: 'music', group: 'adults' }).selectedIds, ['pub-music', 'performance']);
assert.deepEqual(plan({ style: 'dance', group: 'adults' }).selectedIds, ['dance']);
assert.deepEqual(plan({ style: 'dance', group: 'younger' }).selectedIds, []);
assert.match(plan({ style: 'dance', group: 'younger' }).notes.join(' '), /empty shortlist does not mean every venue is unavailable/);
assert.deepEqual(plan({ style: 'food', group: 'younger' }).selectedIds, ['dinner']);
assert.deepEqual(plan({ style: 'games', group: 'younger' }).selectedIds, ['bowling']);
for (const raw of [null, undefined, [], false, 1, 'dance']) assert.deepEqual(normalise(raw), defaults);
assert.deepEqual(normalise({ style: '<script>', group: 'all-ages-guarantee', base: 'javascript:alert(1)' }), defaults);
assert.deepEqual(normalise({ style: ['dance'], group: {}, base: true }), defaults);
assert.deepEqual(normalise({ style: 'music', group: 'younger', base: 'canmore', href: 'https://untrusted.invalid' }), { style: 'music', group: 'younger', base: 'canmore' });
assert.match(formats.find(format => format.id === 'performance').groupNote, /not an all-ages admission promise/);
assert.match(formats.find(format => format.id === 'dinner').groupNote, /does not establish an age policy/);
assert.match(formats.find(format => format.id === 'bowling').groupNote, /after 10 p\.m\./);
assert.match(formats.find(format => format.id === 'dance').groupNote, /18-plus entry condition/);
let combinations = 0;
for (const [style] of options.style) for (const [group] of options.group) for (const [base] of options.base) {
  const result = plan({ style, group, base });
  assert.deepEqual(result.filters, { style, group, base });
  assert.equal(result.journey.href, expectedJourneys[base], 'Exact base-specific source, not a guessed provider or late bus.');
  assert.equal(result.steps.length, 3); assert.equal(result.steps[2], result.journey.text);
  assert.match(result.notes.join(' '), /not live events, admission approval or available tables/);
  if (group === 'younger') assert.ok(!result.selectedIds.some(id => id === 'pub-music' || id === 'dance'));
  if (base === 'canmore') assert.match(result.journey.text, /Route 3/);
  if (base === 'louise') assert.match(result.journey.text, /Route 8X/);
  if (base === 'road') assert.match(result.journey.text, /does not establish a pickup at a rural property/);
  assert.ok(!/guaranteed late|free transfer|\$\d/.test(result.journey.text));
  combinations++;
}
assert.equal(combinations, 60);

const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const cards = [...html.matchAll(/<article\b([^>]*data-evening-id="([^"]+)"[^>]*)>([\s\S]*?)<\/article>/g)];
assert.equal(cards.length, 5); assert.deepEqual(cards.map(card => card[2]), ids);
assert.ok(cards.every(card => !/\bhidden(?:=|\s|$)/.test(card[1])), 'Complete no-JS cards stay visible.');
for (const format of formats) {
  const card = cards.find(card => card[2] === format.id)[3];
  assert.ok(card.includes('What to book') && card.includes('Who is coming?'));
  assert.ok(card.includes(format.href) && card.includes(format.sourceHref));
  const action = card.match(/<a class="evening-action"([^>]*)>/)[1];
  assert.equal(decode(action.match(/href="([^"]+)"/)[1]), format.href);
  if (format.href.startsWith('https:')) { assert.match(action, /target="_blank"/); assert.match(action, /noopener noreferrer/); }
  else assert.ok(!action.includes('target='), 'Internal planning links retain ordinary same-tab navigation.');
  const source = new URL(format.sourceHref); assert.equal(source.protocol, 'https:'); assert.equal(source.search, '');
  assert.ok(!/camref|partner_id|tag=|utm_/.test(format.href + format.sourceHref));
  for (const field of ['price', 'rating', 'available', 'admissionApproved']) assert.equal(format[field], undefined);
}
for (const key of ['style', 'group', 'base']) {
  assert.match(html, new RegExp(`<label for="evening-${key}">`));
  const select = html.match(new RegExp(`<select id="evening-${key}"[^>]*>([\\s\\S]*?)<\\/select>`))?.[1]; assert.ok(select);
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)">/g)].map(option => option[1]), options[key].map(option => option[0]));
  assert.equal(options[key][0][0], defaults[key], 'Native reset defaults match the model and client reset.');
}
assert.match(html, /<form id="evening-fit-form" hidden>/);
assert.match(html, /id="evening-fit-count" role="status" aria-live="polite">5 evening formats to explore/);
assert.match(html, /id="evening-fit-empty" hidden/);
assert.ok(html.includes('All five ideas and a Banff-town return plan are available below'));
const defaultSteps = html.match(/<ol id="evening-steps">([\s\S]*?)<\/ol>/)[1];
assert.deepEqual([...defaultSteps.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(item => decode(item[1])), plan().steps);
assert.ok(html.includes(`id="evening-journey-link" href="${expectedJourneys.banff}"`));
for (const href of ['/blog/new-places-to-eat-in-banff/', '/blog/banff-live-music/']) assert.ok(html.includes(`href="${href}"`));
for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
  if (href.startsWith('/blog/')) await access('src/pages/blog/[slug].astro');
  else { const route = href.replace(/\/$/, ''); try { await access('src/pages' + route + '.astro'); } catch { await access('src/pages' + route + '/index.astro'); } }
}

const componentFile = 'src/components/EveningGuideInteractions.astro';
const component = await readFile(componentFile, 'utf8');
assert.ok(component.includes('.evening-planner [hidden]{display:none!important}'));
assert.ok(!/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|document\.cookie|\bfetch\s*\(|XMLHttpRequest|eval\s*\(|<iframe/.test(component));
for (const [filename, source] of [[componentFile, component], ['evening-planner-fragment.astro', html]]) {
  const result = await transformAstro(source, { filename });
  assert.deepEqual(result.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
}
const actualSource = component.match(/<script>([\s\S]*?)<\/script>/)[1];
const actualClient = (await transformJS(actualSource.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2022' })).code;
function harness(href = 'https://banffbound.com/blog/banff-nightlife-guide/?utm_source=google&gclid=retain&msclkid=retain-too#evening-planner', settings = {}) {
  const nodes = new Map(), events = {};
  const initialValues = { '#evening-style': 'all', '#evening-group': 'all', '#evening-base': 'banff' };
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { value: initialValues[selector] || '', hidden: selector === '#evening-fit-form' || selector === '#evening-fit-empty', dataset: {}, textContent: '', children: [], listeners: {},
      addEventListener(type, callback) { (this.listeners[type] ??= []).push(callback); }, replaceChildren(...children) { this.children = children; },
    });
    return nodes.get(selector);
  }
  const cards = ids.slice(0, settings.cardCount ?? 5).map(id => ({ dataset: { eveningId: id }, hidden: false }));
  const location = { href };
  const window = { location, history: { replaceState(_state, _title, next) { if (settings.blockHistory) throw Error('History denied'); location.href = String(next); } } };
  const document = { querySelector: selector => settings.missing === selector ? null : node(selector), querySelectorAll: () => cards, createElement: tagName => ({ tagName, textContent: '' }), addEventListener(type, callback) { (events[type] ??= []).push(callback); } };
  const denyStorage = new Proxy({}, { get() { throw Error('Evening planning must not access storage'); } });
  vm.runInNewContext(actualClient, { document, window, URL, Object, Array, Set, buildEveningPlan: plan, defaultEveningFilters: defaults, localStorage: denyStorage, sessionStorage: denyStorage, fetch() { throw Error('Evening planning must not fetch providers'); } });
  return { node, location, cards, visible: () => cards.filter(card => !card.hidden).map(card => card.dataset.eveningId), fire(type) {
    for (const callback of node('#evening-fit-form').listeners[type] ?? []) callback({ preventDefault() {} });
    // Reproduce native reset's default action after its listeners finish.
    if (type === 'reset') for (const key of ['style', 'group', 'base']) node('#evening-' + key).value = defaults[key];
  }, again() { for (const callback of events['astro:page-load'] ?? []) callback(); } };
}
const client = harness(); assert.equal(client.node('#evening-fit-form').hidden, false); assert.deepEqual(client.visible(), ids);
assert.equal(client.node('#evening-steps').children.length, 3);
const byStyle = { all: ids, food: ['dinner'], games: ['bowling'], music: ['pub-music', 'performance'], dance: ['dance'] };
const youngerIds = new Set(['dinner', 'bowling', 'performance']);
const matrix = harness(); let clientCombinations = 0;
for (const [style] of options.style) for (const [group] of options.group) for (const [base] of options.base) {
  matrix.node('#evening-style').value = style; matrix.node('#evening-group').value = group; matrix.node('#evening-base').value = base; matrix.fire('change');
  const expected = byStyle[style].filter(id => group !== 'younger' || youngerIds.has(id));
  assert.deepEqual(matrix.visible(), expected, `Real client selection for ${style}/${group}/${base}`);
  assert.equal(matrix.node('#evening-fit-empty').hidden, expected.length !== 0);
  assert.equal(matrix.node('#evening-steps').children.length, 3);
  assert.equal(matrix.node('#evening-journey-link').href, expectedJourneys[base]);
  assert.equal(matrix.node('#evening-journey-link').target, base === 'road' ? '_self' : '_blank');
  clientCombinations++;
}
assert.equal(clientCombinations, 60);
client.node('#evening-group').value = 'younger'; client.node('#evening-style').value = 'music'; client.fire('change');
assert.deepEqual(client.visible(), ['performance']); assert.match(client.node('#evening-fit-count').textContent, /^1 evening format /);
client.node('#evening-style').value = 'dance'; client.fire('submit');
assert.equal(client.visible().length, 0); assert.equal(client.node('#evening-fit-empty').hidden, false);
assert.ok(client.node('#evening-fit-notes').children.some(note => note.textContent.includes('does not mean every venue is unavailable')));
client.node('#evening-group').value = 'adults'; client.node('#evening-base').value = 'canmore'; client.fire('change');
assert.deepEqual(client.visible(), ['dance']); assert.equal(client.node('#evening-fit-empty').hidden, true);
assert.equal(client.node('#evening-journey-link').href, expectedJourneys.canmore); assert.equal(client.node('#evening-journey-link').target, '_blank');
assert.match(client.node('#evening-steps').children[2].textContent, /Route 3/);
client.node('#evening-base').value = 'louise'; client.fire('change'); assert.equal(client.node('#evening-journey-link').href, expectedJourneys.louise); assert.match(client.node('#evening-steps').children[2].textContent, /Route 8X/);
client.node('#evening-base').value = 'road'; client.fire('change'); assert.equal(client.node('#evening-journey-link').href, '/conditions/'); assert.equal(client.node('#evening-journey-link').target, '_self');
client.fire('reset'); assert.deepEqual(client.visible(), ids); assert.equal(client.node('#evening-journey-link').href, expectedJourneys.banff); assert.equal(client.node('#evening-fit-empty').hidden, true);
const reset = new URL(client.location.href); for (const key of ['utm_source', 'gclid', 'msclkid']) assert.ok(reset.searchParams.has(key)); assert.equal(reset.hash, '#evening-planner');
assert.equal([...reset.searchParams.keys()].filter(key => key.startsWith('evening_')).length, 0);
client.again(); client.again(); for (const type of ['change', 'submit', 'reset']) assert.equal(client.node('#evening-fit-form').listeners[type].length, 1);
const restored = harness('https://banffbound.com/blog/banff-nightlife-guide/?evening_style=music&evening_group=younger&evening_base=louise&utm_campaign=keep#return-plan');
assert.deepEqual(restored.visible(), ['performance']); assert.equal(restored.node('#evening-base').value, 'louise'); assert.equal(restored.node('#evening-journey-link').href, expectedJourneys.louise);
assert.equal(new URL(restored.location.href).searchParams.get('utm_campaign'), 'keep'); assert.equal(new URL(restored.location.href).hash, '#return-plan');
for (const query of ['evening_style=%3Cscript%3E&evening_group=permission&evening_base=javascript%3Aalert(1)', 'evening_style=dance&evening_style=food', 'evening_group=younger&evening_group=adults', 'evening_base=road&evening_base=louise']) {
  const invalid = harness('https://banffbound.com/blog/banff-nightlife-guide/?' + query);
  assert.deepEqual(invalid.visible(), ids); assert.equal(invalid.node('#evening-journey-link').href, expectedJourneys.banff);
  assert.ok(!invalid.node('#evening-fit-count').textContent.includes('<script>'));
  for (const key of ['evening_style', 'evening_group', 'evening_base']) assert.equal(new URL(invalid.location.href).searchParams.getAll(key).length, 0);
}
const partialDuplicate = harness('https://banffbound.com/blog/banff-nightlife-guide/?evening_style=dance&evening_style=food&evening_group=younger&evening_base=canmore');
assert.deepEqual(partialDuplicate.visible(), ['dinner', 'bowling', 'performance']); assert.equal(partialDuplicate.node('#evening-journey-link').href, expectedJourneys.canmore);
const blocked = harness('https://banffbound.com/blog/banff-nightlife-guide/?utm_source=bing#planner', { blockHistory: true });
blocked.node('#evening-style').value = 'dance'; blocked.node('#evening-group').value = 'younger'; blocked.fire('change'); assert.equal(blocked.visible().length, 0);
blocked.node('#evening-base').value = 'road'; blocked.fire('submit'); assert.equal(blocked.node('#evening-journey-link').href, '/conditions/'); blocked.fire('reset'); assert.equal(blocked.visible().length, 5);
assert.equal(blocked.location.href, 'https://banffbound.com/blog/banff-nightlife-guide/?utm_source=bing#planner');
for (const missing of ['#evening-fit-form', '#evening-style', '#evening-fit-count', '#evening-steps', '#evening-journey-link']) {
  const incomplete = harness(undefined, { missing }); assert.equal(incomplete.visible().length, 5); assert.equal(incomplete.node('#evening-fit-form').hidden, true);
}
const missingCard = harness(undefined, { cardCount: 4 }); assert.equal(missingCard.node('#evening-fit-form').hidden, true); assert.equal(missingCard.visible().length, 4);

const pageFile = 'src/pages/blog/[slug].astro'; const page = await readFile(pageFile, 'utf8');
assert.ok(page.includes("import EveningGuideInteractions from '../../components/EveningGuideInteractions.astro'"));
assert.match(page, /post\.slug\s*===\s*['"]banff-nightlife-guide['"]\s*&&\s*<EveningGuideInteractions\s*\/>/);
assert.equal((page.match(/<EveningGuideInteractions\s*\/>/g) || []).length, 1);
assert.ok(data.nightlifeGuideOverrides['banff-nightlife-guide'].includes(html));
assert.equal(data.resolveBlogContent('banff-nightlife-guide'), data.nightlifeGuideOverrides['banff-nightlife-guide']);
assert.ok(data.reviewedBlogBodies['banff-nightlife-guide']);
assert.deepEqual((await transformAstro(page, { filename: pageFile })).diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
console.log(`Evening planning checks passed: ${combinations} model + ${clientCombinations} actual-client combinations, family/music/dancing distinctions and four exact journey routes, 5 complete SSR cards/3 steps, change/submit/reset/restore/invalid/duplicates/idempotence/missing-DOM/history failure with ad context preserved, no provider/storage injection, Astro and conditional canonical integration. No network or site build.`);
