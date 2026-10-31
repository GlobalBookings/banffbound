/* BanffBound's app cache contains published app assets only, never trip state. */
const CONFIG = {"version":"6002d4d1c17f19716ae3","base":"/app/","assets":[{"url":"/app/_expo/static/js/web/index-12551c741dc1098fef92fe4522d30324.js","size":756860,"sha256":"87fdf04f2ff0cae1df2b1a366a5061e9b30e6dcb0e902bc3ae9d0b17dce0e343"},{"url":"/app/_expo/static/js/web/index-19d6c1adfac8de164493383171d1f3fd.js","size":2066,"sha256":"9d49e30768fa74cd8c1c4ef9689112330b8e1e052d438d5963dd91050379a9b8"},{"url":"/app/_expo/static/js/web/index-403c5d7b61bed49f165c79c5b7a8b596.js","size":4053,"sha256":"c207e532bb1e3a6209694f1be4f2404589b1a1ac0fa048d55279896b9ef1e66c"},{"url":"/app/_expo/static/js/web/index-9db43e5cff903d2613d205b6705de960.js","size":23664,"sha256":"7c1d7aae79d57fb4a48676864a652f5030a31714c3fd5aa49e81cc374ae3159a"},{"url":"/app/assets/assets/canmore.8d28ecf7db9304ffc47debad232a1c70.jpg","size":150175,"sha256":"1129eafa217047332d5f9fb767ac5f47235af5b1f74173cb219317db7977ba52"},{"url":"/app/assets/assets/food.c83973fd8eebcd9099b9d0499353ead0.jpg","size":176106,"sha256":"ceff7f359aa6d92fe2f4004acffd06d24d57710695d18c816e28f0bac6aac72b"},{"url":"/app/assets/assets/gondola.980191b13fffb7533641149db409f65c.jpg","size":193197,"sha256":"3e4060e1aba1829427203ee50f2af10c95b0d347acedb6cfb79b1741e25c5d47"},{"url":"/app/assets/assets/icon.e6e83418fcec0458efdbc106bca7c2fd.png","size":8422,"sha256":"a908fb0b8fabc0f61f9c31eb2ce4e73823385fce1c04cf803e5ac5b7d2435791"},{"url":"/app/assets/assets/lake.0bf878798691b725329f5982c3acf9d5.jpg","size":145567,"sha256":"a2150f76873025659e16dd940c7c55b77cfbb158349162fb9690f4325f9b6e9c"},{"url":"/app/assets/assets/moraine.fa21d4ec8f96afd11d755af2e3b42e25.jpg","size":195097,"sha256":"c146a80c5fecd7d3462003a0a9a34c9c1a7b802761d6ee81449dfa57c4bf9024"},{"url":"/app/assets/assets/town.a34857d61ae5f986a3768d6c31abf812.jpg","size":206763,"sha256":"5ef7d2ac41dbab94be9dda691e13a55d7de59679ed38b9e0ad24dc89f2206a4d"},{"url":"/app/assets/assets/winter.614d6d0ad246ff116f6b6d206a982e60.jpg","size":220971,"sha256":"9e351cb5dd44450e24e5a53248ec2917d89e83bebbfa733fe98700ca03eef149"},{"url":"/app/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","size":389724,"sha256":"fa2ab7d2557819b2bfe5009e46844efa7170cf177be7735d43aa2ac1295f1d54"},{"url":"/app/favicon.ico","size":14510,"sha256":"4dac0faebf62c07eb2a6198ac1cbd5d023717170312c1ee6ddc11fac4560a57c"},{"url":"/app/icons/icon-1024.png","size":8422,"sha256":"a908fb0b8fabc0f61f9c31eb2ce4e73823385fce1c04cf803e5ac5b7d2435791"},{"url":"/app/icons/icon-256.png","size":1686,"sha256":"d47eb5117755891e317bd8222051b2d47d5c522160515bfa43d82fa18054e707"},{"url":"/app/index.html","size":2250,"sha256":"45f24e7bea1bc6027fa9ccfecee9457ae7556b5bf1ea72ce446906a3836a3699"},{"url":"/app/manifest.webmanifest","size":554,"sha256":"848f8e745add82c5c162ab8d4151f1b1b28daa000734fe362352efc2bab51f4c"},{"url":"/app/metadata.json","size":49,"sha256":"aa5f19cc84d41c0f8c70ececb2bc82e863227ea1e121632aca879eb616056991"},{"url":"/app/privacy/index.html","size":4711,"sha256":"63d6ddc3d7bf96fa5d917e19bdb84795f7bf6f691d443d59c4910e01ee326af8"},{"url":"/app/support/index.html","size":3129,"sha256":"e7479b3f354562fa86b0438ee8569af4459e1fd5d20e4c83bcc71094028e359a"},{"url":"/app/version.json","size":276,"sha256":"f611d294257562e9f61bb699e09920b319005fa89fc5e9f39c24f61216ad80ee"}]};
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
