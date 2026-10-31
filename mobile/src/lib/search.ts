export const SEARCH_DEBOUNCE_MS = 250;

export type SearchScheduler = {
  set: (callback: () => void, delayMs: number) => unknown;
  clear: (handle: unknown) => void;
};

export type SearchDebouncer = {
  schedule: (query: string) => void;
  flush: (query?: string) => void;
  clear: () => void;
  cancel: () => void;
  dispose: () => void;
};

const timers: SearchScheduler = {
  set: (callback, delayMs) => setTimeout(callback, delayMs),
  clear: handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/** Publish settled searches without allowing queued older work to restore a cleared query. */
export function createSearchDebouncer(
  publish: (query: string) => void,
  delayMs = SEARCH_DEBOUNCE_MS,
  scheduler: SearchScheduler = timers,
): SearchDebouncer {
  const delay = Number.isFinite(delayMs) ? Math.max(0, delayMs) : SEARCH_DEBOUNCE_MS;
  let timer: unknown;
  let pending: string | undefined;
  let generation = 0;
  let disposed = false;

  const cancel = () => {
    generation += 1;
    if (timer !== undefined) scheduler.clear(timer);
    timer = undefined;
    pending = undefined;
  };
  const flush = (query = pending) => {
    cancel();
    if (!disposed && query !== undefined) publish(query);
  };
  return {
    schedule(query) {
      if (disposed) return;
      cancel();
      pending = query;
      const current = generation;
      timer = scheduler.set(() => {
        // A callback may already be queued when its timer is cancelled.
        if (!disposed && current === generation) flush();
      }, delay);
    },
    flush,
    clear: () => flush(''),
    cancel,
    dispose() { cancel(); disposed = true; },
  };
}
