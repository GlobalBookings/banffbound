import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'trailPolylines.ts');
const ARCGIS_BASE = 'https://maps.banff.ca/arcgis/rest/services/Trails/ParksCanadaTrails/MapServer/0/query';

async function fetchPage(offset) {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: 'FEAT_NAME,SURFACE,TRAIL_USE',
    f: 'json',
    outSR: '4326',
    resultOffset: String(offset),
    resultRecordCount: '200',
  });
  const res = await fetch(`${ARCGIS_BASE}?${params}`, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`ArcGIS returned ${res.status}`);
  return res.json();
}

async function fetchAll() {
  const allFeatures = [];
  let offset = 0;
  while (true) {
    console.log(`Fetching trails offset ${offset}...`);
    const data = await fetchPage(offset);
    if (!data.features || data.features.length === 0) break;
    allFeatures.push(...data.features);
    if (!data.exceededTransferLimit) break;
    offset += data.features.length;
  }
  return allFeatures;
}

function simplifyPath(coords, tolerance = 0.0001) {
  if (coords.length <= 2) return coords;
  let maxDist = 0, maxIdx = 0;
  const [sx, sy] = coords[0];
  const [ex, ey] = coords[coords.length - 1];
  for (let i = 1; i < coords.length - 1; i++) {
    const [px, py] = coords[i];
    const dist = Math.abs((ey - sy) * px - (ex - sx) * py + ex * sy - ey * sx) /
      Math.sqrt((ey - sy) ** 2 + (ex - sx) ** 2);
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const left = simplifyPath(coords.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(coords.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [coords[0], coords[coords.length - 1]];
}

function buildGeoJSON(features) {
  return features.map(f => {
    const paths = f.geometry.paths.map(path =>
      simplifyPath(path.map(([lng, lat]) => [lng, lat]))
    );
    return {
      type: 'Feature',
      properties: {
        surface: f.attributes.SURFACE || '',
        use: f.attributes.TRAIL_USE || '',
        name: f.attributes.FEAT_NAME || '',
      },
      geometry: { type: 'MultiLineString', coordinates: paths },
    };
  });
}

async function main() {
  try {
    const features = await fetchAll();
    console.log(`Fetched ${features.length} trail segments from ArcGIS`);

    const geojson = buildGeoJSON(features);
    const totalCoords = geojson.reduce((sum, f) =>
      sum + f.geometry.coordinates.reduce((s, p) => s + p.length, 0), 0);
    console.log(`Simplified to ${totalCoords} total coordinate points`);

    const ts = `// Auto-generated from Town of Banff ArcGIS REST service
// Source: maps.banff.ca/arcgis/rest/services/Trails/ParksCanadaTrails/MapServer
// Last fetched: ${new Date().toISOString().split('T')[0]}
// ${features.length} trail segments, ${totalCoords} coordinate points

export const trailPolylines = ${JSON.stringify({ type: 'FeatureCollection', features: geojson })};\n`;

    fs.writeFileSync(OUTPUT, ts);
    console.log(`Written to ${OUTPUT} (${(Buffer.byteLength(ts) / 1024).toFixed(0)}KB)`);
  } catch (err) {
    console.error(`Failed to fetch trail polylines: ${err.message}`);
    console.log('Creating fallback empty polylines file...');
    fs.writeFileSync(OUTPUT, `// Trail polylines - fetch failed, will retry next build
export const trailPolylines = { type: 'FeatureCollection', features: [] };\n`);
  }
}

main();
