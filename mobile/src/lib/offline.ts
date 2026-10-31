import { Platform, Share } from 'react-native';
import { decodePickedTripPack, makeOfflineBundle, verifyOfflineBundle } from './offlineBundle.ts';
import { requestVerifiedOfflineCache } from './offlineProtocol.ts';
import { exportTripPack, MAX_STATE_BYTES, sanitizeState, tripToText, utf8ByteLength, type AppState } from './trip.ts';

const WEB_OFFLINE_PACK_KEY = 'banffbound.offline-pack.v1';
let offlineOperations: Promise<unknown> = Promise.resolve();

function serialOffline<T>(operation: () => Promise<T>): Promise<T> {
  const result = offlineOperations.then(operation);
  offlineOperations = result.catch(() => undefined);
  return result;
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

async function controllingAppWorker(): Promise<ServiceWorker> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !window.isSecureContext) throw new Error('Offline saving is not supported in this browser. Open the app in a supported browser over HTTPS.');
  if (!window.location.pathname.startsWith('/app/')) throw new Error('Offline saving is available from the published BanffBound app at /app/.');
  const registration = await withTimeout(navigator.serviceWorker.ready, 15_000, 'The offline app has not installed yet. Reload the app while connected, then try saving again.');
  const scope = new URL(registration.scope);
  if (scope.origin !== window.location.origin || scope.pathname !== '/app/' || !registration.active) throw new Error('The app offline service is not ready. Reload while connected and try again.');
  const isAppController = () => navigator.serviceWorker.controller?.scriptURL === registration.active?.scriptURL;
  if (!isAppController()) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', changed); reject(new Error('The offline app has just installed. Reload once while connected, then save your trip.')); }, 10_000);
      const changed = () => {
        if (!isAppController()) return;
        clearTimeout(timeout);
        navigator.serviceWorker.removeEventListener('controllerchange', changed);
        resolve();
      };
      navigator.serviceWorker.addEventListener('controllerchange', changed);
      changed();
    });
  }
  const worker = navigator.serviceWorker.controller;
  if (!worker) throw new Error('The offline app is not controlling this page yet. Reload and try again.');
  return worker;
}

async function persistOfflinePack(state: AppState): Promise<{ savedAt: string; message: string }> {
  const savedAt = new Date().toISOString();
  if (Platform.OS === 'web') {
    const worker = await controllingAppWorker();
    await requestVerifiedOfflineCache(worker);
    // Verify an actual copy of the trip and guide text, independently of a pending UI save.
    const serialized = makeOfflineBundle(state, savedAt);
    try {
      window.localStorage.setItem(WEB_OFFLINE_PACK_KEY, serialized);
      if (!verifyOfflineBundle(window.localStorage.getItem(WEB_OFFLINE_PACK_KEY) ?? '', serialized)) throw new Error('Storage verification failed.');
    }
    catch { throw new Error('Offline app files are ready, but this browser could not save trip data. Enable site storage and try again.'); }
    return { savedAt, message: 'Offline app files verified. Your itinerary and bundled guide text are available on this browser. Maps, external photos and current reports need a connection.' };
  }
  const { File, Directory, Paths } = await import('expo-file-system');
  const directory = new Directory(Paths.document, 'banffbound');
  directory.create({ intermediates: true, idempotent: true });
  const pending = new File(directory, 'offline-pack.pending.json');
  const destination = new File(directory, 'offline-pack.json');
  const serialized = makeOfflineBundle(state, savedAt);
  try {
    pending.create({ overwrite: true });
    pending.write(serialized);
    if (!verifyOfflineBundle(await pending.text(), serialized)) throw new Error('The saved trip did not pass its readback check.');
    await pending.move(destination, { overwrite: true });
    if (!verifyOfflineBundle(await destination.text(), serialized)) throw new Error('The offline trip could not be verified after saving.');
    return { savedAt, message: 'Your itinerary, place details and bundled guides are saved on this device. Maps, external photos and current reports need a connection.' };
  } finally {
    // File.move may update the original File object's URI; probe the temporary path afresh.
    const leftover = new File(directory, 'offline-pack.pending.json');
    if (leftover.exists) leftover.delete();
  }
}

