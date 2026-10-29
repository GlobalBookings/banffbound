import { landingContext, cleanLandingContext } from './landingAttribution.js';
// Optional services use explicit choices. Importing this module never loads a provider.
export const CONSENT_KEY = 'bb-cookie-consent';
export const CONSENT_VERSION = 2;
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const CONSENT_CATEGORIES = ['analytics', 'advertising', 'affiliate'];
export const GOOGLE_IDS = { analytics: 'G-2DP7J42ZW0', advertising: 'AW-17246982814', conversion: 'AW-17246982814/8ptcCPuTheAaEJ6lgKBA', adsense: 'ca-pub-9022308520000198' };
const denied = () => ({ analytics: false, advertising: false, affiliate: false });
const flags = record => record ? Object.fromEntries(CONSENT_CATEGORIES.map(key => [key, record[key]])) : denied();
let memoryOnly = false, memoryRecord = null, initialized = false;
let previousFlags = denied(), expiryTimer = null, returnFocus = null;
let googleStarted = false, consentDefaultSet = false;
const configured = new Set(), providerScripts = new Map(), subscribers = new Set();

export function parseConsentRecord(raw, now = Date.now()) {
  try {
    const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
    const keys = ['version', 'essential', ...CONSENT_CATEGORIES, 'timestamp'];
    if (Object.keys(record).length !== keys.length || !keys.every(key => Object.hasOwn(record, key))) return null;
    if (record.version !== CONSENT_VERSION || record.essential !== true || !CONSENT_CATEGORIES.every(key => typeof record[key] === 'boolean')) return null;
    if (!Number.isSafeInteger(record.timestamp) || record.timestamp < 0 || record.timestamp > now + 300000 || now - record.timestamp >= CONSENT_MAX_AGE_MS) return null;
    return { version: CONSENT_VERSION, essential: true, ...flags(record), timestamp: record.timestamp };
  } catch { return null; }
}
// A tab-only fallback prevents failed localStorage writes from restoring stale grants
// after the revocation reload. It contains choices, never browsing or form data.
const TAB_PREFIX = 'banffbound-consent-v2:';
function tabChoice() {
  try {
    if (typeof window.name !== 'string' || !window.name.startsWith(TAB_PREFIX)) return null;
    const value = JSON.parse(window.name.slice(TAB_PREFIX.length));
    const record = parseConsentRecord(value.record);
    return record ? { ...record, ...denied() } : null;
  } catch { return null; }
}
function saveTabChoice(record) {
  try {
    let previousName = typeof window.name === 'string' ? window.name : '';
    if (previousName.startsWith(TAB_PREFIX)) {
      try { previousName = JSON.parse(previousName.slice(TAB_PREFIX.length)).previousName || ''; } catch { previousName = ''; }
    }
    const value = TAB_PREFIX + JSON.stringify({ record: { ...record, ...denied() }, previousName });
    window.name = value;
    return window.name === value;
  } catch { return false; }
}
function clearTabChoice() {
  try {
    if (typeof window.name === 'string' && window.name.startsWith(TAB_PREFIX)) {
      const old = JSON.parse(window.name.slice(TAB_PREFIX.length));
      window.name = typeof old.previousName === 'string' ? old.previousName : '';
    }
  } catch { /* A successful durable preference still takes precedence below. */ }
}
function readRecord() {
  if (typeof window === 'undefined') return null;
  const temporary = tabChoice();
  const inMemory = memoryOnly ? parseConsentRecord(memoryRecord) : null;
  const candidates = [temporary, inMemory];
  try { candidates.push(parseConsentRecord(window.localStorage.getItem(CONSENT_KEY))); } catch {}
  const valid = candidates.filter(Boolean);
  if (!valid.length) return null;
  const latest = Math.max(...valid.map(record => record.timestamp));
  // A direct choice can enable services for this document even when saving fails.
  // The tab fallback itself can only deny; it can never introduce a grant.
  if (inMemory?.timestamp === latest) return inMemory;
  const newest = valid.filter(record => record.timestamp === latest);
  return { version: CONSENT_VERSION, essential: true, ...Object.fromEntries(CONSENT_CATEGORIES.map(key => [key, newest.every(record => record[key])])), timestamp: latest, temporaryGuard: temporary?.timestamp === latest };

}
export function getConsent() { return flags(readRecord()); }
export function hasConsent(category) { return CONSENT_CATEGORIES.includes(category) && getConsent()[category] === true; }
export function subscribeConsent(callback) {
  if (typeof callback !== 'function') return () => {};
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
function announce(next) {
  for (const subscriber of subscribers) { try { subscriber({ ...next }); } catch { /* A widget cannot prevent preferences being applied. */ } }
}
export function safeTrackingUrl(value) {
  try {
    if (typeof value !== 'string' || !value.trim()) return '';
    const url = new URL(value, window.location.href);
    return ['https:', 'http:'].includes(url.protocol) ? (url.origin + url.pathname).slice(0, 500) : '';
  } catch { return ''; }
}
function googleConsent(next) {
  return { analytics_storage: next.analytics ? 'granted' : 'denied', ad_storage: next.advertising ? 'granted' : 'denied', ad_user_data: next.advertising ? 'granted' : 'denied', ad_personalization: next.advertising ? 'granted' : 'denied' };
}
function queueGoogle(...args) { try { window.gtag(...args); } catch { /* Tracking never governs access to the site or providers. */ } }
function installGoogleStub() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') window.gtag = function () { window.dataLayer.push(arguments); };
  if (!consentDefaultSet) { queueGoogle('consent', 'default', googleConsent(denied())); consentDefaultSet = true; }
  window.gtag_report_conversion = reportAffiliateConversion;
}
function insertProviderScript(key, src, attributes = {}) {
  if (providerScripts.has(key)) return;
  const script = document.createElement('script');
  script.async = true; script.src = src; script.dataset.consentProvider = key;
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
  providerScripts.set(key, script);
  script.onerror = () => { script.remove(); providerScripts.delete(key); };
  document.head.appendChild(script);
}
function applyGoogle(next) {
  installGoogleStub();
  window['ga-disable-' + GOOGLE_IDS.analytics] = !next.analytics;
  queueGoogle('consent', 'update', googleConsent(next));
  if (!next.advertising) { providerScripts.get('adsense')?.remove(); providerScripts.delete('adsense'); }
  if (!next.analytics && !next.advertising) { providerScripts.get('google-tag')?.remove(); providerScripts.delete('google-tag'); return; }
  if (!googleStarted) { queueGoogle('js', new Date()); googleStarted = true; }
  const page = { page_location: safeTrackingUrl(window.location.href), page_referrer: safeTrackingUrl(document.referrer || '') };
  if (next.analytics && !configured.has(GOOGLE_IDS.analytics)) {
    queueGoogle('config', GOOGLE_IDS.analytics, { ...page, send_page_view: false, allow_google_signals: next.advertising, allow_ad_personalization_signals: next.advertising });
    configured.add(GOOGLE_IDS.analytics);
    queueGoogle('event', 'page_view', { ...page, send_to: GOOGLE_IDS.analytics, page_title: document.title, ...landingContext() });
  }
  if (next.advertising && !configured.has(GOOGLE_IDS.advertising)) {
    queueGoogle('config', GOOGLE_IDS.advertising, { ...page, allow_ad_personalization_signals: true });
    configured.add(GOOGLE_IDS.advertising);
  }
  // One gtag library can serve both explicitly configured destinations.
  insertProviderScript('google-tag', 'https://www.googletagmanager.com/gtag/js?id=' + (next.analytics ? GOOGLE_IDS.analytics : GOOGLE_IDS.advertising));
  if (next.advertising && document.body?.dataset?.paidLanding !== 'true') insertProviderScript('adsense', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + GOOGLE_IDS.adsense, { crossorigin: 'anonymous' });
}
export function sendAnalyticsEvent(name, parameters = {}) {
  if (!hasConsent('analytics') || typeof window.gtag !== 'function') return false;
  queueGoogle('event', name, { ...parameters, send_to: GOOGLE_IDS.analytics });
  return true;
}
export function reportAffiliateConversion(context = {}) {
  if (hasConsent('advertising') && typeof window.gtag === 'function') queueGoogle('event', 'conversion', { send_to: GOOGLE_IDS.conversion, ...cleanLandingContext(context) });
  return true;
}
function scheduleExpiry() {
  if (expiryTimer !== null) window.clearTimeout(expiryTimer);
  const record = readRecord();
  if (record) expiryTimer = window.setTimeout(refreshConsent, Math.max(1, Math.min(2147483647, record.timestamp + CONSENT_MAX_AGE_MS - Date.now())));
  else if (CONSENT_CATEGORIES.some(key => previousFlags[key])) expiryTimer = window.setTimeout(refreshConsent, 1);
}
function element(id) { return document.getElementById(id); }
function showPreferenceFields(next) { for (const key of CONSENT_CATEGORIES) { const input = element('pref-' + key); if (input) input.checked = next[key]; } }
function renderBanner() {
  const banner = element('cookie-banner');
  if (!banner) return;
  const record = readRecord();
  banner.hidden = Boolean(record && !record.temporaryGuard);
  showPreferenceFields(flags(record));
  const close = element('cookie-close'); if (close) close.hidden = !record || record.temporaryGuard === true;
}
function applyChange(next, { reloadOnRevoke = true } = {}) {
  const before = previousFlags;
  previousFlags = { ...next };
  applyGoogle(next);
  if (CONSENT_CATEGORIES.some(key => before[key] !== next[key])) announce(next);
  scheduleExpiry();
  if (reloadOnRevoke && CONSENT_CATEGORIES.some(key => before[key] && !next[key])) window.location.reload();
}
export function saveConsent(next = {}) {
  const prior = readRecord();
  const record = { version: CONSENT_VERSION, essential: true, ...Object.fromEntries(CONSENT_CATEGORIES.map(key => [key, next[key] === true])), timestamp: Math.max(Date.now(), (prior?.timestamp ?? 0) + 1) };
  memoryRecord = record;
  let persisted = true, tabSaved = false, staleRecordRemoved = false;
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); memoryOnly = false; clearTabChoice(); }
  catch {
    memoryOnly = true; persisted = false;
    try { window.localStorage.removeItem(CONSENT_KEY); staleRecordRemoved = window.localStorage.getItem(CONSENT_KEY) === null; } catch {}
    tabSaved = saveTabChoice(record);
  }
  const status = element('cookie-storage-status');
  const revoked = CONSENT_CATEGORIES.some(key => previousFlags[key] && !record[key]);
  const canReload = persisted || tabSaved || staleRecordRemoved;
  if (status) status.textContent = persisted ? '' : tabSaved ? (revoked && !staleRecordRemoved ? 'This tab will keep optional services off after reload. An older saved choice may apply in other tabs or future visits; clear this site’s stored data to remove it.' : 'Your choices apply to this page. This tab will ask again after reload because the browser could not save them for future visits.') : revoked && !canReload ? 'Your choices apply to this page, but this browser could not save them. Clear this site’s stored data before reloading to avoid restoring an older choice.' : 'Your choices apply to this page. This browser could not save them for future visits.';
  renderBanner();
  if (!persisted) { element('cookie-banner').hidden = false; element('cookie-close').hidden = false; }
  const preferences = element('cookie-preferences'); if (preferences) preferences.hidden = true;
  const manage = element('cookie-manage'); if (manage) manage.setAttribute('aria-expanded', 'false');
  if (persisted) restoreFocus(); else element('cookie-close')?.focus({ preventScroll: true });
  applyChange(flags(record), { reloadOnRevoke: canReload });
  return { consent: flags(record), persisted, tabSaved };
}
export function openConsentPreferences(trigger) {
  const banner = element('cookie-banner'), preferences = element('cookie-preferences');
  if (!banner || !preferences) return;
  const candidate = trigger || document.activeElement;
  returnFocus = candidate && !banner.contains(candidate) ? candidate : null;
  banner.hidden = false; preferences.hidden = false;
  showPreferenceFields(getConsent());
  element('cookie-manage')?.setAttribute('aria-expanded', 'true');
  const record = readRecord();
  const close = element('cookie-close'); if (close) close.hidden = !record || record.temporaryGuard === true;
  element('pref-analytics')?.focus();
}
function restoreFocus() {
  const target = returnFocus && returnFocus.isConnected !== false && !element('cookie-banner')?.contains(returnFocus) ? returnFocus : element('main-content');
  target?.focus({ preventScroll: true }); returnFocus = null;
}
function closePreferences() {
  const record = readRecord();
  if (!record || record.temporaryGuard) return;
  element('cookie-banner').hidden = true;
  element('cookie-preferences').hidden = true;
  element('cookie-manage')?.setAttribute('aria-expanded', 'false');
  restoreFocus();
}
function refreshConsent() {
  const next = getConsent();
  applyChange(next);
  renderBanner();
}
export function initConsent() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;
  previousFlags = getConsent();
  applyGoogle(previousFlags);
  scheduleExpiry(); renderBanner();
  document.addEventListener('click', event => {
    const trigger = event.target?.closest?.('[data-open-consent]');
    if (trigger) { openConsentPreferences(trigger); return; }
    const button = event.target?.closest?.('button');
    if (button?.id === 'cookie-accept') saveConsent({ analytics: true, advertising: true, affiliate: true });
    else if (button?.id === 'cookie-reject') saveConsent(denied());
    else if (button?.id === 'cookie-save') saveConsent(Object.fromEntries(CONSENT_CATEGORIES.map(key => [key, element('pref-' + key)?.checked === true])));
    else if (button?.id === 'cookie-manage') openConsentPreferences(button);
    else if (button?.id === 'cookie-close') closePreferences();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !element('cookie-banner')?.hidden) closePreferences(); });
  window.addEventListener('storage', event => { try { if ('storageArea' in event && event.storageArea !== window.localStorage) return; } catch { return; } if (event.key === CONSENT_KEY || event.key === null) { memoryOnly = false; memoryRecord = null; if (event.newValue === null) clearTabChoice(); refreshConsent(); } });
  window.addEventListener('pageshow', refreshConsent);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshConsent(); });
  document.addEventListener('astro:page-load', () => { renderBanner(); refreshConsent(); });
}
