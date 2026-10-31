import test from 'node:test';
import assert from 'node:assert/strict';
import { commerceLinkTitle, commerceFacets, filterCommerceItems, isAllowedCommerceUrl, relatedCommerceItems, safeCommerceUrl } from '../src/lib/commerce.ts';
import type { CommerceItem, CommerceLink } from '../src/data/commerce.ts';
import { commerceItems } from '../src/data/commerce.ts';

const link = (url: string, overrides: Partial<CommerceLink> = {}): CommerceLink => ({ id: 'gyg-test', label: 'Compare the exact tour', provider: 'GetYourGuide', affiliate: true, kind: 'product', url, ...overrides });
const product = 'https://www.getyourguide.com/banff-l284/banff-gondola-t256607/?partner_id=QW960HO&cmp=banffbound_app';
const expedia = 'https://www.expedia.ca/Banff-Hotels-Fairmont.h13652.Hotel-Information?camref=1101l3MtWX';
const vrbo = 'https://vrbo.com/affiliate?landingPage=' + encodeURIComponent('https://www.vrbo.com/en-ca/cottage-rental/p123456') + '&camref=1101l3MtWL&creativeref=1011l63087&adref=PZBJVX1Er0';

test('reviewed product/property/search/referral destinations retain exact publisher URLs', () => {
  const rows = [link(product), link('https://www.getyourguide.com/s/?q=Banff+snowshoe&partner_id=QW960HO', { kind: 'search' }), link(expedia, { provider: 'Expedia', kind: 'property' }), link('https://www.expedia.ca/Hotel-Search?destination=Lake+Louise%2C+Alberta&camref=1101l3MtWX', { provider: 'Expedia', kind: 'search' }), link('https://expedia.com/affiliate/KB6G4xt', { provider: 'Expedia', kind: 'referral' }), link(vrbo, { provider: 'Vrbo', kind: 'property' }), link('https://banffbound.com/blog/banff-gondola-guide/#booking', { provider: 'BanffBound', kind: 'guide', affiliate: false })];
  for (const item of rows) {
    assert.equal(safeCommerceUrl(item), item.url);
    assert.equal(isAllowedCommerceUrl(item.url), true, item.url);
  }
});

test('host spoofing, credentials, wrong partner IDs, private query keys and duplicate parameters are blocked', () => {
  const invalid = [product.replace('www.getyourguide.com', 'www.getyourguide.com.attacker.example'), product.replace('https://', 'http://'), product.replace('www.getyourguide.com', 'secret@www.getyourguide.com'), product.replace('QW960HO', 'ANOTHER'), product + '&email=traveller%40example.com', product + '&click_id=unique-person', product + '&partner_id=QW960HO', product + '#trip-note', product.replace('www.getyourguide.com', 'www.getyourguide.com:8443'), product + '&q=private%40example.com', product + '%0A'];
  for (const url of invalid) {
    assert.equal(safeCommerceUrl(link(url)), null, url);
    assert.equal(isAllowedCommerceUrl(url), false, url);
  }
  assert.equal(safeCommerceUrl(link(product, { provider: 'Expedia' })), null);
  assert.equal(safeCommerceUrl(link(product, { affiliate: false })), null);
  assert.equal(safeCommerceUrl(link('https://www.getyourguide.com/banff-l284/?partner_id=QW960HO')), null, 'A destination search cannot be presented as an exact product.');
});

test('nested Vrbo referrals cannot redirect to another domain or leak extra user fields', () => {
  assert.equal(safeCommerceUrl(link(vrbo.replace(encodeURIComponent('https://www.vrbo.com/en-ca/cottage-rental/p123456'), encodeURIComponent('https://attacker.example/private')), { provider: 'Vrbo', kind: 'property' })), null);
  assert.equal(isAllowedCommerceUrl(vrbo + '&email=private'), false);
  assert.equal(isAllowedCommerceUrl(vrbo.replace('1101l3MtWL', '1101l3MtWX')), false);
  assert.equal(isAllowedCommerceUrl('https://www.amazon.ca/s?k=boots&tag=banffbound-20'), false);
  assert.equal(isAllowedCommerceUrl('https://www.discovercars.com/?a_aid=unreviewed'), false);
});

function item(id: string, overrides: Partial<CommerceItem> = {}): CommerceItem {
  return { id, section: 'tours', title: 'Café and mountain walk', summary: 'A guided Banff outing with a separate return journey.', area: 'Banff', category: 'Walking', links: [link(product)], ...overrides };
}

test('local search combines words across fields, handles accents, preserves order and respects section/area/topic', () => {
  const records = [item('first'), item('second', { area: 'Canmore' }), item('stay', { section: 'stays' })];
  const before = JSON.stringify(records);
  assert.deepEqual(filterCommerceItems(records, { section: 'tours', query: 'CAFE GetYourGuide BANFF' }).map(row => row.id), ['first', 'second']);
  assert.deepEqual(filterCommerceItems(records, { section: 'tours', query: 'mountain', area: 'Canmore', category: 'Walking' }).map(row => row.id), ['second']);
  assert.deepEqual(filterCommerceItems(records, { section: 'tours', query: 'unknown' }), []);
  assert.deepEqual(commerceFacets(records, 'tours'), { areas: ['Banff', 'Canmore'], categories: ['Walking'] });
  assert.equal(JSON.stringify(records), before);
});

test('a precise place match does not silently fall back to another destination sharing its generic outing', () => {
  const records = [item('banff-tour', { relatedPlaceIds: ['banff-gondola'], relatedActivityIds: ['gondola'] }), item('louise-lesson', { relatedPlaceIds: ['lake-louise'], relatedActivityIds: ['nordic'] }), item('reference', { relatedPlaceIds: ['banff-gondola'], status: 'reference-only' }), item('guide', { section: 'guides', relatedPlaceIds: ['banff-gondola'] })];
  assert.deepEqual(relatedCommerceItems(records, { placeId: 'cross-country-skiing', activityId: 'nordic' }), []);
  assert.deepEqual(relatedCommerceItems(records, { placeId: 'banff-gondola' }).map(row => row.id), ['banff-tour']);
  assert.deepEqual(relatedCommerceItems(records, {}), []);
});

test('button copy distinguishes searches and reference-only leads from booking dates', () => {
  assert.equal(commerceLinkTitle(link(product)), 'View dates in browser');
  assert.equal(commerceLinkTitle(link(product, { kind: 'search' })), 'Browse options in browser');
  assert.equal(commerceLinkTitle(link(expedia, { kind: 'property', provider: 'Expedia' }), 'reference-only'), 'View listing in browser');
  assert.equal(commerceLinkTitle(link(product), 'check-details'), 'Check details in browser');
});

test('every real generated directory CTA is accepted without dropping a published destination', () => {
  assert.ok(commerceItems.length > 500);
  for (const item of commerceItems) {
    assert.ok(item.links.length > 0, item.id);
    for (const target of item.links) {
      assert.equal(safeCommerceUrl(target), target.url, `${item.id}: ${target.provider}`);
      assert.equal(isAllowedCommerceUrl(target.url), true, item.id);
    }
    if (item.guideUrl) assert.equal(isAllowedCommerceUrl(item.guideUrl), true, item.id);
  }
});
