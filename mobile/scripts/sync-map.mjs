#!/usr/bin/env node
/** Deterministic, network-free generation from the separately licensed map snapshot and editorial sidecar. */
import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = path.join(root, 'src/data/map-sources');
const sha = value => createHash('sha256').update(value).digest('hex');
const categoryLabels = { restaurants: 'Restaurant', cafes: 'Café or bar', activities: 'Attraction', toilets: 'Toilets', parking: 'Parking', transit: 'Transit stop', viewpoints: 'Viewpoint', stays: 'Hotel or hostel', water: 'Drinking-water point', fuel: 'Fuel or charging', services: 'Visitor service', walks: 'Park or garden', lakes: 'Lake or pond' };
const areaLabels = { banff: 'Banff', louise: 'Lake Louise', canmore: 'Canmore', regional: 'the surrounding Rockies' };
const clean = (value, limit = 400) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/<[^>]*>/g, '').trim().slice(0, limit) : '';
const safeUrl = value => {
  if (typeof value !== 'string' || value !== value.trim()) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || /[<>]/.test(value)) return undefined;
    if ([...url.searchParams.keys()].some(key => /^(?:gclid|fbclid|device.?id|user.?id|session.?id|email)$/i.test(key))) return undefined;
    return value;
  } catch { return undefined; }
};
const restricted = tags => /(?:^|[;,\s])(?:private|no|customers|permit|residents|delivery)(?:$|[;,\s])/i.test(tags.access || '');
const coordinateValid = item => Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && item.latitude >= 49 && item.latitude <= 53 && item.longitude >= -118 && item.longitude <= -114;
function areaOf(item) {
  const { latitude: lat, longitude: lon } = item;
  if (lat >= 51.06 && lat <= 51.13 && lon >= -115.42 && lon <= -115.29) return 'canmore';
  if (lat >= 51.30 && lat <= 51.46 && lon >= -116.27 && lon <= -116.13) return 'louise';
  if (lat >= 51.14 && lat <= 51.29 && lon >= -115.62 && lon <= -115.30) return 'banff';
  return 'regional';
}
function categoryOf(tags) {
  const a = tags.amenity, t = tags.tourism;
  if (a === 'toilets') return 'toilets';
  if (a === 'parking') return 'parking';
  if (a === 'drinking_water' && tags.drinking_water !== 'no') return 'water';
  if (['fuel', 'charging_station'].includes(a)) return 'fuel';
  if (a === 'restaurant') return 'restaurants';
  if (['cafe', 'bar', 'pub'].includes(a)) return 'cafes';
  if (['hotel', 'hostel', 'motel'].includes(t)) return 'stays';
  if (a === 'bus_station' || tags.highway === 'bus_stop' || (tags.public_transport === 'platform' && tags.bus !== 'no')) return 'transit';
  if (tags.natural === 'water' && ['lake', 'pond'].includes(tags.water) && tags.name) return 'lakes';
  if (t === 'viewpoint') return 'viewpoints';
  if (['attraction', 'museum'].includes(t) || tags.aerialway === 'station') return 'activities';
  if (['park', 'garden', 'nature_reserve'].includes(tags.leisure) && tags.name) return 'walks';
  if (['bicycle_rental', 'pharmacy', 'post_office'].includes(a)) return 'services';
  if (t === 'information' && (['office', 'visitor_centre', 'visitor_center'].includes(tags.information) || /visitor|tourist.*(?:information|centre|center)/i.test(tags.name || ''))) return 'services';
  return undefined;
}
const family = category => ['restaurants', 'cafes'].includes(category) ? 'food' : category;
const nameKey = name => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').split(' ').filter(x => x && !['the', 'and', 'restaurant', 'restaurants', 'bar', 'pub', 'grill', 'kitchen', 'brewhouse', 'brewery', 'cafe', 'hotel', 'motel', 'inn', 'suites', 'resort'].includes(x)).join(' ');
function metres(a, b) {
  const r = Math.PI / 180, dlat = (b.latitude - a.latitude) * r, dlon = (b.longitude - a.longitude) * r;
  return 12742000 * Math.asin(Math.min(1, Math.sqrt(Math.sin(dlat / 2) ** 2 + Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dlon / 2) ** 2)));
}
function plainPoint(record, snapshot) {
  const t = record.tags, area = areaOf(record), category = categoryOf(t);
  const name = clean(t['name:en'] || t.name, 160) || `${categoryLabels[category]} · ${areaLabels[area]}`;
  const centre = record.coordinateKind === 'bounding-box-center';
  let description = `${categoryLabels[category]} mapped in ${areaLabels[area]}. Check current access and details before making a special journey.`;
  if (category === 'toilets') description = 'A mapped toilet location. Public access, seasonal opening and facilities need checking before you rely on this stop.';
  if (category === 'parking') description = 'A mapped parking location. Check the current access rules, signs, vehicle restrictions and fees; this point does not show available spaces.';
  if (category === 'water') description = 'A mapped drinking-water point. Current operation, water quality and seasonal supply have not been checked.';
  if (category === 'transit') description = 'A mapped transport stop or station. Check the operator’s current stop, route, timetable and boarding instructions for your journey.';
  if (category === 'lakes') description = 'A mapped lake or pond area. The marker identifies the water feature, not a shore entrance, swimming location, skating area or safe route.';
  const websiteUrl = safeUrl(t.website || t['contact:website']);
  const address = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
  const facilities = [];
  if (t.access) facilities.push({ label: 'Access in map data', value: `${clean(t.access, 80)} — check local signs and current arrangements.` });
  if (t.seasonal) facilities.push({ label: 'Seasonality in map data', value: `${clean(t.seasonal, 80)} — confirm the actual operating dates.` });
  const point = { id: 'osm-' + record.id.replace('/', '-'), name, category, latitude: record.latitude, longitude: record.longitude, area, description, ...(address ? { address: clean(address, 180) } : {}), highlights: ['Check current details'], ...(facilities.length ? { facilities } : {}), ...(websiteUrl ? { websiteUrl } : {}), coordinateNote: centre ? 'OpenStreetMap community-mapped feature area. This is its approximate bounding-box centre, not a surveyed entrance, trailhead, boarding point or accessible approach.' : 'OpenStreetMap community-mapped point. Its location is not a surveyed entrance, trailhead, boarding point or accessible approach.', sources: [{ label: 'OpenStreetMap contributors · ' + record.id, url: 'https://www.openstreetmap.org/' + record.id, checkedAt: snapshot.baseTimestamp, kind: 'osm' }] };
  return { point, ids: [record.id], record, named: Boolean(t.name || t['name:en']) };
}

