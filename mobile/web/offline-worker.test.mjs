import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { createHash, webcrypto } from 'node:crypto';
import { readFile, writeFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { sourceFingerprint } from '../scripts/source-fingerprint.mjs';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workerSource = await readFile(path.join(mobileRoot, 'web/service-worker.js'), 'utf8');
const origin = 'https://banffbound.test';
const digest = value => createHash('sha256').update(value).digest('hex');
const bodies = new Map([
  ['/app/index.html', '<html>BanffBound trip planner</html>'],
  ['/app/main.js', 'console.log("published app")'],
  ['/app/privacy/index.html', '<html>App privacy</html>']
]);

class MemoryCache {
  values = new Map();
  async match(url) { return this.values.get(String(url))?.clone(); }
  async put(url, response) { this.values.set(String(url), response.clone()); }
  async delete(url) { return this.values.delete(String(url)); }
}
class MemoryCacheStorage {
  values = new Map();
  async open(name) { if (!this.values.has(name)) this.values.set(name, new MemoryCache()); return this.values.get(name); }
  async keys() { return [...this.values.keys()]; }
  async delete(name) { return this.values.delete(name); }
}
function setup({ version = 'test-version', storage = new MemoryCacheStorage(), badPath, offline = false } = {}) {
  const listeners = new Map();
  const fetched = [];
  const config = { version, base: '/app/', assets: [...bodies].map(([url, body]) => ({ url, size: Buffer.byteLength(body), sha256: digest(body) })) };
  let skipped = false;
  let claimed = false;
  let networkOffline = offline;
  const context = {
    URL, Response, crypto: webcrypto, caches: storage, console,
    fetch: async request => {
      const url = new URL(typeof request === 'string' ? request : request.url);
      fetched.push(url.href);
      if (networkOffline) throw new Error('offline');
      const body = url.pathname === badPath ? '<html>Unexpected host fallback</html>' : bodies.get(url.pathname);
      return new Response(body || 'not found', { status: body ? 200 : 404 });
    },
    self: {
      location: { origin },
      addEventListener: (name, fn) => listeners.set(name, fn),
      skipWaiting: async () => { skipped = true; },
      clients: { claim: async () => { claimed = true; } }
    }
  };
  vm.runInNewContext(workerSource.replace('__BANFFBOUND_CONFIG__', JSON.stringify(config)), context, { filename: 'service-worker.js' });
  async function lifetime(name, data = {}) {
    let waiting;
    listeners.get(name)({ ...data, waitUntil: promise => { waiting = promise; } });
    await waiting;
  }
  async function message(type) {
    let payload;
    await lifetime('message', { data: { type, requestId: 'test-request' }, ports: [{ postMessage: data => { payload = data; } }] });
    return payload;
  }
  async function request(url, mode = 'cors', method = 'GET') {
    let response;
    listeners.get('fetch')({ request: { url: new URL(url, origin).href, method, mode }, respondWith: promise => { response = promise; } });
    return response ? await response : undefined;
  }
  return { config, storage, fetched, lifetime, message, request, setOffline: value => { networkOffline = value; }, get skipped() { return skipped; }, get claimed() { return claimed; } };
}

test('installs only a hash-verified complete app and confirms explicit offline save', async () => {
  const app = setup();
  await app.lifetime('install');
  await app.lifetime('activate');
  assert.equal(app.skipped, true);
  assert.equal(app.claimed, true);
  assert.equal(app.fetched.length, bodies.size);
  app.setOffline(true);
  const result = await app.message('CACHE_OFFLINE_PACK');
  assert.equal(result.success, true);
  assert.equal(result.requestId, 'test-request');
  assert.equal(result.version, 'test-version');
  assert.equal((await app.message('GET_CACHE_STATUS')).complete, true);
});

test('wrong host fallback cannot mark an incomplete download successful or remove the prior version', async () => {
  const storage = new MemoryCacheStorage();
  const old = setup({ version: 'previous', storage });
  await old.lifetime('install');
  const app = setup({ version: 'replacement', storage, badPath: '/app/main.js' });
  await assert.rejects(app.lifetime('install'), /did not match/);
  assert.equal(app.skipped, false);
  assert.equal((await app.message('CACHE_OFFLINE_PACK')).success, false);
  assert.equal((await old.message('GET_CACHE_STATUS')).complete, true);
  assert.ok((await storage.keys()).includes('banffbound-app-v1-previous'));
});

test('cached marker alone cannot produce a successful status after an asset is lost', async () => {
  const app = setup();
  await app.lifetime('install');
  const cache = await app.storage.open('banffbound-app-v1-test-version');
  await cache.delete(origin + '/app/main.js');
  app.setOffline(true);
  assert.equal((await app.message('GET_CACHE_STATUS')).complete, false);
  assert.equal((await app.message('CACHE_OFFLINE_PACK')).success, false);
});

test('does not intercept third-party links, private exports, other site paths, query strings or writes', async () => {
  const app = setup();
  for (const url of ['https://provider.test/book', '/privacy/', '/app/my-trip-private.json', '/app/main.js?notes=private']) assert.equal(await app.request(url), undefined);
  assert.equal(await app.request('/app/main.js', 'cors', 'POST'), undefined);
  assert.equal(app.fetched.length, 0);
});

test('offline navigation serves the requested published page or the app shell inside its own scope', async () => {
  const app = setup();
  await app.lifetime('install');
  app.setOffline(true);
  assert.match(await (await app.request('/app/privacy/', 'navigate')).text(), /App privacy/);
  assert.match(await (await app.request('/app/unknown-route', 'navigate')).text(), /trip planner/);
  assert.equal(await app.request('/contact/', 'navigate'), undefined);
});

test('only retires older caches after the new version is complete', async () => {
  const storage = new MemoryCacheStorage();
  for (const version of ['oldest', 'previous', 'current']) {
    const app = setup({ version, storage });
    await app.lifetime('install');
    if (version === 'current') await app.lifetime('activate');
    await new Promise(resolve => setTimeout(resolve, 2));
  }
  const names = await storage.keys();
  assert.ok(names.includes('banffbound-app-v1-current'));
  assert.ok(names.includes('banffbound-app-v1-previous'));
  assert.ok(!names.includes('banffbound-app-v1-oldest'));
});

test('postexport produces stable app metadata, scoped cache hashes and no invented deployment receipt', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'banffbound-web-test-'));
  try {
    await writeFile(path.join(dir, 'index.html'), '<html><head><title>Expo</title><meta name="description" content="default"></head><body><div id="root"></div><script src="/app/main.js"></script></body></html>');
    await writeFile(path.join(dir, 'main.js'), 'console.log("BanffBound")');
    function run() { return spawnSync(process.execPath, [path.join(mobileRoot, 'scripts/postexport.mjs'), dir], { encoding: 'utf8' }); }
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const report = JSON.parse(first.stdout.trim());
    assert.equal(report.deploymentStatus, 'local_export_only');
    assert.match(report.sourceFingerprint, /^[a-f0-9]{64}$/);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');
    assert.equal((html.match(/<title>/g) || []).length, 1);
    assert.equal((html.match(/name="description"/g) || []).length, 1);
    assert.match(html, /register\('\/app\/sw\.js',\{scope:'\/app\/'\}\)/);
    const manifest = JSON.parse(await readFile(path.join(dir, 'offline-manifest.json'), 'utf8'));
    for (const asset of manifest.assets) {
      assert.ok(asset.url.startsWith('/app/'));
      const bytes = await readFile(path.join(dir, decodeURIComponent(asset.url.slice('/app/'.length))));
      assert.equal(bytes.length, asset.size);
      assert.equal(digest(bytes), asset.sha256);
    }
    const second = run();
    assert.equal(second.status, 0, second.stderr);
    assert.equal(JSON.parse(second.stdout.trim()).version, report.version);
    const verify = () => spawnSync(process.execPath, [path.join(mobileRoot, 'scripts/verify-published.mjs'), dir], { encoding: 'utf8' });
    const verified = verify();
    assert.equal(verified.status, 0, verified.stderr);
    await writeFile(path.join(dir, 'main.js'), 'console.log("unexpected edit")');
    assert.notEqual(verify().status, 0, 'Corrupted published JavaScript must block deployment.');
    await writeFile(path.join(dir, 'main.js'), 'console.log("BanffBound")');
    const receipt = JSON.parse(await readFile(path.join(dir, 'version.json'), 'utf8'));
    await writeFile(path.join(dir, 'version.json'), JSON.stringify({ ...receipt, sourceFingerprint: '0'.repeat(64) }));
    const stale = verify();
    assert.notEqual(stale.status, 0);
    assert.match(stale.stderr, /Published app is stale/);
    await writeFile(path.join(dir, '.env'), 'DO_NOT_PUBLISH');
    const invalid = run();
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Hidden files must not ship/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('source fingerprint excludes output, tests and receipts but detects app/config/lock changes', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'banffbound-source-test-'));
  try {
    await writeFile(path.join(dir, 'App.tsx'), 'export default function App() {}');
    await writeFile(path.join(dir, 'package-lock.json'), '{"lockfileVersion":3}');
    for (const name of ['src', 'release', 'tests', 'dist', 'node_modules']) await mkdir(path.join(dir, name));
    await writeFile(path.join(dir, 'src/value.ts'), 'export const value = 1;');
    const before = await sourceFingerprint(dir);
    for (const name of ['release/receipt.json', 'tests/value.test.ts', 'dist/index.html', 'node_modules/generated.js']) await writeFile(path.join(dir, name), 'generated output');
    await writeFile(path.join(dir, 'src/value.test.ts'), 'test output');
    assert.equal((await sourceFingerprint(dir)).fingerprint, before.fingerprint);
    await writeFile(path.join(dir, 'src/value.ts'), 'export const value = 2;');
    assert.notEqual((await sourceFingerprint(dir)).fingerprint, before.fingerprint);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('the website worker retains app and foreign caches and leaves app navigation to its own worker', async () => {
  const source = await readFile(path.resolve(mobileRoot, '../public/sw.js'), 'utf8');
  const storage = new MemoryCacheStorage();
  for (const name of ['banffbound-v1', 'banffbound-v2', 'banffbound-app-v1-complete', 'unrelated-cache']) await storage.open(name);
  const listeners = new Map();
  let claimed = false;
  vm.runInNewContext(source, {
    URL, caches: storage, fetch: async () => new Response('website network page'),
    self: {
      addEventListener: (name, fn) => listeners.set(name, fn),
      skipWaiting: () => {},
      clients: { claim: () => { claimed = true; } }
    }
  });
  let activation;
  listeners.get('activate')({ waitUntil: promise => { activation = promise; } });
  await activation;
  assert.equal(claimed, true);
  assert.deepEqual((await storage.keys()).sort(), ['banffbound-app-v1-complete', 'banffbound-v2', 'unrelated-cache'].sort());
  for (const appUrl of ['/app/', '/app/privacy/', '/app/main.js']) {
    let intercepted = false;
    listeners.get('fetch')({ request: { url: origin + appUrl, mode: 'navigate' }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false, `Website worker must not intercept ${appUrl}`);
  }
  let websiteResponse;
  listeners.get('fetch')({ request: { url: origin + '/hiking', mode: 'navigate' }, respondWith: value => { websiteResponse = value; } });
  assert.equal(await (await websiteResponse).text(), 'website network page');
});
