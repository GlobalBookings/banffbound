export interface EcccLocation {
  name: string;
  identifier: string;
  format: 'geomet' | 'location';
  apiUrl: string;
  sourceUrl: string;
  lat?: number;
  lon?: number;
}
export interface EcccWeather {
  sourceUrl: string;
  current: { temp: number | null; condition: string; observedAt: string | null; station: string | null };
  error?: string;
}
export const ECCC_PROVIDER: string;
export const ECCC_LOCATIONS: { banff: EcccLocation; lakeLouise: EcccLocation };
export function normalizeEcccWeather(payload: unknown, location: EcccLocation): EcccWeather;