export function buildMapData(snapshot, editorial) {
  if (snapshot.schemaVersion !== 1 || editorial.schemaVersion !== 1 || !Array.isArray(snapshot.records) || !snapshot.baseTimestamp || Number.isNaN(Date.parse(snapshot.baseTimestamp))) throw new Error('Invalid map source schema or timestamp');
  const seen = new Set(), rejected = [], candidates = [];
  const excluded = new Map(editorial.excluded.map(item => [item.osmId, item]));
  for (const record of snapshot.records) {
    if (!/^(?:node|way|relation)\/\d+$/.test(record.id) || seen.has(record.id)) throw new Error('Invalid or duplicate OSM identity: ' + record.id);
    seen.add(record.id);
    if (!coordinateValid(record) || !record.tags || !['mapped-node', 'bounding-box-center'].includes(record.coordinateKind)) throw new Error('Invalid mapped coordinate: ' + record.id);
    const t = record.tags, category = categoryOf(t), name = clean(t['name:en'] || t.name);
    let reason = excluded.get(record.id)?.reason;
    if (!category) reason ||= 'Outside selected visitor categories';
    if (Object.keys(t).some(key => /^(?:disused|abandoned|demolished|removed|construction):/.test(key)) || ['construction', 'demolished'].includes(t.building)) reason ||= 'Lifecycle or construction tag';
    if (['toilets', 'parking', 'water', 'walks', 'services', 'viewpoints', 'transit'].includes(category) && restricted(t)) reason ||= 'Restricted access tag';
    if (category === 'parking' && !name && !['yes', 'public', 'permissive', 'designated'].includes(t.access)) reason ||= 'Unnamed parking without documented visitor access';
    if (['restaurants', 'cafes', 'stays', 'activities', 'fuel'].includes(category) && !name) reason ||= 'Unidentified venue';
    if (category === 'transit' && /school|collegiate/i.test(name)) reason ||= 'School transport is not a reviewed visitor stop';
    if (reason) { rejected.push({ id: record.id, reason }); continue; }
    candidates.push(plainPoint(record, snapshot));
  }
  // Explicit exact-venue mappings also resolve node/building records whose names differ.
  const exactDining = new Map(editorial.dining.flatMap(venue => venue.osmIds.map(id => [id, venue.id])));
  const exactHotel = new Map(editorial.hotels.flatMap(hotel => hotel.osmIds.map(id => [id, hotel.id])));
  const groups = [];
  candidates.sort((a, b) => Number(b.record.coordinateKind === 'mapped-node') - Number(a.record.coordinateKind === 'mapped-node') || a.record.id.localeCompare(b.record.id));
  for (const candidate of candidates) {
    const key = nameKey(candidate.point.name), identity = exactDining.get(candidate.record.id) || exactHotel.get(candidate.record.id);
    const duplicate = groups.find(group => {
      if (family(group.point.category) !== family(candidate.point.category)) return false;
      if (identity && group.ids.some(id => exactDining.get(id) === identity || exactHotel.get(id) === identity)) return true;
      if (!candidate.named || !group.named) return !candidate.named && !group.named && candidate.point.category === group.point.category && metres(group.point, candidate.point) < 10;
      // Opposite-direction bus stops can have the same name across the road.
      const threshold = candidate.point.category === 'transit' ? 12 : 65;
      return key && key === nameKey(group.point.name) && metres(group.point, candidate.point) < threshold;
    });
    if (duplicate) { duplicate.ids.push(...candidate.ids); duplicate.point.sources.push(...candidate.point.sources); }
    else groups.push(candidate);
  }
  const publisherHotels = new Set(editorial.hotels.map(h => h.id));
  const retained = groups.filter(group => !group.ids.some(id => publisherHotels.has(exactHotel.get(id))));
  const osmPoints = retained.map(group => ({ ...group.point }));
  const editorialOverrides = {};
  const placeFacts = new Map(editorial.placeFacts.map(place => [place.id, place]));
  const commerceFor = placeId => editorial.commerceIdentities.filter(c => c.relatedPlaceIds.includes(placeId)).map(c => c.id);
  for (const group of retained) {
    const venue = editorial.dining.find(v => v.osmIds.some(id => group.ids.includes(id)));
    const placeId = group.ids.map(id => editorial.identityMatches[id]).find(Boolean) || (venue && placeFacts.has(venue.id) ? venue.id : undefined);
    const place = placeFacts.get(placeId);
    const patch = {};
    if (venue) {
      patch.name = venue.name; patch.description = venue.description; patch.highlights = venue.highlights;
      if (venue.address) patch.address = venue.address;
      if (venue.cuisine) patch.cuisine = venue.cuisine;
      if (safeUrl(venue.menuUrl)) patch.menuUrl = venue.menuUrl;
      if (safeUrl(venue.websiteUrl)) patch.websiteUrl = venue.websiteUrl;
      patch.guideUrl = 'https://banffbound.com/restaurants/';
      patch.details = [{ title: 'Service and booking', body: venue.serviceNote }, { title: 'Getting there', body: venue.journeyNote }, ...venue.notices.map(n => ({ title: n.label, body: n.text }))];
      patch.sources = [...group.point.sources, ...venue.sources.map(source => ({ ...source, checkedAt: venue.checkedAt || editorial.reviewedAt, kind: 'operator' }))];
    } else if (place) {
      // Only exact mapped identities receive an existing place description and affiliate relationship.
      patch.description = place.description; patch.guideUrl = place.guideUrl; patch.highlights = [];
      patch.details = [{ title: 'Plan the visit', body: place.tips.join(' ') }];
      patch.sources = [...group.point.sources, { label: 'Reviewed visitor information', url: place.sourceUrl, checkedAt: place.reviewedAt, kind: 'official' }];
    }
    if (place) {
      patch.relatedPlaceId = place.id;
      if (place.plannerActivityId) patch.relatedActivityIds = [place.plannerActivityId];
      const commerce = commerceFor(place.id); if (commerce.length) patch.commerceItemIds = commerce;
    }
    if (Object.keys(patch).length) editorialOverrides[group.point.id] = patch;
  }
  const publisherPoints = editorial.hotels.map(hotel => {
    if (!coordinateValid(hotel) || !safeUrl(hotel.coordinateSource)) throw new Error('Invalid publisher hotel locator: ' + hotel.id);
    const place = placeFacts.get(hotel.id);
    return { id: 'property-' + hotel.id, name: hotel.name, category: 'stays', area: /canmore/i.test(hotel.area) ? 'canmore' : /louise/i.test(hotel.area) ? 'louise' : /harvie|castle|parkway/i.test(hotel.area) ? 'regional' : 'banff', latitude: hotel.latitude, longitude: hotel.longitude, description: hotel.description, ...(hotel.address ? { address: hotel.address } : {}), highlights: ['Check the current room and booking terms'], details: [{ title: 'Source review', body: hotel.sourceScope }, ...(hotel.operationNote ? [{ title: 'Before booking', body: hotel.operationNote }] : [])], guideUrl: hotel.guideUrl, ...(place ? { relatedPlaceId: place.id } : {}), commerceItemIds: ['hotel-' + hotel.id], coordinateNote: hotel.coordinateNote, sources: [{ label: 'Documented publisher property locator', url: hotel.coordinateSource, checkedAt: hotel.coordinateCheckedOn, kind: 'operator' }, ...hotel.sourceLinks.map(source => ({ ...source, checkedAt: hotel.coordinateCheckedOn, kind: 'operator' }))] };
  });
  const mapPoints = [...osmPoints.map(point => ({ ...point, ...editorialOverrides[point.id] })), ...publisherPoints].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id));
  const counts = Object.fromEntries(Object.keys(categoryLabels).map(category => [category, mapPoints.filter(point => point.category === category).length]));
  return { mapPoints, osmPoints, editorialOverrides, publisherPoints, counts, rejected, duplicates: groups.filter(group => group.ids.length > 1).map(group => ({ retainedId: group.point.id, osmIds: group.ids })), coordinateSources: Object.fromEntries([...retained.map(group => [group.point.id, { kind: group.record.coordinateKind, osmIds: group.ids }]), ...publisherPoints.map(point => [point.id, { kind: 'publisher-locator', sourceUrl: point.sources[0].url }])]) };
}

