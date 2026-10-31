import assert from 'node:assert/strict';
import test from 'node:test';
import { createSearchDebouncer, SEARCH_DEBOUNCE_MS, type SearchScheduler } from '../src/lib/search';

function clock() {
  let now = 0, nextId = 0;
  const jobs = new Map<number, { due: number; callback: () => void; cancelled: boolean }>();
  const scheduler: SearchScheduler = {
    set(callback, delayMs) { const id = nextId++; jobs.set(id, { due: now + delayMs, callback, cancelled: false }); return id; },
    clear(handle) { const job = jobs.get(handle as number); if (job) job.cancelled = true; },
  };
  return {
    scheduler,
    queued: () => [...jobs.values()].map(job => job.callback),
    advance(ms: number) {
      const end = now + ms;
      for (;;) {
        const next = [...jobs.entries()].filter(([, job]) => !job.cancelled && job.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        jobs.delete(next[0]); now = next[1].due; next[1].callback();
      }
      now = end;
    },
  };
}

test('fast native editing publishes only the complete query after the final pause', () => {
  const time = clock(), results: string[] = [];
  const search = createSearchDebouncer(query => results.push(query), SEARCH_DEBOUNCE_MS, time.scheduler);
  for (const query of ['B', 'Ba', 'Ban', 'Banff', 'Banff Gondola admission']) {
    search.schedule(query); time.advance(40);
  }
  assert.deepEqual(results, []);
  time.advance(209); assert.deepEqual(results, []);
  time.advance(1); assert.deepEqual(results, ['Banff Gondola admission']);
  time.advance(1000); assert.equal(results.length, 1);
});

test('actual Search text wins immediately over an older queued change event', () => {
  const time = clock(), results: string[] = [];
  const search = createSearchDebouncer(query => results.push(query), 250, time.scheduler);
  search.schedule('B');
  const stale = time.queued();
  search.flush('Bison');
  assert.deepEqual(results, ['Bison']);
  stale.forEach(callback => callback()); time.advance(1000);
  assert.deepEqual(results, ['Bison']);
  search.flush(); assert.deepEqual(results, ['Bison']);
});

test('clear publishes empty immediately and queued work cannot restore a pre-reset query', () => {
  const time = clock(), results: string[] = [];
  const search = createSearchDebouncer(query => results.push(query), 250, time.scheduler);
  search.schedule('Public Washrooms');
  const stale = time.queued();
  search.clear();
  assert.deepEqual(results, ['']);
  search.schedule('Lake Louise');
  stale.forEach(callback => callback()); time.advance(250);
  assert.deepEqual(results, ['', 'Lake Louise']);
});

test('unmount cancellation blocks even an already queued callback and permits effect replay', () => {
  const time = clock(), results: string[] = [];
  const search = createSearchDebouncer(query => results.push(query), 250, time.scheduler);
  search.schedule('old screen'); const stale = time.queued(); search.cancel();
  stale.forEach(callback => callback()); time.advance(1000);
  assert.deepEqual(results, []);
  search.schedule('new screen'); time.advance(250);
  assert.deepEqual(results, ['new screen']);
});

test('disposed search cannot publish, schedule or revive pending work', () => {
  const time = clock(), results: string[] = [];
  const search = createSearchDebouncer(query => results.push(query), 250, time.scheduler);
  search.schedule('discard'); const stale = time.queued(); search.dispose();
  search.schedule('later'); search.flush('submitted'); search.clear(); stale.forEach(callback => callback()); time.advance(1000);
  assert.deepEqual(results, []);
});

test('a completed publication may schedule the next search without losing its timer', () => {
  const time = clock(), results: string[] = [];
  const search = createSearchDebouncer(query => { results.push(query); if (query === 'first') search.schedule('second'); }, 250, time.scheduler);
  search.schedule('first'); time.advance(500);
  assert.deepEqual(results, ['first', 'second']);
});
