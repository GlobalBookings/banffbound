import type { CommerceItem, CommerceLink, CommerceSection } from '../data/commerce';

export const COMMERCE_PAGE_SIZE = 12;
const plain = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const editorialText = (value: string | null) => !!value && value.length <= 180 && /^[\p{L}\p{N} .,()'’&+/_-]+$/u.test(value);

function queryIs(url: URL, allowed: readonly string[]): boolean {
  const keys = [...url.searchParams.keys()];
  return keys.length === new Set(keys).size && keys.every(key => allowed.includes(key));
}

/** Fixed catalogue destinations only. Never append search, trip or device data. */
export function safeCommerceUrl(link: CommerceLink): string | null {
  if (typeof link.url !== 'string' || link.url.length > 2000 || link.url !== link.url.trim() || /[\s\u0000-\u001f\u007f]/.test(link.url)) return null;
  try {
    const url = new URL(link.url);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || /%0[ad]/i.test(link.url)) return null;
    const host = url.hostname;
    if (link.provider === 'BanffBound') {
      return !link.affiliate && link.kind === 'guide' && ['banffbound.com', 'www.banffbound.com'].includes(host)
        && !url.search && /^\/[a-z0-9/_-]*$/i.test(url.pathname) && (!url.hash || /^#[a-z0-9_-]+$/i.test(url.hash)) ? link.url : null;
    }
    if (url.hash || !link.affiliate) return null;
    if (link.provider === 'GetYourGuide') {
      if (!['getyourguide.com', 'www.getyourguide.com'].includes(host)
        || !queryIs(url, ['partner_id', 'cmp', 'q']) || url.searchParams.get('partner_id') !== 'QW960HO'
        || (url.searchParams.has('cmp') && !/^[a-z0-9_-]{1,100}$/i.test(url.searchParams.get('cmp')!))
        || (url.searchParams.has('q') && !editorialText(url.searchParams.get('q')))) return null;
      return link.kind === 'product' ? /-t\d+\/?$/.test(url.pathname) ? link.url : null
        : link.kind === 'search' && /^\/[a-z0-9/_-]*$/i.test(url.pathname) ? link.url : null;
    }
    if (link.provider === 'Expedia') {
      if (!['expedia.ca', 'www.expedia.ca', 'expedia.com', 'www.expedia.com'].includes(host)) return null;
      if (link.kind === 'referral') return url.href === 'https://expedia.com/affiliate/KB6G4xt' ? link.url : null;
      if (!queryIs(url, ['camref', 'destination']) || url.searchParams.get('camref') !== '1101l3MtWX') return null;
      if (link.kind === 'property') return !url.searchParams.has('destination') && /\.h\d+\.Hotel-Information\/?$/i.test(url.pathname) ? link.url : null;
      return link.kind === 'search' && ((url.pathname === '/Hotel-Search' && editorialText(url.searchParams.get('destination')))
        || !url.searchParams.has('destination') && /\.Travel-Guide-Hotels\/?$/i.test(url.pathname)) ? link.url : null;
    }
    if (link.provider === 'Vrbo') {
      if (host !== 'vrbo.com' || url.pathname !== '/affiliate' || !['property', 'referral'].includes(link.kind)
        || !queryIs(url, ['landingPage', 'camref', 'creativeref', 'adref'])
        || url.searchParams.get('camref') !== '1101l3MtWL' || url.searchParams.get('creativeref') !== '1011l63087'
        || url.searchParams.get('adref') !== 'PZBJVX1Er0') return null;
      const destination = new URL(url.searchParams.get('landingPage') || '');
      return destination.protocol === 'https:' && ['vrbo.com', 'www.vrbo.com'].includes(destination.hostname)
        && !destination.username && !destination.password && !destination.port && !destination.search && !destination.hash
        && destination.pathname !== '/' && destination.pathname !== '/affiliate' ? link.url : null;
    }
    // No approved native Amazon or DiscoverCars target exists in this snapshot.
    return null;
  } catch { return null; }
}

export function commerceLinkTitle(link: CommerceLink, status?: CommerceItem['status']): string {
  if (link.kind === 'guide') return 'Read the full guide in browser';
  if (link.kind === 'search') return 'Browse options in browser';
  if (status === 'reference-only') return 'View listing in browser';
  if (status === 'check-details') return 'Check details in browser';
  if (link.kind === 'property') return 'Check rooms in browser';
  if (link.kind === 'referral') return 'Compare options in browser';
  return 'View dates in browser';
}

export function isAllowedCommerceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname;
    const provider: CommerceLink['provider'] | null = ['getyourguide.com', 'www.getyourguide.com'].includes(host) ? 'GetYourGuide'
      : ['expedia.ca', 'www.expedia.ca', 'expedia.com', 'www.expedia.com'].includes(host) ? 'Expedia'
        : host === 'vrbo.com' ? 'Vrbo' : ['banffbound.com', 'www.banffbound.com'].includes(host) ? 'BanffBound' : null;
    if (!provider) return false;
    const kind: CommerceLink['kind'] = provider === 'BanffBound' ? 'guide' : provider === 'Vrbo' ? 'property'
      : /\/affiliate\//.test(url.pathname) ? 'referral' : /-t\d+\/?$/.test(url.pathname) ? 'product'
        : /\.Hotel-Information\/?$/i.test(url.pathname) ? 'property' : 'search';
    return safeCommerceUrl({ id: 'checked-destination', label: provider, url: value, provider, kind, affiliate: provider !== 'BanffBound' }) !== null;
  } catch { return false; }
}

export type CommerceFilters = { section: CommerceSection; query?: string; area?: string; category?: string };
export function filterCommerceItems(items: readonly CommerceItem[], filters: CommerceFilters): CommerceItem[] {
  const words = plain((filters.query || '').slice(0, 180)).split(/\s+/).filter(Boolean);
  return items.filter(item => item.section === filters.section
    && (!filters.area || filters.area === 'all' || item.area === filters.area)
    && (!filters.category || filters.category === 'all' || item.category === filters.category)
    && words.every(word => plain(`${item.title} ${item.summary} ${item.area} ${item.category} ${item.operator || ''} ${item.links.map(link => `${link.provider} ${link.label}`).join(' ')}`).includes(word)));
}

export function commerceFacets(items: readonly CommerceItem[], section: CommerceSection): { areas: string[]; categories: string[] } {
  const current = items.filter(item => item.section === section);
  return {
    areas: [...new Set(current.map(item => item.area).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    categories: [...new Set(current.map(item => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  };
}

export function relatedCommerceItems(items: readonly CommerceItem[], selection: { placeId?: string; activityId?: string }): CommerceItem[] {
  if (!selection.placeId && !selection.activityId) return [];
  return items.filter(item => ['tours', 'stays'].includes(item.section) && item.status !== 'reference-only'
    && item.links.some(link => ['product', 'property'].includes(link.kind))
    && (selection.placeId ? item.relatedPlaceIds?.includes(selection.placeId) : !!selection.activityId && item.relatedActivityIds?.includes(selection.activityId)));
}
