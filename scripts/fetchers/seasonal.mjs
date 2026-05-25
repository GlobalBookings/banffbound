/**
 * Seasonal data — determines current season and seasonal highlights for Banff
 * Pure logic, no network requests needed.
 */

const LOG_PREFIX = '[seasonal]';

const SEASON_DATA = {
  winter: {
    months: [11, 0, 1], // Dec, Jan, Feb
    season: 'winter',
    seasonalHighlights: [
      'World-class skiing at three resorts: Sunshine Village, Lake Louise, and Mt. Norquay',
      'Frozen waterfalls and ice-climbing opportunities at Johnston Canyon',
      'Northern Lights viewing on clear nights (best Dec–Feb)',
      'Ice skating on Lake Louise with a stunning mountain backdrop',
      'Dog sledding and sleigh rides through the snow-covered Rockies',
      'Banff SnowDays festival (January)',
      'Hot springs at Banff Upper Hot Springs — perfect after a cold day',
      'Cross-country skiing and snowshoeing on groomed trails',
    ],
    activeActivities: [
      'Downhill skiing & snowboarding',
      'Cross-country skiing',
      'Snowshoeing',
      'Ice skating',
      'Dog sledding',
      'Ice climbing',
      'Northern lights viewing',
      'Hot springs',
      'Sleigh rides',
      'Fat biking',
    ],
    upcomingEvents: [
      'Banff SnowDays Festival (January)',
      'Ice Magic Festival at Lake Louise (January)',
      'Banff Mountain Film Festival (late fall/early winter)',
    ],
  },
  spring: {
    months: [2, 3, 4], // Mar, Apr, May
    season: 'spring',
    seasonalHighlights: [
      'Spring skiing continues at Sunshine Village into late May (longest season in Canada)',
      'Wildlife babies appear — keep eyes open for bear cubs, elk calves, and mountain goat kids',
      'Waterfalls reach peak flow as snow melts — spectacular at Johnston Canyon and Bow Falls',
      'Fewer crowds and shoulder-season pricing at hotels',
      'Lake Minnewanka starts to thaw — dramatic ice breakup views',
      'Mountain meadows begin to green up at lower elevations',
    ],
    activeActivities: [
      'Spring skiing (until May at Sunshine)',
      'Wildlife watching',
      'Waterfall viewing',
      'Early season hiking (lower trails)',
      'Hot springs',
      'Photography (dramatic spring light)',
      'Mountain biking (trails opening)',
    ],
    upcomingEvents: [
      'Sunshine Village closing weekend (late May)',
      'Lake Louise summer season opening (June)',
      'Banff Marathon (June)',
    ],
  },
  summer: {
    months: [5, 6, 7], // Jun, Jul, Aug
    season: 'summer',
    seasonalHighlights: [
      'Alpine lakes thaw to reveal iconic turquoise waters — Lake Louise, Moraine Lake, Peyto Lake',
      'Wildflower season peaks in July and August in alpine meadows',
      'Longest days of the year — up to 16+ hours of daylight for hiking',
      'All backcountry trails and campgrounds open for the season',
      'Lake Minnewanka boat cruises and lakeside activities',
      'Via Ferrata climbing routes open at Mt. Norquay',
      'White-water rafting on the Kicking Horse River',
      'Camping under the stars in the Canadian Rockies',
    ],
    activeActivities: [
      'Hiking (all trails open)',
      'Canoeing & kayaking',
      'White-water rafting',
      'Mountain biking',
      'Camping',
      'Via Ferrata climbing',
      'Swimming in alpine lakes',
      'Wildlife watching',
      'Horseback riding',
      'Gondola sightseeing',
      'Fishing',
      'Stand-up paddleboarding',
    ],
    upcomingEvents: [
      'Canada Day celebrations (July 1)',
      'Banff Marathon (June)',
      'Banff Centre Mountain Film Festival (summer screenings)',
      'Parks Day events (July)',
    ],
  },
  fall: {
    months: [8, 9, 10], // Sep, Oct, Nov
    season: 'fall',
    seasonalHighlights: [
      'Larch trees turn golden — stunning displays at Larch Valley, Sentinel Pass, and Paradise Valley (late Sep–mid Oct)',
      'Elk rutting season — impressive bull elk bugling in Banff townsite (Sep–Oct)',
      'Dramatically fewer crowds compared to summer',
      'Crisp mountain air and stunning fall colors against snow-capped peaks',
      'First snowfalls dust the mountain peaks — incredible photography',
      'Shoulder-season hotel deals before ski season begins',
      'Ski resorts begin opening in November',
    ],
    activeActivities: [
      'Larch valley hiking (September–October)',
      'Wildlife watching (elk rut)',
      'Photography (fall colours)',
      'Mountain biking',
      'Hot springs',
      'Early season skiing (November)',
      'Scenic drives (Icefields Parkway)',
      'Lake canoeing (early fall)',
    ],
    upcomingEvents: [
      'Larch season peak (late September–early October)',
      'Elk rut viewing (September–October)',
      'Ski season opening (early November)',
      'Banff Mountain Film & Book Festival (late October/November)',
    ],
  },
};

function getSeasonForMonth(month) {
  for (const [, data] of Object.entries(SEASON_DATA)) {
    if (data.months.includes(month)) return data;
  }
  return SEASON_DATA.summer; // fallback
}

/**
 * Main export
 */
export async function fetchSeasonal() {
  console.log(`${LOG_PREFIX} Determining seasonal data…`);

  const now = new Date();
  const month = now.getMonth(); // 0-based
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const seasonData = getSeasonForMonth(month);

  const data = {
    updatedAt: now.toISOString(),
    season: seasonData.season,
    month: monthNames[month],
    seasonalHighlights: seasonData.seasonalHighlights,
    activeActivities: seasonData.activeActivities,
    upcomingEvents: seasonData.upcomingEvents,
  };

  console.log(`${LOG_PREFIX} Season: ${data.season} (${data.month})`);
  return data;
}
