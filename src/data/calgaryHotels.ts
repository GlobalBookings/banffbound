import { gatewayHotelLinks } from './gatewayHotelLinks';

export const calgaryHotelsReviewedOn = '2026-11-13';
export const calgaryHotelsPath = '/book/calgary-hotels/';
export const calgaryHotelSearch = gatewayHotelLinks.calgarySearch;

export const calgaryHotelAreas = [
  { id: 'airport', label: 'YYC & airport hotels', description: 'Choose a terminal hotel to walk from your flight, or compare nearby hotels with their own airport shuttle.' },
  { id: 'downtown', label: 'Downtown & Beltline', description: 'Stay near restaurants, city sights or a named tour pickup. Check the exact address on your ticket.' },
  { id: 'west', label: 'West Calgary & university', description: 'Start on the west side for a drive towards Banff, or stay near the university and hospitals for a Calgary visit.' },
] as const;

type HotelArea = typeof calgaryHotelAreas[number]['id'];

interface CalgaryHotel {
  slug: string;
  name: string;
  area: HotelArea;
  address: string;
  bestFor: string;
  rating: number;
  expediaListing: string;
  official: string;
  overview: string;
  rooms: string;
  banff: string;
  checks: [string, string];
  photoAlt: [string, string];
  oldAnchor?: string;
  pickupSource?: string;
}

