// ═══════════════════════════════════════════════════════════════════════
// BanffBound PPC Campaign Strategy — LEAN (March 2026 Rebuild)
// ═══════════════════════════════════════════════════════════════════════
//
// CONTEXT:
//   Previous strategy: 3 campaigns, 13 ad groups, ~85 keywords, $35 CAD/day
//   Result: 600 clicks, £200 (~$340 CAD) spent, ZERO conversions.
//   Diagnosis: Budget spread too thin across informational/research keywords
//   that have zero booking intent. Hiking, weather, park passes, restaurants,
//   skiing — none of these lead to affiliate bookings.
//
// LEAN STRATEGY:
//   Only pay for clicks from people actively looking to BOOK something
//   we earn commission on. Two revenue paths only:
//     1. Hotel bookings → Expedia (4-6% commission, ~$20-30 per booking)
//     2. Tour/ticket bookings → GetYourGuide (8% commission, ~$6-12 per booking)
//
//   Everything else (hiking info, weather, park passes, restaurants, skiing,
//   trip planning, "things to do" research) = organic traffic only. No PPC.
//
// NUMBERS:
//   2 campaigns, 5 ad groups, ~22 keywords
//   Daily budget: $18 CAD (~$540/month) — 49% cut from previous $35/day
//   Every keyword maps to a page with strong affiliate CTAs
//   Target: 15-25 clicks/day concentrated on high-intent queries
//   Break-even: ~3 hotel bookings/month at $20 avg commission
//
// RULES:
//   - PHRASE match only (no broad match, prevent bleed)
//   - Aggressive negative keyword list to block informational queries
//   - Search network only (no display, no partners)
//   - CA + US geo only
//   - Review weekly: any keyword spending >$10 with 0 conversions gets paused
// ═══════════════════════════════════════════════════════════════════════

