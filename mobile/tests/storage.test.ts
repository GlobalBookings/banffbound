import test from 'node:test';
import assert from 'node:assert/strict';
import { createTripStorage, TRIP_BACKUP_KEY, TRIP_STORAGE_KEY, type KeyValueStorage } from '../src/lib/storage.ts';
import { createDefaultState, decodeState } from '../src/lib/trip.ts';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const writes: string[] = [];
  const storage: KeyValueStorage = {
    async getItem(key) { return data.get(key) ?? null; },
    async setItem(key, value) { writes.push(key); data.set(key, value); },
    async removeItem(key) { writes.push(`remove:${key}`); data.delete(key); },
  };
  return { data, writes, storage };
}

test('hydration reads persisted state without overwriting it', async () => {
  const saved = createDefaultState();
  saved.trip.base = 'canmore';
  const store = memoryStorage({ [TRIP_STORAGE_KEY]: JSON.stringify(saved) });
  const result = await createTripStorage(store.storage).load();
  assert.deepEqual(result.state, saved);
  assert.equal(result.warning, null);
  assert.deepEqual(store.writes, []);
});

test('first launch uses defaults without saving before a user edit', async () => {
  const defaults = createDefaultState(new Date('2026-10-30T12:00Z'));
  const store = memoryStorage();
  const result = await createTripStorage(store.storage, defaults).load();
  assert.deepEqual(result.state, defaults);
  assert.deepEqual(store.writes, []);
});

test('corrupt current state recovers the previous valid saved copy', async () => {
  const backup = createDefaultState();
  backup.trip.base = 'louise';
  const store = memoryStorage({ [TRIP_STORAGE_KEY]: '{broken', [TRIP_BACKUP_KEY]: JSON.stringify(backup) });
  const result = await createTripStorage(store.storage).load();
  assert.deepEqual(result.state, backup);
  assert.equal(result.restoredFromBackup, true);
  assert.ok(result.warning);
  assert.equal(store.data.get(TRIP_STORAGE_KEY), '{broken');
});

test('sequential writes retain the latest state and the prior valid backup', async () => {
  const first = createDefaultState();
  const second = { ...first, startDate: '2026-12-01' };
  const third = { ...first, startDate: '2026-12-02' };
  const store = memoryStorage();
  const persistence = createTripStorage(store.storage);
  await Promise.all([persistence.save(first), persistence.save(second), persistence.save(third)]);
  assert.equal(decodeState(store.data.get(TRIP_STORAGE_KEY))?.startDate, '2026-12-02');
  assert.equal(decodeState(store.data.get(TRIP_BACKUP_KEY))?.startDate, '2026-12-01');
  assert.deepEqual((await persistence.load()).state, third);
});

test('save snapshots immediately rather than retaining mutable caller objects', async () => {
  const state = createDefaultState();
  const originalDate = state.startDate;
  const store = memoryStorage();
  const save = createTripStorage(store.storage).save(state);
  state.startDate = '2030-01-01';
  await save;
  assert.equal(decodeState(store.data.get(TRIP_STORAGE_KEY))?.startDate, originalDate);
});

test('a failed write is reported and does not poison the save queue', async () => {
  const store = memoryStorage();
  let fail = true;
  const underlying = store.storage.setItem;
  store.storage.setItem = async (key, value) => {
    if (key === TRIP_STORAGE_KEY && fail) { fail = false; throw new Error('full'); }
    await underlying(key, value);
  };
  const persistence = createTripStorage(store.storage);
  await assert.rejects(persistence.save(createDefaultState()), /full/);
  const next = { ...createDefaultState(), startDate: '2026-12-01' };
  await persistence.save(next);
  assert.equal(decodeState(store.data.get(TRIP_STORAGE_KEY))?.startDate, '2026-12-01');
});

test('reset follows pending saves and clears primary plus recovery storage', async () => {
  const store = memoryStorage();
  const persistence = createTripStorage(store.storage);
  const save1 = persistence.save(createDefaultState());
  const save2 = persistence.save({ ...createDefaultState(), startDate: '2026-12-01' });
  const reset = persistence.reset();
  await Promise.all([save1, save2, reset]);
  assert.equal(store.data.size, 0);
  assert.equal((await persistence.load()).warning, null);
});
