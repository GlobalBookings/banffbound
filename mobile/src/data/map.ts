/** Local place discovery. Coordinate provenance describes map features, not surveyed entrances. */
export type MapCategory = 'restaurants' | 'cafes' | 'activities' | 'toilets' | 'parking' | 'transit' | 'viewpoints' | 'stays' | 'water' | 'fuel' | 'services' | 'walks' | 'lakes';
export type MapArea = 'banff' | 'louise' | 'canmore' | 'regional';
export type MapMarker = { id: string; name: string; category: MapCategory; latitude: number; longitude: number };
export type MapSource = { label: string; url: string; checkedAt: string; kind: 'osm' | 'operator' | 'banffbound' | 'official' };
export type MapPoint = MapMarker & {
  area: MapArea;
  description: string;
  address?: string;
  cuisine?: string;
  highlights: string[];
  details?: { title: string; body: string }[];
  facilities?: { label: string; value: string }[];
  menuUrl?: string;
  websiteUrl?: string;
  guideUrl?: string;
  relatedPlaceId?: string;
  relatedActivityIds?: string[];
  commerceItemIds?: string[];
  coordinateNote: string;
  sources: MapSource[];
};
export const mapCategories: { id: MapCategory; label: string; symbol: string; color: string; icon: string }[] = [
  { id: 'restaurants', label: 'Restaurants', symbol: 'R', color: '#a54833', icon: 'restaurant-outline' },
  { id: 'cafes', label: 'Cafés & bars', symbol: 'C', color: '#875935', icon: 'cafe-outline' },
  { id: 'activities', label: 'Activities', symbol: 'A', color: '#80602a', icon: 'ticket-outline' },
  { id: 'toilets', label: 'Toilets', symbol: 'WC', color: '#4465a1', icon: 'man-outline' },
  { id: 'parking', label: 'Parking', symbol: 'P', color: '#526e82', icon: 'car-outline' },
  { id: 'transit', label: 'Bus & transport', symbol: 'B', color: '#6d5b94', icon: 'bus-outline' },
  { id: 'viewpoints', label: 'Viewpoints', symbol: 'V', color: '#366d5a', icon: 'camera-outline' },
  { id: 'walks', label: 'Walks & parks', symbol: 'W', color: '#477747', icon: 'trail-sign-outline' },
  { id: 'lakes', label: 'Lakes', symbol: 'L', color: '#267c8b', icon: 'water-outline' },
  { id: 'stays', label: 'Hotels & stays', symbol: 'H', color: '#78527c', icon: 'bed-outline' },
  { id: 'water', label: 'Drinking water', symbol: 'D', color: '#277b9a', icon: 'water-outline' },
  { id: 'fuel', label: 'Fuel & charging', symbol: 'E', color: '#8d642a', icon: 'flash-outline' },
  { id: 'services', label: 'Visitor services', symbol: 'i', color: '#53675d', icon: 'information-circle-outline' },
];