const properties: CalgaryHotel[] = [
  {
    slug: 'marriott-yyc',
    name: 'Calgary Airport Marriott In-Terminal Hotel',
    area: 'airport',
    address: '2008 Airport Road NE, Calgary',
    bestFor: 'A terminal overnight',
    rating: 9.4,
    expediaListing: 'Calgary-Airport-Marriott-In-Terminal-Hotel.h15739231',
    official: 'https://www.marriott.com/en-us/hotels/yycxa-calgary-airport-marriott-in-terminal-hotel/overview/',
    overview: 'A hotel inside the airport complex, useful for a late flight or an early departure. A terminal stay leaves you close to airline check-in and airport transfer meeting points.',
    rooms: 'Compare a standard king or two-queen room with the view and club categories. Pick an airport-view room only if the booked category names it.',
    banff: 'Follow your transfer confirmation to the operator’s meeting point in arrivals. If you are renting a car, check the desk opening hours before deciding to collect it the night you land.',
    checks: ['Compare the price with the connected Delta for your dates.', 'Ask the hotel about the indoor route from your airline’s terminal and confirm overnight parking separately.'],
    photoAlt: ['Marriott hotel entrance at Calgary International Airport', 'Guest room with a king bed, sofa and window'],
    oldAnchor: 'yyc-airport',
  },
  {
    slug: 'delta-yyc',
    name: 'Delta Hotels by Marriott Calgary Airport In-Terminal',
    area: 'airport',
    address: '2001 Airport Road NE, Calgary',
    bestFor: 'A second walkable YYC option',
    rating: 9.4,
    expediaListing: 'Delta-Hotels-By-Marriott-Calgary-Airport-In-Terminal.h9920',
    official: 'https://www.marriott.com/en-us/hotels/yycca-delta-hotels-calgary-airport-in-terminal/overview/',
    overview: 'A separate airport hotel connected to the terminal. Compare it with the Airport Marriott if your main goal is to get to a bed or back to check-in with minimal travel.',
    rooms: 'Marriott lists king and two-queen rooms as well as suites. Choose by bed count and access needs, especially if several people are sharing after a late arrival.',
    banff: 'Book a shuttle that explicitly departs from YYC. Follow its arrivals instructions on the morning of travel. The Delta Downtown on 4th Avenue SE is a different hotel and tour pickup.',
    checks: ['Confirm the indoor route for your arrival and how to reach your shuttle with luggage.', 'Check the rate’s breakfast and cancellation terms for a short stay.'],
    photoAlt: ['Exterior of the Delta hotel connected to Calgary airport', 'Guest room with a king bed and television'],
  },
  {
    slug: 'hotel-clique',
    name: 'Hotel Clique Calgary Airport',
    area: 'airport',
    address: '24 Aero Crescent NE, Calgary',
    bestFor: 'An airport shuttle and a rooftop soak',
    rating: 9.2,
    expediaListing: 'Hotel-Clique-Calgary-Airport.h8822309',
    official: 'https://www.hotelclique.ca/',
    overview: 'An off-airport hotel with a hotel-run airport shuttle and rooftop hot tubs. Compare the total cost with terminal hotels and allow time for the extra leg.',
    rooms: 'Check king and two-queen options. The hotel also has individually themed suites. Confirm the bed configuration and bath or shower setup on the room you select.',
    banff: 'The hotel shuttle connects with YYC. If your Banff booking starts at the terminal, plan the hotel shuttle and the mountain transfer as two legs, with a buffer between them.',
    checks: ['Check the current airport pickup instructions and space for skis or oversized luggage.', 'Confirm rooftop hot tub hours and availability if that is a reason to book.'],
    photoAlt: ['Rooftop hot tub at Hotel Clique Calgary Airport', 'Guest room at Hotel Clique with two beds'],
  },
  {
    slug: 'hyatt-place-yyc',
    name: 'Hyatt Place Calgary Airport',
    area: 'airport',
    address: '10 Aero Crescent NE, Calgary',
    bestFor: 'An airport overnight with space to unpack',
    rating: 9.2,
    expediaListing: 'Hyatt-Place-Calgary-Airport.h32503873',
    official: 'https://www.hyatt.com/hyatt-place/en-US/yycza-hyatt-place-calgary-airport',
    overview: 'An off-airport choice on Aero Crescent. Hyatt lists an airport shuttle, which makes it worth comparing with Hotel Clique and the two terminal hotels.',
    rooms: 'Look at the king and two-queen layouts and check whether the booked room includes a sofa bed. Confirm total occupancy with the actual party entered.',
    banff: 'Check the timing of the hotel shuttle back to YYC before reserving your mountain departure. If you pick up a rental at the airport, account for the time needed at the rental desk.',
    checks: ['Ask about the shuttle timetable, pickup zone and any reservation requirement.', 'Check breakfast hours against the time you need to leave.'],
    photoAlt: ['Fireplace and seating in the Hyatt Place Calgary Airport lobby', 'Guest room with a bed and sofa at Hyatt Place Calgary Airport'],
  },
  {
    slug: 'delta-downtown',
    name: 'Delta Hotels by Marriott Calgary Downtown',
    area: 'downtown',
    address: '209 4th Avenue SE, Calgary',
    bestFor: 'A named pickup on selected Banff tours',
    rating: 9.4,
    expediaListing: 'Delta-Hotels-By-Marriott-Calgary-Downtown.h21922',
    official: 'https://www.marriott.com/en-us/hotels/yycbv-delta-hotels-calgary-downtown/overview/',
    overview: 'A downtown hotel on 4th Avenue SE. Several GetYourGuide trips list it as a Calgary meeting point. It is a practical choice when your selected tour actually starts here.',
    rooms: 'Compare king and two-queen categories and check whether a higher floor or a specific view is part of the rate. The hotel lists an indoor pool.',
    banff: 'Select Calgary on your tour booking and match the address and departure time. A tour meeting at this Delta is separate from an airport shuttle and from the Delta at YYC.',
    checks: ['Read the tour confirmation for the exact meeting point and where the tour drops you off.', 'Check parking and the pool schedule for your stay.'],
    photoAlt: ['Reception at Delta Hotels Calgary Downtown', 'Guest room with a seating area and a view of downtown Calgary'],
    pickupSource: 'https://www.getyourguide.com/banff-l284/banff-lake-louise-moraine-emerald-lake-johnston-canyon-t789422/',
  },
  {
    slug: 'le-germain',
    name: 'Le Germain Hotel Calgary',
    area: 'downtown',
    address: '899 Centre Street SW, Calgary',
    bestFor: 'A boutique stay near the Calgary Tower',
    rating: 9.6,
    expediaListing: 'Hotel-Le-Germain-Calgary.h3123299',
    official: 'https://www.germainhotels.com/en/le-germain-hotel/calgary',
    overview: 'A boutique hotel opposite the Calgary Tower, close to Stephen Avenue. It suits travellers who want to make time for the city before or after a Rockies trip.',
    rooms: 'Compare the bed layout and the room’s bath or shower configuration. Choose a room with two beds if your party needs them, and check the cancellation terms for the rate.',
    banff: 'Walk or arrange a short ride to your specific downtown pickup. Confirm whether the operator collects from this hotel or names a different meeting point.',
    checks: ['Check what breakfast, parking and any late checkout cost on your rate.', 'Confirm the pickup walk and building entrance before an early departure.'],
    photoAlt: ['Exterior of Le Germain Hotel Calgary', 'King room with a desk at Le Germain Hotel Calgary'],
  },
  {
    slug: 'westley',
    name: 'The Westley Calgary Downtown',
    area: 'downtown',
    address: '630 4th Avenue SW, Calgary',
    bestFor: 'A boutique hotel near the downtown west end',
    rating: 9.6,
    expediaListing: 'The-Westley-Calgary-Downtown.h66541227',
    official: 'https://www.hilton.com/en/hotels/yycdaup-the-westley-calgary-downtown/',
    overview: 'A Hilton Tapestry Collection hotel on the west side of downtown, with its own restaurant. Compare it with Le Germain if you want a boutique stay in a different part of the centre.',
    rooms: 'Hilton lists king, two-queen and suite options. Check the exact bed layout and accessible-room details if either affects your choice.',
    banff: 'Check the walk to your operator’s meeting point. A pickup on 4th Avenue SE and a hotel on 4th Avenue SW are different addresses.',
    checks: ['Price parking and meals separately when comparing city hotels.', 'Check whether a tour returns to its original pickup or another downtown stop.'],
    photoAlt: ['Street entrance of The Westley Calgary Downtown', 'Guest room with seating at The Westley Calgary Downtown'],
  },
  {
    slug: 'residence-inn-beltline',
    name: 'Residence Inn Calgary Downtown/Beltline District',
    area: 'downtown',
    address: '610 10th Avenue SW, Calgary',
    bestFor: 'A kitchen and a longer Calgary stay',
    rating: 9.6,
    expediaListing: 'Residence-Inn-By-Marriott-Calgary-DowntownBeltline-District.h33777124',
    official: 'https://www.marriott.com/en-us/hotels/yycbl-residence-inn-calgary-downtown-beltline-district/overview/',
    overview: 'A Beltline base with in-room kitchens and breakfast listed by Marriott. Consider it for several city nights or when preparing your own meals matters.',
    rooms: 'Compare studios with one-bedroom suites. A studio puts the beds and seating in the same space. Check the actual sofa bed and kitchen equipment on the selected room.',
    banff: 'Plan a walk or ride to a named city pickup. If you are driving, compare the overnight parking charge with a west-side hotel before choosing a base for several mountain days.',
    checks: ['Check bed configuration and whether the room has a separate bedroom.', 'Confirm breakfast hours, parking charges and clearance for your vehicle.'],
    photoAlt: ['Residence Inn Calgary Downtown Beltline entrance', 'Residence Inn guest studio with an in-room kitchen'],
  },
  {
    slug: 'coast-downtown',
    name: 'Coast Calgary Downtown Hotel & Suites by APA',
    area: 'downtown',
    address: '610 4th Avenue SW, Calgary',
    bestFor: 'Downtown suites and an alternate tour pickup',
    rating: 8.8,
    expediaListing: 'Regency-Suites-Hotel.h980939',
    official: 'https://www.coasthotels.com/coast-calgary-downtown-hotel-and-suites-by-apa',
    overview: 'A suite hotel on 4th Avenue SW. It is a useful comparison for longer stays or when a selected operator lists this hotel as its downtown pickup.',
    rooms: 'Compare the studio and separate-bedroom layouts. If you plan to cook, confirm the kitchen equipment and the beds on the suite you are booking.',
    banff: 'The hotel appears as a meeting point on selected listings. Check the operator and exact address. The Westley nearby and Delta Downtown several blocks east have their own entrances.',
    checks: ['Check the number of beds, kitchen equipment and where the sofa bed sits.', 'Confirm parking and any early-morning meeting instructions on your booking.'],
    photoAlt: ['Guest suite with a kitchenette at Coast Calgary Downtown', 'Kitchen counter and oven in a Coast Calgary Downtown suite'],
    oldAnchor: 'calgary-downtown',
    pickupSource: 'https://www.getyourguide.com/banff-l284/banff-banff-town-gondola-and-johnston-canyon-day-tour-t602050/',
  },
  {
    slug: 'four-points-west',
    name: 'Four Points by Sheraton Hotel & Suites Calgary West',
    area: 'west',
    address: '8220 Bowridge Crescent NW, Calgary',
    bestFor: 'A west-side drive with an indoor pool',
    rating: 8.6,
    expediaListing: 'Four-Points-By-Sheraton-Hotel-Suites-Calgary-West.h151916',
    official: 'https://www.marriott.com/en-us/hotels/yycfp-four-points-hotel-and-suites-calgary-west/overview/',
    overview: 'A west Calgary hotel near WinSport. Marriott lists on-site parking and an indoor pool. Compare it with the Sandman nearby if you plan to drive towards Banff.',
    rooms: 'Compare regular hotel rooms with suites. Check the number of actual beds and whether the extra living space suits the people sharing.',
    banff: 'Plan the drive west on Highway 1. If you are joining a tour instead, work out the separate journey to the operator’s Calgary pickup first.',
    checks: ['Confirm pool hours and facilities for the dates you plan to travel.', 'Allow for winter road conditions and check where you will park at your first Rockies stop.'],
    photoAlt: ['Suite living area at Four Points Calgary West', 'Two-bed guest room at Four Points Calgary West'],
    oldAnchor: 'calgary-west',
  },
  {
    slug: 'sandman-west',
    name: 'Sandman Hotel & Suites Calgary West',
    area: 'west',
    address: '125 Bowridge Drive NW, Calgary',
    bestFor: 'A road-trip base near WinSport',
    rating: 9,
    expediaListing: 'Sandman-Hotels-Suites-Calgary-West.h1455506',
    official: 'https://www.sandmanhotels.com/calgary-west',
    overview: 'A Bowridge hotel near WinSport with an indoor pool. It is worth comparing with the Four Points for a stop before driving west or on the way back from the mountains.',
    rooms: 'Compare a two-bed room with the larger suite layouts. Confirm which rooms have a separate seating area and what cooking equipment, if any, comes with the rate.',
    banff: 'The west-side location can suit a rental car and a westbound start. Compare the full drive and parking if you plan to return to Calgary after each park day.',
    checks: ['Check pool hours and any changes to the hotel’s facilities.', 'Compare the final parking, pet and room costs for your actual party.'],
    photoAlt: ['Indoor pool at Sandman Hotel & Suites Calgary West', 'Guest room with a sofa, desk and television at Sandman Calgary West'],
  },
  {
    slug: 'alt-university',
    name: 'Alt Hotel Calgary University District',
    area: 'west',
    address: '482 McLaurin Street NW, Calgary',
    bestFor: 'The university and a walkable neighbourhood',
    rating: 9.6,
    expediaListing: 'Alt-Hotel-Calgary-University-District.h94715059',
    official: 'https://www.germainhotels.com/en/alt-hotel/calgary-university-district',
    overview: 'A University District hotel near neighbourhood restaurants and the University of Calgary. Choose it for plans in northwest Calgary as well as a separate drive to the mountains.',
    rooms: 'The hotel lists rooms with one king, one queen or two queens alongside studio options. Compare the specific layout and equipment before assuming it suits a longer stay.',
    banff: 'Plan the onward drive from the University District. For an organised tour, confirm the operator’s meeting point and arrange the trip there in advance.',
    checks: ['Ask about parking charges, garage clearance and in-and-out access.', 'Confirm the room layout and travel time to your own Calgary or Rockies stops.'],
    photoAlt: ['Exterior of Alt Hotel Calgary University District', 'King guest room at Alt Hotel Calgary University District'],
  },
];

export const calgaryHotels = properties.map(hotel => {
  const expediaUrl = new URL(`https://www.expedia.com/Calgary-Hotels-${hotel.expediaListing}.Hotel-Information`);
  expediaUrl.searchParams.set('camref', '1101l3MtWX');
  const photos = hotel.photoAlt.map((alt, index) => ({
    alt,
    src: `/images/calgary-hotels/${hotel.slug}-${index + 1}.webp`,
  }));
  return {
    ...hotel,
    photos,
    booking: expediaUrl.href,
    path: `${calgaryHotelsPath}${hotel.slug}/`,
    offerId: hotel.oldAnchor || `calgary-${hotel.slug}`,
  };
});

export type CalgaryHotelProfile = typeof calgaryHotels[number];
