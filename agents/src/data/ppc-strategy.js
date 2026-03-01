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
              'Banff Hotels Compare 95+',    // 22
              'Banff Hotel Deals from $99',   // 25
              'Find Your Perfect Banff Stay', // 26
              'Book Banff Hotels Save 40%',   // 25
              'Compare All Banff Hotels',     // 22
              'Top Rated Banff Hotels',       // 21
              'Banff Hotels From $99/Night',  // 25
              '#1 Banff Hotel Guide 2026',    // 24
              'Where to Stay in Banff',       // 21
              'Banff Stays Real Reviews',     // 23
              'Banff Lodges & Chalets',       // 21
              'Save Big on Banff Hotels',     // 23
              'Banff Deals Updated Daily',    // 24
              'Mountain Hotels in Banff',     // 23
              'BanffBound Hotel Finder',      // 22
            ],
            descriptions: [
              'Compare 95+ Banff hotels with real reviews & prices. Find your perfect stay.',           // 74
              'Luxury resorts to cozy lodges. Interactive map, real reviews & booking links.',           // 79
              'From $99/night. Browse Banff hotels by price, rating & location on our map.',            // 79
              'Updated daily with the best Banff hotel deals. Lodges, resorts & chalets.',              // 78
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
              'Lake Louise Hotels Compare',   // 25
              'Stay at Lake Louise $149+',     // 24
              'Lake Louise Lodges & Inns',     // 24
              'Book Lake Louise Best Rate',    // 25
              'Hotels Near Lake Louise',       // 22
              'Lake Louise Stays $149+',       // 22
              'Chateau Lake Louise & More',    // 25
              'Top Lake Louise Hotels',        // 21
              'Lake Louise Deals 2026',        // 21
              'Compare Lake Louise Stays',     // 24
              'Lakeside Hotels Book Now',      // 24
              'Save on Lake Louise Rooms',     // 24
              'Lake Louise Real Reviews',      // 23
              'Fairmont to Budget Lodges',     // 24
              'BanffBound Lake Louise',        // 21
            ],
            descriptions: [
              'Compare all Lake Louise hotels. Fairmont Chateau to cozy lodges. Real reviews.',    // 80
              'Mountain views at Lake Louise. Compare prices, photos & book your stay.',            // 75
              'From Fairmont Chateau to budget lodges. Find your Lake Louise hotel today.',         // 78
              'Lake Louise hotels with real reviews, prices & photos. Updated for 2026.',           // 78
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
              'Canmore Hotels Near Banff',    // 23
              'Stay in Canmore Save 30%',     // 23
              'Canmore Hotels from $89',      // 22
              'Compare Canmore Hotels',       // 21
              '15 Min to Banff Canmore',      // 22
              'Canmore Lodges & Chalets',     // 23
              'Canmore Deals from $89',       // 21
              'Canmore Hotel Guide 2026',     // 23
              'Top Canmore Stays Rated',      // 22
              'Book Canmore Save Big',        // 20
              'Canmore vs Banff Hotels',      // 22
              'Canmore Real Guest Reviews',   // 25
              'Best Canmore Hotels Map',      // 22
              'Canmore Stay Near Parks',      // 22
              'BanffBound Canmore Guide',     // 23
            ],
            descriptions: [
              'Canmore is 15 min from Banff with lower prices. Compare lodges & chalets.',    // 74
              'Save 30% vs Banff by staying in Canmore. Same mountains, better value.',       // 75
              'Canmore hotels from $89/night. Lodges, chalets & inns near Banff. Compare.',   // 83
              'Close to Banff, half the price. Canmore hotels rated with real reviews.',       // 79
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
              'Budget Banff Hotels $49+',      // 23
              'Banff Hostels & Budget Inn',     // 25
              'Affordable Banff Stays',         // 21
              'Banff on a Budget Compare',      // 24
              'Cheap Stays Near Banff',         // 21
              'Banff Hostels from $49',         // 21
              'Motels in Banff from $89',       // 22
              'Budget Banff Stay Guide',        // 22
              'Backpacker Banff Hostels',       // 22
              'Banff Deals Under $100',         // 21
              'Dorm Beds from $49/Night',       // 23
              'Compare Cheap Banff Stays',      // 24
              'Top Budget Banff Lodges',        // 22
              'Banff Value Stays Rated',        // 22
              'BanffBound Budget Finder',       // 23
            ],
            descriptions: [
              'Hostels from $49, motels from $89. Compare budget Banff stays with reviews.',    // 78
              'Banff on a budget. Hostels, motels & lodges compared with real prices.',          // 74
              'Dorm beds to private rooms. Find affordable Banff stays with real reviews.',      // 78
              'Traveling on a budget? Compare the cheapest Banff stays side by side.',           // 77
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
              'Luxury Banff Resorts',          // 20
              'Banff 5-Star Hotels',           // 18
              'Premium Banff Retreats',        // 21
              'Fairmont & Luxury Stays',       // 22
              'World-Class Banff Resorts',     // 24
              'Banff Spa Resorts Compare',     // 23
              'Rimrock Resort & Fairmont',     // 24
              'Top Luxury Stays in Banff',     // 24
              'Banff Resorts from $299',       // 21
              'Elite Banff Mountain Lodge',    // 25
              'Banff Luxury Guide 2026',       // 22
              '5-Star Banff Stays Rated',      // 23
              'Book Premium Banff Hotels',     // 24
              'Banff Suites & Spa Deals',      // 23
              'BanffBound Luxury Picks',       // 22
            ],
            descriptions: [
              'Compare luxury Banff resorts. Fairmont, Rimrock & more. Spa & mountain views.',    // 80
              'Finest mountain resorts in the Rockies. Real reviews, amenities & booking.',        // 78
              'From $299/night. Banff luxury resorts with spas, fine dining & views.',             // 75
              'Fairmont, Rimrock & boutique lodges. Compare Banff luxury stays today.',            // 78
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
        landingPage: '/blog/best-things-to-do-in-banff-2026',
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
              'Things To Do Banff 2026',       // 22
              'Banff Activities & Tours',       // 23
              'Plan Your Banff Adventure',      // 24
              'Top Banff Attractions',          // 20
              '50+ Banff Activities',           // 19
              'What To Do in Banff',            // 18
              'Best Banff Experiences',         // 21
              'Banff Must-Do List 2026',        // 21
              'Banff Bucket List Guide',        // 22
              'Book Banff Activities Now',      // 24
              'Hike Paddle Explore Banff',      // 24
              'Banff Tours from $49',           // 19
              'Local Tips Banff Fun',           // 19
              'Banff Insider Activity List',    // 26
              'BanffBound Activities',          // 20
            ],
            descriptions: [
              'Best things to do in Banff. Hiking, tours, wildlife safaris & gondola rides.',    // 78
              'Glacier walks to wildlife tours. Find & book the perfect Banff adventure.',       // 77
              '50+ activities ranked by locals. Hikes, tours, lakes & more for 2026.',           // 76
              'Plan your Banff itinerary with our top-rated activities. Book online.',            // 77
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
              'Banff Tours Book Online',       // 22
              'Guided Banff Tours $49+',       // 22
              'Banff Day Tours 2026',          // 19
              'Wildlife & Glacier Tours',      // 23
              'Expert-Led Banff Tours',        // 21
              'Icefield Explorer Tours',       // 22
              'Lake Louise Guided Tour',       // 22
              'Banff Wildlife Safari $59',     // 23
              'Book a Banff Tour Today',       // 22
              'Small Group Banff Tours',       // 22
              'Banff Bus Tours from $49',      // 22
              'Private Banff Tours Avail',     // 25
              'Compare Banff Tours Now',       // 22
              'Top Rated Banff Guides',        // 21
              'BanffBound Tour Finder',        // 21
            ],
            descriptions: [
              'Top-rated Banff tours. Icefield, wildlife, gondola & Lake Louise. Book now.',    // 79
              'Guided tours with local experts. Glacier walks, wildlife & day trips.',          // 75
              'Compare tours from $49. Icefield, wildlife, gondola & Lake Louise options.',     // 80
              'Small group & private tours available. Read reviews, compare & book online.',    // 83
            ],
          },
        ],
      },

      // AG3: Hiking & trails
      {
        name: 'Banff Hiking',
        landingPage: '/blog/best-banff-hiking-trails-guide',
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
              '70+ Banff Hiking Trails',       // 22
              'Best Banff Hikes Guide',         // 21
              'Banff Hikes All Levels',         // 21
              'Banff Trail Guide 2026',         // 21
              'Plan Your Banff Hike',           // 19
              'Johnston Canyon Trail',          // 22
              'Lake Agnes Hike Guide',          // 20
              'Sentinel Pass Trail Info',       // 23
              'Easy Banff Hikes for All',       // 23
              'Top 10 Banff Hikes Ranked',      // 24
              'Banff Hike Tips & Maps',         // 21
              'Beginner Banff Trails',          // 20
              'Banff Alpine Hikes List',        // 22
              'Hike Banff Like a Local',        // 22
              'BanffBound Hiking Guide',        // 22
            ],
            descriptions: [
              'Explore 70+ Banff trails with difficulty ratings, photos & GPS directions.',      // 78
              'Easy walks to alpine passes. Insider tips, gear lists & trail conditions.',       // 77
              'Johnston Canyon, Lake Agnes, Sentinel Pass & more. The best Banff hikes.',        // 80
              'Plan your hike with our trail guide. Rated by difficulty, season & views.',       // 79
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
              'Skiing in Banff 3 Resorts',     // 24
              'Banff Ski Guide 2026',           // 19
              'Louise Sunshine Norquay',        // 24
              'Plan Your Banff Ski Trip',       // 23
              'Banff Ski Deals & Passes',       // 23
              'Ski Banff This Winter',          // 21
              'Banff Ski Packages $199+',       // 23
              'Compare 3 Banff Ski Hills',      // 24
              'Banff Lift Tickets Guide',       // 23
              'Banff Snow Report & Tips',       // 23
              'Family Ski Trips to Banff',      // 24
              'Banff Ski Season 2026',          // 20
              'Best Ski Runs in Banff',         // 21
              'Ski & Stay Banff Deals',         // 21
              'BanffBound Ski Planner',         // 21
            ],
            descriptions: [
              'Three world-class ski resorts in Banff. Compare runs, passes & hotels.',        // 76
              'Louise, Sunshine & Norquay. Trail maps, snow reports & ski-stay deals.',         // 78
              'Ski packages from $199. Lift tickets, lessons & lodging compared for 2026.',     // 82
              'Plan your Banff ski trip. Compare resorts, check snow & book your stay.',        // 79
            ],
          },
        ],
      },

      // AG5: Specific high-value activities
      {
        name: 'Banff Gondola & Sightseeing',
        landingPage: '/blog/banff-gondola-tickets-guide',
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
              'Banff Gondola Tickets',          // 20
              'Banff Sightseeing Tours',        // 22
              'Columbia Icefield Tours',        // 22
              'Lake Minnewanka Cruises',        // 22
              'Banff Hot Springs Guide',        // 22
              'Banff Gondola Guide 2026',       // 23
              'Gondola Tickets from $69',       // 23
              'Skywalk & Gondola Tickets',      // 24
              'Save on Banff Gondola',          // 20
              'Banff Gondola Tips & Info',      // 23
              'Book Banff Gondola Online',      // 24
              'Sulphur Mtn Gondola Ride',       // 23
              'Banff Views from the Top',       // 23
              'Gondola Deals Banff 2026',       // 23
              'BanffBound Gondola Guide',       // 23
            ],
            descriptions: [
              'Banff Gondola, Icefield tours, lake cruises & hot springs. Compare prices.',    // 80
              'Top Banff sightseeing. Gondola, Skywalk & glacier tours. Book online.',         // 78
              'Gondola tickets from $69. Tips on best times, discounts & what to expect.',     // 81
              'Ride the Banff Gondola to Sulphur Mtn summit. Book tickets & save today.',      // 81
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
        landingPage: '/blog/banff-trip-cost-budget-guide',
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
              'Plan Your Banff Trip Free',     // 24
              'Banff Trip Cost Guide',          // 20
              '3 to 7 Day Banff Plans',         // 21
              'Your Banff Trip Planner',        // 22
              'First Time in Banff?',           // 19
              'Banff Budget Guide 2026',        // 22
              'How Much Is a Banff Trip?',      // 24
              'Banff Itinerary 3-7 Days',       // 23
              'Banff Travel Guide Free',        // 22
              'Banff Trip Planner Tips',        // 22
              'Save Money in Banff',            // 18
              'Banff on $100/Day Guide',        // 22
              'Day by Day Banff Plans',         // 21
              'Banff Cost Breakdown',           // 19
              'BanffBound Trip Planner',        // 22
            ],
            descriptions: [
              'Plan your Banff trip day by day. Hotels, trails, tours & dining costs.',          // 74
              'Ready-made 3, 5 & 7 day Banff itineraries with prices & booking links.',         // 79
              'How much does a Banff trip cost? Full budget breakdown with tips to save.',       // 81
              'First time in Banff? Our cost guide covers hotels, food, passes & more.',        // 79
            ],
          },
        ],
      },

      // AG2: Weather/when to visit (seasonal intent)
      {
        name: 'Banff Weather & Timing',
        landingPage: '/blog/banff-weather-best-time-to-visit',
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
              'Banff Weather Guide 2026',      // 23
              'Best Time to Visit Banff',      // 23
              'Banff Weather by Month',         // 21
              'When to Visit Banff Guide',      // 24
              'Plan Around Banff Weather',      // 24
              'Banff Summer vs Winter',         // 21
              'Banff Seasonal Guide',           // 19
              'Visit Banff Peak Season',        // 22
              'Avoid Banff Crowds Tips',        // 22
              'Banff Monthly Forecast',         // 21
              'Banff Winter Travel Tips',       // 23
              'Banff Summer Guide 2026',        // 22
              'Best Month for Banff Trip',      // 24
              'Banff Weather What to Pack',     // 25
              'BanffBound Weather Guide',       // 23
            ],
            descriptions: [
              'Banff weather by month with tips on what to pack and when to visit.',              // 73
              'Plan your trip around Banff weather. Summer, winter & shoulder season.',           // 78
              'Best time to visit Banff? Our month-by-month guide has the answers.',              // 76
              'Avoid crowds & bad weather. Insider tips on the best time for Banff.',             // 78
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
              'Banff Park Pass Info',           // 18
              'Banff National Park Entry',      // 24
              'Park Pass Prices & Tips',        // 22
              'Banff Pass Info 2026',           // 19
              'Banff Entry Fees Explained',     // 25
              'Daily Pass $10.50 Info',         // 19
              'Annual Park Pass Guide',         // 21
              'Buy Your Banff Park Pass',       // 23
              'Parks Canada Pass Tips',         // 21
              'Banff Pass Where to Buy',        // 22
              'Do You Need a Park Pass?',       // 23
              'Banff Pass Savings Tips',        // 22
              'Family Park Pass Deals',         // 21
              'Banff Discovery Pass Info',      // 24
              'BanffBound Park Guide',          // 20
            ],
            descriptions: [
              'Banff park passes: daily & annual prices, where to buy & what\'s included.',     // 78
              'Park pass info & tips. Plus where to stay, what to do & trails to hike.',        // 79
              'Daily pass $10.50, annual $72.25. Everything you need to know for 2026.',        // 79
              'Do you need a park pass? Our guide covers prices, rules & where to buy.',        // 79
            ],
          },
        ],
      },

      // AG4: Eat & Drink (drives page views with GYG cross-sell)
      {
        name: 'Banff Restaurants',
        landingPage: '/blog/best-banff-restaurants-where-to-eat',
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
              'Best Banff Restaurants',         // 21
              'Where to Eat in Banff',          // 20
              'Banff Dining Guide 2026',        // 22
              'Banff Restaurants & Bars',       // 23
              'Eat & Drink in Banff',           // 19
              'Top 18 Banff Restaurants',       // 24
              'Banff Food Guide by Locals',     // 23
              'Banff Best Eats Ranked',         // 21
              'Bison & Grizzly House',          // 20
              'Park Distillery & More',         // 21
              'Banff Cheap Eats Guide',         // 21
              'Fine Dining in Banff',           // 19
              'Banff Brunch & Dinner',          // 20
              'Reserve Banff Restaurants',      // 25
              'BanffBound Dining Guide',        // 22
            ],
            descriptions: [
              '18 Banff restaurants & bars. Real photos, menus, hours & reserve links.',        // 79
              'Bison, Grizzly House, Park Distillery & more. Banff dining guide.',              // 74
              'Where locals eat in Banff. Best restaurants ranked with prices & tips.',          // 78
              'From fine dining to budget eats. The complete Banff restaurant guide.',           // 77
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
