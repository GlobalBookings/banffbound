import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';
import { transform } from '@astrojs/compiler';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const load = relative => { const module = { exports: {} }; new Function('module', 'exports', transformSync(read(relative), { loader: 'ts', format: 'cjs' }).code)(module, module.exports); return module.exports; };
const { rentals, vrboAffiliateUrl, rentalImportProvenance } = load('src/data/rentals.ts');
const planning = load('src/data/rentalPlanning.ts');
const page = read('src/pages/vacation-rentals/index.astro');
let assertions = 0;
const check = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
check(rentals.length === 50 && new Set(rentals.map(r => r.slug)).size === 50, 'Provider inventory/slug identities changed');
const identityHash = createHash('sha256').update(JSON.stringify(rentals.map(r => [r.slug, r.name, r.vrboUrl, r.expediaId, r.image]))).digest('hex');
check(identityHash === '43a366153e55477496a1401dc415a308a4ff3fba5cbb9237892db8ee4afc2690', 'Provider identities/targets/photos changed without evidence update');
for (const rental of rentals) {
  const url = new URL(vrboAffiliateUrl(rental.vrboUrl));
  check(url.hostname === 'vrbo.com' && url.pathname === '/affiliate', 'Affiliate endpoint changed');
  check(url.searchParams.get('landingPage') === rental.vrboUrl, 'Provider target mutated by wrapper');
  check(url.searchParams.get('camref') === '1101l3MtWL' && url.searchParams.get('creativeref') === '1011l63087' && url.searchParams.get('adref') === 'PZBJVX1Er0', 'VRBO tracking changed');
  check(rental.lat === null && rental.lng === null && rental.coordinateStatus === 'unavailable', 'Fabricated property coordinates exposed');
  check(rental.verificationStatus === 'historical-provider-import' && rental.providerDetailsCheckedOn === null, 'Import promoted to current verification');
  check(!['rating','reviewCount','priceFrom','premierHost','description','highlights'].some(key => key in rental), 'Unsupported generated claim exported');
}
for (const id of ['904421', '3845', '74883714']) check(rentals.find(r => r.expediaId === id).vrboUrl === 'https://www.vrbo.com/en-ca/pdp/lo/' + id, 'Source-backed managed-property route correction lost');
for (const unsafe of ['javascript:alert(1)', 'http://www.vrbo.com/p1', 'https://vrbo.com.evil.example/p1']) {
  let threw = false; try { vrboAffiliateUrl(unsafe); } catch { threw = true; } check(threw, 'Unsafe provider target accepted');
}
check(rentalImportProvenance.capturedAt === null, 'Unknown source capture date invented');
check(rentals.filter(r => r.importedSleeps === null).length === 1, 'Missing capacity defaulted');
check(rentals.filter(r => r.importedBedrooms === null).length === 11, 'Missing bedrooms made into studios');
check(rentals.filter(r => r.importedBathrooms === null).length === 4, 'Missing bathroom count defaulted');
check(rentals.filter(r => r.type === null).length === 1, 'Missing property type invented');
for (const option of planning.reviewedRentalOptions) {
  check(option.links.length > 0 && option.links[0].href.startsWith('https://'), 'Reviewed option has no primary source');
  check(option.providerId === null || rentals.some(r => r.expediaId === option.providerId), 'Shortlist points to invented provider property');
}

