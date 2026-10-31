import { createHash } from 'node:crypto';
import { readFile, readdir, lstat } from 'node:fs/promises';
import path from 'node:path';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const rootFiles = ['App.tsx', 'App.ts', 'App.jsx', 'App.js', 'index.ts', 'index.js', 'app.config.ts', 'app.config.js', 'app.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'eas.json', 'metro.config.js', 'metro.config.cjs', 'babel.config.js', 'babel.config.cjs', '.easignore'];

/** Fingerprint canonical app/build inputs; no generated output or release receipts. */
export async function sourceFingerprint(mobileRoot) {
  const entries = [];
  async function add(filePath) {
    const relative = path.relative(mobileRoot, filePath).split(path.sep).join('/');
    const info = await lstat(filePath);
    if (info.isSymbolicLink()) throw new Error(`App source must not contain symbolic links: ${relative}`);
    if (info.isDirectory()) {
      for (const child of (await readdir(filePath)).sort()) {
        if (child.startsWith('.') || /(?:^|[.-])test(?:[.-]|$)/i.test(child) || /(?:^|[.-])spec(?:[.-]|$)/i.test(child)) continue;
        await add(path.join(filePath, child));
      }
    } else if (info.isFile()) {
      entries.push({ path: relative, sha256: hash(await readFile(filePath)) });
    }
  }
  for (const name of rootFiles) {
    try { await add(path.join(mobileRoot, name)); }
    catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
  for (const name of ['src', 'assets', 'scripts', 'web']) {
    try { await add(path.join(mobileRoot, name)); }
    catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));
  if (!entries.some(entry => entry.path === 'package-lock.json') || !entries.some(entry => /^App\.[jt]sx?$/.test(entry.path))) throw new Error('App source fingerprint requires an app entry and dependency lock.');
  return { fingerprint: hash(JSON.stringify(entries)), fileCount: entries.length };
}
