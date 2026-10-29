export const rentalPlanningCheckedOn = '2026-10-29';

export const rentalBaseGuides = [
  {
    id: 'banff', name: 'Banff town',
    suits: 'Town evenings, groceries and a ski trip built around a confirmed pickup stop.',
    room: 'Compare managed apartment-style suites with permitted guest accommodation. A title saying “entire home” does not establish the permitted use or the layout you will receive.',
    withoutCar: 'Match the exact address to grocery access and the current ski-shuttle stop. Check the first and last ride for your lesson, equipment collection and return; a town address alone does not provide a transfer.',
    withCar: 'Confirm a space, parkade height and any charge at the property. Include parking and the daily resort journey when comparing the total quote.',
    guide: '/towns/banff/',
  },
  {
    id: 'tunnel-mountain', name: 'Tunnel Mountain',
    suits: 'Condo, loft or chalet layouts with more time spent at the property.',
    room: 'Ask which beds are behind a bedroom door and which are in a loft or living room. Multi-level layouts can mean stairs; a resort condo does not automatically provide a detached cabin.',
    withoutCar: 'Some reviewed operators provide Banff local Roam passes. Check the actual stop, winter service and any separate ski transfer; local passes do not cover every regional journey.',
    withCar: 'Confirm assigned versus shared parking, vehicle clearance and the route from your accommodation building. Allow time to load children and ski gear before leaving the hilltop base.',
    guide: '/towns/banff/',
  },
  {
    id: 'canmore', name: 'Canmore',
    suits: 'A separate town base, including condo-style suites with category-specific kitchens and laundry.',
    room: 'Choose the actual suite category. A hotel room in a condo-style building may have a mini-fridge instead of a full kitchen. Compare bedrooms and bathrooms against sofa-bed use.',
    withoutCar: 'Check the local journey, Roam Route 3 if needed, and the ski provider’s pickup arrangements as separate connections. Confirm the return before relying on them for an early lesson.',
    withCar: 'Budget time for the drive into Banff National Park and your resort parking plan. A lower room quote does not establish a lower total trip cost.',
    guide: '/towns/canmore/',
  },
  {
    id: 'harvie-heights', name: 'Harvie Heights',
    suits: 'An address-specific townhouse or condo search between Canmore and the park’s eastern entrance.',
    room: 'Harvie Heights is a hamlet in the Municipal District of Bighorn, separate from Banff and Canmore. Confirm the precise unit and manager; a “Banff Gate” title does not put you in Banff town.',
    withoutCar: 'Before reserving, arrange the connection from the exact unit to groceries, your activity and the return. Do not assume a Banff hotel shuttle stops at an independently managed rental.',
    withCar: 'Check unit parking, snow clearing, late-arrival instructions and the full road journey. Driving times in provider titles are not a winter itinerary.',
    guide: '/towns/canmore/',
  },
] as const;

