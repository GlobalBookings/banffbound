import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTripStorage } from './storage.ts';
import { createDefaultState, sanitizeState, type AppState } from './trip.ts';

export function useTripStore() {
  const [state, setState] = useState<AppState>(() => createDefaultState());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);
  const readyRef = useRef(false);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const pendingRef = useRef<Array<(previous: AppState) => AppState>>([]);
  const storageRef = useRef<ReturnType<typeof createTripStorage> | null>(null);
  if (!storageRef.current) storageRef.current = createTripStorage(AsyncStorage);

  const persist = useCallback((next: AppState, generation = generationRef.current) => {
    void storageRef.current!.save(next).then(() => {
      if (mountedRef.current && generation === generationRef.current) setError(null);
    }).catch(() => {
      if (mountedRef.current && generation === generationRef.current) setError('Your changes are visible here, but could not be saved on this device. Free some storage and try editing again.');
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    const generation = generationRef.current;
    void storageRef.current!.load().then(result => {
      if (cancelled || generation !== generationRef.current) return;
      let next = result.state;
      const queued = pendingRef.current.splice(0);
      queued.forEach(operation => { next = sanitizeState(operation(next), next); });
      stateRef.current = next;
      readyRef.current = true;
      setState(next);
      setReady(true);
      setError(result.warning);
      // Hydration alone never overwrites storage, including damaged saved state.
      if (queued.length) persist(next);
    }).catch(() => {
      if (cancelled || generation !== generationRef.current) return;
      readyRef.current = true;
      setReady(true);
      setError('Saved trips are unavailable on this device. You can plan here, but saving may not work.');
      let next = stateRef.current;
      const queued = pendingRef.current.splice(0);
      queued.forEach(operation => { next = sanitizeState(operation(next), next); });
      stateRef.current = next;
      setState(next);
      if (queued.length) persist(next);
    });
    return () => { cancelled = true; mountedRef.current = false; };
  }, [persist]);

  const update = useCallback((operation: (previous: AppState) => AppState) => {
    if (!readyRef.current) { pendingRef.current.push(operation); return; }
    const next = sanitizeState(operation(stateRef.current), stateRef.current);
    stateRef.current = next;
    setState(next);
    persist(next);
  }, [persist]);

  const reset = useCallback(async () => {
    // Ignore failures from queued old saves in the reset's UI, but await their queue.
    const generation = ++generationRef.current;
    pendingRef.current = [];
    readyRef.current = false;
    if (mountedRef.current) setReady(false);
    try {
      await storageRef.current!.reset();
      if (generation !== generationRef.current) return;
      let next = createDefaultState();
      const queued = pendingRef.current.splice(0);
      queued.forEach(operation => { next = sanitizeState(operation(next), next); });
      stateRef.current = next;
      readyRef.current = true;
      if (mountedRef.current) { setState(next); setReady(true); setError(null); }
      if (queued.length) persist(next, generation);
    } catch (failure) {
      if (generation === generationRef.current) {
        readyRef.current = true;
        let next = stateRef.current;
        const queued = pendingRef.current.splice(0);
        queued.forEach(operation => { next = sanitizeState(operation(next), next); });
        stateRef.current = next;
        if (mountedRef.current) { setState(next); setReady(true); setError('Your trip could not be cleared from this device. Please try again.'); }
        if (queued.length) persist(next, generation);
      }
      throw failure;
    }
  }, [persist]);

  return { state, ready, error, update, reset };
}
