import adventures from './banffExperienceProducts/adventures.json';
import lakesTransport from './banffExperienceProducts/lakes-transport.json';
import additional from './banffExperienceProducts/additional.json';
import miscellaneous from './banffExperienceProducts/miscellaneous.json';
import railHistory from './banffExperienceProducts/rail-history.json';
import specialistA from './banffExperienceProducts/specialist-a.json';
import specialistB from './banffExperienceProducts/specialist-b.json';
import specialistC from './banffExperienceProducts/specialist-c.json';
import inventory from './banffExperienceInventory.json';
import groups from './banffExperienceGroups.json';
import { getExperiencePhoto } from './banffExperiencePhotos';
import { activityBookingOffers, activityCampaignTargets } from './activityCampaignTargets';

export interface ExperienceFact { label: string; value: string; }
export interface ExperienceSection { id: string; title: string; paragraphs: string[]; }
export interface ExperienceFAQ { question: string; answer: string; }
/** Independently written facts, after reading the product's full description. */
export interface ExperienceProductRecord {
  productId: string; productUrl: string; title: string; description: string;
  category: string; departure: string; provider: string; checkedAt: string;
  sourceUrls: string[]; lead: string; facts: ExperienceFact[];
  sections: ExperienceSection[]; bookingChecks: string[]; faqs: ExperienceFAQ[];
  launchState: 'ready' | 'held'; notice: string; duration?: string; season?: string; slug?: string;
}
export interface ExperienceIdentity { productId: string; productUrl: string; optionTitle: string; }
export interface UnresolvedExperience { productId: string; reason: string; productUrl?: string; }
interface ExperiencePartition { schemaVersion?: number; products: ExperienceProductRecord[]; unresolved?: UnresolvedExperience[]; }
export interface ExperiencePhoto { src: string; alt: string; caption: string; sourceUrl?: string; author?: string; license?: string; licenseUrl?: string; changeNote?: string; }
export interface ExperienceGroupRecord {
  id: string; slug: string; title: string; description: string; category: string; departure: string;
  lead: string; sections: ExperienceSection[]; bookingChecks: string[]; faqs: ExperienceFAQ[];
  productIds: string[]; primaryProductId: string; launchState: 'ready' | 'held'; notice: string;
  existingGuidePath?: string; aliases?: string[]; checkedAt?: string; sourceUrls?: string[];
}
export interface ExperienceOption extends ExperienceIdentity {
  offerId: string; reviewState: 'reviewed' | 'listing-only'; details?: ExperienceProductRecord;
}
export interface BanffExperienceGroup extends ExperienceGroupRecord {
  contentId: string; categoryId: string; categoryLabel: string; departureIds: string[];
  canonicalPath: string; aliases: string[]; photo: ExperiencePhoto;
  options: ExperienceOption[]; primary: ExperienceOption; sourceUrls: string[];
}
export const experiencePartnerId = 'QW960HO';
export const experienceMaximumCpcGBP = 0.07;
const cleanText = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim() || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`Experience content needs plain ${field}.`);
  return value.trim();
};
const plainList = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || !value.length) throw new Error(`Experience content needs ${field}.`);
  return value.map(item => cleanText(item, field));
};
const productId = (value: unknown): string => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new Error('Invalid experience product identity.');
  return value;
};
const safeSource = (value: unknown): string => {
  const url = new URL(cleanText(value, 'source URL'));
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Experience sources need credential-free HTTPS URLs.');
  return url.href;
};
function sourceDate(value: unknown): string {
  const result = cleanText(value, 'review date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || new Date(result).toISOString().slice(0, 10) !== result) throw new Error('Invalid experience review date.');
  return result;
}
export function canonicalExperienceProductUrl(value: unknown, expectedProductId: string): string {
  const url = new URL(cleanText(value, 'product URL'));
  if (url.origin !== 'https://www.getyourguide.com' || url.username || url.password || url.search || url.hash) throw new Error('Experience identity needs a clean GetYourGuide product URL.');
  // Locale changes display language, not product identity. Fixed English paths
  // also match the site's existing bounded native-referral installer.
  url.pathname = url.pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?\//, '/');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  if (!/^\/[a-z0-9-]+\/[a-z0-9-]+-t\d+\/$/.test(url.pathname) || !url.pathname.endsWith(`-t${productId(expectedProductId)}/`)) throw new Error('Experience URL and product ID must match.');
  return url.href;
}
export function experienceBookingUrl(value: string, expectedProductId: string): string {
  const url = new URL(canonicalExperienceProductUrl(value, expectedProductId));
  url.searchParams.set('partner_id', experiencePartnerId);
  url.searchParams.set('cmp', `banffbound_experience_${expectedProductId}`);
  return url.href;
}
const filterId = (value: string): string => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const categoryLabel = (value: string): string => value.includes('-') && !value.includes(' ') ? value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : value;
const departurePlaces = [
  ['banff', 'Banff', /\bbanff\b/i], ['canmore', 'Canmore', /\bcanmore\b/i],
  ['calgary', 'Calgary', /\bcalgary\b|\byyc\b/i], ['lake-louise', 'Lake Louise', /\blake louise\b/i],
  ['jasper', 'Jasper', /\bjasper\b/i], ['vancouver', 'Vancouver', /\bvancouver\b/i],
  ['golden', 'Golden', /\bgolden\b/i], ['kananaskis', 'Kananaskis', /\bkananaskis\b/i],
  ['edmonton', 'Edmonton', /\bedmonton\b/i], ['radium', 'Radium / Panorama', /\bradium\b|\bpanorama\b/i],
] as const;
function departuresFor(value: string): string[] {
  const found = departurePlaces.filter(([, , expression]) => expression.test(value)).map(([id]) => id);
  return found.length ? found : ['other'];
}
function sections(value: unknown, field: string): ExperienceSection[] {
  if (!Array.isArray(value) || !value.length) throw new Error(`${field} needs original planning sections.`);
  const ids = new Set<string>();
  return value.map(section => {
    const id = cleanText(section.id, 'section ID');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error(`${field} has invalid section IDs.`);
    ids.add(id);
    return { id, title: cleanText(section.title, 'section title'), paragraphs: plainList(section.paragraphs, 'original paragraphs') };
  });
}
function faqs(value: unknown): ExperienceFAQ[] {
  if (!Array.isArray(value) || !value.length) throw new Error('Experience content needs original FAQs.');
  return value.map(faq => ({ question: cleanText(faq.question, 'FAQ question'), answer: cleanText(faq.answer, 'FAQ answer') }));
}
function partition(value: unknown): ExperiencePartition {
  if (Array.isArray(value)) return { products: value as ExperienceProductRecord[] };
  if (!value || typeof value !== 'object' || !Array.isArray((value as ExperiencePartition).products)) throw new Error('Experience partitions need products and explicit unresolved records.');
  const result = value as ExperiencePartition;
  if (result.schemaVersion !== undefined && result.schemaVersion !== 1) throw new Error('Unsupported experience schema.');
  return result;
}
const partitions = [adventures, lakesTransport, additional, miscellaneous, railHistory, specialistA, specialistB, specialistC].map(partition);
const inventoryObject = inventory as unknown as { products: (ExperienceIdentity & { title?: string })[]; excluded?: { productId: string; reason: string }[] };
if (!inventoryObject || !Array.isArray(inventoryObject.products)) throw new Error('Experience inventory needs a product identity array.');
const identityMap = new Map<string, ExperienceIdentity>();
for (const raw of inventoryObject.products) {
  const id = productId(raw.productId);
  if (identityMap.has(id)) throw new Error(`Duplicate catalogue product ${id}.`);
  identityMap.set(id, { productId: id, productUrl: canonicalExperienceProductUrl(raw.productUrl, id), optionTitle: cleanText(raw.optionTitle || raw.title, 'original option title') });
}
const detailMap = new Map<string, ExperienceProductRecord>();
for (const raw of partitions.flatMap(part => part.products)) {
  const id = productId(raw.productId), identity = identityMap.get(id);
  if (!identity || detailMap.has(id)) throw new Error(`Reviewed product ${id} must be unique and in the discovered inventory.`);
  const productUrl = canonicalExperienceProductUrl(raw.productUrl, id);
  // GetYourGuide can retain old location/title aliases for the same numeric
  // product. Keep the checked source URL in facts and the live inventory URL
  // on native booking links; both have independently passed the ID guard.
  const sourceUrls = [...new Set(plainList(raw.sourceUrls, 'source URLs').map(safeSource))];
  if (productUrl !== identity.productUrl && !sourceUrls.some(source => {
    try { return canonicalExperienceProductUrl(source, id) === productUrl; } catch { return false; }
  })) throw new Error(`Reviewed product ${id} needs a checked source for its URL alias.`);
  if (!['ready', 'held'].includes(raw.launchState)) throw new Error(`Product ${id} needs an explicit readiness state.`);
  if (!Array.isArray(raw.facts) || !raw.facts.length) throw new Error(`Reviewed product ${id} needs its actual facts.`);
  detailMap.set(id, {
    ...raw, productId: id, productUrl, title: cleanText(raw.title, 'original title'), description: cleanText(raw.description, 'original description'),
    category: cleanText(raw.category, 'category'), departure: cleanText(raw.departure, 'departure'), provider: cleanText(raw.provider, 'provider'),
    checkedAt: sourceDate(raw.checkedAt), sourceUrls,
    lead: cleanText(raw.lead, 'original introduction'), notice: cleanText(raw.notice, 'booking notice'),
    facts: raw.facts.map(fact => ({ label: cleanText(fact.label, 'fact label'), value: cleanText(fact.value, 'fact value') })),
    sections: sections(raw.sections, `Product ${id}`), bookingChecks: plainList(raw.bookingChecks, 'booking checks'), faqs: faqs(raw.faqs),
    duration: raw.duration ? cleanText(raw.duration, 'duration') : undefined, season: raw.season ? cleanText(raw.season, 'season') : undefined,
  });
}
export const unresolvedExperiences: UnresolvedExperience[] = partitions.flatMap(part => part.unresolved || []).map(raw => {
  const id = productId(raw.productId);
  if (!identityMap.has(id) || detailMap.has(id)) throw new Error(`Product ${id} cannot be unresolved and reviewed, or absent from the inventory.`);
  return { productId: id, reason: cleanText(raw.reason, 'unresolved reason'), productUrl: raw.productUrl ? canonicalExperienceProductUrl(raw.productUrl, id) : undefined };
});
if (new Set(unresolvedExperiences.map(item => item.productId)).size !== unresolvedExperiences.length) throw new Error('Duplicate unresolved product identities.');
export const experienceProducts: ExperienceOption[] = [...identityMap.values()].map(identity => ({
  ...identity, offerId: `gyg-${identity.productId}`, reviewState: detailMap.has(identity.productId) ? 'reviewed' : 'listing-only', details: detailMap.get(identity.productId),
}));
const optionMap = new Map(experienceProducts.map(item => [item.productId, item]));
const canonicalPath = (value: string): string => {
  if (!/^\/(?:blog|activities|experiences)\/[a-z0-9-]+\/?$/.test(value)) throw new Error(`Invalid experience guide path: ${value}`);
  return value.endsWith('/') ? value : value + '/';
};
const oldPrimaryAt = (path: string, id: string): boolean => activityCampaignTargets.some(target => target.primaryOfferId === `gyg-${id}` && (target.guidePath === path || target.aliases.includes(path)));
const rawGroups = Array.isArray(groups) ? groups : (groups as unknown as { groups: ExperienceGroupRecord[] }).groups;
if (!Array.isArray(rawGroups)) throw new Error('Experience groups need an explicit group array.');
const seenGroupIds = new Set<string>(), seenSlugs = new Set<string>(), seenPaths = new Set<string>();
export const banffExperienceGroups: BanffExperienceGroup[] = (rawGroups as ExperienceGroupRecord[]).map(raw => {
  const id = cleanText(raw.id, 'group ID'), slug = cleanText(raw.slug, 'original group slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 60 || seenGroupIds.has(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 140 || seenSlugs.has(slug)) throw new Error('Experience groups need unique bounded IDs and original slugs.');
  seenGroupIds.add(id); seenSlugs.add(slug);
  const ids = plainList(raw.productIds, 'product IDs').map(productId);
  if (new Set(ids).size !== ids.length) throw new Error(`Group ${id} repeats an operator option.`);
  const optionRank = (option: ExperienceOption): number => !option.details ? 2
    : option.details.launchState === 'ready' && activityBookingOffers.find(item => item.productId === option.productId)?.launchState !== 'held' ? 0 : 1;
  const options = ids.map(key => { const option = optionMap.get(key); if (!option) throw new Error(`Group ${id} uses unknown product ${key}.`); return option; })
    .sort((a, b) => optionRank(a) - optionRank(b) || (a.details?.title || a.optionTitle).localeCompare(b.details?.title || b.optionTitle));
  const primary = optionMap.get(productId(raw.primaryProductId));
  if (!primary || !ids.includes(primary.productId)) throw new Error(`Group ${id} must name one of its own options as primary.`);
  if (!primary.details) throw new Error(`Group ${id} needs a full-description review for its primary booking option.`);
  if (!['ready', 'held'].includes(raw.launchState)) throw new Error(`Group ${id} needs an explicit paid-readiness state.`);
  const previous = activityBookingOffers.find(offer => offer.productId === primary.productId);
  if (raw.launchState === 'ready' && (!primary.details || primary.details.launchState !== 'ready' || previous?.launchState === 'held')) throw new Error(`Group ${id} cannot launch without a fully reviewed, ready exact primary.`);
  const existingGuidePath = raw.existingGuidePath ? canonicalPath(raw.existingGuidePath) : undefined;
  const aliases = (raw.aliases || []).map(canonicalPath);
  if (existingGuidePath && !oldPrimaryAt(existingGuidePath, primary.productId)) throw new Error(`Group ${id} does not match its existing guide's primary product.`);
  if (aliases.some(path => !oldPrimaryAt(path, primary.productId))) throw new Error(`Group ${id} has an unrelated existing-guide alias.`);
  const path = existingGuidePath || `/experiences/${slug}/`;
  for (const item of [path, ...aliases]) { if (seenPaths.has(item)) throw new Error(`Experience guide paths must be unique: ${item}`); seenPaths.add(item); }
  const category = cleanText(raw.category, 'category'), departure = cleanText(raw.departure, 'departure');
  const categoryId = filterId(category); if (!categoryId) throw new Error('Experience category must have a usable filter ID.');
  const photo = getExperiencePhoto(`${category} ${id}`, departure) as ExperiencePhoto;
  if (!photo || !photo.src || !photo.alt || !photo.caption || photo.src.startsWith('//') || (!photo.src.startsWith('/') && !/^https:\/\//.test(photo.src))) throw new Error(`Group ${id} needs matched photograph metadata.`);
  return {
    ...raw, id, slug, existingGuidePath, aliases, primaryProductId: primary.productId, productIds: ids,
    title: cleanText(raw.title, 'original guide title'), description: cleanText(raw.description, 'original guide description'),
    lead: cleanText(raw.lead, 'original guide introduction'), sections: sections(raw.sections, `Group ${id}`),
    bookingChecks: plainList(raw.bookingChecks, 'guide booking checks'), faqs: faqs(raw.faqs), notice: cleanText(raw.notice, 'guide notice'),
    category, departure, categoryId, categoryLabel: categoryLabel(category), departureIds: departuresFor(departure), canonicalPath: path,
    contentId: `experience-${id}`, photo, options, primary, checkedAt: raw.checkedAt ? sourceDate(raw.checkedAt) : primary.details?.checkedAt,
    sourceUrls: [...new Set([...(raw.sourceUrls || []).map(safeSource), ...options.flatMap(option => option.details?.sourceUrls || [])])],
  };
}).sort((a, b) => a.title.localeCompare(b.title, 'en'));
/** Directory entries are substantive groups, never individual listing pages. */
export const banffExperiences = [...banffExperienceGroups].sort((a, b) => Number(b.launchState === 'ready') - Number(a.launchState === 'ready') || a.title.localeCompare(b.title, 'en'));
export const newExperienceGuides = banffExperienceGroups.filter(group => !group.existingGuidePath);
export const experienceCategories = [...new Map(banffExperienceGroups.map(group => [group.categoryId, { value: group.categoryId, label: group.categoryLabel }])).values()]
  .sort((a, b) => a.label.localeCompare(b.label)).map(option => ({ ...option, count: banffExperienceGroups.filter(group => group.categoryId === option.value).length }));
export const experienceDepartures = [...departurePlaces.map(([value, label]) => ({ value, label })), { value: 'other', label: 'Other departure' }]
  .map(option => ({ ...option, count: banffExperienceGroups.filter(group => group.departureIds.includes(option.value)).length })).filter(option => option.count > 0);
export function getBanffExperience(slug: string): BanffExperienceGroup | undefined { return banffExperienceGroups.find(group => group.slug === slug); }
export function getExperienceGroupForPath(pathOrSlug: unknown): BanffExperienceGroup | undefined {
  if (typeof pathOrSlug !== 'string' || !pathOrSlug || pathOrSlug !== pathOrSlug.trim() || /[?#\\]/.test(pathOrSlug)) return undefined;
  const value = /^[a-z0-9-]+$/.test(pathOrSlug) ? `/blog/${pathOrSlug}/` : pathOrSlug;
  let path: string; try { path = canonicalPath(value); } catch { return undefined; }
  return banffExperienceGroups.find(group => group.canonicalPath === path || group.aliases.includes(path));
}
export function experienceOptionTarget(group: BanffExperienceGroup, option: ExperienceOption) {
  if (!group.productIds.includes(option.productId)) throw new Error('An offer must belong to its rendered guide.');
  const previous = activityBookingOffers.find(offer => offer.productId === option.productId);
  const ready = group.launchState === 'ready' && option.details?.launchState === 'ready' && previous?.launchState !== 'held';
  return {
    id: `experience-${option.productId}`, offerId: option.offerId, title: option.details?.title || option.optionTitle,
    label: ready ? 'Book now' : 'Find out more', bookingUrl: experienceBookingUrl(option.productUrl, option.productId),
    campaignLabel: `banffbound_experience_${option.productId}`, paidCampaignLabel: `bb_ca_activities_experience_${option.productId}`,
    seasonalNotice: previous?.launchState === 'held' ? previous.seasonalNotice : option.details?.notice || group.notice,
    launchState: ready ? 'ready' : 'held', kind: 'product' as const, guidePath: group.canonicalPath,
  };
}
export function experienceBookingTarget(group: BanffExperienceGroup) { return { ...experienceOptionTarget(group, group.primary), id: group.contentId }; }
const excluded = (inventoryObject.excluded || []).map(item => ({ productId: productId(item.productId), reason: cleanText(item.reason, 'exclusion reason') }));
if (new Set(excluded.map(item => item.productId)).size !== excluded.length || excluded.some(item => !identityMap.has(item.productId))) throw new Error('Exclusions must name unique discovered products.');
export function getExperienceCoverage() {
  const mapped = new Set(banffExperienceGroups.flatMap(group => group.productIds));
  const excludedIds = new Set(excluded.map(item => item.productId));
  if ([...excludedIds].some(id => mapped.has(id))) throw new Error('An excluded product cannot also be presented as a mapped option.');
  const missing = [...identityMap.keys()].filter(id => !mapped.has(id) && !excludedIds.has(id));
  const listingOnly = [...identityMap.keys()].filter(id => !detailMap.has(id));
  return {
    inventoryProductIds: [...identityMap.keys()], mappedProductIds: [...mapped], reviewedProductIds: [...detailMap.keys()],
    listingOnlyProductIds: listingOnly, unresolvedRecords: unresolvedExperiences,
    excludedProducts: excluded, missingProductIds: missing,
    counts: { discoveredProducts: identityMap.size, mappedProducts: mapped.size, fullyReviewedDescriptions: detailMap.size, listingOnlyProducts: listingOnly.length, excludedProducts: excluded.length, missingProducts: missing.length },
    identityCoverageComplete: identityMap.size > 0 && missing.length === 0,
    allDescriptionsReviewed: identityMap.size > 0 && listingOnly.length === 0,
    // Backwards-compatible coverage flag means identity accounting only.
    complete: identityMap.size > 0 && missing.length === 0,
  };
}
export const experienceCoverage = getExperienceCoverage();
