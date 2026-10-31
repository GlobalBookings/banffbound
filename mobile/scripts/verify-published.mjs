import { createHash } from 'node:crypto';
import { readFile, readdir, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { sourceFingerprint } from './source-fingerprint.mjs';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const published = path.resolve(mobileRoot, process.argv[2] || '../public/app');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const config = JSON.parse(await readFile(path.join(published, 'offline-manifest.json'), 'utf8'));
const receipt = JSON.parse(await readFile(path.join(published, 'version.json'), 'utf8'));
const source = await sourceFingerprint(mobileRoot);
assert.equal(receipt.sourceFingerprint, source.fingerprint, 'Published app is stale: canonical mobile source/config/lock/assets changed after export. Re-export and publish the new app.');
assert.equal(config.base, '/app/');
assert.equal(receipt.base, '/app/');
assert.equal(receipt.app, 'BanffBound');
assert.equal(config.version, receipt.assetFingerprint, 'Offline worker and release receipt identify different versions.');
assert.ok(Array.isArray(config.assets) && config.assets.length > 0 && config.assets.length < 2000, 'Offline asset inventory must be bounded and non-empty.');
const expectedPaths = new Set(['sw.js', 'offline-manifest.json']);
const contentAssets = [];
let bytes = 0;
for (const asset of config.assets) {
  assert.equal(typeof asset.url, 'string');
  assert.ok(asset.url.startsWith('/app/') && !asset.url.includes('?') && !asset.url.includes('#'), 'Only published app URLs belong in the offline pack.');
  const relative = decodeURIComponent(asset.url.slice('/app/'.length));
  assert.ok(relative && !relative.split('/').some(part => part === '.' || part === '..' || part.startsWith('.')) && !relative.includes('\\'), 'Unsafe asset path.');
  assert.ok(!expectedPaths.has(relative), 'Offline asset inventory must not contain duplicates.');
  expectedPaths.add(relative);
  const filePath = path.resolve(published, relative);
  assert.ok(filePath.startsWith(published + path.sep), 'Offline asset escaped the published directory.');
  assert.ok((await lstat(filePath)).isFile(), 'Published assets must be ordinary files.');
  const content = await readFile(filePath);
  assert.equal(content.length, asset.size, `Wrong byte length for ${relative}`);
  assert.equal(hash(content), asset.sha256, `Wrong content hash for ${relative}`);
  bytes += content.length;
  if (relative !== 'version.json') contentAssets.push(asset);
}
assert.ok(expectedPaths.has('index.html') && expectedPaths.has('manifest.webmanifest') && expectedPaths.has('privacy/index.html') && expectedPaths.has('support/index.html') && expectedPaths.has('version.json'), 'App shell, manifest, support and privacy assets are required.');
assert.equal(receipt.assetCount, contentAssets.length);
assert.equal(receipt.byteSize, contentAssets.reduce((sum, asset) => sum + asset.size, 0));
assert.equal(hash(JSON.stringify({ sourceFingerprint: source.fingerprint, assets: contentAssets })).slice(0, 20), config.version, 'Release fingerprint does not match the complete asset inventory.');
const expectedWorker = (await readFile(path.join(mobileRoot, 'web', 'service-worker.js'), 'utf8')).replace('__BANFFBOUND_CONFIG__', JSON.stringify(config));
assert.equal(await readFile(path.join(published, 'sw.js'), 'utf8'), expectedWorker, 'Published service worker does not match the reviewed source and inventory.');
async function checkTree(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), 'Published export must not contain symbolic links.');
    if (entry.isDirectory()) await checkTree(full);
    else assert.ok(expectedPaths.has(path.relative(published, full).split(path.sep).join('/')), `Unlisted file must not ship: ${path.relative(published, full)}`);
  }
}
await checkTree(published);
const html = await readFile(path.join(published, 'index.html'), 'utf8');
assert.match(html, /https:\/\/banffbound\.com\/app\//);
assert.match(html, /register\('\/app\/sw\.js',\{scope:'\/app\/'\}\)/);
console.log(JSON.stringify({ verified: true, published, version: config.version, sourceFingerprint: source.fingerprint, sourceFileCount: source.fileCount, assetCount: config.assets.length, bytes }));
