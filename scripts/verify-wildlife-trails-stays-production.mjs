import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Public production GETs only. Not part of offline CI and never invokes Git/host APIs.
// node scripts/verify-wildlife-trails-stays-production.mjs --revision <40hex> --fingerprint <64hex> --report research/<new-receipt>.json
// --self-test performs only local, in-memory fixture checks; no network or writes.
const ORIGIN = 'https://banffbound.com';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 15_000;
const RUN_TIMEOUT_MS = 6 * 60_000;
const BUILD_KEYS = ['builtAtUTC', 'formatVersion', 'scope', 'scopeNote', 'sourceFingerprint', 'sourceRevision'];
const SCOPE_NOTE = 'Selected regular .astro/.ts/.mjs/.css app source and explicit build inputs; excludes volatile snapshots, assets, generated outputs, private files and environment data. Revision is null unless the selected source matches local HEAD.';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', middot: '·', rarr: '→', nearr: '↗', copy: '©' };
function decode(text) {
  return String(text).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, entity) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()] ?? whole;
    const value = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? String.fromCodePoint(value) : whole;
  });
}
const normal = text => decode(text).replace(/\s+/g, ' ').trim();
function attrs(tag) {
  const result = {};
  for (const match of tag.replace(/^<\/?[\w:-]+/, '').matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  return result;
}
function htmlFacts(html) {
  const documents = [];
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) if (attrs(match[0].slice(0, match[0].indexOf('>') + 1)).type?.toLowerCase() === 'application/ld+json') documents.push(JSON.parse(match[1]));
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? '';
  const canonicals = [...head.matchAll(/<link\b[^>]*>/gi)].map(match => attrs(match[0])).filter(item => item.rel?.toLowerCase().split(/\s+/).includes('canonical')).map(item => item.href);
  const robots = [...head.matchAll(/<meta\b[^>]*>/gi)].map(match => attrs(match[0])).filter(item => /^(?:robots|googlebot)$/i.test(item.name ?? '')).map(item => item.content ?? '');
  const cleaned = html.replace(/<!--[^]*?-->/g, '').replace(/<(script|style|template|noscript)\b[^>]*>[^]*?<\/\1\s*>/gi, '');
  const stack = [], text = [], details = [], h1 = [], links = [];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const match of cleaned.matchAll(/<\/?[a-z][^>]*>|[^<]+/gi)) {
    const token = match[0];
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([\w:-]+)/)?.[1].toLowerCase();
      const index = stack.findLastIndex(frame => frame.tag === tag);
      if (index !== -1) stack.splice(index);
    } else if (token.startsWith('<')) {
      const tag = token.match(/^<([\w:-]+)/)?.[1].toLowerCase();
      const attributes = attrs(token);
      const hidden = Boolean(stack.at(-1)?.hidden || Object.hasOwn(attributes, 'hidden') || attributes['aria-hidden'] === 'true' || /display\s*:\s*none/i.test(attributes.style ?? ''));
      const frame = { tag, hidden };
      if (tag === 'details' && !hidden) { frame.detail = { question: [], answer: [] }; details.push(frame.detail); }
      if (tag === 'h1' && !hidden) { frame.heading = []; h1.push(frame.heading); }
      if (tag === 'a' && !hidden && attributes.href) links.push(attributes.href);
      if (!voidTags.has(tag) && !token.endsWith('/>')) stack.push(frame);
    } else if (!stack.at(-1)?.hidden && stack.some(frame => frame.tag === 'body')) {
      text.push(token);
      for (const frame of stack) if (frame.heading) frame.heading.push(token);
      const detailFrame = stack.findLast(frame => frame.detail);
      if (detailFrame) (stack.some(frame => frame.tag === 'summary') ? detailFrame.detail.question : detailFrame.detail.answer).push(token);
    }
  }
  return { documents, canonicals, robots, text: normal(text.join(' ')), h1: h1.map(parts => normal(parts.join(' '))), details: details.map(item => ({ question: normal(item.question.join(' ')), answer: normal(item.answer.join(' ')) })), links };
}
function faqPages(value, result = []) {
  if (Array.isArray(value)) value.forEach(item => faqPages(item, result));
  else if (value && typeof value === 'object') {
    if ([value['@type']].flat().includes('FAQPage')) result.push(value);
    for (const child of Object.values(value)) if (child && typeof child === 'object') faqPages(child, result);
  }
  return result;
}
function analyseHtml(html, check, sitemap, headerRobots = '') {
  const errors = [], markers = {};
  const facts = htmlFacts(html);
  const expectedCanonical = ORIGIN + check.path;
  if (facts.canonicals.length !== 1 || facts.canonicals[0] !== expectedCanonical) errors.push('Expected exactly one absolute self canonical');
  if (facts.h1.length !== 1 || (check.name && facts.h1[0] !== normal(check.name))) errors.push('Missing, duplicate or incorrect H1');
  const noindex = [...facts.robots, headerRobots].some(value => /(?:^|[\s,;:])(?:noindex|none)(?:$|[\s,;])/i.test(value));
  if (noindex !== check.noindex) errors.push(`Expected noindex=${check.noindex}`);
  const inSitemap = sitemap.has(expectedCanonical);
  if (inSitemap !== !check.noindex) errors.push(`Expected sitemap inclusion=${!check.noindex}`);
  for (const [label, expected] of Object.entries(check.markers ?? {})) {
    markers[label] = facts.text.includes(normal(expected));
    if (!markers[label]) errors.push(`Missing visible marker: ${label}`);
  }
  if (check.reviewDate) {
    markers.reviewDate = facts.text.includes(check.reviewDate);
    if (!markers.reviewDate) errors.push('Missing visible source review date');
  }
  let faqQuestions;
  if (check.faqs) {
    const schemas = facts.documents.flatMap(document => faqPages(document));
    if (schemas.length !== 1 || !Array.isArray(schemas[0]?.mainEntity)) errors.push('Expected exactly one FAQPage with a mainEntity array');
    else {
      const items = schemas[0].mainEntity;
      faqQuestions = items.length;
      if (items.length !== check.faqs.length) errors.push('FAQ schema count differs from reviewed data');
      check.faqs.forEach((expected, index) => {
        const actual = items[index];
        if (actual?.['@type'] !== 'Question' || actual.acceptedAnswer?.['@type'] !== 'Answer' || normal(actual.name ?? '') !== normal(expected.question) || normal(actual.acceptedAnswer?.text ?? '') !== normal(expected.answer)) errors.push(`FAQ schema differs at question ${index + 1}`);
        const visible = facts.details.filter(item => item.question === normal(expected.question));
        if (visible.length !== 1 || visible[0].answer !== normal(expected.answer)) errors.push(`Visible FAQ/schema mismatch at question ${index + 1}`);
      });
    }
  }
  for (const expected of check.requiredMarkup ?? []) if (!html.includes(expected)) errors.push('Missing required optional-map markup');
  for (const expected of check.links ?? []) if (!facts.links.includes(expected)) errors.push(`Missing visible source/photo link: ${expected}`);
  return { canonical: facts.canonicals.length === 1 ? facts.canonicals[0] : null, h1: facts.h1.length, noindex, inSitemap, ...(faqQuestions !== undefined ? { faqQuestions } : {}), markers, errors };
}
function validateBuildInfo(value, revision, fingerprint, now = Date.now()) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Build receipt must be an object');
  assert.deepEqual(Object.keys(value).sort(), BUILD_KEYS, 'Build receipt must expose exactly the six allowlisted fields');
  assert.equal(value.formatVersion, 1); assert.equal(value.scope, 'app-source-v1'); assert.equal(value.scopeNote, SCOPE_NOTE);
  assert.equal(value.sourceRevision, revision, 'Deployed source revision does not match');
  assert.equal(value.sourceFingerprint, fingerprint, 'Deployed source fingerprint does not match');
  assert.ok(typeof value.builtAtUTC === 'string' && Number.isFinite(Date.parse(value.builtAtUTC)) && new Date(value.builtAtUTC).toISOString() === value.builtAtUTC && Date.parse(value.builtAtUTC) <= now + 300_000, 'Invalid or future UTC build timestamp');
}
function xmlLocations(xml, kind) {
  const clean = xml.replace(/<\?xml[^>]*\?>/g, '').trim();
  assert.ok(!/<!DOCTYPE|<!ENTITY/i.test(clean), 'Sitemap entities/doctype are not accepted');
  assert.ok(new RegExp(`^<${kind}\\b`).test(clean) && new RegExp(`</${kind}>$`).test(clean), `Expected ${kind} XML`);
  const values = [...clean.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => decode(match[1]));
  assert.ok(values.length > 0 && values.length <= 10_000, 'Empty or excessive sitemap locations');
  for (const value of values) { const url = new URL(value); assert.equal(url.origin, ORIGIN, 'Sitemap location must stay on the public origin'); assert.ok(!url.search && !url.hash && !url.username && !url.password, 'Unexpected sitemap URL components'); }
  assert.equal(new Set(values).size, values.length, 'Duplicate sitemap locations');
  return values;
}
async function loadInventory() {
  const compiled = await build({ stdin: { contents: "export {trails} from './src/data/trails.ts'; export {isDirectoryTrail} from './src/data/trailPlanning.ts'; export {directoryHotels,isHotelDirectoryIndexable} from './src/data/hotelDirectory.ts'; export * from './src/data/wildlifeSafety.ts'; export {wildlifeGuideFaqs,wildlifeTrackerFaqs,wildlifeSpecies} from './src/data/wildlifeFieldGuide.ts'; export {wildlifeZones,wildlifeAreaReviewedAt} from './src/data/wildlifeZones.ts';", resolveDir: ROOT }, absWorkingDir: ROOT, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
  const data = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
  const manifest = await readFile(path.join(ROOT, 'src/data/wildlifePhotos.json'));
  const photos = JSON.parse(manifest);
  assert.equal(data.trails.length, 81); assert.equal(data.trails.filter(data.isDirectoryTrail).length, 80);
  assert.equal(data.trails.filter(trail => trail.routeVerified === false).length, 1);
  assert.equal(data.directoryHotels.length, 95); assert.equal(data.directoryHotels.filter(hotel => data.isHotelDirectoryIndexable(hotel.slug)).length, 38);
  assert.equal(photos.length, 7); assert.equal(new Set(photos.map(photo => photo.src)).size, 7);
  for (const record of [...data.trails, ...data.directoryHotels]) assert.match(record.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(new Set(data.trails.map(trail => trail.slug)).size, 81); assert.equal(new Set(data.directoryHotels.map(hotel => hotel.slug)).size, 95);
  for (const trail of data.trails) {
    assert.equal(data.isDirectoryTrail(trail), trail.routeVerified !== false, `Trail eligibility/noindex disagree: ${trail.slug}`);
    assert.equal(trail.sourceReview?.status, trail.routeVerified === false ? 'unverified' : 'reviewed');
  }
  for (const photo of photos) { assert.match(photo.src, /^\/images\/wildlife\/field-guide\/[a-z0-9-]+\.jpe?g$/); assert.match(photo.sha256, /^[a-f0-9]{64}$/); }
  const checks = [
    ...data.trails.map(trail => ({ path: `/trails/${trail.slug}/`, kind: 'trail', name: trail.name, noindex: !data.isDirectoryTrail(trail), reviewDate: trail.reviewedAt, markers: { sourceReview: trail.sourceReview.scope, statusScope: 'Current trail status is not supplied by this guide.' } })),
    ...data.directoryHotels.map(hotel => ({ path: `/hotel-directory/${hotel.slug}/`, kind: 'hotel', name: hotel.name, noindex: !data.isHotelDirectoryIndexable(hotel.slug), reviewDate: hotel.checkedOn, markers: { sourceStatus: hotel.sourceStatusLabel, sourceScope: hotel.sourceScope } })),
    { path: '/wildlife/', kind: 'wildlife', faqs: data.wildlifeGuideFaqs, markers: { sourceReview: 'Species and planning review:', photoScope: 'historical species illustrations' }, links: photos.flatMap(photo => [photo.source, photo.licenseUrl]) },
    { path: '/wildlife-tracker/', kind: 'wildlife', faqs: data.wildlifeTrackerFaqs, markers: { sourceReview: 'Source and access review:', feedScope: 'No live sighting feed is connected.', areaCount: `${data.wildlifeZones.length} area plans` } },
    { path: '/wildlife-safety/', kind: 'wildlife', faqs: data.wildlifeSafetyFaqs, markers: { sourceReview: 'Official guidance reviewed', reportContact: '403-762-1470', emergencyContact: '403-762-4506' } },
    { path: '/wildlife-calendar/', kind: 'wildlife', faqs: data.wildlifeCalendarFaqs, markers: { sourceReview: 'Official sources reviewed', preparationScope: 'This calendar contains no live animal locations or sighting forecasts.' } },
    { path: '/bear-spray/', kind: 'wildlife', faqs: data.bearSprayFaqs, markers: { sourceReview: 'Official rules and direct provider pages reviewed', provider: 'Ultimate Sports', poisonAdvice: '1-844-764-7669' } },
    { path: '/trail-map/', kind: 'directory', markers: { planningScope: 'Planning information, not current trail status.', photoScope: 'Illustrative stock landscape; not a verified trail photograph.' }, requiredMarkup: ['Indicative listing locations only.'] },
    { path: '/hotel-directory/', kind: 'directory', markers: { sourceScope: 'selected-fact reviews', legacyScope: 'legacy leads awaiting source review' } },
    { path: '/tools/', kind: 'directory', markers: { wildlifeScope: 'Compare public visitor areas, habitat, species and seasonal access.' } },
  ].map(check => ({ noindex: false, ...check }));
  assert.equal(checks.length, 184); assert.equal(new Set(checks.map(check => check.path)).size, 184);
  return { checks, photos, manifestSha256: sha256(manifest) };
}
async function pool(items, task) {
  let cursor = 0;
  const results = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => { while (cursor < items.length) { const index = cursor++; results[index] = await task(items[index], index); } }));
  return results;
}
function options(args) {
  assert.equal(args.length, 6, 'Required: --revision <40hex> --fingerprint <64hex> --report <new-local.json>');
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    assert.ok(['--revision', '--fingerprint', '--report'].includes(args[index]) && !Object.hasOwn(result, args[index]), 'Unknown or duplicate option');
    assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), 'Missing option value'); result[args[index]] = args[index + 1];
  }
  assert.match(result['--revision'] ?? '', /^[a-f0-9]{40}$/i); assert.match(result['--fingerprint'] ?? '', /^[a-f0-9]{64}$/i); assert.match(result['--report'] ?? '', /\.json$/i);
  return { revision: result['--revision'].toLowerCase(), fingerprint: result['--fingerprint'].toLowerCase(), report: path.resolve(result['--report']) };
}
async function verify(config) {
  const started = Date.now(), deadline = started + RUN_TIMEOUT_MS;
  const report = { formatVersion: 1, startedAt: new Date(started).toISOString(), checkedAt: null, origin: ORIGIN, expectedRevision: config.revision, expectedFingerprint: config.fingerprint, policy: { method: 'GET', concurrency: CONCURRENCY, requestTimeoutMs: REQUEST_TIMEOUT_MS, runTimeoutMs: RUN_TIMEOUT_MS, retries: 0 }, passed: false, requests: 0, inventory: null, buildReceipt: null, buildReceiptStable: false, sitemap: null, results: [], photos: [], failures: [] };
  const fail = (stage, message) => report.failures.push({ stage, message: String(message).slice(0, 500) });
  const get = async (pathname, maxBytes, contentType) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw Error('Global verification time limit reached');
    const url = new URL(pathname, ORIGIN);
    assert.equal(url.origin, ORIGIN); assert.ok(!url.search && !url.hash && !url.username && !url.password);
    url.searchParams.set('__release_verify', `${config.revision.slice(0, 12)}-${started}-${report.requests}`);
    report.requests++;
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(Math.min(REQUEST_TIMEOUT_MS, remaining)), headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'BanffBound-public-release-verification/1.0' } });
    if (response.status !== 200) { await response.body?.cancel(); throw Error(`HTTP ${response.status}; expected 200 without redirect`); }
    const type = response.headers.get('content-type') ?? '';
    if (!contentType.test(type)) { await response.body?.cancel(); throw Error('Unexpected content type'); }
    if (Number(response.headers.get('content-length')) > maxBytes) { await response.body?.cancel(); throw Error('Response exceeds byte limit'); }
    let length = 0; const chunks = [];
    for await (const chunk of response.body ?? []) { length += chunk.length; if (length > maxBytes) { await response.body?.cancel().catch(() => {}); throw Error('Response exceeds byte limit'); } chunks.push(chunk); }
    assert.ok(length > 0, 'Empty response');
    return { bytes: Buffer.concat(chunks), status: response.status, lastModified: response.headers.get('last-modified'), robots: response.headers.get('x-robots-tag') ?? '' };
  };
  try {
    const inventory = await loadInventory();
    report.inventory = { htmlRoutes: inventory.checks.length, trails: { total: 81, indexable: 80, noindex: 1 }, hotels: { total: 95, indexable: 38, noindex: 57 }, wildlifePages: 5, photos: 7, photoManifestSha256: inventory.manifestSha256 };
    const buildResponse = await get('/build-info.json', 16_384, /^application\/json(?:\s*;|$)/i);
    report.buildReceipt = JSON.parse(buildResponse.bytes.toString('utf8'));
    validateBuildInfo(report.buildReceipt, config.revision, config.fingerprint);
    const sitemapResponse = await get('/sitemap-index.xml', 2 * 1024 * 1024, /^(?:application|text)\/xml(?:\s*;|$)/i);
    const sitemapFiles = xmlLocations(sitemapResponse.bytes.toString('utf8'), 'sitemapindex');
    assert.ok(sitemapFiles.length <= 8, 'Too many sitemap files');
    for (const url of sitemapFiles) assert.match(new URL(url).pathname, /^\/sitemap(?:-\d+)?\.xml$/);
    const sitemapResults = await pool(sitemapFiles, async url => { const result = await get(new URL(url).pathname, 3 * 1024 * 1024, /^(?:application|text)\/xml(?:\s*;|$)/i); return xmlLocations(result.bytes.toString('utf8'), 'urlset'); });
    const sitemap = new Set(sitemapResults.flat());
    assert.equal(sitemap.size, sitemapResults.flat().length, 'Duplicate cross-file sitemap entries');
    assert.ok(!sitemap.has(`${ORIGIN}/build-info.json`), 'Build receipt must be excluded from sitemap');
    report.sitemap = { files: sitemapFiles.map(url => new URL(url).pathname), urlCount: sitemap.size, buildInfoExcluded: true };
    report.results = await pool(inventory.checks, async check => {
      try {
        const response = await get(check.path, 2 * 1024 * 1024, /^text\/html(?:\s*;|$)/i);
        const facts = analyseHtml(response.bytes.toString('utf8'), check, sitemap, response.robots);
        return { path: check.path, kind: check.kind, status: response.status, lastModified: response.lastModified, ...facts, passed: facts.errors.length === 0 };
      } catch (error) { return { path: check.path, kind: check.kind, passed: false, errors: [String(error.message ?? error.name).slice(0, 300)] }; }
    });
    report.photos = await pool(inventory.photos, async photo => {
      try { const response = await get(photo.src, 4 * 1024 * 1024, /^image\/jpeg(?:\s*;|$)/i); const digest = sha256(response.bytes); return { id: photo.id, path: photo.src, status: response.status, bytes: response.bytes.length, expectedSha256: photo.sha256, sha256: digest, passed: digest === photo.sha256 }; }
      catch (error) { return { id: photo.id, path: photo.src, passed: false, error: String(error.message ?? error.name).slice(0, 300) }; }
    });
    const finalResponse = await get('/build-info.json', 16_384, /^application\/json(?:\s*;|$)/i);
    const finalReceipt = JSON.parse(finalResponse.bytes.toString('utf8'));
    validateBuildInfo(finalReceipt, config.revision, config.fingerprint);
    assert.deepEqual(finalReceipt, report.buildReceipt, 'Build changed while verification ran');
    report.buildReceiptStable = true;
    for (const row of report.results.filter(row => !row.passed)) fail(row.path, row.errors.join('; '));
    for (const row of report.photos.filter(row => !row.passed)) fail(row.path, row.error ?? 'Photo bytes SHA256 mismatch');
    report.passed = report.results.length === 184 && report.photos.length === 7 && report.buildReceiptStable && report.failures.length === 0;
  } catch (error) { fail('verification', error.message ?? error.name); }
  report.checkedAt = new Date().toISOString(); report.durationMs = Date.now() - started;
  report.summary = { htmlPassed: report.results.filter(row => row.passed).length, htmlFailed: report.results.filter(row => !row.passed).length, photosPassed: report.photos.filter(row => row.passed).length, photosFailed: report.photos.filter(row => !row.passed).length, failures: report.failures.length };
  // Preserve existing receipts. Only the explicitly supplied, previously absent JSON file is written.
  await writeFile(config.report, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ passed: report.passed, report: config.report, ...report.summary, requests: report.requests }));
  if (!report.passed) process.exitCode = 1;
}
async function selfTest() {
  const inventory = await loadInventory();
  const revision = 'a'.repeat(40), fingerprint = 'b'.repeat(64);
  const receipt = { formatVersion: 1, scope: 'app-source-v1', scopeNote: SCOPE_NOTE, builtAtUTC: '2026-10-29T00:00:00.000Z', sourceRevision: revision, sourceFingerprint: fingerprint };
  validateBuildInfo(receipt, revision, fingerprint, Date.parse('2026-10-29T12:00:00Z'));
  for (const invalid of [{ ...receipt, sourceRevision: null }, { ...receipt, sourceFingerprint: 'c'.repeat(64) }, { ...receipt, extra: true }, { ...receipt, builtAtUTC: '2099-01-01T00:00:00.000Z' }]) assert.throws(() => validateBuildInfo(invalid, revision, fingerprint, Date.parse('2026-10-29T12:00:00Z')));
  const faq = { question: 'Who & where?', answer: 'A source-based answer.' };
  const check = { path: '/wildlife/', noindex: false, name: 'Wildlife & space', faqs: [faq], markers: { review: 'Reviewed 2026-10-29' } };
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }] };
  const fixture = `<html><head><link href="${ORIGIN}/wildlife/" rel="canonical"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body><h1>Wildlife &amp; space</h1><p>Reviewed 2026-10-29</p><details><summary>Who &amp; where?</summary><p>A source-based answer.</p></details></body></html>`;
  const sitemap = new Set([`${ORIGIN}/wildlife/`]);
  assert.deepEqual(analyseHtml(fixture, check, sitemap).errors, []);
  assert.ok(analyseHtml(fixture, { ...check, requiredMarkup: ['Absent optional-map note'] }, sitemap).errors.some(error => error.includes('optional-map markup')));
  assert.ok(analyseHtml(fixture, check, sitemap, 'noindex').errors.length > 0);
  assert.ok(analyseHtml(fixture.replace('<details>', '<div hidden><details>').replace('</details>', '</details></div>'), check, sitemap).errors.some(error => error.includes('Visible FAQ')));
  assert.ok(analyseHtml(fixture.replace('<p>A source-based answer.</p>', '<p>A different answer.</p>'), check, sitemap).errors.some(error => error.includes('Visible FAQ')));
  assert.ok(analyseHtml(fixture.replace('rel="canonical"', 'rel="alternate"'), check, sitemap).errors.some(error => error.includes('canonical')));
  assert.ok(analyseHtml(fixture, check, new Set()).errors.some(error => error.includes('sitemap')));
  assert.throws(() => htmlFacts(fixture.replace(JSON.stringify(schema), '{malformed}')));
  assert.deepEqual(xmlLocations(`<sitemapindex><sitemap><loc>${ORIGIN}/sitemap-0.xml</loc></sitemap></sitemapindex>`, 'sitemapindex'), [`${ORIGIN}/sitemap-0.xml`]);
  assert.throws(() => xmlLocations('<sitemapindex><sitemap><loc>https://example.com/sitemap.xml</loc></sitemap></sitemapindex>', 'sitemapindex'));
  assert.throws(() => xmlLocations('<!DOCTYPE x><urlset><url><loc>https://banffbound.com/</loc></url></urlset>', 'urlset'));
  assert.throws(() => options(['--revision', revision, '--fingerprint', fingerprint]));
  assert.throws(() => options(['--revision', revision, '--revision', revision, '--report', 'x.json']));
  let inFlight = 0, maximum = 0;
  const values = await pool(Array.from({ length: 19 }, (_, i) => i), async value => { inFlight++; maximum = Math.max(maximum, inFlight); await new Promise(resolve => setTimeout(resolve, 1)); inFlight--; return value; });
  assert.deepEqual(values, Array.from({ length: 19 }, (_, i) => i)); assert.ok(maximum <= CONCURRENCY && maximum > 1);
  for (const photo of inventory.photos) assert.equal(sha256(await readFile(path.join(ROOT, 'public', photo.src))), photo.sha256, `Local manifest/photo mismatch: ${photo.id}`);
  console.log('Offline verifier fixtures passed: exact receipt/UTC identity, 184-route inventory and current eligibility, visible FAQ/schema/hidden content, canonical/noindex/sitemap failures, safe sitemap scope, seven local photo hashes, bounded concurrency and arguments. No network, report write, Git or host calls.');
}

try {
  if (process.argv.length === 3 && process.argv[2] === '--self-test') await selfTest();
  else await verify(options(process.argv.slice(2)));
} catch (error) {
  console.error(String(error.message ?? error.name));
  process.exitCode = 1;
}
