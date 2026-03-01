// ═══════════════════════════════════════════════════════════════════════
// BanffBound PPC Campaign Strategy
// Goal: Maximize affiliate click-outs to Expedia (hotels) & GetYourGuide (tours)
// Revenue model: CPA commission on completed bookings
// ═══════════════════════════════════════════════════════════════════════
//
// ECONOMICS:
//   Expedia:       ~4-6% commission on hotel bookings. Avg Banff hotel = $250/night
//                  → ~$10-15 per booking. 2-night avg = $20-30 per conversion.
//   GetYourGuide:  ~8% commission on tours. Avg Banff tour = $80-150
//                  → ~$6-12 per booking.
//   Amazon:        ~4% on gear. Lower priority for PPC.
//
//   Target blended CPA: $3-5 per affiliate click-out
//   Target ROAS: 4:1 minimum (spend $1, earn $4 in commissions)
//
// STRATEGY:
//   1. Capture high-intent "book now" traffic → hotel pages (Expedia click-outs)
//   2. Capture "things to do" planners → tours/activities pages (GYG click-outs)
//   3. Intercept competitor hotel searches → our comparison pages
//   4. Seasonal campaigns for ski/summer peaks
//
// LANDING PAGE MAPPING:
//   Every ad points to a BanffBound page with affiliate CTAs, NOT directly
//   to Expedia/GYG. This builds our brand, improves Quality Score with
//   relevant content, and gives us retargeting data via GA4.
// ═══════════════════════════════════════════════════════════════════════

