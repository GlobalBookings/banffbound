export const banffAppStoreApps = {
  'banffbound': { id: '6829106184', name: 'BanffBound' },
  'banff-audio-walk': { id: '6831413559', name: 'Banff Audio Walk' },
} as const;

// Public acquisition tokens generated in App Store Connect for the Spires Digital team.
const providerToken = '129009564';
const mediaType = '8';
const campaigns = {
  'banffbound': {
    home: 'banffbound-home',
    'apps-guide': 'banffbound-apps-guide',
  },
  'banff-audio-walk': {
    home: 'banffbound-audio-home',
    'apps-guide': 'banffbound-audio-apps-guide',
    landing: 'banffbound-audio-landing',
    downtown: 'banffbound-audio-downtown',
    'bow-falls': 'banffbound-audio-bow-falls',
    itinerary: 'banffbound-audio-itinerary',
  },
} as const;

type App = keyof typeof banffAppStoreApps;
export type AppStoreSource<T extends App> = keyof typeof campaigns[T];

export function banffAppStoreLink<T extends App>(app: T, source: AppStoreSource<T>) {
  const campaign = campaigns[app][source] as string;
  const url = new URL(`https://apps.apple.com/app/apple-store/id${banffAppStoreApps[app].id}`);
  url.searchParams.set('pt', providerToken);
  url.searchParams.set('ct', campaign);
  url.searchParams.set('mt', mediaType);
  return url.href;
}

export function banffAppStoreClick(url: URL) {
  if (url.protocol !== 'https:' || url.host !== 'apps.apple.com') return;
  const productId = url.pathname.match(/^(?:\/[a-z]{2})?\/app(?:\/[^/]+)?\/id(\d+)\/?$/i)?.[1];
  const app = (Object.keys(banffAppStoreApps) as App[]).find(key => banffAppStoreApps[key].id === productId);
  if (!app) return;
  const campaign = url.searchParams.get('ct');
  const knownCampaign = url.searchParams.get('pt') === providerToken
    && url.searchParams.get('mt') === mediaType
    && Object.values<string>(campaigns[app]).some(value => value === campaign);
  return {
    app_store_app: banffAppStoreApps[app].name,
    ...(knownCampaign && { app_store_campaign: campaign }),
  };
}
