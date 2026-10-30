import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { htmlFacts, htmlElements, schemaNodes, normal } from './verify-cycling-consent-release.mjs';

// Dedicated author check: read real exported bodies, render through Astro, then
// inspect the output. No shared registry expectation or generated file output.
globalThis.fetch = () => { throw new Error('No network in itinerary/weather checks'); };
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const filename = 'src/data/itineraryWeatherGuideOverrides.ts';
const postSource = await readFile(path.join(root, 'src/data/blogPosts.ts'), 'utf8');
const originalArray = postSource.match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(originalArray, 'Read original publication records before metadata projection.');
const compiled = await build({ stdin: { contents: `export * from './${filename}';export {blogRedirects} from './src/data/redirects.mjs';export {towns} from './src/data/towns.ts';export {plannerTemplates} from './src/data/tripPlanner.ts';export const originalPosts=${originalArray};`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const d = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const publications = { '7-day-banff-itinerary': '2026-02-05', 'rainy-day-banff': '2026-02-18' };
const slugs = Object.keys(publications);
for (const value of [d.itineraryWeatherGuideOverrides,d.itineraryWeatherGuideMetadata,d.itineraryWeatherGuideFaqs]) assert.deepEqual(Object.keys(value), slugs);
assert.equal(d.reviewDate, '2026-10-29');
for (const slug of slugs) { assert.equal(d.originalPosts.find(p => p.slug === slug)?.date, publications[slug]); assert.ok(!d.blogRedirects[slug]); }

const ssr = await transform('---\nconst { body } = Astro.props;\n---\n<article data-reviewed-guide><Fragment set:html={body} /></article>', { filename: path.join(root, 'itinerary-weather-author-check.astro'), internalURL: 'astro/compiler-runtime', resultScopedSlot: true });
assert.deepEqual(ssr.diagnostics.filter(v => v.severity === 1), []);
// Match the existing focused SSR harnesses: the standalone compiler's obsolete
// metadata export is not part of the runtime/body contract under test.
const renderCode=ssr.code.replace(/,\s*createMetadata as \$\$createMetadata/,'').replace(/^export const \$\$metadata = [^\n]*\n/m,'');
const renderBundle = await build({ stdin: { contents: renderCode, loader: 'ts', resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', plugins: [{ name: 'astro-runtime-only', setup(b) { b.onResolve({ filter: /^astro\// }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true })); } }] });
const Page = (await import('data:text/javascript;base64,' + Buffer.from(renderBundle.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create();
const renderedBodies = {};
for (const slug of slugs) renderedBodies[slug] = '<html><head></head><body>' + await container.renderToString(Page, { props: { body: d.itineraryWeatherGuideOverrides[slug] }, request: new Request('https://banffbound.com/blog/' + slug + '/?email=PRIVATE_EMAIL&gclid=PRIVATE_CLICK') }) + '</body></html>';

const forbidden = /\$\s*\d|\bCAD\s*\d|(?:I|we) (?:visited|hiked|stayed|experienced)|during my last visit|open daily year-round|day access from|covered catwalks|catwalks provide (?:some )?shelter|suitable for all fitness levels|highest point reachable by maintained trail|if time allows, walk on the Athabasca Glacier|guaranteed (?:views|availability|daylight return)|the (?:winter|summer) week is safe for everyone|Canada Strong makes winter admission free|daily pass is always cheaper|seven days means seven hotel nights|2027 shuttles depart every/i;
const sectionRequirements = {
  '7-day-banff-itinerary': {
    'week-foundations': ['village, lakeshore, ski resort and summer Park and Ride are separate places','Count travel days, accommodation nights, people and rooms separately','Seven travel days do not automatically mean seven hotel nights'],
    'week-overview': ['One main objective per day','Winter branch','Summer branch','suggestions, not bookings','removable departure placeholder','summer hike still needs a specific route'],
    'day-one': ['arrival as the main task','luggage','actual tires','admission'],
    'day-two': ['indoor/outdoor mix','does not establish visibility','winter walking guidance'],
    'day-three': ['Winter:','Summer:','does not establish a ski-resort connection or winter Moraine access','Do not improvise a frozen-lake crossing','closed to personal vehicles year-round','2026 Parks lake-shuttle season ended October 12','rather than inventing a 2027 timetable','Alpine Start is a different product','last return'],
    'day-four': ['Winter:','Summer:','Reserve the snow-school product','Non-skiers need a separately suitable plan','first-come seats','three resort names do not create unlimited pass coverage','the pass includes its valley approach'],
    'day-five': ['slower cultural day','October 16–May 14 closed','weekly days and closure blocks'],
    'day-six': ['Winter:','Summer:','local outing','limited services and no cellular coverage','Do not walk onto the Athabasca Glacier independently','hidden crevasses','A commercial glacier experience, when operating'],
    'day-seven': ['pickup location','rental return','does not protect a flight connection'],
    'week-booking': ['actual room and transport requirements','Keep one day movable','complete quotes','affiliate links','Reopening remains unconfirmed','scheduled December 11, 2026'],
  },
  'rainy-day-banff': {
    'weather-choice': ['check the actual date and access','indoor substitute','wet gear'],
    'weather-whyte': ['111 Bear Street','admission and tours separately','December 24–26 and January 1','Banff Park Museum','October 16–May 14 closed'],
    'weather-heritage': ['not fully indoors','Swimming is prohibited','protected thermal habitat','Thursday–Monday, October 16–May 14','December 14–17, 2026 and March 15–18, 2027'],
    'weather-bowling': ['table reservation does not book a lane','eight bowlers per lane','no minors after 10 pm','early session','conflicting weekday deal times'],
    'weather-meal': ['actual party','A pub table, admission ticket and seat at a show are different products','does not establish what your room category includes'],
    'weather-bathing': ['checked October 29, 2026','Tourism’s official notice','October 13 to early November, 2026','does not confirm reopening','outdoor bathing','405 Spray Avenue','18-plus','facility-only access','Monday–Thursday subject to availability'],
    'weather-outdoors': ['Canyon railings and forest cover are not weather shelters','scheduled December 11, 2026 end','Reopening remains unconfirmed','does not suggest another approach','town forecast alone'],
    'weather-journey': ['separate destinations','Do not assume a seasonal bus runs in winter','lane, table, treatment and performance','door-to-door journey'],
  },
};
// The headings/sections are inspected individually: a repeated FAQ or source
// notice elsewhere cannot mask a changed route, season or booking boundary.
function inspect(slug, html, meta = d.itineraryWeatherGuideMetadata[slug]) {
  assert.deepEqual(Object.keys(meta).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(meta.lastUpdated, '2026-10-29'); assert.equal(meta.imageIsIllustrative, true); assert.match(meta.imageNote, /Illustrative.*not verified/); assert.ok(meta.description.length >= 110);
  const facts = htmlFacts(html), elements = htmlElements(html), h2 = elements.filter(n => n.tag === 'h2');
  const words = facts.text.split(/\s+/).length; assert.ok(words >= 1400 && words <= 3100, `${slug}: substantive authored output (${words} words)`);
  assert.ok(!forbidden.test(facts.text), `${slug}: no inherited unsafe, invented or stale claim`);
  assert.ok(!facts.text.includes('PRIVATE_EMAIL') && !facts.text.includes('PRIVATE_CLICK'));
  assert.ok(facts.text.includes('Full guide reviewed October 29, 2026') && facts.text.includes('hero image is illustrative'));
  const section = id => { const heading = h2.find(n => n.attributes.id === id); assert.ok(heading, `Actual ${slug} section ${id}`); const next = h2.find(n => n.start > heading.end); return normal(html.slice(heading.start, next?.start ?? html.length).replace(/<[^>]*>/g,' ')); };
  for (const [id, phrases] of Object.entries(sectionRequirements[slug])) for (const phrase of phrases) {
    assert.ok(section(id).toLowerCase().includes(phrase.toLowerCase()), `${slug} ${id}: ${phrase}`);
  }
  const ids = elements.map(n => n.attributes.id).filter(Boolean); assert.equal(ids.length,new Set(ids).size);
  const anchors = elements.filter(n => n.tag === 'a');
  for (const a of anchors) {
    assert.ok(!anchors.some(other => other !== a && a.start >= other.openEnd && a.end <= other.innerEnd), 'No nested anchors.');
    const href = a.attributes.href; assert.ok(href);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Existing fragment ${href}`);
    else if (!href.startsWith('/')) { assert.ok(Object.values(d.itineraryWeatherGuideSources).includes(href), 'Only declared primary/native sources: ' + href); assert.equal(a.attributes.target, '_blank'); assert.ok(a.attributes.rel.includes('noopener')); }
  }
  const scripts = elements.filter(n => n.tag === 'script'); assert.equal(scripts.length,1); assert.equal(scripts[0].attributes.type,'application/ld+json'); assert.ok(!elements.some(n=>['iframe','embed','object','form','img'].includes(n.tag)));
  const schemas = facts.documents.flatMap(doc => schemaNodes(doc,'FAQPage')); assert.equal(schemas.length,1); assert.equal(schemas[0].mainEntity.length,5); assert.equal(facts.documents.flatMap(doc=>schemaNodes(doc,'Article')).length,0);
  const details=elements.filter(n=>n.tag==='details'); assert.equal(details.length,5);
  assert.equal(facts.details.length,5);
  for(const [i,faq] of d.itineraryWeatherGuideFaqs[slug].entries()) { assert.equal(facts.details[i].question,normal(faq.question)); assert.equal(facts.details[i].answer,normal(faq.answer)); assert.equal(normal(schemas[0].mainEntity[i].name),normal(faq.question)); assert.equal(normal(schemas[0].mainEntity[i].acceptedAnswer.text),normal(faq.answer)); }
  const requiredLinks = slug==='7-day-banff-itinerary' ? ['/trip-builder/?template=winter-week-7#your-trip','/trip-builder/?template=summer-week-7#your-trip','/trip-cost/','/park-pass/','/learn-to-ski/#lesson-fit','/ski-day-planner/','/ski-pass-calculator/','/icefields-parkway-planner/','/shuttle-reservations/','/book/banff-hotels/','/book/lake-louise-stays/','/book/banff-winter-activities/','/blog/rainy-day-banff/#weather-bathing'] : ['/eat-and-drink/#dining-finder','/blog/banff-nightlife-guide/#evening-planner','/blog/cave-and-basin-guide/','/wellness/','/car-free-banff/','/book/banff-hotels/'];
  for(const href of requiredLinks) assert.ok(anchors.some(a=>a.attributes.href===href),'Task-specific native handoff: '+href);
  const requiredSources = slug==='7-day-banff-itinerary' ? ['https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise','https://roamtransit.com/fares/reservations/winter-reservations/','https://www.skibig3.com/ski/ski-shuttle/','https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/glacier-athabasca','https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c'] : ['https://www.whyte.org/visit','https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours','https://parks.canada.ca/lhn-nhs/ab/banff/visit/heures-hours','https://www.highrollersbanff.com/','https://www.banff-springs-hotel.com/wellness/spa/','https://www.banfflakelouise.com/wellness/banff-hot-springs','https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs'];
  for(const href of requiredSources)assert.ok(anchors.some(a=>a.attributes.href===href),'Actual source handoff remains beside the decision: '+href);
  if(slug==='7-day-banff-itinerary') { const table=elements.find(n=>n.tag==='table'); assert.equal(elements.filter(n=>n.tag==='tr'&&n.start>table.start&&n.end<=table.end).length,8); for(const id of ['day-one','day-two','day-three','day-four','day-five','day-six','day-seven'])assert.ok(ids.includes(id)); }
  return {words,anchors};
}
const results = slugs.map(slug=>({slug,...inspect(slug,renderedBodies[slug])}));
for(const {anchors} of results) for(const a of anchors) {
  const href=a.attributes.href;if(!href.startsWith('/'))continue;
  const u=new URL(href,'https://banffbound.com'), route=u.pathname.replace(/\/$/,'');
  if(route.startsWith('/blog/')) { const slug=route.slice(6);assert.ok(d.originalPosts.some(p=>p.slug===slug),'Existing canonical article '+href);assert.ok(!d.blogRedirects[slug]);if(u.hash&&Object.hasOwn(renderedBodies,slug))assert.ok(htmlElements(renderedBodies[slug]).some(n=>n.attributes.id===u.hash.slice(1))); }
  else if(route.startsWith('/towns/')) assert.ok(d.towns.some(t=>t.slug===route.slice(7)),'Existing town '+href);
  else { let found=false;for(const f of [path.join(root,'src/pages',route+'.astro'),path.join(root,'src/pages',route,'index.astro')])try{await access(f);found=true;}catch{}assert.ok(found,'Existing native tool/landing route '+href); }
}
for(const [file,id] of [['src/pages/learn-to-ski.astro','lesson-fit'],['src/pages/eat-and-drink.astro','dining-finder'],['src/pages/trip-builder.astro','your-trip']])assert.ok((await readFile(path.join(root,file),'utf8')).includes(`id="${id}"`));
for(const [id,days] of Object.entries({'winter-week-7':[['town'],['gondola'],['lake'],['lesson'],['culture','dinner'],['canmore'],['town']],'summer-week-7':[['town'],['gondola'],['lake'],['hike'],['culture','dinner'],['parkway'],['town']]})) assert.deepEqual(d.plannerTemplates.find(t=>t.id===id)?.days,days,'Guide links use the accepted real template sequence.');
assert.notEqual(d.itineraryWeatherGuideMetadata[slugs[0]].title,d.itineraryWeatherGuideMetadata[slugs[1]].title);
const raw=await readFile(path.join(root,'src/data/blogContent.ts'),'utf8');
for(const slug of slugs) { const original=raw.match(new RegExp("['\"]"+slug+"['\"]\\s*:\\s*`([\\s\\S]*?)`"))?.[1];assert.ok(original);assert.deepEqual([...original.matchAll(/href=["']([^"']+)["']/g)].map(v=>v[1]),[],'No original authored affiliate URL or fragments to silently retire.');assert.ok(!/\bid=["']/.test(original)); }
const negativeClaims = ['Open daily year-round.','Day access from $75.','The covered catwalks provide some shelter.','Johnston Canyon is suitable for all fitness levels.','If time allows, walk on the Athabasca Glacier.','Seven days means seven hotel nights.','The winter week is safe for everyone.','We visited every museum last winter.','2027 shuttles depart every 30 minutes.'];
for(const slug of slugs) for(const claim of negativeClaims)assert.throws(()=>inspect(slug,renderedBodies[slug].replace('</body>','<p>'+claim+'</p></body>')),claim);
const mutants = {
  '7-day-banff-itinerary': [['closed to personal vehicles year-round','restricted during peak season'],['2026 Parks lake-shuttle season ended October 12','2027 service is already guaranteed'],['Do not improvise a frozen-lake crossing','Walk across the lake'],['three resort names do not create unlimited pass coverage','Ikon gives unlimited days at every resort'],['Do not walk onto the Athabasca Glacier independently','Step onto the glacier for a quick picture'],['Reopening remains unconfirmed','The trail is definitely open again']],
  'rainy-day-banff': [['October 16–May 14 closed','open throughout winter'],['Swimming is prohibited at Cave and Basin','Swimming is encouraged at Cave and Basin'],['Thursday–Monday, October 16–May 14','daily throughout winter'],['no minors after 10 pm','all ages all night'],['Monday–Thursday subject to availability','every day with no reservation'],['does not confirm reopening','confirms the pool is open'],['Canyon railings and forest cover are not weather shelters','Canyon railings make a good shelter']],
};
for(const [slug,cases] of Object.entries(mutants)) for(const [from,to] of cases) { assert.ok(renderedBodies[slug].includes(from),'Mutation targets actual output');assert.throws(()=>inspect(slug,renderedBodies[slug].replaceAll(from,to)),`Source boundary ${from}`); }
assert.throws(()=>inspect(slugs[0],renderedBodies[slugs[0]].replace('template=winter-week-7','template=unreviewed-week')));
for(const slug of slugs) { const primary=slug===slugs[0]?d.itineraryWeatherGuideSources.glacier:d.itineraryWeatherGuideSources.caveHours;assert.throws(()=>inspect(slug,renderedBodies[slug].replaceAll(primary,'/winter/')),'Removing a source link fails even when its visible wording survives.'); }
for(const slug of slugs) { assert.throws(()=>inspect(slug,renderedBodies[slug],{...d.itineraryWeatherGuideMetadata[slug],date:'2026-10-29'}));assert.throws(()=>inspect(slug,renderedBodies[slug],{...d.itineraryWeatherGuideMetadata[slug],imageIsIllustrative:false}));assert.throws(()=>inspect(slug,renderedBodies[slug].replace('<summary>','<summary>Different visible question: ')));assert.throws(()=>inspect(slug,renderedBodies[slug].replace('"@type":"FAQPage"','"@type":"WebPage"')));assert.throws(()=>inspect(slug,renderedBodies[slug].replace('<a ','<a href="/winter/"><a ').replace('</a>','</a></a>'))); }
const source=await readFile(path.join(root,filename),'utf8');assert.equal((source.match(/function renderFaqs\(/g)??[]).length,1);assert.equal((source.match(/\$\{renderFaqs\('/g)??[]).length,2);assert.ok(!/\bfetch\s*\(|process\.env|localStorage|sessionStorage|document\.cookie/.test(source));
const note=await readFile(path.join(root,'research/itinerary-weather-guide-sources-2026-10-29.md'),'utf8');for(const url of Object.values(d.itineraryWeatherGuideSources))assert.ok(note.includes(url),'Source inventory: '+url);for(const marker of ['2026-02-05','2026-02-18','no authored hrefs','no fragment IDs','timed out','Registration','Banff Park Museum','no 2027 timetable'])assert.ok(note.includes(marker));
console.log('Itinerary/weather guide checks passed: '+results.map(r=>r.slug+' '+r.words+' words').join('; ')+'. Actual Astro-rendered bodies, two distinct full reviews/metadata, ten identical visible/schema FAQs, original publications, seven seasonal day objectives, all native handoffs, dated venue/access boundaries, illustrative heroes and negative regressions. No network, registry expectation, site build, shared-source mutation or file output.');
