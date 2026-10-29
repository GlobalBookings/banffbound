import type { Activity } from './activities';

export const activityContextLabels = {
  winter: 'Winter planning', summer: 'Summer planning', shoulder: 'Spring / autumn planning',
};
export const activityInterestLabels = {
  snow: 'Snow and ice', walking: 'Walking', water: 'Water activities', wildlife: 'Wildlife',
  'night-sky': 'Night sky', climbing: 'Climbing', cycling: 'Cycling',
};

export function activitySearchUrl(query: string): string {
  const url = new URL('https://www.getyourguide.com/s/');
  url.searchParams.set('q', query);
  url.searchParams.set('partner_id', 'QW960HO');
  return url.href;
}

export function activityListSchema(items: Activity[]) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Banff activity planning guides', url: 'https://banffbound.com/activities', numberOfItems: items.length,
    itemListElement: items.map((activity, index) => ({
      '@type': 'ListItem', position: index + 1,
      item: { '@type': 'WebPage', name: activity.name, description: activity.description,
        url: `https://banffbound.com${activity.link}` },
    })),
  };
}
