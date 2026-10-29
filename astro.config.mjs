// @ts-check
import { bowLakeGuideMetadata } from './src/data/bowLakeGuideOverrides.ts';
import { jasperGuideMetadata } from './src/data/jasperGuideOverrides.ts';
import { diningGuideMetadata } from './src/data/diningGuideOverrides.ts';
import { cabinGuideMetadata } from './src/data/cabinGuideOverrides.ts';
import { nightlifeGuideMetadata } from './src/data/nightlifeGuideOverrides.ts';
import { liveMusicGuideMetadata } from './src/data/liveMusicGuideOverrides.ts';
import { drinkOfferGuideMetadata } from './src/data/drinkOfferGuideOverrides.ts';
import { parkwayGuideMetadata } from './src/data/parkwayGuideOverrides.ts';
import { minnewankaGuideMetadata } from './src/data/minnewankaGuideOverrides.ts';
import { gondolaGuideMetadata } from './src/data/gondolaGuideOverrides.ts';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { legacyTextCorrections } from './src/data/legacyTextCorrections.ts';
import { townStayPlanningReviewedAt, townStayUpdatedSlugs } from './src/data/townStayPlanning.ts';
import { cyclingGuideMetadata } from './src/data/cyclingGuideOverrides.ts';
import { lakeJourneyMetadata } from './src/data/lakeJourneyOverrides.ts';
import { visitorDestinationMetadata, visitorHotelLocationCorrections, visitorHotelCorrectionDate } from './src/data/visitorDestinationOverrides.ts';
import { winterLibraryMetadata } from './src/data/winterLibraryOverrides.ts';
import { trails } from './src/data/trails.ts';
import { directoryHotels, unreviewedHotelDirectorySlugs } from './src/data/hotelDirectory.ts';
import { winterWellnessLegacyMetadata } from './src/data/winterWellnessLegacyOverrides.ts';
import { winterWarmUpMetadata } from './src/data/winterWarmUpOverrides.ts';
import { viewGuideMetadata } from './src/data/viewGuideOverride.ts';
import { winterResortMetadata } from './src/data/winterResortOverrides.ts';
import { winterSeasonMetadata } from './src/data/winterSeasonOverrides.ts';
import { blogRedirects } from './src/data/redirects.mjs';
import { winterGuideMetadata } from './src/data/winterGuideOverrides.ts';
import { winterTripMetadata } from './src/data/winterTripOverrides.ts';
import { winterActivityMetadata } from './src/data/winterActivityOverrides.ts';
const reviewedBlogMetadata = { ...winterGuideMetadata, ...winterActivityMetadata, ...winterTripMetadata, ...winterResortMetadata, ...winterSeasonMetadata, ...viewGuideMetadata, ...winterWarmUpMetadata, ...winterWellnessLegacyMetadata, ...winterLibraryMetadata, ...visitorDestinationMetadata, ...lakeJourneyMetadata, ...cyclingGuideMetadata, ...bowLakeGuideMetadata, ...jasperGuideMetadata, ...diningGuideMetadata, ...cabinGuideMetadata, ...nightlifeGuideMetadata, ...liveMusicGuideMetadata, ...drinkOfferGuideMetadata, ...parkwayGuideMetadata, ...minnewankaGuideMetadata, ...gondolaGuideMetadata };
const reviewedBlogDates = new Map(Object.entries(reviewedBlogMetadata).map(([slug, post]) => [slug, post.lastUpdated]));

const excludedTrails = new Set(trails.filter(trail => trail.directoryEligible === false).map(trail => trail.slug));
const reviewedTrailDates = new Map(trails.filter(trail => trail.reviewedAt).map(trail => [trail.slug, trail.reviewedAt]));
const reviewedHotelDates = new Map(directoryHotels.filter(hotel => hotel.checkedOn).map(hotel => [hotel.slug, hotel.checkedOn]));

