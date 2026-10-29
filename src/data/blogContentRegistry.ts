// Canonical body precedence shared by the page and content-health checks.
import { cyclingGuideOverrides } from './cyclingGuideOverrides';
import { lakeJourneyOverrides } from './lakeJourneyOverrides';
import { visitorDestinationOverrides, applyVisitorHotelLocationCorrections } from './visitorDestinationOverrides';
import { winterLibraryOverrides } from './winterLibraryOverrides';
import { winterWellnessLegacyOverrides } from './winterWellnessLegacyOverrides';
import { winterWarmUpOverrides } from './winterWarmUpOverrides';
import { viewGuideOverride } from './viewGuideOverride';
import { winterResortOverrides } from './winterResortOverrides';
import { winterSeasonOverrides } from './winterSeasonOverrides';
import { blogContent as blogContentMain } from './blogContent';
import { blogContent3 } from './blogContent3';
import { winterTripOverrides } from './winterTripOverrides';
import { winterActivityOverrides } from './winterActivityOverrides';
import { winterGuideOverrides } from './winterGuideOverrides';

export const reviewedBlogBodies: Record<string, string> = { ...winterGuideOverrides, ...winterActivityOverrides, ...winterTripOverrides, ...winterResortOverrides, ...winterSeasonOverrides, ...viewGuideOverride, ...winterWarmUpOverrides, ...winterWellnessLegacyOverrides, ...winterLibraryOverrides, ...visitorDestinationOverrides, ...lakeJourneyOverrides, ...cyclingGuideOverrides };
export const resolvedBlogContent: Record<string, string> = { ...blogContentMain, ...blogContent3, ...reviewedBlogBodies };

export function resolveBlogContent(slug: string): string {
  return applyVisitorHotelLocationCorrections(slug, resolvedBlogContent[slug] || '<p>Content coming soon.</p>');
}