export const CAMPAIGN_STRUCTURE = {

  // ─── CAMPAIGN 1: Hotels — Booking Intent Only ─────────────────────
  // People actively searching for where to BOOK. Highest commission
  // potential ($20-30 per Expedia booking). Send to hotel directory.
  'BB-Hotels-Book': {
    type: 'SEARCH',
    budget: 10.00,
    biddingStrategy: 'MAXIMIZE_CONVERSIONS',
    targetCpa: 5.00,
    networks: ['SEARCH'],
    locations: ['CA', 'US'],
    adSchedule: 'ALL_DAY',
    adGroups: [

      // AG1: Generic Banff hotel booking searches
      {
        name: 'Banff Hotels - Book',
        landingPage: '/hotel-directory',
        keywords: [
          { text: 'banff hotels', matchType: 'PHRASE' },
          { text: 'hotels in banff', matchType: 'PHRASE' },
          { text: 'best hotels in banff', matchType: 'PHRASE' },
          { text: 'banff hotel deals', matchType: 'PHRASE' },
          { text: 'where to stay in banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [
          'banff scotland', 'banff ireland', 'banff uk', 'banff aberdeenshire',
          'jobs', 'employment', 'careers', 'work in',
          'free', 'reddit', 'blog', 'photos', 'images', 'map pdf',
          'history', 'wikipedia', 'directions to', 'how to get to',
        ],
        ads: [
          {
            headlines: [
              'Banff Hotels Compare 95+',
              'Banff Hotel Deals from $99',
              'Find Your Perfect Banff Stay',
              'Book Banff Hotels Save 40%',
              'Compare All Banff Hotels',
              'Top Rated Banff Hotels',
              'Banff Hotels From $99/Night',
              '#1 Banff Hotel Guide 2026',
              'Where to Stay in Banff',
              'Banff Stays Real Reviews',
              'Banff Lodges & Chalets',
              'Save Big on Banff Hotels',
              'Banff Deals Updated Daily',
              'Mountain Hotels in Banff',
              'BanffBound Hotel Finder',
            ],
            descriptions: [
              'Compare 95+ Banff hotels with real reviews & prices. Find your perfect stay.',
              'Luxury resorts to cozy lodges. Interactive map, real reviews & booking links.',
              'From $99/night. Browse Banff hotels by price, rating & location on our map.',
              'Updated daily with the best Banff hotel deals. Lodges, resorts & chalets.',
            ],
          },
        ],
      },

      // AG2: Lake Louise hotels — high AOV, strong booking intent
      {
        name: 'Lake Louise Hotels',
        landingPage: '/hotel-directory?area=Lake+Louise',
        keywords: [
          { text: 'lake louise hotels', matchType: 'PHRASE' },
          { text: 'hotels near lake louise', matchType: 'PHRASE' },
          { text: 'chateau lake louise', matchType: 'PHRASE' },
        ],
        negativeKeywords: [
          'banff scotland', 'history', 'photos', 'wikipedia', 'free',
        ],
        ads: [
          {
            headlines: [
              'Lake Louise Hotels Compare',
              'Stay at Lake Louise $149+',
              'Lake Louise Lodges & Inns',
              'Book Lake Louise Best Rate',
              'Hotels Near Lake Louise',
              'Lake Louise Stays $149+',
              'Chateau Lake Louise & More',
              'Top Lake Louise Hotels',
              'Lake Louise Deals 2026',
              'Compare Lake Louise Stays',
              'Lakeside Hotels Book Now',
              'Save on Lake Louise Rooms',
              'Lake Louise Real Reviews',
              'Fairmont to Budget Lodges',
              'BanffBound Lake Louise',
            ],
            descriptions: [
              'Compare all Lake Louise hotels. Fairmont Chateau to cozy lodges. Real reviews.',
              'Mountain views at Lake Louise. Compare prices, photos & book your stay.',
              'From Fairmont Chateau to budget lodges. Find your Lake Louise hotel today.',
              'Lake Louise hotels with real reviews, prices & photos. Updated for 2026.',
            ],
          },
        ],
      },

      // AG3: Luxury/resort searches — highest AOV, best commissions
      {
        name: 'Luxury Banff Resorts',
        landingPage: '/hotel-directory?type=Resort',
        keywords: [
          { text: 'banff luxury hotels', matchType: 'PHRASE' },
          { text: 'banff resorts', matchType: 'PHRASE' },
          { text: 'fairmont banff springs', matchType: 'PHRASE' },
          { text: 'banff 5 star hotel', matchType: 'PHRASE' },
        ],
        negativeKeywords: [
          'banff scotland', 'history', 'photos', 'wikipedia', 'ghost',
          'haunted', 'wedding', 'jobs', 'employment',
        ],
        ads: [
          {
            headlines: [
              'Luxury Banff Resorts',
              'Banff 5-Star Hotels',
              'Premium Banff Retreats',
              'Fairmont & Luxury Stays',
              'World-Class Banff Resorts',
              'Banff Spa Resorts Compare',
              'Rimrock Resort & Fairmont',
              'Top Luxury Stays in Banff',
              'Banff Resorts from $299',
              'Elite Banff Mountain Lodge',
              'Banff Luxury Guide 2026',
              '5-Star Banff Stays Rated',
              'Book Premium Banff Hotels',
              'Banff Suites & Spa Deals',
              'BanffBound Luxury Picks',
            ],
            descriptions: [
              'Compare luxury Banff resorts. Fairmont, Rimrock & more. Spa & mountain views.',
              'Finest mountain resorts in the Rockies. Real reviews, amenities & booking.',
              'From $299/night. Banff luxury resorts with spas, fine dining & views.',
              'Fairmont, Rimrock & boutique lodges. Compare Banff luxury stays today.',
            ],
          },
        ],
      },
    ],
  },

  // ─── CAMPAIGN 2: Bookable Tours & Tickets ─────────────────────────
  // People searching for specific bookable experiences with ticket/price
  // intent. Send to pages with GetYourGuide booking widgets.
  // NO hiking, skiing, or generic "things to do" — those are research.
  'BB-Tours-Book': {
    type: 'SEARCH',
    budget: 8.00,
    biddingStrategy: 'MAXIMIZE_CONVERSIONS',
    targetCpa: 4.00,
    networks: ['SEARCH'],
    locations: ['CA', 'US'],
    adSchedule: 'ALL_DAY',
    adGroups: [

      // AG1: Guided tours — directly bookable via GYG
      {
        name: 'Banff Tours - Book',
        landingPage: '/tours',
        keywords: [
          { text: 'banff tours', matchType: 'PHRASE' },
          { text: 'guided tours banff', matchType: 'PHRASE' },
          { text: 'banff day tours', matchType: 'PHRASE' },
          { text: 'banff wildlife tours', matchType: 'PHRASE' },
          { text: 'columbia icefield tour from banff', matchType: 'PHRASE' },
        ],
        negativeKeywords: [
          'banff scotland', 'free', 'self guided', 'diy',
          'jobs', 'employment',
        ],
        ads: [
          {
            headlines: [
              'Banff Tours Book Online',
              'Guided Banff Tours $49+',
              'Banff Day Tours 2026',
              'Wildlife & Glacier Tours',
              'Expert-Led Banff Tours',
              'Icefield Explorer Tours',
              'Lake Louise Guided Tour',
              'Banff Wildlife Safari $59',
              'Book a Banff Tour Today',
              'Small Group Banff Tours',
              'Banff Bus Tours from $49',
              'Private Banff Tours Avail',
              'Compare Banff Tours Now',
              'Top Rated Banff Guides',
              'BanffBound Tour Finder',
            ],
            descriptions: [
              'Top-rated Banff tours. Icefield, wildlife, gondola & Lake Louise. Book now.',
              'Guided tours with local experts. Glacier walks, wildlife & day trips.',
              'Compare tours from $49. Icefield, wildlife, gondola & Lake Louise options.',
              'Small group & private tours available. Read reviews, compare & book online.',
            ],
          },
        ],
      },

      // AG2: Gondola & ticketed attractions — specific bookable products
      {
        name: 'Banff Gondola & Tickets',
        landingPage: '/blog/banff-gondola-tickets-guide',
        keywords: [
          { text: 'banff gondola tickets', matchType: 'PHRASE' },
          { text: 'banff gondola', matchType: 'PHRASE' },
          { text: 'columbia icefield skywalk', matchType: 'PHRASE' },
          { text: 'lake minnewanka cruise', matchType: 'PHRASE' },
          { text: 'johnston canyon ice walk tour', matchType: 'PHRASE' },
        ],
        negativeKeywords: [
          'free', 'hours', 'webcam', 'closed',
        ],
        ads: [
          {
            headlines: [
              'Banff Gondola Tickets',
              'Banff Sightseeing Tours',
              'Columbia Icefield Tours',
              'Lake Minnewanka Cruises',
              'Banff Gondola Guide 2026',
              'Gondola Tickets from $69',
              'Skywalk & Gondola Tickets',
              'Save on Banff Gondola',
              'Book Banff Gondola Online',
              'Sulphur Mtn Gondola Ride',
              'Banff Views from the Top',
              'Gondola Deals Banff 2026',
              'Icefield Skywalk Tickets',
              'Minnewanka Cruise Tickets',
              'BanffBound Gondola Guide',
            ],
            descriptions: [
              'Banff Gondola, Icefield tours, lake cruises & ice walks. Compare prices.',
              'Top Banff sightseeing. Gondola, Skywalk & glacier tours. Book online.',
              'Gondola tickets from $69. Tips on best times, discounts & what to expect.',
              'Ride the Banff Gondola to Sulphur Mtn summit. Book tickets & save today.',
            ],
          },
        ],
      },
    ],
  },

  // ─── REMOVED CAMPAIGNS ──────────────────────────────────────────
  // BB-Planning-Search: REMOVED (100% informational — weather, park
  //   passes, restaurants, trip planning. Zero booking intent.)
  // BB-Tours-Search / Things To Do: REMOVED (research query, not booking)
  // BB-Tours-Search / Hiking: REMOVED (free activity, no affiliate product)
  // BB-Tours-Search / Skiing: REMOVED (lift tickets sold direct by resorts)
  // BB-Hotels-Search / Canmore: REMOVED (dilutes budget, off-brand)
  // BB-Hotels-Search / Budget: REMOVED (commission on $49 hostel = $2-3, not worth CPC)
};

// ─── CAMPAIGN-LEVEL NEGATIVE KEYWORD LIST ─────────────────────────
// Aggressive negative list to prevent bleed into informational queries.
// Every penny must go toward booking-intent clicks.
export const GLOBAL_NEGATIVES = [
  // Wrong Banff (Scotland, Ireland, etc.)
  'banff scotland', 'banff ireland', 'banff northern ireland',
  'banff uk', 'banff aberdeenshire', 'banff macduff',

  // Employment / living
  'jobs in banff', 'banff employment', 'banff careers', 'banff jobs',
  'work in banff', 'banff real estate', 'banff houses for sale',
  'banff rent', 'banff apartments', 'move to banff', 'banff population',

  // Informational / research (we want these organic only)
  'weather', 'forecast', 'webcam', 'webcams', 'temperature',
  'park pass', 'entry fee', 'admission', 'parks canada pass',
  'hiking', 'hike', 'trails', 'trail map', 'trail conditions',
  'skiing', 'ski resort', 'lift tickets', 'snow report', 'ski pass',
  'restaurants', 'where to eat', 'dining', 'food', 'bars', 'nightlife',
  'itinerary', 'trip planner', 'trip cost', 'budget guide',
  'things to do', 'what to do', 'attractions', 'activities',
  'best time to visit', 'when to visit', 'how to get to',
  'directions', 'driving', 'flights to', 'bus to',
  'packing list', 'what to pack', 'what to wear',

  // Non-commercial
  'free', 'blog', 'reddit', 'forum', 'photos', 'images', 'wallpaper',
  'history', 'wikipedia', 'map pdf', 'torrent', 'download',
  'video', 'youtube', 'instagram', 'tiktok',

  // Wrong products
  'campground', 'camping', 'rv park', 'airbnb',
  'wedding', 'wedding venue', 'proposal',
  'haunted', 'ghost',
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
// Much tighter thresholds — we cannot afford to waste a single dollar.
export const OPTIMIZATION_RULES = {
  // Pause keywords that spend > $8 with zero conversions over 7 days
  pauseWasteThreshold: { spend: 8.00, conversions: 0, days: 7 },

  // Increase bids by 10% for keywords with CPA < target CPA
  bidIncreaseThreshold: { cpaMultiplier: 0.7, increasePercent: 10 },

  // Decrease bids by 25% for keywords with CPA > 1.5x target CPA
  bidDecreaseThreshold: { cpaMultiplier: 1.5, decreasePercent: 25 },

  // Add as negative keyword if search term spends > $5 with 0 conversions
  negativeKeywordThreshold: { spend: 5.00, conversions: 0, minClicks: 3 },

  // Scale daily budget by 15% if campaign ROAS > 4:1 for 7 consecutive days
  budgetScaleUp: { minRoas: 4.0, consecutiveDays: 7, increasePercent: 15 },

  // Cut daily budget by 40% if campaign ROAS < 1:1 for 3 consecutive days
  budgetScaleDown: { maxRoas: 1.0, consecutiveDays: 3, decreasePercent: 40 },
};

// ─── SUMMARY ──────────────────────────────────────────────────────
// 2 Campaigns, 5 Ad Groups, 22 keywords (down from 3/13/85)
// Total daily budget: $18 CAD (~$540/month) — 49% cut from $35/day
// Expected: 12-20 clicks/day at $0.90-1.50 CPC (higher intent = higher CPC)
// Target: 2-4 affiliate click-outs/day (15-25% on-site conversion)
// Break-even: ~3 hotel bookings/month ($60-90 commission vs $540 spend)
//
// WHAT WE CUT AND WHY:
//   - BB-Planning-Search (entire campaign): weather, park passes,
//     restaurants, trip itineraries = 100% informational, zero bookings
//   - Things To Do ad group: research query, people browsing not booking
//   - Hiking ad group: free activity, no affiliate product to sell
//   - Skiing ad group: lift tickets sold by resorts, not our affiliate
//   - Canmore Hotels: off-brand, dilutes budget
//   - Budget/Hostels: $2-3 commission not worth paying CPC for
//
// NEXT STEPS:
//   1. Verify conversion tracking is firing (check Google Ads > Conversions)
//   2. Run for 7 days with this lean setup
//   3. If still 0 conversions after 7 days, pause all PPC and go organic-only
//   4. If conversions appear, scale winners only
