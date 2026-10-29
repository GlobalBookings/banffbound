import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';
import { build } from 'esbuild';
import { transform as transformAstro } from '@astrojs/compiler';

const consentApi = await import('../src/scripts/consent.js');
assert.equal(consentApi.CONSENT_MAX_AGE_MS, 365 * 24 * 60 * 60 * 1000);
assert.ok(consentApi.CONSENT_VERSION >= 2);
for (const name of ['getConsent', 'hasConsent', 'subscribeConsent']) assert.equal(typeof consentApi[name], 'function');

// Execute the real embed controller with a consent API stand-in. No vendor/network.
const controller = await build({ entryPoints: ['src/scripts/affiliateEmbeds.js'], bundle: true, write: false, platform: 'browser', format: 'cjs', plugins: [{ name: 'consent-fixture', setup(builder) {
  builder.onResolve({ filter: /\/consent\.js$/ }, () => ({ path: 'consent-fixture', namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: "export const hasConsent=(category)=>globalThis.fixtureConsent.has(category); export const subscribeConsent=(callback)=>globalThis.fixtureConsent.subscribe(callback);" }));
} }] });
function harness(kinds, initial = false) {
  let affiliate = initial, throws = false, subscriptions = 0;
  const subscribers = [], listeners = {}, nodes = [], assignments = [], appends = [];
  function node(tag = 'div') {
    const value = { tag, dataset: {}, attributes: {}, children: [], parentNode: null, hidden: false, isConnected: true, textContent: '', className: '', onload: null, onerror: null,
      setAttribute(name, text) { this.attributes[name] = text; },
      appendChild(child) { this.children.push(child); child.parentNode = this; child.isConnected = true; appends.push({ tag: child.tag, affiliate }); return child; },
      replaceChildren(...children) { for (const child of this.children) { child.isConnected = false; child.parentNode = null; } this.children = []; for (const child of children) this.appendChild(child); },
      remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; this.isConnected = false; for (const child of this.children) child.isConnected = false; },
    };
    Object.defineProperty(value, 'src', { get() { return this.attributes.src; }, set(url) { assignments.push({ url, affiliate }); this.attributes.src = url; } });
    nodes.push(value); return value;
  }
  const slots = kinds.map(kind => {
    const slot = node(); slot.dataset.affiliateEmbed = kind;
    const mount = node(), status = node('p'); mount.hidden = true;
    const fallback = { href: 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO&cmp=banffboundblog', target: '_blank' };
    slot.querySelector = selector => selector === '[data-affiliate-mount]' ? mount : selector === '[data-affiliate-status]' ? status : null;
    return Object.assign(slot, { mount, status, fallback });
  });
  const body = node('body');
  const document = { body, createElement: node, querySelectorAll(selector) { assert.equal(selector, '[data-affiliate-embed]'); return slots.filter(slot => slot.isConnected); }, addEventListener(event, handler) { (listeners[event] ??= []).push(handler); } };
  const context = { module: { exports: {} }, exports: {}, document, fixtureConsent: { has(category) { assert.equal(category, 'affiliate'); if (throws) throw Error('Unavailable consent storage'); return affiliate; }, subscribe(callback) { subscriptions++; subscribers.push(callback); return () => {}; } } };
  context.exports = context.module.exports;
  vm.runInNewContext(controller.outputFiles[0].text, context);
  return { init: () => context.module.exports.initAffiliateEmbeds(), slots, body, assignments, appends, nodes, get subscriptions() { return subscriptions; },
    emit(next) { affiliate = next; subscribers.forEach(subscriber => subscriber({ analytics: true, advertising: true, affiliate: next })); },
    event(name) { (listeners[name] ?? []).forEach(handler => handler()); },
    denyWithError() { throws = true; }, scripts() { return body.children.filter(child => child.tag === 'script'); },
  };
}
const blog = harness(['expedia-banner', 'gyg-auto']);
const fallbacks = JSON.stringify(blog.slots.map(slot => slot.fallback));
blog.init(); blog.init(); blog.event('astro:page-load'); blog.emit(false);
assert.equal(blog.subscriptions, 1);
assert.equal(blog.assignments.length, 0, 'No external script src is even assigned without affiliate permission.');
assert.equal(blog.slots.reduce((sum, slot) => sum + slot.mount.children.length, 0), 0, 'No provider targets/frames before consent.');
blog.emit(true);
assert.equal(blog.scripts().length, 2);
assert.ok(blog.assignments.every(assignment => assignment.affiliate));
assert.ok(blog.appends.every(append => append.affiliate));
const expedia = blog.slots[0].mount.children[0], gyg = blog.slots[1].mount.children[0];
assert.equal(expedia.className, 'eg-affiliate-banners');
assert.deepEqual({ ...expedia.attributes }, { 'data-program': 'ca-expedia', 'data-network': 'pz', 'data-layout': 'leaderboard', 'data-image': 'mountains', 'data-message': 'bye-bye-bucket-list-hello-adventure', 'data-camref': '1101l3MtWX', 'data-pubref': '', 'data-link': 'home' });
assert.deepEqual({ ...gyg.attributes }, { 'data-gyg-widget': 'auto', 'data-gyg-partner-id': 'QW960HO', 'data-gyg-cmp': 'banffboundblog' });
assert.equal(blog.scripts().find(script => script.dataset.affiliateLoader === 'expedia').src, 'https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js');
assert.equal(blog.scripts().find(script => script.dataset.affiliateLoader === 'getyourguide').src, 'https://widget.getyourguide.com/dist/pa.umd.production.min.js');
for (let i = 0; i < 3; i++) { blog.init(); blog.event('astro:page-load'); blog.emit(true); }
assert.equal(blog.scripts().length, 2); assert.equal(blog.assignments.length, 2, 'No duplicate SDK loaders after repeated init/change/page-load.');
assert.equal(blog.slots[0].mount.children.length, 1); assert.equal(blog.slots[1].mount.children.length, 1);
const lateLoad = blog.scripts()[0].onload;
blog.scripts()[1].onerror();
assert.match(blog.slots[1].status.textContent, /could not load/);
assert.equal(JSON.stringify(blog.slots.map(slot => slot.fallback)), fallbacks, 'A failed vendor cannot change native referral links/targets.');
// Simulate a vendor-created child frame, which must disappear with its owned target.
const childFrame = { isConnected: true }; expedia.children.push(childFrame);
const replacedFrame = { isConnected: true }; gyg.remove(); blog.slots[1].mount.children.push(replacedFrame);
blog.emit(false);
assert.equal(blog.scripts().length, 0); assert.ok(blog.slots.every(slot => slot.mount.children.length === 0 && slot.mount.hidden));
assert.equal(childFrame.isConnected, false);
assert.equal(replacedFrame.isConnected, false, 'Remove vendor frames even if the SDK replaced its original target.');
assert.ok(blog.slots.every(slot => slot.dataset.affiliateState === 'blocked'));
lateLoad(); assert.ok(blog.slots.every(slot => slot.status.textContent.includes('is off')));
assert.equal(JSON.stringify(blog.slots.map(slot => slot.fallback)), fallbacks);
blog.emit(true); assert.equal(blog.scripts().length, 2, 'A later explicit grant can mount a fresh set.');
blog.event('astro:before-swap'); assert.equal(blog.scripts().length, 0);
blog.event('astro:page-load'); assert.equal(blog.scripts().length, 2);
blog.denyWithError(); blog.event('astro:page-load'); assert.equal(blog.scripts().length, 0, 'Consent API errors fail closed.');