class Element {
  constructor(dataset = {}) { this.dataset = dataset; this.value = 'all'; this.options = []; this.events = {}; this.hidden = false; this.textContent = ''; }
  addEventListener(name, handler) { this.events[name] = handler; }
  fire(name) { this.events[name]?.(); }
}
const client = page.match(/<script is:inline>\s*([\s\S]*?)<\/script>/)[1];
function setup(query = '') {
  const ids = Object.fromEntries(['plan-base','plan-need','plan-transport','plan-reset','plan-result','option-empty','planning-controls','lead-search','lead-base','lead-type','lead-guests','lead-bedrooms','lead-reset','lead-count','lead-empty','lead-controls'].map(id => [id,new Element()]));
  const choices = {
    'plan-base':['all',...planning.rentalBaseGuides.map(b => b.id)], 'plan-need':['all','separate-bedrooms','loft','laundry'], 'plan-transport':['all','without-car','with-car'],
    'lead-base':['all',...new Set(rentals.map(r => r.base))], 'lead-type':['all',...new Set(rentals.map(r => r.type).filter(Boolean)),'unknown'], 'lead-guests':['all','2','4','6','8','unknown'], 'lead-bedrooms':['all','1','2','3','unknown'],
  };
  for (const [id, values] of Object.entries(choices)) ids[id].options = values.map(value => ({ value }));
  ids['lead-search'].value = ''; ids['planning-controls'].hidden = ids['lead-controls'].hidden = true;
  const guides = planning.rentalBaseGuides.map(base => new Element({ base:base.id }));
  const options = planning.reviewedRentalOptions.map(option => new Element({ base:option.base, tags:option.tags.join(' '), id:option.id }));
  const transport = planning.rentalBaseGuides.flatMap(() => [new Element({transport:'without-car'}),new Element({transport:'with-car'})]);
  const leads = rentals.map(r => new Element({name:r.name.toLowerCase(),area:(r.area || '').toLowerCase(),base:r.base,type:r.type || 'unknown',sleeps:String(r.importedSleeps ?? ''),bedrooms:String(r.importedBedrooms ?? ''),id:r.expediaId}));
  const baseLinks = planning.rentalBaseGuides.filter(b => b.id !== 'canmore').map(b => new Element({chooseBase:b.id}));
  const selectors = {'[data-base-guide]':guides,'[data-option]':options,'[data-transport]':transport,'[data-rental]':leads,'[data-choose-base]':baseLinks};
  vm.runInNewContext(client, {document:{getElementById:id => ids[id],querySelectorAll:selector => selectors[selector]},window:{location:{search:query}},URLSearchParams,Number,Array});
  return {ids,guides,options,transport,leads,baseLinks,choose(id,value) { ids[id].value = value; ids[id].fire(id === 'lead-search' ? 'input' : 'change'); }};
}
const visible = elements => elements.filter(el => !el.hidden);
const ui = setup();
check(visible(ui.guides).length === 4 && visible(ui.options).length === 4 && visible(ui.leads).length === 50, 'Default content incomplete');
check(!ui.ids['planning-controls'].hidden && !ui.ids['lead-controls'].hidden, 'Ready controls not revealed');
ui.choose('plan-base','canmore');ui.choose('plan-need','laundry');
check(visible(ui.guides).length === 1 && visible(ui.options)[0]?.dataset.id === 'blackstone', 'Canmore laundry comparison wrong');
ui.choose('plan-base','harvie-heights');
check(visible(ui.guides).length === 1 && visible(ui.options).length === 0 && !ui.ids['option-empty'].hidden, 'No-source-option state hides useful base guide');
ui.choose('plan-transport','without-car');check(visible(ui.transport).length === 4 && visible(ui.transport).every(n => n.dataset.transport === 'without-car'), 'Transport mode mismatch');
ui.ids['plan-reset'].fire('click');check(visible(ui.guides).length === 4 && visible(ui.options).length === 4 && visible(ui.transport).length === 8, 'Planner reset incomplete');
ui.choose('lead-guests','4');
check(!visible(ui.leads).some(l => l.dataset.sleeps === ''), 'Minimum party filter includes unknown capacity');
check(visible(ui.leads).some(l => l.dataset.id === '67592255'), 'Party-four filter wrongly excludes eight-capacity lead');
ui.choose('lead-guests','unknown');check(visible(ui.leads).length === 1 && visible(ui.leads)[0].dataset.id === '91870309', 'Missing capacity invented or hidden');
ui.ids['lead-reset'].fire('click');ui.choose('lead-bedrooms','unknown');check(visible(ui.leads).length === 11, 'Unknown bedrooms filter broken');
ui.ids['lead-reset'].fire('click');ui.choose('lead-type','unknown');check(visible(ui.leads).length === 1, 'Unknown type filter broken');
ui.ids['lead-reset'].fire('click');ui.baseLinks.find(link => link.dataset.chooseBase === 'harvie-heights').fire('click');check(visible(ui.leads).length === 26, 'Base-guide jump fails listing filter');
ui.choose('lead-search','no such listing');check(visible(ui.leads).length === 0 && !ui.ids['lead-empty'].hidden, 'Empty listing state missing');
ui.ids['lead-reset'].fire('click');check(visible(ui.leads).length === 50 && ui.ids['lead-empty'].hidden, 'Listing reset incomplete');
const valid = setup('?area=Harvie%20Heights&type=House&guests=6&bedrooms=2');
check(visible(valid.guides).length === 1 && visible(valid.leads).length > 0 && visible(valid.leads).every(l => l.dataset.base === 'harvie-heights' && l.dataset.type === 'House' && Number(l.dataset.sleeps) >= 6 && Number(l.dataset.bedrooms) >= 2), 'Combined URL filters wrong');
const invalid = setup('?base=elsewhere&type=Boat&guests=garbage&bedrooms=-1&need=pool&transport=plane');
check(visible(invalid.guides).length === 4 && visible(invalid.options).length === 4 && visible(invalid.leads).length === 50, 'Invalid URL filters change result state');

const compiled = await transform(page, {filename:'src/pages/vacation-rentals/index.astro'});
check(compiled.diagnostics.length === 0, 'Astro diagnostics: ' + JSON.stringify(compiled.diagnostics));
check(page.includes('<noscript>') && page.includes('rentals.map(rental =>') && page.includes('rentalBaseGuides.map(base =>') && page.includes('options.map(option =>'), 'Complete no-JS source content missing');
check(!page.includes('rentalData') && !page.includes('leaflet') && !page.includes('priceFrom') && !page.includes('premierHost') && !page.includes('reviewCount'), 'Legacy generated claim path remains');
check(page.includes('rel="noopener sponsored"') && page.indexOf('Vrbo links are affiliate links') < page.indexOf('Compare the listing on Vrbo'), 'Affiliate disclosure/relationship missing before first CTA');
for (const href of [...page.matchAll(/href="(\/[^"?#]*)/g)].map(m => m[1])) check(fs.existsSync(path.join(root,'src/pages',href+'.astro')) || fs.existsSync(path.join(root,'src/pages',href,'index.astro')), 'Broken internal page: '+href);
console.log(JSON.stringify({assertions,records:rentals.length,identityHash,sourceReviewedOptions:planning.reviewedRentalOptions.length,baseGuides:planning.rentalBaseGuides.length,syntheticPoints:0,compilerDiagnostics:compiled.diagnostics.length},null,2));
