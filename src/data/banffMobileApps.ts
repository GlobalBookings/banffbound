import { banffAppStoreApps } from './banffAppStore';

export const banffMobileAppsPath = '/banff-mobile-apps/';
export const banffMobileAppsReviewedOn = '2026-11-13';

export const banffBoundApps = [
  {
    id: 'banffbound',
    name: banffAppStoreApps.banffbound.name,
    purpose: 'Maps and trip planning',
    description: 'Find places around Banff, Lake Louise and Canmore, then save them to your itinerary.',
    platform: 'iOS 16.4 or later',
    icon: '/images/mobile-apps/banffbound.jpg',
    more: { label: 'Open the web app', href: '/app/' },
  },
  {
    id: 'banff-audio-walk',
    name: banffAppStoreApps['banff-audio-walk'].name,
    purpose: 'A self-guided walk through town',
    description: 'Start with six narrated stops from Banff Avenue to the Bow River. The free walk takes about 30 minutes.',
    platform: 'iOS 18 or later',
    icon: '/images/mobile-apps/banff-audio-walk.jpg',
    more: { label: 'Listen to a sample', href: '/banff-audio-walk/#listen' },
  },
] as const;
