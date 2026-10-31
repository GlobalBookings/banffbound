import test from 'node:test';
import assert from 'node:assert/strict';
import { requestVerifiedOfflineCache, type OfflineWorker } from '../src/lib/offlineProtocol.ts';
import { decodePickedTripPack, makeOfflineBundle, verifyOfflineBundle } from '../src/lib/offlineBundle.ts';
import { createDefaultState, exportTripPack, utf8ByteLength } from '../src/lib/trip.ts';
import { guides, places } from '../src/data/catalog.ts';

test('offline success requires a correlated complete worker receipt', async () => {
  const worker: OfflineWorker = { postMessage(message, transfer) {
    const request = message as { requestId: string };
    const port = transfer[0] as MessagePort;
    port.postMessage({ type: 'OFFLINE_PACK_RESULT', requestId: 'different', success: true, version: 'old' });
    port.postMessage({ type: 'OFFLINE_PACK_RESULT', requestId: request.requestId, success: true, version: 'verified-release' });
  } };
  assert.deepEqual(await requestVerifiedOfflineCache(worker, 1000), { version: 'verified-release' });
});

test('failed cache receipt and unresponsive worker never mark offline success', async () => {
  const failure: OfflineWorker = { postMessage(message, transfer) {
    const port = transfer[0] as MessagePort;
    port.postMessage({ type: 'OFFLINE_PACK_RESULT', requestId: (message as { requestId: string }).requestId, success: false, error: 'One app file failed its integrity check.' });
  } };
  await assert.rejects(requestVerifiedOfflineCache(failure, 1000), /integrity/);
  await assert.rejects(requestVerifiedOfflineCache({ postMessage() {} }, 20), /too long/);
});

test('incomplete cache receipt without a version is rejected', async () => {
  const worker: OfflineWorker = { postMessage(message, transfer) {
    (transfer[0] as MessagePort).postMessage({ type: 'OFFLINE_PACK_RESULT', requestId: (message as { requestId: string }).requestId, success: true });
  } };
  await assert.rejects(requestVerifiedOfflineCache(worker, 1000), /could not be verified/);
});

test('offline bundle contains the complete original guide/place catalogue and redacts private notes', () => {
  const state = createDefaultState();
  state.bookings.push({ id: 'private-booking', title: 'Reservation', date: '', time: '', markedBooked: false, notes: 'SECRET-CONFIRMATION' });
  const serialized = makeOfflineBundle(state, '2026-10-30T12:00:00Z');
  const bundle = JSON.parse(serialized);
  assert.equal(bundle.places.length, places.length);
  assert.equal(bundle.guides.length, guides.length);
  assert.ok(bundle.guides.every((guide: { sections: unknown[] }) => guide.sections.length > 0));
  assert.equal(serialized.includes('SECRET-CONFIRMATION'), false);
  assert.equal(verifyOfflineBundle(serialized, serialized), true);
  assert.equal(verifyOfflineBundle(serialized.slice(0, -1), serialized), false);
});

test('picked JSON file validates its byte-size bound and schema before replacing a trip', () => {
  const state = createDefaultState();
  state.budget.transport = 0;
  const content = exportTripPack(state);
  assert.deepEqual(decodePickedTripPack(content, utf8ByteLength(content)), state);
  assert.throws(() => decodePickedTripPack(content, 256_001), /256 KB/);
  assert.throws(() => decodePickedTripPack(content, Number.NaN), /256 KB/);
  assert.throws(() => decodePickedTripPack('{not json', 9), /not a valid/);
  assert.throws(() => decodePickedTripPack(content.replace('"version": 1', '"version": 2'), utf8ByteLength(content)), /not a valid/);
  assert.equal(utf8ByteLength('Aé🏔️'), Buffer.byteLength('Aé🏔️', 'utf8'));
  const oversizedUnicode = content.replace('"savedPlaceIds": []', `"savedPlaceIds": [], "extra": "${'🏔'.repeat(70_000)}"`);
  assert.throws(() => decodePickedTripPack(oversizedUnicode, 250_000), /too large/);
});
