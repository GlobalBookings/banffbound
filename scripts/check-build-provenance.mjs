import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { build } from 'esbuild';

// Every write/Git mutation is confined to disposable fixtures, never the app checkout.
const runFile = promisify(execFile);
const compile = async entry => {
  const output = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
};
const { createBuildProvenance, validSourceRevision } = await compile('src/utils/buildProvenance.ts');
const endpoint = await compile('src/pages/build-info.json.ts');
const scratch = await mkdtemp(path.join(os.tmpdir(), 'banff-build-provenance-'));
const timestamp = new Date('2026-10-29T12:34:56.000Z');
const fixtureFiles = [
  ['src/pages/z.astro', '<p>Z</p>\n'], ['src/pages/a.astro', '<p>A</p>\n'],
  ['src/scripts/consent.js', 'export const allowed = false;\n'], ['src/data/photos.json', '{"items":[]}\n'],
  ['src/styles/main.css', 'body { color: black; }\n'], ['src/data/model.ts', 'export const value = 1;\n'],
  ['src/data/redirects.mjs', 'export default {};\n'],
  ['astro.config.mjs', 'export default {};\n'], ['package.json', '{"name":"fixture"}\n'],
  ['package-lock.json', '{"name":"fixture","lockfileVersion":3}\n'], ['public/llms.txt', 'Fixture public index.\n'],
];
const publicKeys = ['builtAtUTC', 'formatVersion', 'scope', 'scopeNote', 'sourceFingerprint', 'sourceRevision'];
async function put(root, relativePath, bytes) {
  const filename = path.join(root, relativePath);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, bytes);
}
async function fixture(name, reversed = false) {
  const root = path.join(scratch, name);
  await mkdir(root);
  for (const [relativePath, bytes] of reversed ? [...fixtureFiles].reverse() : fixtureFiles) await put(root, relativePath, bytes);
  return root;
}
const receipt = root => createBuildProvenance(root, timestamp);
async function fixtureGit(root, args) {
  const result = await runFile('git', args, { cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH, GIT_OPTIONAL_LOCKS: '0' } });
  return result.stdout.trim();
}
function assertPublic(value) {
  assert.deepEqual(Object.keys(value).sort(), publicKeys);
  assert.equal(value.formatVersion, 1);
  assert.equal(value.scope, 'app-source-v2');
  assert.match(value.scopeNote, /excludes volatile snapshots, assets/);
  assert.match(value.sourceFingerprint, /^[a-f0-9]{64}$/);
  assert.ok(value.sourceRevision === null || /^[a-f0-9]{40}$/.test(value.sourceRevision));
  assert.equal(value.builtAtUTC, timestamp.toISOString());
  const serialized = JSON.stringify(value);
  assert.ok(!serialized.includes(scratch) && !serialized.includes('src/pages/') && !serialized.includes('DO_NOT_PUBLISH_FIXTURE_SECRET'));
}

