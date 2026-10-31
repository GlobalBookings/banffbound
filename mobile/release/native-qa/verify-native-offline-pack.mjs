import { createHash } from 'node:crypto';
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { makeOfflineBundle, verifyOfflineBundle } from '../../src/lib/offlineBundle.ts';

const [filename, output, device] = process.argv.slice(2);
if (!filename || !output || !device) throw new Error('Expected saved native pack path, receipt path and device label.');
const receipt = { kind: 'native-simulator-offline-file-readback', device, passed: false, errors: [] };
try {
  const bytes = await readFile(filename);
  const serialized = bytes.toString('utf8');
  const pack = JSON.parse(serialized);
  if (pack.format !== 'banffbound-offline-pack' || pack.version !== 1 || pack.privateNotesIncluded !== false) throw new Error('Unexpected offline pack format or privacy flag.');
  const expected = makeOfflineBundle(pack.state, pack.savedAt);
  if (!verifyOfflineBundle(serialized, expected)) throw new Error('Native saved file differs from canonical trip and complete bundled guide/place text.');
  if (pack.state.party.adults !== 3) throw new Error('Native file did not retain the party edited through the UI.');
  if (pack.state.dayPlaces['0:lake'] !== 'lake-louise') throw new Error('Native file did not retain the UI-selected venue on day one.');
  if (!pack.state.savedPlaceIds.includes('lake-louise')) throw new Error('Native file did not retain the UI-saved place.');
  try {
    await access(path.join(path.dirname(filename), 'offline-pack.pending.json'));
    throw new Error('Temporary offline pack was not cleaned up after saving.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  Object.assign(receipt, {
    passed: true, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
    dataVersion: pack.dataVersion, savedAt: pack.savedAt, placeCount: pack.places.length,
    guideCount: pack.guides.length, exactCanonicalContentMatch: true,
    uiStateVerified: { adults: 3, firstDayVenue: 'lake-louise', savedPlace: 'lake-louise' },
    privateNotesIncluded: false, rawPersonalPackUploaded: false,
    realOfflineNetworkTested: false,
  });
} catch (error) {
  receipt.errors.push(error instanceof Error ? error.message : String(error));
}
await writeFile(output, JSON.stringify(receipt, null, 2) + '\n');
process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
if (!receipt.passed) process.exitCode = 1;
