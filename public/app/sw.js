/* BanffBound's app cache contains published app assets only, never trip state. */
const CONFIG = {"version":"c1cd13644b44bb8af9e8","base":"/app/","assets":[{"url":"/app/_expo/static/js/web/index-65bd76e899dc283c372a02cc6a83e93d.js","size":3072,"sha256":"d67eabb1792a873dbfac255f4184bfeeb806886e307317d354f6906cca49f89d"},{"url":"/app/_expo/static/js/web/index-7c8d21e67d48514e9ed0aa40299fb6c8.js","size":2338174,"sha256":"159818f813ec2e47c353b20e12de79aaf005087a73593744a41b976902e609c1"},{"url":"/app/_expo/static/js/web/index-bfbbe110c63cc1bbcb51db726f3342d8.js","size":2066,"sha256":"db037a94835e5d3e3cd416a5682514d119bfafa723d63874f26c4cfa244b02bf"},{"url":"/app/_expo/static/js/web/index-f021dc33aed57228d4df7d81a97e1ef0.js","size":23664,"sha256":"7625035b38a133230f5959810821c971f0b0bcc778539744ddd5a82bd844767e"},{"url":"/app/assets/assets/canmore.8d28ecf7db9304ffc47debad232a1c70.jpg","size":150175,"sha256":"1129eafa217047332d5f9fb767ac5f47235af5b1f74173cb219317db7977ba52"},{"url":"/app/assets/assets/food.c83973fd8eebcd9099b9d0499353ead0.jpg","size":176106,"sha256":"ceff7f359aa6d92fe2f4004acffd06d24d57710695d18c816e28f0bac6aac72b"},{"url":"/app/assets/assets/gondola.980191b13fffb7533641149db409f65c.jpg","size":193197,"sha256":"3e4060e1aba1829427203ee50f2af10c95b0d347acedb6cfb79b1741e25c5d47"},{"url":"/app/assets/assets/icon.165639c28f2e497bdc6b1834560a0e6e.png","size":811414,"sha256":"9c35b869c300c1e1384c73acc52f117131f3e2dfc7e2159085de4044eef21a28"},{"url":"/app/assets/assets/lake.0bf878798691b725329f5982c3acf9d5.jpg","size":145567,"sha256":"a2150f76873025659e16dd940c7c55b77cfbb158349162fb9690f4325f9b6e9c"},{"url":"/app/assets/assets/moraine.fa21d4ec8f96afd11d755af2e3b42e25.jpg","size":195097,"sha256":"c146a80c5fecd7d3462003a0a9a34c9c1a7b802761d6ee81449dfa57c4bf9024"},{"url":"/app/assets/assets/town.a34857d61ae5f986a3768d6c31abf812.jpg","size":206763,"sha256":"5ef7d2ac41dbab94be9dda691e13a55d7de59679ed38b9e0ad24dc89f2206a4d"},{"url":"/app/assets/assets/winter.614d6d0ad246ff116f6b6d206a982e60.jpg","size":220971,"sha256":"9e351cb5dd44450e24e5a53248ec2917d89e83bebbfa733fe98700ca03eef149"},{"url":"/app/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","size":389724,"sha256":"fa2ab7d2557819b2bfe5009e46844efa7170cf177be7735d43aa2ac1295f1d54"},{"url":"/app/favicon.ico","size":14510,"sha256":"17fb0141ead74831f585f844a0dccffcd18be70d0c2c302c8d5e9214cef96cd1"},{"url":"/app/icons/icon-1024.png","size":811414,"sha256":"9c35b869c300c1e1384c73acc52f117131f3e2dfc7e2159085de4044eef21a28"},{"url":"/app/icons/icon-256.png","size":70440,"sha256":"a6cf2e1b818abedde44762749a00e0aacf9bdc8e2252a6057aadde96589f01f5"},{"url":"/app/index.html","size":2250,"sha256":"2be2277b36195e87b46c9b9015047e39c2ecf291575efd4c2087f8ad602a043d"},{"url":"/app/manifest.webmanifest","size":554,"sha256":"848f8e745add82c5c162ab8d4151f1b1b28daa000734fe362352efc2bab51f4c"},{"url":"/app/metadata.json","size":49,"sha256":"aa5f19cc84d41c0f8c70ececb2bc82e863227ea1e121632aca879eb616056991"},{"url":"/app/privacy/index.html","size":5389,"sha256":"b1f523f6b9c9bf2aebef56a27d0deff873eff30d597f1f4ffb059386a56bee24"},{"url":"/app/support/index.html","size":3088,"sha256":"d98d996c7e5d45407a91369d97b0e7a17a5ec0298dcdd5c7979b6b738f7d7784"},{"url":"/app/version.json","size":276,"sha256":"5e9edc7f1c06abee9a069b7d7634b2e74e602e700e916159712d379c50cc2f40"}]};
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