export function saveOfflinePack(state: AppState): Promise<{ savedAt: string; message: string }> {
  const snapshot = sanitizeState(state);
  return serialOffline(() => persistOfflinePack(snapshot));
}

/** Personal-state reset leaves the public web app cache intact; native personal export files are removed. */
async function removeOfflinePack(): Promise<void> {
  if (Platform.OS === 'web') { window.localStorage.removeItem(WEB_OFFLINE_PACK_KEY); return; }
  const { File, Directory, Paths } = await import('expo-file-system');
  for (const name of ['offline-pack.json', 'offline-pack.pending.json']) {
    const file = new File(Paths.document, 'banffbound', name);
    if (file.exists) file.delete();
  }
  const cache = new Directory(Paths.cache);
  if (cache.exists) {
    for (const entry of cache.list()) {
      if (entry instanceof File && /^banffbound-trip-[a-z0-9]+-[a-z0-9]{5}\.json$/.test(entry.name)) entry.delete();
    }
  }
}

export function clearOfflinePack(): Promise<void> { return serialOffline(removeOfflinePack); }

export async function shareTrip(state: AppState): Promise<void> {
  const text = tripToText(state);
  if (Platform.OS !== 'web') { await Share.share({ title: 'My BanffBound trip', message: text }); return; }
  if (typeof navigator.share === 'function') {
    try { await navigator.share({ title: 'My BanffBound trip', text }); return; }
    catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
  }
  // A text download is visible and explicit; it does not claim a clipboard write happened.
  downloadWebFile(text, `banffbound-trip-${state.startDate}.txt`, 'text/plain;charset=utf-8');
}

function downloadWebFile(content: string, name: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.style.display = 'none';
  document.body.appendChild(link);
  try { link.click(); } finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

/** Export a reusable JSON trip file. Private booking notes are always omitted. */
export async function shareTripPack(state: AppState): Promise<void> {
  const serialized = exportTripPack(state);
  if (utf8ByteLength(serialized) > MAX_STATE_BYTES) throw new Error('This trip is too large to export. Reduce its booking checklist and try again.');
  const name = `banffbound-trip-${state.startDate}.json`;
  if (Platform.OS === 'web') { downloadWebFile(serialized, name, 'application/json;charset=utf-8'); return; }
  const Sharing = await import('expo-sharing');
  if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device. You can still share a text summary of your trip.');
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.cache, `banffbound-trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7).padEnd(5, '0')}.json`);
  try {
    file.create({ overwrite: true });
    file.write(serialized);
    if (await file.text() !== serialized) throw new Error('The trip export could not be verified. Please try again.');
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export BanffBound trip', UTI: 'public.json' });
  } catch (error) {
    if (file.exists) file.delete();
    throw error;
  }
}

/** Returns null on user cancellation; failures throw and never mutate the current trip. */
export async function pickTripPack(): Promise<AppState | null> {
  const DocumentPicker = await import('expo-document-picker');
  const selection = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], copyToCacheDirectory: true, multiple: false, base64: false });
  if (selection.canceled) return null;
  const asset = selection.assets[0];
  if (!asset) throw new Error('No trip file was selected.');
  if (asset.size !== undefined && (!Number.isFinite(asset.size) || asset.size <= 0 || asset.size > MAX_STATE_BYTES)) throw new Error('Choose a BanffBound trip JSON file no larger than 256 KB.');
  if (Platform.OS === 'web') {
    if (!asset.file) throw new Error('This browser could not read the selected trip file. Try a supported browser.');
    if (asset.file.size <= 0 || asset.file.size > MAX_STATE_BYTES) throw new Error('Choose a BanffBound trip JSON file no larger than 256 KB.');
    return decodePickedTripPack(await asset.file.text(), asset.file.size);
  }
  const { File } = await import('expo-file-system');
  const file = new File(asset.uri);
  if (!file.exists || !Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_STATE_BYTES) throw new Error('Choose a readable BanffBound trip JSON file no larger than 256 KB.');
  return decodePickedTripPack(await file.text(), file.size);
}
