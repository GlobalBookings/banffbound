import { build } from 'esbuild';
import vm from 'node:vm';
const { outputFiles } = await build({ stdin: { contents: "export * from './src/scripts/consent.js'; export * from './src/scripts/tracking.js'; export * from './src/scripts/landingAttribution.js';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'browser', format: 'iife', globalName: 'ConsentTest', logLevel: 'silent' });
const bundle = outputFiles[0].text;
export function consentHarness({ stored = null, blockRead = false, blockWrite = false, initTracking = false, scrollY = 0, tabName = '', blockName = false, blockRemove = blockWrite, paidLanding = false, landingId = '', pageDataset = {}, pageHref = 'https://banffbound.com/hotels/?party=2#stay' } = {}) {
  let now = 1793300000000, timerId = 0, reloads = 0, opened = 0;
  const storage = new Map(stored === null ? [] : [['bb-cookie-consent', typeof stored === 'string' ? stored : JSON.stringify(stored)]]);
  const timers = new Map(), intervals = new Map(), scripts = [], events = { document: new Map(), window: new Map() };
  const nodes = new Map();
  function add(target, type, callback) { const list = events[target].get(type) || []; list.push(callback); events[target].set(type, list); }
  function fire(target, type, event = {}) { for (const callback of events[target].get(type) || []) callback(event); }
  class Element {
    constructor(id = '', tagName = 'button') { this.id = id; this.tagName = tagName; this.hidden = ['cookie-banner','cookie-preferences','cookie-close'].includes(id); this.checked = false; this.textContent = ''; this.dataset = {}; this.attributes = {}; this.closestMap = {}; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
    focus() { document.activeElement = this; }
    remove() { this.removed = true; }
    addEventListener(type, callback) { (this.events ??= {})[type] = callback; }
    closest(selector) { return this.closestMap[selector] || (selector === 'button' && this.tagName === 'button' ? this : selector === '[data-open-consent]' && this.dataset.openConsent !== undefined ? this : null); }
    querySelector() { return null; }
    contains(other) { return this.id === 'cookie-banner' && /^(?:cookie-|pref-)/.test(other?.id || '') || this === other; }
  }
  for (const id of ['cookie-banner','cookie-preferences','cookie-close','cookie-accept','cookie-reject','cookie-save','cookie-manage','cookie-storage-status','pref-analytics','pref-advertising','pref-affiliate','main-content']) nodes.set(id, new Element(id));
  const document = { body: { dataset: paidLanding ? { paidLanding:'true' } : {} }, title: 'Banff planning', referrer: '', hidden: false, activeElement: null, documentElement: { scrollHeight: 2000 }, getElementById: id => nodes.get(id), querySelector: selector => selector === '[data-landing-page]' && landingId ? { dataset: { landingPage: landingId, ...pageDataset } } : null, addEventListener: (type, fn) => add('document', type, fn), createElement: tag => new Element('', tag), head: { appendChild(node) { scripts.push(node); } } };
  const window = { location: { href: pageHref, origin: new URL(pageHref).origin, hostname: new URL(pageHref).hostname, pathname: new URL(pageHref).pathname, reload() { reloads++; } }, localStorage: { getItem(key) { if (blockRead) throw Error('Storage unavailable'); return storage.get(key) ?? null; }, setItem(key, value) { if (blockWrite) throw Error('Storage unavailable'); storage.set(key, value); }, removeItem(key) { if (blockRemove) throw Error('Storage unavailable'); storage.delete(key); } }, addEventListener: (type, fn) => add('window', type, fn), setTimeout(fn, ms) { timers.set(++timerId, { fn, due: now + ms }); return timerId; }, clearTimeout(id) { timers.delete(id); }, setInterval(fn, ms) { intervals.set(++timerId, { fn, ms }); return timerId; }, innerHeight: 800, scrollY, open() { opened++; } };
  let savedName = tabName; Object.defineProperty(window, 'name', { get() { return savedName; }, set(value) { if (blockName) throw Error('Tab persistence unavailable'); savedName = value; } });
  class ClockDate extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  const context = { document, window, Date: ClockDate, URL, Set, Map, Object, console };
  vm.runInNewContext(bundle, context);
  const api = context.ConsentTest;
  api.initConsent(); if (initTracking) api.initTracking();
  return { api, document, window, nodes, scripts, storage, timers, intervals, Element, fire, get now() { return now; }, get reloads() { return reloads; }, get opened() { return opened; }, get commands() { return (window.dataLayer || []).map(item => Array.from(item)); }, get providerScripts() { return scripts.filter(node => !node.removed); }, advance(ms) { now += ms; }, flushTimeouts() { let count = 0; for (const [id, timer] of [...timers]) if (timer.due <= now) { timers.delete(id); timer.fn(); if (++count > 100) throw Error('Unbounded timer execution'); } }, tick() { for (const timer of intervals.values()) timer.fn(); }, click(id) { const target = nodes.get(id); fire('document','click',{ target, currentTarget: target }); }, linkClick(href, { cta = false, landingId: clickLandingId = '', offerId = '', placement = '', contentId = '', contentType = '', ...modifiers } = {}) { let prevented = 0; const link = new Element('', 'a'); link.href = href; link.target = '_blank'; link.textContent = 'Check dates'; link.dataset = { landingId: clickLandingId, offerId, landingPlacement: placement, contentId, contentType }; link.closestMap['a[href]'] = link; if (cta) link.closestMap['.btn, .book-btn, .hotel-link'] = link; const event = { target: link, button: 0, ...modifiers, preventDefault() { prevented++; } }; fire('document','click',event); return { link, prevented }; } };
}
export function validConsent(flags = {}) { return { version: 2, essential: true, analytics: false, advertising: false, affiliate: false, timestamp: 1793300000000, ...flags }; }
