import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mapPoints, mapDataVersion, mapProvenance } from '../src/data/map.generated';
import { mapCategories } from '../src/data/map';
import { places } from '../src/data/catalog';
import { commerceItems } from '../src/data/commerce';
import { activityById } from '../src/data/planner.generated';
import { buildMapData } from '../scripts/sync-map.mjs';

const source = (name: string) => new URL('../src/data/map-sources/' + name, import.meta.url);
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
const snapshot = JSON.parse(readFileSync(source('osm-source.json'), 'utf8'));
const editorial = JSON.parse(readFileSync(source('editorial.json'), 'utf8'));
const featureById = new Map<string, any>(snapshot.records.map((record: any) => [record.id, record]));
const pointById = new Map(mapPoints.map(point => [point.id, point]));

test('map has useful coverage across thirteen filters and stable, source-bound IDs', () => {
  assert.match(mapDataVersion, /^2026-10-31-[a-f0-9]{12}$/);
  assert.equal(mapPoints.length, mapProvenance.counts.total);
  assert.ok(mapPoints.length > 500);
  assert.equal(new Set(mapPoints.map(point => point.id)).size, mapPoints.length);
  assert.equal(mapCategories.length, 13);
  for (const category of mapCategories) {
    const points = mapPoints.filter(point => point.category === category.id);
    assert.ok(points.length > 0, category.id);
    assert.equal(points.length, mapProvenance.counts[category.id]);
  }
  for (const point of mapPoints) {
    assert.ok(point.name.trim() && point.description.trim() && point.coordinateNote.trim(), point.id);
    assert.ok(point.latitude >= 49 && point.latitude <= 53 && point.longitude >= -118 && point.longitude <= -114, point.id);
    assert.ok(point.sources.length > 0, point.id);
    assert.ok(!/<\/?(?:script|iframe|style)\b/i.test(JSON.stringify(point)), point.id);
    for (const key of ['open', 'openNow', 'available', 'price', 'hours', 'liveCapacity', 'guaranteedAccessible']) assert.equal(key in point, false, point.id);
    for (const url of [point.menuUrl, point.websiteUrl, point.guideUrl, ...point.sources.map(source => source.url)].filter(Boolean)) {
      const parsed = new URL(url!);
      assert.equal(parsed.protocol, 'https:', point.id);
      assert.equal(parsed.username + parsed.password, '', point.id);
    }
  }
});

test('every OSM coordinate is the unchanged primary node or feature centre with explicit provenance', () => {
  for (const point of mapPoints.filter(point => point.id.startsWith('osm-'))) {
    const binding = mapProvenance.coordinateSources[point.id as keyof typeof mapProvenance.coordinateSources];
    assert.ok('osmIds' in binding, point.id);
    const primary = featureById.get((binding as any).osmIds[0]);
    assert.equal(point.latitude, primary.latitude, point.id);
    assert.equal(point.longitude, primary.longitude, point.id);
    assert.equal(point.coordinateNote.includes('community-mapped'), true, point.id);
    if (primary.coordinateKind === 'bounding-box-center') assert.match(point.coordinateNote, /approximate bounding-box centre/);
    assert.doesNotMatch(point.coordinateNote, /officially verified|surveyed entrance is|navigation-ready/i);
    for (const id of (binding as any).osmIds) assert.ok(point.sources.some(source => source.kind === 'osm' && source.url === 'https://www.openstreetmap.org/' + id), point.id);
  }
});

test('all eleven publisher hotel locators preserve exact documented coordinates and original seven places', () => {
  assert.equal(editorial.hotels.length, 11);
  assert.equal(mapPoints.filter(point => point.id.startsWith('property-')).length, 11);
  for (const hotel of editorial.hotels) {
    const point = pointById.get('property-' + hotel.id)!;
    assert.ok(point, hotel.id);
    assert.equal(point.latitude, hotel.latitude);
    assert.equal(point.longitude, hotel.longitude);
    assert.equal(point.coordinateNote, hotel.coordinateNote);
    assert.ok(point.sources.some(source => source.url === hotel.coordinateSource && source.checkedAt === hotel.coordinateCheckedOn));
    assert.equal(mapProvenance.coordinateSources[point.id as keyof typeof mapProvenance.coordinateSources].kind, 'publisher-locator');
  }
  const original = places.filter(place => place.coordinateStatus === 'verified');
  assert.equal(original.length, 7);
  for (const place of original) {
    const point = pointById.get('property-' + place.id)!;
    assert.equal(point.latitude, place.latitude);
    assert.equal(point.longitude, place.longitude);
    assert.equal(point.relatedPlaceId, place.id);
    assert.ok(point.sources.some(source => source.url === place.coordinateSource));
  }
});

