// Only fixed page/offer labels and a bounded paid-source marker enter custom events.
// Raw campaign values, click IDs, query strings and booking details are not forwarded.
export const LANDING_IDS = ['banff-hotels', 'lake-louise-stays', 'banff-winter-activities'];
export function paidTrafficSource(href) {
  try {
    const url = new URL(href);
    const source = (url.searchParams.get('utm_source') || '').toLowerCase();
    const medium = (url.searchParams.get('utm_medium') || '').toLowerCase();
    return ['google', 'bing'].includes(source) && ['cpc', 'ppc', 'paid_search'].includes(medium) ? source : 'not_tagged_paid';
  } catch { return 'not_tagged_paid'; }
}
export function cleanLandingContext(input = {}) {
  if (!input || typeof input !== 'object' || !LANDING_IDS.includes(input.landing_id)) return {};
  const result = { landing_id: input.landing_id };
  if (typeof input.offer_id === 'string' && /^[a-z0-9-]{1,80}$/.test(input.offer_id)) result.offer_id = input.offer_id;
  if (['google', 'bing', 'not_tagged_paid'].includes(input.paid_source)) result.paid_source = input.paid_source;
  if (typeof input.placement === 'string' && /^[a-z0-9-]{1,40}$/.test(input.placement)) result.placement = input.placement;
  return result;
}
export function landingContext(element) {
  if (typeof document === 'undefined') return {};
  const page = element?.closest?.('[data-landing-page]') || document.querySelector?.('[data-landing-page]');
  const landing = element?.dataset?.landingId || page?.dataset?.landingPage;
  return cleanLandingContext({ landing_id: landing, offer_id: element?.dataset?.offerId, placement: element?.dataset?.landingPlacement, paid_source: paidTrafficSource(window.location.href) });
}