export const CAMPAIGN_STRUCTURE = {

  // ─── CAMPAIGN 1: Hotels — High Intent ─────────────────────────────
  // People actively searching for where to stay. Highest conversion
  // potential. Send to hotel directory or specific hotel pages.
  'BB-Hotels-Search': {
    type: 'SEARCH',
    budget: 15.00, // daily CAD — start conservative, scale winners
    biddingStrategy: 'MAXIMIZE_CONVERSIONS',
    targetCpa: 4.00,
    networks: ['SEARCH', 'SEARCH_PARTNERS'], // search + partners, no display
    locations: ['CA', 'US'], // start conservative, expand after conversion data
    adSchedule: 'ALL_DAY', // hotel searches happen any time
    adGroups: [

      // AG1: Generic Banff hotel searches
      {
        name: 'Banff Hotels - Generic',
        landingPage: '/hotel-directory',
        keywords: [
          { text: 'banff hotels', matchType: 'PHRASE' },
          { text: 'hotels in banff', matchType: 'PHRASE' },
          { text: 'where to stay in banff', matchType: 'PHRASE' },
          { text: 'banff accommodation', matchType: 'PHRASE' },
          { text: 'banff places to stay', matchType: 'PHRASE' },
          { text: 'banff alberta hotels', matchType: 'PHRASE' },
          { text: 'best hotels in banff', matchType: 'PHRASE' },
          { text: 'cheap hotels in banff', matchType: 'PHRASE' },
          { text: 'banff hotel deals', matchType: 'PHRASE' },
        ],
        negativeKeywords: [
          'banff scotland', 'banff ireland', 'banff uk',
          'jobs', 'employment', 'careers',
        ],
        ads: [
          {
            headlines: [
              'Banff Hotels — Compare 95+',
              'Banff Hotel Deals from $99',
              'Find Your Perfect Banff Stay',
              'Book Banff Hotels — Save 40%',
              'Compare All Banff Hotels',
            ],
            descriptions: [
              'Compare 95+ Banff hotels with real reviews & prices. Find your perfect mountain stay.',
              'Luxury resorts to cozy lodges. Interactive map, real reviews & booking links.',
            ],
          },
        ],
      },

      // AG2: Lake Louise hotel searches
      {
        name: 'Lake Louise Hotels',
        landingPage: '/hotel-directory?area=Lake+Louise',
        keywords: [
          { text: 'lake louise hotels', matchType: 'PHRASE' },
          { text: 'hotels near lake louise', matchType: 'PHRASE' },
          { text: 'where to stay lake louise', matchType: 'PHRASE' },
          { text: 'lake louise accommodation', matchType: 'PHRASE' },
          { text: 'lake louise lodges', matchType: 'PHRASE' },
          { text: 'chateau lake louise', matchType: 'PHRASE' },
        ],
        negativeKeywords: ['banff scotland'],
        ads: [
          {
            headlines: [
              'Lake Louise Hotels Compare',
              'Stay at Lake Louise $149+',
              'Lake Louise Lodges & Hotels',
              'Book Lake Louise Best Rates',
              'Hotels Near Lake Louise',
            ],
            descriptions: [
              'Compare all Lake Louise hotels. Fairmont Chateau to cozy lodges. Real reviews.',
              'Mountain views at Lake Louise. Compare prices, photos & book your lakeside stay.',
            ],
          },
        ],
      },

      // AG3: Canmore hotel searches (cheaper base for Banff visitors)
      {
        name: 'Canmore Hotels',
        landingPage: '/hotel-directory?area=Canmore',
        keywords: [
          { text: 'canmore hotels', matchType: 'PHRASE' },
          { text: 'hotels in canmore', matchType: 'PHRASE' },
          { text: 'canmore accommodation', matchType: 'PHRASE' },
          { text: 'where to stay canmore', matchType: 'PHRASE' },
          { text: 'canmore near banff hotels', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Canmore Hotels Near Banff',
              'Stay in Canmore Save 30%',
              'Canmore Hotels from $89',
              'Compare Canmore Hotels',
              '15 Min to Banff — Canmore',
            ],
            descriptions: [
              'Canmore is 15 min from Banff with lower prices. Compare lodges & chalets.',
              'Save 30% vs Banff by staying in Canmore. Same mountains, better value.',
            ],
          },
        ],
      },

      // AG4: Budget/hostel searches
      {
        name: 'Budget Banff Stays',
        landingPage: '/hotel-directory?type=Hostel',
        keywords: [
          { text: 'cheap banff hotels', matchType: 'PHRASE' },
          { text: 'banff hostels', matchType: 'PHRASE' },
          { text: 'budget accommodation banff', matchType: 'PHRASE' },
          { text: 'banff on a budget', matchType: 'PHRASE' },
          { text: 'affordable banff hotels', matchType: 'PHRASE' },
          { text: 'backpacker banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Budget Banff Hotels $49+',
              'Banff Hostels & Budget Stays',
              'Affordable Banff Stays',
              'Banff on a Budget Compare',
              'Cheap Stays Near Banff',
            ],
            descriptions: [
              'Hostels from $49, motels from $89. Compare budget Banff stays with reviews.',
              'Banff on a budget. Hostels, motels & lodges compared with real prices.',
            ],
          },
        ],
      },

      // AG5: Luxury/resort searches
      {
        name: 'Luxury Banff Resorts',
        landingPage: '/hotel-directory?type=Resort',
        keywords: [
          { text: 'banff luxury hotels', matchType: 'PHRASE' },
          { text: 'banff resorts', matchType: 'PHRASE' },
          { text: 'best resorts in banff', matchType: 'PHRASE' },
          { text: 'fairmont banff springs', matchType: 'PHRASE' },
          { text: 'banff 5 star hotel', matchType: 'PHRASE' },
          { text: 'luxury lodge banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Luxury Banff Resorts',
              'Banff 5-Star Hotels',
              'Premium Banff Retreats',
              'Fairmont & Luxury Stays',
              'World-Class Banff Resorts',
            ],
            descriptions: [
              'Compare luxury Banff resorts. Fairmont, Rimrock & more. Spa & mountain views.',
              'Finest mountain resorts in the Rockies. Real reviews, amenities & booking links.',
            ],
          },
        ],
      },
    ],
  },

  // ─── CAMPAIGN 2: Tours & Activities — GetYourGuide ────────────────
  // People planning what to do. Send to our content pages with GYG widgets.
  'BB-Tours-Search': {
    type: 'SEARCH',
    budget: 12.00,
    biddingStrategy: 'MAXIMIZE_CONVERSIONS',
    targetCpa: 3.50,
    networks: ['SEARCH', 'SEARCH_PARTNERS'],
    locations: ['CA', 'US'],
    adSchedule: 'ALL_DAY',
    adGroups: [

      // AG1: Generic things to do
      {
        name: 'Things To Do Banff',
        landingPage: '/things-to-do',
        keywords: [
          { text: 'things to do in banff', matchType: 'PHRASE' },
          { text: 'banff activities', matchType: 'PHRASE' },
          { text: 'what to do in banff', matchType: 'PHRASE' },
          { text: 'banff attractions', matchType: 'PHRASE' },
          { text: 'banff sightseeing', matchType: 'PHRASE' },
          { text: 'banff experiences', matchType: 'PHRASE' },
          { text: 'top things to do banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: ['banff scotland', 'jobs'],
        ads: [
          {
            headlines: [
              'Things To Do in Banff 2026',
              'Banff Activities & Tours',
              'Plan Your Banff Adventure',
              'Top Banff Attractions',
              '50+ Banff Activities',
            ],
            descriptions: [
              'Best things to do in Banff. Hiking, tours, wildlife safaris & gondola rides.',
              'Glacier walks to wildlife tours. Find & book the perfect Banff experience.',
            ],
          },
        ],
      },

      // AG2: Tours specifically
      {
        name: 'Banff Tours',
        landingPage: '/tours',
        keywords: [
          { text: 'banff tours', matchType: 'PHRASE' },
          { text: 'guided tours banff', matchType: 'PHRASE' },
          { text: 'banff day tours', matchType: 'PHRASE' },
          { text: 'banff sightseeing tours', matchType: 'PHRASE' },
          { text: 'banff bus tours', matchType: 'PHRASE' },
          { text: 'banff wildlife tours', matchType: 'PHRASE' },
          { text: 'columbia icefield tour from banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Banff Tours Book Online',
              'Guided Banff Tours $49+',
              'Banff Day Tours',
              'Wildlife & Glacier Tours',
              'Expert-Led Banff Tours',
            ],
            descriptions: [
              'Top-rated Banff tours. Icefield, wildlife, gondola & Lake Louise. Book now.',
              'Guided tours with local experts. Glacier walks, wildlife & day trips.',
            ],
          },
        ],
      },

      // AG3: Hiking & trails
      {
        name: 'Banff Hiking',
        landingPage: '/trail-map',
        keywords: [
          { text: 'banff hiking', matchType: 'PHRASE' },
          { text: 'banff hiking trails', matchType: 'PHRASE' },
          { text: 'best hikes in banff', matchType: 'PHRASE' },
          { text: 'banff trail map', matchType: 'PHRASE' },
          { text: 'johnston canyon hike', matchType: 'PHRASE' },
          { text: 'lake agnes hike', matchType: 'PHRASE' },
          { text: 'sentinel pass hike', matchType: 'PHRASE' },
          { text: 'banff easy hikes', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              '70+ Banff Hiking Trails',
              'Interactive Banff Trail Map',
              'Best Banff Hikes All Levels',
              'Banff Trail Guide 2026',
              'Plan Your Banff Hike',
            ],
            descriptions: [
              'Explore 70+ Banff trails on our interactive map. Filter by difficulty & season.',
              'Easy walks to alpine passes. Official Parks Canada data with GPS & photos.',
            ],
          },
        ],
      },

      // AG4: Skiing
      {
        name: 'Banff Skiing',
        landingPage: '/skiing',
        keywords: [
          { text: 'banff skiing', matchType: 'PHRASE' },
          { text: 'ski banff', matchType: 'PHRASE' },
          { text: 'banff ski resorts', matchType: 'PHRASE' },
          { text: 'lake louise ski', matchType: 'PHRASE' },
          { text: 'sunshine village ski', matchType: 'PHRASE' },
          { text: 'banff ski packages', matchType: 'PHRASE' },
          { text: 'skiing in banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Skiing in Banff 3 Resorts',
              'Banff Ski Guide 2026',
              'Louise Sunshine Norquay',
              'Plan Your Banff Ski Trip',
              'Banff Ski Deals & Packages',
            ],
            descriptions: [
              'Three world-class ski resorts in Banff. Compare runs, passes & hotels.',
              'Louise, Sunshine & Norquay. Trail maps, snow & ski-stay deals.',
            ],
          },
        ],
      },

      // AG5: Specific high-value activities
      {
        name: 'Banff Gondola & Sightseeing',
        landingPage: '/activities',
        keywords: [
          { text: 'banff gondola', matchType: 'PHRASE' },
          { text: 'banff gondola tickets', matchType: 'PHRASE' },
          { text: 'banff sky walk', matchType: 'PHRASE' },
          { text: 'columbia icefield skywalk', matchType: 'PHRASE' },
          { text: 'lake minnewanka cruise', matchType: 'PHRASE' },
          { text: 'banff hot springs', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Banff Gondola Book Tickets',
              'Banff Sightseeing Tours',
              'Columbia Icefield Tours',
              'Lake Minnewanka Cruises',
              'Banff Hot Springs & Gondola',
            ],
            descriptions: [
              'Banff Gondola, Icefield tours, lake cruises & hot springs. Compare prices.',
              'Top Banff sightseeing. Gondola, Skywalk & glacier tours. Book online.',
            ],
          },
        ],
      },
    ],
  },

  // ─── CAMPAIGN 3: Trip Planning — Capture Early Funnel ─────────────
  // People researching Banff trips. Lower intent but huge volume.
  // Build brand awareness, capture email/retarget later.
  'BB-Planning-Search': {
    type: 'SEARCH',
    budget: 8.00,
    biddingStrategy: 'MAXIMIZE_CLICKS',
    maxCpc: 0.80, // cap clicks, these are research queries
    networks: ['SEARCH', 'SEARCH_PARTNERS'],
    locations: ['CA', 'US'],
    adSchedule: 'ALL_DAY',
    adGroups: [

      // AG1: Trip planning
      {
        name: 'Banff Trip Planning',
        landingPage: '/trip-builder',
        keywords: [
          { text: 'banff trip planner', matchType: 'PHRASE' },
          { text: 'plan a trip to banff', matchType: 'PHRASE' },
          { text: 'banff itinerary', matchType: 'PHRASE' },
          { text: 'banff travel guide', matchType: 'PHRASE' },
          { text: '3 days in banff', matchType: 'PHRASE' },
          { text: '5 days in banff', matchType: 'PHRASE' },
          { text: 'banff trip cost', matchType: 'PHRASE' },
          { text: 'first time visiting banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Plan Your Banff Trip Free',
              'Banff Itinerary Builder',
              '3 to 7 Day Banff Plans',
              'Your Banff Trip Planner',
              'First Time in Banff?',
            ],
            descriptions: [
              'Build your Banff itinerary day by day. Hotels, trails, tours & dining.',
              'Ready-made 3, 5 & 7 day Banff itineraries with booking links.',
            ],
          },
        ],
      },

      // AG2: Weather/when to visit (seasonal intent)
      {
        name: 'Banff Weather & Timing',
        landingPage: '/weather-webcams',
        keywords: [
          { text: 'banff weather', matchType: 'PHRASE' },
          { text: 'best time to visit banff', matchType: 'PHRASE' },
          { text: 'banff in winter', matchType: 'PHRASE' },
          { text: 'banff in summer', matchType: 'PHRASE' },
          { text: 'banff webcams', matchType: 'PHRASE' },
          { text: 'banff snow conditions', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Banff Weather Live Updates',
              'Best Time to Visit Banff',
              'Banff Webcams & Snow Report',
              'Banff Conditions Right Now',
              'Plan Around Banff Weather',
            ],
            descriptions: [
              'Live Banff weather, webcams & snow reports. Know before you go.',
              'Check Banff conditions now. Webcams, snow report & activity tips.',
            ],
          },
        ],
      },

      // AG3: Park pass queries (huge volume from Search Console data)
      {
        name: 'Banff Park Pass',
        landingPage: '/banff-national-park',
        keywords: [
          { text: 'banff park pass', matchType: 'PHRASE' },
          { text: 'banff national park pass', matchType: 'PHRASE' },
          { text: 'banff entry fee', matchType: 'PHRASE' },
          { text: 'banff national park tickets', matchType: 'PHRASE' },
          { text: 'parks canada pass banff', matchType: 'PHRASE' },
          { text: 'banff admission', matchType: 'PHRASE' },
          { text: 'banff day pass', matchType: 'PHRASE' },
          { text: 'how much is banff park pass', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Banff Park Pass Info',
              'Banff National Park Entry',
              'Park Pass Prices & Tips',
              'Visit Banff Pass Info 2026',
              'Banff Entry Fees Explained',
            ],
            descriptions: [
              'Banff park passes: daily & annual prices, where to buy & what\'s included.',
              'Park pass info & tips. Plus where to stay, what to do & trails to hike.',
            ],
          },
        ],
      },

      // AG4: Eat & Drink (drives page views with GYG cross-sell)
      {
        name: 'Banff Restaurants',
        landingPage: '/eat-and-drink',
        keywords: [
          { text: 'banff restaurants', matchType: 'PHRASE' },
          { text: 'where to eat in banff', matchType: 'PHRASE' },
          { text: 'best restaurants banff', matchType: 'PHRASE' },
          { text: 'banff dining', matchType: 'PHRASE' },
          { text: 'banff food', matchType: 'PHRASE' },
          { text: 'banff bars', matchType: 'PHRASE' },
        ],
        negativeKeywords: [],
        ads: [
          {
            headlines: [
              'Best Banff Restaurants 2026',
              'Where to Eat in Banff',
              'Banff Dining Guide 18 Spots',
              'Banff Restaurants & Bars',
              'Eat & Drink in Banff',
            ],
            descriptions: [
              '18 Banff restaurants & bars. Real photos, menus, hours & reserve links.',
              'Bison, Grizzly House, Park Distillery & more. Banff dining guide.',
            ],
          },
        ],
      },
    ],
  },
};

