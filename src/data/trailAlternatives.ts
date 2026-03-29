export interface TrailAlternative {
  popularTrail: string; // slug of the popular trail
  popularName: string;
  whyPopular: string;
  alternatives: {
    slug: string;
    name: string;
    whySimilar: string;
    crowdReduction: string;
  }[];
}

export const trailAlternatives: TrailAlternative[] = [
  {
    popularTrail: 'lake-agnes-teahouse',
    popularName: 'Lake Agnes Tea House',
    whyPopular: 'Iconic tea house above Lake Louise, alpine lake, easy-moderate difficulty. Queue times of 30+ minutes for tea in July.',
    alternatives: [
      { slug: 'consolation-lakes', name: 'Consolation Lakes', whySimilar: 'Alpine lake setting, similar distance, starts near Moraine Lake. Fraction of the crowds.', crowdReduction: '80% fewer people' },
      { slug: 'taylor-lake', name: 'Taylor Lake', whySimilar: 'Turquoise alpine lake surrounded by peaks. Slightly longer but far quieter.', crowdReduction: '90% fewer people' },
      { slug: 'boom-lake', name: 'Boom Lake', whySimilar: 'Peaceful lakeshore walk to a glacial lake. Easy-moderate, similar reward.', crowdReduction: '85% fewer people' },
    ],
  },
  {
    popularTrail: 'johnston-canyon',
    popularName: 'Johnston Canyon',
    whyPopular: 'Catwalks through a narrow canyon to waterfalls. Feels like a theme park on summer weekends.',
    alternatives: [
      { slug: 'marble-canyon-snowshoe', name: 'Marble Canyon (Kootenay)', whySimilar: 'Nearly identical canyon experience with bridges and turquoise water. 30 min from Banff, 90% fewer visitors.', crowdReduction: '90% fewer people' },
      { slug: 'ink-pots-snowshoe', name: 'Ink Pots (via Johnston)', whySimilar: 'Continue past the Upper Falls to escape the crowds. The Ink Pots meadow is peaceful.', crowdReduction: '70% fewer people' },
      { slug: 'sundance-canyon', name: 'Sundance Canyon', whySimilar: 'Short canyon walk with waterfalls, very close to Banff townsite. Most tourists skip it.', crowdReduction: '85% fewer people' },
    ],
  },
  {
    popularTrail: 'tunnel-mountain',
    popularName: 'Tunnel Mountain',
    whyPopular: 'Short summit hike in Banff town. 300m gain, great views. Extremely popular because of convenience.',
    alternatives: [
      { slug: 'fenland-trail', name: 'Fenland Trail', whySimilar: 'Easy walk in town, different vibe (forest instead of summit) but equally accessible.', crowdReduction: '60% fewer people' },
      { slug: 'sulphur-mountain', name: 'Sulphur Mountain Trail', whySimilar: 'Proper summit with better views. More effort but far more rewarding panorama.', crowdReduction: '50% fewer people' },
      { slug: 'bow-falls-trail', name: 'Bow Falls Trail', whySimilar: 'Riverside walk with waterfall. Easy, in town, and less congested than Tunnel.', crowdReduction: '40% fewer people' },
    ],
  },
  {
    popularTrail: 'sentinel-pass',
    popularName: 'Sentinel Pass',
    whyPopular: 'Highest point reachable by maintained trail in the park. Dramatic views of the Valley of the Ten Peaks.',
    alternatives: [
      { slug: 'parker-ridge', name: 'Parker Ridge', whySimilar: 'Above-treeline views of Saskatchewan Glacier. Short, easy climb to alpine scenery.', crowdReduction: '75% fewer people' },
      { slug: 'helen-lake', name: 'Helen Lake', whySimilar: 'Alpine meadow surrounded by peaks. Wildflowers in summer, dramatic scenery.', crowdReduction: '70% fewer people' },
      { slug: 'sunset-pass', name: 'Sunset Pass', whySimilar: 'Remote alpine pass on the Icefields Parkway. Genuine backcountry feel.', crowdReduction: '90% fewer people' },
    ],
  },
  {
    popularTrail: 'plain-of-six-glaciers',
    popularName: 'Plain of Six Glaciers',
    whyPopular: 'Hike from Lake Louise to a tea house with views of Victoria Glacier. Shares the Lake Louise crowds.',
    alternatives: [
      { slug: 'saddleback-pass', name: 'Saddleback Pass', whySimilar: 'Starts from same area as Lake Agnes but branches off. Incredible alpine meadow.', crowdReduction: '80% fewer people' },
      { slug: 'taylor-lake', name: 'Taylor Lake', whySimilar: 'Stunning alpine lake without the Lake Louise starting point chaos.', crowdReduction: '85% fewer people' },
      { slug: 'skoki-valley', name: 'Skoki Valley', whySimilar: 'Full backcountry experience near Lake Louise. Remote lodge, wildflowers, mountain passes.', crowdReduction: '95% fewer people' },
    ],
  },
  {
    popularTrail: 'lake-louise-lakeshore',
    popularName: 'Lake Louise Lakeshore',
    whyPopular: 'Walk along turquoise Lake Louise. Iconic but shoulder-to-shoulder in summer.',
    alternatives: [
      { slug: 'moraine-lakeshore', name: 'Moraine Lakeshore', whySimilar: 'Equally beautiful turquoise lake, shuttle-only access limits crowds.', crowdReduction: '30% fewer people' },
      { slug: 'boom-lake', name: 'Boom Lake', whySimilar: 'Flat walk to a turquoise glacial lake. Similar reward, tiny fraction of the people.', crowdReduction: '90% fewer people' },
      { slug: 'herbert-lake', name: 'Herbert Lake', whySimilar: 'Mirror-like lake right off the Icefields Parkway. 5-minute walk. Almost nobody there.', crowdReduction: '95% fewer people' },
    ],
  },
];
