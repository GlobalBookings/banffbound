import { skokiGuideOverrides } from './skokiGuideOverrides';
import { bowLakeGuideOverrides } from './bowLakeGuideOverrides';
import { jasperGuideOverrides } from './jasperGuideOverrides';
import { diningGuideOverrides } from './diningGuideOverrides';
import { cabinGuideOverrides } from './cabinGuideOverrides';
import { nightlifeGuideOverrides } from './nightlifeGuideOverrides';
import { liveMusicGuideOverrides } from './liveMusicGuideOverrides';
import { drinkOfferGuideOverrides } from './drinkOfferGuideOverrides';
import { parkwayGuideOverrides } from './parkwayGuideOverrides';
import { minnewankaGuideOverrides } from './minnewankaGuideOverrides';
import { gondolaGuideOverrides } from './gondolaGuideOverrides';
import { springSkiGuideOverrides } from './springSkiGuideOverrides';
import { peytoGuideOverrides } from './peytoGuideOverrides';
import { scenicFlightGuideOverrides } from './scenicFlightGuideOverrides';
import { goldenDayGuideOverrides } from './goldenDayGuideOverrides';
import { heliSkiGuideOverrides } from './heliSkiGuideOverrides';
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

export const reviewedBlogBodies: Record<string, string> = { ...winterGuideOverrides, ...winterActivityOverrides, ...winterTripOverrides, ...winterResortOverrides, ...winterSeasonOverrides, ...viewGuideOverride, ...winterWarmUpOverrides, ...winterWellnessLegacyOverrides, ...winterLibraryOverrides, ...visitorDestinationOverrides, ...lakeJourneyOverrides, ...cyclingGuideOverrides, ...bowLakeGuideOverrides, ...jasperGuideOverrides, ...diningGuideOverrides, ...cabinGuideOverrides, ...nightlifeGuideOverrides, ...liveMusicGuideOverrides, ...drinkOfferGuideOverrides, ...parkwayGuideOverrides, ...minnewankaGuideOverrides, ...gondolaGuideOverrides, ...springSkiGuideOverrides, ...peytoGuideOverrides, ...scenicFlightGuideOverrides, ...goldenDayGuideOverrides, ...heliSkiGuideOverrides, ...skokiGuideOverrides };
export const resolvedBlogContent: Record<string, string> = { ...blogContentMain, ...blogContent3, ...reviewedBlogBodies };

export function resolveBlogContent(slug: string): string {
  return applyVisitorHotelLocationCorrections(slug, resolvedBlogContent[slug] || '<p>Content coming soon.</p>');
}

// These authored comparisons already contain relevant native booking routes.
export const authoredBookingGuideSlugs = [...Object.keys(bowLakeGuideOverrides), ...Object.keys(jasperGuideOverrides), ...Object.keys(diningGuideOverrides), ...Object.keys(cabinGuideOverrides), ...Object.keys(nightlifeGuideOverrides), ...Object.keys(liveMusicGuideOverrides), ...Object.keys(drinkOfferGuideOverrides), ...Object.keys(parkwayGuideOverrides), ...Object.keys(minnewankaGuideOverrides), ...Object.keys(gondolaGuideOverrides), ...Object.keys(springSkiGuideOverrides), ...Object.keys(peytoGuideOverrides), ...Object.keys(scenicFlightGuideOverrides), ...Object.keys(goldenDayGuideOverrides), ...Object.keys(heliSkiGuideOverrides), ...Object.keys(skokiGuideOverrides)];
