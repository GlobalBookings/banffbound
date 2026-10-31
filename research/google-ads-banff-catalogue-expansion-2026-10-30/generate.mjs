/** Build a reviewable native-web CSV package. No network or account operations. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const originalRoot = '/Users/jackchittenden/Desktop/DROID/BanffBound';
const previousDir = path.join(originalRoot, 'research/google-ads-activity-expansion-2026-10-30-live');
const templatePath = path.join(root, 'research/google-ads-activity-expansion-2026-10-30/template-provenance.json');
const campaignId = '24416287886';
const campaignName = 'BB | CA | Search | Winter activities | 50GBP test';
const cohort = 'bb_ca_winter_50_test';
const maximumCpc = '0.07';
const sha = value => createHash('sha256').update(value).digest('hex');
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const save = async (name, value) => writeFile(path.join(here, name), JSON.stringify(value, null, 2) + '\n');

// Native Excel CSV exports are UTF-16 tab-separated and may quote cells.
function parseDelimited(input, delimiter) {
  const rows = []; let row = [], value = '', quoted = false;
  const text = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) { row.push(value); value = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(value); if (row.some(cell => cell !== '')) rows.push(row);
      row = []; value = '';
    } else value += char;
  }
  assert.equal(quoted, false, 'The native keyword export has an unterminated cell.');
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift(); assert(headers?.length);
  return rows.map(cells => { assert.equal(cells.length, headers.length, 'Native export cells must match its headers.'); return Object.fromEntries(headers.map((key, i) => [key, cells[i]])); });
}
function plainTerm(value, matchType) {
  let term = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (matchType === 'Exact match' && term.startsWith('[') && term.endsWith(']')) term = term.slice(1, -1);
  if (matchType === 'Phrase match' && term.startsWith('"') && term.endsWith('"')) term = term.slice(1, -1);
  return term;
}
const keywordKey = (groupId, type, term) => [groupId, type.toLowerCase(), plainTerm(term, type)].join('\u0000');
function pathOnly(value) {
  const url = new URL(value);
  assert.equal(url.origin, 'https://banffbound.com');
  assert(!url.search && !url.hash && !url.username && !url.password);
  return url.pathname.replace(/\/?$/, '/');
}
function csv(headers, rows) {
  const cell = value => { const s = String(value ?? ''); return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s; };
  return [headers, ...rows.map(row => headers.map(key => row[key] || ''))].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
function blankRow(headers, values) {
  assert(Object.keys(values).every(key => headers.includes(key)), 'Use only native template columns.');
  return Object.fromEntries(headers.map(key => [key, values[key] || '']));
}
function reviewCopy(raw, id) {
  assert.deepEqual(Object.keys(raw).sort(), ['adGroupName', 'descriptions', 'exactKeywords', 'headlines', 'id', 'phraseKeywords'].sort(), 'Review copy has a bounded schema.');
  assert.equal(raw.id, id);
  assert(typeof raw.adGroupName === 'string' && raw.adGroupName.trim() === raw.adGroupName && raw.adGroupName.length <= 128);
  for (const key of ['exactKeywords', 'phraseKeywords', 'headlines', 'descriptions']) assert(Array.isArray(raw[key]) && raw[key].every(x => typeof x === 'string' && x.trim() === x && x.length));
  assert(raw.exactKeywords.length >= 3 && raw.phraseKeywords.length >= 2);
  assert(raw.exactKeywords.length + raw.phraseKeywords.length >= 6 && raw.exactKeywords.length + raw.phraseKeywords.length <= 10, 'Each guide family has 6–10 reviewed candidate terms.');
  assert(raw.headlines.length >= 6 && raw.headlines.length <= 10 && raw.headlines.every(x => x.length <= 30));
  assert(raw.descriptions.length >= 2 && raw.descriptions.length <= 4 && raw.descriptions.every(x => x.length <= 90));
  const merchant = /\b(?:getyourguide|gyg|viator|tripadvisor|expedia|radventures|discover banff tours|abestx|fairy bus|horizon touring|banff todo|banff daytrips|rockies journey|pursuit|banff explorer|brewster|fairmont)\b/i;
  assert([...raw.exactKeywords, ...raw.phraseKeywords, ...raw.headlines, ...raw.descriptions].every(x => !merchant.test(x)), 'Ad text and keywords exclude merchant/provider brand targeting.');
  assert([...raw.exactKeywords, ...raw.phraseKeywords].every(x => !/[\[\]"<>\n\r]/.test(x) && x.length <= 80 && x.split(/\s+/).length <= 10));
  for (const [type, values] of [['Exact match', raw.exactKeywords], ['Phrase match', raw.phraseKeywords]]) assert.equal(new Set(values.map(x => plainTerm(x, type))).size, values.length, 'No repeated term within a match type.');
  return raw;
}

await mkdir(here, { recursive: true });
assert.equal((await json(path.join(root, 'package.json'))).name, 'banffbound');
const compiled = await build({ stdin: { contents: "export { banffExperienceGroups } from './src/data/banffExperiences.ts';", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', metafile: true, logLevel: 'silent' });
let banffExperienceGroups;
try {
  ({ banffExperienceGroups } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64')));
} catch (error) {
  throw new Error('Validated guide model failed: ' + error.message);
}
assert(banffExperienceGroups.length > 0);
const copyFile = path.join(here, 'review-copy.json');
const review = await json(copyFile);
assert.equal(review.schemaVersion, 1);
assert.equal(new Set(review.groups.map(g => g.id)).size, review.groups.length);
const copyMap = new Map(review.groups.map(g => [g.id, g]));
assert.deepEqual([...copyMap.keys()].sort(), banffExperienceGroups.map(g => g.id).sort(), 'Every distinct family needs explicit reviewed copy and no abandoned family copy.');
const previousPath = path.join(previousDir, 'final-verification-receipt.json');
const previous = await json(previousPath);
assert.equal(previous.activityCampaignId, campaignId);
assert.equal(previous.campaignPreservation.currency, 'GBP');
assert.equal(previous.campaignPreservation.totalBudget, 50);
assert.equal(previous.campaignPreservation.budgetType, 'Campaign Total');
assert.equal(previous.campaignPreservation.maximumCpcGBP, .07);
assert.equal(previous.campaignPreservation.bidStrategy, 'Maximize clicks');
assert.equal(previous.campaignPreservation.country, 'Canada');
assert.equal(previous.campaignPreservation.googleSearchPartners, false);
assert.equal(previous.campaignPreservation.displayNetwork, false);
assert.equal(previous.campaignPreservation.existingDates, '2026-10-31 through 2026-11-06');
assert.equal(previous.savedAds.length, 13);
const priorByPath = new Map();
for (const ad of previous.savedAds) {
  const guide = pathOnly(ad.finalUrl);
  assert(!priorByPath.has(guide), 'An existing canonical path must resolve to exactly one saved group.');
  priorByPath.set(guide, ad);
}
const keywordPath = path.join(previousDir, '06-keywords-readback.csv');
const keywordBuffer = await readFile(keywordPath);
const priorKeywords = parseDelimited(keywordBuffer.toString('utf16le'), '\t').map(row => {
  assert.equal(row['Campaign ID'], campaignId);
  assert(['Exact match', 'Phrase match'].includes(row['Match type']));
  return { groupId: row['Ad group ID'], groupName: row['Ad group'], matchType: row['Match type'], term: plainTerm(row.Keyword, row['Match type']), status: row['Keyword status'] };
});
assert.equal(priorKeywords.length, 97);
const previousTerms = new Set(priorKeywords.map(k => keywordKey(k.groupId, k.matchType, k.term)));
const templates = await json(templatePath);
const groups = [], ads = [], newKeywords = [], existingKeywords = [], plan = [];
const names = new Set(previous.savedAds.map(ad => ad.group));
const candidateOwners = new Map();
for (const group of banffExperienceGroups) {
  const copy = reviewCopy(copyMap.get(group.id), group.id);
  for (const [type, terms] of [['Exact match', copy.exactKeywords], ['Phrase match', copy.phraseKeywords]]) {
    for (const term of terms) {
      const key = type + '\u0000' + plainTerm(term, type);
      assert(!candidateOwners.has(key), `The same ${type} candidate must not route to two families: ${term}.`);
      candidateOwners.set(key, group.id);
    }
  }
  const guidePath = pathOnly('https://banffbound.com' + group.canonicalPath);
  const previousAd = priorByPath.get(guidePath);
  const aliasMatches = group.aliases.filter(alias => priorByPath.has(pathOnly('https://banffbound.com' + alias)));
  assert(!aliasMatches.length || previousAd, `Family ${group.id} overlaps a saved alias but needs explicit canonical reuse.`);
  const state = group.launchState === 'ready' ? 'Enabled' : 'Paused';
  const groupName = previousAd?.group || copy.adGroupName;
  if (!previousAd) { assert(!names.has(groupName), 'New group names must not collide with saved or new groups.'); names.add(groupName); }
  const groupId = previousAd?.groupId || '';
  const fixed = { 'Campaign ID': campaignId, Campaign: campaignName, 'Ad group ID': groupId, 'Ad group': groupName };
  const finalUrl = 'https://banffbound.com' + guidePath;
  const suffix = new URLSearchParams({ utm_source: 'google', utm_medium: 'cpc', utm_campaign: cohort, utm_content: 'experience_' + group.id.replaceAll('-', '_') + '_rsa' }).toString();
  if (!previousAd) {
    groups.push(blankRow(templates.templates.ad_group.headers, { 'Row Type': 'Ad group', Action: 'Add', 'Ad group status': state, ...fixed, 'Ad group type': 'Standard', 'Default max. CPC': maximumCpc }));
    const ad = { 'Row Type': 'Ad', Action: 'Add', 'Ad status': state, ...fixed, 'Ad type': 'Responsive search ad', 'Final URL': finalUrl, 'Final URL suffix': suffix };
    copy.headlines.forEach((value, i) => { ad['Headline ' + (i + 1)] = value; });
    copy.descriptions.forEach((value, i) => { ad['Description ' + (i + 1)] = value; });
    ads.push(blankRow(templates.templates.responsive_search_ad.headers, ad));
  }
  const added = [], alreadyPresent = [];
  for (const [type, values] of [['Exact match', copy.exactKeywords], ['Phrase match', copy.phraseKeywords]]) {
    for (const value of values) {
      const term = plainTerm(value, type);
      if (previousAd && previousTerms.has(keywordKey(groupId, type, term))) { alreadyPresent.push({ matchType: type, term }); continue; }
      const row = blankRow(templates.templates.keyword.headers, { 'Row Type': 'Keyword', Action: 'Add', 'Keyword status': state, ...fixed, Keyword: value, Type: type, 'Default max. CPC': maximumCpc });
      (previousAd ? existingKeywords : newKeywords).push(row);
      added.push({ matchType: type, term });
    }
  }
  plan.push({ id: group.id, title: group.title, category: group.category, departure: group.departure, canonicalPath: guidePath, guideFinalUrl: finalUrl, primaryProductId: group.primaryProductId, launchState: group.launchState, importedStatus: state, importMode: previousAd ? 'existing-group-keywords-only' : 'new-group-ad-and-keywords', groupName, existingGroupId: groupId || null, existingAdId: previousAd?.adId || null, adRowsAdded: previousAd ? 0 : 1, candidateKeywords: copy.exactKeywords.length + copy.phraseKeywords.length, newKeywords: added, alreadyPresentKeywords: alreadyPresent, headlines: copy.headlines, descriptions: copy.descriptions, finalUrlSuffix: previousAd ? null : suffix, existingStatusPreserved: Boolean(previousAd) });
}
const source = { schemaVersion: 1, sourceModel: 'src/data/banffExperiences.ts', groups: banffExperienceGroups.map(g => ({ id: g.id, title: g.title, canonicalPath: g.canonicalPath, aliases: g.aliases, category: g.category, departure: g.departure, primaryProductId: g.primaryProductId, launchState: g.launchState, productIds: g.productIds })) };
await save('source-groups.json', source);
await save('plan.json', { schemaVersion: 1, status: 'PREPARED_NOT_UPLOADED', groups: plan });
await save('existing-state.json', { source: 'Previously verified native readbacks; refresh before applying this package.', sourceReceipt: 'ORIGINAL/research/google-ads-activity-expansion-2026-10-30-live/final-verification-receipt.json', sourceReceiptSha256: sha(await readFile(previousPath)), sourceKeywordExportSha256: sha(keywordBuffer), savedAds: previous.savedAds, savedKeywords: priorKeywords });
await save('template-provenance.json', { ...templates, copiedFor: 'Banff distinct-guide-family expansion', copiedTemplateReceiptSha256: sha(await readFile(templatePath)) });
const fileSpecs = [
  ['01-new-ad-groups.csv', 'ad_group', 'Ad group', groups],
  ['02-new-responsive-search-ads.csv', 'responsive_search_ad', 'Ad', ads],
  ['03-new-group-keywords.csv', 'keyword', 'Keyword', newKeywords],
  ['04-existing-group-keyword-additions.csv', 'keyword', 'Keyword', existingKeywords],
];
const files = [];
for (const [file, template, rowType, rows] of fileSpecs) {
  const value = csv(templates.templates[template].headers, rows);
  await writeFile(path.join(here, file), value);
  files.push({ file, template, rowType, rows: rows.length, sha256: sha(value), uploadWhenNonEmpty: rows.length > 0 });
}
const inputPaths = [...new Set([...Object.keys(compiled.metafile.inputs).filter(file => file !== '<stdin>'), path.relative(root, copyFile)])].sort();
assert(inputPaths.every(file => !path.isAbsolute(file) && !file.startsWith('../')), 'Hash every bundled model input inside this repository.');
const inputs = await Promise.all(inputPaths.map(async file => ({ file, sha256: sha(await readFile(path.join(root, file))) })));
const keywordRows = [...newKeywords, ...existingKeywords];
const manifest = {
  schemaVersion: 1, preparedAtUTC: new Date().toISOString(), status: 'LOCAL_VALIDATED_PACKAGE_ONLY_NOT_UPLOADED',
  campaign: { id: campaignId, name: campaignName, accountCurrency: 'GBP' },
  preservation: { campaignRows: 0, budgetRows: 0, totalBudgetGBPUnchanged: 50, campaignMaximumCpcGBPUnchanged: .07, intendedNewKeywordAndGroupCpcGBP: .07, bidStrategyUnchanged: 'Maximize clicks', locationUnchanged: 'Canada, Presence', networksUnchanged: 'Google Search only', datesUnchanged: '2026-10-31 through 2026-11-06', hotelRows: 0, sharedAccountAssetRows: 0, existingAdRows: 0, existingGroupEdits: 0, existingKeywordEdits: 0 },
  counts: { guideFamilies: plan.length, readyFamilies: plan.filter(g => g.launchState === 'ready').length, heldFamilies: plan.filter(g => g.launchState === 'held').length, newGroups: groups.length, newAds: ads.length, newGroupKeywords: newKeywords.length, additionsToExistingGroups: existingKeywords.length, exactKeywords: keywordRows.filter(r => r.Type === 'Exact match').length, phraseKeywords: keywordRows.filter(r => r.Type === 'Phrase match').length, candidateTermsAlreadyPresent: plan.reduce((n, g) => n + g.alreadyPresentKeywords.length, 0), reusedExistingGroups: plan.filter(g => g.existingGroupId).length },
  files, sourceInputs: inputs,
  reviewArtifacts: ['review-copy.json', 'source-groups.json', 'plan.json', 'existing-state.json', 'template-provenance.json', 'generate.mjs', 'check-upload.py', 'README.md'].map(file => ({ file })),
  existingGroups: { policy: 'Only novel Keyword Add rows use the exact saved group ID/name. Existing ads, group names, statuses and terms are not edited. A held family only adds Paused terms; it does not pause an existing live object.', sourceReadbackMustBeRefreshed: true },
  urlContract: { finalUrls: 'Clean actual canonical guide paths from the validated site model.', source: 'google', medium: 'cpc', cohort, content: 'Fixed experience_<family_id>_rsa label for new ads; no raw visitor parameters.' },
  paidReadinessMeaning: 'Ready is a reviewed guide/primary match, not proof of date inventory, policy approval, delivery, bookings or margin.',
  importBoundary: { accountOperationsPerformed: false, previewPerformed: false, applyPerformed: false, liveDestinationsCheckedByWriter: false, requiredBeforeApply: ['Verify the deployed guide revision and all actual clean destinations.', 'Refresh native saved-state exports and remove any newly duplicated terms.', 'Preview each non-empty file and check exact destination campaign, counts and zero errors.', 'Apply in listed order; do not blindly reapply Add rows.', 'Read back native group/ad/keyword statuses, final URLs, 7p campaign cap and £50 total budget.'] },
  bidsNote: 'Default max. CPC fields request 7p on new group/keyword rows. Under Maximize clicks the campaign-level maximum CPC is the controlling limit and must be verified in native settings.',
};
for (const item of manifest.reviewArtifacts) item.sha256 = sha(await readFile(path.join(here, item.file)));
await save('manifest.json', manifest);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, outputDirectory: here }));
