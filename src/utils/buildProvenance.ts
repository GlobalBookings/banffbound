import { createHash, type Hash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const rootInputs = ['astro.config.mjs', 'package.json', 'package-lock.json', 'public/llms.txt'];
const sourceExtensions = new Set(['.astro', '.ts', '.mjs', '.js', '.css', '.json']);
const excludedDirectories = new Set(['assets', 'private', '__private__', 'env', 'environment', 'environments', 'secret', 'secrets', 'generated', '__generated__', 'snapshots', '__snapshots__', 'dist', 'build', 'node_modules', 'coverage', 'tmp', 'temp', 'cache']);
const excludedName = /(?:^|[._-])(?:env|environment|private|secrets?|generated)(?:[._-]|$)/i;
function excludedPart(part: string): boolean {
  const lower = part.toLowerCase();
  return ['.git', '.astro', '.aws', '.codex', '.agents'].includes(lower)
    || excludedDirectories.has(lower.replace(/^\./, '')) || excludedName.test(part);
}

export interface BuildProvenance {
  formatVersion: 1;
  scope: 'app-source-v2';
  scopeNote: string;
  builtAtUTC: string;
  sourceRevision: string | null;
  sourceFingerprint: string;
}
interface SourceInput { relativePath: string; bytes: Buffer | null; }

/** Path predicate is also applied to HEAD metadata, including deleted files. */
function selectedPath(relativePath: string): boolean {
  if (rootInputs.includes(relativePath)) return true;
  if (!relativePath.startsWith('src/')) return false;
  const parts = relativePath.split('/');
  if (parts.some(excludedPart)) return false;
  if (parts[1]?.toLowerCase() === 'data' && parts[2]?.toLowerCase() === 'live') return false;
  return sourceExtensions.has(path.posix.extname(relativePath).toLowerCase());
}
function excludedDirectory(relativePath: string): boolean {
  const parts = relativePath.split('/');
  return parts.some(excludedPart)
    || (parts[1]?.toLowerCase() === 'data' && parts[2]?.toLowerCase() === 'live');
}

async function collectInputs(root: string): Promise<SourceInput[]> {
  const inputs: SourceInput[] = [];
  async function walk(relativeDirectory: string): Promise<void> {
    const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = `${relativeDirectory}/${entry.name}`;
      // Never follow symlinks into assets, generated output or private material.
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!excludedDirectory(relativePath)) await walk(relativePath);
      } else if (entry.isFile() && selectedPath(relativePath)) {
        inputs.push({ relativePath, bytes: await readFile(path.join(root, relativePath)) });
      }
    }
  }
  // An absent app source root is an error, not a receipt for an unrelated cwd.
  const sourceRoot = await lstat(path.join(root, 'src'));
  if (!sourceRoot.isDirectory() || sourceRoot.isSymbolicLink()) throw new Error('Build provenance requires a regular app source directory.');
  await walk('src');
  for (const relativePath of rootInputs) {
    try {
      const info = await lstat(path.join(root, relativePath));
      if (!info.isFile() || info.isSymbolicLink()) throw new Error('Build provenance root inputs must be regular files.');
      inputs.push({ relativePath, bytes: await readFile(path.join(root, relativePath)) });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      // Missing explicit inputs have their own framed state, so deletion changes the digest.
      inputs.push({ relativePath, bytes: null });
    }
  }
  return inputs.sort((a, b) => Buffer.compare(Buffer.from(a.relativePath, 'utf8'), Buffer.from(b.relativePath, 'utf8')));
}
function frame(hash: Hash, bytes: Buffer): void {
  const length = Buffer.alloc(8);
  length.writeBigUInt64BE(BigInt(bytes.length));
  hash.update(length);
  hash.update(bytes);
}
function fingerprint(inputs: SourceInput[]): string {
  const hash = createHash('sha256');
  hash.update('app-source-v2\0', 'utf8');
  for (const input of inputs) {
    frame(hash, Buffer.from(input.relativePath, 'utf8'));
    hash.update(Buffer.from([input.bytes === null ? 0 : 1]));
    frame(hash, input.bytes ?? Buffer.alloc(0));
  }
  return hash.digest('hex');
}
export function validSourceRevision(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const revision = value.trim();
  return /^[a-f0-9]{40}$/i.test(revision) ? revision.toLowerCase() : null;
}
async function git(root: string, args: string[]): Promise<string> {
  const result = await runFile('git', args, {
    cwd: root, encoding: 'utf8', timeout: 3000, maxBuffer: 8 * 1024 * 1024,
    // Do not accept inherited GIT_DIR/WORK_TREE or hosted commit variables as identity.
    env: { PATH: process.env.PATH, GIT_OPTIONAL_LOCKS: '0' }, windowsHide: true,
  });
  return result.stdout;
}
async function matchingRevision(root: string, inputs: SourceInput[]): Promise<string | null> {
  try {
    const gitEntry = await lstat(path.join(root, '.git'));
    if (!gitEntry.isDirectory() && !gitEntry.isFile()) return null;
    const revision = validSourceRevision(await git(root, ['rev-parse', 'HEAD']));
    if (!revision) return null;
    const listing = await git(root, ['ls-tree', '-r', '-z', '--full-tree', revision, '--', 'src', ...rootInputs]);
    const tracked = new Map<string, string>();
    for (const entry of listing.split('\0')) {
      if (!entry) continue;
      const tab = entry.indexOf('\t');
      if (tab < 0) return null;
      const relativePath = entry.slice(tab + 1);
      const header = entry.slice(0, tab).match(/^(\d{6}) blob ([a-f0-9]{40})$/);
      if (!header) return null;
      // The fingerprint covers regular files, not link targets or submodules.
      if (header[1] !== '100644' && header[1] !== '100755') continue;
      if (selectedPath(relativePath)) tracked.set(relativePath, header[2]);
    }
    const actual = inputs.filter(input => input.bytes !== null);
    if (tracked.size !== actual.length) return null;
    for (const input of actual) {
      const bytes = input.bytes!;
      const objectHash = createHash('sha1').update(`blob ${bytes.length}\0`, 'utf8').update(bytes).digest('hex');
      if (tracked.get(input.relativePath) !== objectHash) return null;
    }
    return revision;
  } catch {
    // Gitless deployments, invalid HEAD, unavailable Git and dirty/untracked app source are normal nulls.
    return null;
  }
}

/** Build-time, read-only source receipt. Run the static build from its app root. */
export async function createBuildProvenance(root = process.cwd(), builtAt = new Date()): Promise<BuildProvenance> {
  const inputs = await collectInputs(path.resolve(root));
  return {
    formatVersion: 1,
    scope: 'app-source-v2',
    scopeNote: 'Selected regular .astro/.ts/.mjs/.js/.css/.json app source and explicit build inputs; excludes volatile snapshots, assets, generated outputs, private files and environment data. Revision is null unless the selected source matches local HEAD.',
    builtAtUTC: builtAt.toISOString(),
    sourceRevision: await matchingRevision(path.resolve(root), inputs),
    sourceFingerprint: fingerprint(inputs),
  };
}