// https://astro.build/config
export default defineConfig({
  site: 'https://banffbound.com',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter(page) {
        // Exclude every consolidated/redirected slug plus a few legacy duplicates.
        const pathname = new URL(page).pathname.replace(/\/$/, '');
        if (pathname === '/build-info.json' || (pathname.startsWith('/hotel-directory/') && unreviewedHotelDirectorySlugs.has(pathname.slice('/hotel-directory/'.length)))) return false;
        const excludeSlugs = [
          ...Object.keys(blogRedirects),
          'banff-restaraunts', 'eating-out-in-banff', 'sky-bistro-banff',
        ];
        if (excludedTrails.has(new URL(page).pathname.replace(/^\/trails\//, '').replace(/\/$/, ''))) return false;
        return !excludeSlugs.some(slug => page.endsWith(`/blog/${slug}/`) || page.endsWith(`/blog/${slug}`));
      },
      serialize(item) {
        // Date only content actually reviewed; build time is not an editorial update.
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        if (/^\/(winter|learn-to-ski|ski-day-planner|winter-stays|towns)(\/|$)/.test(path) || ['/', '/skiing', '/ski-pass-calculator', '/sunshine-vs-lake-louise-vs-norquay', '/canmore-vs-banff', '/conditions', '/trip-builder', '/hotels', '/accommodation', '/photo-spots', '/car-free-banff', '/calgary-to-banff', '/packing-list', '/wellness', '/weather', '/weather-webcams', '/monthly-weather', '/what-to-do-today', '/family-guide', '/dog-friendly', '/events'].includes(path) || reviewedBlogDates.has(path.replace('/blog/', ''))) {
          item.lastmod = new Date('2026-10-28');
        }
        const reviewedDate = path.startsWith('/trails/') ? reviewedTrailDates.get(path.slice('/trails/'.length)) : path.startsWith('/hotel-directory/') ? reviewedHotelDates.get(path.slice('/hotel-directory/'.length)) : undefined;
        if (reviewedDate) item.lastmod = new Date(reviewedDate);
        if (['/winter', '/trail-map', '/quiet-trails', '/alternatives', '/hotel-directory', '/tools', '/accessible-trails', '/paddling', '/activities', '/things-to-do', '/vacation-rentals', '/lakes', '/lake-faq', '/parking', '/shuttle-reservations', '/wildlife', '/wildlife-tracker', '/wildlife-calendar', '/wildlife-safety', '/bear-spray', '/biking', '/privacy', '/tours', '/icefields-parkway-planner', '/book/banff-hotels', '/book/lake-louise-stays', '/book/banff-winter-activities'].includes(path) || path.startsWith('/activities/') || Object.hasOwn(visitorDestinationMetadata, path.replace('/blog/', ''))) item.lastmod = new Date('2026-10-29');
        if (Object.hasOwn(visitorHotelLocationCorrections, path.replace('/blog/', ''))) item.lastmod = new Date(visitorHotelCorrectionDate);
        const textCorrection = legacyTextCorrections[path.replace('/blog/', '')];
        if (textCorrection) item.lastmod = new Date(textCorrection.correctedAt);
        if (['/learn-to-ski', '/ski-day-planner'].includes(path) || townStayUpdatedSlugs.some(slug => path === `/towns/${slug}`)) item.lastmod = new Date(townStayPlanningReviewedAt);
        const blogDate = reviewedBlogDates.get(path.replace('/blog/', ''));
        if (blogDate) item.lastmod = new Date(blogDate);
        // Boost priority for high-value pages
        if (item.url === 'https://banffbound.com/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/hotel-directory/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/trails/')) {
          item.priority = 0.8;
          item.changefreq = 'daily';
        } else if (
          item.url.includes('/trip-builder') ||
          item.url.includes('/trail-map') ||
          item.url.includes('/weather') ||
          item.url.includes('/what-to-do-today')
        ) {
          item.priority = 0.9;
          item.changefreq = 'daily';
        }
        return item;
      },
    }),
  ],
});
