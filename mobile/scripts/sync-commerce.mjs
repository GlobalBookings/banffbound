#!/usr/bin/env node
/** Deterministic, network-free export of the separately pinned published commerce catalogue. */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const mobileRoot = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = path.resolve(mobileRoot, '..');
const sourceFlag = process.argv.find(value => value.startsWith('--source-root='));
const sourceIndex = process.argv.indexOf('--source-root');
const sourceRoot = path.resolve(sourceFlag?.slice('--source-root='.length) || (sourceIndex >= 0 ? process.argv[sourceIndex + 1] : repoRoot));
const check = process.argv.includes('--check');
const require = createRequire(import.meta.url);
const { build } = require('esbuild'); // Installed with the mobile TypeScript tooling; generation only.
const pinBytes = await readFile(path.join(mobileRoot, 'release/reviewed-commerce-source.json'));
const pin = JSON.parse(pinBytes);
const hash = value => createHash('sha256').update(value).digest('hex');
const invariant = (condition, message) => { if (!condition) throw new Error(message); };
invariant(pin.schemaVersion === 1 && /^[a-f0-9]{40}$/.test(pin.commit), 'Invalid reviewed commerce source pin.');
invariant(execFileSync('git', ['-C', sourceRoot, 'rev-parse', '--verify', pin.commit + '^{commit}'], { encoding: 'utf8' }).trim() === pin.commit, 'Reviewed commerce commit is unavailable.');
const inputs = new Map();
async function verifyInput(relative) {
  invariant(relative.startsWith('src/') && !relative.includes('..') && !path.isAbsolute(relative), 'Invalid website input path.');
  const bytes = await readFile(path.join(sourceRoot, relative));
  const committed = execFileSync('git', ['-C', sourceRoot, 'show', `${pin.commit}:${relative}`], { maxBuffer: 16 * 1024 * 1024 });
  invariant(bytes.equals(committed), 'Commerce source differs from reviewed commit: ' + relative);
  inputs.set(relative, hash(bytes));
}
const moduleFiles = {
  activityTargets: 'src/data/activityCampaignTargets.ts', winter: 'src/data/winterActivityLanding.ts',
  activity: 'src/data/activities.ts', activityPlanning: 'src/data/activityPlanning.ts',
  hotels: 'src/data/hotelDirectory.ts', rentals: 'src/data/rentals.ts', rentalPlanning: 'src/data/rentalPlanning.ts',
  posts: 'src/data/blogPosts.ts', bodies: 'src/data/blogContentRegistry.ts', articleContext: 'src/data/articleBookingContext.ts',
  towns: 'src/data/towns.ts', trails: 'src/data/trails.ts',
};
const bundled = await build({ stdin: { contents: Object.entries(moduleFiles).map(([name,file]) => `export * as ${name} from './${file}';`).join('\n'), resolveDir: sourceRoot }, absWorkingDir: sourceRoot, bundle: true, write: false, metafile: true, format: 'esm', platform: 'node', target: 'es2022', logLevel: 'silent' });
for (const filename of Object.keys(bundled.metafile.inputs).filter(value => value !== '<stdin>').sort()) await verifyInput(filename);
const source = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
async function pageData(relative, names) {
  await verifyInput(relative);
  const page = (await readFile(path.join(sourceRoot, relative), 'utf8')).split('---')[1];
  invariant(typeof page === 'string', 'Missing reviewed page frontmatter: ' + relative);
  const contents = page.replace(/^import .*?;\s*$/gm, '') + `\nexport { ${names.join(',')} };`;
  const compiled = await build({ stdin: { contents, loader: 'ts', resolveDir: path.dirname(path.join(sourceRoot, relative)) }, bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
  return import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
}
const [tourPage, packing] = await Promise.all([
  pageData('src/pages/tours.astro', ['featuredTours','categories']),
  pageData('src/pages/packing-list.astro', ['groups']),
]);
await verifyInput('src/components/CarRentalCTA.astro');
const carSource = await readFile(path.join(sourceRoot, 'src/components/CarRentalCTA.astro'), 'utf8');
const carUrl = carSource.match(/const CAR_RENTAL_URL = '([^']+)'/)?.[1];
invariant(carUrl === 'https://expedia.com/affiliate/KB6G4xt', 'Unreviewed car rental referral.');
const absolute = value => value.startsWith('/') ? 'https://banffbound.com' + value : value;
const plain = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const area = value => /canmore/i.test(value) ? 'Canmore' : /louise/i.test(value) ? 'Lake Louise' : /kananaskis/i.test(value) ? 'Kananaskis' : /jasper/i.test(value) ? 'Jasper' : /golden/i.test(value) ? 'Golden' : /yoho|kootenay/i.test(value) ? 'Yoho & Kootenay' : 'Banff & the Rockies';
const disclosure = 'Affiliate link: BanffBound may earn a commission from qualifying bookings. The provider sets current prices, availability and booking terms.';
const sourceUrlTransforms = new Map();
const ownLink = (id, url, label = 'Read on BanffBound') => ({ id, label, url: absolute(url), provider: 'BanffBound', kind: 'guide', affiliate: false });
const items = [];
function add(item) { invariant(!items.some(value => value.id === item.id), 'Duplicate commerce ID: ' + item.id); items.push(item); }
function merchantLink(id, url, label) {
  const u = new URL(url);
  invariant(u.protocol === 'https:' && !u.username && !u.password, 'Unsafe commerce URL.');
  if (u.hostname === 'www.getyourguide.com' && u.searchParams.get('partner_id') === 'QW960HO') {
    u.searchParams.set('cmp', 'banffboundapp');
    sourceUrlTransforms.set(url, u.href);
    return { id, label: label || (/-t\d+\/$/.test(u.pathname) ? 'View the GetYourGuide listing' : 'Search on GetYourGuide'), url: u.href, provider: 'GetYourGuide', kind: /-t\d+\/$/.test(u.pathname) ? 'product' : 'search', affiliate: true };
  }
  if (['www.expedia.ca','www.expedia.com','expedia.com'].includes(u.hostname) && (u.searchParams.get('camref') === '1101l3MtWX' || url === carUrl)) return { id, label: label || (/\.h\d+\.Hotel-Information$/.test(u.pathname) ? 'View the Expedia property' : 'Search on Expedia'), url, provider: 'Expedia', kind: url === carUrl ? 'referral' : /\.h\d+\.Hotel-Information$/.test(u.pathname) ? 'property' : 'search', affiliate: true };
  if (u.hostname === 'vrbo.com' && u.pathname === '/affiliate' && u.searchParams.get('camref') === '1101l3MtWL' && u.searchParams.get('creativeref') === '1011l63087' && u.searchParams.get('adref') === 'PZBJVX1Er0') {
    const landing = new URL(u.searchParams.get('landingPage'));
    invariant(landing.protocol === 'https:' && !landing.username && !landing.password && ['vrbo.com','www.vrbo.com'].includes(landing.hostname), 'Unreviewed Vrbo landing page.');
    return { id, label: label || 'Check this historical Vrbo lead', url, provider: 'Vrbo', kind: 'property', affiliate: true };
  }
  throw new Error('Unreviewed commerce provider or tracking identity.');
}
function identity(url) {
  const u = new URL(url);
  const product = u.pathname.match(/-t(\d+)\/$/);
  const hotel = u.pathname.match(/\.h(\d+)\.Hotel-Information$/);
  if (product) return 'GetYourGuide:product:' + product[1];
  if (hotel) return 'Expedia:property:' + hotel[1];
  for (const key of ['partner_id','camref','cmp','creativeref','adref']) u.searchParams.delete(key);
  u.searchParams.sort();
  return u.href;
}
const seenReferrals = new Set();
const related = {
  'gyg-256607': { relatedPlaceIds: ['banff-gondola'], relatedActivityIds: ['gondola'] },
  'gyg-303253': { relatedPlaceIds: ['johnston-canyon-lower-falls'] },
  'gyg-437912': { relatedPlaceIds: ['lake-louise','johnston-canyon-lower-falls'] },
  'gyg-292675': { relatedPlaceIds: ['lake-louise'] },
};
const reviewedOfferAreas = {
  'gyg-256607': 'Banff', 'gyg-798459': 'Banff', 'gyg-841685': 'Canmore',
  'gyg-292675': 'Lake Louise', 'gyg-437787': 'Icefields Parkway & Abraham Lake',
  'gyg-432341': 'Banff area: confirm the climbing venue', 'gyg-303298': 'Grotto Canyon, Canmore area',
  'gyg-1164949': 'Yoho & Kootenay', 'gyg-303253': 'Johnston Canyon',
  'gyg-437912': 'Lake Louise & Johnston Canyon', 'gyg-916190': 'Banff National Park',
  'gyg-303208': 'Kootenay: departure from Banff', 'gyg-285990': 'Banff Springs Hotel',
  'gyg-698951': 'Banff town', 'gyg-1182128': 'Kananaskis',
};
for (const offer of source.activityTargets.activityBookingOffers) {
  const comparison = source.winter.winterActivityOffers.find(value => value.id === offer.id);
  invariant(comparison, 'Missing original editorial product comparison.');
  const target = source.activityTargets.activityCampaignTargets.find(value => value.primaryOfferId === offer.id);
  const url = source.winter.winterActivityBookingUrl(offer.productUrl);
  seenReferrals.add(identity(url));
  invariant(reviewedOfferAreas[offer.id], 'Review the actual outing area rather than inferring it from a marketplace category.');
  add({ id: offer.id, section: 'tours', title: comparison.name, summary: plain(comparison.fit || comparison.experience), area: reviewedOfferAreas[offer.id], category: comparison.format || 'Guided experience', operator: offer.provider, guideUrl: absolute(target?.guidePath || '/book/banff-winter-activities/'), reviewedAt: source.activityTargets.activityCampaignReviewedAt, status: offer.launchState === 'ready' ? 'ready' : 'check-details', notice: [offer.seasonalNotice, offer.holdReason].filter(Boolean).join(' '), ...related[offer.id], links: [merchantLink(offer.id + '-booking', url, offer.launchState === 'ready' ? 'Check dates on GetYourGuide' : 'Read listing details on GetYourGuide')] });
}
function additionalReferral(url, title, summary, guideUrl, section = 'tours') {
  const key = identity(url); if (seenReferrals.has(key)) return;
  const link = merchantLink('referral-' + hash(key).slice(0,12), url);
  seenReferrals.add(key);
  add({ id: 'referral-' + hash(key).slice(0,12), section, title: plain(title), summary: plain(summary), area: area(url + ' ' + title), category: link.kind === 'search' ? 'Marketplace search' : 'Provider listing', ...(guideUrl ? { guideUrl: absolute(guideUrl) } : {}), status: 'reference-only', notice: link.kind === 'search' ? 'Opens a marketplace search. Compare the actual destination, dates and selected product before booking.' : 'Opens the provider’s listing. Check its current identity, itinerary, dates, inclusions and booking terms.', links: [link] });
}
for (const tour of tourPage.featuredTours) additionalReferral(tour.gygUrl, tour.name, tour.description, '/tours/');
for (const category of tourPage.categories) additionalReferral(category.url, category.label + ' on GetYourGuide', 'Browse the published destination or category search and check the exact selected product.', '/tours/');
for (const activity of source.activity.activities) additionalReferral(source.activityPlanning.activitySearchUrl(activity.gygSearch), activity.name + ': marketplace search', activity.bookingNote, activity.link);
const catalogueText = await readFile(path.join(mobileRoot, 'src/data/catalog.generated.ts'), 'utf8');
const originalPlaceIds = new Set([...catalogueText.split('export const guides')[0].matchAll(/^    "id": "([^"]+)"/gm)].map(match => match[1]));
for (const hotel of source.hotels.directoryHotels) {
  seenReferrals.add(identity(hotel.expediaUrl));
  const reviewed = hotel.sourceStatus === 'reviewed';
  const guideUrl = absolute('/hotel-directory/' + hotel.slug + '/');
  add({ id: 'hotel-' + hotel.slug, section: 'stays', title: hotel.name, summary: plain(hotel.description), area: hotel.area, category: reviewed ? hotel.type : hotel.sourceStatusLabel, guideUrl, ...(hotel.checkedOn ? { reviewedAt: hotel.checkedOn } : {}), status: reviewed ? 'ready' : 'reference-only', notice: [hotel.sourceStatusLabel + '.', hotel.sourceScope, hotel.operationNote, hotel.facilityNote, disclosure].filter(Boolean).join(' '), ...(originalPlaceIds.has(hotel.slug) ? { relatedPlaceIds: [hotel.slug] } : {}), links: [merchantLink('expedia-' + hotel.slug, hotel.expediaUrl, reviewed ? 'Check this stay on Expedia' : 'Check the provider identity on Expedia'), ownLink('hotel-guide-' + hotel.slug, guideUrl)] });
}
for (const rental of source.rentals.rentals) {
  const url = source.rentals.vrboAffiliateUrl(rental.vrboUrl); seenReferrals.add(identity(url));
  add({ id: 'rental-' + rental.expediaId, section: 'stays', title: rental.name, summary: 'A preserved Vrbo listing lead from the website catalogue. Compare the exact unit, current address, manager, room layout and booking terms with the provider.', area: rental.area ? rental.area + ' (imported label)' : 'Area not verified', category: 'Historical vacation-rental lead', guideUrl: absolute('/vacation-rentals/'), status: 'reference-only', notice: source.rentals.rentalImportProvenance.note + ' No reliable capture date, current facilities, availability, prices or municipal licensing are established. ' + disclosure, links: [merchantLink('vrbo-' + rental.expediaId, url), ownLink('rental-planning-' + rental.expediaId, '/vacation-rentals/', 'Read the rental planning guide')] });
}
for (const post of source.posts.blogPosts) {
  const url = absolute('/blog/' + post.slug + '/');
  const reviewed = Object.hasOwn(source.bodies.reviewedBlogBodies, post.slug);
  const target = source.activityTargets.resolveActivityBookingTarget('/blog/' + post.slug + '/');
  const links = [ownLink('guide-' + post.slug, url)];
  if (target) links.push(merchantLink('guide-offer-' + post.slug, target.bookingUrl, target.launchState === 'ready' ? 'Check the related GetYourGuide listing' : 'Read related listing details'));
  add({ id: 'guide-' + post.slug, section: 'guides', title: plain(post.title), summary: reviewed ? plain(post.description) : 'A published BanffBound ' + post.category.toLowerCase() + ' article. Open the full website guide and check dated advice against current official or operator information.', area: area(post.title), category: post.category, guideUrl: url, ...(reviewed && post.lastUpdated ? { reviewedAt: post.lastUpdated } : {}), status: 'reference-only', notice: (reviewed ? 'Source-reviewed website article; the editorial date is not a live conditions or availability report.' : 'Legacy published article; this index does not verify every historical claim.') + ' Full article and website affiliate referrals require internet. ' + (target ? target.seasonalNotice : ''), links });
  // Preserve remaining published article referral destinations, with correct
  // search/property labels instead of inheriting an unrelated anchor claim.
  const body = source.bodies.resolveBlogContent(post.slug);
  for (const match of body.matchAll(/href=["']([^"']+)["']/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    let link; try { link = merchantLink('candidate', href); } catch { continue; }
    const u = new URL(href);
    const destination = u.searchParams.get('destination') || u.searchParams.get('q');
    const title = link.kind === 'search' ? (destination || 'Banff') + ': ' + link.provider + ' search' : 'Additional ' + link.provider + ' listing ' + (u.pathname.match(/-t(\d+)\/$/)?.[1] || 'reference');
    additionalReferral(href, title, 'A referral retained in this published website guide. Follow the provider listing for the actual destination and product.', url, link.provider === 'GetYourGuide' ? 'tours' : 'extras');
  }
}
// Activity guides include original planning text outside the blog index.
for (const activity of source.activity.activities) {
  const url = absolute(activity.link);
  add({ id: 'activity-guide-' + activity.slug, section: 'guides', title: activity.name + ': planning guide', summary: plain(activity.description), area: area(activity.name), category: 'Activity planning', guideUrl: url, reviewedAt: activity.reviewedAt, status: 'reference-only', notice: 'Opens the existing website activity guide. Seasons and editorial review dates do not establish current access or availability.', links: [ownLink('activity-guide-' + activity.slug, url)] });
}
// Index the complete published standalone visitor site as well as its blog.
// Read only literal layout attributes; no Astro frontmatter is executed here.
const canonicalGuideUrl = value => {
  const url = new URL(absolute(value));
  invariant(url.origin === 'https://banffbound.com' && !url.search, 'Unexpected owned guide URL.');
  return url.origin + url.pathname.replace(/\/+$/,'') + '/';
};
const guideByUrl = new Map(items.filter(item => item.section === 'guides').map(item => [canonicalGuideUrl(item.guideUrl), item.id]));
invariant(guideByUrl.size === items.filter(item => item.section === 'guides').length, 'Duplicate canonical guide URL in the article/activity index.');
const standaloneGuideCoverage = [];
const excludedStandalonePages = [];
const excludedRoutes = new Set(['','404','about','contact','editorial','privacy','terms','trip-reports','blog']);
const toolRoutes = new Set(['air-quality','alternatives','altitude-guide','bird-checklist','conditions','currency-converter','emergency-card','icefields-parkway-planner','monthly-weather','packing-list','park-pass','parking','photo-spots','quiet-trails','ski-day-planner','ski-pass-calculator','tools','trail-map','trip-builder','trip-cost','weather-webcams','weather','what-to-do-today','wildlife-calendar','wildlife-tracker']);
function quotedAttribute(tag, attribute) {
  const match = tag.match(new RegExp('\\b' + attribute + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')'));
  return match ? plain(match[1] ?? match[2]).replaceAll('&quot;','"').replaceAll('&#39;',"'") : undefined;
}
function addStandaloneGuide(item, sourceFile, kind) {
  const url = canonicalGuideUrl(item.guideUrl);
  const previousId = guideByUrl.get(url);
  standaloneGuideCoverage.push({ url, sourceFile, kind, itemId: previousId || item.id, added: !previousId });
  if (previousId) return;
  guideByUrl.set(url,item.id);
  add({ ...item, guideUrl: url, links: [ownLink(item.id + '-open',url)] });
}
async function standalonePages(directory = 'src/pages') {
  for (const entry of (await readdir(path.join(sourceRoot,directory),{ withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const relative = directory + '/' + entry.name;
    if (entry.isDirectory()) { await standalonePages(relative); continue; }
    if (!entry.name.endsWith('.astro')) continue;
    const route = relative.replace(/^src\/pages\//,'').replace(/\.astro$/,'').replace(/(?:^|\/)index$/,'').replace(/\/$/,'');
    if (relative.includes('[') || route.startsWith('blog/')) continue;
    await verifyInput(relative);
    const text = await readFile(path.join(sourceRoot,relative),'utf8');
    const reason = excludedRoutes.has(route) ? 'Publisher/legal/home/submission page, not visitor guidance'
      : /^(?:search|widgets?|private|api|robots|sitemap)(?:\/|$)/.test(route) || route === 'book/banff-winter-activities/google-test' ? 'Private, test, search or widget route'
      : /Astro\.redirect\(/.test(text) ? 'Redirect, not a canonical page' : null;
    if (reason) { excludedStandalonePages.push({ sourceFile: relative, reason }); continue; }
    const tag = text.match(/<(?:BaseLayout|PaidLandingLayout)\b([\s\S]*?)>/)?.[1];
    invariant(tag, 'Review a standalone page without a recognised visitor layout: ' + relative);
    const title = quotedAttribute(tag,'title');
    invariant(title, 'Review a standalone page whose title is not a literal attribute: ' + relative);
    const description = quotedAttribute(tag,'description');
    const reviewedAt = quotedAttribute(tag,'lastUpdated');
    const url = absolute('/' + route + '/');
    addStandaloneGuide({ id: 'web-guide-' + route.replaceAll('/','-'), section: 'guides', title, summary: description || 'Open the BanffBound guide for ' + title + ' and explore the full planning information online.', area: area(title), category: toolRoutes.has(route) ? 'Planning tools' : /^(?:towns|hotel-directory|accommodation|hotels|winter-stays|vacation-rentals|book\/.*stays|book\/banff-hotels)$/.test(route) ? 'Places to stay & bases' : 'Visitor guides', guideUrl: url, ...(reviewedAt && /^\d{4}-\d{2}-\d{2}$/.test(reviewedAt) ? { reviewedAt } : {}), status: 'reference-only', notice: 'Opens the full guide or tool in your browser. Check current access, conditions and operator details. Online maps, reports and website tools need a connection.' },relative,'page');
  }
}
await standalonePages();
await verifyInput('src/pages/towns/[slug].astro');
await verifyInput('src/pages/trails/[slug].astro');
for (const town of source.towns.towns) addStandaloneGuide({ id: 'town-guide-' + town.slug, section: 'guides', title: town.name + ': travel and base guide', summary: plain(town.description), area: town.name, category: 'Town & base guides', guideUrl: '/towns/' + town.slug + '/', status: 'reference-only', notice: 'Explore the full town guide online. Compare the actual overnight base, daily journeys and return transport before making plans.' },'src/pages/towns/[slug].astro','town');
for (const trail of source.trails.trails) addStandaloneGuide({ id: 'trail-guide-' + trail.slug, section: 'guides', title: trail.name + ': route and access guide', summary: 'Plan ' + trail.name + ' in the ' + trail.area + ' area. Compare route information and seasonal context, then check current access and official reports.', area: trail.area, category: trail.type === 'lake' ? 'Lake guides' : trail.type === 'viewpoint' ? 'Viewpoint guides' : 'Trail guides', guideUrl: '/trails/' + trail.slug + '/', ...(trail.routeVerified !== false && trail.reviewedAt ? { reviewedAt: trail.reviewedAt } : {}), status: 'reference-only', notice: trail.routeVerified === false ? 'A retained route reference. Confirm the current route identity, access and directions with official sources before making plans. Historical route descriptions require checking.' : 'Open the full route guide online and check current official access, closures, weather and trail conditions. A listed route or editorial date does not establish that an outing is suitable today.' },'src/pages/trails/[slug].astro','trail');
// Preserve other fixed referrals authored on published page routes, including
// destination searches outside the principal directory modules. Never evaluate
// reader-derived expressions or transfer unrelated unused legacy article blobs.
async function pageReferrals(directory = 'src/pages') {
  for (const entry of (await readdir(path.join(sourceRoot,directory), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const relative = directory + '/' + entry.name;
    if (entry.isDirectory()) { await pageReferrals(relative); continue; }
    if (!entry.name.endsWith('.astro')) continue;
    const text = await readFile(path.join(sourceRoot,relative),'utf8');
    if (!/getyourguide\.com|expedia\.(?:ca|com)/.test(text)) continue;
    await verifyInput(relative);
    const fixed = text.replaceAll('${GYG_PARTNER_ID}','QW960HO').replaceAll('${GYG}','QW960HO');
    for (const match of fixed.matchAll(/https?:\/\/[^\s"'`<>\\]+/g)) {
      const href = match[0].replaceAll('&amp;','&');
      if (href.includes('${') || href.includes('}')) continue;
      let link; try { link = merchantLink('candidate',href); } catch { continue; }
      if (link.provider === 'Vrbo') continue;
      const url = new URL(href);
      const destination = url.searchParams.get('destination') || url.searchParams.get('q');
      const title = link.kind === 'search' ? (destination || 'Banff') + ': ' + link.provider + ' search' : 'Published ' + link.provider + ' referral';
      // A dynamic page source such as [slug] has no single public guide URL.
      const route = relative.replace(/^src\/pages\//,'').replace(/\.astro$/,'').replace(/(?:^|\/)index$/,'').replace(/\/$/,'');
      const guide = relative.includes('[') ? undefined : route ? '/' + route + '/' : '/';
      additionalReferral(href,title,'An existing fixed referral from a published BanffBound planning page. Check the exact destination and provider details.',guide,link.provider === 'GetYourGuide' ? 'tours' : 'extras');
    }
  }
}
await pageReferrals();
add({ id: 'car-rental-comparison', section: 'extras', title: 'Compare a rental car', summary: 'Use the existing Expedia car-rental referral. Check the exact collection location, total quote, actual tires, equipment, cancellation rules and the journeys you need.', area: 'Calgary & the Rockies', category: 'Transport', guideUrl: absolute('/calgary-to-banff/'), status: 'check-details', notice: disclosure, links: [merchantLink('expedia-car-rental', carUrl, 'Compare car rentals on Expedia'), ownLink('arrival-guide', '/calgary-to-banff/', 'Plan the full arrival journey')] });
for (const group of packing.groups) for (const item of group.items.filter(value => value.amazon)) add({ id: 'gear-' + item.id, section: 'extras', title: item.name, summary: item.note || 'An item from the existing website packing checklist. Compare what you already own, rent or actually need for your chosen outing.', area: 'Trip preparation', category: 'Packing: ' + group.name, guideUrl: absolute('/packing-list/'), status: 'reference-only', notice: 'Opens BanffBound’s packing guide, with affiliate product links and advice on what to bring. Check what you already own before buying.', links: [ownLink('packing-' + item.id, '/packing-list/', 'Compare gear in the website packing guide')] });

const sections = [
  { id: 'tours', title: 'Tours & experiences', summary: 'Find an outing for your kind of Banff day. Compare tours, tickets and guided adventures, then choose your dates with the provider.' },
  { id: 'stays', title: 'Hotels & vacation rentals', summary: 'Find a base that fits your trip. Explore hotels and holiday rentals around Banff, Lake Louise and Canmore.' },
  { id: 'guides', title: 'All website guides', summary: 'A little local knowledge goes a long way. Browse BanffBound travel guides, then open the full story online.' },
  { id: 'extras', title: 'Travel extras & packing', summary: 'Sort the practical details. Compare car hire, transport and packing ideas for your time in the Rockies.' },
];
const bySection = Object.fromEntries(sections.map(section => [section.id, items.filter(item => item.section === section.id).length]));
const standaloneCounts = {
  standaloneGuideEntriesAdded: standaloneGuideCoverage.filter(value => value.added).length,
  standaloneCanonicalRoutesCovered: standaloneGuideCoverage.length,
  standaloneVisitorPageRoutes: standaloneGuideCoverage.filter(value => value.kind === 'page').length,
  townGuideRoutes: standaloneGuideCoverage.filter(value => value.kind === 'town').length,
  trailLakeViewpointGuideRoutes: standaloneGuideCoverage.filter(value => value.kind === 'trail').length,
  canonicalRoutesAlreadyInActivityIndex: standaloneGuideCoverage.filter(value => !value.added).length,
};
invariant(standaloneCounts.standaloneVisitorPageRoutes === 71 && standaloneCounts.townGuideRoutes === 6 && standaloneCounts.trailLakeViewpointGuideRoutes === 81 && standaloneCounts.standaloneGuideEntriesAdded === 153, 'Published standalone guide coverage changed; review the route inventory explicitly.');
invariant(guideByUrl.size === items.filter(item => item.section === 'guides').length, 'Duplicate canonical guide destination.');
invariant(items.filter(item => item.id.startsWith('hotel-')).length === 95 && items.filter(item => item.id.startsWith('rental-')).length === 50 && items.filter(item => item.id.startsWith('guide-')).length === 295 && items.filter(item => /^gyg-\d+$/.test(item.id)).length === 15, 'Reviewed catalogue coverage changed; review the pin and expected counts explicitly.');
invariant(items.every(item => item.links.length && item.links.every(link => link.provider !== 'Amazon' && link.provider !== 'DiscoverCars')), 'Unapproved direct provider link generated.');
const provenance = { schemaVersion: 1, repository: pin.repository, sourceCommit: pin.commit, reviewedAt: pin.reviewedAt, pinSha256: hash(pinBytes), sourceInputs: [...inputs].sort(([a],[b]) => a.localeCompare(b)).map(([file,sha256]) => ({ file, sha256 })), counts: { total: items.length, bySection, reviewedGygOffers: 15, heldGygOffers: 4, hotelRecords: 95, reviewedHotelRecords: source.hotels.directoryHotels.filter(value => value.sourceStatus === 'reviewed').length, historicalRentalLeads: 50, activeBlogGuides: 295, activeActivityGuides: source.activity.activities.length, ...standaloneCounts, gearWebsiteRoutes: 35 }, standaloneGuideCoverage, excludedStandalonePages, standaloneMetadataExtraction: 'Literal quoted layout title/description attributes only; no Astro frontmatter execution. Dynamic town/trail identities come from separately hash-verified published data modules.', affiliateDisclosure: disclosure, gygAppCampaign: 'banffboundapp', sourceUrlTransforms: [...sourceUrlTransforms].sort(([a],[b]) => a.localeCompare(b)).map(([originalUrl,appUrl]) => ({ originalUrl, appUrl, change: 'Set the same static cmp=banffboundapp for every app visitor; preserve publisher and product identity and other source parameters.' })), noLivePricesOrAvailability: true, noProviderImagesOrWidgets: true, noAutomaticProviderRequests: true, amazonDirectLinksEnabled: false, userOrDeviceTrackingParametersAdded: false, originalOfflineCatalogueChanged: false, originalOfflineCataloguePin: pin.originalOfflineCataloguePin, providerDecisions: pin.providerDecisions, termsSources: pin.termsSources };
const version = pin.reviewedAt + '-' + hash(JSON.stringify({ items, provenance })).slice(0,12);
const generated = `/* Generated by scripts/sync-commerce.mjs from separately pinned published website data. */\nimport type { CommerceItem, CommerceSectionDescriptor } from './commerce';\n\nexport const commerceItems: CommerceItem[] = ${JSON.stringify(items,null,2)};\n\nexport const commerceSections: CommerceSectionDescriptor[] = ${JSON.stringify(sections,null,2)};\n\nexport const commerceDataVersion = ${JSON.stringify(version)};\nexport const commerceProvenance = ${JSON.stringify(provenance,null,2)};\n`;
const inventory = JSON.stringify({ schemaVersion: 1, sourceCommit: pin.commit, dataVersion: version, ...provenance.counts, standaloneGuideCoverage, excludedStandalonePages, originalCuratedCatalogueUnchanged: true, providers: [...new Set(items.flatMap(item => item.links.map(link => link.provider)))].sort(), heldGygOfferIds: source.activityTargets.activityBookingOffers.filter(value => value.launchState === 'held').map(value => value.id), nativeAmazonApprovalEstablished: false, noDirectAmazonLinks: true, outputsContainNoPricesOrCoordinates: true },null,2) + '\n';
for (const [relative, bytes] of [['src/data/commerce.generated.ts',generated],['release/commerce-catalogue-inventory.json',inventory]]) {
  const filename = path.join(mobileRoot,relative);
  if (check) invariant(await readFile(filename,'utf8') === bytes, 'Generated commerce output differs: ' + relative);
  else await writeFile(filename,bytes);
}
console.log(JSON.stringify({ check, sourceCommit: pin.commit, dataVersion: version, sourceInputs: inputs.size, ...provenance.counts }));