try {
  const first = await fixture('first');
  const second = await fixture('second', true);
  const original = await receipt(first);
  assertPublic(original);
  assert.equal(original.sourceRevision, null, 'Gitless fixture must not inherit a parent/hosted revision.');
  assert.equal((await receipt(second)).sourceFingerprint, original.sourceFingerprint, 'Path ordering and absolute fixture location must not change the digest.');

  await put(first, 'src/pages/a.astro', '<p>Changed A</p>\n');
  assert.notEqual((await receipt(first)).sourceFingerprint, original.sourceFingerprint, 'A selected byte change must be detected.');
  await put(first, 'src/pages/a.astro', fixtureFiles[1][1]);
  await rename(path.join(first, 'src/pages/a.astro'), path.join(first, 'src/pages/renamed.astro'));
  assert.notEqual((await receipt(first)).sourceFingerprint, original.sourceFingerprint, 'Paths are part of the digest.');
  await rename(path.join(first, 'src/pages/renamed.astro'), path.join(first, 'src/pages/a.astro'));
  await put(first, 'src/pages/.well-known/status.ts', 'export const publicStatus = true;');
  assert.notEqual((await receipt(first)).sourceFingerprint, original.sourceFingerprint, 'Legitimate dot-prefixed public routes remain app source.');
  await rm(path.join(first, 'src/pages/.well-known/status.ts'));

  // Identical concatenated bytes split differently must remain different framed inputs.
  await put(first, 'src/data/a.ts', 'ab'); await put(first, 'src/data/b.ts', 'c');
  const framed = (await receipt(first)).sourceFingerprint;
  await put(first, 'src/data/a.ts', 'a'); await put(first, 'src/data/b.ts', 'bc');
  assert.notEqual((await receipt(first)).sourceFingerprint, framed);
  await rm(path.join(first, 'src/data/a.ts')); await rm(path.join(first, 'src/data/b.ts'));

  for (const relativePath of ['src/scripts/consent.js', 'src/data/photos.json']) {
    const before = await receipt(first);
    const original = await readFile(path.join(first, relativePath));
    await put(first, relativePath, Buffer.concat([original, Buffer.from(' ')]));
    assert.notEqual((await receipt(first)).sourceFingerprint, before.sourceFingerprint, 'Runtime JavaScript and imported source JSON must be covered.');
    await put(first, relativePath, original);
  }
  for (const relativePath of ['astro.config.mjs', 'package.json', 'package-lock.json', 'public/llms.txt']) {
    const bytes = await readFile(path.join(first, relativePath));
    await put(first, relativePath, Buffer.concat([bytes, Buffer.from('\nchanged')]));
    assert.notEqual((await receipt(first)).sourceFingerprint, original.sourceFingerprint, `Explicit root input is selected: ${relativePath}`);
    await put(first, relativePath, bytes);
  }
  const lockfile = await readFile(path.join(first, 'package-lock.json'));
  await rm(path.join(first, 'package-lock.json'));
  const missing = (await receipt(first)).sourceFingerprint;
  await put(first, 'package-lock.json', '');
  assert.notEqual((await receipt(first)).sourceFingerprint, missing, 'Missing and empty explicit inputs have different framed states.');
  await put(first, 'package-lock.json', lockfile);

  const ignored = ['src/data/live/snow-report.ts', 'src/data/live/nested/roads.mjs', 'src/assets/photo.css', 'src/private/credentials.ts', 'src/env/config.ts', 'src/.env.ts', 'src/pages/example.private.ts', 'src/generated/app.ts', 'src/dist/output.astro', 'src/build/output.mjs', 'src/__snapshots__/result.ts', 'public/assets/file.ts', 'dist/result.ts', '.env'];
  for (const relativePath of ignored) await put(first, relativePath, 'DO_NOT_PUBLISH_FIXTURE_SECRET');
  assert.equal((await receipt(first)).sourceFingerprint, original.sourceFingerprint, 'Volatile/private/env/generated/assets paths must be ignored.');
  for (const relativePath of ignored) await put(first, relativePath, 'Changed excluded bytes');
  assert.equal((await receipt(first)).sourceFingerprint, original.sourceFingerprint);
  const secretTarget = path.join(scratch, 'outside-secret.ts');
  await writeFile(secretTarget, 'DO_NOT_PUBLISH_FIXTURE_SECRET');
  await symlink(secretTarget, path.join(first, 'src/pages/link.ts'));
  assert.equal((await receipt(first)).sourceFingerprint, original.sourceFingerprint, 'Do not follow source symlinks.');

  assert.equal(validSourceRevision('A'.repeat(40) + '\n'), 'a'.repeat(40));
  for (const value of ['', 'a'.repeat(39), 'a'.repeat(41), 'g'.repeat(40), 'HEAD', null, 0]) assert.equal(validSourceRevision(value), null);

  const gitRoot = await fixture('git');
  await put(gitRoot, 'src/data/live/conditions.ts', 'old volatile bytes');
  await fixtureGit(gitRoot, ['init', '-q']);
  await fixtureGit(gitRoot, ['add', '--', '.']);
  await fixtureGit(gitRoot, ['-c', 'user.name=Build Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture']);
  const head = await fixtureGit(gitRoot, ['rev-parse', 'HEAD']);
  assert.match(head, /^[a-f0-9]{40}$/);
  const clean = await receipt(gitRoot);
  assert.equal(clean.sourceRevision, head, 'Only an actual matching local HEAD is exact source identity.');
  for (const relativePath of ['src/scripts/consent.js', 'src/data/photos.json']) {
    const original = await readFile(path.join(gitRoot, relativePath));
    await put(gitRoot, relativePath, Buffer.concat([original, Buffer.from(' ')]));
    assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Dirty JS/JSON must suppress exact revision.');
    await put(gitRoot, relativePath, original);
  }
  await put(gitRoot, 'src/pages/a.astro', '<p>Dirty</p>');
  assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Unstaged selected changes must suppress the revision.');
  await fixtureGit(gitRoot, ['add', '--', 'src/pages/a.astro']);
  assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Staged selected changes must also suppress the revision.');
  await put(gitRoot, 'src/pages/a.astro', fixtureFiles[1][1]);
  await fixtureGit(gitRoot, ['add', '--', 'src/pages/a.astro']);
  await put(gitRoot, 'src/pages/new.ts', 'export const untracked = true;');
  assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Untracked selected source cannot claim old HEAD.');
  await rm(path.join(gitRoot, 'src/pages/new.ts'));
  await put(gitRoot, '.gitignore', 'src/pages/ignored.ts\n');
  await put(gitRoot, 'src/pages/ignored.ts', 'export const ignored = true;');
  assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Git-ignored app source is still selected by the fingerprint.');
  await rm(path.join(gitRoot, 'src/pages/ignored.ts'));
  await rm(path.join(gitRoot, 'src/pages/a.astro'));
  assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Deleted tracked app source cannot claim old HEAD.');
  await put(gitRoot, 'src/pages/a.astro', fixtureFiles[1][1]);
  await put(gitRoot, 'src/data/live/conditions.ts', 'changed volatile bytes');
  await put(gitRoot, 'src/private/key.ts', 'DO_NOT_PUBLISH_FIXTURE_SECRET');
  const ignoredDirty = await receipt(gitRoot);
  assert.equal(ignoredDirty.sourceRevision, head, 'Live/private changes do not dirty the selected app-source identity.');
  assert.equal(ignoredDirty.sourceFingerprint, clean.sourceFingerprint);

  const savedPath = process.env.PATH;
  try { process.env.PATH = ''; assert.equal((await receipt(gitRoot)).sourceRevision, null, 'Unavailable Git is a normal null.'); }
  finally { if (savedPath === undefined) delete process.env.PATH; else process.env.PATH = savedPath; }
  const savedHosted = process.env.COMMIT_SHA;
  try { process.env.COMMIT_SHA = 'a'.repeat(40); assert.equal((await receipt(first)).sourceRevision, null, 'Hosted env values cannot fake a Gitless revision.'); }
  finally { if (savedHosted === undefined) delete process.env.COMMIT_SHA; else process.env.COMMIT_SHA = savedHosted; }

  assert.equal(endpoint.prerender, true, 'The endpoint must produce a static file.');
  const originalCwd = process.cwd();
  try {
    process.chdir(second);
    const response = await endpoint.GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), publicKeys, 'The actual endpoint publishes only allowlisted fields.');
    assert.equal(body.sourceFingerprint, original.sourceFingerprint);
    assert.equal(body.sourceRevision, null);
    assert.ok(Number.isFinite(Date.parse(body.builtAtUTC)));
  } finally { process.chdir(originalCwd); }
  console.log('Build provenance checks passed: deterministic framing/order, source/root changes, exclusions/symlinks, Gitless/unavailable/dirty/staged/untracked/ignored/deleted cases, live-only cleanliness and static endpoint field allowlist.');
} finally {
  await rm(scratch, { recursive: true, force: true });
}
