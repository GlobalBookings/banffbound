import { dataVersion, guides, places } from '../data/catalog.ts';
import { exportTripPack, importTripPack, MAX_STATE_BYTES, utf8ByteLength, type AppState } from './trip.ts';

/** Portable copy of original guide/place text. Remote photographs and maps are not downloaded. */
export function makeOfflineBundle(state: AppState, savedAt: string): string {
  const tripPack = JSON.parse(exportTripPack(state, { now: new Date(savedAt) }));
  return JSON.stringify({
    format: 'banffbound-offline-pack',
    version: 1,
    dataVersion,
    savedAt,
    privateNotesIncluded: false,
    coverage: 'Itinerary, booking checklist, original guide text and place details. Maps, external images and current condition reports require a connection.',
    state: tripPack.state,
    places,
    guides,
  });
}

export function verifyOfflineBundle(serialized: string, expected: string): boolean {
  // Exact readback also verifies all source records and text, not just an optimistic count.
  if (serialized !== expected) return false;
  try {
    const pack = JSON.parse(serialized);
    return pack.format === 'banffbound-offline-pack' && pack.version === 1 && pack.dataVersion === dataVersion
      && pack.places.length === places.length && pack.guides.length === guides.length;
  } catch { return false; }
}

/** Validate the bounded file envelope before allowing the UI to replace any existing trip. */
export function decodePickedTripPack(serialized: string, byteSize: number): AppState {
  if (!Number.isFinite(byteSize) || byteSize <= 0 || byteSize > MAX_STATE_BYTES) throw new Error('Choose a BanffBound trip JSON file no larger than 256 KB.');
  if (utf8ByteLength(serialized) > MAX_STATE_BYTES) throw new Error('This trip file is too large to import.');
  const state = importTripPack(serialized);
  if (!state) throw new Error('This is not a valid supported BanffBound trip file. Your current trip has not changed.');
  return state;
}
