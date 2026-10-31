import type { MapMarker } from "../data/map";
export type { MapMarker } from "../data/map";

export type MapSurfaceProps = {
  points: MapMarker[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  position?: { latitude: number; longitude: number } | null;
  height?: number;
  viewArea?: "all" | "banff" | "louise" | "canmore" | "regional";
  onMapStatus?: (status: "ready" | "unavailable") => void;
};
