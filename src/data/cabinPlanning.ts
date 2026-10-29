/** Named room-category examples checked 2026-10-29; not live inventory. */
export const cabinReviewedAt = '2026-10-29';
export const cabinFilterOptions = {
  base: [['all','All areas'],['banff','Banff town'],['castle','Castle Junction / Highway 93 South'],['louise','Lake Louise area'],['yoho','Field / Yoho, BC']],
  season: [['all','Season not decided'],['summer','Summer cabin plans'],['winter','Winter cabin questions']],
  kitchen: [['all','All meal plans'],['full','Full kitchen listed'],['light','Light food preparation'],['dining','Plan around lodge dining']],
} as const;
export type CabinFilters = { base: 'all'|'banff'|'castle'|'louise'|'yoho'; season: 'all'|'summer'|'winter'; kitchen: 'all'|'full'|'light'|'dining' };
export const cabinExamples = [
  { id:'tunnel-mountain-cabin', propertySlug:'tunnel-mountain-resort', name:'Tunnel Mountain Resort — Mountain Cabin', base:'banff', kitchen:'full', summerOnly:false,
    room:'A freestanding chalet with a queen bedroom and an upstairs loft containing two double beds. Compare the stairs and actual bed allocation with your party.',
    cooking:'The named Mountain Cabin lists a full kitchen with fridge, stove and microwave. A Superior Suite elsewhere at the resort has a different kitchenette.',
    seasonNote:'Confirm the cabin category and your actual dates; a resort room quote does not reserve this freestanding layout.',
    journey:'502 Tunnel Mountain Road, above central Banff. Check the local stop and return; a local Roam guest pass does not establish a ski-resort or regional transfer.',
    sources:[['Mountain Cabin layout','https://tunnelmountain.com/mountain-cabin/'],['Property facilities','https://tunnelmountain.com/amenities/']],
    bookingHref:'https://www.expedia.ca/Banff-Hotels-Tunnel-Mountain-Resort.h16324.Hotel-Information?camref=1101l3MtWX', affiliate:true },
  { id:'castle-deluxe-chalet', propertySlug:'castle-mountain-chalets', name:'Castle Mountain Chalets — Deluxe One Bedroom', base:'castle', kitchen:'full', summerOnly:false,
    room:'A king bedroom separated from the living area, with a queen sofa bed. Confirm occupancy and any access features with the operator.',
    cooking:'The Deluxe One Bedroom category lists an electric stove/oven, full-size fridge and dishwasher. Check the exact chalet name rather than assuming every suite shares it.',
    seasonNote:'The operator describes winter stays and activities. Confirm opening, the selected chalet and current trip-day conditions for your dates.',
    journey:'Castle Junction is a separate road base between Banff and Lake Louise. Arrange groceries and both directions of the property-to-activity journey; check train noise if it matters.',
    sources:[['Exact chalet category','https://www.castlemountain.com/rooms-deluxeonebedroomchalet.html'],['Property and journey FAQ','https://www.castlemountain.com/faqs.html']],
    bookingHref:'https://www.castlemountain.com/rooms-deluxeonebedroomchalet.html', affiliate:false },
  { id:'baker-family-cabin', propertySlug:'baker-creek-by-basecamp', name:'Baker Creek — Family Superior Two Bedroom Cabin', base:'louise', kitchen:'light', summerOnly:false,
    room:'Two bedrooms: one queen bed and a bunk with a queen lower bed and twin upper bed. Match the actual sleeping arrangement to your group.',
    cooking:'This category lists a mini-fridge, microwave and hot plate. It does not establish an oven-equipped kitchen. The property lists Creekside Café for grab-and-go food.',
    seasonNote:'Winter amenities are advertised, subject to conditions. Confirm this exact cabin, meal options and arrival arrangements for your dates.',
    journey:'A Bow Valley Parkway base near Lake Louise, separate from the village and lakeshore. Plan food, the road journey and your return before booking activities.',
    sources:[['Exact two-bedroom cabin','https://basecampresorts.com/room-details/baker-creek-family-superior-two-bedroom-cabin/'],['Cabins, café and winter facilities','https://basecampresorts.com/bakercreek/']],
    bookingHref:'https://www.expedia.ca/Lake-Louise-Hotels-Baker-Creek-Mountain-Resort.h7710611.Hotel-Information?camref=1101l3MtWX', affiliate:true },
  { id:'paradise-wilson-cabin', propertySlug:'paradise-lodge-bungalows', name:'Paradise Lodge & Bungalows — Wilson Cabin', base:'louise', kitchen:'light', summerOnly:true,
    room:'An open-plan historic cabin with a queen bed. Other cabin and suite categories have different beds and equipment.',
    cooking:'Wilson lists a fridge, microwave and coffee maker convenience area. Cooper, Peyto and other named cabins list kitchen facilities; ask about the equipment you need.',
    seasonNote:'Historic cabins are described as summer accommodation. The current winter offering is suites, so this cabin is excluded from winter matches; the whole property is not described as winter-closed.',
    journey:'105 Lake Louise Drive, between village and lakeshore. A hotel address does not reserve lake transport, attraction access or a ski shuttle.',
    sources:[['Historic cabin categories','https://paradiselodge.com/cabins/'],['Winter suites versus summer cabins','https://paradiselodge.com/paradise-lodge/']],
    bookingHref:'https://www.expedia.ca/Lake-Louise-Hotels-Paradise-Lodge-Bungalows.h7829397.Hotel-Information?camref=1101l3MtWX', affiliate:true },
  { id:'storm-log-cabin', propertySlug:'storm-mountain-lodge', name:'Storm Mountain Lodge — Historic Log Cabin', base:'castle', kitchen:'dining', summerOnly:false,
    room:'A log-cabin stay centred on lodge dining. Confirm the selected bed/bath layout and the actual meals operating on your nights.',
    cooking:'The operator explicitly states no cabin kitchens and prohibits indoor and outdoor cooking. It also lists no cabin fridge, coffee maker or Wi-Fi.',
    seasonNote:'Winter stays are described, with a steep snow-packed driveway. Published reduced-season opening patterns differ between official pages; confirm your nights and meals directly.',
    journey:'Off Highway 93 South outside Banff town. Make an arrival, food and return plan for the exact property; a regional road journey is part of this stay.',
    sources:[['Cabins and cooking restrictions','https://stormmountainlodge.com/logcabins/'],['Location and opening arrangements','https://stormmountainlodge.com/contact/']],
    bookingHref:'https://stormmountainlodge.com/logcabins/', affiliate:false },
  { id:'cathedral-cabin', propertySlug:'cathedral-mountain-lodge', name:'Cathedral Mountain Lodge — seasonal cabin stay', base:'yoho', kitchen:'dining', summerOnly:true,
    room:'Compare the actual Premier, Cathedral King or Twin category. Premier Loft introduces ladder access and its own family age requirements.',
    cooking:'Plan around the Riverside Dining Room and confirm booked meal inclusions and reservations. This comparison does not establish a self-catering kitchen in your cabin.',
    seasonNote:'The operator describes a summer season from late May to early October. Check the actual year’s dates; this is excluded from winter matches.',
    journey:'1 Yoho Valley Road near Field, British Columbia. The operator says there is no regular lodge shuttle. Any seasonal sister-property benefit needs its own terms and journey.',
    sources:[['Season, meals, access and transport FAQ','https://www.cathedralmountainlodge.com/frequently-asked-questions/'],['Cabin categories','https://www.cathedralmountainlodge.com/accommodation/']],
    bookingHref:'https://www.cathedralmountainlodge.com/accommodation/', affiliate:false },
] as const;
export function normaliseCabinFilters(input: unknown): CabinFilters {
  const raw=input&&typeof input==='object'&&!Array.isArray(input)?input as Record<string,unknown>:{};
  const result:CabinFilters={base:'all',season:'all',kitchen:'all'};
  for(const key of ['base','season','kitchen'] as const) if(cabinFilterOptions[key].some(option=>option[0]===raw[key])) (result as Record<string,unknown>)[key]=raw[key];
  return result;
}
export function compareCabinStays(input: unknown) {
  const filters=normaliseCabinFilters(input);
  const selectedIds=cabinExamples.filter(c=>(filters.base==='all'||c.base===filters.base)&&(filters.kitchen==='all'||c.kitchen===filters.kitchen)&&(filters.season!=='winter'||!c.summerOnly)).map(c=>c.id);
  const notes=['Matches describe published room categories and planning needs, not available rooms, an access assessment or a price ranking.'];
  if(filters.season==='winter') notes.push('Winter removes Paradise’s historic cabins and Cathedral’s summer-only stay. Other results still need confirmation of the selected cabin, opening nights and actual dates.');
  if(filters.base!=='all'&&filters.base!=='banff') notes.push('Arrange the exact property journey and return, including groceries and any activity pickup. No town, lake or resort shuttle is assumed.');
  if(!selectedIds.length) notes.push('No example in this limited comparison matches every choice. This does not mean rooms are sold out; reset a filter or ask a property about another category.');
  return {filters,selectedIds,notes};
}
