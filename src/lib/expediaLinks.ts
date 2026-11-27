import generatedLinks from '../data/expediaAffiliateLinks.json';

const links: Record<string, string> = generatedLinks;
const hosts = new Set(['expedia.ca', 'www.expedia.ca', 'expedia.com', 'www.expedia.com']);
const ownReferences = new Set(['1101l3MtWX', 'KB6G4xt']);
const bookingParameters = new Set(['chkin', 'chkout', 'startDate', 'endDate', 'adults', 'children', 'rooms', 'rm1', 'rm2', 'rm3']);

/** Keep the real property visible to reporting without exposing booking/query data. */
export function expediaDestination(href: string): URL | null {
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password) return null;
    if (url.pathname === '/affiliate' && ownReferences.has(url.searchParams.get('camref') || '')) {
      const target = new URL(url.searchParams.get('landingPage') || '');
      return target.protocol === 'https:' && hosts.has(target.hostname) && !target.username && !target.password ? target : null;
    }
    return url;
  } catch { return null; }
}

/** Portal-created referral routes; ordinary links and other publishers are untouched. */
export function expediaAffiliateHref(href: string): string {
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password
      || !ownReferences.has(url.searchParams.get('camref') || '') || /^\/affiliates?(?:\/|$)/i.test(url.pathname)) return href;
    let key: string | undefined;
    const property = url.pathname.match(/\.h(\d+)\.Hotel-Information$/i)?.[1];
    if (property) {
      // The previous directory used these wrong IDs; exact named-property corrections.
      const corrected = property === '893459' && /Mountaineer/i.test(url.pathname) ? '5157510'
        : property === '893466' && /Paradise/i.test(url.pathname) ? '7829397'
        : property === '6584769' && /Baker-Creek/i.test(url.pathname) ? '7710611' : property;
      key = `hotel:${corrected}`;
    } else if (/^\/Hotel-Search$/i.test(url.pathname)) {
      const destination = url.searchParams.get('destination');
      const aliases: Record<string, string> = { 'Canmore': 'Canmore, Alberta', 'Lake Louise': 'Lake Louise, Alberta', 'Golden, BC': 'Golden, British Columbia' };
      if (destination) key = `search:${aliases[destination] || destination}`;
    } else if (url.pathname === '/Banff-Hotels.d602125.Travel-Guide-Hotels') key = 'search:Banff, Alberta';
    else if (/^\/Cars$/i.test(url.pathname)) key = url.searchParams.get('locn') === 'YYC' ? 'car:yyc' : 'car:canada';
    const generated = key && links[key];
    if (!generated) return href;
    const referral = new URL(generated);
    const destination = new URL(referral.searchParams.get('landingPage')!);
    let changed = false;
    for (const [name, value] of url.searchParams) if (bookingParameters.has(name)) {
      destination.searchParams.set(name, value); changed = true;
    }
    if (changed) referral.searchParams.set('landingPage', destination.href);
    return referral.href;
  } catch { return href; }
}

export function applyExpediaAffiliateLinks(): number {
  if (typeof document === 'undefined') return 0;
  let changed = 0;
  for (const link of document.querySelectorAll?.<HTMLAnchorElement>('a[href]') || []) {
    const next = expediaAffiliateHref(link.href);
    if (next !== link.href) { link.href = next; changed++; }
  }
  return changed;
}

/** Static HTML is corrected too, so referrals do not depend on JavaScript/consent. */
export function rewriteExpediaAnchors(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<a\b[^>]*>/gi, tag => {
    if (!/^<a\b/i.test(tag)) return tag;
    return tag.replace(/(\bhref\s*=\s*)(["'])(.*?)\2/i, (attribute, prefix, quote, encoded) => {
      const href = encoded.replace(/&amp;/g, '&').replace(/&#(?:38|x26);/gi, '&');
      const next = expediaAffiliateHref(href);
      return next === href ? attribute : `${prefix}${quote}${next.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}${quote}`;
    });
  });
}