const tours = harness(['gyg-activities'], true);
tours.init(); assert.equal(tours.scripts().length, 1, 'A valid pre-existing affiliate choice works before consent UI initialization.');
assert.equal(tours.scripts()[0].src, 'https://widget.getyourguide.com/dist/pa.umd.min.js');
assert.equal(tours.scripts()[0].attributes['data-gyg-partner-id'], 'QW960HO');
assert.deepEqual({ ...tours.slots[0].mount.children[0].attributes }, { 'data-gyg-href': 'https://widget.getyourguide.com/default/activities.frame', 'data-gyg-location-id': '284', 'data-gyg-locale-code': 'en-US', 'data-gyg-widget': 'activities', 'data-gyg-number-of-items': '9', 'data-gyg-partner-id': 'QW960HO' });
tours.emit(false); assert.equal(tours.scripts().length, 0);
const unknown = harness(['__proto__', 'constructor', 'https://example.com/tracker.js'], true);
unknown.init(); assert.equal(unknown.assignments.length, 0, 'Unrecognised DOM configuration cannot supply a provider URL.');

const paths = ['src/layouts/BlogLayout.astro', 'src/pages/tours.astro', 'src/components/Footer.astro', 'src/pages/privacy.astro'];
const pages = await Promise.all(paths.map(filename => readFile(filename, 'utf8')));
for (let i = 0; i < pages.length; i++) {
  const result = await transformAstro(pages[i], { filename: paths[i] });
  assert.deepEqual(result.diagnostics.filter(diagnostic => diagnostic.severity === 1), [], paths[i]);
  assert.ok(!/<(?:script|iframe)\b[^>]*\bsrc\s*=\s*["']https?:/i.test(pages[i]), 'Assigned templates contain no automatic external script/frame.');
}
for (const page of pages.slice(0, 2)) {
  assert.ok(page.includes('initAffiliateEmbeds()') && page.includes('data-affiliate-embed=') && page.includes('data-affiliate-mount hidden'));
  assert.ok(!/\bdata-gyg-widget=|class="eg-affiliate-banners"/.test(page), 'Vendor scanner targets only appear after permission.');
  assert.ok(page.includes('partner_id=') && page.includes('sponsored') && page.includes('direct link'));
}
assert.ok(pages[0].includes('camref=1101l3MtWX') && pages[0].includes('cmp=banffboundblog'));
const blogFrontmatter = pages[0].split('---')[1].replace(/^import .*;\s*$/gm, '');
for (const illustrative of [false, true]) {
  const props = { title: 'Fixture route', description: 'Fixture description', date: '2026-10-29', category: 'Hiking', image: '/images/fixture.jpg', readTime: '5 min', slug: 'fixture-route', ...(illustrative ? { imageIsIllustrative: true, imageNote: 'Illustrative stock; route identity unverified.' } : {}) };
  const compiled = await build({ stdin: { contents: `const Astro={props:${JSON.stringify(props)}}; const blogPosts=[];\n${blogFrontmatter}\nexport {articleSchema,imageIsIllustrative,imageNote};`, loader: 'ts' }, write: false, platform: 'node', format: 'cjs' });
  const context = { module: { exports: {} }, exports: {}, URL }; context.exports = context.module.exports;
  vm.runInNewContext(compiled.outputFiles[0].text, context);
  assert.equal(Object.hasOwn(context.module.exports.articleSchema, 'image'), !illustrative, 'Illustrative route photos must be absent from Article schema.');
  assert.equal(context.module.exports.imageIsIllustrative, illustrative, 'Default remains false for other guides.');
}
assert.ok(pages[0].includes('alt={imageIsIllustrative ?') && pages[0].includes('image={imageIsIllustrative ? undefined : image}') && pages[0].includes('{imageNote ||'));
assert.ok(pages[2].includes('type="button" data-open-consent'));
for (const page of [pages[0], pages[2]]) for (const value of ['u=38050436b38afb17f1b30580a', 'id=c419fe73a6', 'f_id=002699e0f0']) assert.ok(page.includes(value), 'Native newsletter form identifiers retained.');
const tourData = pages[1].split('---')[1].replace(/^import .*;\s*$/gm, '') + '\nexport {featuredTours,categories};';
const tourBuild = await build({ stdin: { contents: tourData, loader: 'ts' }, write: false, platform: 'node', format: 'cjs' });
const tourContext = { module: { exports: {} }, exports: {} }; tourContext.exports = tourContext.module.exports;
vm.runInNewContext(tourBuild.outputFiles[0].text, tourContext);
const { featuredTours, categories } = tourContext.module.exports;
assert.equal(featuredTours.length, 6); assert.equal(categories.length, 6);
for (const record of [...featuredTours, ...categories]) assert.equal(new URL(record.gygUrl ?? record.url).searchParams.get('partner_id'), 'QW960HO');
assert.ok(featuredTours[0].gygUrl.includes('t113074/')); assert.ok(featuredTours[2].gygUrl.includes('t441813/'));
for (const tour of featuredTours) { assert.ok(tour.linkLabel); for (const removed of ['price', 'rating', 'duration']) assert.equal(tour[removed], undefined); }
assert.ok(!/free cancellation|skip-the-line|Top Rated|From \$/.test(pages[1]));
assert.ok(pages[3].includes('365 days') && pages[3].includes('localStorage') && pages[3].includes('bb-cookie-consent') && pages[3].includes('Privacy choices'));
assert.ok(pages[3].includes(consentApi.CONSENT_KEY), 'Privacy storage name matches shared core.');
assert.ok(pages[3].includes('requests already sent') && pages[3].includes('do not block every third-party request') && pages[3].includes('The link still opens the provider'));
assert.ok(!/anonymised data|retained for 14 months|Continued use of the site|<td>_gid<\/td>/.test(pages[3]));
const source = await readFile('src/scripts/affiliateEmbeds.js', 'utf8');
assert.ok(!/preventDefault|window\.open|location\s*=|innerHTML|srcdoc|document\.write/.test(source), 'Controller does not intercept native navigation or inject untrusted markup.');
// Find new raw affiliate loaders/frames anywhere under src, not just the assigned pages.
async function audit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await audit(filename);
    else if (/\.(?:astro|html)$/.test(entry.name)) {
      const contents = await readFile(filename, 'utf8');
      assert.ok(!/<(?:script|iframe)\b[^>]*\bsrc\s*=\s*["']https?:\/\/(?:creator\.expediagroup\.com|widget\.getyourguide\.com)/i.test(contents), `Ungated affiliate surface: ${filename}`);
    }
  }
}
await audit('src');
console.log('Affiliate embed checks passed: denied/stored/selective consent, exact provider IDs/config/loaders, duplicate-init guards, failure fallback, synchronous revocation/late callbacks, regrant/page lifecycle, four Astro transforms, native referral/newsletter contracts, illustrative Article image scope, tours labels and privacy/core markers. No network or site build.');
