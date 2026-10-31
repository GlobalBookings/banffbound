export type MapSurfaceProps = { latitude?: number; longitude?: number };
export function mapUrl({ latitude, longitude }: MapSurfaceProps) {
  const valid =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);
  const box = valid
    ? `${longitude! - 0.035},${latitude! - 0.018},${longitude! + 0.035},${latitude! + 0.018}`
    : "-116.3,51.02,-115.2,51.52";
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(box)}&layer=mapnik${valid ? `&marker=${latitude},${longitude}` : ""}`;
}
