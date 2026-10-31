/** Reviewed mobile catalogue. Refresh from the website with scripts/sync-content.mjs. */
export type PlaceCategory = 'lakes' | 'walks' | 'attractions' | 'food' | 'stays' | 'winter' | 'essentials';
export type PlaceArea = 'banff' | 'louise' | 'canmore' | 'regional';
export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  area: PlaceArea;
  description: string;
  image?: string;
  imageNote?: string;
  latitude?: number;
  longitude?: number;
  coordinateStatus: 'verified' | 'indicative' | 'unavailable';
  coordinateSource?: string;
  coordinateNote?: string;
  season: 'all' | 'winter' | 'summer';
  durationHours?: number;
  guideUrl: string;
  sourceUrl: string;
  reviewedAt: string;
  tips: string[];
  bookingRequired?: boolean;
  plannerActivityId?: string;
  offlineGuideId?: string;
};
export type Guide = {
  id: string;
  title: string;
  category: string;
  summary: string;
  sections: { title: string; body: string }[];
  sourceUrl: string;
  reviewedAt: string;
};
export { places, guides, dataVersion, plannerTemplatesForApp, contentProvenance, photoCredits } from './catalog.generated';
