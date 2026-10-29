import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Public production GETs only. Not part of offline CI and never invokes Git/host APIs.
// node scripts/verify-cycling-consent-release.mjs --revision <40hex> --fingerprint <64hex> --report research/<new-receipt>.json
// --self-test performs only local, in-memory fixture checks; no network or writes.
const ORIGIN = 'https://banffbound.com';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 15_000;
const RUN_TIMEOUT_MS = 6 * 60_000;
const BUILD_KEYS = ['builtAtUTC', 'formatVersion', 'scope', 'scopeNote', 'sourceFingerprint', 'sourceRevision'];
const SCOPE_NOTE = 'Selected regular .astro/.ts/.mjs/.js/.css/.json app source and explicit build inputs; excludes volatile snapshots, assets, generated outputs, private files and environment data. Revision is null unless the selected source matches local HEAD.';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', middot: '·', rarr: '→', nearr: '↗', copy: '©' };
function decode(text) {
  return String(text).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, entity) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()] ?? whole;
    const value = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? String.fromCodePoint(value) : whole;
  });
}
const normal = text => decode(text).replace(/\s+/g, ' ').trim();
function attrs(tag) {
  const result = {};
  for (const match of tag.replace(/^<\/?[\w:-]+/, '').matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  return result;
}
function htmlFacts(html) {
  const documents = [];
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) if (attrs(match[0].slice(0, match[0].indexOf('>') + 1)).type?.toLowerCase() === 'application/ld+json') documents.push(JSON.parse(match[1]));
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? '';
  const canonicals = [...head.matchAll(/<link\b[^>]*>/gi)].map(match => attrs(match[0])).filter(item => item.rel?.toLowerCase().split(/\s+/).includes('canonical')).map(item => item.href);
  const robots = [...head.matchAll(/<meta\b[^>]*>/gi)].map(match => attrs(match[0])).filter(item => /^(?:robots|googlebot)$/i.test(item.name ?? '')).map(item => item.content ?? '');
  const cleaned = html.replace(/<!--[^]*?-->/g, '').replace(/<(script|style|template|noscript)\b[^>]*>[^]*?<\/\1\s*>/gi, '');
  const stack = [], text = [], details = [], h1 = [], links = [];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const match of cleaned.matchAll(/<\/?[a-z][^>]*>|[^<]+/gi)) {
    const token = match[0];
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([\w:-]+)/)?.[1].toLowerCase();
      const index = stack.findLastIndex(frame => frame.tag === tag);
      if (index !== -1) stack.splice(index);
    } else if (token.startsWith('<')) {
      const tag = token.match(/^<([\w:-]+)/)?.[1].toLowerCase();
      const attributes = attrs(token);
      const hidden = Boolean(stack.at(-1)?.hidden || Object.hasOwn(attributes, 'hidden') || attributes['aria-hidden'] === 'true' || /display\s*:\s*none/i.test(attributes.style ?? ''));
      const frame = { tag, hidden };
      if (tag === 'details' && !hidden) { frame.detail = { question: [], answer: [] }; details.push(frame.detail); }
      if (tag === 'h1' && !hidden) { frame.heading = []; h1.push(frame.heading); }
      if (tag === 'a' && !hidden && attributes.href) links.push(attributes.href);
      if (!voidTags.has(tag) && !token.endsWith('/>')) stack.push(frame);
    } else if (!stack.at(-1)?.hidden && stack.some(frame => frame.tag === 'body')) {
      text.push(token);
      for (const frame of stack) if (frame.heading) frame.heading.push(token);
      const detailFrame = stack.findLast(frame => frame.detail);
      if (detailFrame) (stack.some(frame => frame.tag === 'summary') ? detailFrame.detail.question : detailFrame.detail.answer).push(token);
    }
  }
  return { documents, canonicals, robots, text: normal(text.join(' ')), h1: h1.map(parts => normal(parts.join(' '))), details: details.map(item => ({ question: normal(item.question.join(' ')), answer: normal(item.answer.join(' ')) })), links };
}
function faqPages(value, result = []) {
  if (Array.isArray(value)) value.forEach(item => faqPages(item, result));
  else if (value && typeof value === 'object') {
    if ([value['@type']].flat().includes('FAQPage')) result.push(value);
    for (const child of Object.values(value)) if (child && typeof child === 'object') faqPages(child, result);
  }
  return result;
}
// Parse actual markup rather than scanning provider names inside raw JS/configuration.
// Script/iframe raw text, comments and template contents cannot become false resource tags.
function htmlElements(html) {
  const result = [], stack = [];
  const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','frame']);
  const tokens = /<!--[\s\S]*?-->|<(\/?)([a-z][\w:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  let match;
  while ((match = tokens.exec(html))) {
    if (match[0].startsWith('<!--')) continue;
    const tag = match[2].toLowerCase();
    if (match[1]) {
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index !== -1) { const closing = stack[index]; closing.innerEnd = match.index; closing.end = tokens.lastIndex; stack.splice(index); }
      continue;
    }
    const attributes = attrs(match[0]), parent = stack.at(-1);
    const node = { tag, attributes, start: match.index, openEnd: tokens.lastIndex, innerEnd: tokens.lastIndex, end: tokens.lastIndex,
      inert: Boolean(parent?.inert || tag === 'template'), noscript: Boolean(parent?.noscript || tag === 'noscript'),
      hidden: Boolean(parent?.hidden || Object.hasOwn(attributes,'hidden') || attributes['aria-hidden'] === 'true' || /display\s*:\s*none/i.test(attributes.style ?? '')) };
    result.push(node);
    if (tag === 'script' || tag === 'iframe') {
      const close = new RegExp(`</${tag}\\s*>`, 'ig'); close.lastIndex = tokens.lastIndex;
      const end = close.exec(html);
      node.innerEnd = end?.index ?? html.length; node.end = end ? close.lastIndex : html.length;
      tokens.lastIndex = node.end;
    } else if (!voids.has(tag) && !match[0].endsWith('/>')) stack.push(node);
  }
  return result;
}
function providerCategory(url) {
  const host = url.hostname.toLowerCase();
  const domain = value => host === value || host.endsWith('.' + value);
  if (['googletagmanager.com','google-analytics.com','googlesyndication.com','doubleclick.net','googleadservices.com','googletagservices.com'].some(domain)
    || (/(^|\.)google\.[a-z.]+$/.test(host) && /\/(?:pagead|ads|adsense|gampad|ccm|analytics)(?:\/|$)/i.test(url.pathname))) return 'Google ads/analytics';
  if (domain('expediagroup.com') || /(^|\.)expedia\.[a-z.]+$/.test(host)) return 'Expedia SDK/frame';
  if (domain('getyourguide.com')) return 'GetYourGuide SDK/frame';
  return null;
}
function activeOptionalResources(html, elements = htmlElements(html), depth = 0) {
  assert.ok(depth <= 4, 'Embedded HTML exceeds inspection depth');
  const found = [];
  for (const node of elements) {
    if (node.inert) continue;
    const a = node.attributes;
    const executable = node.tag === 'script' && !node.noscript && ['', 'module','text/javascript','application/javascript','text/ecmascript','application/ecmascript','application/x-ecmascript','application/x-javascript','text/javascript1.0','text/javascript1.1','text/javascript1.2','text/javascript1.3','text/javascript1.4','text/javascript1.5','text/jscript','text/livescript','text/x-ecmascript','text/x-javascript'].includes((a.type ?? '').trim().toLowerCase().split(';')[0]);
    const framed = ['iframe','frame','embed','object'].includes(node.tag);
    if (!executable && !framed) continue;
    const raw = a[node.tag === 'object' ? 'data' : 'src'];
    if (raw) {
      try {
        const url = new URL(raw, ORIGIN);
        const category = providerCategory(url);
        if (category && /^https?:$/.test(url.protocol)) found.push({ tag: node.tag, category, target: url.origin + url.pathname });
        if (framed && /^data:text\/html(?:;base64)?,/i.test(raw)) {
          const comma = raw.indexOf(','), prefix = raw.slice(0, comma);
          const content = /;base64$/i.test(prefix) ? Buffer.from(raw.slice(comma+1), 'base64').toString('utf8') : decodeURIComponent(raw.slice(comma+1));
          found.push(...activeOptionalResources(content, undefined, depth + 1).map(item => ({ ...item, via: 'embedded frame HTML' })));
        }
      } catch (error) { if (error.code === 'ERR_ASSERTION') throw error; /* Non-resource URL: handled by the browser, not a provider match. */ }
    }
    if (node.tag === 'iframe' && a.srcdoc) found.push(...activeOptionalResources(a.srcdoc, undefined, depth + 1).map(item => ({ ...item, via: 'iframe srcdoc' })));
  }
  return found;
}
function textInside(html, node) { return normal(html.slice(node.openEnd, node.innerEnd).replace(/<[^>]*>/g,' ')); }
function consentMarkupErrors(html, elements, check) {
  const errors = [], active = elements.filter(node => !node.inert);
  const byId = id => active.filter(node => node.attributes.id === id);
  for (const id of ['cookie-banner','cookie-description','cookie-preferences','cookie-accept','cookie-reject','cookie-manage','cookie-save','cookie-close','cookie-storage-status','pref-analytics','pref-advertising','pref-affiliate']) {
    if (byId(id).length !== 1) errors.push(`Expected exactly one consent element: ${id}`);
  }
  const banner = byId('cookie-banner')[0];
  if (banner && (banner.attributes.role !== 'dialog' || banner.attributes['aria-describedby'] !== 'cookie-description')) errors.push('Missing labelled consent dialog contract');
  for (const [id,label] of Object.entries({ 'cookie-accept':'Accept all', 'cookie-reject':'Reject optional', 'cookie-manage':'Manage preferences', 'cookie-save':'Save preferences', 'cookie-close':'Close choices' })) { const node = byId(id)[0]; if (node && (node.tag !== 'button' || node.attributes.type !== 'button' || textInside(html,node) !== label)) errors.push(`Incorrect consent button contract: ${id}`); }
  if (!active.some(node => node.tag === 'a' && !node.hidden && (() => { try { return new URL(node.attributes.href,ORIGIN).pathname.replace(/\/$/,'') === '/privacy'; } catch { return false; } })())) errors.push('Missing visible privacy policy link');
  for (const id of ['cookie-banner','cookie-preferences']) {
    const node = byId(id)[0]; if (node && !Object.hasOwn(node.attributes,'hidden')) errors.push(`Consent panel must start hidden: ${id}`);
  }
  for (const id of ['pref-analytics','pref-advertising','pref-affiliate']) {
    const node = byId(id)[0];
    if (node && (node.tag !== 'input' || node.attributes.type !== 'checkbox' || Object.hasOwn(node.attributes,'checked'))) errors.push(`Optional consent checkbox must start unchecked: ${id}`);
  }
  const buttons = active.filter(node => node.tag === 'button' && !node.hidden && Object.hasOwn(node.attributes,'data-open-consent') && node.attributes.type === 'button');
  if (!buttons.some(node => textInside(html,node) === 'Privacy choices')) errors.push('Missing visible reusable Privacy choices button');
  if (check.requiredPreferenceLabel && !buttons.some(node => textInside(html,node) === check.requiredPreferenceLabel)) errors.push('Missing page-specific privacy preference button');
  const noScript = active.filter(node => node.tag === 'noscript' && !node.hidden).map(node => textInside(html,node)).join(' ');
  if (!noScript.includes('Optional analytics, advertising and booking widgets are off when JavaScript is disabled.') || !noScript.includes('Ordinary booking links remain available.')) errors.push('Missing no-JavaScript optional-service/native-link fallback');
  for (const kind of check.affiliateKinds ?? []) {
    const slots = active.filter(node => node.attributes['data-affiliate-embed'] === kind);
    if (slots.length !== 1) { errors.push(`Expected one reviewed affiliate slot: ${kind}`); continue; }
    const slot = slots[0], children = active.filter(node => node.start >= slot.openEnd && node.end <= slot.innerEnd);
    if (!children.some(node => Object.hasOwn(node.attributes,'data-affiliate-mount') && Object.hasOwn(node.attributes,'hidden'))) errors.push(`Affiliate mount must start hidden: ${kind}`);
    if (!children.some(node => !node.hidden && Object.hasOwn(node.attributes,'data-affiliate-status') && node.attributes.role === 'status' && node.attributes['aria-live'] === 'polite' && /Optional partner content is off\./.test(textInside(html,node)))) errors.push(`Missing accessible blocked affiliate status: ${kind}`);
    if (!children.some(node => node.tag === 'button' && !node.hidden && Object.hasOwn(node.attributes,'data-open-consent'))) errors.push(`Missing affiliate preference control: ${kind}`);
    const native = children.filter(node => node.tag === 'a' && !node.hidden && node.attributes.href).some(node => {
      try { const url = new URL(node.attributes.href); return kind.startsWith('gyg') ? /(^|\.)getyourguide\.com$/.test(url.hostname) && url.searchParams.get('partner_id') === 'QW960HO' : /(^|\.)expedia\.ca$/.test(url.hostname) && url.searchParams.get('camref') === '1101l3MtWX'; } catch { return false; }
    });
    if (!native) errors.push(`Missing preserved native referral fallback: ${kind}`);
  }
  // Provider scanner targets are promised to be created after consent, not in initial SSR markup.
  if (active.some(node => Object.hasOwn(node.attributes,'data-gyg-widget') || Object.hasOwn(node.attributes,'data-gyg-href') || (node.attributes.class ?? '').split(/\s+/).includes('eg-affiliate-banners'))) errors.push('Provider widget target is present before consent');
  return errors;
}
function cyclingBlogMarkers(slug) {
  const values = {
    'banff-legacy-trail': { distanceBasis: 'excluding the separate 2.2 km connection through Banff town.', corridor: '29 km one way', transport: 'A passenger reservation does not reserve a bike slot.', winter: 'not cleared of winter snow and ice', shops: '101 Lake Louise Drive in Lake Louise' },
    'banff-mountain-biking': { permission: 'specifically prohibits all bicycles on Tunnel Mountain Summit Trail', minnewanka: 'July 10 to September 15 annually, cycling is prohibited beyond Stewart Canyon Bridge', difficulty: 'Difficult; 13.9 km one way', winter: 'Spray River West prohibits bikes in winter', endpoint: 'rather than in downtown Canmore' },
    'spray-river-trail': { profiles: 'publish slightly different bank measurements', winter: 'ski guide explicitly prohibits bikes on Spray River West in winter', eBikeScope: 'neither Spray River bank is listed as a pedal-assist exception', pointToPoint: 'Goat Creek route is not the short connecting bridge of an East–West loop', avalanche: '4.5–5 km from the West trailhead' },
  };
  assert.ok(Object.hasOwn(values,slug), `Unexpected cycling article: ${slug}`);
  return values[slug];
}
function requestUrl(pathname, nonce = randomUUID()) {
  const url = new URL(pathname, ORIGIN);
  assert.equal(url.origin, ORIGIN); assert.ok(!url.search && !url.hash && !url.username && !url.password);
  assert.match(nonce, /^[a-z0-9-]{16,80}$/i, 'Invalid request nonce');
  url.searchParams.set('__release_verify', nonce);
  return url;
}

function schemaNodes(value, type, result = []) {
  if (Array.isArray(value)) value.forEach(item => schemaNodes(item,type,result));
  else if (value && typeof value === 'object') {
    if ([value['@type']].flat().includes(type)) result.push(value);
    for (const child of Object.values(value)) if (child && typeof child === 'object') schemaNodes(child,type,result);
  }
  return result;
}
function validateLandingOfferUrl(href, offer) {
  const url = new URL(href);
  assert.equal(url.protocol,'https:');assert.ok(!url.username && !url.password && !url.hash);
  if (offer.provider === 'expedia') {
    assert.equal(url.hostname,'www.expedia.ca');
    assert.match(String(offer.productId ?? ''),/^\d+$/,'Expected the explicit merchant property ID');
    assert.ok(url.pathname.includes(`.h${offer.productId}.Hotel-Information`),'Expedia link must retain the model property ID');
    assert.deepEqual(url.searchParams.getAll('camref'),['1101l3MtWX'],'Native Expedia referral ID must be retained once');
  } else {
    assert.equal(offer.provider,'getyourguide');assert.equal(url.hostname,'www.getyourguide.com');
    assert.match(url.pathname,new RegExp(`-t${offer.productId}/$`));
    assert.deepEqual(url.searchParams.getAll('partner_id'),['QW960HO'],'Native GYG referral ID must be retained once');
    assert.deepEqual(url.searchParams.getAll('cmp'),['banffboundwinteractivities'],'Static winter-page campaign must be retained once');
  }
  if (offer.href) {
    const expected = new URL(offer.href);
    assert.equal(url.origin+url.pathname,expected.origin+expected.pathname,'Native product identity must match the reviewed model');
    assert.deepEqual([...url.searchParams].sort(),[...expected.searchParams].sort(),'Native product parameters must match the reviewed model');
  }
}
function paidLandingErrors(html, elements, facts, check) {
  const errors = [], expected=check.paidLanding;
  const visible=elements.filter(node=>!node.inert&&!node.hidden);
  const bodies=visible.filter(node=>node.tag==='body');
  if (bodies.length!==1||bodies[0].attributes['data-paid-landing']!=='true') errors.push('Missing focused paid-landing body marker');
  if (visible.filter(node=>node.attributes['data-landing-page']===expected.id).length!==1) errors.push('Missing unique landing identity wrapper');
  const headers=visible.filter(node=>node.tag==='header'),footers=visible.filter(node=>node.tag==='footer');
  if (headers.length!==1||!(headers[0].attributes.class??'').split(/\s+/).includes('booking-header')) errors.push('Expected compact booking header');
  if (footers.length!==1||!(footers[0].attributes.class??'').split(/\s+/).includes('booking-footer')) errors.push('Expected compact booking footer');
  const childrenOf=node=>visible.filter(child=>child.start>=node.openEnd&&child.end<=node.innerEnd);
  const internalPath=(node,wanted)=>{try{const url=new URL(node.attributes.href,ORIGIN);return url.origin===ORIGIN&&url.pathname.replace(/\/$/,'')===wanted.replace(/\/$/,'');}catch{return false;}};
  if (headers.length===1) {
    const children=childrenOf(headers[0]);
    if (!children.some(node=>node.tag==='nav'&&node.attributes['aria-label']==='Booking guide navigation')) errors.push('Missing labelled compact booking navigation');
    for(const href of ['/','/blog','/editorial']) if(!children.some(node=>node.tag==='a'&&internalPath(node,href))) errors.push(`Missing compact header link: ${href}`);
  }
  if (footers.length===1) {
    const children=childrenOf(footers[0]);
    for(const href of ['/contact','/editorial','/privacy','/terms']) if(!children.some(node=>node.tag==='a'&&internalPath(node,href))) errors.push(`Missing booking footer policy link: ${href}`);
    if(!children.some(node=>node.tag==='button'&&Object.hasOwn(node.attributes,'data-open-consent')&&textInside(html,node)==='Privacy choices')) errors.push('Missing compact-footer privacy preference button');
  }
  const anchors=visible.filter(node=>node.tag==='a'&&node.attributes['data-landing-id']===expected.id&&Object.hasOwn(node.attributes,'data-offer-id'));
  const expectedIds=new Set(expected.offers.map(offer=>offer.id)),actualIds=new Set(anchors.map(node=>node.attributes['data-offer-id']));
  if(actualIds.size!==expectedIds.size||[...actualIds].some(id=>!expectedIds.has(id))) errors.push('Native landing offer count/IDs differ from reviewed data');
  for(const offer of expected.offers) {
    const links=anchors.filter(node=>node.attributes['data-offer-id']===offer.id);
    if(!links.length){errors.push(`Missing visible native product CTA: ${offer.id}`);continue;}
    for(const node of links) {
      try{validateLandingOfferUrl(node.attributes.href,offer);}catch{errors.push(`Native affiliate URL/ID differs: ${offer.id}`);}
      const rel=(node.attributes.rel??'').toLowerCase().split(/\s+/);
      if(!rel.includes('sponsored')||!rel.includes('noopener')||node.attributes.target!=='_blank'||Object.keys(node.attributes).some(key=>/^on/i.test(key))) errors.push(`Native affiliate CTA contract differs: ${offer.id}`);
    }
  }
  if(expected.itemList) {
    const lists=facts.documents.flatMap(document=>schemaNodes(document,'ItemList'));
    if(lists.length!==1) errors.push('Expected exactly one landing ItemList');
    else {
      const list=lists[0],wanted=expected.itemList;
      if(list.numberOfItems!==expected.offers.length||!Array.isArray(list.itemListElement)||list.itemListElement.length!==expected.offers.length) errors.push('Landing ItemList count differs from reviewed offers');
      for(const [index,item] of (Array.isArray(list.itemListElement)?list.itemListElement:[]).entries()) {
        const source=wanted.itemListElement[index];
        if(!source||item['@type']!=='ListItem'||item.position!==index+1||normal(item.name??'')!==normal(source.name)||item.url!==source.url) errors.push(`Landing ItemList identity differs at position ${index+1}`);
      }
    }
  }
  return errors;
}

function analyseHtml(html, check, sitemap, headerRobots = '') {
  const errors = [], markers = {};
  const facts = htmlFacts(html);
  const elements = htmlElements(html);
  const activeResources = activeOptionalResources(html, elements);
  errors.push(...activeResources.map(item => `Active pre-consent ${item.category}: ${item.tag} ${item.target}`));
  errors.push(...consentMarkupErrors(html, elements, check));
  const expectedCanonical = ORIGIN + check.path;
  if (facts.canonicals.length !== 1 || facts.canonicals[0] !== expectedCanonical) errors.push('Expected exactly one absolute self canonical');
  if (facts.h1.length !== 1 || (check.name && facts.h1[0] !== normal(check.name))) errors.push('Missing, duplicate or incorrect H1');
  const noindex = [...facts.robots, headerRobots].some(value => /(?:^|[\s,;:])(?:noindex|none)(?:$|[\s,;])/i.test(value));
  if (noindex !== check.noindex) errors.push(`Expected noindex=${check.noindex}`);
  const inSitemap = sitemap.has(expectedCanonical);
  if (inSitemap !== !check.noindex) errors.push(`Expected sitemap inclusion=${!check.noindex}`);
  for (const [label, expected] of Object.entries(check.markers ?? {})) {
    markers[label] = facts.text.includes(normal(expected));
    if (!markers[label]) errors.push(`Missing visible marker: ${label}`);
  }
  if (check.reviewDate) {
    markers.reviewDate = facts.text.includes(check.reviewDate);
    if (!markers.reviewDate) errors.push('Missing visible source review date');
  }
  for (const [field, label] of [['publishedDate','publication'],['modifiedDate','modification']]) if (check[field]) {
    const times = elements.filter(node => !node.inert && !node.hidden && node.tag === 'time');
    if (!times.some(node => (node.attributes.datetime ?? '').slice(0,10) === check[field])) errors.push(`Missing preserved visible ${label} datetime`);
  }
  for (const routeId of check.routeIds ?? []) if (!elements.some(node => node.attributes['data-cycle-route'] === routeId)) errors.push(`Missing SSR cycling route: ${routeId}`);
  if (check.paidLanding) errors.push(...paidLandingErrors(html,elements,facts,check));
  let faqQuestions;
  if (check.faqs) {
    const schemas = facts.documents.flatMap(document => faqPages(document));
    if (schemas.length !== 1 || !Array.isArray(schemas[0]?.mainEntity)) errors.push('Expected exactly one FAQPage with a mainEntity array');
    else {
      const items = schemas[0].mainEntity;
      faqQuestions = items.length;
      if (items.length !== check.faqs.length) errors.push('FAQ schema count differs from reviewed data');
      check.faqs.forEach((expected, index) => {
        const actual = items[index];
        if (actual?.['@type'] !== 'Question' || actual.acceptedAnswer?.['@type'] !== 'Answer' || normal(actual.name ?? '') !== normal(expected.question) || normal(actual.acceptedAnswer?.text ?? '') !== normal(expected.answer)) errors.push(`FAQ schema differs at question ${index + 1}`);
        const visible = facts.details.filter(item => item.question === normal(expected.question));
        if (visible.length !== 1 || visible[0].answer !== normal(expected.answer)) errors.push(`Visible FAQ/schema mismatch at question ${index + 1}`);
      });
    }
  }
  for (const expected of check.requiredMarkup ?? []) if (!html.includes(expected)) errors.push('Missing required optional-map markup');
  for (const expected of check.links ?? []) if (!facts.links.includes(expected)) errors.push(`Missing visible source/photo link: ${expected}`);
  return { canonical: facts.canonicals.length === 1 ? facts.canonicals[0] : null, h1: facts.h1.length, noindex, inSitemap, ...(faqQuestions !== undefined ? { faqQuestions } : {}), markers, activeOptionalResources: activeResources, consentMarkupPassed: !errors.some(error => /consent|privacy|referral fallback|Affiliate mount|affiliate status|affiliate preference/i.test(error)), errors };
}
function validateBuildInfo(value, revision, fingerprint, now = Date.now()) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Build receipt must be an object');
  assert.deepEqual(Object.keys(value).sort(), BUILD_KEYS, 'Build receipt must expose exactly the six allowlisted fields');
  assert.equal(value.formatVersion, 1); assert.equal(value.scope, 'app-source-v2'); assert.equal(value.scopeNote, SCOPE_NOTE);
  assert.equal(value.sourceRevision, revision, 'Deployed source revision does not match');
  assert.equal(value.sourceFingerprint, fingerprint, 'Deployed source fingerprint does not match');
  assert.ok(typeof value.builtAtUTC === 'string' && Number.isFinite(Date.parse(value.builtAtUTC)) && new Date(value.builtAtUTC).toISOString() === value.builtAtUTC && Date.parse(value.builtAtUTC) <= now + 300_000, 'Invalid or future UTC build timestamp');
}
function xmlLocations(xml, kind) {
  const clean = xml.replace(/<\?xml[^>]*\?>/g, '').trim();
  assert.ok(!/<!DOCTYPE|<!ENTITY/i.test(clean), 'Sitemap entities/doctype are not accepted');
  assert.ok(new RegExp(`^<${kind}\\b`).test(clean) && new RegExp(`</${kind}>$`).test(clean), `Expected ${kind} XML`);
  const values = [...clean.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => decode(match[1]));
  assert.ok(values.length > 0 && values.length <= 10_000, 'Empty or excessive sitemap locations');
  for (const value of values) { const url = new URL(value); assert.equal(url.origin, ORIGIN, 'Sitemap location must stay on the public origin'); assert.ok(!url.search && !url.hash && !url.username && !url.password, 'Unexpected sitemap URL components'); }
  assert.equal(new Set(values).size, values.length, 'Duplicate sitemap locations');
  return values;
}
async function loadInventory() {
  const compiled = await build({ stdin: { contents: "export {trails} from './src/data/trails.ts'; export {isDirectoryTrail} from './src/data/trailPlanning.ts'; export {directoryHotels,isHotelDirectoryIndexable} from './src/data/hotelDirectory.ts'; export * from './src/data/wildlifeSafety.ts'; export {wildlifeGuideFaqs,wildlifeTrackerFaqs,wildlifeSpecies} from './src/data/wildlifeFieldGuide.ts'; export {wildlifeZones,wildlifeAreaReviewedAt} from './src/data/wildlifeZones.ts'; export {cyclingGuideOverrides,cyclingGuideMetadata} from './src/data/cyclingGuideOverrides.ts'; export {cyclingRoutes,cyclingReviewedAt} from './src/data/cyclingPlanning.ts'; export * from './src/data/banffHotelLanding.ts'; export * from './src/data/lakeLouiseLanding.ts'; export * from './src/data/winterActivityLanding.ts';", resolveDir: ROOT }, absWorkingDir: ROOT, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
  const data = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
  const manifest = await readFile(path.join(ROOT, 'src/data/wildlifePhotos.json'));
  const photos = JSON.parse(manifest);
  assert.equal(data.trails.length, 81); assert.equal(data.trails.filter(data.isDirectoryTrail).length, 80);
  assert.equal(data.trails.filter(trail => trail.routeVerified === false).length, 1);
  const hotelIndexable = data.directoryHotels.filter(hotel => data.isHotelDirectoryIndexable(hotel.slug)).length;
  const hotelNoindex = data.directoryHotels.length - hotelIndexable;
  assert.equal(data.directoryHotels.length, 95); assert.equal(hotelIndexable, 52, 'Expected the completed 52 eligible hotel records'); assert.equal(hotelNoindex, 43);
  assert.equal(photos.length, 7); assert.equal(new Set(photos.map(photo => photo.src)).size, 7);
  for (const record of [...data.trails, ...data.directoryHotels]) assert.match(record.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(new Set(data.trails.map(trail => trail.slug)).size, 81); assert.equal(new Set(data.directoryHotels.map(hotel => hotel.slug)).size, 95);
  for (const trail of data.trails) {
    assert.equal(data.isDirectoryTrail(trail), trail.routeVerified !== false, `Trail eligibility/noindex disagree: ${trail.slug}`);
    assert.equal(trail.sourceReview?.status, trail.routeVerified === false ? 'unverified' : 'reviewed');
  }
  for (const photo of photos) { assert.match(photo.src, /^\/images\/wildlife\/field-guide\/[a-z0-9-]+\.jpe?g$/); assert.match(photo.sha256, /^[a-f0-9]{64}$/); }
  const checks = [
    ...data.trails.map(trail => ({ path: `/trails/${trail.slug}/`, kind: 'trail', name: trail.name, noindex: !data.isDirectoryTrail(trail), reviewDate: trail.reviewedAt, markers: { sourceReview: trail.sourceReview.scope, statusScope: 'Current trail status is not supplied by this guide.' } })),
    ...data.directoryHotels.map(hotel => ({ path: `/hotel-directory/${hotel.slug}/`, kind: 'hotel', name: hotel.name, noindex: !data.isHotelDirectoryIndexable(hotel.slug), reviewDate: hotel.checkedOn, markers: { sourceStatus: hotel.sourceStatusLabel, sourceScope: hotel.sourceScope } })),
    { path: '/wildlife/', kind: 'wildlife', faqs: data.wildlifeGuideFaqs, markers: { sourceReview: 'Species and planning review:', photoScope: 'historical species illustrations' }, links: photos.flatMap(photo => [photo.source, photo.licenseUrl]) },
    { path: '/wildlife-tracker/', kind: 'wildlife', faqs: data.wildlifeTrackerFaqs, markers: { sourceReview: 'Source and access review:', feedScope: 'No live sighting feed is connected.', areaCount: `${data.wildlifeZones.length} area plans` } },
    { path: '/wildlife-safety/', kind: 'wildlife', faqs: data.wildlifeSafetyFaqs, markers: { sourceReview: 'Official guidance reviewed', reportContact: '403-762-1470', emergencyContact: '403-762-4506' } },
    { path: '/wildlife-calendar/', kind: 'wildlife', faqs: data.wildlifeCalendarFaqs, markers: { sourceReview: 'Official sources reviewed', preparationScope: 'This calendar contains no live animal locations or sighting forecasts.' } },
    { path: '/bear-spray/', kind: 'wildlife', faqs: data.bearSprayFaqs, markers: { sourceReview: 'Official rules and direct provider pages reviewed', provider: 'Ultimate Sports', poisonAdvice: '1-844-764-7669' } },
    { path: '/trail-map/', kind: 'directory', markers: { planningScope: 'Planning information, not current trail status.', photoScope: 'Illustrative stock landscape; not a verified trail photograph.' }, requiredMarkup: ['Indicative listing locations only.'] },
    { path: '/hotel-directory/', kind: 'directory', markers: { sourceScope: 'selected-fact reviews', legacyScope: 'legacy leads awaiting source review' } },
    { path: '/tools/', kind: 'directory', markers: { wildlifeScope: 'Compare public visitor areas, habitat, species and seasonal access.' } },
  ].map(check => ({ noindex: false, ...check }));
  assert.equal(checks.length, 184, 'Preserve every route in the prior release scope');
  checks.push(
    { path: '/biking/', kind: 'cycling', name: 'Cycling in Banff', noindex: false, reviewDate: 'October 29, 2026',
      markers: { planner: 'Compare a cycling plan', permission: 'All bicycles are prohibited on Tunnel Mountain Summit Trail', winter: 'Spray River West prohibits bikes in winter.', dates: 'cycling beyond Stewart Canyon Bridge is prohibited July 10–September 15 annually.', sourceScope: 'These are published cycling profiles and permission checks.', photo: 'Illustrative stock photograph; not verified as a Banff route or current conditions.' },
      requiredMarkup: ['id="cycling-planner"', 'id="cycle-empty"', 'id="cycle-feedback"'],
      routeIds: data.cyclingRoutes.map(route => route.id), links: [data.cyclingRoutes[0].sources[0].url] },
    ...Object.entries(data.cyclingGuideMetadata).map(([slug, meta]) => ({ path: `/blog/${slug}/`, kind: 'cycling-blog', name: meta.title, noindex: false, reviewDate: 'October 29, 2026', modifiedDate: meta.lastUpdated,
      publishedDate: ({ 'banff-legacy-trail': '2025-12-26', 'banff-mountain-biking': '2025-12-14', 'spray-river-trail': '2025-12-25' })[slug],
      markers: cyclingBlogMarkers(slug), affiliateKinds: ['expedia-banner', 'gyg-auto'],
      links: ['https://parks.canada.ca/pn-np/ab/banff/bulletins/8942f86e-3565-4b9a-a424-7c86d7c97701'] })),
    { path: '/privacy/', kind: 'privacy', name: 'Privacy policy', noindex: false, reviewDate: '29 October 2026',
      markers: { separateChoices: 'Analytics, advertising and affiliate embeds are separate optional categories.', noImpliedConsent: 'Browsing or closing a page does not count as accepting them.', storage: 'bb-cookie-consent', expiry: '365 days', withdrawal: 'Withdrawal cannot undo requests already sent', referrals: 'Following an ordinary affiliate link is a separate action.', fallback: 'Provider content may be unavailable or blocked by the browser; a normal referral link remains available alongside it.' }, requiredPreferenceLabel: 'Open privacy choices' },
    { path: '/tours/', kind: 'tours', name: 'Tours & Adventures', noindex: false,
      markers: { sourceScope: 'Prices, availability, inclusions and cancellation terms come from the actual product and date.', photoScope: 'Images are illustrative stock landscapes, not verified tour photographs.', fallback: 'These native links work without optional affiliate content.' }, affiliateKinds: ['gyg-activities'] },
  );
  assert.equal(Object.keys(data.cyclingGuideMetadata).length, 3);
  assert.equal(data.cyclingRoutes.length, 9);
  assert.equal(checks.length, 190, 'Preserve all prior cycling/consent release checks');
  assert.equal(data.banffHotelLandingOffers.length,6); assert.equal(data.lakeLouiseStayChoices.length,5); assert.equal(data.winterActivityOffers.length,3);
  checks.push(
    { path:'/book/banff-hotels/',kind:'paid-landing',name:'Find the Banff stay that fits your trip.',noindex:false,reviewDate:'29 October 2026',faqs:data.banffHotelLandingFaqs,
      paidLanding:{id:data.banffHotelLandingId,offers:data.banffHotelLandingOffers.map(offer=>({id:offer.slug,href:offer.expediaUrl,provider:'expedia',productId:offer.expediaPropertyId})),itemList:data.banffHotelLandingSchema.mainEntity},
      markers:{disclosure:'Expedia supplies room offers, availability, prices and booking terms.',sourceScope:'property sources checked'} },
    { path:'/book/lake-louise-stays/',kind:'paid-landing',name:'Find the stay that fits your Lake Louise trip.',noindex:false,reviewDate:'29 October 2026',faqs:data.lakeLouiseStayFaqs,
      paidLanding:{id:data.lakeLouiseLandingId,offers:data.lakeLouiseStayChoices.map(stay=>({id:stay.slug,href:stay.expediaUrl,provider:'expedia',productId:new URL(stay.expediaUrl).pathname.match(/\.h(\d+)\.Hotel-Information/)?.[1]})),itemList:{'@type':'ItemList',numberOfItems:data.lakeLouiseStayChoices.length,itemListElement:data.lakeLouiseStayChoices.map((stay,index)=>({'@type':'ListItem',position:index+1,name:stay.name,url:`${ORIGIN}/book/lake-louise-stays/#stay-${stay.slug}`}))}},
      markers:{sourceScope:'Property facts and merchant identity reviewed',identity:'The links below open named property listings;',scope:'They are not a price or guest-rating ranking.'} },
    { path:'/book/banff-winter-activities/',kind:'paid-landing',name:'Find your winter day in Banff',noindex:false,reviewDate:data.winterActivityReviewedAt,faqs:data.winterActivityFaqs,
      paidLanding:{id:data.winterActivityLandingId,offers:data.winterActivityOffers.map(offer=>({id:offer.id,href:offer.bookingUrl,provider:'getyourguide',productId:offer.productId}))},
      markers:{disclosure:'Affiliate disclosure: booking links open GetYourGuide.',sourceScope:'Product identities and linked operator information reviewed',access:'This is not confirmation of reopening.',format:'A canyon walk, mountain ride or winter road day?'} },
  );
  for (const check of checks.filter(check=>check.paidLanding)) {
    assert.equal(check.paidLanding.offers.length,new Set(check.paidLanding.offers.map(offer=>offer.id)).size);
    for (const offer of check.paidLanding.offers) validateLandingOfferUrl(offer.href,offer);
  }
  assert.equal(checks.length,193);assert.equal(new Set(checks.map(check=>check.path)).size,193);
  return { checks, photos, hotelCounts: { total: data.directoryHotels.length, indexable: hotelIndexable, noindex: hotelNoindex }, cyclingBodies: data.cyclingGuideOverrides, manifestSha256: sha256(manifest) };
}
async function pool(items, task) {
  let cursor = 0;
  const results = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => { while (cursor < items.length) { const index = cursor++; results[index] = await task(items[index], index); } }));
  return results;
}
function options(args) {
  assert.equal(args.length, 6, 'Required: --revision <40hex> --fingerprint <64hex> --report <new-local.json>');
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    assert.ok(['--revision', '--fingerprint', '--report'].includes(args[index]) && !Object.hasOwn(result, args[index]), 'Unknown or duplicate option');
    assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), 'Missing option value'); result[args[index]] = args[index + 1];
  }
  assert.match(result['--revision'] ?? '', /^[a-f0-9]{40}$/i); assert.match(result['--fingerprint'] ?? '', /^[a-f0-9]{64}$/i); assert.match(result['--report'] ?? '', /\.json$/i);
  return { revision: result['--revision'].toLowerCase(), fingerprint: result['--fingerprint'].toLowerCase(), report: path.resolve(result['--report']) };
}
async function verify(config) {
  const started = Date.now(), deadline = started + RUN_TIMEOUT_MS;
  const requestNonces = new Set();
  const report = { formatVersion: 1, startedAt: new Date(started).toISOString(), checkedAt: null, origin: ORIGIN, expectedRevision: config.revision, expectedFingerprint: config.fingerprint, policy: { method: 'GET', concurrency: CONCURRENCY, requestTimeoutMs: REQUEST_TIMEOUT_MS, runTimeoutMs: RUN_TIMEOUT_MS, retries: 0, uniqueNoncePerGet: true, preConsentScope: 'Every checked HTML document: executable provider script/frame URLs, consent controls and reviewed affiliate fallbacks; not a browser network trace' }, passed: false, requests: 0, inventory: null, buildReceipt: null, buildReceiptStable: false, sitemap: null, results: [], photos: [], failures: [] };
  const fail = (stage, message) => report.failures.push({ stage, message: String(message).slice(0, 500) });
  const get = async (pathname, maxBytes, contentType) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw Error('Global verification time limit reached');
    const url = requestUrl(pathname);
    const nonce = url.searchParams.get('__release_verify');
    assert.ok(!requestNonces.has(nonce), 'Each GET must use a unique request nonce'); requestNonces.add(nonce);
    report.requests++;
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(Math.min(REQUEST_TIMEOUT_MS, remaining)), headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'BanffBound-cycling-consent-release-verification/1.0' } });
    if (response.status !== 200) { await response.body?.cancel(); throw Error(`HTTP ${response.status}; expected 200 without redirect`); }
    const type = response.headers.get('content-type') ?? '';
    if (!contentType.test(type)) { await response.body?.cancel(); throw Error('Unexpected content type'); }
    if (Number(response.headers.get('content-length')) > maxBytes) { await response.body?.cancel(); throw Error('Response exceeds byte limit'); }
    let length = 0; const chunks = [];
    for await (const chunk of response.body ?? []) { length += chunk.length; if (length > maxBytes) { await response.body?.cancel().catch(() => {}); throw Error('Response exceeds byte limit'); } chunks.push(chunk); }
    assert.ok(length > 0, 'Empty response');
    return { bytes: Buffer.concat(chunks), status: response.status, lastModified: response.headers.get('last-modified'), robots: response.headers.get('x-robots-tag') ?? '' };
  };
  try {
    const inventory = await loadInventory();
    report.inventory = { htmlRoutes: inventory.checks.length, trails: { total: 81, indexable: 80, noindex: 1 }, hotels: inventory.hotelCounts, wildlifePages: 5, cyclingPages: 4, consentPages: 2, paidLandingPages: 3, nativeLandingOffers: { banffHotels: 6, lakeLouiseStays: 5, winterActivities: 3 }, photos: 7, photoManifestSha256: inventory.manifestSha256 };
    const buildResponse = await get('/build-info.json', 16_384, /^application\/json(?:\s*;|$)/i);
    report.buildReceipt = JSON.parse(buildResponse.bytes.toString('utf8'));
    validateBuildInfo(report.buildReceipt, config.revision, config.fingerprint);
    const sitemapResponse = await get('/sitemap-index.xml', 2 * 1024 * 1024, /^(?:application|text)\/xml(?:\s*;|$)/i);
    const sitemapFiles = xmlLocations(sitemapResponse.bytes.toString('utf8'), 'sitemapindex');
    assert.ok(sitemapFiles.length <= 8, 'Too many sitemap files');
    for (const url of sitemapFiles) assert.match(new URL(url).pathname, /^\/sitemap(?:-\d+)?\.xml$/);
    const sitemapResults = await pool(sitemapFiles, async url => { const result = await get(new URL(url).pathname, 3 * 1024 * 1024, /^(?:application|text)\/xml(?:\s*;|$)/i); return xmlLocations(result.bytes.toString('utf8'), 'urlset'); });
    const sitemap = new Set(sitemapResults.flat());
    assert.equal(sitemap.size, sitemapResults.flat().length, 'Duplicate cross-file sitemap entries');
    assert.ok(!sitemap.has(`${ORIGIN}/build-info.json`), 'Build receipt must be excluded from sitemap');
    report.sitemap = { files: sitemapFiles.map(url => new URL(url).pathname), urlCount: sitemap.size, buildInfoExcluded: true };
    report.results = await pool(inventory.checks, async check => {
      try {
        const response = await get(check.path, 2 * 1024 * 1024, /^text\/html(?:\s*;|$)/i);
        const facts = analyseHtml(response.bytes.toString('utf8'), check, sitemap, response.robots);
        return { path: check.path, kind: check.kind, status: response.status, lastModified: response.lastModified, ...facts, passed: facts.errors.length === 0 };
      } catch (error) { return { path: check.path, kind: check.kind, passed: false, errors: [String(error.message ?? error.name).slice(0, 300)] }; }
    });
    report.photos = await pool(inventory.photos, async photo => {
      try { const response = await get(photo.src, 4 * 1024 * 1024, /^image\/jpeg(?:\s*;|$)/i); const digest = sha256(response.bytes); return { id: photo.id, path: photo.src, status: response.status, bytes: response.bytes.length, expectedSha256: photo.sha256, sha256: digest, passed: digest === photo.sha256 }; }
      catch (error) { return { id: photo.id, path: photo.src, passed: false, error: String(error.message ?? error.name).slice(0, 300) }; }
    });
    const finalResponse = await get('/build-info.json', 16_384, /^application\/json(?:\s*;|$)/i);
    const finalReceipt = JSON.parse(finalResponse.bytes.toString('utf8'));
    validateBuildInfo(finalReceipt, config.revision, config.fingerprint);
    assert.deepEqual(finalReceipt, report.buildReceipt, 'Build changed while verification ran');
    report.buildReceiptStable = true;
    for (const row of report.results.filter(row => !row.passed)) fail(row.path, row.errors.join('; '));
    for (const row of report.photos.filter(row => !row.passed)) fail(row.path, row.error ?? 'Photo bytes SHA256 mismatch');
    report.passed = report.results.length === 193 && report.photos.length === 7 && report.buildReceiptStable && report.failures.length === 0;
  } catch (error) { fail('verification', error.message ?? error.name); }
  report.checkedAt = new Date().toISOString(); report.durationMs = Date.now() - started;
  report.summary = { htmlPassed: report.results.filter(row => row.passed).length, htmlFailed: report.results.filter(row => !row.passed).length, photosPassed: report.photos.filter(row => row.passed).length, photosFailed: report.photos.filter(row => !row.passed).length, failures: report.failures.length };
  // Preserve existing receipts. Only the explicitly supplied, previously absent JSON file is written.
  await writeFile(config.report, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ passed: report.passed, report: config.report, ...report.summary, requests: report.requests }));
  if (!report.passed) process.exitCode = 1;
}
async function selfTest() {
  const inventory = await loadInventory();
  const revision = 'a'.repeat(40), fingerprint = 'b'.repeat(64);
  const receipt = { formatVersion: 1, scope: 'app-source-v2', scopeNote: SCOPE_NOTE, builtAtUTC: '2026-10-29T00:00:00.000Z', sourceRevision: revision, sourceFingerprint: fingerprint };
  validateBuildInfo(receipt, revision, fingerprint, Date.parse('2026-10-29T12:00:00Z'));
  for (const invalid of [{ ...receipt, scope: 'app-source-v1' }, { ...receipt, scopeNote: SCOPE_NOTE.replace('/.js','') }, { ...receipt, formatVersion: 2 }, { ...receipt, sourceRevision: null }, { ...receipt, sourceFingerprint: 'c'.repeat(64) }, { ...receipt, extra: true }, { ...receipt, builtAtUTC: '2099-01-01T00:00:00.000Z' }]) assert.throws(() => validateBuildInfo(invalid, revision, fingerprint, Date.parse('2026-10-29T12:00:00Z')));
  const faq = { question: 'Who & where?', answer: 'A source-based answer.' };
  const check = { path: '/wildlife/', noindex: false, name: 'Wildlife & space', faqs: [faq], markers: { review: 'Reviewed 2026-10-29' } };
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }] };
  const consentFixture = `<footer><a href="/privacy">Privacy Policy</a><button type="button" data-open-consent>Privacy choices</button></footer><div id="cookie-banner" role="dialog" aria-describedby="cookie-description" hidden><p id="cookie-description">Choose optional services.</p><button type="button" id="cookie-accept">Accept all</button><button type="button" id="cookie-reject">Reject optional</button><button type="button" id="cookie-manage">Manage preferences</button><div id="cookie-preferences" hidden><input type="checkbox" id="pref-analytics"><input type="checkbox" id="pref-advertising"><input type="checkbox" id="pref-affiliate"><button type="button" id="cookie-save">Save preferences</button></div><p id="cookie-storage-status"></p><button type="button" id="cookie-close" hidden>Close choices</button></div><noscript><p>Optional analytics, advertising and booking widgets are off when JavaScript is disabled. Ordinary booking links remain available.</p></noscript>`;
  const fixture = `<html><head><link href="${ORIGIN}/wildlife/" rel="canonical"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body><h1>Wildlife &amp; space</h1><p>Reviewed 2026-10-29</p><details><summary>Who &amp; where?</summary><p>A source-based answer.</p></details>${consentFixture}</body></html>`;
  const sitemap = new Set([`${ORIGIN}/wildlife/`]);
  assert.deepEqual(analyseHtml(fixture, check, sitemap).errors, []);
  assert.ok(analyseHtml(fixture, { ...check, requiredMarkup: ['Absent optional-map note'] }, sitemap).errors.some(error => error.includes('optional-map markup')));
  assert.ok(analyseHtml(fixture, check, sitemap, 'noindex').errors.length > 0);
  assert.ok(analyseHtml(fixture.replace('<details>', '<div hidden><details>').replace('</details>', '</details></div>'), check, sitemap).errors.some(error => error.includes('Visible FAQ')));
  assert.ok(analyseHtml(fixture.replace('<p>A source-based answer.</p>', '<p>A different answer.</p>'), check, sitemap).errors.some(error => error.includes('Visible FAQ')));
  assert.ok(analyseHtml(fixture.replace('rel="canonical"', 'rel="alternate"'), check, sitemap).errors.some(error => error.includes('canonical')));
  assert.ok(analyseHtml(fixture, check, new Set()).errors.some(error => error.includes('sitemap')));
  assert.throws(() => htmlFacts(fixture.replace(JSON.stringify(schema), '{malformed}')));
  const inject = markup => fixture.replace('</body>', markup + '</body>');
  for (const markup of [
    '<script src="https://www.googletagmanager.com/gtag/js?id=G-test"></script>',
    '<script type="text/x-javascript" src="https://www.google-analytics.com/analytics.js"></script>',
    '<SCRIPT SRC="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></SCRIPT>',
    '<iframe hidden src="https://www.google.com/pagead/1p-conversion/test"></iframe>',
    '<script src="https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js"></script>',
    '<iframe src="https://widget.getyourguide.com/default/activities.frame"></iframe>',
    '<script src="https:&#x2f;&#x2f;www.google-analytics.com/analytics.js"></script>',
    '<iframe srcdoc="&lt;script src=&quot;https://widget.getyourguide.com/sdk.js&quot;&gt;&lt;/script&gt;"></iframe>',
    '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-test"></iframe></noscript>',
  ]) assert.ok(analyseHtml(inject(markup),check,sitemap).errors.some(error=>error.includes('Active pre-consent')), markup);
  const inert = `<script>const config={url:'https://widget.getyourguide.com/sdk.js',html:'<iframe src="https://www.google-analytics.com/frame">'};</script><script type="application/json">{"url":"https://creator.expediagroup.com/sdk.js"}</script><script type="text/plain" src="https://www.googletagmanager.com/gtag/js"></script><!-- <iframe src="https://www.google.com/pagead/x"></iframe> --><template><script src="https://pagead2.googlesyndication.com/ads.js"></script><iframe src="https://widget.getyourguide.com/frame"></iframe></template><a href="https://www.getyourguide.com/banff-l284/?partner_id=QW960HO">Native referral</a><a href="https://www.expedia.ca/Hotel-Search?camref=1101l3MtWX">Native stay search</a><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">`;
  assert.deepEqual(analyseHtml(inject(inert),check,sitemap).errors, [], 'Inert config/comments/templates, referral anchors and fonts must remain allowed.');
  assert.ok(analyseHtml(fixture.replace('id="pref-analytics"','id="pref-analytics" checked'),check,sitemap).errors.some(error=>error.includes('unchecked')));
  assert.ok(analyseHtml(fixture.replace('data-open-consent','data-inert-preference'),check,sitemap).errors.some(error=>error.includes('Privacy choices button')));
  assert.ok(analyseHtml(fixture.replace('Ordinary booking links remain available.',''),check,sitemap).errors.some(error=>error.includes('no-JavaScript')));
  const widget = `<div data-affiliate-embed="gyg-activities"><p data-affiliate-status role="status" aria-live="polite">Optional partner content is off. Use the direct link.</p><button type="button" data-open-consent>Privacy choices</button><div data-affiliate-mount hidden></div><a href="https://www.getyourguide.com/banff-l284/?partner_id=QW960HO">Native tour link</a></div>`;
  const widgetCheck={...check,affiliateKinds:['gyg-activities']};
  assert.deepEqual(analyseHtml(inject(widget),widgetCheck,sitemap).errors,[]);
  assert.ok(analyseHtml(inject(widget.replace('data-affiliate-mount hidden','data-affiliate-mount')),widgetCheck,sitemap).errors.some(error=>error.includes('start hidden')));
  assert.ok(analyseHtml(inject(widget.replace('partner_id=QW960HO','partner_id=wrong')),widgetCheck,sitemap).errors.some(error=>error.includes('native referral fallback')));
  assert.ok(analyseHtml(inject('<div data-gyg-widget="auto"></div>'),check,sitemap).errors.some(error=>error.includes('widget target')));
  assert.ok(analyseHtml(inject('<time datetime="2025-12-26">26 December 2025</time>'),{...check,publishedDate:'2025-12-26'},sitemap).errors.length===0);
  assert.ok(analyseHtml(fixture,{...check,publishedDate:'2025-12-26'},sitemap).errors.some(error=>error.includes('publication datetime')));
  const firstNonce=requestUrl('/build-info.json'),secondNonce=requestUrl('/build-info.json');
  assert.notEqual(firstNonce.search,secondNonce.search);assert.equal(firstNonce.origin,ORIGIN);
  assert.throws(()=>requestUrl('https://example.com/'));assert.throws(()=>requestUrl('/build-info.json?existing=1'));
  for (const item of inventory.checks.filter(item=>item.kind==='cycling-blog')) {
    const slug=item.path.split('/')[2],body=inventory.cyclingBodies[slug];
    for (const [label,marker] of Object.entries(item.markers)) assert.ok(normal(body.replace(/<[^>]*>/g,' ')).includes(normal(marker)),`${slug}: source marker mismatch ${label}`);
  }
  const htmlEscape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const compactHeader='<header class="booking-header"><a href="/">BanffBound</a><nav aria-label="Booking guide navigation"><a href="/blog">Travel guides</a><a href="/editorial">How we choose</a></nav></header>';
  const compactFooter='<footer class="booking-footer"><a href="/contact">Contact</a><a href="/editorial">Editorial policy</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button type="button" data-open-consent>Privacy choices</button></footer>';
  const consentPanels=consentFixture.replace(/<footer>[\s\S]*?<\/footer>/,'');
  for(const paid of inventory.checks.filter(item=>item.paidLanding)) {
    const faqDocument={'@context':'https://schema.org','@type':'FAQPage',mainEntity:paid.faqs.map(faq=>({'@type':'Question',name:faq.question,acceptedAnswer:{'@type':'Answer',text:faq.answer}}))};
    const listDocument=paid.paidLanding.itemList?`<script type="application/ld+json">${JSON.stringify(paid.paidLanding.itemList)}</script>`:'';
    const offerLinks=paid.paidLanding.offers.map(offer=>`<a href="${htmlEscape(offer.href)}" target="_blank" rel="noopener sponsored" data-landing-id="${paid.paidLanding.id}" data-offer-id="${offer.id}">Check this product</a>`).join('');
    const faqMarkup=paid.faqs.map(faq=>`<details><summary>${htmlEscape(faq.question)}</summary><p>${htmlEscape(faq.answer)}</p></details>`).join('');
    const paidFixture=`<html><head><link rel="canonical" href="${ORIGIN+paid.path}"><script type="application/ld+json">${JSON.stringify(faqDocument)}</script>${listDocument}</head><body data-paid-landing="true">${compactHeader}<div data-landing-page="${paid.paidLanding.id}"><h1>${htmlEscape(paid.name)}</h1><p>${htmlEscape(paid.reviewDate)}</p>${Object.values(paid.markers).map(value=>'<p>'+htmlEscape(value)+'</p>').join('')}${offerLinks}${faqMarkup}</div>${compactFooter}${consentPanels}</body></html>`;
    const paidSitemap=new Set([ORIGIN+paid.path]);
    assert.deepEqual(analyseHtml(paidFixture,paid,paidSitemap).errors,[],`${paid.path}: current-model native offers and FAQ/ItemList contracts`);
    assert.ok(analyseHtml(paidFixture.replace('data-paid-landing="true"','data-paid-landing="false"'),paid,paidSitemap).errors.some(error=>error.includes('body marker')));
    assert.ok(analyseHtml(paidFixture.replace('class="booking-header"','class="full-navigation"'),paid,paidSitemap).errors.some(error=>error.includes('compact booking header')));
    assert.ok(analyseHtml(paidFixture.replace('data-offer-id="'+paid.paidLanding.offers[0].id+'"','data-offer-id="unknown"'),paid,paidSitemap).errors.some(error=>error.includes('offer count/IDs')));
    const param=paid.paidLanding.offers[0].provider==='expedia'?'camref=1101l3MtWX':'partner_id=QW960HO';
    assert.ok(analyseHtml(paidFixture.replace(param,param.split('=')[0]+'=wrong'),paid,paidSitemap).errors.some(error=>error.includes('affiliate URL/ID')));
    assert.ok(analyseHtml(paidFixture.replace('rel="noopener sponsored"','rel="noopener"'),paid,paidSitemap).errors.some(error=>error.includes('CTA contract')));
    assert.ok(analyseHtml(paidFixture.replace('<body data-paid-landing="true">','<body data-paid-landing="true"><script src="https://widget.getyourguide.com/sdk.js"></script>'),paid,paidSitemap).errors.some(error=>error.includes('Active pre-consent')));
    if(paid.paidLanding.itemList)assert.ok(analyseHtml(paidFixture.replace('"numberOfItems":'+paid.paidLanding.offers.length,'"numberOfItems":99'),paid,paidSitemap).errors.some(error=>error.includes('ItemList count')));
    const page=await readFile(path.join(ROOT,'src/pages',paid.path.slice(1,-1)+'.astro'),'utf8');
    assert.ok(page.includes('PaidLandingLayout')&&page.includes('data-offer-id='),`${paid.path}: actual SSR source retains native offer annotations`);
    const faqSource=({'banff-hotels':'banffHotelLandingFaqs','lake-louise-stays':'lakeLouiseStayFaqs','banff-winter-activities':'winterActivityFaqs'})[paid.paidLanding.id];
    assert.ok(page.includes(faqSource+'.map')&&page.includes('FAQPage')&&page.includes('<details>'),`${paid.path}: source FAQ/schema and visible entries use the expected model`);
    if(paid.paidLanding.id==='banff-hotels')assert.ok(page.includes('JSON.stringify(faqSchema)'), 'The Banff FAQ schema must be emitted, not only declared.');
  }
  const bookingHeader=await readFile(path.join(ROOT,'src/components/BookingHeader.astro'),'utf8');
  const bookingFooter=await readFile(path.join(ROOT,'src/components/BookingFooter.astro'),'utf8');
  assert.ok(bookingHeader.includes('booking-header')&&bookingHeader.includes('Booking guide navigation'));
  assert.ok(bookingFooter.includes('booking-footer')&&bookingFooter.includes('data-open-consent'));
  const baseLayout=await readFile(path.join(ROOT,'src/layouts/BaseLayout.astro'),'utf8');
  const footer=await readFile(path.join(ROOT,'src/components/Footer.astro'),'utf8');
  // Inspect the body fragment: Astro's self-closing JSON-LD component in the head is not rendered HTML.
  const sourceBody=baseLayout.slice(baseLayout.indexOf('<body')).replace('{focusedLanding ? <BookingFooter /> : <Footer />}',footer).replace('<Footer />',footer);
  assert.deepEqual(consentMarkupErrors(sourceBody,htmlElements(sourceBody),{}),[],'Current shared source must retain the consent markup contract.');
  assert.deepEqual(activeOptionalResources(sourceBody),[]);
  const {consentHarness}=await import('./lib/consent-harness.mjs');
  const fresh=consentHarness({initTracking:true});assert.equal(fresh.providerScripts.length,0);assert.equal(fresh.linkClick('https://www.getyourguide.com/banff-l284/?partner_id=QW960HO').prevented,0);
  fresh.click('cookie-reject');assert.equal(fresh.providerScripts.length,0);
  assert.deepEqual(xmlLocations(`<sitemapindex><sitemap><loc>${ORIGIN}/sitemap-0.xml</loc></sitemap></sitemapindex>`, 'sitemapindex'), [`${ORIGIN}/sitemap-0.xml`]);
  assert.throws(() => xmlLocations('<sitemapindex><sitemap><loc>https://example.com/sitemap.xml</loc></sitemap></sitemapindex>', 'sitemapindex'));
  assert.throws(() => xmlLocations('<!DOCTYPE x><urlset><url><loc>https://banffbound.com/</loc></url></urlset>', 'urlset'));
  assert.throws(() => options(['--revision', revision, '--fingerprint', fingerprint]));
  assert.throws(() => options(['--revision', revision, '--revision', revision, '--report', 'x.json']));
  let inFlight = 0, maximum = 0;
  const values = await pool(Array.from({ length: 19 }, (_, i) => i), async value => { inFlight++; maximum = Math.max(maximum, inFlight); await new Promise(resolve => setTimeout(resolve, 1)); inFlight--; return value; });
  assert.deepEqual(values, Array.from({ length: 19 }, (_, i) => i)); assert.ok(maximum <= CONCURRENCY && maximum > 1);
  for (const photo of inventory.photos) assert.equal(sha256(await readFile(path.join(ROOT, 'public', photo.src))), photo.sha256, `Local manifest/photo mismatch: ${photo.id}`);
  console.log('Offline verifier fixtures passed: exact receipt/UTC identity, 193-route inventory and current eligibility, visible FAQ/schema/hidden content, canonical/noindex/sitemap failures, safe sitemap scope, seven local photo hashes, bounded concurrency, per-GET nonce and arguments; active provider script/frame detection vs inert config/native anchors, consent controls/fallbacks and current denied runtime; all three paid landings, 6/5/3 native affiliate identities, compact chrome, body markers and FAQ/ItemList fixtures. No network, report write, Git or host calls.');
}

try {
  if (process.argv.length === 3 && process.argv[2] === '--self-test') await selfTest();
  else await verify(options(process.argv.slice(2)));
} catch (error) {
  console.error(String(error.message ?? error.name));
  process.exitCode = 1;
}
