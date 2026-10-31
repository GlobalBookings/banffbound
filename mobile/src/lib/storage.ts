import { createDefaultState, decodeState, sanitizeState, type AppState } from './trip.ts';

export const TRIP_STORAGE_KEY = 'banffbound.trip.v1';
export const TRIP_BACKUP_KEY = 'banffbound.trip.backup.v1';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export type LoadResult = { state: AppState; warning: string | null; restoredFromBackup: boolean };

/** One queue governs reads, writes and reset, so an old save cannot follow a reset. */
export function createTripStorage(storage: KeyValueStorage, initialState = createDefaultState()) {
  let queue: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.then(operation);
    queue = result.catch(() => undefined);
    return result;
  }

  return {
    load(): Promise<LoadResult> {
      return enqueue(async () => {
        const serialized = await storage.getItem(TRIP_STORAGE_KEY);
        const current = decodeState(serialized);
        if (current) return { state: current, warning: null, restoredFromBackup: false };
        const backup = decodeState(await storage.getItem(TRIP_BACKUP_KEY));
        if (backup) return { state: backup, warning: 'Your last saved copy could not be read. An earlier trip has been recovered.', restoredFromBackup: true };
        return {
          state: sanitizeState(initialState),
          warning: serialized !== null ? 'Your saved trip could not be read. Start a new trip or import a saved trip file.' : null,
          restoredFromBackup: false,
        };
      });
    },
    save(state: AppState): Promise<void> {
      // Snapshot synchronously: caller mutation while waiting cannot alter this write.
      const snapshot = JSON.stringify(sanitizeState(state));
      return enqueue(async () => {
        const previous = await storage.getItem(TRIP_STORAGE_KEY);
        if (decodeState(previous)) await storage.setItem(TRIP_BACKUP_KEY, previous!);
        await storage.setItem(TRIP_STORAGE_KEY, snapshot);
      });
    },
    reset(): Promise<void> {
      return enqueue(async () => {
        // Remove the backup first. If the main removal fails, the current copy is retained.
        await storage.removeItem(TRIP_BACKUP_KEY);
        await storage.removeItem(TRIP_STORAGE_KEY);
      });
    },
    flush(): Promise<unknown> { return queue; },
  };
}
