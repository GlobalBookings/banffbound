// Custom labels come from fixed page markup and explicitly known ad cohorts.
// Raw query values, search terms, click IDs and booking details never enter events.
export const LANDING_IDS = ['banff-hotels', 'lake-louise-stays', 'banff-winter-activities', 'activity-guide', 'activities', 'travel-guide'];
export const PAID_COHORTS = {
  bb_ca_winter_50_test: { source: 'google', medium: 'cpc', campaignId: '24416287886' },
  bb_ca_hotels_7_day_test: { source: 'google', medium: 'cpc', campaignId: '24411162375' },
};
const label = (value, max = 80) => typeof value === 'string' && value.length <= max && /^[a-z0-9][a-z0-9-]*$/.test(value);
export function paidTrafficSource(href) {
  try {
    const url = new URL(href);
    const source = (url.searchParams.get('utm_source') || '').toLowerCase();
    const medium = (url.searchParams.get('utm_medium') || '').toLowerCase();
    return ['google', 'bing'].includes(source) && ['cpc', 'ppc', 'paid_search'].includes(medium) ? source : 'not_tagged_paid';
  } catch { return 'not_tagged_paid'; }
}
export function knownPaidCohort(href) {
  try {
    const url = new URL(href);
    // A public label describes a tagged arrival; it is not proof of a charged ad click.
    if (['utm_campaign', 'utm_source', 'utm_medium'].some(key => url.searchParams.getAll(key).length !== 1)) return null;
    const name = url.searchParams.get('utm_campaign');
    const cohort = Object.hasOwn(PAID_COHORTS, name) ? PAID_COHORTS[name] : null;
    return cohort && url.searchParams.get('utm_source') === cohort.source && url.searchParams.get('utm_medium') === cohort.medium ? name : null;
  } catch { return null; }
}
export function manualCampaignContext(href, contentId) {
  const name = knownPaidCohort(href);
  if (!name) return {};
  const cohort = PAID_COHORTS[name];
  const result = { campaign_source: cohort.source, campaign_medium: cohort.medium, campaign_name: name, campaign_id: cohort.campaignId };
  if (label(contentId)) result.campaign_content = contentId;
  return result;
}
export function cleanLandingContext(input = {}) {
  if (!input || typeof input !== 'object' || !LANDING_IDS.includes(input.landing_id)) return {};
  const result = { landing_id: input.landing_id };
  if (label(input.offer_id)) result.offer_id = input.offer_id;
  if (['google', 'bing', 'not_tagged_paid'].includes(input.paid_source)) result.paid_source = input.paid_source;
  if (label(input.placement, 40)) result.placement = input.placement;
  if (label(input.content_id)) result.content_id = input.content_id;
  if (['activity-guide', 'activity-directory', 'booking-comparison', 'hotel-guide', 'travel-guide'].includes(input.content_type)) result.content_type = input.content_type;
  if (Object.hasOwn(PAID_COHORTS, input.paid_cohort)) result.paid_cohort = input.paid_cohort;
  return result;
}
export function trustedAffiliateTarget(href, path, allowSearch = false) {
  try {
    const target = new URL(href);
    if (target.origin !== 'https://www.getyourguide.com' || target.username || target.password || target.searchParams.getAll('partner_id').length !== 1 || target.searchParams.get('partner_id') !== 'QW960HO') return null;
    if (!path || target.pathname !== path || !((allowSearch && path === '/s/') || /^\/[a-z0-9-]+\/[a-z0-9-]+-t\d+\/$/.test(path))) return null;
    return target;
  } catch { return null; }
}
export function landingContext(element) {
  if (typeof document === 'undefined') return {};
  const page = element?.closest?.('[data-landing-page]') || document.querySelector?.('[data-landing-page]');
  const data = page?.dataset || {};
  const landing = element?.dataset?.landingId || data.landingPage;
  const href = element?.href || element?.closest?.('a[href]')?.href;
  const matchesPageOffer = Boolean(trustedAffiliateTarget(href, data.affiliateTargetPath));
  return cleanLandingContext({
    landing_id: landing, offer_id: element?.dataset?.offerId || (matchesPageOffer ? data.offerId : undefined),
    placement: element?.dataset?.landingPlacement || (matchesPageOffer ? 'article-inline' : undefined),
    content_id: element?.dataset?.contentId || data.contentId,
    content_type: element?.dataset?.contentType || data.contentType,
    paid_source: paidTrafficSource(window.location.href), paid_cohort: knownPaidCohort(window.location.href),
  });
}
