// Public App Store campaign links generated in App Store Connect for Banff Audio Walk.
const appStoreURL = 'https://apps.apple.com/app/apple-store/id6831413559';

export const banffAudioWalkSources = {
  landing: 'banffbound-audio-landing',
  downtown: 'banffbound-audio-downtown',
  'bow-falls': 'banffbound-audio-bow-falls',
  itinerary: 'banffbound-audio-itinerary',
} as const;

export function banffAudioWalkStoreLink(source: keyof typeof banffAudioWalkSources) {
  const url = new URL(appStoreURL);
  url.searchParams.set('pt', '129009564');
  url.searchParams.set('ct', banffAudioWalkSources[source]);
  url.searchParams.set('mt', '8');
  return url.href;
}