test('reviewed dining facts and menus follow exact venue identities, not nearby businesses', () => {
  const bison = pointById.get('osm-node-2128380227')!;
  assert.equal(bison.name, 'The Bison Restaurant');
  assert.equal(bison.cuisine, 'Seasonal Canadian');
  assert.equal(bison.menuUrl, 'https://www.thebison.ca/menu');
  assert.equal(bison.relatedPlaceId, 'the-bison-restaurant');
  const blake = pointById.get('osm-way-362080654')!;
  assert.equal(blake.menuUrl, 'https://www.blakecanmore.com/blake-menu');
  const pd3 = mapPoints.filter(point => point.name === 'PD3 by Blake');
  assert.equal(pd3.length, 1);
  assert.equal(pd3[0].menuUrl, undefined);
  assert.equal(pd3[0].websiteUrl, undefined);
  assert.match(pd3[0].description, /confirm.*current identity/i);
  const fairview = pointById.get('osm-node-1623439428')!;
  const walliser = pointById.get('osm-node-1623439435')!;
  assert.equal(fairview.menuUrl, 'https://www.chateau-lake-louise.com/dine/fairview-bar-restaurant/');
  assert.equal(walliser.menuUrl, 'https://www.chateau-lake-louise.com/dine/walliser-stube/');
  for (const point of mapPoints.filter(point => point.menuUrl)) {
    const exactVenue = editorial.dining.find((venue: any) => venue.osmIds.some((id: string) => point.sources.some(source => source.url === 'https://www.openstreetmap.org/' + id)));
    assert.ok(exactVenue && exactVenue.status === 'selected-facts', point.id);
    assert.equal(point.menuUrl, exactVenue.menuUrl);
    assert.ok(point.sources.some(source => source.kind === 'operator' && source.checkedAt === exactVenue.checkedAt));
  }
});

test('explicitly restricted facilities and known closed permanent facilities are excluded', () => {
  for (const point of mapPoints.filter(point => ['toilets', 'parking', 'water', 'walks', 'services', 'viewpoints', 'transit'].includes(point.category))) {
    for (const source of point.sources.filter(source => source.kind === 'osm')) {
      const raw = featureById.get(source.url.replace('https://www.openstreetmap.org/', ''));
      assert.doesNotMatch(raw.tags.access || '', /(?:^|[;,\s])(?:private|no|customers|permit|residents|delivery)(?:$|[;,\s])/i, point.id);
    }
  }
  for (const id of ['node/2958087898', 'way/1211716532', 'way/1384774801']) {
    assert.equal(mapPoints.some(point => point.sources.some(source => source.url === 'https://www.openstreetmap.org/' + id)), false);
    assert.ok(mapProvenance.exclusions.some(item => item.id === id));
  }
  const louise = pointById.get('osm-node-1623434017')!;
  assert.equal(louise.name, 'Public Washrooms'); assert.equal(louise.area, 'louise'); assert.equal(louise.category, 'toilets');
  assert.ok(louise.facilities?.some(facility => facility.label === 'Access in map data'));
});