export async function generateMap({ check = false, sourceRoot = process.env.BANFFBOUND_MAP_SOURCE_ROOT || path.resolve(root, '..') } = {}) {
  const rawText = await readFile(path.join(sourceDir, 'osm-source.json'), 'utf8');
  const editorialText = await readFile(path.join(sourceDir, 'editorial.json'), 'utf8');
  const snapshot = JSON.parse(rawText), editorial = JSON.parse(editorialText);
  // All inputs used for the editorial extraction are pinned by bytes, including
  // transitive website modules and the immutable mobile place/commerce snapshots.
  if (!/^[a-f0-9]{40}$/.test(editorial.sourceCommit)) throw new Error('Invalid editorial source commit');
  for (const input of editorial.sourceFiles) {
    if (!/^(?:src\/data\/[\w.-]+\.ts|mobile\/src\/data\/[\w.-]+\.generated\.ts)$/.test(input.path)) throw new Error('Invalid editorial input path');
    const actual = await readFile(path.join(sourceRoot, input.path));
    if (sha(actual) !== input.sha256) throw new Error('Reviewed map source changed: ' + input.path);
  }
  const data = buildMapData(snapshot, editorial);
  const inputHashes = { 'osm-source.json': sha(rawText), 'editorial.json': sha(editorialText), 'sync-map.mjs': sha(await readFile(fileURLToPath(import.meta.url))) };
  const version = snapshot.baseTimestamp.slice(0, 10) + '-' + sha(JSON.stringify(inputHashes)).slice(0, 12);
  const downloadable = { schemaVersion: 1, dataVersion: version, attribution: snapshot.attribution, licence: snapshot.licence, copyrightUrl: 'https://www.openstreetmap.org/copyright', source: snapshot.source, query: snapshot.query, queriedAt: snapshot.queriedAt, baseTimestamp: snapshot.baseTimestamp, inputSha256: inputHashes['osm-source.json'], note: 'Separately licensed OpenStreetMap-derived map records. Node positions and approximate feature centres are not surveyed entrances or current operating information. Original BanffBound editorial enrichment and publisher locators are supplied separately.', points: data.osmPoints };
  const exportText = JSON.stringify(downloadable, null, 2) + '\n';
  const provenance = { schemaVersion: 1, dataVersion: version, sourceCommit: editorial.sourceCommit, sourceSnapshotAt: snapshot.baseTimestamp, queriedAt: snapshot.queriedAt, inputHashes, editorialSourceFiles: editorial.sourceFiles, licence: snapshot.licence, attribution: snapshot.attribution, downloadablePath: '/app/map-data/osm-points.json', rawSnapshotPath: '/app/map-data/osm-source.json', licencePath: '/app/map-data/LICENCE.txt', downloadableSha256: sha(exportText), counts: { total: data.mapPoints.length, osmPoints: data.osmPoints.length, documentedPublisherLocators: data.publisherPoints.length, rawOsmFeatures: snapshot.records.length, duplicateGroups: data.duplicates.length, rejectedFeatures: data.rejected.length, ...data.counts }, duplicates: data.duplicates, exclusions: data.rejected, coordinateSources: data.coordinateSources, limits: ['Community mapping and dated publisher locators; not surveyed entrances or navigation.', 'No live opening, occupancy, operation, accessibility, drinking-water quality or availability inference.', 'Menus are official reviewed links only; no copied menu items, prices or automatic vendor requests.'] };
  const serialise = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
  const generated = `/* Generated by mobile/scripts/sync-map.mjs. OSM base records are separately downloadable under ODbL; editorial enrichment and publisher locators retain separate provenance. */\nimport type { MapPoint } from './map';\n\nconst osmPoints: MapPoint[] = ${serialise(data.osmPoints)};\nconst editorialOverrides: Record<string, Partial<MapPoint>> = ${serialise(data.editorialOverrides)};\nconst publisherPoints: MapPoint[] = ${serialise(data.publisherPoints)};\nexport const mapPoints: MapPoint[] = [...osmPoints.map(point => ({ ...point, ...editorialOverrides[point.id] })), ...publisherPoints].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id));\nexport const mapDataVersion = ${JSON.stringify(version)};\nexport const mapProvenance = ${serialise(provenance)} as const;\n`;
  const outputs = [[path.join(root, 'src/data/map.generated.ts'), generated], [path.join(sourceDir, 'osm-points.json'), exportText], [path.join(sourceDir, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n']];
  for (const [file, value] of outputs) {
    if (check) { if (await readFile(file, 'utf8').catch(() => '') !== value) throw new Error('Map output drift: ' + path.relative(root, file)); }
    else { const pending = file + '.' + process.pid + '.pending'; await writeFile(pending, value); await rename(pending, file); }
  }
  return { version, ...provenance.counts };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2);
  let sourceRoot;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--check') continue;
    if (args[index] === '--source-root' && args[index + 1]) { sourceRoot = path.resolve(args[++index]); continue; }
    if (args[index].startsWith('--source-root=')) { sourceRoot = path.resolve(args[index].slice('--source-root='.length)); continue; }
    throw new Error('Supported arguments: --check, --source-root=<reviewed checkout>');
  }
  generateMap({ check: args.includes('--check'), ...(sourceRoot ? { sourceRoot } : {}) })
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
