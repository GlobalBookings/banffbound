import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { commerceItems, commerceSections, commerceDataVersion, commerceProvenance } from '../src/data/commerce';
import { places, guides } from '../src/data/catalog';
import { activityById } from '../src/data/planner.generated';

const mobileRoot = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = path.resolve(mobileRoot, '..');
const reviewedSourceRoot = process.env.BANFFBOUND_COMMERCE_SOURCE_ROOT ? path.resolve(process.env.BANFFBOUND_COMMERCE_SOURCE_ROOT) : repoRoot;
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

test('commerce covers the complete separately reviewed published collections', () => {
  assert.equal(commerceProvenance.sourceCommit, 'eb55328b608d79cfdffc4cc41298f0f0f23cf996');
  assert.match(commerceDataVersion, /^2026-10-31-[a-f0-9]{12}$/);
  assert.deepEqual(commerceSections.map(section => section.id), ['tours', 'stays', 'guides', 'extras']);
  assert.equal(commerceItems.filter(item => /^gyg-\d+$/.test(item.id)).length, 15);
  assert.equal(commerceItems.filter(item => item.id.startsWith('hotel-')).length, 95);
  assert.equal(commerceItems.filter(item => item.id.startsWith('rental-')).length, 50);
  assert.equal(commerceItems.filter(item => item.id.startsWith('guide-')).length, 295);
  assert.equal(commerceItems.filter(item => item.id.startsWith('activity-guide-')).length, 15);
  assert.equal(commerceItems.filter(item => item.id.startsWith('gear-')).length, 35);
  assert.equal(new Set(commerceItems.map(item => item.id)).size, commerceItems.length);
  assert.equal(commerceItems.length, commerceProvenance.counts.total);
  for (const item of commerceItems) {
    assert.ok(item.title.trim() && item.summary.trim() && item.area.trim() && item.category.trim(), item.id);
    assert.ok(commerceSections.some(section => section.id === item.section), item.id);
    assert.ok(item.links.length, item.id);
    assert.equal(new Set(item.links.map(link => link.id)).size, item.links.length, item.id);
    assert.equal(/<\/?(?:script|iframe|style)\b/i.test(item.title + item.summary + item.notice), false, item.id);
    if (item.reviewedAt) assert.equal(Number.isNaN(Date.parse(item.reviewedAt)), false, item.id);
    if (item.guideUrl) assert.equal(new URL(item.guideUrl).hostname, 'banffbound.com', item.id);
    for (const key of ['price','image','latitude','longitude','available','openNow']) assert.equal(key in item, false, item.id);
  }
});

test('provider links preserve exact publisher identity without visitor tracking', () => {
  for (const item of commerceItems) for (const link of item.links) {
    const url = new URL(link.url);
    assert.equal(url.protocol, 'https:', item.id);
    assert.equal(url.username + url.password + url.hash, '', item.id);
    assert.equal([...url.searchParams.keys()].some(key => /^(?:gclid|fbclid|user.?id|device.?id|click.?id|latitude|longitude|email|session.?id)$/i.test(key)), false, item.id);
    if (link.provider === 'BanffBound') {
      assert.equal(url.hostname, 'banffbound.com'); assert.equal(link.affiliate, false); assert.equal(link.kind, 'guide');
    } else {
      assert.equal(link.affiliate, true);
      if (link.provider === 'GetYourGuide') {
        assert.equal(url.hostname, 'www.getyourguide.com'); assert.equal(url.searchParams.get('partner_id'), 'QW960HO'); assert.equal(url.searchParams.get('cmp'), 'banffboundapp');
        assert.ok(['product','search'].includes(link.kind));
      } else if (link.provider === 'Expedia') {
        assert.ok(['www.expedia.ca','www.expedia.com','expedia.com'].includes(url.hostname));
        assert.ok(url.searchParams.get('camref') === '1101l3MtWX' || link.url === 'https://expedia.com/affiliate/KB6G4xt');
      } else if (link.provider === 'Vrbo') {
        assert.equal(url.hostname, 'vrbo.com'); assert.equal(url.pathname, '/affiliate');
        assert.equal(url.searchParams.get('camref'), '1101l3MtWL'); assert.equal(url.searchParams.get('creativeref'), '1011l63087'); assert.equal(url.searchParams.get('adref'), 'PZBJVX1Er0');
        const target = new URL(url.searchParams.get('landingPage')!);
        assert.equal(target.protocol, 'https:'); assert.equal(target.hostname, 'www.vrbo.com'); assert.equal(target.username + target.password, '');
      } else assert.fail('Unapproved direct native provider: ' + link.provider);
    }
  }
});

