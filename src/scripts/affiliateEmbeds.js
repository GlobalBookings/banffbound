import { hasConsent, subscribeConsent } from './consent.js';

// Fixed, reviewed provider configuration only. No URL or HTML is taken from a visitor.
const configurations = {
  'expedia-banner': {
    provider: 'expedia', src: 'https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js',
    className: 'eg-affiliate-banners', scriptClass: 'eg-affiliate-banners-script',
    attributes: { 'data-program': 'ca-expedia', 'data-network': 'pz', 'data-layout': 'leaderboard', 'data-image': 'mountains', 'data-message': 'bye-bye-bucket-list-hello-adventure', 'data-camref': '1101l3MtWX', 'data-pubref': '', 'data-link': 'home' },
  },
  'gyg-auto': {
    provider: 'getyourguide', src: 'https://widget.getyourguide.com/dist/pa.umd.production.min.js',
    attributes: { 'data-gyg-widget': 'auto', 'data-gyg-partner-id': 'QW960HO', 'data-gyg-cmp': 'banffboundblog' },
  },
  'gyg-activities': {
    provider: 'getyourguide', src: 'https://widget.getyourguide.com/dist/pa.umd.min.js',
    attributes: { 'data-gyg-href': 'https://widget.getyourguide.com/default/activities.frame', 'data-gyg-location-id': '284', 'data-gyg-locale-code': 'en-US', 'data-gyg-widget': 'activities', 'data-gyg-number-of-items': '9', 'data-gyg-partner-id': 'QW960HO' },
  },
};
const mounts = new Map();
const loaders = new Map();
let initialized = false;

function permitted() {
  try { return hasConsent('affiliate') === true; } catch { return false; }
}
function status(slot, message) {
  const node = slot.querySelector('[data-affiliate-status]');
  if (node) node.textContent = message;
}
function removeMount(slot, entry) {
  entry.target.remove();
  entry.mount.replaceChildren();
  entry.mount.hidden = true;
  slot.dataset.affiliateState = 'blocked';
  status(slot, 'Optional partner content is off. You can use the direct links without enabling it.');
  mounts.delete(slot);
}
function teardown() {
  for (const [slot, entry] of mounts) removeMount(slot, entry);
  for (const entry of loaders.values()) {
    entry.script.onload = null;
    entry.script.onerror = null;
    entry.script.remove();
  }
  loaders.clear();
  // Root's consent controller reloads on revocation. Removing nodes cannot undo
  // completed/in-flight requests or unload a provider's already-executed globals.
}
function providerStatus(provider, message) {
  for (const [slot, entry] of mounts) if (entry.config.provider === provider) status(slot, message);
}
function loadProvider(config) {
  if (!permitted() || loaders.has(config.provider)) return;
  const script = document.createElement('script');
  script.async = true;
  script.dataset.affiliateLoader = config.provider;
  if (config.scriptClass) script.className = config.scriptClass;
  if (config.provider === 'getyourguide') script.setAttribute('data-gyg-partner-id', 'QW960HO');
  const entry = { script };
  loaders.set(config.provider, entry);
  script.onload = () => {
    if (loaders.get(config.provider) !== entry || !permitted()) return;
    providerStatus(config.provider, 'Optional partner content has been requested. If it does not appear, use the direct links.');
  };
  script.onerror = () => {
    if (loaders.get(config.provider) !== entry) return;
    providerStatus(config.provider, 'Partner content could not load. The direct links remain available.');
  };
  // No external script src is assigned until permission has been checked.
  script.src = config.src;
  if (!permitted()) { loaders.delete(config.provider); return; }
  document.body.appendChild(script);
}
function synchronize() {
  if (!permitted()) { teardown(); return; }
  for (const [slot, entry] of mounts) if (!slot.isConnected) removeMount(slot, entry);
  const needed = new Map();
  for (const slot of document.querySelectorAll('[data-affiliate-embed]')) {
    const kind = slot.dataset.affiliateEmbed;
    const config = Object.hasOwn(configurations, kind) ? configurations[kind] : null;
    const mount = slot.querySelector('[data-affiliate-mount]');
    if (!config || !mount) continue;
    if (!mounts.has(slot)) {
      if (!permitted()) { teardown(); return; }
      const target = document.createElement('div');
      if (config.className) target.className = config.className;
      for (const [name, value] of Object.entries(config.attributes)) target.setAttribute(name, value);
      mount.appendChild(target);
      mount.hidden = false;
      slot.dataset.affiliateState = 'requested';
      status(slot, 'Loading optional partner content. Direct links remain available.');
      mounts.set(slot, { target, mount, config });
    }
    needed.set(config.provider, config);
  }
  // Every target is in place before its provider's single scanner/loader starts.
  for (const config of needed.values()) loadProvider(config);
}

export function initAffiliateEmbeds() {
  if (typeof document === 'undefined') return;
  if (!initialized) {
    initialized = true;
    document.addEventListener('astro:page-load', synchronize);
    document.addEventListener('astro:before-swap', teardown);
    subscribeConsent(synchronize);
  }
  synchronize();
}
