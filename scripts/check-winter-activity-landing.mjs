import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parse } from 'parse5';
import { consentHarness, validConsent } from './lib/consent-harness.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ORIGIN = 'https://banffbound.com';
const PAGE = 'src/pages/book/banff-winter-activities.astro';
const CAROUSEL = 'src/components/ActivityCarousel.astro';
const read = name => readFile(path.join(ROOT, name), 'utf8');
globalThis.fetch = () => { throw Error('Winter landing checks are offline'); };
async function moduleData(contents) {
  const result = await build({ stdin:{contents, resolveDir:ROOT}, bundle:true, write:false, platform:'node', format:'esm', logLevel:'silent' });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const d = await moduleData("export * from './src/data/winterActivityLanding.ts'; export * from './src/data/winterActivityCatalogue.ts'; export {allBlogPosts} from './src/data/blogPosts.ts'; export {blogRedirects} from './src/data/redirects.mjs'; export {resolveBlogContent} from './src/data/blogContentRegistry.ts'; export {activities} from './src/data/activities.ts';");
const offers = d.winterActivityOffers, faqs = d.winterActivityFaqs, catalogue = d.winterActivityCatalogue;
const photoCredits = JSON.parse(await read('src/data/winterActivityPhotoCredits.json'));
assert.equal(photoCredits.length,20);assert.equal(new Set(photoCredits.map(photo=>photo.src)).size,20);
for(const photo of photoCredits){assert.ok(photo.title&&photo.author&&photo.license&&photo.changeNote&&photo.usageNote&&photo.dateTaken);assert.equal(new URL(photo.sourceUrl).hostname,'commons.wikimedia.org');assert.equal(new URL(photo.licenseUrl).hostname,'creativecommons.org');assert.ok(Number(photo.width)>0&&Number(photo.height)>0);}
const creditedPhotoPaths=new Set(photoCredits.map(photo=>photo.src));

// Reviewed legacy merchant identities stay exactly three. The other seventeen
// editorial choices must never acquire invented product links.
const merchants = [
  ['gyg-303253','303253','Discover Banff Tours','johnston-icewalk','https://www.getyourguide.com/banff-l284/banff-morning-or-afternoon-johnston-canyon-icewalk-t303253/'],
  ['gyg-256607','256607','Pursuit Collection','banff-gondola','https://www.getyourguide.com/banff-l284/banff-banff-gondola-admission-ticket-t256607/'],
  ['gyg-437912','437912','Radventures','winter-wonderland','https://www.getyourguide.com/banff-l284/from-banff-winter-wonderland-lake-louise-johnston-canyon-t437912/'],
];
assert.equal(d.winterActivityLandingId, 'banff-winter-activities');
assert.equal(d.winterActivityReviewedAt, '2026-10-29');
assert.equal(d.winterActivityCatalogueReviewedAt, '2026-10-30');
assert.deepEqual(offers.map(o => [o.id,o.productId,o.provider,o.anchor,o.productUrl]), merchants);
assert.equal(new Set(offers.map(o => o.format)).size, 3);
for (const offer of offers) {
  const url = new URL(offer.bookingUrl);
  assert.equal(url.origin, 'https://www.getyourguide.com');
  assert.equal(url.origin + url.pathname, offer.productUrl.replace(/\/$/, '') + '/');
  assert.deepEqual([...url.searchParams], [['partner_id','QW960HO'],['cmp','banffboundwinteractivities']]);
  assert.equal(url.hash, '');
  for (const key of ['fit','experience','tradeoff','transport','group','bookingCheck']) assert.ok(offer[key].length > 80, offer.id + ': useful ' + key);
  assert.ok(!Object.keys(offer).some(key => /price|rating|duration|availability|discount|reviewCount/.test(key)));
}
for (const input of ['https://example.com/product-t303253/','https://www.getyourguide.com/banff-l284/','https://www.getyourguide.com/banff-l284/example-t303253/?partner_id=other','https://www.getyourguide.com/banff-l284/example-t303253/#x']) assert.throws(() => d.winterActivityBookingUrl(input));
assert.equal(offers.find(o => o.productId === '256607').needsCanyonCheck, false);
assert.deepEqual(offers.filter(o => o.needsCanyonCheck).map(o => o.productId), ['303253','437912']);

// Literal identities and guide handoffs, independently pinned rather than
// calculating the expected result from the same filter being tested.
const expected = [
  ['banff-gondola','sightseeing','/blog/banff-gondola-guide/','gyg-256607'],
  ['guided-johnston-icewalk','sightseeing','/blog/banff-ice-walk-guide/','gyg-303253'],
  ['guided-louise-canyon-day','sightseeing','/blog/7-day-banff-itinerary/#week-booking','gyg-437912'],
  ['first-ski-lesson','snow-sports','/learn-to-ski/#lesson-fit',null],
  ['resort-ski-day','snow-sports','/ski-day-planner/',null],
  ['snowshoe-outing','winter-outdoors','/blog/banff-snowshoeing-guide/',null],
  ['norquay-tubing','snow-sports','/blog/banff-tubing-guide/',null],
  ['managed-ice-skating','snow-sports','/activities/ice-skating/',null],
  ['cross-country-skiing','snow-sports','/blog/banff-cross-country-skiing/',null],
  ['dog-sledding','winter-outdoors','/activities/dog-sledding/',null],
  ['winter-fat-biking','snow-sports','/blog/banff-fat-biking/',null],
  ['cave-and-basin','town-culture','/blog/cave-and-basin-guide/',null],
  ['hot-springs-soak','town-culture','/blog/banff-hot-springs-guide/',null],
  ['whyte-museum','town-culture','/blog/rainy-day-banff/#weather-whyte',null],
  ['winter-photography','winter-outdoors','/photo-spots/',null],
  ['wildlife-area-visit','winter-outdoors','/wildlife-tracker/',null],
  ['live-performance','town-culture','/blog/banff-live-music/#find-a-show',null],
  ['bowling-evening','town-culture','/blog/banff-nightlife-guide/#evening-planner',null],
  ['winter-night-sky','winter-outdoors','/activities/northern-lights/',null],
  ['mountain-scenic-flight','specialist','/blog/banff-helicopter-tours/',null],
];
const ids = expected.map(row => row[0]);
const categories = ['all','sightseeing','snow-sports','winter-outdoors','town-culture','specialist'];
assert.deepEqual(catalogue.map(a => [a.id,a.category,a.internalHref,a.bookingOfferId]), expected);
assert.deepEqual(catalogue.map(a => a.rank), Array.from({length:20}, (_,i) => i + 1));
assert.deepEqual(d.winterActivityCategories.map(c => c.value), categories);
assert.equal(new Set(ids).size, 20);
assert.equal(catalogue.filter(a => a.bookingOfferId === null).length, 17);
assert.deepEqual(catalogue.filter(a => a.bookingOfferId).map(a => a.bookingOfferId).sort(), merchants.map(m => m[0]).sort());
assert.match(d.winterActivityCatalogueOrdering, /editorial/i);
assert.match(d.winterActivityCatalogueOrdering, /not a popularity/);
assert.match(d.winterActivityCatalogueScope, /not a list of experiences operating today/i);
const wantedIds = category => expected.filter(row => category === 'all' || row[1] === category).map(row => row[0]);
const invalid = ['wrong','SIGHTSEEING','<script>',null,{},['sightseeing'],'constructor','__proto__',0,true];
for (const category of categories) assert.deepEqual(d.buildWinterActivityCatalogueSelection(category), {category,activityIds:wantedIds(category)});
for (const value of invalid) {
  assert.equal(d.normaliseWinterActivityCategory(value), 'all');
  assert.deepEqual(d.buildWinterActivityCatalogueSelection(value), {category:'all',activityIds:ids});
}
for (const activity of catalogue) {
  assert.ok(activity.name && activity.description.length > 40 && activity.fit.length > 30 && activity.practicalNote.length > 70);
  const target = new URL(activity.internalHref, ORIGIN);
  assert.equal(target.origin, ORIGIN); assert.equal(target.search, '');
  assert.ok(activity.internalHref.startsWith('/') && !activity.internalHref.startsWith('//'));
  if (target.pathname.startsWith('/blog/')) {
    const slug = target.pathname.split('/')[2];
    assert.ok(d.allBlogPosts.some(post => post.slug === slug), 'Existing guide: ' + activity.internalHref);
    assert.ok(!Object.hasOwn(d.blogRedirects, slug), 'Canonical guide: ' + activity.internalHref);
    if (target.hash) assert.ok(d.resolveBlogContent(slug).includes('id="' + target.hash.slice(1) + '"'), 'Existing article fragment: ' + activity.internalHref);
  } else if (target.pathname.startsWith('/activities/')) {
    const slug=target.pathname.split('/')[2];assert.ok(d.activities.some(item=>item.slug===slug&&!item.isExternal),'Existing generated activity guide: '+activity.internalHref);assert.equal(target.hash,'');
  } else {
    await access(path.join(ROOT, 'src/pages', target.pathname.slice(1).replace(/\/$/, '') + '.astro'));
    if (target.hash) assert.ok((await read('src/pages/' + target.pathname.slice(1).replace(/\/$/, '') + '.astro')).includes('id="' + target.hash.slice(1) + '"'), 'Existing planner fragment: ' + activity.internalHref);
  }
  assert.ok(Array.isArray(activity.gallery) && activity.gallery.length >= 2, 'Real gallery, no placeholder fallback: ' + activity.id);
  assert.equal(new Set(activity.gallery.map(image => image.src)).size, activity.gallery.length, 'Distinct gallery images: ' + activity.id);
  for (const image of activity.gallery) {
    const url = new URL(image.src, ORIGIN);
    assert.ok(creditedPhotoPaths.has(image.src),'Every gallery photograph has an exact source/licence record: '+activity.id);
    assert.equal(url.username + url.password + url.search + url.hash, '');
    assert.ok(image.alt.length > 10 && image.caption.length > 15, 'Named subject and caption: ' + activity.id);
    if (url.origin === ORIGIN) {
      assert.ok(image.src.startsWith('/images/'), 'Local photo asset path: ' + activity.id);
      const file = path.resolve(ROOT, 'public', '.' + url.pathname);
      assert.ok(file.startsWith(path.join(ROOT, 'public') + path.sep)); await access(file);
    } else assert.equal(url.protocol, 'https:');
  }
  assert.ok(d.winterActivityCatalogueSources[activity.id]?.length, 'Primary source mapping: ' + activity.id);
}
assert.equal(new Set(catalogue.flatMap(activity=>activity.gallery.map(image=>image.src))).size,20,'Twenty credited real photographs cover the gallery associations');
assert.equal(faqs.length, 4);
for (const faq of faqs) assert.ok(faq.question && faq.answer.length > 80);
for (const message of d.winterActivityMessageMap) {
  assert.ok(message.queryIntent && message.promise);
  assert.ok(message.target === '#experiences' || offers.some(o => '#' + o.anchor === message.target));
  assert.ok(!/GetYourGuide tickets|GYG tickets/i.test(message.queryIntent));
}
const sourceNote = await read('research/winter-activity-landing-sources-2026-10-29.md');
for (const offer of offers) assert.ok(sourceNote.includes(offer.productUrl) && sourceNote.includes(offer.operatorUrl));
for (const clause of ['3.1.8','3.1.10','5.3']) assert.ok(sourceNote.includes(clause));

const page = await read(PAGE), carousel = await read(CAROUSEL);
for (const [filename,source] of [[PAGE,page],[CAROUSEL,carousel]]) {
  const compiled = await transform(source, {filename});
  assert.deepEqual(compiled.diagnostics.filter(diag => diag.severity === 1), []);
}
assert.match(page, /winterActivityCatalogue\.map/);
assert.match(page, /winterActivityOffers\.map/);
assert.match(page, /ActivityCarousel/);
assert.match(carousel, /overflow-x:\s*auto/);
assert.match(carousel, /scroll-snap-type:\s*x mandatory/);
assert.match(carousel, /prefers-reduced-motion/);
assert.ok(!/setInterval|autoplay|setTimeout|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|window\.open|location\.|history\.|\.href\s*=/.test(carousel), 'A manual gallery does not track, autoplay, transact or navigate');
const client = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const galleryClient = carousel.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(client && galleryClient);
assert.ok(!/\.booking-cta|a\[href|closest\([^)]*['"]a|window\.open|location\.(assign|replace)\(|\.href\s*=/.test(client), 'The category selector never intercepts or changes merchant links');

async function renderActualPage() {
  const require = createRequire(import.meta.url);
  const result = await build({stdin:{contents:"export {default} from './" + PAGE + "';",resolveDir:ROOT},absWorkingDir:ROOT,bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'actual-winter-astro',setup(b){
    b.onResolve({filter:/^astro\//},a=>({path:pathToFileURL(require.resolve(a.path)).href,external:true}));
    b.onResolve({filter:/(?:\?astro&type=style|\.css$)/},a=>({path:a.path,namespace:'winter-style'}));
    b.onLoad({filter:/.*/,namespace:'winter-style'},()=>({contents:'export {};'}));
    b.onResolve({filter:/\.astro$/},a=>({path:path.resolve(a.resolveDir,a.path),namespace:'winter-astro'}));
    b.onLoad({filter:/.*/,namespace:'winter-astro'},async a=>{
      const compiled=await transform(await readFile(a.path,'utf8'),{filename:a.path,internalURL:'astro/compiler-runtime',resultScopedSlot:true});
      assert.deepEqual(compiled.diagnostics.filter(diag=>diag.severity===1),[],a.path);
      return {contents:compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m,''),loader:'ts',resolveDir:path.dirname(a.path)};
    });
  }}]});
  const Page=(await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))).default;
  const container=await experimental_AstroContainer.create();
  return container.renderToString(Page,{request:new Request(ORIGIN+'/book/banff-winter-activities/?email=PRIVATE_WINTER_READER&gclid=PRIVATE_WINTER_CLICK')});
}
function walk(node) { return [node,...(node.childNodes ?? []).flatMap(walk),...(node.content ? walk(node.content) : [])]; }
const attr = (node,name) => node?.attrs?.find(item=>item.name===name)?.value;
const has = (node,name) => attr(node,name)!==undefined;
const klass = (node,name) => (attr(node,'class')??'').split(/\s+/).includes(name);
function text(node) { return node?.nodeName==='#text' ? node.value : (node?.childNodes??[]).map(text).join(''); }
const normal = value => String(value).replace(/\s+/g,' ').trim();
const txt = node => normal(text(node));
function ctaLabel(node) { if(attr(node,'aria-hidden')==='true')return '';return node?.nodeName==='#text'?node.value:(node?.childNodes??[]).map(ctaLabel).join(''); }
const label = node => normal(ctaLabel(node));
const anchorFor = activity => offers.find(o=>o.id===activity.bookingOfferId)?.anchor ?? activity.id;
function inspect(markup, scriptingEnabled=true) {
  const nodes=walk(parse(markup,{scriptingEnabled,sourceCodeLocationInfo:true}));
  const byId=id=>{const hits=nodes.filter(n=>attr(n,'id')===id);assert.equal(hits.length,1,'Unique #'+id);return hits[0];};
  const links=nodes.filter(n=>n.tagName==='a');
  assert.equal(nodes.filter(n=>n.tagName==='h1').length,1);
  assert.equal(txt(nodes.find(n=>n.tagName==='h1')),'Top 20 winter activities in Banff');
  assert.equal(attr(nodes.find(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'),'href'),ORIGIN+'/book/banff-winter-activities/');
  assert.equal(nodes.filter(n=>n.tagName==='body'&&attr(n,'data-paid-landing')==='true').length,1);
  assert.equal(nodes.filter(n=>attr(n,'data-landing-page')==='banff-winter-activities').length,1);
  assert.equal(nodes.filter(n=>n.tagName==='header').length,1);
  assert.ok(nodes.some(n=>n.tagName==='header'&&klass(n,'booking-header')));
  assert.ok(nodes.some(n=>n.tagName==='footer'&&klass(n,'booking-footer')));
  assert.ok(!markup.includes('PRIVATE_WINTER_READER')&&!markup.includes('PRIVATE_WINTER_CLICK'));
  assert.ok(!nodes.some(n=>['script','iframe'].includes(n.tagName)&&/^https?:/.test(attr(n,'src')??'')), 'No active optional provider at SSR');
  for(const id of ['cookie-banner','cookie-accept','cookie-reject','cookie-manage','cookie-preferences','cookie-save']) byId(id);
  for(const id of ['pref-analytics','pref-advertising','pref-affiliate']) assert.equal(has(byId(id),'checked'),false);
  const allIds=nodes.filter(n=>has(n,'id')).map(n=>attr(n,'id'));assert.equal(new Set(allIds).size,allIds.length,'No duplicate page/gallery/control IDs');
  assert.ok(txt(byId('experiences')).includes('Our editorial picks, ordered for a first winter visit.'));
  assert.equal(has(byId('winter-experience-form'),'hidden'),true);
  assert.equal(attr(byId('winter-experience-count'),'role'),'status');assert.equal(attr(byId('winter-experience-count'),'aria-live'),'polite');assert.equal(attr(byId('winter-experience-count'),'aria-atomic'),'true');
  assert.equal(txt(byId('winter-experience-count')),'20 activities to explore');
  assert.deepEqual(walk(byId('winter-experience')).filter(n=>n.tagName==='option').map(n=>[attr(n,'value'),txt(n)]),d.winterActivityCategories.map(c=>[c.value,c.label]));
  const cards=nodes.filter(n=>has(n,'data-winter-activity'));
  assert.deepEqual(cards.map(n=>attr(n,'data-winter-activity')),ids,'All twenty editorial choices in literal reviewed order');
  assert.deepEqual(cards.map(n=>Number(attr(n,'value'))),Array.from({length:20},(_,i)=>i+1),'Ranks 1-20');
  assert.equal(nodes.filter(n=>has(n,'data-activity-gallery')).length,20);
  for(const [index,card] of cards.entries()) {
    const activity=catalogue[index], descendants=walk(card), article=byId(anchorFor(activity));
    assert.equal(has(card,'hidden'),false);assert.equal(attr(card,'data-experience-category'),activity.category);
    assert.ok(descendants.includes(article));assert.equal(attr(article,'aria-labelledby'),'activity-title-'+activity.id);
    assert.equal(txt(byId('activity-title-'+activity.id)),activity.name);
    assert.equal(txt(byId('activity-note-'+activity.id)),activity.practicalNote);
    const badge=descendants.find(n=>klass(n,'rank-badge'));assert.ok(badge);assert.equal(txt(badge),String(index+1).padStart(2,'0'));assert.equal(attr(badge,'aria-label'),'Number '+(index+1));
    const more=descendants.filter(n=>n.tagName==='a'&&klass(n,'more-cta'));
    assert.equal(more.length,1);assert.equal(txt(more[0]),'Find out more');assert.equal(attr(more[0],'href'),activity.internalHref);assert.equal(attr(more[0],'aria-label'),'Find out more about '+activity.name);
    const books=descendants.filter(n=>n.tagName==='a'&&has(n,'data-offer-id'));
    assert.equal(books.length,activity.bookingOfferId ? 1 : 0,'Only three reviewed products have native booking links');
    if(activity.bookingOfferId) {
      const offer=offers.find(o=>o.id===activity.bookingOfferId);
      assert.equal(attr(books[0],'href'),offer.bookingUrl);assert.equal(attr(books[0],'data-offer-id'),offer.id);assert.equal(attr(books[0],'data-landing-placement'),'detail-card');
      assert.ok(txt(article).includes(offer.provider),'Actual provider identity remains visible in booking details');assert.ok(descendants.some(n=>n.tagName==='a'&&attr(n,'href')===offer.operatorUrl),'Actual operator source remains native');
      assert.equal(txt(books[0]),'Book now');assert.equal(attr(books[0],'aria-label'),'Book now: '+activity.name);assert.equal(attr(books[0],'aria-describedby'),'activity-note-'+activity.id);
      if(offer.needsCanyonCheck) {
        const notice=descendants.find(n=>klass(n,'card-access'));assert.ok(notice,'Affected card has closure notice');assert.ok(walk(notice).some(n=>n.tagName==='a'&&attr(n,'href')===d.winterActivityClosureSource),'Closure links to the actual current notice');
        for(const marker of ['trail and day-use area closed from October 13','scheduled December 11, 2026','Reopening is not confirmed','confirm the route for your date before booking']) assert.ok(txt(notice).includes(marker),'Material access before booking: '+marker);
        assert.ok(notice.sourceCodeLocation.endOffset<=books[0].sourceCodeLocation.startOffset,'Closure notice must precede its product CTA');
      }
    }
    const gallery=descendants.find(n=>has(n,'data-activity-gallery'));assert.ok(gallery);assert.equal(attr(gallery,'role'),'group');assert.equal(attr(gallery,'aria-roledescription'),'carousel');assert.equal(attr(gallery,'aria-label'),activity.name+' photos');
    const track=byId('activity-gallery-'+activity.id);assert.equal(attr(track,'tabindex'),'0');assert.ok(attr(track,'aria-label').includes('left and right arrow keys'));
    const figures=walk(track).filter(n=>n.tagName==='figure');assert.equal(figures.length,activity.gallery.length);
    for(const [i,figure] of figures.entries()) {
      const image=walk(figure).find(n=>n.tagName==='img'),caption=walk(figure).find(n=>n.tagName==='figcaption');
      assert.equal(attr(image,'src'),activity.gallery[i].src,'Image belongs to the named reviewed gallery');assert.equal(attr(image,'alt'),activity.gallery[i].alt);assert.equal(txt(caption),activity.gallery[i].caption);
      assert.equal(attr(image,'loading'),'lazy');assert.ok(Number(attr(image,'width'))>0&&Number(attr(image,'height'))>0,'Reserve gallery image dimensions');assert.equal(attr(figure,'aria-label'),(i+1)+' of '+activity.gallery.length);
    }
    const controls=walk(gallery).find(n=>has(n,'data-gallery-controls'));assert.ok(controls&&has(controls,'hidden'));
    const previous=walk(controls).find(n=>has(n,'data-gallery-previous')),next=walk(controls).find(n=>has(n,'data-gallery-next'));
    for(const button of [previous,next]){assert.equal(button.tagName,'button');assert.equal(attr(button,'type'),'button');assert.equal(attr(button,'aria-controls'),'activity-gallery-'+activity.id);}
    assert.equal(has(previous,'disabled'),true);assert.equal(has(next,'disabled'),false);
  }
  const sponsored=links.filter(n=>has(n,'data-offer-id'));assert.equal(sponsored.length,6,'Exactly six reviewed product CTA placements');
  assert.deepEqual(sponsored.map(n=>[attr(n,'data-offer-id'),attr(n,'href')]).sort(),offers.flatMap(o=>[[o.id,o.bookingUrl],[o.id,o.bookingUrl]]).sort());
  for(const link of sponsored) {assert.equal(txt(link),'Book now');assert.equal(attr(link,'target'),'_blank');assert.ok(attr(link,'rel').split(/\s+/).includes('sponsored'));assert.ok(attr(link,'rel').split(/\s+/).includes('noopener'));assert.equal(attr(link,'data-landing-id'),'banff-winter-activities');}
  assert.equal(links.filter(n=>label(n)==='Find out more').length,21);
  assert.equal(links.filter(n=>label(n)==='Book now').length,6);
  const hero=links.filter(n=>attr(n,'href')==='#experiences');assert.equal(hero.length,1);assert.equal(label(hero[0]),'Find out more');
  for(const offer of offers)assert.equal(sponsored.filter(n=>attr(n,'data-offer-id')===offer.id&&attr(n,'data-landing-placement')==='final-shortlist').length,1);
  const credits=byId('photo-credits');assert.ok(txt(credits).includes('historical photographs')&&txt(credits).includes('cropped to fit the layout'));
  const creditRows=walk(credits).filter(n=>n.tagName==='li');assert.equal(creditRows.length,20);
  for(const photo of photoCredits){const row=creditRows.find(n=>walk(n).some(c=>c.tagName==='a'&&attr(c,'href')===photo.sourceUrl));assert.ok(row,'Visible image source credit: '+photo.src);assert.ok(txt(row).includes(normal(photo.author))&&txt(row).includes(photo.license)&&txt(row).includes(normal(photo.changeNote)));assert.ok(walk(row).some(n=>n.tagName==='a'&&attr(n,'href')===photo.licenseUrl&&txt(n)===photo.license),'Visible source-specific licence link: '+photo.src);}
  const faqSection=byId('faq-heading').parentNode.parentNode;
  const faqNodes=walk(faqSection).filter(n=>n.tagName==='details');
  assert.equal(faqNodes.length,4);assert.deepEqual(faqNodes.map(n=>txt(walk(n).find(c=>c.tagName==='summary'))),faqs.map(f=>f.question));
  for(const [i,node]of faqNodes.entries())assert.equal(txt(walk(node).find(n=>n.tagName==='p')),faqs[i].answer);
  const documents=nodes.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').map(n=>JSON.parse(text(n)));
  const schema=documents.flatMap(n=>Array.isArray(n)?n:[n]);
  const faq=schema.filter(n=>n['@type']==='FAQPage');assert.equal(faq.length,1);assert.deepEqual(faq[0].mainEntity.map(n=>[n.name,n.acceptedAnswer.text]),faqs.map(f=>[f.question,f.answer]));
  const itemLists=schema.filter(n=>n['@type']==='ItemList');assert.equal(itemLists.length,1);assert.equal(itemLists[0].numberOfItems,20);
  assert.deepEqual(itemLists[0].itemListElement.map(n=>[n.position,n.name,n.url]),catalogue.map(a=>[a.rank,a.name,ORIGIN+'/book/banff-winter-activities/#'+anchorFor(a)]));
  assert.ok(!schema.some(n=>['Product','Offer','OfferCatalog','AggregateRating'].includes(n['@type'])));
  const heroImage=nodes.find(n=>n.tagName==='img'&&attr(n,'fetchpriority')==='high');assert.ok(heroImage);assert.equal(attr(heroImage,'src'),catalogue[0].gallery[0].src);assert.equal(attr(heroImage,'loading'),'eager');
  if(!scriptingEnabled)assert.ok(nodes.some(n=>n.tagName==='noscript'&&txt(n).includes('All 20 activities, photos and links')));
  return {nodes,cards,sponsored};
}
const html=await renderActualPage();const actual=inspect(html);inspect(html,false);
let htmlNegatives=0;
function reject(mutated,label){assert.notEqual(mutated,html,label+' mutation changed actual SSR');assert.throws(()=>inspect(mutated),undefined,label);htmlNegatives++;}
const remove=node=>html.slice(0,node.sourceCodeLocation.startOffset)+html.slice(node.sourceCodeLocation.endOffset);
reject(remove(actual.cards[19]),'Removing the twentieth editorial choice must fail');
reject(html.replace('value="20"','value="19"'),'A duplicate rank must fail');
reject(html.replace(catalogue[0].gallery[1].src,catalogue[0].gallery[0].src),'A gallery photograph replaced by a duplicate must fail');
reject(html.replace('href="'+catalogue[19].internalHref+'"','href="/blog/unknown-unreviewed-guide/"'),'Wrong internal guide handoff must fail');
reject(html.replace('>Find out more</a>','>Check availability</a>'),'Commercial CTA text is the requested Find out more');
reject(html.replace('>Book now</a>','>Buy tickets</a>'),'Commercial CTA text is the requested Book now');
reject(html.replace('partner_id=QW960HO','partner_id=wrong'),'Wrong native partner identity must fail');
reject(html.replace('data-offer-id="gyg-256607"','data-offer-id="invented-merchant"'),'An invented merchant ID must fail');
const closure=actual.nodes.find(n=>klass(n,'card-access'));reject(remove(closure),'An affected product cannot lose its pre-CTA closure notice');
reject(remove(actual.nodes.find(n=>attr(n,'id')==='photo-credits')),'Photo source and licence attribution cannot disappear');
reject(html.replace('href="'+photoCredits[0].licenseUrl+'"','href="https://example.com/unsupported-license"'),'A photograph licence link cannot point elsewhere');
reject(html.replace('numberOfItems":20','numberOfItems":19'),'Structured ranked catalogue count must match the twenty visible choices');
reject(html.replace('id="activity-gallery-banff-gondola"','id="activity-gallery-duplicate"'),'Gallery control IDs must match the named activity');
reject(html.replace('aria-label="Book now: '+catalogue[0].name+'"','aria-label="Book now"'),'Repeated booking links retain a distinct activity label');
const extra='<a href="'+offers[0].bookingUrl+'" target="_blank" rel="noopener sponsored" data-landing-id="banff-winter-activities" data-offer-id="'+offers[0].id+'" data-landing-placement="detail-card">Book now</a>';
const target=walk(actual.cards[19]).find(node=>node.tagName==='article').sourceCodeLocation.endTag.startOffset;
reject(html.slice(0,target)+extra+html.slice(target),'A fabricated fourth bookable editorial card must fail');

async function compileClient(source,resolveDir=path.join(ROOT,'src/pages/book')) {
  const result=await build({stdin:{contents:source,loader:'ts',resolveDir},bundle:true,write:false,platform:'browser',format:'iife',logLevel:'silent'});
  return result.outputFiles[0].text;
}
const clientCode=await compileClient(client);
function filterHarness(href,{blockHistory=false,missing=null,code=clientCode}={}) {
  const events=new Map(),nodes=new Map();
  const element=id=>{if(id===missing)return null;if(!nodes.has(id))nodes.set(id,{value:id==='winter-experience'?'all':'',hidden:id==='winter-experience-form',dataset:{},textContent:'',listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}});return nodes.get(id);};
  const cards=ids.map(id=>({dataset:{winterActivity:id},hidden:false}));
  const window={location:{href},history:{replaceState(state,title,url){if(blockHistory)throw Error('Unavailable');window.location.href=String(url);}}};
  const document={getElementById:element,querySelectorAll(selector){assert.equal(selector,'[data-winter-activity]','Only editorial cards, never merchant anchors, may be hidden');return cards;},addEventListener(type,fn){(events.get(type)??events.set(type,[]).get(type)).push(fn);}};
  vm.runInNewContext(code,{document,window,URL,Set});
  const trigger=(id,type,event={})=>{for(const fn of element(id)?.listeners[type]??[])fn(event);};
  return {nodes,cards,window,change(value){element('winter-experience').value=value;trigger('winter-experience-form','change');},reset(){let prevented=false;trigger('winter-experience-form','reset',{preventDefault(){prevented=true;}});assert.equal(prevented,true);},submit(){let prevented=false;trigger('winter-experience-form','submit',{preventDefault(){prevented=true;}});assert.equal(prevented,true);},reinit(){for(const fn of events.get('astro:page-load')??[])fn();},visible(){return cards.filter(card=>!card.hidden).map(card=>card.dataset.winterActivity);}};
}
let filterCases=0;
for(const category of categories) {
  const h=filterHarness(ORIGIN+'/book/banff-winter-activities/?utm_source=google&utm_medium=cpc&gclid=example&msclkid=example2#banff-gondola');
  assert.equal(h.nodes.get('winter-experience-form').hidden,false);assert.deepEqual(h.visible(),ids);
  h.change(category);assert.deepEqual(h.visible(),wantedIds(category));assert.equal(h.nodes.get('winter-experience').value,category);
  const selectedUrl=new URL(h.window.location.href);assert.equal(selectedUrl.searchParams.get('category'),category==='all'?null:category);
  assert.equal(selectedUrl.searchParams.get('utm_source'),'google');assert.equal(selectedUrl.searchParams.get('gclid'),'example');assert.equal(selectedUrl.searchParams.get('msclkid'),'example2');assert.equal(selectedUrl.hash,'#banff-gondola');
  assert.ok(h.nodes.get('winter-experience-count').textContent.startsWith(wantedIds(category).length+' '));
  h.submit();h.reinit();assert.equal(h.nodes.get('winter-experience-form').listeners.change.length,1);
  h.reset();assert.deepEqual(h.visible(),ids);assert.equal(new URL(h.window.location.href).searchParams.has('category'),false);assert.equal(new URL(h.window.location.href).searchParams.get('gclid'),'example');filterCases++;
  const restored=filterHarness(ORIGIN+'/book/banff-winter-activities/?category='+category+'&utm_source=bing&msclkid=example');
  assert.deepEqual(restored.visible(),wantedIds(category));assert.equal(restored.nodes.get('winter-experience').value,category);filterCases++;
}
for(const query of ['category=bad','category=%3Cscript%3E','category=sightseeing&category=snow-sports','category=constructor','category=']) {
  const h=filterHarness(ORIGIN+'/book/banff-winter-activities/?'+query+'&utm_campaign=winter');
  assert.deepEqual(h.visible(),ids);assert.equal(h.nodes.get('winter-experience').value,'all');assert.equal(new URL(h.window.location.href).searchParams.has('category'),false);assert.equal(new URL(h.window.location.href).searchParams.get('utm_campaign'),'winter');filterCases++;
}
const blocked=filterHarness(ORIGIN+'/book/banff-winter-activities/?utm_source=google',{blockHistory:true});blocked.change('specialist');assert.deepEqual(blocked.visible(),['mountain-scenic-flight']);blocked.reset();assert.deepEqual(blocked.visible(),ids);filterCases++;
for(const missing of ['winter-experience-form','winter-experience','winter-experience-count'])assert.doesNotThrow(()=>filterHarness(ORIGIN+'/book/banff-winter-activities/',{missing}));
const duplicateAcceptance=client.replace('values.length === 1 ? values[0] : undefined','values[0]');
assert.notEqual(duplicateAcceptance,client);
const brokenFilterCode=await compileClient(duplicateAcceptance);
assert.notDeepEqual(filterHarness(ORIGIN+'/book/banff-winter-activities/?category=sightseeing&category=snow-sports',{code:brokenFilterCode}).visible(),ids,'Actual duplicate-query mutation is rejected by the invalid-query contract');

const galleryCode=await compileClient(galleryClient,path.join(ROOT,'src/components'));
function galleryHarness({reducedMotion=false,code=galleryCode,missing=null,sizes=catalogue.map(a=>a.gallery.length)}={}) {
  const events=new Map(),moves=[];
  const node=()=>({hidden:false,disabled:false,textContent:'',listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}});
  const galleries=sizes.map((total,index)=>{
    const controls=node(),previous=node(),next=node(),position=node(),track=node();controls.hidden=true;previous.disabled=true;track.children=Array.from({length:total},()=>({}));track.clientWidth=800;track.scrollLeft=0;
    track.scrollTo=options=>{moves.push({index,...options});track.scrollLeft=options.left;for(const fn of track.listeners.scroll??[])fn();};
    const nodes={'[data-gallery-track]':track,'[data-gallery-controls]':controls,'[data-gallery-previous]':previous,'[data-gallery-next]':next,'[data-gallery-position]':position};
    return {dataset:{},nodes,querySelector(selector){assert.ok(Object.hasOwn(nodes,selector));return missing?.index===index&&missing.selector===selector?null:nodes[selector];}};
  });
  const document={querySelectorAll(selector){assert.equal(selector,'[data-activity-gallery]');return galleries;},addEventListener(type,fn){(events.get(type)??events.set(type,[]).get(type)).push(fn);}};
  vm.runInNewContext(code,{document,window:{matchMedia(query){assert.equal(query,'(prefers-reduced-motion: reduce)');return{matches:reducedMotion};}},Math});
  const fire=(index,selector,type,event={})=>{const element=galleries[index].nodes[selector];if(type==='click'&&element.disabled)return;for(const fn of element.listeners[type]??[])fn(event);};
  return {galleries,moves,fire,reinit(){for(const fn of events.get('astro:page-load')??[])fn();}};
}
let galleryCases=0;
for(const reducedMotion of [false,true]) {
  const h=galleryHarness({reducedMotion});
  for(const [index,gallery]of h.galleries.entries()) {
    const n=gallery.nodes,total=catalogue[index].gallery.length;
    assert.equal(n['[data-gallery-controls]'].hidden,false);assert.equal(n['[data-gallery-previous]'].disabled,true);assert.equal(n['[data-gallery-next]'].disabled,false);assert.equal(n['[data-gallery-position]'].textContent,'1 / '+total);
    h.fire(index,'[data-gallery-next]','click');assert.equal(n['[data-gallery-position]'].textContent,'2 / '+total);assert.ok(reducedMotion?['auto','instant'].includes(h.moves.at(-1).behavior):h.moves.at(-1).behavior==='smooth','Gallery honors reduced motion');
    let prevented=false;h.fire(index,'[data-gallery-track]','keydown',{key:'ArrowLeft',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(n['[data-gallery-position]'].textContent,'1 / '+total);
    const before=h.moves.length;h.fire(index,'[data-gallery-track]','keydown',{key:'Tab',preventDefault(){assert.fail('Other keys remain native');}});assert.equal(h.moves.length,before);
    h.fire(index,'[data-gallery-track]','keydown',{key:'ArrowLeft',preventDefault(){}});assert.equal(n['[data-gallery-position]'].textContent,'1 / '+total);
    n['[data-gallery-track]'].scrollLeft=(total-1)*800;for(const fn of n['[data-gallery-track]'].listeners.scroll??[])fn();assert.equal(n['[data-gallery-next]'].disabled,true);assert.equal(n['[data-gallery-position]'].textContent,total+' / '+total);
    n['[data-gallery-track]'].scrollLeft=0;for(const fn of n['[data-gallery-track]'].listeners.scroll??[])fn();assert.equal(n['[data-gallery-position]'].textContent,'1 / '+total);
    galleryCases++;
  }
  h.fire(0,'[data-gallery-next]','click');assert.equal(h.galleries[1].nodes['[data-gallery-position]'].textContent,'1 / '+catalogue[1].gallery.length,'Galleries operate independently');
  h.reinit();assert.equal(h.galleries[0].nodes['[data-gallery-next]'].listeners.click.length,1,'Repeated initialization does not duplicate gallery handlers');
}
for(const size of [0,1]) {
  const h=galleryHarness({sizes:[size]});assert.equal(h.galleries[0].dataset.ready,undefined);assert.equal(h.galleries[0].nodes['[data-gallery-controls]'].hidden,true);galleryCases++;
}
for(const selector of ['[data-gallery-track]','[data-gallery-controls]','[data-gallery-previous]','[data-gallery-next]','[data-gallery-position]']) {
  const h=galleryHarness({missing:{index:0,selector}});assert.equal(h.galleries[0].dataset.ready,undefined);assert.equal(h.galleries[1].dataset.ready,'true');galleryCases++;
}
const noIdempotence=galleryClient.replace('if (gallery.dataset.ready) continue;','');
assert.notEqual(noIdempotence,galleryClient);
const repeated=galleryHarness({code:await compileClient(noIdempotence,path.join(ROOT,'src/components'))});repeated.reinit();assert.notEqual(repeated.galleries[0].nodes['[data-gallery-next]'].listeners.click.length,1,'Actual gallery idempotence mutation fails the single-listener contract');
const wrongMotion=galleryClient.replace(/\.matches \? '(?:auto|instant)' : 'smooth'/,".matches ? 'smooth' : 'smooth'");
assert.notEqual(wrongMotion,galleryClient);const motion=galleryHarness({reducedMotion:true,code:await compileClient(wrongMotion,path.join(ROOT,'src/components'))});motion.fire(0,'[data-gallery-next]','click');assert.ok(!['auto','instant'].includes(motion.moves.at(-1).behavior),'Actual reduced-motion mutation fails the non-animated scroll contract');

let consentCases=0;
for(const link of actual.sponsored) for(const source of ['google','bing']) for(const analytics of [false,true]) for(const advertising of [false,true]) {
  const href=attr(link,'href'),offerId=attr(link,'data-offer-id'),placement=attr(link,'data-landing-placement');
  const h=consentHarness({stored:validConsent({analytics,advertising}),initTracking:true,paidLanding:true,landingId:'banff-winter-activities',pageHref:ORIGIN+'/book/banff-winter-activities/?utm_source='+source+'&utm_medium=cpc&gclid=PRIVATE_GOOGLE&msclkid=PRIVATE_BING&email=PRIVATE_EMAIL#experiences'});
  const click=h.linkClick(href,{landingId:'banff-winter-activities',offerId,placement,cta:true});
  assert.equal(click.prevented,0);assert.equal(click.link.href,href);assert.equal(h.opened,0);assert.equal(h.providerScripts.some(s=>s.src.includes('googlesyndication')),false);
  const event=h.commands.find(c=>c[1]==='affiliate_click');assert.equal(Boolean(event),analytics);
  if(event){assert.equal(event[2].landing_id,'banff-winter-activities');assert.equal(event[2].offer_id,offerId);assert.equal(event[2].paid_source,source);assert.equal(event[2].placement,placement);}
  const conversion=h.commands.find(c=>c[1]==='conversion');assert.equal(Boolean(conversion),advertising);if(conversion){assert.equal(conversion[2].value,undefined);assert.equal(conversion[2].transaction_id,undefined);}
  assert.ok(!/PRIVATE_GOOGLE|PRIVATE_BING|PRIVATE_EMAIL|gclid=|msclkid=|utm_source=/.test(JSON.stringify(h.commands)));
  consentCases++;
}
console.log('Winter activity landing checks passed:20 literal editorial identities/ranks and canonical guide handoffs;three unchanged exact merchant identities/six native Book now placements;21 Find out more links;actual full-layout SSR/no-JS galleries and20photo source/licence attributions;four FAQ/schema pairs and20ItemList entries;'+htmlNegatives+' actual-HTML negatives;'+filterCases+' actual category/client cases plus duplicate-query mutation;'+galleryCases+' gallery control/keyboard/motion/independence/failure cases plus actual idempotence/motion mutations;'+consentCases+' actual-CTA consent/source cases. No network, browser, site build, account or output writes.');
