/** Reviewed identities and guide-specific ad targets. No live prices or availability. */
export const activityCampaignReviewedAt = '2026-10-30';
export const activityCampaignPartnerId = 'QW960HO';
export const activityCampaignMaximumCpcGBP = 0.07;
export type ActivityLaunchState = 'ready' | 'held';
export interface ActivityBookingOffer {
 id: string; productId: string; title: string; provider: string; productUrl: string;
 sourceUrls: string[]; seasonalNotice: string; launchState: ActivityLaunchState; holdReason?: string;
}
export interface ActivityCampaignTarget {
 id: string; guidePath: string; aliases: string[]; title: string; groupName: string;
 primaryOfferId: string; secondaryOfferIds?: string[]; kind: 'product'; maximumCpcGBP: number;
 exactKeywords: string[]; phraseKeywords: string[]; headlines: string[]; descriptions: string[];
}

export const activityBookingOffers: ActivityBookingOffer[] = [
  {
    "id": "gyg-256607",
    "productId": "256607",
    "title": "Banff: Banff Gondola Admission Ticket",
    "provider": "Pursuit Collection",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-banff-gondola-admission-ticket-t256607/",
    "sourceUrls": [
      "https://www.banffjaspercollection.com/attractions/banff-gondola/"
    ],
    "launchState": "ready",
    "seasonalNotice": "Confirm the date, operating hours and weather. This is attraction admission, not a ski lift ticket, meal or hotel transfer. Views and availability are not guaranteed."
  },
  {
    "id": "gyg-798459",
    "productId": "798459",
    "title": "Banff Top Sights via Electric Fat Bike Tour All Skill Levels",
    "provider": "Radventures",
    "productUrl": "https://www.getyourguide.com/banff-national-park-l92243/banff-top-sights-e-fat-bike-tour-all-skill-levels-t798459/",
    "sourceUrls": [
      "https://www.radventurescanada.com/day-tours/electric-fat-biking-banff-adventure/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A guided year-round Banff electric fat-bike tour, not a rental. The operator states ages 15 and over. Confirm the actual date, snow and Banff Canoe Docks meeting point. Hotel pickup is not included."
  },
  {
    "id": "gyg-841685",
    "productId": "841685",
    "title": "Canmore: 25-Minute Three Sisters Helicopter Tour",
    "provider": "Alpine Helicopters Inc",
    "productUrl": "https://www.getyourguide.com/canmore-l117485/canmore-25-minute-three-sisters-helicopter-tour-t841685/",
    "sourceUrls": [
      "https://canmore.alpinehelicopter.com/product/three-sisters-peaks-tour/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A scenic flight from Canmore, not heli-skiing or a Banff town departure. Minimum two passengers. Confirm weather, boarding requirements and the journey to 91 Bow Valley Trail."
  },
  {
    "id": "gyg-292675",
    "productId": "292675",
    "title": "Lake Louise: Cross Country Skiing Lesson with Tour",
    "provider": "Freeheelin’ Adventures",
    "productUrl": "https://www.getyourguide.com/banff-l284/lake-louise-cross-country-skiing-lesson-with-tour-t292675/",
    "sourceUrls": [
      "https://www.freeheelinadventures.com/book-online"
    ],
    "launchState": "ready",
    "seasonalNotice": "A winter cross-country lesson and tour at Lake Louise, not downhill skiing. Ages 14 and over. Bring or rent waxless skis, boots and poles; confirm the lakeshore meeting point, snow and departure."
  },
  {
    "id": "gyg-437787",
    "productId": "437787",
    "title": "Banff: Icefields Parkway & Abraham Lake Ice Bubbles Tour",
    "provider": "Radventures",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-banff-national-park-guided-tour-with-snowshoeing-hike-t437787/",
    "sourceUrls": [
      "https://www.radventurescanada.com/winter-tours/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A winter road-and-walk outing with condition-dependent stops and selected Banff or Lake Louise pickup. Confirm the actual winter departure, road and equipment. Ice bubbles, skating, snowshoeing and a particular Peyto stop are not guaranteed."
  },
  {
    "id": "gyg-432341",
    "productId": "432341",
    "title": "Banff: Ice Climbing Adventure - Beginner",
    "provider": "Alpine Air Adventures Inc",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-ice-climbing-adventure-beginner-t432341/",
    "sourceUrls": [
      "https://alpineairadventures.com/product/ice-climbing-course-beginner/"
    ],
    "launchState": "ready",
    "seasonalNotice": "Winter beginner instruction for ages 14 and over. Own transport to the conditions-selected climbing site is required; minimum four bookings. Confirm the actual date, venue, equipment and group requirements. A general venue list does not override a closure."
  },
  {
    "id": "gyg-303298",
    "productId": "303298",
    "title": "Banff: Grotto Canyon Icewalk",
    "provider": "Discover Banff Tours",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-grotto-canyon-icewalk-t303298/",
    "sourceUrls": [
      "https://banfftours.com/activities/grotto-canyon-icewalk/"
    ],
    "launchState": "held",
    "seasonalNotice": "The separate Grotto Canyon frozen-creek listing warns it is usually unavailable. Check actual dates, Alberta advisories, ages and pickup before planning the outing.",
    "holdReason": "Listing says usually unavailable; actual date availability and a Grotto-specific destination require review."
  },
  {
    "id": "gyg-1164949",
    "productId": "1164949",
    "title": "Banff: Small-group Tour of Frozen Gems of Yoho and Kootenay",
    "provider": "Radventures",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-small-group-tour-of-frozen-gems-of-yoho-and-kootenay-t1164949/",
    "sourceUrls": [
      "https://www.radventurescanada.com/winter-tours/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A winter road-and-walk outing in Yoho and Kootenay with selected Banff pickup. The route and optional walks change with conditions. Confirm the actual date, stops, walking requirements and return with the provider."
  },
  {
    "id": "gyg-303253",
    "productId": "303253",
    "title": "Banff: Morning or Afternoon Johnston Canyon Icewalk",
    "provider": "Discover Banff Tours",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-morning-or-afternoon-johnston-canyon-icewalk-t303253/",
    "sourceUrls": [
      "https://banfftours.com/activities/johnston-canyon-icewalk/"
    ],
    "launchState": "held",
    "seasonalNotice": "Checked 30 October 2026: Johnston Canyon trail and day-use area are closed from 13 October, with a scheduled end of 11 December. This is not confirmed reopening. Check current access and ask the operator about the route for your date.",
    "holdReason": "Johnston Canyon closure; verify reopening and actual operator route before enabling ads."
  },
  {
    "id": "gyg-437912",
    "productId": "437912",
    "title": "From Banff: Winter Wonderland; Lake Louise & Johnston Canyon",
    "provider": "Radventures",
    "productUrl": "https://www.getyourguide.com/banff-l284/from-banff-winter-wonderland-lake-louise-johnston-canyon-t437912/",
    "sourceUrls": [
      "https://www.radventurescanada.com/day-tours/winter-wonderland/"
    ],
    "launchState": "held",
    "seasonalNotice": "The advertised Johnston Canyon stop is affected by the dated closure through a scheduled 11 December 2026. Confirm the actual route and departure. Skating and snowshoeing are not guaranteed.",
    "holdReason": "Johnston Canyon closure affects advertised route; confirm operator alternative and access before ads."
  },
  {
    "id": "gyg-916190",
    "productId": "916190",
    "title": "Banff Nightfall: Lake Minnewanka & Two Jack Stargazing Tour",
    "provider": "Into the Wild Tours",
    "productUrl": "https://www.getyourguide.com/canmore-l117485/stargazing-possible-northern-lights-in-banff-national-park-t916190/",
    "sourceUrls": [
      "https://www.getyourguide.com/canmore-l117485/stargazing-possible-northern-lights-in-banff-national-park-t916190/",
      "https://intothewildtours.ca/winter-tours/",
      "https://intothewildtours.ca/stargazing/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A weather-dependent evening road-and-stargazing outing with selected Banff and Canmore pickup, for ages 6 and over. Confirm winter dates because operator pages differ on the season. Cloud, snow, wind or extreme cold can change the plan. Stars and northern lights are not guaranteed."
  },
  {
    "id": "gyg-303208",
    "productId": "303208",
    "title": "From Banff: Snowshoeing Tour in Kootenay National Park",
    "provider": "Discover Banff Tours",
    "productUrl": "https://www.getyourguide.com/banff-l284/4-hour-snowshoeing-tour-in-kootenay-national-park-from-banff-t303208/",
    "sourceUrls": [
      "https://banfftours.com/activities/paint-pots-snowshoeing-tour/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A December-to-April snowshoe outing from Banff to the Paint Pots in Kootenay National Park, for ages 8 and over. Snowshoes and poles are listed; winter clothing is required. Confirm your actual date and pickup on the chosen listing. This is not a Banff or Lake Louise trail visit."
  },
  {
    "id": "gyg-285990",
    "productId": "285990",
    "title": "Banff: Castle Food Experience at Banff Springs Hotel",
    "provider": "Alberta Food Tours",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-castle-food-experience-at-banff-springs-hotel-t285990/",
    "sourceUrls": [
      "https://albertafoodtours.ca/tours/eat-the-castle-at-fairmont-banff-springs-hotel/"
    ],
    "launchState": "held",
    "holdReason": "Listing warns usually unavailable. Confirm a suitable selected date before enabling a Castle-specific ad group.",
    "seasonalNotice": "An indoor food-and-history experience at Fairmont Banff Springs, for ages 14 and over. The listing warns it is usually unavailable; check your actual date. Meet in the main lobby and discuss dietary requirements with the provider. The tour is not ideal for vegans."
  },
  {
    "id": "gyg-698951",
    "productId": "698951",
    "title": "Banff: Guided Foodie Walking Tour with Samples",
    "provider": "Nibble Tours",
    "productUrl": "https://www.getyourguide.com/banff-l284/banff-guided-foodie-walking-tour-with-samples-t698951/",
    "sourceUrls": [
      "https://www.nibbletours.com/service-page/taste-of-banff-food-tour"
    ],
    "launchState": "ready",
    "seasonalNotice": "A year-round Banff tasting walk with weather-appropriate clothing and a Visitor Centre meeting point. Confirm your date, dietary needs, walking requirements and selected standard or premium option. Drinks and other inclusions vary by option."
  },
  {
    "id": "gyg-1182128",
    "productId": "1182128",
    "title": "Canmore/Banff Snowshoeing Adventure Including Transportation",
    "provider": "Banff & Canmore Tours",
    "productUrl": "https://www.getyourguide.com/kananaskis-l163330/canmorebanff-snowshoeing-adventure-2hrs-transportation-t1182128/",
    "sourceUrls": [
      "https://www.getyourguide.com/banff-canmore-tours-s193646/"
    ],
    "launchState": "ready",
    "seasonalNotice": "A winter guided snowshoe trek in Kananaskis with equipment and mountain transportation. Choose the actual Banff or Canmore meeting option; the listing gives a moderate outing of 2.5–3 hours and about 75 metres of elevation gain. Confirm the date, group requirements and return."
  }
];

export const activityCampaignTargets: ActivityCampaignTarget[] = [
  {
    "id": "gondola-visit",
    "guidePath": "/blog/banff-gondola-guide/",
    "aliases": [],
    "title": "Banff Gondola Visit",
    "groupName": "Banff Gondola Visit",
    "primaryOfferId": "gyg-256607",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff gondola",
      "sulphur mountain gondola",
      "banff gondola winter",
      "banff cable car",
      "banff gondola guide"
    ],
    "phraseKeywords": [
      "banff gondola visit",
      "sulphur mountain gondola",
      "banff cable car"
    ],
    "headlines": [
      "Plan Your Banff Gondola Visit",
      "Summit & Journey Guide",
      "Banff Gondola Explained",
      "A Mountain Sightseeing Visit",
      "Compare Admission Choices",
      "Independent BanffBound Guide"
    ],
    "descriptions": [
      "Plan the summit visit, stairs and Mountain Avenue journey. See admission choices.",
      "Understand the ride, indoor visit and separate boardwalk before choosing a ticket.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "gondola-tickets",
    "guidePath": "/blog/banff-gondola-tickets-guide/",
    "aliases": [],
    "title": "Banff Gondola Tickets",
    "groupName": "Banff Gondola Tickets",
    "primaryOfferId": "gyg-256607",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff gondola tickets",
      "banff gondola admission",
      "sulphur mountain gondola tickets",
      "buy banff gondola tickets",
      "banff gondola booking"
    ],
    "phraseKeywords": [
      "banff gondola tickets",
      "banff gondola admission",
      "banff gondola booking"
    ],
    "headlines": [
      "Banff Gondola Ticket Guide",
      "Compare Admission Choices",
      "Plan Your Gondola Booking",
      "Admission, Meals & Passes",
      "Know What Your Ticket Covers",
      "Independent BanffBound Guide"
    ],
    "descriptions": [
      "Compare admission, dining and pass choices. Read actual inclusions before booking.",
      "See the admission option. Choose your date and read provider terms.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "electric-fat-bike",
    "guidePath": "/blog/banff-fat-biking/",
    "aliases": [],
    "title": "Banff Electric Fat-Bike Tour",
    "groupName": "Banff Electric Fat-Bike Tour",
    "primaryOfferId": "gyg-798459",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff fat bike tour",
      "banff electric fat bike tour",
      "guided fat biking banff",
      "banff winter bike tour",
      "banff e fat bike tour"
    ],
    "phraseKeywords": [
      "banff fat bike tour",
      "banff electric fat bike",
      "guided fat biking banff"
    ],
    "headlines": [
      "Banff Electric Fat-Bike Tour",
      "A Guided Ride Around Banff",
      "Plan A Banff Winter Ride",
      "Tour & Meeting Point Guide",
      "Match The Ride To Your Group",
      "See The Guided Tour Option"
    ],
    "descriptions": [
      "Explore the guided electric fat-bike option, meeting point and winter route checks.",
      "A guided tour differs from a bike rental. Plan the start, equipment and return.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "three-sisters-flight",
    "guidePath": "/blog/banff-helicopter-tours/",
    "aliases": [],
    "title": "Canmore Scenic Helicopter Tour",
    "groupName": "Canmore Scenic Helicopter Tour",
    "primaryOfferId": "gyg-841685",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "canmore helicopter tour",
      "three sisters helicopter tour",
      "canmore scenic flight",
      "helicopter tours near banff",
      "banff helicopter tours"
    ],
    "phraseKeywords": [
      "canmore helicopter tour",
      "three sisters helicopter",
      "helicopter tours near banff"
    ],
    "headlines": [
      "Canmore Helicopter Tour Guide",
      "Three Sisters Scenic Flight",
      "Helicopter Tours Near Banff",
      "Plan The Canmore Departure",
      "Compare The Actual Flight",
      "Scenic Flight, Separate Base"
    ],
    "descriptions": [
      "Plan a scenic helicopter flight from Canmore. Read boarding and transport checks.",
      "See the Three Sisters flight option. Confirm your date, weather and party needs.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "cross-country-lesson",
    "guidePath": "/blog/banff-cross-country-skiing/",
    "aliases": [],
    "title": "Lake Louise Cross-Country Lesson",
    "groupName": "Lake Louise Cross-Country Lesson",
    "primaryOfferId": "gyg-292675",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "lake louise cross country ski lessons",
      "lake louise nordic ski lesson",
      "cross country skiing lessons lake louise",
      "lake louise cross country ski tour",
      "beginner cross country skiing lake louise"
    ],
    "phraseKeywords": [
      "lake louise cross country lesson",
      "lake louise nordic ski lesson",
      "lake louise cross country tour"
    ],
    "headlines": [
      "Lake Louise Nordic Ski Lesson",
      "Plan A Cross-Country Lesson",
      "Instruction & Tour Explained",
      "Check The Gear Before You Go",
      "A Separate Nordic Ski Day",
      "Lake Louise Lesson Guide"
    ],
    "descriptions": [
      "See a Lake Louise cross-country lesson and tour. Check gear and meeting details.",
      "Cross-country instruction differs from downhill skiing. Match the lesson to your group.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "winter-parkway-tour",
    "guidePath": "/blog/icefields-parkway-guide/",
    "aliases": [],
    "title": "Icefields Parkway Winter Tour",
    "groupName": "Icefields Parkway Winter Tour",
    "primaryOfferId": "gyg-437787",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "icefields parkway winter tour",
      "banff ice bubbles tour",
      "abraham lake tour from banff",
      "banff winter icefields tour",
      "abraham lake ice bubbles tour"
    ],
    "phraseKeywords": [
      "icefields parkway winter tour",
      "abraham lake tour from banff",
      "banff ice bubbles tour"
    ],
    "headlines": [
      "Icefields Parkway Winter Tour",
      "Plan A Winter Road Day",
      "Abraham Lake Tour Guide",
      "Road, Stops & Booking Checks",
      "Match The Tour To Your Date",
      "Independent BanffBound Guide"
    ],
    "descriptions": [
      "Explore a winter road-tour option with condition-dependent stops and selected pickup.",
      "Plan the Parkway journey and actual route. Ice bubbles and outdoor stops can vary.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "peyto-winter-tour",
    "guidePath": "/blog/peyto-lake-guide/",
    "aliases": [],
    "title": "Peyto Lake Winter Tour",
    "groupName": "Peyto Lake Winter Tour",
    "primaryOfferId": "gyg-437787",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "peyto lake winter tour",
      "peyto lake tour from banff",
      "peyto lake guided winter tour"
    ],
    "phraseKeywords": [
      "peyto lake winter tour",
      "peyto lake tour from banff"
    ],
    "headlines": [
      "Peyto Lake Winter Visit Guide",
      "Plan The Viewpoint Journey",
      "A Parkway Winter Tour Option",
      "Check The Actual Tour Route",
      "Winter Access & Booking Guide",
      "Choose The Complete Outing"
    ],
    "descriptions": [
      "Plan Peyto winter access and a Parkway tour option. Stops depend on conditions.",
      "Check the actual Peyto stop, walking requirements and return before booking.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "johnston-icewalk",
    "guidePath": "/blog/banff-ice-walk-guide/",
    "aliases": [
      "/activities/ice-walk-johnston-canyon/"
    ],
    "title": "Johnston Canyon Icewalk",
    "groupName": "Johnston Canyon Icewalk",
    "primaryOfferId": "gyg-303253",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "johnston canyon icewalk tour",
      "banff johnston canyon ice walk",
      "guided johnston canyon icewalk",
      "johnston canyon winter tour"
    ],
    "phraseKeywords": [
      "johnston canyon icewalk tour",
      "guided johnston canyon icewalk"
    ],
    "headlines": [
      "Johnston Canyon Icewalk Guide",
      "Check Canyon Access First",
      "Plan The Guided Winter Walk",
      "Date & Route Checks Matter",
      "An Independent Canyon Guide",
      "Choose The Actual Departure"
    ],
    "descriptions": [
      "Read the dated canyon closure before choosing a tour. Reopening is not confirmed.",
      "Plan the route and winter footing. A listing does not override a closure.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider.",
      "Read the complete journey and group checks before opening your booking options."
    ]
  },
  {
    "id": "banff-night-sky",
    "guidePath": "/blog/banff-northern-lights/",
    "aliases": [
      "/activities/northern-lights/"
    ],
    "title": "Banff Stargazing Tour",
    "groupName": "Banff Stargazing Tour",
    "primaryOfferId": "gyg-916190",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff stargazing tour",
      "banff night sky tour",
      "banff northern lights tour",
      "lake minnewanka stargazing tour",
      "banff evening stargazing"
    ],
    "phraseKeywords": [
      "banff stargazing tour",
      "banff night sky tour",
      "banff northern lights tour"
    ],
    "headlines": [
      "Banff Stargazing Tour Guide",
      "Plan A Banff Night-Sky Tour",
      "Lake & Night-Sky Outing",
      "Northern Lights Are Optional",
      "Date, Weather & Pickup Checks",
      "An Evening Beyond The Town"
    ],
    "descriptions": [
      "Explore a guided night-sky outing with selected pickup. Views depend on weather.",
      "Plan the cold, actual date and return. Stars and northern lights are not guaranteed.",
      "Read the evening plan and group checks, then choose a departure with the provider.",
      "Independent BanffBound guide. Check the actual route and cancellation terms."
    ]
  },
  {
    "id": "paint-pots-snowshoe",
    "guidePath": "/blog/banff-snowshoeing-guide/",
    "aliases": [
      "/activities/snowshoeing/"
    ],
    "title": "Snowshoe Tour from Banff",
    "groupName": "Snowshoe Tour from Banff",
    "primaryOfferId": "gyg-303208",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff snowshoe tour",
      "guided snowshoeing from banff",
      "paint pots snowshoe tour",
      "banff guided snowshoeing",
      "kootenay snowshoe tour"
    ],
    "phraseKeywords": [
      "banff snowshoe tour",
      "guided snowshoeing from banff",
      "paint pots snowshoe tour"
    ],
    "headlines": [
      "Snowshoe Tour From Banff",
      "Plan A Guided Snowshoe Day",
      "Paint Pots Winter Tour Guide",
      "A Kootenay Outing From Banff",
      "Dates, Gear & Journey Checks",
      "Choose The Actual Departure"
    ],
    "descriptions": [
      "Compare a guided winter snowshoe outing from Banff to the Paint Pots in Kootenay.",
      "Read ages, gear and pickup checks. The operator lists a December-to-April season.",
      "A tour and independent trail visit are different plans. Match the outing to your group.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider."
    ]
  },
  {
    "id": "beginner-ice-climbing",
    "guidePath": "/activities/ice-climbing/",
    "aliases": [],
    "title": "Beginner Ice Climbing Near Banff",
    "groupName": "Beginner Ice Climbing Near Banff",
    "primaryOfferId": "gyg-432341",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff beginner ice climbing",
      "banff ice climbing course",
      "guided ice climbing banff",
      "ice climbing near banff",
      "banff ice climbing lesson"
    ],
    "phraseKeywords": [
      "banff beginner ice climbing",
      "banff ice climbing course",
      "guided ice climbing banff"
    ],
    "headlines": [
      "Beginner Ice Climbing Guide",
      "Plan A Guided Ice-Climbing Day",
      "Banff Course & Journey Guide",
      "A Supervised Winter Course",
      "Dates, Gear & Meeting Checks",
      "Choose The Actual Course"
    ],
    "descriptions": [
      "Explore the beginner course, age rules and the complete journey to the meeting point.",
      "Read the venue, equipment and transport checks before choosing a winter date.",
      "A beginner climbing course and an icewalk are different outings. Compare your plans.",
      "Independent BanffBound guide. Confirm the actual course and terms with the provider."
    ]
  },
  {
    "id": "yoho-kootenay-winter",
    "guidePath": "/activities/yoho-kootenay-winter-tours/",
    "aliases": [],
    "title": "Yoho & Kootenay Winter Tour",
    "groupName": "Yoho & Kootenay Winter Tour",
    "primaryOfferId": "gyg-1164949",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "yoho winter tour from banff",
      "kootenay winter tour from banff",
      "yoho kootenay winter tour",
      "emerald lake winter tour from banff",
      "banff frozen gems tour"
    ],
    "phraseKeywords": [
      "yoho winter tour from banff",
      "kootenay winter tour from banff",
      "yoho kootenay winter tour"
    ],
    "headlines": [
      "Yoho & Kootenay Winter Tour",
      "Plan A Winter Road Day",
      "A Guided Outing From Banff",
      "Stops, Walks & Pickup Checks",
      "Explore The Frozen Gems Tour",
      "Choose The Actual Departure"
    ],
    "descriptions": [
      "Compare a guided winter road day with selected Banff pickup and optional walks.",
      "Read the actual route and group checks. Stops change with winter conditions.",
      "Plan the pickup, meal option and return before choosing a winter departure.",
      "Independent BanffBound guide. Confirm the actual date and terms with the provider."
    ]
  },
  {
    "id": "banff-food-tours",
    "guidePath": "/activities/banff-food-tours/",
    "aliases": [],
    "title": "Banff Food Tours",
    "groupName": "Banff Food Tours",
    "primaryOfferId": "gyg-698951",
    "kind": "product",
    "maximumCpcGBP": 0.07,
    "exactKeywords": [
      "banff food tour",
      "banff foodie walking tour",
      "banff guided food tour",
      "banff tasting tour",
      "food walking tour banff"
    ],
    "phraseKeywords": [
      "banff food tour",
      "banff foodie walking tour",
      "banff tasting tour"
    ],
    "headlines": [
      "Banff Food Tour Guide",
      "Plan A Banff Tasting Walk",
      "A Guided Town Food Tour",
      "Compare Food Tour Formats",
      "Menu & Meeting Point Checks",
      "Choose Your Tasting Experience"
    ],
    "descriptions": [
      "Explore the guided town tasting walk, meeting point and selected drinks options.",
      "Compare a town food walk with the separate Castle experience before choosing a date.",
      "Read walking and dietary checks. Confirm the menu and actual option with the provider.",
      "Independent BanffBound guide. Check the complete experience and booking terms."
    ],
    "secondaryOfferIds": [
      "gyg-285990"
    ]
  }
];

function canonicalGuidePath(value: unknown): string | null {
 if (typeof value !== 'string' || !value || value !== value.trim() || /[?#\\]/.test(value)) return null;
 if (/^[a-z0-9-]+$/.test(value)) return '/blog/' + value + '/';
 if (!/^\/(?:blog|activities)\/[a-z0-9-]+\/?$/.test(value)) return null;
 return value.endsWith('/') ? value : value + '/';
}
/** Native SSR uses an editorial label. The paid label is an allowlisted data attribute,
 * consumed separately by the bounded paid-traffic installer, not assumed for all visits. */
export function resolveActivityBookingTarget(pathOrSlug: unknown) {
 const path = canonicalGuidePath(pathOrSlug);
 if (!path) return null;
 const target = activityCampaignTargets.find(item => item.guidePath === path || item.aliases.includes(path));
 if (!target) return null;
 const offer = activityBookingOffers.find(item => item.id === target.primaryOfferId);
 if (!offer) throw new Error('Unknown reviewed activity product: ' + target.primaryOfferId);
 const campaignLabel = 'banffbound_' + target.id.replaceAll('-', '_');
 const paidCampaignLabel = 'bb_ca_activities_' + target.id.replaceAll('-', '_');
 const url = new URL(offer.productUrl);
 url.searchParams.set('partner_id', activityCampaignPartnerId);
 url.searchParams.set('cmp', campaignLabel);
 return { id: target.id, title: target.title, label: offer.launchState === 'ready' ? 'Book now' : 'Find out more', bookingUrl: url.href,
  campaignLabel, paidCampaignLabel, seasonalNotice: offer.seasonalNotice,
  launchState: offer.launchState, kind: target.kind, offerId: offer.id,
  productTitle: offer.title, provider: offer.provider, guidePath: target.guidePath };
}
/** Other explicitly compared products remain separate native choices, never a second sticky bar. */
export function resolveActivityBookingAlternatives(pathOrSlug: unknown) {
 const primary = resolveActivityBookingTarget(pathOrSlug);
 if (!primary) return [];
 const target = activityCampaignTargets.find(item => item.id === primary.id)!;
 return (target.secondaryOfferIds || []).map(offerId => {
  const offer = activityBookingOffers.find(item => item.id === offerId);
  if (!offer) throw new Error('Unknown alternative activity product: ' + offerId);
  const id = target.id + '-castle';
  const campaignLabel = 'banffbound_' + id.replaceAll('-', '_');
  const paidCampaignLabel = 'bb_ca_activities_' + id.replaceAll('-', '_');
  const url = new URL(offer.productUrl);
  url.searchParams.set('partner_id', activityCampaignPartnerId);
  url.searchParams.set('cmp', campaignLabel);
  return { id, title: offer.title, label: offer.launchState === 'ready' ? 'Book now' : 'Find out more', bookingUrl: url.href,
   campaignLabel, paidCampaignLabel, seasonalNotice: offer.seasonalNotice,
   launchState: offer.launchState, kind: 'product' as const, offerId,
   productTitle: offer.title, provider: offer.provider, guidePath: target.guidePath };
 });
}

const seenProducts = new Set<string>();
for (const offer of activityBookingOffers) {
 const url = new URL(offer.productUrl);
 if (seenProducts.has(offer.id) || offer.id !== 'gyg-' + offer.productId || !/^\d+$/.test(offer.productId)
  || url.origin !== 'https://www.getyourguide.com' || url.search || url.hash
  || !url.pathname.endsWith('-t' + offer.productId + '/')) throw new Error('Invalid reviewed activity identity: ' + offer.id);
 seenProducts.add(offer.id);
}
const seenTargets = new Set<string>(), seenPaths = new Set<string>();
for (const target of activityCampaignTargets) {
 if (seenTargets.has(target.id) || !/^[a-z0-9-]+$/.test(target.id) || target.maximumCpcGBP !== activityCampaignMaximumCpcGBP
  || !seenProducts.has(target.primaryOfferId) || (target.secondaryOfferIds || []).some(id => !seenProducts.has(id))) throw new Error('Invalid activity target: ' + target.id);
 seenTargets.add(target.id);
 for (const path of [target.guidePath, ...target.aliases]) {
  if (seenPaths.has(path) || canonicalGuidePath(path) !== path) throw new Error('Invalid activity guide path: ' + path);
  seenPaths.add(path);
 }
 if (!target.headlines.length || target.headlines.length > 15 || target.headlines.some(v => v.length > 30)
  || target.descriptions.length < 2 || target.descriptions.length > 4 || target.descriptions.some(v => v.length > 90)) throw new Error('Activity ad asset limits: ' + target.id);
}