// ─── CAMPAIGN-LEVEL NEGATIVE KEYWORD LIST ─────────────────────────
// Applied to all campaigns to prevent wasted spend
export const GLOBAL_NEGATIVES = [
  'banff scotland',
  'banff ireland',
  'banff northern ireland',
  'banff uk',
  'banff aberdeenshire',
  'banff macduff',
  'jobs in banff',
  'banff employment',
  'banff careers',
  'banff jobs',
  'work in banff',
  'banff real estate',
  'banff houses for sale',
  'banff rent',
  'banff apartments',
  'move to banff',
  'banff population',
  'banff map pdf',
  'free',
  'torrent',
  'download',
];

// ─── CONVERSION TRACKING SETUP ────────────────────────────────────
// The site already has GA4 (G-2DP7J42ZW0) tracking affiliate_click events.
// Google Ads conversion tracking (AW-17246982814) is also installed.
// We need to create these conversion actions in Google Ads:
export const CONVERSION_ACTIONS = [
  {
    name: 'Expedia Click-Out',
    category: 'PURCHASE',
    type: 'WEBPAGE',
    countingType: 'ONE_PER_CLICK', // one conversion per session, not per click
    defaultValue: 15.00, // estimated avg commission
    description: 'User clicks through to Expedia to book a hotel',
  },
  {
    name: 'GetYourGuide Click-Out',
    category: 'PURCHASE',
    type: 'WEBPAGE',
    countingType: 'ONE_PER_CLICK',
    defaultValue: 8.00,
    description: 'User clicks through to GetYourGuide to book a tour',
  },
  {
    name: 'Amazon Click-Out',
    category: 'PURCHASE',
    type: 'WEBPAGE',
    countingType: 'ONE_PER_CLICK',
    defaultValue: 3.00,
    description: 'User clicks through to Amazon to buy gear',
  },
];