export const reviewedRentalOptions = [
  {
    id: 'basecamp-banff', name: 'Basecamp Suites Banff', base: 'banff', kind: 'Apartment-style suites',
    tags: ['separate-bedrooms', 'kitchen'], providerId: '74883714',
    why: 'For a town-based stay with a kitchen and separate-bedroom suite categories at 101, 316 Marten Street.',
    room: 'The official Two Bedroom Suite lists two queen bedrooms, a sofa bed and one bathroom. Ask how the sleeping and dining arrangement works for your actual party.',
    check: 'That category lists elevator access and is not pet-friendly. Elevator access alone does not establish a room meets your mobility needs. Parking is paid and subject to availability; check vehicle height and terms.',
    transport: 'The operator lists a nearby ski-shuttle stop. Confirm the current pickup and return with the transport provider before building a lesson day around it.',
    links: [{ label: 'Official property and address', href: 'https://basecampresorts.com/banffsuites/' }, { label: 'Official two-bedroom category', href: 'https://basecampresorts.com/room-details/banff-suites-two-bedroom/' }],
  },
  {
    id: 'douglas-fir', name: 'Douglas Fir Resort and Chalets', base: 'tunnel-mountain', kind: 'Condos, lofts and A-frame chalets',
    tags: ['separate-bedrooms', 'kitchen', 'loft'], providerId: '904421',
    why: 'For comparing a condo with a loft or A-frame chalet on Tunnel Mountain Drive.',
    room: 'The operator lists studios, condos, lofts and two- or three-bedroom A-frame chalets. Compare the exact category, cooking equipment, fireplace type and stair layout.',
    check: 'Checked 29 October: the official waterpark page advertises a 26–30 October maintenance closure without a year in that notice. Confirm reopening and which facilities will operate. Dog-friendly outside condos require advance phone approval.',
    transport: 'Banff local Roam guest passes are listed. Check the stop and ski transfer separately; this is a hillside base rather than a Banff Avenue address.',
    links: [{ label: 'Official accommodation categories', href: 'https://douglasfir.com/accommodations/' }, { label: 'Waterpark notice', href: 'https://douglasfir.com/amenities/indoor-waterpark/' }, { label: 'Direct dog-room policy', href: 'https://douglasfir.com/about/pet-policy/' }],
  },
  {
    id: 'hidden-ridge', name: 'Hidden Ridge Resort', base: 'tunnel-mountain', kind: 'Condos and multi-level lofts',
    tags: ['separate-bedrooms', 'kitchen', 'loft'], providerId: '3845',
    why: 'For a kitchen-and-fireplace condo at 901 Hidden Ridge Way, with larger loft categories to compare.',
    room: 'The one-bedroom condo has a separate bedroom, sofa bed, bathroom and kitchen. Other official categories span two, three or four levels; ask about the path to the room and the beds.',
    check: 'Parking is first come, first served. Only selected rooms accept pets, with advance confirmation and charges. Do not extend a private-hot-tub category to every condo.',
    transport: 'The official FAQ lists Banff local Roam passes. Verify the current stop and any separate resort journey, especially with luggage or ski gear.',
    links: [{ label: 'Official condo and loft categories', href: 'https://banffhiddenridge.com/rooms/' }, { label: 'One-bedroom layout', href: 'https://banffhiddenridge.com/deluxe-one-bedroom-condo/' }, { label: 'Parking, pets and local bus FAQ', href: 'https://banffhiddenridge.com/faq/' }],
  },
  {
    id: 'blackstone', name: 'Blackstone Mountain Lodge', base: 'canmore', kind: 'Condo-style suite alternative',
    tags: ['separate-bedrooms', 'kitchen', 'laundry'], providerId: null,
    why: 'For a Canmore comparison when in-suite laundry and separate bedrooms matter.',
    room: 'The official Two Bedroom Suite lists a full kitchen, in-suite laundry, two separate bedrooms and two bathrooms. These are suite-category features, not a promise for every room.',
    check: 'The operator says it has no purpose-built accessible rooms or accessible bathing fixtures. Confirm exact access requirements and current outdoor pool conditions directly.',
    transport: 'The hotel FAQ says it does not offer a shuttle. Arrange your own connection and confirm the current ski pickup plan.',
    links: [{ label: 'Official two-bedroom suite', href: 'https://www.blackstonelodge.ca/rooms/two-bedroom-suite' }, { label: 'Official access and transport FAQ', href: 'https://www.blackstonelodge.ca/faq' }, { label: 'Reviewed hotel profile', href: '/hotel-directory/blackstone-mountain-lodge' }],
  },
] as const;

export const rentalPlanningSources = [
  { label: 'Banff: Accessory Guest Accommodation requirements', href: 'https://banff.ca/bedandbreakfast' },
  { label: 'Canmore: accommodation types and permits', href: 'https://www.canmore.ca/your-community/planning/accommodation-types' },
  { label: 'Canmore: short-term rental licensing information', href: 'https://www.canmore.ca/public/download/files/331587' },
  { label: 'Municipal District of Bighorn: Harvie Heights', href: 'https://www.mdbighorn.ca/165/Harvie-Heights' },
  { label: 'Roam: current routes and schedules', href: 'https://roamtransit.com/schedules-routes/' },
  { label: 'Roam: Canmore–Banff Route 3', href: 'https://roamtransit.com/schedules-routes/canmore-banff-regional-route-3/' },
  { label: 'SkiBig3: ski shuttle eligibility and stops', href: 'https://www.skibig3.com/ski/ski-shuttle/' },
] as const;
