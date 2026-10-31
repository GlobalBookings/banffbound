// Actual Astro booking components and controller; offline SSR and consent-independent native-link contracts.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import vm from "node:vm";
const root = process.cwd(), require2 = createRequire(path.join(root, "package.json"));
const { build, transform: transformJs } = await import(pathToFileURL(require2.resolve("esbuild")));
const { transform } = await import(pathToFileURL(require2.resolve("@astrojs/compiler")));
const { experimental_AstroContainer } = await import(pathToFileURL(require2.resolve("astro/container")));
const { parseFragment } = await import(pathToFileURL(require2.resolve("parse5")));
async function component(relative) {
  const result = await build({ stdin: { contents: `export {default} from './${relative}';`, resolveDir: root }, absWorkingDir: root, bundle: true, write: false, platform: "node", format: "esm", logLevel: "silent", plugins: [{ name: "actual-owned-components", setup(b) {
    b.onResolve({ filter: /^astro\// }, (a) => ({ path: pathToFileURL(require2.resolve(a.path)).href, external: true }));
    b.onResolve({ filter: /(?:\?astro&type=style|\.css$)/ }, (a) => ({ path: a.path, namespace: "inert-style" }));
    b.onLoad({ filter: /.*/, namespace: "inert-style" }, () => ({ contents: "export {};" }));
    b.onResolve({ filter: /\.astro$/ }, (a) => ({ path: path.resolve(a.resolveDir, a.path), namespace: "actual-astro" }));
    b.onLoad({ filter: /.*/, namespace: "actual-astro" }, async (a) => {
      const c = await transform(await readFile(a.path, "utf8"), { filename: a.path, internalURL: "astro/compiler-runtime", resultScopedSlot: true });
      assert.deepEqual(c.diagnostics.filter((x) => x.severity === 1), []);
      return { contents: c.code.replace(/,\s*createMetadata as \$\$createMetadata/, "").replace(/^export const \$\$metadata =[\s\S]*?\n(?=const \$\$)/m, ""), loader: "ts", resolveDir: path.dirname(a.path) };
    });
  } }] });
  return (await import("data:text/javascript;base64," + Buffer.from(result.outputFiles[0].text).toString("base64"))).default;
}
const data = await build({ stdin: { contents: "export * from './src/data/activityCampaignTargets.ts';export * from './src/data/articleBookingContext.ts';", resolveDir: root }, bundle: true, write: false, format: "esm", platform: "node" });
const m = await import("data:text/javascript;base64," + Buffer.from(data.outputFiles[0].text).toString("base64"));
const container = await experimental_AstroContainer.create();
const walk = (n) => [n, ...(n.childNodes || []).flatMap(walk)];
const at = (n, k) => n.attrs?.find((a) => a.name === k)?.value;
const text = (n) => n.nodeName === "#text" ? n.value : (n.childNodes || []).map(text).join("");
const Hotel = await component("src/components/HotelStaysBanner.astro");
for (const slug of ["ordinary-guide", "jasper-town", "canmore-day-trip", "numtijah-lodge", "golden-bc-day-trip"]) {
  const c = m.getArticleBookingContext(slug, true);
  const html = await container.renderToString(Hotel, { props: { href: c.hotelHref, destination: c.hotelLabel, guideId: slug } });
  const ns = walk(parseFragment(html));
  const anchor = ns.find((n) => at(n, "data-landing-placement") === "article-hotel-banner");
  assert.equal(at(anchor, "href"), c.hotelHref);
  assert.equal(at(anchor, "target"), "_blank");
  assert(at(anchor, "rel").includes("sponsored"));
  assert(html.includes("Compare hotel stays"));
  assert(html.includes("Optional partner content is off."));
  assert(ns.some((n) => at(n, "data-affiliate-mount") !== void 0 && at(n, "hidden") !== void 0));
  assert.equal(ns.filter((n) => n.tagName === "img").length, ["Banff", "Lake Louise area", "Canmore"].includes(c.hotelLabel) ? 1 : 0);
}
const Activity = await component("src/components/ActivityBookingCTA.astro");
let cases = 0;
function checkActivity(html, t, guideId) {
  const ns = walk(parseFragment(html));
  const links = ns.filter((n) => ["article-top", "article-mobile"].includes(at(n, "data-landing-placement")));
  assert.equal(links.length, 2);
  for (const link of links) {
    assert.equal(at(link, "href"), t.bookingUrl);
    assert(text(link).trim().startsWith(t.launchState === "held" ? "Find out more" : "Book now"), "Held products keep an information label.");
    assert.equal(at(link, "data-offer-id"), t.offerId);
    assert.equal(at(link, "data-activity-target-id"), t.id);
    assert.equal(at(link, "data-paid-affiliate-campaign"), t.paidCampaignLabel);
    assert.equal(at(link, "data-affiliate-target-path"), new URL(t.bookingUrl).pathname);
    assert.equal(at(link, "data-content-id"), guideId);
    assert.equal(at(link, "data-content-type"), "activity-guide");
    const notice = ns.find((n) => at(n, "id") === at(link, "aria-describedby"));
    assert(notice && text(notice) === t.seasonalNotice);
    assert(ns.indexOf(notice) < ns.indexOf(link));
  }
  const mobile = ns.find(n => at(n, "data-activity-booking-mobile") !== void 0);
  assert(mobile && at(mobile, "hidden") === void 0, "Native mobile bar is visible in SSR before any JavaScript or scrolling.");
  const mobileNodes = walk(mobile);
  const mobileLink = mobileNodes.find(n => n.tagName === "a");
  const dismiss = mobileNodes.find(n => n.tagName === "button");
  assert.equal(mobileNodes.filter(n => n.tagName === "a").length, 1);
  assert.equal(mobileNodes.filter(n => n.tagName === "button").length, 1);
  assert.equal(at(dismiss, "type"), "button");
  assert(at(dismiss, "aria-label"));
  assert.equal(text(mobile).replace(text(mobileLink), "").replace(text(dismiss), "").trim(), "", "Mobile bar has only CTA and dismiss text.");
  assert(!mobileNodes.some(n => /^(?:p|h[1-6])$/.test(n.tagName || "")), "Mobile has no duplicated heading, notice or provider paragraph.");
  const mainNotice = ns.find(n => at(n, "id") === at(mobileLink, "aria-describedby"));
  assert(mainNotice && !mobileNodes.includes(mainNotice), "Mobile description references the retained main notice.");
  assert(!/Hold paid ads|ad group|dedicated BanffBound activity guide|No actual departure or/.test(html), "Public workflow wording: " + t.id);
  assert(html.includes("Affiliate link."));
}
let fixture;
for (const target of m.activityCampaignTargets) {
  const t = m.resolveActivityBookingTarget(target.guidePath), guideId = target.guidePath.split("/").filter(Boolean).at(-1);
  const html = await container.renderToString(Activity, { props: { target: t, guideId } });
  checkActivity(html, t, guideId);
  fixture = { html, t, guideId };
  cases++;
}
for (const mutate of [(h) => h.replace(/data-offer-id="[^"]+"/, 'data-offer-id="wrong"'), (h) => h.replace(/data-paid-affiliate-campaign="[^"]+"/, ""), (h) => h.replace(/data-affiliate-target-path="[^"]+"/, 'data-affiliate-target-path="/s/"'), (h) => h.replace(/href="https:\/\/www\.getyourguide\.com[^"]+"/, 'href="https://evil.test/"'), (h) => h.replace("Affiliate link.", ""), (h) => h.replace("Make it part of your trip", "Hold paid ads"), (h) => h.replace(/(data-activity-booking-mobile[^>]*>)/, "$1<p>Extra mobile copy</p>"), (h) => h.replace("data-activity-booking-mobile", "data-activity-booking-mobile hidden")]) assert.throws(() => checkActivity(mutate(fixture.html), fixture.t, fixture.guideId));
const Blog = await component("src/layouts/BlogLayout.astro");
for (const slug of ["banff-gondola-guide", "jasper-town", "ordinary-banff-guide"]) {
  const props = { title: "SSR ownership fixture", description: "Fixture description", date: "2025-04-03", lastUpdated: "2026-10-29", category: "Guides", image: "/fixture.webp", imageIsIllustrative: true, imageNote: "Illustrative fixture", readTime: "5 min", slug, curatedBookingLinks: true };
  const html = await container.renderToString(Blog, { props, request: new Request("https://banffbound.com/blog/" + slug + "/?email=PRIVATE&gclid=PRIVATE&cmp=ATTACKER"), slots: { default: '<p id="owned-body-marker">Original guide body stays here.</p>' } });
  const ns = walk(parseFragment(html));
  assert(html.includes("Original guide body stays here."));
  assert(!html.includes("PRIVATE") && !html.includes("ATTACKER"));
  const schema = ns.filter((n) => n.tagName === "script" && at(n, "type") === "application/ld+json").map((n) => JSON.parse(text(n))).find((x) => x["@type"] === "Article");
  assert.equal(schema.datePublished, "2025-04-03T00:00:00.000Z");
  assert(!Object.hasOwn(schema, "image"));
  const c = m.getArticleBookingContext(slug, true);
  assert(ns.some((n) => n.tagName === "a" && at(n, "href") === c.hotelHref && at(n, "data-landing-placement") === "article-hotel-banner"));
  assert.equal(ns.filter((n) => at(n, "data-landing-placement") === "article-top").length, slug === "banff-gondola-guide" ? 1 : 0);
}
const source = await readFile("src/components/ActivityBookingCTA.astro", "utf8");
const js = (await transformJs(source.match(/<script>([\s\S]*?)<\/script>/)[1], { loader: "ts", format: "iife" })).code;
function client({ resizeObserver = true, missing = false } = {}) {
  let focuses = 0, height = 76, measured;
  const handlers = {}, events = {}, docEvents = {}, sizes = {};
  const dismiss = { hidden: true, addEventListener: (type, fn) => { handlers[type] = fn; } };
  const bar = { hidden: false, get offsetHeight() { return this.hidden ? 0 : height; } };
  const wrapper = { dataset: {}, querySelector: selector => {
    assert.notEqual(selector, "[data-activity-booking-panel]", "Initial CTA never waits for the article panel.");
    return selector === "[data-activity-booking-mobile]" ? missing ? null : bar : dismiss;
  } };
  const doc = {
    querySelectorAll: () => [wrapper],
    getElementById: () => ({ focus: options => { assert.equal(options.preventScroll, true); focuses++; } }),
    documentElement: { style: { setProperty: (key, value) => { sizes[key] = value; } } },
    addEventListener: (type, fn) => { docEvents[type] = fn; },
  };
  const win = { addEventListener: (type, fn) => { events[type] = fn; } };
  class ForbiddenIntersectionObserver { constructor() { throw Error("No IntersectionObserver is required for an initial CTA."); } }
  class RO { constructor(fn) { measured = fn; } observe() { measured(); } }
  if (resizeObserver) win.ResizeObserver = RO;
  vm.runInNewContext(js, { document: doc, window: win, IntersectionObserver: ForbiddenIntersectionObserver, ResizeObserver: RO });
  if (missing) { assert.equal(wrapper.dataset.ready, void 0); return; }
  assert.equal(bar.hidden, false, "CTA starts visible without scrolling or an observer callback.");
  assert.equal(dismiss.hidden, false);
  assert.equal(sizes["--activity-booking-bar-height"], "76px", "Initial height is measured immediately.");
  assert.equal(events.scroll, undefined);
  height = 104; events.resize();
  assert.equal(sizes["--activity-booking-bar-height"], "104px", "Resizing updates body/cookie spacing.");
  if (resizeObserver) { height = 112; measured(); assert.equal(sizes["--activity-booking-bar-height"], "112px"); }
  const click = handlers.click;
  docEvents["astro:page-load"]();
  assert.equal(handlers.click, click, "One dismiss handler after reinitialisation.");
  handlers.click();
  assert.equal(bar.hidden, true); assert.equal(focuses, 1);
  events.resize();
  assert.equal(bar.hidden, true, "Dismissal survives resize.");
  docEvents["astro:page-load"]();
  assert.equal(bar.hidden, true, "Reinitialising this document does not undo dismissal.");
}
client();
client({ resizeObserver: false });
client({ missing: true });
assert(source.includes("env(safe-area-inset-bottom)"));
for (const selector of ["activity-booking-link", "activity-mobile-link"]) assert(new RegExp("\\." + selector + "\\{[^}]*background:#b34d23").test(source), "Both booking buttons retain the requested orange treatment.");
assert(/body:has\(\[data-activity-booking-mobile\]:not\(\[hidden\]\)\) #cookie-banner/.test(source));
assert(source.includes('bottom:calc(var(--activity-booking-bar-height,calc(76px + env(safe-area-inset-bottom))) + .5rem)'), 'Cookie controls sit above the native CTA with a no-JavaScript safe-area fallback.');
assert(source.includes('max-height:calc(100dvh - var(--activity-booking-bar-height'), 'Cookie choices remain scrollable within the viewport.');
assert(!source.includes('body:has(#cookie-banner:not([hidden])) [data-activity-booking-mobile]'), 'An undecided cookie choice does not hide the initial native CTA.');
assert(!/IntersectionObserver|getBoundingClientRect|addEventListener\(["']scroll/.test(js));
assert(source.includes('body:has(#menu-toggle[aria-expanded="true"])'));
assert(!/preventDefault\(|window\.open|localStorage|sessionStorage|fetch\(|\.href\s*=/.test(js));
console.log(`PASS: actual Astro SSR 5hotelcontexts, ${cases}activitytargets\xD72exactCTAs/notices/IDs, 3fullBlogLayoutcontexts;8HTML negative mutations;initial SSR/native mobile visibility;actual mobile handler(immediate height/resize/no-observer/missing/idempotence/dismiss/focus),safe-area/privacy/menu collision guards;native URLs unchanged by controller.`);