// ─── SCALING RULES ────────────────────────────────────────────────
// The PPC Review agent will use these rules to auto-optimize:
export const OPTIMIZATION_RULES = {
  // Pause keywords that spend > $15 with zero conversions over 14 days
  pauseWasteThreshold: { spend: 15.00, conversions: 0, days: 14 },

  // Increase bids by 15% for keywords with CPA < target CPA
  bidIncreaseThreshold: { cpaMultiplier: 0.8, increasePercent: 15 },

  // Decrease bids by 20% for keywords with CPA > 2x target CPA
  bidDecreaseThreshold: { cpaMultiplier: 2.0, decreasePercent: 20 },

  // Add as negative keyword if search term spends > $10 with 0 conversions
  negativeKeywordThreshold: { spend: 10.00, conversions: 0 },

  // Scale daily budget by 20% if campaign ROAS > 5:1 for 7 consecutive days
  budgetScaleUp: { minRoas: 5.0, consecutiveDays: 7, increasePercent: 20 },

  // Cut daily budget by 30% if campaign ROAS < 1:1 for 5 consecutive days
  budgetScaleDown: { maxRoas: 1.0, consecutiveDays: 5, decreasePercent: 30 },
};

// ─── SUMMARY ──────────────────────────────────────────────────────
// 3 Campaigns, 13 Ad Groups, ~85 keywords
// Total daily budget: $35 CAD (~$1,050/month)
// Expected: 30-50 clicks/day at $0.70-1.50 CPC
// Target: 5-10 affiliate click-outs/day (10-20% conversion rate on-site)
// Estimated monthly revenue: $800-2,400 in commissions
// Break-even: ~$4 CPA on click-outs (achievable at scale)
