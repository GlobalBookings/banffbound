export type OfflineWorker = { postMessage(message: unknown, transfer: Transferable[]): void };

/** Use an exclusive message port and request correlation so no unrelated worker message can mark success. */
export function requestVerifiedOfflineCache(worker: OfflineWorker, timeoutMs = 45_000): Promise<{ version: string }> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const requestId = `offline-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const finish = () => { clearTimeout(timeout); channel.port1.close(); channel.port2.close(); };
    const timeout = setTimeout(() => { finish(); reject(new Error('Saving the offline app took too long. Reconnect and try again. Your previous saved trip remains available.')); }, timeoutMs);
    channel.port1.onmessage = event => {
      const reply = event.data;
      if (!reply || reply.type !== 'OFFLINE_PACK_RESULT' || reply.requestId !== requestId) return;
      finish();
      if (reply.success === true && typeof reply.version === 'string' && reply.version.length > 0 && reply.version.length < 200) resolve({ version: reply.version });
      else reject(new Error(typeof reply.error === 'string' && reply.error.length < 300 ? reply.error : 'The offline app could not be verified. Reconnect and try again.'));
    };
    try { worker.postMessage({ type: 'CACHE_OFFLINE_PACK', requestId }, [channel.port2]); }
    catch (error) { finish(); reject(error); }
  });
}
