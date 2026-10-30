import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';
import { experimental_AstroContainer } from 'astro/container';
import { parseFragment } from 'parse5';

globalThis.fetch = () => { throw Error('No network in Kananaskis author check'); };
const root = fileURLToPath(new URL('../', import.meta.url)), read = file => readFile(path.join(root, file), 'utf8');
const slug = 'kananaskis-day-trip';
const rawPosts = (await read('src/data/blogPosts.ts')).match(/const originalBlogPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)?.[1];
assert.ok(rawPosts, 'Use original publications before metadata overlays.');
const bundle = await build({ stdin: { contents: "export * from './src/data/kananaskisDayGuideOverrides.ts';export {blogRedirects} from './src/data/redirects.mjs';export const originalPosts=" + rawPosts + ';', resolveDir: root }, bundle: true, write: false, format: 'esm', platform: 'node' });
const d = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const referrals = ['https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX','https://www.getyourguide.com/banff-l284/?partner_id=QW960HO'];
const expectedSources = [
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/annual-road-closures/',
  'https://www.albertaparks.ca/media/6493727/2016_bow_corridor_kan_valley.pdf',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/kananaskis-valley/',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/peter-lougheed/',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/backcountry-safety/',
  'https://www.alberta.ca/kananaskis-conservation-pass',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/kananaskis-valley/wedge-pond/',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/peter-lougheed/rawson-lake/',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/peter-lougheed/chester-lake/',
  'https://www.albertaparks.ca/parks/kananaskis/kananaskis-country/advisories-public-safety/trail-reports/peter-lougheed/ptarmigan-cirque-interpretive/',
  'https://kananaskisoutfitters.com/tours/snowshoe-tours/',
  'https://skinakiska.com/discover-nakiska/getting-to-nakiska/',
  'https://skinakiska.com/purchase/telus-winter-sports-school/',
  'https://knordicspa.com/access/','https://knordicspa.com/faq/','https://knordicspa.com/elements/','https://knordicspa.com/transformation-journey/','https://511.alberta.ca/',
];
const routes = ['/towns/kananaskis/','/towns/canmore/','/blog/banff-car-rental-tips/','/car-free-banff/','/park-pass/','/trip-cost/','/towns/kananaskis/#where-to-stay','/book/banff-hotels/'];
const sections = {
  'kananaskis-places': ['multiple parks and recreation areas','Kananaskis Way in Canmore is not Kananaskis Village','actual trailhead, check-in or pickup'],
  'kananaskis-journey': ['east on Highway 1, then south on Highway 40','Smith-Dorrien/Spray Trail, Highway 742','not add it as an automatic scenic shortcut','Peter Lougheed Provincial Park to Highwood House Junction closed December 1–June 14','does not close the entire highway','before leaving and before returning','not confirmation that a road has reopened','Calgary-origin FlixBus','not evidence of a Banff pickup, a spa transfer or a bus to every trailhead','last useful return'],
  'kananaskis-pass': ['vehicles parked at covered provincial-park and public-land sites','map and exemptions','Canmore townsite and other municipal land are excluded','correct plate','separate from Parks Canada admission','camping or specialized facility charges'],
  'kananaskis-day-choice': ['Nakiska lesson or ski day','Guided snowshoe outing','A shorter pond visit','One longer hike','Adult spa visit','one compulsory itinerary','accompanying children'],
  'kananaskis-winter': ['Nakiska’s own winter sports school','three-resort lesson and ski-day tools do not cover Nakiska','Kananaskis Village meeting point','guide-selected local trails','rental-only transaction and a guided outing are different purchases','Both October 29 reports','partial Ribbon Creek closure','flood-related restrictions','Summer distances below do not identify a winter line, approve frozen water'],
  'kananaskis-summer': ['published summer profiles','not walking-time forecasts or current opening notices','least experienced person','Rawson and Chester distances still need the return','Ptarmigan web profile does not label its length one-way','Do not stack two longer routes and a timed spa appointment','does not guarantee Chester Lake colour'],
  'kananaskis-spa': ['checked October 29, 2026','Yora Nordic Spa Kananaskis','October 30 reopening','closed October 13–30','welcome you back on October 28','Those dates conflict; reopening is not confirmed here','18-plus facility','no re-entry','massage services include hydrotherapy','not a fully indoor bad-weather refuge','reached by stairs','behind Pomeroy Kananaskis Mountain Lodge','no Banff shuttle inclusion','ordinary rain or snow','construction-specific provisions'],
  'kananaskis-return': ['food, water, warm/weatherproof layers','Save maps','Leave a trip plan','911','403-591-7767 for a satellite-phone emergency','wildlife-reporting line, 403-591-7755','return connection again','A village lodge and a separate road lodge are different bases','broad Banff searches, not Kananaskis rooms','affiliate links','may earn a commission'],
};
const walk = n => [n, ...(n.childNodes ?? []).flatMap(walk)], attr = (n, key) => n.attrs?.find(a => a.name === key)?.value;
const text = n => n.nodeName === '#text' ? n.value : (n.childNodes ?? []).map(text).join('');
const human = n => n.tagName === 'script' ? '' : n.nodeName === '#text' ? n.value : (n.childNodes ?? []).map(human).join(' ');
const plain = n => human(n).replace(/\s+/g, ' ').trim();
const forbidden = /fraction of the crowds|more grizzly encounters|grizzly encounters are more common|fewer crowds guaranteed|most striking larch display|last week of September (?:guarantees|is best)|Chester Lake is 10 km|Chester Lake is an easy winter walk|all fitness levels|suitable for everyone|safe winter route|\b(?:I|we) (?:visited|hiked|stayed|drove)|my last visit|\$\s*\d|\bCAD\s*\d|45[–-]90 minutes|all Kananaskis roads are open|all Highway 40 is closed|spa is open all winter|spa includes a Banff shuttle|all hotel stays include spa access|Banff pass covers Kananaskis parking|Parks Canada pass covers Kananaskis parking|guaranteed (?:views|reflections|wildlife|availability)|AggregateRating|ratingValue|priceRange/i;
function inspect(html, metadata = d.kananaskisDayGuideMetadata[slug]) {
  const tree = parseFragment(html), all = walk(tree), words = plain(tree).split(/\s+/).length;
  assert.ok(words >= 1500 && words <= 2350, 'Substantial bounded guide, actual rendered words: ' + words);
  assert.ok(!forbidden.test(plain(tree)), 'No old crowd/colour/price/fitness/safety/drive/booking claim');
  assert.ok(!/PRIVATE_READER|PRIVATE_CLICK/.test(html), 'No request data leaks into sources or booking links');
  assert.deepEqual(Object.keys(metadata).sort(), ['title','description','lastUpdated','readTime','imageIsIllustrative','imageNote'].sort());
  assert.equal(metadata.lastUpdated, '2026-10-29'); assert.equal(metadata.imageIsIllustrative, true); assert.match(metadata.imageNote, /Illustrative image; not verified/);
  const ids = all.map(n => attr(n, 'id')).filter(Boolean); assert.equal(ids.length, new Set(ids).size);
  const headings = all.filter(n => n.tagName === 'h2'), anchors = all.filter(n => n.tagName === 'a');
  const section = id => { const heading = headings.find(n => attr(n, 'id') === id); assert.ok(heading, 'Actual section ' + id); const start = html.indexOf(`id="${id}"`), from = html.indexOf('</h2>', start) + 5, until = html.indexOf('<h2', from); return plain(parseFragment(html.slice(from, until === -1 ? html.length : until))); };
  for (const [id, markers] of Object.entries(sections)) for (const marker of markers) assert.ok(section(id).toLowerCase().includes(marker.toLowerCase()), id + ': ' + marker);
  assert.ok(all.some(n => n.tagName === 'nav' && attr(n, 'aria-label') === 'Kananaskis day guide sections'));
  const tables = all.filter(n => n.tagName === 'table'); assert.equal(tables.length, 2);
  assert.equal(walk(tables[0]).filter(n => n.tagName === 'tr').length, 6); assert.equal(walk(tables[1]).filter(n => n.tagName === 'tr').length, 5);
  for (const table of tables) assert.equal(walk(table).filter(n => n.tagName === 'caption').length, 1);
  const profiles = [
    ['Wedge Pond','1 km return','Easy','summer hiking'],['Rawson Lake','3.9 km one way','320 m elevation'],['Chester Lake','4.6 km one way','300 m elevation','May 1–June 29'],['Ptarmigan Cirque Interpretive','4.5 km as listed','210 m elevation','Highwood Meadows'],
  ];
  const rows = walk(tables[1]).filter(n => n.tagName === 'tr').slice(1);
  for (const [i, markers] of profiles.entries()) for (const marker of markers) assert.ok(plain(rows[i]).includes(marker), 'Distinct summer profile row: ' + marker);
  for (const href of [...expectedSources,...referrals,...routes]) assert.ok(anchors.some(n => attr(n, 'href') === href), 'Exact direct/native handoff: ' + href);
  for (const a of anchors) {
    const href = attr(a, 'href'); assert.ok(href); assert.equal(walk(a).filter(n => n.tagName === 'a').length, 1);
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), 'Working fragment ' + href);
    else if (href.startsWith('/')) assert.ok(routes.includes(href), 'Identified local journey ' + href);
    else { assert.equal(new URL(href).protocol, 'https:'); assert.ok([...expectedSources,...referrals].includes(href), 'Only checked source/native-referral identities'); assert.equal(attr(a, 'target'), '_blank'); const rel = (attr(a, 'rel') ?? '').split(/\s+/); assert.ok(rel.includes('noopener')); assert.equal(rel.includes('sponsored'), referrals.includes(href)); }
  }
  const details = all.filter(n => n.tagName === 'details'), scripts = all.filter(n => n.tagName === 'script'); assert.equal(details.length, 5); assert.equal(scripts.length, 1); assert.equal(attr(scripts[0], 'type'), 'application/ld+json'); assert.equal(attr(scripts[0], 'src'), undefined);
  const schema = JSON.parse(text(scripts[0])); assert.equal(schema['@type'], 'FAQPage'); assert.equal(schema['@context'], 'https://schema.org'); assert.equal(schema.mainEntity.length, 5);
  for (const [i, faq] of d.kananaskisDayGuideFaqs.entries()) { assert.equal(plain(details[i].childNodes.find(n => n.tagName === 'summary')), faq.question); assert.equal(plain(details[i].childNodes.find(n => n.tagName === 'p')), faq.answer); assert.deepEqual(schema.mainEntity[i], { '@type':'Question', name:faq.question, acceptedAnswer:{ '@type':'Answer', text:faq.answer } }); }
  assert.ok(!all.some(n => ['form','input','button','iframe','img','object','embed'].includes(n.tagName) || n.attrs?.some(a => /^on/i.test(a.name))), 'No data fields, inline client or provider embed');
  return words;
}
assert.equal(d.reviewDate, '2026-10-29'); assert.deepEqual(Object.keys(d.kananaskisDayGuideOverrides), [slug]); assert.deepEqual(Object.keys(d.kananaskisDayGuideMetadata), [slug]); assert.equal(d.kananaskisDayGuideFaqs.length, 5);
assert.deepEqual(Object.values(d.kananaskisDayGuideSources).sort(), expectedSources.slice().sort());
assert.equal(d.originalPosts.find(post => post.slug === slug)?.date, '2025-12-11'); assert.equal(d.blogRedirects[slug], undefined); assert.equal(Object.values(d.blogRedirects).filter(target => target === slug).length, 0);
const rawBody = (await read('src/data/blogContent.ts')).split("'" + slug + "': `")[1]?.split('\n`,')[0]; assert.ok(rawBody); assert.ok(!/\bid=["']/.test(rawBody)); assert.deepEqual([...rawBody.matchAll(/href="([^"]*(?:camref=|partner_id=)[^"]*)"/g)].map(m => m[1]), referrals);
for (const route of routes) { const pathname = new URL(route, 'https://banffbound.com').pathname.replace(/\/$/, ''); if (pathname.startsWith('/blog/')) assert.ok(d.originalPosts.some(post => post.slug === pathname.slice(6))); else if (pathname.startsWith('/towns/')) await access(path.join(root, 'src/pages/towns/[slug].astro')); else { let found=false; for (const file of [pathname+'.astro',pathname+'/index.astro']) try { await access(path.join(root,'src/pages',file)); found=true; } catch {} assert.ok(found, 'Real local route: ' + route); } }
const sourceBody = d.kananaskisDayGuideOverrides[slug];
const fragment = await transform('---\n---\n'+sourceBody, { filename:slug+'.astro' }); assert.deepEqual(fragment.diagnostics.filter(v => v.severity === 1), []);
const compiled = await transform('---\nconst {body}=Astro.props;\n---\n<article><Fragment set:html={body}/></article>', { filename:path.join(root,'kananaskis-guide-check.astro') });
assert.deepEqual(compiled.diagnostics.filter(item => item.severity === 1), []);
const compiledCode = compiled.code.replace(/,\s*createMetadata as \$\$createMetadata/, '').replace(/export const \$\$metadata =[\s\S]*?\n(?=const \$\$Astro)/, '');
const require = createRequire(import.meta.url), renderer = await build({ stdin:{contents:compiledCode,loader:'ts',resolveDir:root},bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'astro-runtime',setup(b){b.onResolve({filter:/^astro\//},a=>({path:pathToFileURL(require.resolve(a.path)).href,external:true}));}}] });
const Page = (await import('data:text/javascript;base64,'+Buffer.from(renderer.outputFiles[0].text).toString('base64'))).default;
const container = await experimental_AstroContainer.create(), html = await container.renderToString(Page,{props:{body:sourceBody},request:new Request('https://banffbound.com/blog/'+slug+'/?email=PRIVATE_READER&gclid=PRIVATE_CLICK')});
const words = inspect(html); let negatives = 0;
const reject = (from,to,label) => { const changed=html.replace(from,to); assert.notEqual(changed,html,'Mutation changes actual rendered output: '+label); assert.throws(()=>inspect(changed),label); negatives++; };
for (const [from,to,label] of [
  ['closed December 1–June 14','closed October 1–April 30','Highwood dates'],['Peter Lougheed Provincial Park to Highwood House Junction','all of Highway 40','Highwood scope'],['map and exemptions','all vehicles everywhere','Pass scope'],['separate from Parks Canada admission','included in Parks Canada admission','National/provincial pass conflation'],
  ['3.9 km one way','3.9 km return','Rawson units'],['4.6 km one way','10 km return','Chester metric'],['4.5 km as listed','9 km one way','Ptarmigan units'],['May 1–June 29','November 1–June 14','Chester drying closure'],
  ['Those dates conflict; reopening is not confirmed here','The spa has reopened and all facilities are available','Dated spa conflict'],['18-plus facility','all-ages facility','Spa age'],['no Banff shuttle inclusion','complimentary Banff shuttle inclusion','Spa transfer'],['not a fully indoor bad-weather refuge','a fully indoor bad-weather refuge','Outdoor spa'],['reached by stairs','reached without stairs','Spa access'],
  ['403-591-7767 for a satellite-phone emergency','403-762-4506 for a satellite-phone emergency','Wrong park contact'],['three-resort lesson and ski-day tools do not cover Nakiska','three-resort lesson and ski-day tools include Nakiska','Wrong resort coverage'],['not evidence of a Banff pickup','confirmation of a Banff pickup','Transport origin'],
  ['broad Banff searches, not Kananaskis rooms','confirmed Kananaskis rooms','Authored affiliate scope'],['destination=Banff%2C+Alberta','destination=Kananaskis%2C+Alberta','Preserved ID with wrong authored destination'],['partner_id=QW960HO','partner_id=WRONG','GYG identity'],['camref=1101l3MtWX','camref=WRONG','Expedia identity'],
  ['href="#kananaskis-spa"','href="#missing"','Broken anchor'],[expectedSources[0],'https://example.invalid/roads','Primary source swapped'],['<summary>'+d.kananaskisDayGuideFaqs[0].question,'<summary>A changed question','Visible FAQ divergence'],['<p>'+d.kananaskisDayGuideFaqs[0].answer,'<p>A changed answer','Visible answer divergence'],
]) reject(from,to,label);
for (const claim of ['Chester Lake is 10 km return.','This is the most striking larch display.','The last week of September guarantees colour.','Suitable for everyone and all fitness levels.','The spa is open all winter.','A spa includes a Banff shuttle.','All hotel stays include spa access.','A Banff pass covers Kananaskis parking.','We visited last week.','The drive takes45–90 minutes.','The pass costs $15.','A safe winter route with guaranteed wildlife.']) { assert.throws(()=>inspect(html+'<p>'+claim+'</p>')); negatives++; }
for (const attack of ['<input name="health">','<script src="https://example.invalid/vendor.js"></script>','<a href="javascript:alert(1)">Open</a>','<a href="#kananaskis-spa" onclick="alert(1)">Spa</a>']) { assert.throws(()=>inspect(html+attack)); negatives++; }
assert.throws(()=>inspect(html,{...d.kananaskisDayGuideMetadata[slug],date:'2026-10-29'})); negatives++;
assert.throws(()=>inspect(html,{...d.kananaskisDayGuideMetadata[slug],imageIsIllustrative:false})); negatives++;
const note=await read('research/kananaskis-day-guide-sources-2026-10-29.md');for (const marker of [...expectedSources,...referrals,'2025-12-11','no fragment IDs','no inbound aliases','2016 map edition','Oct28','Oct30','No unverified specific product routes','not a live']) assert.ok(note.includes(marker),'Evidence/source-limit record: '+marker);
console.log(`Kananaskis guide passed: ${words} actual Astro-rendered words; raw2025-12-11 publication,19primary URLs,2exact inherited Banff referrals,4distinct summer profiles/2tables,5matching visible/schema FAQs,${negatives}material negative fixtures. No network, registry count assumption, build, Git or files written.`);
