/* BanffBound's app cache contains published app assets only, never trip state. */
const CONFIG = __BANFFBOUND_CONFIG__;
const CACHE_PREFIX = 'banffbound-app-v1-';
const CACHE_NAME = CACHE_PREFIX + CONFIG.version;
const COMPLETE_URL = new URL('__offline_complete__', self.location.origin + CONFIG.base).href;
const INVENTORY = new Map(CONFIG.assets.map(asset => [new URL(asset.url, self.location.origin).href, asset]));
let warming;

async function hashResponse(response) {
  const bytes = await response.clone().arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return { size: bytes.byteLength, sha256: [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('') };
}

async function matches(response, asset) {
  if (!response || !response.ok || response.type === 'opaque') return false;
  const actual = await hashResponse(response);
  return actual.size === asset.size && actual.sha256 === asset.sha256;
}

async function completed(cache) {
  const marker = await cache.match(COMPLETE_URL);
  if (!marker) return null;
  try {
    const data = await marker.json();
    return data.version === CONFIG.version && Array.isArray(data.assets) && data.assets.length === CONFIG.assets.length ? data : null;
  } catch { return null; }
}

async function verifyAll(cache) {
  for (const asset of CONFIG.assets) {
    if (!(await matches(await cache.match(new URL(asset.url, self.location.origin).href), asset))) return false;
  }
  return true;
}

async function warm() {
  if (warming) return warming;
  warming = (async () => {
    const cache = await caches.open(CACHE_NAME);
    if (await completed(cache) && await verifyAll(cache)) return CONFIG.version;
    await cache.delete(COMPLETE_URL);
    let next = 0;
    async function worker() {
      while (next < CONFIG.assets.length) {
        const asset = CONFIG.assets[next++];
        const url = new URL(asset.url, self.location.origin).href;
        if (await matches(await cache.match(url), asset)) continue;
        const response = await fetch(url, { cache: 'reload', credentials: 'same-origin', redirect: 'follow' });
        const finalUrl = new URL(response.url || url);
        if (finalUrl.origin !== self.location.origin || !finalUrl.pathname.startsWith(CONFIG.base) || !(await matches(response, asset))) {
          throw new Error('An app download did not match the published version. Reconnect and try again.');
        }
        await cache.put(url, response);
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, CONFIG.assets.length) }, worker));
    if (!(await verifyAll(cache))) throw new Error('The saved app is incomplete. Free some storage and try again.');
    await cache.put(COMPLETE_URL, new Response(JSON.stringify({ version: CONFIG.version, completedAt: Date.now(), assets: CONFIG.assets.map(asset => asset.url) }), { headers: { 'content-type': 'application/json' } }));
    return CONFIG.version;
  })();
  try { return await warming; } finally { warming = undefined; }
}

self.addEventListener('install', event => {
  event.waitUntil(warm().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (!(await completed(cache)) || !(await verifyAll(cache))) throw new Error('Incomplete app cache cannot become active.');
    // Keep one earlier complete version for clients still using the previous app.
    const previous = [];
    for (const key of await caches.keys()) {
      if (!key.startsWith(CACHE_PREFIX) || key === CACHE_NAME) continue;
      const old = await caches.open(key);
      const marker = await old.match(COMPLETE_URL);
      if (!marker) { await caches.delete(key); continue; }
      try { previous.push({ key, date: (await marker.json()).completedAt || 0 }); }
      catch { await caches.delete(key); }
    }
    previous.sort((a, b) => b.date - a.date);
    await Promise.all(previous.slice(1).map(old => caches.delete(old.key)));
    await self.clients.claim();
  })());
});

async function cachedPublishedAsset(url) {
  const current = await caches.open(CACHE_NAME);
  if (await completed(current)) {
    const response = await current.match(url);
    if (response) return response;
  }
  for (const key of await caches.keys()) {
    if (!key.startsWith(CACHE_PREFIX) || key === CACHE_NAME) continue;
    const old = await caches.open(key);
    const marker = await old.match(COMPLETE_URL);
    if (!marker) continue;
    try {
      const data = await marker.json();
      if (!Array.isArray(data.assets) || !data.assets.some(asset => new URL(asset, self.location.origin).href === url)) continue;
      const response = await old.match(url);
      if (response) return response;
    } catch { /* An invalid cache is never an offline result. */ }
  }
  return null;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(CONFIG.base) || url.search) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) return response;
      } catch { /* Fall through to the complete offline app. */ }
      const path = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
      const target = new URL(path, self.location.origin).href;
      const page = INVENTORY.has(target) ? await cachedPublishedAsset(target) : null;
      return page || await cachedPublishedAsset(new URL('index.html', self.location.origin + CONFIG.base).href) || new Response('Reconnect to finish downloading BanffBound.', { status: 503, headers: { 'content-type': 'text/plain' } });
    })());
  } else if (INVENTORY.has(url.href)) {
    event.respondWith((async () => await cachedPublishedAsset(url.href) || fetch(request))());
  }
});

self.addEventListener('message', event => {
  const data = event.data;
  if (!data || typeof data.requestId !== 'string' || data.requestId.length > 150) return;
  const reply = message => {
    const payload = { requestId: data.requestId, version: CONFIG.version, ...message };
    if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
    else if (event.source && typeof event.source.postMessage === 'function') event.source.postMessage(payload);
  };
  if (data.type === 'CACHE_OFFLINE_PACK') {
    event.waitUntil(warm().then(() => reply({ type: 'OFFLINE_PACK_RESULT', success: true })).catch(error => reply({ type: 'OFFLINE_PACK_RESULT', success: false, error: error instanceof Error ? error.message : 'The app could not be saved offline.' })));
  } else if (data.type === 'GET_CACHE_STATUS') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const complete = Boolean(await completed(cache)) && await verifyAll(cache);
      reply({ type: 'OFFLINE_PACK_STATUS', complete });
    })().catch(() => reply({ type: 'OFFLINE_PACK_STATUS', complete: false })));
  }
});