test('held products, legacy hotel identities and historical rental leads retain their limits', () => {
  const held = ['gyg-303298','gyg-303253','gyg-437912','gyg-285990'];
  for (const id of held) {
    const item = commerceItems.find(item => item.id === id)!;
    assert.equal(item.status, 'check-details'); assert.ok(item.notice!.length > 150); assert.ok(item.links.every(link => !/book now/i.test(link.label)));
  }
  assert.match(commerceItems.find(item => item.id === 'gyg-303253')!.notice!, /closure|closed/i);
  assert.match(commerceItems.find(item => item.id === 'gyg-285990')!.notice!, /usually unavailable/i);
  assert.equal(commerceItems.filter(item => item.id.startsWith('hotel-') && item.status === 'ready').length, 49);
  for (const item of commerceItems.filter(item => item.id.startsWith('hotel-') && item.status === 'reference-only')) assert.match(item.notice!, /legacy|former|not.*verified|require.*confirmation/i, item.id);
  for (const item of commerceItems.filter(item => item.id.startsWith('rental-'))) {
    assert.equal(item.status, 'reference-only'); assert.equal(item.reviewedAt, undefined); assert.match(item.notice!, /no reliable capture date/i); assert.match(item.notice!, /licensing/i);
  }
});

test('Amazon gear routes through owned website content while mobile approval is unverified', () => {
  const gear = commerceItems.filter(item => item.id.startsWith('gear-'));
  assert.equal(commerceProvenance.amazonDirectLinksEnabled, false);
  for (const item of gear) {
    assert.equal(item.notice, 'Opens BanffBound’s packing guide, with affiliate product links and advice on what to bring. Check what you already own before buying.');
    assert.ok(item.links.every(link => link.provider === 'BanffBound' && link.url === 'https://banffbound.com/packing-list/'));
  }
  assert.equal(commerceItems.flatMap(item => item.links).some(link => ['Amazon','DiscoverCars'].includes(link.provider)), false);
});

test('the original offline catalogue and exact place meanings remain independent', () => {
  assert.equal(places.length, 42); assert.equal(guides.length, 16);
  assert.equal(commerceProvenance.originalOfflineCataloguePin, '4da51e0f64e9af8a14d87fe302a308081777d1a6');
  for (const item of commerceItems) {
    for (const id of item.relatedPlaceIds || []) assert.ok(places.some(place => place.id === id), item.id + ':' + id);
    for (const id of item.relatedActivityIds || []) assert.ok(activityById[id], item.id + ':' + id);
  }
  const nordic = commerceItems.find(item => item.id === 'gyg-292675')!;
  assert.deepEqual(nordic.relatedPlaceIds, ['lake-louise']); assert.equal(nordic.relatedActivityIds, undefined);
  assert.equal(nordic.relatedPlaceIds!.includes('cross-country-skiing'), false);
});

