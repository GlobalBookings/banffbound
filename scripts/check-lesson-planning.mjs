import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { build, transform as transformJS } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

// Source model + actual inline client behavior. Offline; no site build or snapshot writes.
const bundled = await build({ stdin: { contents: "export * from './src/data/lessonPlanning.ts'; export * from './src/data/skiPlanning.ts';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const model = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const { lessonProgrammes: programmes, parseLessonChoices: parse, matchLessonProgrammes: match, lessonBookingBrief: brief, makeSkiDayPlan: plan, defaultSkiChoices } = model;
const ids = programmes.map(programme => programme.id);
assert.equal(model.lessonReviewedAt, '2026-10-29');
assert.equal(ids.length, 8); assert.equal(new Set(ids).size, 8);
const matching = (age, format = 'all', discipline = 'ski') => match(parse({ age: String(age), format, discipline }).choices).map(programme => programme.id);
assert.deepEqual(matching(2), []);
assert.deepEqual(matching(3), ['norquay-kinder', 'sunshine-tiny-tigers']);
assert.deepEqual(matching(5), ['norquay-kinder', 'louise-kids', 'sunshine-tiny-tigers']);
assert.deepEqual(matching(6), ['norquay-youth-first', 'louise-kids', 'sunshine-tiny-tigers', 'sunshine-kids']);
assert.deepEqual(matching(12), ['norquay-youth-first', 'louise-kids', 'sunshine-kids']);
for (const age of [13, 14]) assert.deepEqual(matching(age), ['norquay-youth-first', 'louise-adult', 'sunshine-adult']);
assert.deepEqual(matching(15), ['norquay-adult-first', 'louise-adult', 'sunshine-adult']);
assert.deepEqual(matching(6, 'lesson'), ['norquay-youth-first', 'louise-kids', 'sunshine-kids']);
assert.deepEqual(matching(6, 'daycare'), ['sunshine-tiny-tigers']); assert.deepEqual(matching(7, 'daycare'), []);
assert.deepEqual(parse({}).choices, { age: null, discipline: 'all', format: 'all' });
assert.equal(match(parse({}).choices).length, 8);
for (const age of ['-1', '0', '3.5', '121', 'Infinity', '1e2', '<script>', ['5', '6'], null, true, {}]) assert.ok(parse({ age }).errors.age, `Reject malformed age ${JSON.stringify(age)}`);
assert.equal(Object.keys(parse({ discipline: '<img>', format: 'guaranteed' }).errors).length, 2);
for (const input of [null, undefined, [], '<script>', 10]) assert.equal(match(parse(input).choices).length, 8);
for (const programme of programmes) {
  assert.deepEqual(programme.disciplines, ['ski', 'snowboard']);
  assert.ok(['banffnorquay.com', 'www.skilouise.com', 'www.skibanff.com'].includes(new URL(programme.url).hostname));
  assert.equal(new URL(programme.url).protocol, 'https:');
  for (const key of ['price', 'rating', 'available', 'operationStatus']) assert.equal(programme[key], undefined);
  assert.ok(programme.includes && programme.check && programme.ageLabel);
}
const tiny = programmes.find(programme => programme.id === 'sunshine-tiny-tigers');
assert.match(tiny.includes, /add-on to a daycare booking/); assert.match(tiny.check, /adults need their own gondola access/);
assert.match(tiny.includes, /confirm equipment separately/);
assert.match(programmes.find(p => p.id === 'louise-kids').includes, /Do not assume the adult beginner bundle/);
assert.match(brief(parse({ age: '5', discipline: 'snowboard' }).choices), /snowboard boots and board rental/);
assert.match(brief(parse({ age: '13', discipline: 'ski' }).choices), /ski boots, skis/);
let combinations = 0;
for (let age = 1; age <= 120; age++) for (const discipline of ['all', 'ski', 'snowboard']) for (const format of ['all', 'lesson', 'daycare']) {
  const parsed = parse({ age: String(age), discipline, format });
  assert.deepEqual(parsed.errors, {});
  const selected = match(parsed.choices);
  assert.ok(selected.every(programme => age >= programme.minAge && (programme.maxAge === null || age <= programme.maxAge)));
  if (format === 'daycare') assert.ok(selected.every(programme => programme.id === 'sunshine-tiny-tigers'));
  if (age < 3) assert.equal(selected.length, 0);
  combinations++;
}
let dayCombinations = 0;
for (const ability of ['first', 'beginner', 'intermediate', 'advanced']) for (const base of ['banff', 'canmore', 'louise']) for (const resort of ['auto', 'norquay', 'louise', 'sunshine']) for (const transport of ['shuttle', 'drive']) for (const group of ['adults', 'children', 'mixed']) {
  const result = plan({ ability, base, resort, transport, group });
  assert.equal(result.timeline.length, 7);
  if (resort === 'auto' && group === 'children') {
    assert.equal(result.key, null, 'No automatic resort based on a family label.');
    assert.equal(result.resort.lessonUrl, '/learn-to-ski/#lesson-fit');
    assert.match(result.reason, /different child and adult age bands/);
    assert.ok(!/Start by checking Norquay/.test(result.reason));
  } else if (resort !== 'auto') assert.equal(result.key, resort, 'A deliberately chosen resort remains supported.');
  else assert.ok(result.key);
  assert.ok(result.lessonLinkLabel && result.transportLinkLabel && result.reportLinkLabel);
  dayCombinations++;
}
assert.equal(plan(defaultSkiChoices).key, 'norquay', 'Preserve the existing adult SSR example.');

const learn = await readFile('src/pages/learn-to-ski.astro', 'utf8');
const day = await readFile('src/pages/ski-day-planner.astro', 'utf8');
for (const [filename, page, faqCount] of [['src/pages/learn-to-ski.astro', learn, 7], ['src/pages/ski-day-planner.astro', day, 5]]) {
  const transformed = await transformAstro(page, { filename });
  assert.deepEqual(transformed.diagnostics.filter(diagnostic => diagnostic.severity === 1), []);
  const faqs = vm.runInNewContext(`(${page.match(/const faqs = (\[[\s\S]*?\n\]);/)[1]})`);
  assert.equal(faqs.length, faqCount);
  assert.ok(page.includes('mainEntity: faqs.map(faq') && page.includes('faqs.map(faq => <details><summary>{faq.question}</summary><p>{faq.answer}</p></details>)'));
}
assert.match(learn, /<form[^>]*id="lesson-fit-form"[^>]*hidden/);
assert.match(learn, /lessonProgrammes\.map\(programme => <article[^>]*data-lesson-id=\{programme.id\}/);
assert.ok(!/<article[^>]*data-lesson-id[^>]*\bhidden/.test(learn));
assert.ok(learn.includes('full comparison and direct school links below work without JavaScript'));
assert.ok(learn.includes('.lesson-chooser [hidden] { display: none !important; }'));
assert.ok(learn.includes('id="first-lesson-checklist"') && learn.includes("'banffbound-first-lesson-checklist-v1'"));
assert.ok(learn.includes('camref=1101l3MtWX') && learn.includes('rel="noopener sponsored"'));
assert.ok(!/innerHTML|insertAdjacentHTML/.test(learn));
const scripts = [...learn.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const clientSource = scripts.find(script => script.includes('initLessonChooser'));
const clientCode = (await transformJS(clientSource.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2022' })).code;

function element(value = '') {
  return { value, hidden: true, checked: false, dataset: {}, validity: { badInput: false }, attributes: new Map(), listeners: {}, children: [], textContent: '',
    addEventListener(type, callback) { (this.listeners[type] ??= []).push(callback); },
    setAttribute(key, value) { this.attributes.set(key, String(value)); }, getAttribute(key) { return this.attributes.get(key) ?? null; }, removeAttribute(key) { this.attributes.delete(key); },
    focus() { this.focused = true; }, select() { this.selected = true; }, append(...children) { this.children.push(...children); }, replaceChildren(...children) { this.children = children; },
    async fire(type) { for (const callback of this.listeners[type] ?? []) await callback({ preventDefault() {} }); },
  };
}
function lessonHarness(href = 'https://banffbound.com/learn-to-ski/?utm_source=google&gclid=keep#booking', options = {}) {
  const elements = new Map(), events = {}, copied = [];
  const get = selector => { if (!elements.has(selector)) elements.set(selector, element(selector === '#lesson-sport' || selector === '#lesson-format' ? 'all' : '')); return elements.get(selector); };
  const cards = ids.map(id => ({ dataset: { lessonId: id }, hidden: false }));
  const location = { href };
  const window = { location, history: { replaceState(_state, _title, next) { if (options.blockHistory) throw Error('blocked'); location.href = String(next); } } };
  const document = { querySelector: get, querySelectorAll: () => cards, addEventListener(type, callback) { (events[type] ??= []).push(callback); } };
  const navigator = { clipboard: { async writeText(text) { if (options.blockClipboard) throw Error('denied'); copied.push(text); } } };
  vm.runInNewContext(clientCode, { window, document, navigator, URL, Set, Object, lessonProgrammes: programmes, parseLessonChoices: parse, matchLessonProgrammes: match, lessonBookingBrief: brief });
  return { get, cards, location, copied, visible: () => cards.filter(card => !card.hidden).map(card => card.dataset.lessonId), async apply(age, sport = 'all', format = 'all') { get('#lesson-age').value = age; get('#lesson-sport').value = sport; get('#lesson-format').value = format; await get('#lesson-fit-form').fire('submit'); }, again() { for (const callback of events['astro:page-load'] ?? []) callback(); } };
}
const client = lessonHarness();
assert.equal(client.get('#lesson-fit-form').hidden, false); assert.equal(client.visible().length, 8);
await client.apply('13', 'snowboard'); assert.deepEqual(client.visible(), matching(13));
assert.match(client.get('#lesson-booking-brief').textContent, /snowboard boots/);
assert.equal(new URL(client.location.href).searchParams.get('lesson_age'), '13');
await client.apply('5', 'ski', 'lesson'); assert.deepEqual(client.visible(), ['norquay-kinder', 'louise-kids']);
await client.apply('7', 'ski', 'daycare'); assert.equal(client.visible().length, 0); assert.equal(client.get('#lesson-fit-empty').hidden, false);
await client.apply('3.5'); assert.equal(client.visible().length, 8); assert.equal(client.get('#lesson-fit-error').hidden, false); assert.equal(client.get('#lesson-age').getAttribute('aria-invalid'), 'true'); assert.equal(client.get('#lesson-age').focused, true);
await client.get('#copy-lesson-options').fire('click'); assert.equal(client.copied.length, 0);
await client.get('#lesson-fit-form').fire('reset'); assert.equal(client.visible().length, 8); assert.equal(client.get('#lesson-fit-empty').hidden, true); assert.equal(client.get('#lesson-fit-error').hidden, true);
const reset = new URL(client.location.href); assert.equal(reset.searchParams.get('utm_source'), 'google'); assert.equal(reset.searchParams.get('gclid'), 'keep'); assert.equal(reset.hash, '#booking');
assert.equal([...reset.searchParams].filter(([key]) => key.startsWith('lesson_')).length, 0);
client.again(); assert.equal(client.get('#lesson-fit-form').listeners.submit.length, 1);
// Copy applies edited fields too, so an unapplied age cannot silently share an older learner.
client.get('#lesson-age').value = '6'; client.get('#lesson-sport').value = 'snowboard';
await client.get('#copy-lesson-options').fire('click'); assert.equal(new URL(client.copied[0]).searchParams.get('lesson_age'), '6'); assert.equal(new URL(client.copied[0]).hash, '#lesson-fit');
const restore = lessonHarness('https://banffbound.com/learn-to-ski/?lesson_age=3&lesson_sport=snowboard&lesson_format=lesson');
assert.deepEqual(restore.visible(), ['norquay-kinder']); assert.equal(restore.get('#lesson-sport').value, 'snowboard');
for (const query of ['lesson_age=%3Cscript%3E', 'lesson_age=5&lesson_age=6', 'lesson_sport=powder', 'lesson_format=available-now']) {
  const invalid = lessonHarness('https://banffbound.com/learn-to-ski/?' + query); assert.equal(invalid.visible().length, 8); assert.equal(invalid.get('#lesson-fit-error').hidden, false);
  assert.ok(!invalid.get('#lesson-fit-error').textContent.includes('<script>'));
}
const fallback = lessonHarness('https://banffbound.com/learn-to-ski/?utm_source=bing', { blockHistory: true, blockClipboard: true });
await fallback.apply('5', 'snowboard'); await fallback.get('#copy-lesson-options').fire('click');
assert.equal(fallback.get('#lesson-copy-fallback').hidden, false); assert.equal(fallback.get('#lesson-copy-url').selected, true);
assert.equal(new URL(fallback.get('#lesson-copy-url').value).searchParams.get('lesson_age'), '5');
assert.equal(new URL(fallback.get('#lesson-copy-url').value).searchParams.get('utm_source'), 'bing');

const daySource = day.match(/<script>([\s\S]*?)<\/script>/)[1];
const dayCode = (await transformJS(daySource.replace(/^\s*import .*$/gm, ''), { loader: 'ts', target: 'es2022' })).code;
function dayHarness(href) {
  const elements = new Map();
  const get = selector => { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); };
  const selects = Object.fromEntries(Object.entries(defaultSkiChoices).map(([key, value]) => [key, element(value)]));
  for (const select of Object.values(selects)) select.selectedOptions = [{ textContent: 'Selected option' }];
  get('#ski-planner').elements = { namedItem: key => selects[key] };
  const location = { href, search: new URL(href).search };
  const document = { querySelector: get, getElementById: id => get('#' + id), querySelectorAll: () => [], createElement: () => element() };
  vm.runInNewContext(dayCode, { document, window: { location, history: { replaceState(_state, _title, href) { location.href = href; } } }, URL, URLSearchParams, Object, Array, String, JSON, localStorage: { getItem() { return null; }, setItem() {} }, defaultSkiChoices, makeSkiDayPlan: plan });
  return { get, selects };
}
const family = dayHarness('https://banffbound.com/ski-day-planner/?group=children&resort=auto&base=louise');
assert.equal(family.get('#ski-result-heading').textContent, 'Choose a suitable snow school first');
assert.equal(family.get('#ski-operator-link').href, '/learn-to-ski/#lesson-fit'); assert.equal(family.get('#ski-operator-link').getAttribute('target'), null);
family.selects.resort.value = 'sunshine'; await family.get('#ski-planner').fire('change');
assert.equal(family.get('#ski-result-heading').textContent, 'Banff Sunshine Village'); assert.equal(family.get('#ski-operator-link').getAttribute('target'), '_blank');
assert.match(family.get('#ski-operator-link').textContent, /Check Banff Sunshine Village lesson details/);
await family.get('#reset-ski-plan').fire('click'); assert.equal(family.get('#ski-result-heading').textContent, 'Mt. Norquay');
console.log(`Lesson planning checks passed: 8 sourced programmes, ${combinations} learner combinations, ${dayCombinations} day plans, age boundaries, conditional daycare, SSR/FAQ/Astro, actual-client restore/reset/errors/copy fallback/idempotence and family resort handoff. No network or site build.`);
