import { knownPaidCohort, trustedAffiliateTarget } from './landingAttribution.js';

// Native referrals work with or without JavaScript or analytics consent. This only
// selects a fixed publisher label for a recognised tagged arrival; no data is sent.
export function paidBookingHref(link, pageHref, pageCampaign) {
  if (knownPaidCohort(pageHref) !== 'bb_ca_winter_50_test') return null;
  const wrapper = link?.closest?.('[data-affiliate-target-path]');
  const fixedCampaign = link?.dataset?.paidAffiliateCampaign || wrapper?.dataset?.paidAffiliateCampaign || pageCampaign;
  if (fixedCampaign !== 'bb_ca_winter_50_test' && !(typeof fixedCampaign === 'string' && /^bb_ca_activities_[a-z0-9_-]{1,60}$/.test(fixedCampaign))) return null;
  const ownPath = link?.dataset?.affiliateTargetPath;
  const target = trustedAffiliateTarget(link?.href, ownPath || wrapper?.dataset?.affiliateTargetPath, Boolean(ownPath));
  if (!target) return null;
  target.searchParams.set('cmp', fixedCampaign);
  return target.href;
}
export function applyPaidBookingAttribution() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 0;
  const pageCampaign = document.body?.dataset?.paidAffiliateCampaign || document.querySelector?.('[data-paid-affiliate-campaign]')?.dataset?.paidAffiliateCampaign;
  let changed = 0;
  for (const link of document.querySelectorAll?.('a[href]') || []) {
    const next = paidBookingHref(link, window.location.href, pageCampaign);
    if (next && next !== link.href) { link.href = next; changed++; }
  }
  return changed;
}
