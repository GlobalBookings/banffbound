import { banffAppStoreLink, type AppStoreSource } from './banffAppStore';

export function banffAudioWalkStoreLink(source: AppStoreSource<'banff-audio-walk'>) {
  return banffAppStoreLink('banff-audio-walk', source);
}