test('all published visitor pages, tools, towns and route directories have canonical guide coverage', () => {
  const indexed = commerceItems.filter(item => item.section === 'guides');
  const canonical = indexed.map(item => item.guideUrl!.replace(/\/+$/,'') + '/');
  assert.equal(new Set(canonical).size,canonical.length);
  assert.equal(indexed.length,463);
  assert.equal(commerceProvenance.counts.standaloneGuideEntriesAdded,153);
  assert.equal(commerceProvenance.counts.standaloneVisitorPageRoutes,71);
  assert.equal(commerceProvenance.counts.townGuideRoutes,6);
  assert.equal(commerceProvenance.counts.trailLakeViewpointGuideRoutes,81);
  for (const route of ['/car-free-banff/','/camping/','/banff-national-park/','/family-guide/','/calgary-to-banff/','/tools/','/lakes/','/trail-map/','/towns/','/towns/canmore/','/trails/johnston-canyon-lower-falls/']) assert.equal(canonical.filter(url => url === 'https://banffbound.com' + route).length,1,route);
  for (const route of ['/privacy/','/terms/','/contact/','/about/','/editorial/','/404/','/trip-reports/','/trails/','/book/banff-winter-activities/google-test/']) assert.equal(canonical.includes('https://banffbound.com' + route),false,route);
  const hashed = new Set(commerceProvenance.sourceInputs.map(input => input.file));
  for (const coverage of commerceProvenance.standaloneGuideCoverage) {
    assert.ok(hashed.has(coverage.sourceFile),coverage.sourceFile);
    const item = indexed.find(item => item.id === coverage.itemId);
    assert.equal(item?.guideUrl?.replace(/\/+$/,'') + '/',coverage.url);
  }
  assert.match(commerceProvenance.standaloneMetadataExtraction,/no Astro frontmatter execution/);
});

test('listed operators belong only to the exact central products and internal approval wording is absent from visible notices', () => {
  assert.equal(commerceItems.filter(item => item.operator).length,15);
  assert.equal(commerceItems.find(item => item.id === 'gyg-256607')?.operator,'Pursuit Collection');
  assert.equal(commerceItems.find(item => item.id === 'gyg-798459')?.operator,'Radventures');
  for (const item of commerceItems) {
    if (item.operator) assert.match(item.id,/^gyg-\d+$/);
    assert.equal(/approved-mobile-app|Preserved published website referral|Editorial review does not confirm current operation/.test(item.notice || ''),false,item.id);
    if (/^gyg-\d+$/.test(item.id)) assert.equal(item.notice?.includes('Affiliate link:'),false,item.id);
  }
});

test('fixed app campaign transforms preserve product identity and all other query parameters', () => {
  assert.ok(commerceProvenance.sourceUrlTransforms.length >= 15);
  for (const transform of commerceProvenance.sourceUrlTransforms) {
    const before = new URL(transform.originalUrl), after = new URL(transform.appUrl);
    assert.equal(before.origin + before.pathname, after.origin + after.pathname);
    assert.equal(after.searchParams.get('cmp'), 'banffboundapp');
    before.searchParams.delete('cmp'); after.searchParams.delete('cmp'); before.searchParams.sort(); after.searchParams.sort();
    assert.equal(before.search, after.search);
  }
});

test('source pin and every consumed input are evidenced; a modified pinned input fails closed', async () => {
  const pinBytes = await readFile(path.join(mobileRoot,'release/reviewed-commerce-source.json'));
  assert.equal(hash(pinBytes), commerceProvenance.pinSha256);
  assert.ok(commerceProvenance.sourceInputs.length >= 50);
  const fixture = await mkdtemp(path.join(os.tmpdir(),'banffbound-commerce-drift-'));
  try {
    const gitDir = execFileSync('git',['-C',reviewedSourceRoot,'rev-parse','--absolute-git-dir'],{encoding:'utf8'}).trim();
    await writeFile(path.join(fixture,'.git'), 'gitdir: ' + gitDir + '\n');
    for (const input of commerceProvenance.sourceInputs) {
      assert.match(input.sha256,/^[a-f0-9]{64}$/);
      const committed = execFileSync('git',['-C',reviewedSourceRoot,'show',`${commerceProvenance.sourceCommit}:${input.file}`],{maxBuffer:16*1024*1024});
      assert.equal(hash(committed),input.sha256,input.file);
      const file = path.join(fixture,input.file); await mkdir(path.dirname(file),{recursive:true}); await writeFile(file,committed);
    }
    const drift = path.join(fixture,'src/data/activityCampaignTargets.ts');
    await writeFile(drift,(await readFile(drift,'utf8')) + '\n// Deliberate provenance mismatch fixture.\n');
    const result = spawnSync(process.execPath,[path.join(mobileRoot,'scripts/sync-commerce.mjs'),'--check','--source-root='+fixture],{encoding:'utf8',maxBuffer:2*1024*1024});
    assert.notEqual(result.status,0); assert.match(result.stderr,/Commerce source differs from reviewed commit/);
  } finally { await rm(fixture,{recursive:true,force:true}); }
});
