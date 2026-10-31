/** Published website recommendations, separate from the original offline place catalogue. */
export type CommerceSection = 'tours' | 'stays' | 'guides' | 'extras';
export type CommerceLink = {
  id: string;
  label: string;
  url: string;
  provider: 'GetYourGuide' | 'Expedia' | 'Vrbo' | 'DiscoverCars' | 'Amazon' | 'BanffBound';
  kind: 'product' | 'property' | 'search' | 'referral' | 'guide';
  affiliate: boolean;
};
export type CommerceItem = {
  id: string;
  section: CommerceSection;
  title: string;
  summary: string;
  area: string;
  category: string;
  operator?: string;
  guideUrl?: string;
  reviewedAt?: string;
  notice?: string;
  /** Editorial record readiness; this never reports current operation or availability. */
  status?: 'ready' | 'check-details' | 'reference-only';
  relatedPlaceIds?: string[];
  relatedActivityIds?: string[];
  links: CommerceLink[];
};
export type CommerceSectionDescriptor = { id: CommerceSection; title: string; summary: string };
export { commerceItems, commerceSections, commerceDataVersion, commerceProvenance } from './commerce.generated';