test('dedup retains all source identities without merging different branches or opposite-direction stops', () => {
  const goat = mapPoints.filter(point => point.name === 'The Iron Goat Pub & Grill');
  assert.equal(goat.length, 1);
  for (const id of ['node/5586370422', 'way/360369802']) assert.ok(goat[0].sources.some(source => source.url.endsWith(id)));
  const park = mapPoints.filter(point => point.name === 'Park Distillery'); assert.equal(park.length, 1);
  for (const id of ['node/4423693589', 'way/476718879']) assert.ok(park[0].sources.some(source => source.url.endsWith(id)));
  const base = { schemaVersion: 1, baseTimestamp: snapshot.baseTimestamp, records: [] as any[] };
  const context = { ...editorial, dining: [], hotels: [], identityMatches: {}, excluded: [] };
  const feature = (id: number, lat: number, tags: object) => ({ id: 'node/' + id, latitude: lat, longitude: -115.57, coordinateKind: 'mapped-node', tags });
  const sample = buildMapData({ ...base, records: [feature(1,51.177,{name:'Same Name',amenity:'restaurant','addr:street':'Bear Street'}),feature(2,51.181,{name:'Same Name',amenity:'restaurant','addr:street':'Banff Avenue'}),feature(3,51.177,{name:'Banff Avenue',highway:'bus_stop'}),feature(4,51.1773,{name:'Banff Avenue',highway:'bus_stop'})] }, context);
  assert.equal(sample.mapPoints.length, 4);
});

test('negative access, lifecycle, water and unsafe-URL fixtures fail closed', () => {
  const tags = [
    { amenity:'toilets',access:'customers' }, {amenity:'parking',access:'private',name:'Private lot'},
    {amenity:'drinking_water',drinking_water:'no'}, {amenity:'toilets','demolished:amenity':'toilets'},
    {amenity:'parking'}, {amenity:'fountain'},
    {amenity:'restaurant',name:'</script>Test<script>',website:'javascript:alert(1)'},
  ];
  const records = tags.map((tags,index) => ({id:'node/'+(900000+index),latitude:51.17+index*0.001,longitude:-115.57,coordinateKind:'mapped-node',tags}));
  const sample = buildMapData({...snapshot,records},{...editorial,dining:[],hotels:[],excluded:[],identityMatches:{}});
  assert.equal(sample.mapPoints.length,1);
  assert.equal(sample.mapPoints[0].name,'Test');
  assert.equal(sample.mapPoints[0].websiteUrl,undefined);
  assert.equal(sample.mapPoints[0].menuUrl,undefined);
  assert.throws(()=>buildMapData({...snapshot,records:[records[0],records[0]]},editorial),/duplicate OSM identity/);
});

test('place, planner and affiliate relationships resolve without historical rental pins', () => {
  const placeIds = new Set(places.map(place => place.id)), commerceIds = new Set(commerceItems.map(item => item.id));
  for (const point of mapPoints) {
    if (point.relatedPlaceId) assert.ok(placeIds.has(point.relatedPlaceId), point.id);
    for (const activity of point.relatedActivityIds || []) assert.ok(activityById[activity], point.id);
    for (const id of point.commerceItemIds || []) { assert.ok(commerceIds.has(id), point.id); assert.equal(id.startsWith('rental-'),false); }
  }
  assert.equal(mapPoints.some(point=>point.relatedPlaceId==='cross-country-skiing'),false);
});

test('separate ODbL download contains no editorial menus or publisher coordinates and hashes reproduce', async () => {
  const exportedText=await readFile(source('osm-points.json'),'utf8'), exported=JSON.parse(exportedText);
  assert.equal(hash(exportedText),mapProvenance.downloadableSha256);
  assert.equal(exported.dataVersion,mapDataVersion);
  assert.equal(exported.points.length,mapProvenance.counts.osmPoints);
  assert.equal(exported.attribution,'© OpenStreetMap contributors');
  assert.equal(exported.licence,'https://opendatacommons.org/licenses/odbl/1-0/');
  for(const point of exported.points){assert.equal(point.menuUrl,undefined);assert.equal(point.relatedPlaceId,undefined);assert.equal(point.commerceItemIds,undefined);assert.ok(point.sources.every((source:any)=>source.kind==='osm'));}
  assert.equal(hash(await readFile(source('osm-source.json'))),mapProvenance.inputHashes['osm-source.json']);
  assert.equal(hash(await readFile(source('editorial.json'))),mapProvenance.inputHashes['editorial.json']);
  const licence=await readFile(source('LICENCE.txt'),'utf8');assert.match(licence,/Open Database License/);assert.match(licence,/share-alike/);
  execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/sync-map.mjs',import.meta.url)),'--check'],{stdio:'pipe'});
});
