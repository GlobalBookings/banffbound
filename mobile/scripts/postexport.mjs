import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { sourceFingerprint } from './source-fingerprint.mjs';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.resolve(mobileRoot, process.argv[2] || 'dist');
const base = '/app/';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const pageCss = `:root{color-scheme:light;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#253d34;background:#f8f7f2}*{box-sizing:border-box}body{margin:0}main{max-width:780px;margin:auto;padding:32px 24px 60px}.brand{font-family:Georgia,serif;font-size:24px;font-weight:700;text-decoration:none}.eyebrow{margin-top:52px;color:#67796e;text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:700}h1{font-family:Georgia,serif;font-size:clamp(34px,7vw,52px);line-height:1.12;color:#163b31}h2{font-size:21px;margin-top:36px}.lead{font-size:20px;line-height:1.6;color:#53665a}p{line-height:1.8}a{color:#215a47;text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #b99150;outline-offset:5px}footer{margin-top:48px;padding-top:24px;border-top:1px solid #dbe1d7;display:flex;flex-wrap:wrap;gap:24px}footer a{padding:10px 0}`;

await mkdir(outputDir, { recursive: true });
const indexPath = path.join(outputDir, 'index.html');
let html;
try { html = await readFile(indexPath, 'utf8'); }
catch { throw new Error(`No Expo web export found at ${indexPath}. Run expo export --platform web --output-dir dist first.`); }

html = html.replace(/<title>[^<]*<\/title>/i, '').replace(/<meta\b[^>]*\bname=["'](?:description|theme-color|apple-mobile-web-app-capable|apple-mobile-web-app-title)["'][^>]*>/gi, '').replace(/<link\b[^>]*\brel=["'](?:canonical|manifest|apple-touch-icon)["'][^>]*>/gi, '').replace(/<script\b[^>]*\bid=["']banffbound-offline-registration["'][^>]*>[\s\S]*?<\/script>/gi, '');
const head = `<title>BanffBound — Your Banff trip, organised</title><meta name="description" content="Plan Banff, Lake Louise and Canmore with editable itineraries, saved places, practical guides and offline trip access."><meta name="theme-color" content="#163b31"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="BanffBound"><link rel="canonical" href="https://banffbound.com/app/"><link rel="manifest" href="/app/manifest.webmanifest"><link rel="apple-touch-icon" href="/app/icons/icon-256.png">`;
html = html.replace(/<\/head>/i, `${head}</head>`);
html = html.replace(/<noscript id="banffbound-fallback">[\s\S]*?<\/noscript>/gi, '');
html = html.replace(/<\/body>/i, '<noscript id="banffbound-fallback"><main><h1>BanffBound trip planner</h1><p>Enable JavaScript to use the trip companion, or <a href="https://banffbound.com/trip-builder/">use the BanffBound website planner</a>.</p></main></noscript></body>');
const registration = `<script id="banffbound-offline-registration">if('serviceWorker' in navigator){window.__banffboundOfflineReady=navigator.serviceWorker.register('/app/sw.js',{scope:'/app/'});window.__banffboundOfflineReady.catch(function(){/* Offline save explains retry when selected. */});}</script>`;
html = html.replace(/<\/body>/i, `${registration}</body>`);
html = html.replace(/[ \t]+$/gm, '');
await writeFile(indexPath, html);

for (const [name, source] of [['privacy', 'privacy.html'], ['support', 'support.html']]) {
  await mkdir(path.join(outputDir, name), { recursive: true });
  const page = (await readFile(path.join(mobileRoot, 'web', source), 'utf8')).replace('__BANFFBOUND_PAGE_CSS__', pageCss);
  await writeFile(path.join(outputDir, name, 'index.html'), page);
}
await mkdir(path.join(outputDir, 'icons'), { recursive: true });
// The source is a square 1024px PNG; its declared dimensions remain truthful.
await copyFile(path.join(mobileRoot, 'assets', 'icon.png'), path.join(outputDir, 'icons', 'icon-1024.png'));
await copyFile(path.join(mobileRoot, 'assets', 'favicon.png'), path.join(outputDir, 'icons', 'icon-256.png'));
const icon256 = await readFile(path.join(outputDir, 'icons', 'icon-256.png'));
if (icon256.length < 24 || icon256.toString('ascii', 1, 4) !== 'PNG') throw new Error('The web icon must be a valid PNG.');
const iconSize = `${icon256.readUInt32BE(16)}x${icon256.readUInt32BE(20)}`;
const manifest = { id: '/app/', name: 'BanffBound', short_name: 'BanffBound', description: 'Your Banff trip, organised and ready for the day.', start_url: '/app/', scope: '/app/', display: 'standalone', background_color: '#f8f7f2', theme_color: '#163b31', icons: [{ src: '/app/icons/icon-256.png', sizes: iconSize, type: 'image/png', purpose: 'any' }, { src: '/app/icons/icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' }] };
await writeFile(path.join(outputDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.')) throw new Error(`Hidden files must not ship in the app export: ${entry.name}`);
    const filePath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('The web export must not include symbolic links.');
    if (entry.isDirectory()) result.push(...await files(filePath));
    else if (entry.isFile()) result.push(filePath);
  }
  return result;
}
async function inventory() {
  const output = [];
  for (const filePath of await files(outputDir)) {
    const relative = path.relative(outputDir, filePath).split(path.sep).join('/');
    if (['sw.js', 'offline-manifest.json', 'version.json'].includes(relative)) continue;
    if (/\.(?:map|env|p8|p12|keystore)$/i.test(relative) || /(?:^|\/)(?:credentials|secrets)(?:\.|\/|$)/i.test(relative)) throw new Error(`Private or development file must not ship in app export: ${relative}`);
    const bytes = await readFile(filePath);
    output.push({ url: base + relative.split('/').map(encodeURIComponent).join('/'), size: bytes.length, sha256: sha256(bytes) });
  }
  return output;
}
const assets = await inventory();
const source = await sourceFingerprint(mobileRoot);
const version = sha256(JSON.stringify({ sourceFingerprint: source.fingerprint, assets })).slice(0, 20);
const packageJson = JSON.parse(await readFile(path.join(mobileRoot, 'package.json'), 'utf8'));
const receipt = { app: 'BanffBound', appVersion: packageJson.version, assetFingerprint: version, sourceFingerprint: source.fingerprint, sourceRevision: process.env.BANFFBOUND_SOURCE_REVISION || null, assetCount: assets.length, byteSize: assets.reduce((sum, asset) => sum + asset.size, 0), base };
await writeFile(path.join(outputDir, 'version.json'), JSON.stringify(receipt, null, 2) + '\n');
const versionBytes = await readFile(path.join(outputDir, 'version.json'));
assets.push({ url: '/app/version.json', size: versionBytes.length, sha256: sha256(versionBytes) });
const config = { version, base, assets };
await writeFile(path.join(outputDir, 'offline-manifest.json'), JSON.stringify(config, null, 2) + '\n');
const worker = (await readFile(path.join(mobileRoot, 'web', 'service-worker.js'), 'utf8')).replace('__BANFFBOUND_CONFIG__', JSON.stringify(config));
await writeFile(path.join(outputDir, 'sw.js'), worker);
console.log(JSON.stringify({ output: outputDir, version, sourceFingerprint: source.fingerprint, sourceFileCount: source.fileCount, assetCount: assets.length, bytes: assets.reduce((sum, asset) => sum + asset.size, 0), appUrl: 'https://banffbound.com/app/', deploymentStatus: 'local_export_only' }));
