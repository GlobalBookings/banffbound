/* BanffBound's app cache contains published app assets only, never trip state. */
const CONFIG = {"version":"69f9c2d4ef82c9147c37","base":"/app/","assets":[{"url":"/app/_expo/static/js/web/index-01b9e61a3e5b0ee110658eaa6f15236a.js","size":3338811,"sha256":"fd2b549e9efd510010236c8fec8ef1fd757063379ba717df103a78fa9cc8678b"},{"url":"/app/_expo/static/js/web/index-c2fb8d2ef1b1500955e007c1b004b64c.js","size":2066,"sha256":"323e5e40c40b7595fd88a48e0aef622d844a97017c06ac4fa378be8aafc783e9"},{"url":"/app/_expo/static/js/web/index-ceca340f027d650cdab93acd999b2da6.js","size":3072,"sha256":"0feea8fe116c022b991e2b0da8a3a96262c982fa9f8739cab816c08a2a536df4"},{"url":"/app/_expo/static/js/web/index-f8cb8626204fc35c218e05621c4732a3.js","size":23664,"sha256":"f1fb34c1af07e325309fef090be5bfb6bedc80effa9dda377ed4b29b3a92b66a"},{"url":"/app/assets/assets/canmore.8d28ecf7db9304ffc47debad232a1c70.jpg","size":150175,"sha256":"1129eafa217047332d5f9fb767ac5f47235af5b1f74173cb219317db7977ba52"},{"url":"/app/assets/assets/food.c83973fd8eebcd9099b9d0499353ead0.jpg","size":176106,"sha256":"ceff7f359aa6d92fe2f4004acffd06d24d57710695d18c816e28f0bac6aac72b"},{"url":"/app/assets/assets/gondola.980191b13fffb7533641149db409f65c.jpg","size":193197,"sha256":"3e4060e1aba1829427203ee50f2af10c95b0d347acedb6cfb79b1741e25c5d47"},{"url":"/app/assets/assets/icon.165639c28f2e497bdc6b1834560a0e6e.png","size":811414,"sha256":"9c35b869c300c1e1384c73acc52f117131f3e2dfc7e2159085de4044eef21a28"},{"url":"/app/assets/assets/lake.0bf878798691b725329f5982c3acf9d5.jpg","size":145567,"sha256":"a2150f76873025659e16dd940c7c55b77cfbb158349162fb9690f4325f9b6e9c"},{"url":"/app/assets/assets/moraine.fa21d4ec8f96afd11d755af2e3b42e25.jpg","size":195097,"sha256":"c146a80c5fecd7d3462003a0a9a34c9c1a7b802761d6ee81449dfa57c4bf9024"},{"url":"/app/assets/assets/town.a34857d61ae5f986a3768d6c31abf812.jpg","size":206763,"sha256":"5ef7d2ac41dbab94be9dda691e13a55d7de59679ed38b9e0ad24dc89f2206a4d"},{"url":"/app/assets/assets/winter.614d6d0ad246ff116f6b6d206a982e60.jpg","size":220971,"sha256":"9e351cb5dd44450e24e5a53248ec2917d89e83bebbfa733fe98700ca03eef149"},{"url":"/app/assets/node_modules/%40expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","size":389724,"sha256":"fa2ab7d2557819b2bfe5009e46844efa7170cf177be7735d43aa2ac1295f1d54"},{"url":"/app/favicon.ico","size":14510,"sha256":"17fb0141ead74831f585f844a0dccffcd18be70d0c2c302c8d5e9214cef96cd1"},{"url":"/app/icons/icon-1024.png","size":811414,"sha256":"9c35b869c300c1e1384c73acc52f117131f3e2dfc7e2159085de4044eef21a28"},{"url":"/app/icons/icon-256.png","size":70440,"sha256":"a6cf2e1b818abedde44762749a00e0aacf9bdc8e2252a6057aadde96589f01f5"},{"url":"/app/index.html","size":2250,"sha256":"55e6b910205f5f4d5207f190b49d648d7ff4af556ba6a122a220b8fcf1f1fef8"},{"url":"/app/manifest.webmanifest","size":554,"sha256":"848f8e745add82c5c162ab8d4151f1b1b28daa000734fe362352efc2bab51f4c"},{"url":"/app/map-data/LICENCE.txt","size":1544,"sha256":"fb72b4cd8a31474954aa10c2d2ac63684a8926ca7d5c3f6ed608246f886c3874"},{"url":"/app/map-data/osm-points.json","size":847104,"sha256":"d332c3af6dd882de4e09df4a6c20ddedae2f2ad528fbe1a5d69fcf606a657f18"},{"url":"/app/map-data/osm-source.json","size":431217,"sha256":"2f53efb1cdf98a6784393e56784197e575426c3622b173a9729264754a5b5b78"},{"url":"/app/metadata.json","size":49,"sha256":"aa5f19cc84d41c0f8c70ececb2bc82e863227ea1e121632aca879eb616056991"},{"url":"/app/privacy/index.html","size":5754,"sha256":"ebe38f7b406dd931ec32734711a2f23011838eb57eec49a50f07dd4a4a791ca2"},{"url":"/app/support/index.html","size":3088,"sha256":"d98d996c7e5d45407a91369d97b0e7a17a5ec0298dcdd5c7979b6b738f7d7784"},{"url":"/app/version.json","size":276,"sha256":"1b921397ccf1bc44319ffa4ac2d77fcf84bd2d1506f51cda7c42a8b91c946cb8"}]};
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
