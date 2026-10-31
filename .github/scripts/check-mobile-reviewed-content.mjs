#!/usr/bin/env node
// Reproduce the released mobile catalogue from its reviewed website snapshot.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, realpath, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { sourceFingerprint } from '../../mobile/scripts/source-fingerprint.mjs';

const root = await realpath(fileURLToPath(new URL('../../', import.meta.url)));
const pin = JSON.parse(await readFile(path.join(root, 'mobile/release/reviewed-content-source.json'), 'utf8'));
const snapshot = await realpath(process.argv[2] || path.join(root, '.reviewed-mobile-source'));
assert.notEqual(snapshot, root, 'Snapshot must be an independent ephemeral checkout.');
const git = (...args) => {
  const result = spawnSync('git', ['-C', snapshot, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};
assert.equal(await realpath(git('rev-parse', '--show-toplevel')), snapshot, 'Snapshot must be a separate Git checkout.');
assert.equal(git('rev-parse', 'HEAD'), pin.websiteRevision, 'Reviewed snapshot revision changed; review the pin explicitly.');
assert.equal(git('status', '--porcelain', '--untracked-files=all', '--ignored'), '', 'Disposable reviewed snapshot must contain no modified, untracked or ignored files.');
assert.equal((await lstat(path.join(snapshot, 'mobile'))).isSymbolicLink(), false, 'Snapshot mobile must not link to the working tree.');

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function literal(text, name, shape) {
  const match = text.match(new RegExp(`export const ${name}(?:[^=\\n]*)= (${shape === 'object' ? '\\{[\\s\\S]*?\\n\\}' : '\\[[\\s\\S]*?\\n\\]'});`));
  assert.ok(match, `Missing generated JSON literal: ${name}`);
  return JSON.parse(match[1]);
}
const mobile = path.join(root, 'mobile');
const before = await sourceFingerprint(mobile);
const currentCatalogue = await readFile(path.join(mobile, 'src/data/catalog.generated.ts'), 'utf8');
const baselineCatalogue = await readFile(path.join(snapshot, 'mobile/src/data/catalog.generated.ts'), 'utf8');
const currentProvenance = literal(currentCatalogue, 'contentProvenance', 'object');
const baselineProvenance = literal(baselineCatalogue, 'contentProvenance', 'object');
assert.equal(Object.keys(baselineProvenance).length, 12, 'Review the provenance schema before changing the pin.');
assert.deepEqual(Object.keys(currentProvenance).sort(), Object.keys(baselineProvenance).sort(), 'Review the complete provenance schema before changing the pin.');
for (const [file, expected] of Object.entries(currentProvenance)) {
  assert.match(expected, /^[a-f0-9]{64}$/);
  assert.equal(hash(await readFile(path.join(snapshot, file))), expected, `Reviewed input hash mismatch: ${file}`);
}
const photos = await readFile(path.join(snapshot, pin.photoCreditsFile));
assert.equal(hash(photos), pin.photoCreditsSha256, 'Reviewed photo credits hash mismatch.');
assert.deepEqual(literal(currentCatalogue, 'photoCredits', 'array'), JSON.parse(photos), 'Current photo credits differ from the reviewed snapshot.');

// This checkout is disposable. Overlay the actual PR mobile source, rather than
// accidentally checking the older mobile files that came with the website pin.
await rm(path.join(snapshot, 'mobile'), { recursive: true });
const excluded = new Set(['node_modules', '.expo', 'dist', 'dist-native', 'dist-map', 'ios', 'android', 'release']);
await cp(mobile, path.join(snapshot, 'mobile'), {
  recursive: true,
  filter: file => !excluded.has(path.relative(mobile, file).split(path.sep)[0]),
});
// Commerce is a separate published-source snapshot. Its focused provenance test
// needs this public pin, never the private/local release receipts alongside it.
await mkdir(path.join(snapshot, 'mobile/release'), { recursive: true });
await cp(path.join(mobile, 'release/reviewed-commerce-source.json'), path.join(snapshot, 'mobile/release/reviewed-commerce-source.json'));
assert.deepEqual(await sourceFingerprint(path.join(snapshot, 'mobile')), before, 'Snapshot must contain the exact current canonical mobile tree.');
await symlink(await realpath(path.join(root, 'node_modules')), path.join(snapshot, 'node_modules'), 'dir');
await symlink(await realpath(path.join(mobile, 'node_modules')), path.join(snapshot, 'mobile/node_modules'), 'dir');
const result = spawnSync(process.execPath, [path.join(snapshot, 'mobile/scripts/sync-content.mjs'), '--check'], {
  cwd: snapshot, stdio: 'inherit',
});
assert.equal(result.status, 0, 'Current generated app output differs from reviewed website content.');
const tests = spawnSync('npm', ['test', '--prefix', path.join(snapshot, 'mobile')], { cwd: snapshot, stdio: 'inherit' });
assert.equal(tests.status, 0, 'Current mobile tests must also pass in the reviewed website context.');
for (const file of pin.generatedOutputs) {
  assert.deepEqual(await readFile(path.join(snapshot, 'mobile/src/data', file)), await readFile(path.join(mobile, 'src/data', file)), `Generated output bytes changed: ${file}`);
}
assert.deepEqual(await sourceFingerprint(mobile), before, 'The check must never mutate current app inputs.');
console.log(JSON.stringify({ reviewedWebsiteRevision: pin.websiteRevision, verifiedProvenanceInputs: 12,
  photoCreditsSha256: pin.photoCreditsSha256, exactGeneratedOutputs: pin.generatedOutputs.length,
  mobileSourceUnchanged: true, mobileSource: before }, null, 2));
