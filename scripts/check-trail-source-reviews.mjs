import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// No site build and no network. Exercise the exported projection, not unused raw records.
const { outputFiles } = await build({
  stdin: { contents: "export { trails } from './src/data/trails.ts'; export { hikingSourceReviews, applyTrailSourceReviews } from './src/data/trailSourceReviews.ts';", resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const { trails, hikingSourceReviews, applyTrailSourceReviews } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const bySlug = new Map(trails.map(trail => [trail.slug, trail]));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
assert.equal(trails.length, 81);
assert.equal(bySlug.size, 81);
assert.equal(new Set(trails.map(trail => trail.id)).size, 81);
assert.equal(hash(trails.map(t => [t.id, t.slug, t.lat, t.lng, t.image])),
  '5d6d420e7328da091599df50e8bf15bf7bb96de4acad851c7d1bbcc404e4315d',
  'All 81 pre-audit IDs, public slugs, indicative coordinates and retained image URLs must survive unchanged.');
assert.equal(Object.keys(hikingSourceReviews).length, 58);
assert.equal(trails.filter(t => t.sourceReview.status === 'reviewed').length, 80);
assert.equal(trails.filter(t => t.directoryEligible !== false).length, 80);
assert.deepEqual(trails.filter(t => !t.routeVerified).map(t => t.slug), ['golf-course-loop-xc-ski']);

const priorKeys = ['id','slug','name','distance','elevationGain','elevationLoss','time','season','area','park','province','reviewedAt','trailhead','parksCanadaUrl','transitAccessible','transitRoute','accessNote','winterNote','currentNotice','sourceUrls','directoryEligible','difficulty','description','longDescription','highlights'];
const prior = trails.filter(t => !Object.hasOwn(hikingSourceReviews, t.slug)).map(t => {
  const result = {};
  for (const key of priorKeys) if (t[key] !== undefined) result[key] = t[key];
  return result;
});
assert.equal(prior.length, 23);
assert.equal(hash(prior), 'f36383c80c6b6d5179128bdd51c18de513b12dda198504e451bc0a3f43178716',
  'Preserve all previously reviewed route facts, prose, dates and source links, with only the documented Ink Pots Moderate correction.');
assert.equal(bySlug.get('ink-pots').difficulty, 'moderate');

for (const trail of trails) {
  assert.ok(trail.sourceReview.scope.length > 70, `${trail.slug}: explicit review scope`);
  assert.ok(trail.reviewedAt && trail.sourceUrls?.length, `${trail.slug}: date and evidence inventory`);
  assert.equal(trail.status, 'unknown', `${trail.slug}: a review is not a live status`);
  assert.equal(trail.imageStatus, 'illustrative', `${trail.slug}: no photo identity was verified`);
  assert.match(trail.imageNote, /not verified as this route/);
  for (const key of ['conditionNote', 'conditionUpdated', 'parkingCapacity', 'crowdLevel']) {
    assert.equal(trail[key], undefined, `${trail.slug}: no synthetic current ${key}`);
  }
}
for (const slug of Object.keys(hikingSourceReviews)) {
  const trail = bySlug.get(slug);
  assert.ok(trail, `${slug}: review cannot create a new public URL`);
  assert.equal(trail.season, 'summer', `${slug}: summer evidence must not assign winter suitability`);
  assert.equal(trail.reviewedAt, '2026-10-29');
  assert.ok(trail.sourceReview.officialName && trail.sourceReview.officialGrade && trail.sourceReview.distanceBasis);
  assert.match(trail.parksCanadaUrl, /^https:\/\/parks\.canada\.ca\//);
  assert.ok(trail.longDescription.split(/\s+/).length >= 85, `${slug}: useful route-specific planning, not a placeholder`);
  assert.ok(trail.highlights.length >= 3);
  assert.ok(!/all fitness levels|guaranteed wildlife|guaranteed views|perfect for|hidden gem|I hiked|we hiked|best time is|arrive before \d|empty parking|zero crowds/i.test(trail.longDescription), `${slug}: no invented experience, occupancy or universal suitability`);
}

// Endpoint and direction regressions that materially change a day plan.
assert.match(bySlug.get('twin-lakes').name, /Lower Twin Lake/);
assert.match(bySlug.get('twin-lakes').distance, /7\.4 km one way.*Lower Twin.*Arnica/);
const connector = bySlug.get('sheol-paradise-connector');
assert.equal(connector.sourceReview.distanceBasis, 'connector');
assert.match(connector.distance, /approaches excluded/);
assert.match(connector.time, /one way.*connector only/);
assert.match(connector.elevationLoss, /540 m from Saddleback towards Paradise/);
assert.match(connector.longDescription, /opposite way.*climbing/);
assert.match(bySlug.get('sunshine-meadows').distance, /10\.3.*network, not one loop/);
assert.equal(bySlug.get('sunshine-meadows').province, 'Alberta / British Columbia');
assert.match(bySlug.get('sunshine-meadows').park, /Mount Assiniboine/);
assert.match(bySlug.get('sunshine-meadows').longDescription, /2026 summer season has finished/);
assert.match(bySlug.get('sunshine-meadows').longDescription, /10\.2 km/);
assert.match(bySlug.get('cory-pass-loop').distance, /11\.7 km loop/);
assert.match(bySlug.get('cory-pass-loop').longDescription, /conflicting 13 km one-way/);
assert.match(bySlug.get('mistaya-canyon').distance, /0\.6 km one way/);
assert.match(bySlug.get('mistaya-canyon').longDescription, /overview table says 0\.5/);
assert.match(bySlug.get('sundance-canyon').distance, /3\.7.*2\.1/);
assert.match(bySlug.get('sundance-canyon').longDescription, /9\.5 km/);
assert.equal(bySlug.get('sundance-canyon').difficulty, 'moderate');
assert.match(bySlug.get('bourgeau-lake').distance, /6\.7 km one way/);
assert.match(bySlug.get('harvey-pass').distance, /8\.9 km one way from Bourgeau/);
assert.match(bySlug.get('vista-lake').elevationGain, /Not stated/);
assert.match(bySlug.get('vista-lake').elevationLoss, /110 m one way/);
assert.match(bySlug.get('fenland-trail').elevationLoss, /Not stated/);
assert.match(bySlug.get('moraine-lake-lakeshore').elevationGain, /^Minimal/);
assert.match(bySlug.get('taylor-lake').elevationLoss, /^0 m.*explicitly published/);
assert.equal(bySlug.get('taylor-lake').difficulty, 'moderate');
assert.match(bySlug.get('boom-lake').trailhead, /Banff National Park/);
assert.match(bySlug.get('healy-pass').trailhead, /Sunshine base/);
assert.match(bySlug.get('hidden-lake').trailhead, /Fish Creek/);
assert.match(bySlug.get('hidden-lake').accessNote, /No lift access/);
assert.match(bySlug.get('bow-river-lake-louise').accessNote, /May 15–October 15/);
assert.match(bySlug.get('tramline').accessNote, /current lower.*May 15–October 15/);
for (const slug of ['aylmer-lookout', 'aylmer-pass']) {
  const t = bySlug.get(slug);
  assert.match(t.accessNote, /July 10–September 15/);
  assert.match(t.accessNote, /at least four/);
  assert.match(t.accessNote, /dogs and cycling are prohibited/);
}
for (const slug of ['moraine-lake-lakeshore','consolation-lakes','eiffel-lake','larch-valley-minnestimma-lakes','sentinel-pass-via-larch-valley','wenkchemna-pass']) {
  assert.match(bySlug.get(slug).transitRoute, /closed to personal vehicles year-round/);
  assert.match(bySlug.get(slug).transitRoute, /2026 season ended October 12/);
}
for (const slug of ['lake-annette','eiffel-lake','saddleback-pass','fairview-mountain','hidden-lake','castle-lookout','taylor-lake']) {
  assert.match(bySlug.get(slug).winterNote, /mid-October to mid-June/);
}
assert.notEqual(bySlug.get('sentinel-pass-from-paradise-valley').distance, bySlug.get('sentinel-pass-via-larch-valley').distance);
assert.match(bySlug.get('fairview-lookout').longDescription, /not Fairview Mountain/);
assert.match(bySlug.get('consolation-lakes').distance, /first Consolation Lake/);
assert.match(bySlug.get('sunset-lookout').longDescription, /not advice to start late/);

// Unknown future records must not acquire a false review merely by passing through the projection.
const unknownInput = { ...bySlug.get('fenland-trail'), slug: 'unreviewed-fixture', sourceReview: undefined, reviewedAt: undefined, sourceUrls: undefined };
const [unknown] = applyTrailSourceReviews([unknownInput]);
assert.equal(unknown.routeVerified, false);
assert.equal(unknown.directoryEligible, false);
assert.equal(unknown.sourceReview.status, 'unverified');
assert.equal(unknownInput.routeVerified, true, 'Projection must not mutate its input.');

const detail = await readFile('src/pages/trails/[slug].astro', 'utf8');
const directory = await readFile('src/pages/trail-map.astro', 'utf8');
for (const [path, source] of [['trails/[slug]', detail], ['trail-map', directory]]) {
  const compiled = await transform(source, { filename: `src/pages/${path}.astro` });
  assert.deepEqual(compiled.diagnostics.filter(d => d.severity === 1), [], `${path}: targeted Astro compilation`);
  assert.match(source, /Illustrative.*stock photo/i, `${path}: visible photo qualification`);
  assert.ok(!/alt=\{(?:trail|t)\.name\}/.test(source), `${path}: stock images cannot claim named-route identity`);
}
const schemaExpression = detail.match(/const trailSchema = (\{[\s\S]*?\n\});/)?.[1];
assert.ok(schemaExpression);
const makeSchema = new Function('trail', 'imageIsVerified', 'trailPark', `return (${schemaExpression});`);
const sample = bySlug.get('sunshine-meadows');
assert.equal(makeSchema(sample, false, t => t.park).image, undefined, 'Unverified route photo must not enter structured data.');
assert.equal(makeSchema(sample, true, t => t.park).image, sample.image, 'An explicitly verified future photo can be represented.');
assert.equal(makeSchema(sample, false, t => t.park).address, undefined, 'Route area is not a verified postal address.');
assert.match(makeSchema(sample, false, t => t.park).containedInPlace.name, /Assiniboine/);
assert.match(detail, /noindex=\{trail\.routeVerified === false\}/);
assert.match(detail, /trail\.sourceReview\.scope/);
assert.ok(!/Parking Predictor|Shuttle Guide 2026/.test(directory));
assert.match(directory, /Parking &amp; Transport/);
assert.match(directory, /Shuttle Planning/);

const note = await readFile('research/trail-source-audit-2026-10-29.md', 'utf8');
for (const trail of trails) assert.ok(note.includes(`\`${trail.slug}\``), `${trail.slug}: present in complete source/status inventory`);
console.log('Trail source review checks passed: 81 identities preserved; 58 summer reviews + 23 retained scopes; 80 reviewed / 1 unverified; route/season/transport/photo regressions and both Astro templates.');
