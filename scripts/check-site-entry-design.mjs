import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import { build } from 'esbuild';
import { parse } from 'parse5';
import { renderEntrySourceHtml } from './verify-guide-quality-release.mjs';

globalThis.fetch = () => { throw Error('Site-entry design checks are offline'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const read = relative => readFile(path.join(root, relative), 'utf8');
const [home, winter, header, footer, layout, globalCss] = await Promise.all(['src/pages/index.astro', 'src/components/WinterStart.astro', 'src/components/Header.astro', 'src/components/Footer.astro', 'src/layouts/BaseLayout.astro', 'src/styles/global.css'].map(read));
const headerHrefs = value => [...value.split('<script>')[0].matchAll(/href\s*[:=]\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
const expectedHeaderHash = 'f1035b771d2fd20c5f53028f1370a08860f2404534ad7c6fe5ac77720acb3b29';
const digestHrefs = hrefs => createHash('sha256').update(JSON.stringify([...hrefs].sort())).digest('hex');
const existingHeaderHrefs = value => headerHrefs(value).filter(href => href !== '/experiences/');
assert.equal(headerHrefs(header).length, 77);
assert.equal(headerHrefs(header).filter(href => href === '/experiences/').length, 1, 'The tours and activities directory is discoverable in the shared desktop/mobile menu.');
assert.equal(digestHrefs(existingHeaderHrefs(header)), expectedHeaderHash, 'Every existing native header href and query remains unchanged.');
assert.ok(!/80\+ trails with GPS routes|95 properties with map|Altitude Sickness Guide|subtitle: 'Stay by the lake'/.test(header));
assert.match(globalCss, /--font-heading:\s*'Playfair Display'/);
assert.match(globalCss, /--font-body:\s*'Source Sans 3'/);
assert.match(globalCss, /--color-primary:\s*#1a3a2a/);
assert.match(globalCss, /--color-accent:\s*#c8a96e/);
assert.ok(!/hero-slide|heroSlides|setInterval|setTimeout|stats-bar|newsletter-section/.test(home), 'No hero rotation/timer, statistics band or duplicate newsletter');
assert.equal((home.match(/installSnapshotExpiry\(\)/g) ?? []).length, 1);
assert.equal((home.match(/installTownFeedPanels\(\)/g) ?? []).length, 1);
for (const sourceGate of ['dataFreshness(weatherData.updatedAt, 6)', 'dataFreshness(weatherData.banff?.current?.observedAt,6)', "weatherData.provider === 'Environment and Climate Change Canada'", 'dataFreshness(trailData.updatedAt, 24)', 'dataFreshness(trail.lastUpdated, 24)', 'weatherAvailable &&', 'trailsAvailable &&', 'Number.isFinite(weatherData.banff?.current?.temp)', 'trailData.summary.total > 0', 'trailData.summary.open <= trailData.summary.total']) assert.ok(home.includes(sourceGate), 'Preserved provider/time/value gate: ' + sourceGate);
assert.ok(!/fetch\s*\(|<form\b|<iframe\b|partner_id=|camref=|gtag\(/.test(home), 'Home introduces no personal form, provider embed or tracking destination');
assert.ok(!/<script\b/.test(winter), 'WinterStart remains native navigation');

const walk = node => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, key) => node?.attrs?.find(item => item.name === key)?.value;
const text = node => node.tagName === 'br' ? ' ' : node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const normal = value => value.replace(/\s+/g, ' ').trim();
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const bookingRoutes = ['/book/banff-hotels/', '/book/lake-louise-stays/', '/book/banff-winter-activities/'];
const winterRoutes = ['/learn-to-ski', '/ski-day-planner', '/towns', '/winter-stays'];
const socials = ['https://www.instagram.com/Banff_bound', 'https://www.facebook.com/people/BanffBound/61580983035426/', 'https://www.pinterest.com/Banff_bound/', 'https://www.tiktok.com/@Banff_bound'];
const footerRoutes = ['/', '/things-to-do', '/lakes', '/scenic-drives', '/eat-and-drink', '/shopping', '/wellness', '/trip-builder', '/tours', '/hotels', '/book/banff-hotels/', '/book/banff-winter-activities/', '/summer', '/winter', '/ski-day-planner', '/learn-to-ski', '/winter-stays', '/towns', '/events', '/blog', '/about', '/contact', '/editorial', '/privacy', '/terms', '/trip-reports', 'https://www.pc.gc.ca/en/pn-np/ab/banff', 'https://www.banfflakelouise.com', ...socials];
const newsletterAction = 'https://banffbound.us16.list-manage.com/subscribe/post?u=38050436b38afb17f1b30580a&id=c419fe73a6&f_id=002699e0f0';
const weatherUrl = 'https://weather.gc.ca/en/location/index.html?coords=51.178,-115.571';
const trailsUrl = 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions';
const fontUrl = 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap';
function checkHtml(markup) {
  const nodes = walk(parse(markup, { scriptingEnabled: false }));
  const byId = id => { const node = nodes.find(item => attr(item, 'id') === id); assert.ok(node, 'Missing #' + id); return node; };
  const main = byId('main-content'), mainNodes = walk(main), hero = byId('home-start'), heroNodes = walk(hero);
  assert.equal(nodes.filter(node => node.tagName === 'h1').length, 1);
  assert.equal(normal(text(byId('home-heading'))), 'Find your place in Banff.');
  assert.ok(heroNodes.includes(byId('home-heading')));
  const images = heroNodes.filter(node => node.tagName === 'img'); assert.equal(images.length, 1);
  assert.equal(new URL(attr(images[0], 'src')).hostname, 'images.unsplash.com');
  assert.match(attr(images[0], 'alt'), /Illustrative.*not a verified route or current-condition view/);
  assert.equal(attr(images[0], 'fetchpriority'), 'high');
  assert.ok(heroNodes.some(node => node.tagName === 'figcaption' && /Illustrative mountain photograph/.test(text(node))));
  assert.deepEqual(walk(byId('home-booking-start')).filter(node => node.tagName === 'a').map(node => attr(node, 'href')), bookingRoutes);
  const trip = heroNodes.find(node => node.tagName === 'a' && attr(node, 'href') === '/trip-builder/'); assert.ok(trip);
  const reportSection = mainNodes.find(node => hasClass(node, 'home-current')); assert.ok(reportSection);
  for (const node of [...walk(byId('home-booking-start')).filter(item => item.tagName === 'a'), trip]) assert.ok(mainNodes.indexOf(node) < mainNodes.indexOf(reportSection), 'Booking and planning choices precede current reports');
  const winterSection = mainNodes.find(node => hasClass(node, 'winter-start')); assert.ok(winterSection);
  const winterRows = walk(winterSection).find(node => hasClass(node, 'winter-start-rows')); assert.ok(winterRows);
  assert.deepEqual(walk(winterRows).filter(node => node.tagName === 'a').map(node => attr(node, 'href')), winterRoutes);
  assert.ok(walk(winterSection).some(node => node.tagName === 'a' && attr(node, 'href') === '/winter'));
  assert.ok(mainNodes.indexOf(winterSection) < mainNodes.indexOf(reportSection));
  assert.ok(!mainNodes.some(node => hasClass(node, 'hero-slide') || hasClass(node, 'stats-bar') || hasClass(node, 'newsletter-section')));
  assert.ok(!/perfect escape|someone who lives here|top-rated local operators|skip the line at the gate|Weekly tips, trail conditions, and deals/.test(text(main)), 'No unsupported narrator/ranking/queue/frequency promise');
  const featured = mainNodes.find(node => hasClass(node, 'guide-rows')); assert.ok(featured);
  assert.deepEqual(walk(featured).filter(node => node.tagName === 'a').map(node => attr(node, 'href')), ['/blog/banff-heli-skiing', '/blog/banff-snowshoeing-guide', '/blog/banff-winter-driving', '/blog/banff-ski-in-ski-out']);
  const today = mainNodes.find(node => hasClass(node, 'today-grid')); assert.ok(today);
  for (const [href, fallback] of [[weatherUrl, 'Weather unavailable'], [trailsUrl, 'Trail status unavailable']]) {
    const link = walk(today).find(node => node.tagName === 'a' && attr(node, 'href') === href); assert.ok(link, 'Direct official report source');
    assert.equal(attr(link, 'target'), '_blank'); assert.equal(attr(link, 'rel'), 'noopener');
    const unavailable = walk(link).find(node => attr(node, 'data-snapshot-unavailable') !== undefined); assert.ok(unavailable);
    assert.equal(normal(text(unavailable)), fallback);
    const fresh = walk(link).filter(node => attr(node, 'data-snapshot-fresh') !== undefined);
    if (fresh.length) { assert.equal(fresh.length, 1); assert.ok(Number.isFinite(Date.parse(attr(link, 'data-fresh-until')))); assert.ok(Number.isFinite(Date.parse(attr(link, 'data-snapshot-time')))); }
    else assert.equal(attr(unavailable, 'hidden'), undefined, 'Missing data is unavailable, not zero');
    assert.ok(walk(link).some(node => hasClass(node, 'today-label') && /Check/.test(text(node))));
  }
  assert.ok(mainNodes.some(node => node.tagName === 'a' && attr(node, 'href') === '/conditions'));
  assert.ok(mainNodes.some(node => node.tagName === 'noscript' && /data-snapshot-fresh/.test(text(node)) && /data-snapshot-unavailable/.test(text(node))));
  const town = mainNodes.find(node => attr(node, 'data-town-panel') !== undefined); assert.ok(town);
  assert.equal(attr(town, 'data-town-kind'), 'events');
  const townNodes = walk(town);
  assert.ok(townNodes.some(node => attr(node, 'data-town-stale') !== undefined));
  assert.ok(townNodes.some(node => attr(node, 'data-town-no-matches') !== undefined));
  assert.ok(townNodes.some(node => node.tagName === 'a' && attr(node, 'href') === 'https://banff.ca/Calendar.aspx'));
  assert.ok(townNodes.some(node => node.tagName === 'a' && attr(node, 'href') === '/events'));
  assert.ok(text(town).includes('Snapshot retrieved:'));
  assert.ok(townNodes.some(node => node.tagName === 'noscript' && /expiry cannot be checked/.test(text(node)) && /data-town-results/.test(text(node)) && /data-town-stale/.test(text(node))));
  const footers = nodes.filter(node => node.tagName === 'footer' && hasClass(node, 'site-footer')); assert.equal(footers.length, 1);
  const footerNodes = walk(footers[0]);
  assert.deepEqual(footerNodes.filter(node => node.tagName === 'a').map(node => attr(node, 'href')), footerRoutes, 'Footer social/editorial/privacy/native destinations');
  const forms = nodes.filter(node => node.tagName === 'form'); assert.equal(forms.length, 1, 'One newsletter placement');
  assert.ok(footerNodes.includes(forms[0]));
  assert.equal(attr(forms[0], 'action'), newsletterAction); assert.equal(attr(forms[0], 'method'), 'post'); assert.equal(attr(forms[0], 'target'), '_blank'); assert.equal(attr(forms[0], 'novalidate'), '');
  const inputs = walk(forms[0]).filter(node => node.tagName === 'input'); assert.equal(inputs.length, 2);
  assert.deepEqual(inputs.map(node => [attr(node, 'type'), attr(node, 'name')]), [['email', 'EMAIL'], ['text', 'b_38050436b38afb17f1b30580a_c419fe73a6']]);
  assert.equal(attr(inputs[0], 'aria-label'), 'Email address'); assert.equal(attr(inputs[0], 'required'), ''); assert.equal(attr(inputs[1], 'tabindex'), '-1'); assert.equal(attr(inputs[1], 'value'), '');
  assert.ok(footerNodes.some(node => node.tagName === 'button' && attr(node, 'data-open-consent') !== undefined && attr(node, 'type') === 'button'));
  assert.ok(text(footers[0]).includes('may earn commission'));
  const headerNodes = [...walk(byId('site-header')), ...walk(byId('utility-bar'))];
  const renderedHeaderHrefs = headerNodes.filter(node => node.tagName === 'a').map(node => attr(node, 'href'));
  for (const href of new Set(headerHrefs(header))) assert.ok(renderedHeaderHrefs.includes(href), 'Actual header link: ' + href);
  assert.equal(byId('menu-toggle').tagName, 'button');
  assert.equal(attr(byId('menu-toggle'), 'aria-expanded'), 'false');
  assert.equal(attr(byId('menu-toggle'), 'aria-controls'), 'mobile-menu');
  assert.equal(byId('mobile-menu').tagName, 'nav');
  assert.equal(attr(byId('mobile-menu'), 'aria-label'), 'Mobile navigation');
  assert.ok(walk(byId('mobile-menu')).some(node => node.tagName === 'a' && attr(node, 'href') === '/experiences/' && normal(text(node)) === 'Compare Tours & Activities'), 'The experience directory remains a native, named mobile link.');
  const mobileButtons = headerNodes.filter(node => hasClass(node, 'mobile-section-toggle'));
  const desktopButtons = headerNodes.filter(node => hasClass(node, 'mega-trigger'));
  assert.equal(mobileButtons.length, 4); assert.equal(desktopButtons.length, 4);
  for (const [buttons, prefix, panelClass] of [[mobileButtons, 'mobile-section-', 'mobile-section-links'], [desktopButtons, 'mega-section-', 'mega-panel']]) for (const [index, button] of buttons.entries()) {
    assert.equal(button.tagName, 'button');
    assert.equal(attr(button, 'aria-expanded'), 'false');
    assert.equal(attr(button, 'aria-controls'), prefix + index);
    assert.ok(hasClass(byId(prefix + index), panelClass), 'Disclosure controls the actual corresponding navigation panel');
    assert.equal(attr(button, 'aria-haspopup'), undefined, 'Navigation disclosure, not an ARIA application menu');
  }
  assert.ok(!headerNodes.some(node => attr(node, 'role') === 'menu' || attr(node, 'role') === 'menuitem'));
  const fonts = nodes.filter(node => node.tagName === 'link' && attr(node, 'href') === fontUrl); assert.equal(fonts.length, 2);
  const preload = fonts.find(node => attr(node, 'rel') === 'preload'); assert.ok(preload); assert.equal(attr(preload, 'as'), 'style'); assert.equal(attr(preload, 'onload'), "this.onload=null;this.rel='stylesheet'");
  const fallbackFont = fonts.find(node => attr(node, 'rel') === 'stylesheet'); assert.ok(nodes.some(node => node.tagName === 'noscript' && walk(node).includes(fallbackFont)));
  for (const href of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) assert.ok(nodes.some(node => node.tagName === 'link' && attr(node, 'href') === href && attr(node, 'rel') === 'preconnect'));
  assert.equal(attr(nodes.find(node => node.tagName === 'link' && attr(node, 'rel') === 'canonical'), 'href'), 'https://banffbound.com/');
  assert.equal(normal(text(nodes.find(node => node.tagName === 'title'))), 'Banff Trip Planning: Stays, Winter Days & Mountain Towns | BanffBound');
  assert.equal(attr(nodes.find(node => node.tagName === 'meta' && attr(node, 'property') === 'article:modified_time'), 'content'), '2026-10-29');
  const description = attr(nodes.find(node => node.tagName === 'meta' && attr(node, 'name') === 'description'), 'content'); assert.ok(description.includes('Compare room choices'));
  for (const id of ['cookie-accept', 'cookie-reject', 'cookie-manage', 'cookie-save', 'pref-analytics', 'pref-advertising', 'pref-affiliate']) byId(id);
  for (const node of nodes.filter(node => ['script', 'iframe'].includes(node.tagName))) assert.ok(!/^https?:/.test(attr(node, 'src') ?? ''), 'No executable external optional provider at initial SSR');
  for (const token of ['PRIVATE_ENTRY_READER', 'PRIVATE_ENTRY_CLICK', 'PRIVATE_ENTRY_BING']) assert.ok(!markup.includes(token));
}
const html = await renderEntrySourceHtml('src/pages/index.astro'); checkHtml(html);
const failures = [
  ['wrong hero booking destination', value => value.replace('href="/book/lake-louise-stays/"', 'href="/book/unreviewed/"')],
  ['hero after reports', value => { const hero = value.match(/<section\b[^>]*\bid="home-start"[\s\S]*?<\/section>/)?.[0]; assert.ok(hero); return value.replace(hero, '').replace('</main>', hero + '</main>'); }],
  ['hero not illustrative', value => value.replace('Illustrative mountain photograph; not a verified route or current-condition view', 'Verified current Banff conditions')],
  ['second hero image', value => value.replace(/(<figure\b[^>]*class="home-image[^"]*"[^>]*>)/, '$1<img src="/unexpected.jpg" alt="Extra slide">')],
  ['duplicate newsletter', value => value.replace('</main>', '<form action="https://example.com"><input type="email"></form></main>')],
  ['newsletter account changed', value => value.replace('u=38050436b38afb17f1b30580a', 'u=wrong_account')],
  ['honeypot changed', value => value.replace('name="b_38050436b38afb17f1b30580a_c419fe73a6"', 'name="wrong_honeypot"')],
  ['social destination changed', value => value.replace('href="https://www.instagram.com/Banff_bound"', 'href="https://www.instagram.com/wrong"')],
  ['privacy control removed', value => value.replace('data-open-consent', 'data-wrong-consent')],
  ['weather fallback lost', value => value.replace('data-snapshot-unavailable', 'data-wrong-snapshot')],
  ['Town source lost', value => value.replaceAll('href="https://banff.ca/Calendar.aspx"', 'href="/unverified-events"')],
  ['font loading changed', value => value.replaceAll('family=Source+Sans+3:', 'family=Inter:')],
  ['canonical wrong', value => value.replace('rel="canonical" href="https://banffbound.com/"', 'rel="canonical" href="https://banffbound.com/tools/"')],
  ['provider loaded before consent', value => value.replace('</head>', '<script src="https://widget.getyourguide.com/sdk.js"></script></head>')],
  ['resident fiction returned', value => value.replace('</main>', '<p>Tips from someone who lives here</p></main>')],
  ['stats band returned', value => value.replace('</main>', '<section class="stats-bar">Invented counts</section></main>')],
  ['mobile expanded state lost', value => value.replace(/(<button\b[^>]*id="menu-toggle"[^>]*?) aria-expanded="false"/, '$1')],
  ['mobile panel association lost', value => value.replace('aria-controls="mobile-section-0"', 'aria-controls="missing-mobile-section"')],
  ['experience directory link lost', value => value.replaceAll('href="/experiences/"', 'href="/activities/"')],
  ['desktop application-menu role returned', value => value.replace(/(<div\b[^>]*class="mega-panel[^"]*"[^>]*>)/, '$1<div role="menu"></div>')],
];
for (const [name, mutate] of failures) { const changed = mutate(html); assert.ok(changed !== html, name + ' fixture must change output'); assert.throws(() => checkHtml(changed), undefined, name); }
assert.notEqual(digestHrefs(existingHeaderHrefs(header.replace('/hotel-directory?area=Lake+Louise', '/hotel-directory?area=Banff'))), expectedHeaderHash, 'Filtered header URL drift is detected');

// Compile and execute both actual home installers and their actual local utilities.
const scripts = [...home.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]); assert.equal(scripts.length, 2);
const client = (await build({ stdin: { contents: scripts.join('\n'), loader: 'ts', resolveDir: path.join(root, 'src/pages') }, bundle: true, write: false, platform: 'browser', format: 'iife', logLevel: 'silent' })).outputFiles[0].text;
const freshValue = { hidden: false }, unavailable = { hidden: true }, townResults = { hidden: false }, townStale = { hidden: true };
const reportPanel = { dataset: { freshUntil: '2020-01-02T00:00:00.000Z', snapshotTime: '2020-01-01T00:00:00.000Z' }, querySelectorAll(selector) { if (selector === '[data-snapshot-fresh]') return [freshValue]; assert.equal(selector, '[data-snapshot-unavailable]'); return [unavailable]; } };
const townPanel = { dataset: { townExpires: '2020-01-02T00:00:00.000Z', townRetrieved: '2020-01-01T00:00:00.000Z', townKind: 'events' }, querySelector(selector) { assert.equal(selector, '[data-town-results]'); return townResults; }, querySelectorAll(selector) { assert.equal(selector, '[data-town-stale]'); return [townStale]; }, contains() { return false; } };
const intervals = [], documentEvents = [], windowEvents = [];
const sandbox = { document: { querySelector(selector) { assert.ok(/^#town-event-(filters|from|to|query|reset)$/.test(selector)); return null; }, querySelectorAll(selector) { if (selector === '[data-fresh-until]') return [reportPanel]; assert.equal(selector, '[data-town-panel]'); return [townPanel]; }, addEventListener(name, callback) { documentEvents.push([name, callback]); } }, window: { setInterval(callback, delay) { intervals.push([callback, delay]); }, addEventListener(name, callback) { windowEvents.push([name, callback]); } } };
for (const key of ['fetch', 'XMLHttpRequest', 'navigator', 'localStorage', 'sessionStorage', 'location', 'history']) Object.defineProperty(sandbox, key, { get() { throw Error('Unexpected network, storage or private-input access: ' + key); } });
vm.runInNewContext(client, sandbox);
assert.equal(freshValue.hidden, true); assert.equal(unavailable.hidden, false); assert.equal(townResults.hidden, true); assert.equal(townStale.hidden, false);
assert.deepEqual(intervals.map(([, delay]) => delay), [60_000, 60_000], 'Exactly one interval for each preserved installer');
assert.deepEqual(documentEvents.map(([name]) => name), ['visibilitychange', 'visibilitychange']);
assert.deepEqual(windowEvents.map(([name]) => name), ['pageshow', 'pageshow']);
for (const [callback] of intervals) callback();
assert.equal(freshValue.hidden, true); assert.equal(townResults.hidden, true);

// Execute the real Header prefix through its Mobile and Escape handlers. The
// search-modal block is deliberately excluded so this fixture cannot request
// Pagefind, change scroll state or stand in for an unrelated search test.
const headerClient = header.match(/<script>([\s\S]*?)<\/script>/)?.[1]; assert.ok(headerClient);
const searchBoundary = headerClient.indexOf('  // Search modal'); assert.ok(searchBoundary > 0);
const navigationClient = headerClient.slice(0, searchBoundary);
assert.ok(navigationClient.includes('function openMega(') && navigationClient.includes('function closeMobile(') && navigationClient.includes("e.key === 'Escape'"));
const compileNavigation = async contents => (await build({ stdin: { contents, loader: 'ts' }, bundle: true, write: false, platform: 'browser', format: 'iife', logLevel: 'silent' })).outputFiles[0].text;
const navigationCode = await compileNavigation(navigationClient);
function runNavigation(code = navigationCode, missingId) {
  let document;
  class FixtureElement {
    constructor(node) {
      this.tagName = node.tagName; this.attrs = Object.fromEntries((node.attrs ?? []).map(item => [item.name, item.value]));
      const classes = new Set((this.attrs.class ?? '').split(/\s+/).filter(Boolean));
      this.classList = { add(...names) { names.forEach(name => classes.add(name)); }, remove(...names) { names.forEach(name => classes.delete(name)); }, contains(name) { return classes.has(name); } };
      this.events = {}; this.focusCount = 0;
      this.children = (node.childNodes ?? []).filter(child => child.tagName).map(child => { const converted = new FixtureElement(child); converted.parent = this; return converted; });
    }
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    addEventListener(name, handler) { (this.events[name] ??= []).push(handler); }
    focus() { this.focusCount++; document.activeElement = this; }
    contains(element) { return this === element || this.children.some(child => child.contains(element)); }
    closest(selector) { return matches(this, selector) ? this : this.parent?.closest(selector) ?? null; }
    querySelectorAll(selector) { return this.children.flatMap(child => [child, ...child.querySelectorAll('*')]).filter(child => matches(child, selector)); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  }
  function matches(element, selector) { return selector.split(',').some(part => { const value = part.trim(); if (value === '*') return true; if (value.startsWith('.')) return value.slice(1).split('.').every(name => element.classList.contains(name)); if (value.startsWith('#')) return element.attrs.id === value.slice(1); return element.tagName === value; }); }
  const tree = new FixtureElement({ tagName: 'fixture-root', childNodes: parse(html).childNodes });
  const events = {}, windowEvents = {};
  document = { activeElement: tree.querySelector('body'), getElementById(id) { return id === missingId ? null : tree.querySelector('#' + id); }, querySelectorAll(selector) { return tree.querySelectorAll(selector); }, addEventListener(name, handler) { (events[name] ??= []).push(handler); } };
  const context = { document, HTMLElement: FixtureElement, window: { addEventListener(name, handler) { (windowEvents[name] ??= []).push(handler); } } };
  for (const key of ['fetch', 'XMLHttpRequest', 'navigator', 'localStorage', 'sessionStorage', 'location', 'history', 'setTimeout', 'setInterval']) Object.defineProperty(context, key, { get() { throw Error('Unexpected Header network/timer/private access: ' + key); } });
  vm.runInNewContext(code, context);
  const fire = (element, name, extra = {}) => { let stopped = false; for (const handler of element.events[name] ?? []) handler({ stopPropagation() { stopped = true; }, ...extra }); return stopped; };
  return { document, tree, events, fire, escape(key = 'Escape') { for (const handler of events.keydown ?? []) handler({ key }); }, toggle: tree.querySelector('#menu-toggle'), mobile: tree.querySelector('#mobile-menu'), sections: tree.querySelectorAll('.mobile-section'), mobileButtons: tree.querySelectorAll('.mobile-section-toggle'), megaItems: tree.querySelectorAll('.nav-item.has-mega'), desktopButtons: tree.querySelectorAll('.mega-trigger'), backdrop: tree.querySelector('#mega-backdrop') };
}
function assertNavigation(ui) {
  const outerState = expanded => { assert.equal(ui.toggle.getAttribute('aria-expanded'), String(expanded)); assert.equal(ui.toggle.classList.contains('open'), expanded); assert.equal(ui.mobile.classList.contains('open'), expanded); };
  const sectionState = chosen => ui.sections.forEach((section, index) => { assert.equal(section.classList.contains('open'), index === chosen); assert.equal(ui.mobileButtons[index].getAttribute('aria-expanded'), String(index === chosen)); });
  const desktopClosed = () => { assert.ok(ui.megaItems.every(item => !item.classList.contains('open'))); assert.ok(ui.desktopButtons.every(button => button.getAttribute('aria-expanded') === 'false')); assert.equal(ui.backdrop.classList.contains('visible'), false); };
  outerState(false); sectionState(-1); desktopClosed();
  ui.fire(ui.toggle, 'click'); outerState(true);
  for (let chosen = 0; chosen < 4; chosen++) { ui.fire(ui.mobileButtons[chosen], 'click'); sectionState(chosen); ui.fire(ui.mobileButtons[chosen], 'click'); sectionState(-1); }
  for (let first = 0; first < 4; first++) for (let second = 0; second < 4; second++) {
    ui.fire(ui.mobileButtons[first], 'click'); sectionState(first);
    ui.fire(ui.mobileButtons[second], 'click'); sectionState(first === second ? -1 : second);
    if (first !== second) ui.fire(ui.mobileButtons[second], 'click'); sectionState(-1);
  }
  ui.fire(ui.toggle, 'click'); outerState(false);
  ui.fire(ui.toggle, 'click'); ui.fire(ui.mobileButtons[0], 'click');
  const mobileLink = ui.sections[0].querySelector('.mobile-link'); mobileLink.focus(); ui.escape(); outerState(false); assert.equal(ui.document.activeElement, ui.toggle, 'Escape returns mobile-link focus to outer toggle');
  ui.fire(ui.toggle, 'click'); ui.toggle.focus(); ui.escape(); outerState(false); assert.equal(ui.document.activeElement, ui.toggle);
  const outside = ui.tree.querySelector('#home-heading');
  ui.fire(ui.toggle, 'click'); outside.focus(); ui.escape(); outerState(false); assert.equal(ui.document.activeElement, outside, 'Do not steal focus from outside the navigation');
  ui.fire(ui.toggle, 'click'); ui.escape('Enter'); outerState(true);
  ui.fire(mobileLink, 'click'); outerState(false);
  ui.fire(ui.toggle, 'click'); ui.fire(ui.mobile.querySelector('.mobile-direct-link'), 'click'); outerState(false);
  for (const [index, button] of ui.desktopButtons.entries()) {
    assert.equal(ui.fire(button, 'click'), true, 'Desktop click propagation remains stopped');
    assert.equal(button.getAttribute('aria-expanded'), 'true'); assert.equal(ui.megaItems[index].classList.contains('open'), true); assert.equal(ui.backdrop.classList.contains('visible'), true);
    ui.megaItems[index].querySelector('.mega-link').focus(); ui.escape(); desktopClosed(); outerState(false); assert.equal(ui.document.activeElement, button, 'Escape returns desktop-panel focus to its actual trigger');
  }
  ui.fire(ui.desktopButtons[0], 'click'); ui.fire(ui.desktopButtons[1], 'click');
  assert.equal(ui.desktopButtons[0].getAttribute('aria-expanded'), 'false'); assert.equal(ui.desktopButtons[1].getAttribute('aria-expanded'), 'true');
  outside.focus(); ui.escape(); desktopClosed(); assert.equal(ui.document.activeElement, outside);
  ui.escape(); assert.equal(ui.document.activeElement, outside);
}
assertNavigation(runNavigation());
for (const id of ['menu-toggle', 'mobile-menu', 'mega-backdrop']) { const partial = runNavigation(navigationCode, id); partial.escape(); }
const navigationMutations = [
  ['outer expanded state never opens', value => value.replace("toggle?.setAttribute('aria-expanded', 'true');", "toggle?.setAttribute('aria-expanded', 'false');")],
  ['outer expanded state never closes', value => value.replace("toggle?.setAttribute('aria-expanded', 'false');", "toggle?.setAttribute('aria-expanded', 'true');")],
  ['previous section remains expanded', value => value.replace("s.querySelector('.mobile-section-toggle')?.setAttribute('aria-expanded', 'false');", '')],
  ['mobile Escape focus is lost', value => value.replace('if (returnMobileFocus) toggle?.focus();', 'if (returnMobileFocus) {}')],
  ['desktop Escape focus is lost', value => value.replace('else if (megaTrigger instanceof HTMLElement) megaTrigger.focus();', '')],
];
for (const [name, mutate] of navigationMutations) { const changed = mutate(navigationClient); assert.ok(changed !== navigationClient, name + ' fixture must change actual handlers'); const code = await compileNavigation(changed); assert.throws(() => assertNavigation(runNavigation(code)), undefined, name); }
console.log(`Site-entry design checks passed:actual full-layout home SSR, static illustrative hero/three owned booking routes +Trip Builder before reports;Header77 native hrefs with original76 exact hash plus experience directory/disclosure semantics and actual mobile/desktop open/switch/close/Escape focus handlers;WinterStart4 native rows;one unchanged newsletter account/fields/footer/social/privacy;Source Sans3 +Playfair loading;dated source/no-JS hooks and both actual expiry installers;${failures.length} material HTML negatives +filtered-URL mutation +${navigationMutations.length} actual-handler mutations. No browser, network or site build.`);
