const VRBO_CAMREF = '1101l3MtWL';
const VRBO_CREATIVE = '1011l63087';
const VRBO_ADREF = 'PZBJVX1Er0';

export function vrboAffiliateUrl(vrboUrl: string): string {
  return `https://vrbo.com/affiliate?landingPage=${encodeURIComponent(vrboUrl)}&camref=${VRBO_CAMREF}&creativeref=${VRBO_CREATIVE}&adref=${VRBO_ADREF}`;
}

export interface VacationRental {
  slug: string;
  name: string;
  type: 'House' | 'Apartment' | 'Condo' | 'Chalet' | 'Cabin' | 'Lodge';
  area: string;
  sleeps: number;
  bedrooms: number;
  bathrooms: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  image: string;
  vrboUrl: string;
  expediaId: string;
  premierHost: boolean;
  description: string;
  highlights: string[];
  lat?: number;
  lng?: number;
}

// Area center coordinates for rentals
const areaCenters: Record<string, [number, number]> = {
  'Downtown Banff': [51.1784, -115.5708],
  'Tunnel Mountain': [51.1867, -115.5539],
  'Banff Springs': [51.1672, -115.5587],
  'Banff Centre': [51.1759, -115.5622],
  'Harvie Heights': [51.1774, -115.4867],
};

const areaMap: Record<string, string> = {
  'Banff Springs': 'Banff Springs',
  'Banff Centre': 'Downtown Banff',
  'Downtown': 'Downtown Banff',
  'Uptown': 'Downtown Banff',
  'Tunnel Mountain': 'Tunnel Mountain',
  'Harvie Heights': 'Harvie Heights',
  'Banff': 'Downtown Banff',
};

// Map non-standard types to allowed types
const typeMap: Record<string, VacationRental['type']> = {
  'House': 'House',
  'Apartment': 'Apartment',
  'Condo': 'Condo',
  'Chalet': 'Chalet',
  'Cabin': 'Cabin',
  'Lodge': 'Lodge',
  'Aparthotel': 'Condo',
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function fixRating(rating?: number): number {
  if (!rating) return 0;
  if (rating > 10) return Math.min(parseFloat((rating / 100).toFixed(1)), 10.0);
  return rating;
}

function parseBathrooms(raw?: string): string {
  if (!raw) return '1';
  return raw;
}

interface RawProperty {
  name: string;
  area?: string;
  type?: string;
  sleeps?: number;
  bedrooms?: number;
  bathrooms?: string;
  rating?: number;
  reviews?: number;
  price: number;
  expediaId: string;
  vrboUrl: string;
  image: string;
  premierHost?: boolean;
}

function generateDescription(name: string, type: string, area: string, sleeps: number, bedrooms: number, bathrooms: string): string {
  const typeWord = type.toLowerCase();
  const areaDesc: Record<string, string> = {
    'Downtown Banff': 'in the heart of Downtown Banff',
    'Tunnel Mountain': 'on scenic Tunnel Mountain',
    'Banff Springs': 'in the prestigious Banff Springs area',
    'Harvie Heights': 'in Harvie Heights, just minutes from Banff\'s east gate',
  };
  const loc = areaDesc[area] || 'near Banff National Park';

  const sleepText = sleeps <= 2 ? 'for couples or solo travellers' :
    sleeps <= 4 ? 'for small families or groups' :
    sleeps <= 6 ? 'for families and groups' :
    'for larger groups and families';

  const bedroomText = bedrooms > 0 ? `${bedrooms}-bedroom` : 'studio';
  const bathInt = parseInt(bathrooms) || 1;
  const bathText = bathInt > 1 ? ` with ${bathrooms} bathrooms` : '';

  return `Charming ${bedroomText} ${typeWord} ${loc}${bathText}, sleeping up to ${sleeps} guests. Ideal ${sleepText} seeking a comfortable Rocky Mountain getaway.`;
}

function generateHighlights(name: string, type: string, area: string, sleeps: number, bedrooms: number, premierHost: boolean): string[] {
  const highlights: string[] = [];
  const nameLower = name.toLowerCase();

  if (nameLower.includes('hot tub') || nameLower.includes('hot pools') || nameLower.includes('jacuzzi') || nameLower.includes('grotto')) {
    highlights.push('Hot tub or pool access');
  }
  if (nameLower.includes('mountain view') || nameLower.includes('mtn view') || nameLower.includes('mountain views')) {
    highlights.push('Mountain views');
  }
  if (nameLower.includes('bbq') || nameLower.includes('barbeque')) {
    highlights.push('BBQ facilities');
  }
  if (nameLower.includes('fireplace')) {
    highlights.push('Cozy fireplace');
  }
  if (nameLower.includes('balcony')) {
    highlights.push('Private balcony');
  }
  if (nameLower.includes('pet') || nameLower.includes('dog')) {
    highlights.push('Pet-friendly');
  }
  if (nameLower.includes('walking distance') || nameLower.includes('downtown') || nameLower.includes('heart of') || nameLower.includes('steps to') || nameLower.includes('central')) {
    highlights.push('Walking distance to shops & dining');
  }
  if (nameLower.includes('private') || nameLower.includes('entire')) {
    highlights.push('Private entrance');
  }

  // Area-based highlights
  if (area === 'Harvie Heights') {
    highlights.push('Minutes from Banff National Park gate');
  } else if (area === 'Downtown Banff') {
    if (!highlights.includes('Walking distance to shops & dining')) {
      highlights.push('Walking distance to shops & dining');
    }
  } else if (area === 'Tunnel Mountain') {
    highlights.push('Close to hiking trails');
  } else if (area === 'Banff Springs') {
    highlights.push('Near Bow Falls & Banff Springs');
  }

  // Generic fill
  if (sleeps >= 6 && !highlights.some(h => h.includes('group'))) {
    highlights.push(`Sleeps up to ${sleeps} guests`);
  }
  if (bedrooms >= 2 && !highlights.some(h => h.includes('bedroom'))) {
    highlights.push(`${bedrooms} spacious bedrooms`);
  }
  if (premierHost) {
    highlights.push('Vrbo Premier Host');
  }
  if (type === 'House' || type === 'Chalet' || type === 'Cabin') {
    highlights.push('Full kitchen & home comforts');
  } else if (type === 'Condo' || type === 'Apartment') {
    highlights.push('Modern amenities');
  }

  // Ensure at least 3, max 4
  const defaults = ['Free WiFi', 'Self check-in', 'Fully equipped kitchen', 'Washer & dryer'];
  let i = 0;
  while (highlights.length < 3 && i < defaults.length) {
    if (!highlights.includes(defaults[i])) highlights.push(defaults[i]);
    i++;
  }

  return highlights.slice(0, 4);
}

// Deterministic pseudo-random offset based on string
function seededOffset(seed: string, idx: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i) + idx;
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * 0.01 - 0.005; // ±0.005 degrees (~500m)
}

const rawData: RawProperty[] = [
  { name: "Banff Gate- Private Entrance 2-Level Townhouse", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 9.2, reviews: 46, price: 139, expediaId: "79144952", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2844924vb", image: "https://media.vrbo.com/lodging/80000000/79150000/79145000/79144952/5f78a6db.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff's Finest Guest Studio Glacier Studios", premierHost: true, area: "Banff Springs", type: "Apartment", sleeps: 2, bathrooms: "1", rating: 1010, reviews: 212, price: 383, expediaId: "31338995", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p257571vb", image: "https://media.vrbo.com/lodging/32000000/31340000/31339000/31338995/41d64449.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "2 Bedroom Chalet between Canmore & Banff", premierHost: true, area: "Harvie Heights", type: "Chalet", sleeps: 7, bedrooms: 2, bathrooms: "2", rating: 1010, reviews: 54, price: 203, expediaId: "66037689", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9555540", image: "https://media.vrbo.com/lodging/67000000/66040000/66037700/66037689/a85aac2d.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Spacious Condo Getaway to the Rockies", area: "Harvie Heights", type: "Lodge", sleeps: 8, bedrooms: 2, bathrooms: "1", rating: 9, reviews: 47, price: 179, expediaId: "67592255", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2313677vb", image: "https://media.vrbo.com/lodging/68000000/67600000/67592300/67592255/8242bf35.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "The Ugly Bunny Guest House — King Bed", area: "Banff Centre", type: "Apartment", sleeps: 4, bedrooms: 1, bathrooms: "1", rating: 1010, reviews: 50, price: 219, expediaId: "70759390", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9604204", image: "https://media.vrbo.com/lodging/71000000/70760000/70759400/70759390/444409e0.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Central Banff Rockies Suite with Rooftop Hot Pools", area: "Downtown", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", price: 1143, expediaId: "124851117", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5041451vb", image: "https://media.vrbo.com/lodging/125000000/124860000/124851200/124851117/23df5411.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Douglas Fir Resort and Chalets", area: "Tunnel Mountain", type: "Condo", sleeps: 6, rating: 8, reviews: 3991, price: 130, expediaId: "904421", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p904421", image: "https://media.vrbo.com/lodging/1000000/910000/904500/904421/234b6465.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "2 Bedroom Mountain View Suite at Banff Gate", premierHost: true, area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 9.6, reviews: 41, price: 188, expediaId: "67204344", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9567286", image: "https://media.vrbo.com/lodging/68000000/67210000/67204400/67204344/53ab0e4f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Rustic Value Banff Condo with Fireplace", area: "Banff", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", rating: 8.4, reviews: 89, price: 347, expediaId: "29611198", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414872vb", image: "https://media.vrbo.com/lodging/30000000/29620000/29611200/29611198/b096c033.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "The Cedar — Downtown, Walking Distance to Shops", premierHost: true, area: "Banff Centre", type: "Apartment", sleeps: 4, bedrooms: 2, bathrooms: "2", rating: 1010, reviews: 36, price: 485, expediaId: "94781037", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9831345", image: "https://media.vrbo.com/lodging/95000000/94790000/94781100/94781037/016975aa.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Huckleberry Lodge Mountain Getaway Near Banff", area: "Harvie Heights", type: "Cabin", sleeps: 4, bedrooms: 1, bathrooms: "1", rating: 9.4, reviews: 3, price: 131, expediaId: "119220663", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p4724148vb", image: "https://media.vrbo.com/lodging/120000000/119230000/119220700/119220663/cb020d00.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Hidden Ridge Resort", area: "Tunnel Mountain", type: "Condo", sleeps: 8, rating: 8.6, reviews: 4902, price: 222, expediaId: "3845", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3845", image: "https://media.vrbo.com/lodging/1000000/10000/3900/3845/f856ea7c.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Mountain Retreat Townhouse — 2 Mins to Banff Gate", premierHost: true, area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 1010, reviews: 54, price: 235, expediaId: "66541452", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9561962", image: "https://media.vrbo.com/lodging/67000000/66550000/66541500/66541452/40dc2f32.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff Gateway Townhouse with Hot Tub and BBQ", premierHost: true, area: "Harvie Heights", type: "Condo", sleeps: 8, bedrooms: 2, bathrooms: "2+", rating: 9.8, reviews: 9, price: 139, expediaId: "114744952", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p20134601", image: "https://media.vrbo.com/lodging/115000000/114750000/114745000/114744952/w2570h1290x113y0-d307a7cf.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Loft Suite Along Banff Ave with Mountain View", premierHost: true, area: "Uptown", type: "Apartment", sleeps: 4, bathrooms: "1", rating: 9.2, reviews: 35, price: 315, expediaId: "66046512", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2246295vb", image: "https://media.vrbo.com/lodging/67000000/66050000/66046600/66046512/d26337f8.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Private Access Townhouse One Gate to Banff", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 9.8, reviews: 19, price: 142, expediaId: "69330989", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9587201", image: "https://media.vrbo.com/lodging/70000000/69340000/69331000/69330989/ced7a45f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Stunning Mountain View Townhouse, Sleeps 6", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2+", rating: 9.8, reviews: 8, price: 175, expediaId: "112562578", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p20105192", image: "https://media.vrbo.com/lodging/113000000/112570000/112562600/112562578/fb3e19e1.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Two Storey Cozy Chalet with Mountain Views near Banff Gate", premierHost: true, area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 9.4, reviews: 75, price: 234, expediaId: "61582172", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9528535", image: "https://media.vrbo.com/lodging/62000000/61590000/61582200/61582172/4427e392.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Mountain View Cozy 2-Storey Chalet with Hot Tub and BBQ", premierHost: true, area: "Harvie Heights", type: "Condo", sleeps: 8, bedrooms: 2, bathrooms: "1+", rating: 9.4, reviews: 72, price: 132, expediaId: "22796239", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1270443vb", image: "https://media.vrbo.com/lodging/23000000/22800000/22796300/22796239/49d4b4f4.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff Gate Rockies Mountain View with BBQ and Hot Tub", premierHost: true, area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2+", rating: 1010, reviews: 5, price: 165, expediaId: "111686994", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p20089889", image: "https://media.vrbo.com/lodging/112000000/111690000/111687000/111686994/04b5a66f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Basecamp Suites Banff", area: "Downtown", type: "Condo", sleeps: 10, rating: 9.2, reviews: 424, price: 364, expediaId: "74883714", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p74883714", image: "https://media.vrbo.com/lodging/75000000/74890000/74883800/74883714/705e1791.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Wolf Den B&B Suite A — 2 Bedroom Private Suite", premierHost: true, area: "Banff", type: "Apartment", sleeps: 4, bedrooms: 2, bathrooms: "1+", rating: 1010, reviews: 28, price: 388, expediaId: "58015116", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9497616", image: "https://media.vrbo.com/lodging/59000000/58020000/58015200/58015116/306c26bd.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Bear Themed Townhome — 2BR 2Bath Cozy and Rustic", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 8.6, reviews: 15, price: 232, expediaId: "72855806", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9627896", image: "https://media.vrbo.com/lodging/73000000/72860000/72855900/72855806/ec19d95c.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Pet Friendly 2BR with Mountain Views and Hot Tub", premierHost: true, area: "Harvie Heights", type: "Condo", sleeps: 4, bedrooms: 2, bathrooms: "1+", rating: 9, reviews: 28, price: 232, expediaId: "66499100", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2268720vb", image: "https://media.vrbo.com/lodging/67000000/66500000/66499100/66499100/481db032.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Bright and Open Loft King Suite with Mountain Views", premierHost: true, area: "Uptown", type: "Apartment", sleeps: 2, bathrooms: "1", rating: 9.4, reviews: 20, price: 425, expediaId: "66144884", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2248956vb", image: "https://media.vrbo.com/lodging/67000000/66150000/66144900/66144884/97816612.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "A Peaceful Mountain Retreat in Banff's Most Elegant Homes", premierHost: true, area: "Banff Springs", rating: 1010, reviews: 17, price: 550, expediaId: "91870309", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3294230vb", image: "https://media.vrbo.com/lodging/92000000/91880000/91870400/91870309/ad42a0f8.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Entire Townhouse with Hot Tub — 3 Min to Banff", area: "Harvie Heights", type: "House", sleeps: 8, bedrooms: 2, bathrooms: "1", rating: 9.6, reviews: 28, price: 346, expediaId: "64659339", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9548292", image: "https://media.vrbo.com/lodging/65000000/64660000/64659400/64659339/ce746f17.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Welcome to Banff — 2 Bedroom Townhouse", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 8.4, reviews: 64, price: 183, expediaId: "66802893", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9563597", image: "https://media.vrbo.com/lodging/67000000/66810000/66802900/66802893/cd2ec091.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Mountain View King Studio at Banff National Park Gate", premierHost: true, area: "Harvie Heights", type: "Apartment", sleeps: 2, bedrooms: 1, bathrooms: "1", rating: 9.6, reviews: 7, price: 200, expediaId: "107441697", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p4129918vb", image: "https://media.vrbo.com/lodging/108000000/107450000/107441700/107441697/w1914h1276x3y2-b96b411f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff 2 Bedroom House with Private Hot Tub", area: "Uptown", type: "House", sleeps: 5, bedrooms: 2, bathrooms: "2", rating: 1010, reviews: 106, price: 740, expediaId: "33501942", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p826836vb", image: "https://media.vrbo.com/lodging/34000000/33510000/33502000/33501942/c62639de.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Spacious Private Suite in the Heart of Banff", area: "Downtown", type: "Apartment", sleeps: 2, bedrooms: 1, bathrooms: "1", rating: 1010, reviews: 8, price: 310, expediaId: "57714205", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2053965vb", image: "https://media.vrbo.com/lodging/58000000/57720000/57714300/57714205/f7939870.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Renovated Condo at the Base of Tunnel Mountain", area: "Banff", type: "Condo", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 8.6, reviews: 190, price: 509, expediaId: "72274714", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2523875vb", image: "https://media.vrbo.com/lodging/73000000/72280000/72274800/72274714/9386910e.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Gateway Suites: Cozy Getaway Near Banff and Canmore", area: "Harvie Heights", type: "Condo", sleeps: 4, bathrooms: "1", rating: 1010, reviews: 1, price: 187, expediaId: "124468443", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5024820vb", image: "https://media.vrbo.com/lodging/125000000/124470000/124468500/124468443/5fed2fa0.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Rockies Escape with Grotto Hot Pools Access", area: "Uptown", type: "Condo", sleeps: 3, bedrooms: 1, bathrooms: "1", rating: 9.6, reviews: 42, price: 512, expediaId: "29625756", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414883vb", image: "https://media.vrbo.com/lodging/30000000/29630000/29625800/29625756/730d04e6.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Family Fun Private Townhome near Banff Gate", premierHost: true, area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 9.6, reviews: 20, price: 172, expediaId: "69939516", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9595565", image: "https://media.vrbo.com/lodging/70000000/69940000/69939600/69939516/7e35dab9.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Spacious Private King Suite Steps to Downtown Banff", premierHost: true, area: "Banff Centre", type: "Apartment", sleeps: 4, bedrooms: 1, bathrooms: "1", rating: 1010, reviews: 25, price: 590, expediaId: "89790887", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9765728", image: "https://media.vrbo.com/lodging/90000000/89800000/89790900/89790887/1c89bf91.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Lodge at Banff Getaway", area: "Harvie Heights", type: "House", sleeps: 7, bedrooms: 2, bathrooms: "2", rating: 8.8, reviews: 13, price: 270, expediaId: "100426062", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9895316", image: "https://media.vrbo.com/lodging/101000000/100430000/100426100/100426062/w920h683x59y0-a0e58f0d.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Gateway Suites: Near Canmore and Banff", area: "Harvie Heights", type: "Condo", sleeps: 4, bathrooms: "1", price: 217, expediaId: "125090444", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5050670vb", image: "https://media.vrbo.com/lodging/126000000/125100000/125090500/125090444/53fbb184.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "NewReno Mountain View King Bed Jacuzzi Chalet", area: "Harvie Heights", type: "House", sleeps: 9, bedrooms: 2, bathrooms: "2", rating: 9.6, reviews: 12, price: 218, expediaId: "89666670", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9762591", image: "https://media.vrbo.com/lodging/90000000/89670000/89666700/89666670/29b01879.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Condo with Hot Pools Access", area: "Tunnel Mountain", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", rating: 8.8, reviews: 57, price: 489, expediaId: "29634054", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414885vb", image: "https://media.vrbo.com/lodging/30000000/29640000/29634100/29634054/w1024h692x0y31-20d72a82.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Steam Room and Pools — Chalet-Inspired Room in Banff", area: "Downtown", type: "Condo", sleeps: 2, bedrooms: 1, bathrooms: "1", rating: 9.4, reviews: 9, price: 263, expediaId: "87625185", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3026255vb", image: "https://media.vrbo.com/lodging/88000000/87630000/87625200/87625185/f25e911c.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff Gate Vacation Townhouse", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 6, reviews: 1, price: 208, expediaId: "74424647", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9646009", image: "https://media.vrbo.com/lodging/75000000/74430000/74424700/74424647/589275d5.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Studio with Mountain Views — Sleeps 4 Near Banff", area: "Harvie Heights", type: "Condo", sleeps: 4, bathrooms: "1", rating: 1010, reviews: 1, price: 178, expediaId: "120780143", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p4858050vb", image: "https://media.vrbo.com/lodging/121000000/120790000/120780200/120780143/67058aba.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Deluxe Rockies Suite — Grotto Hot Pools Access", area: "Uptown", type: "Condo", sleeps: 3, bedrooms: 1, bathrooms: "1", rating: 9.2, reviews: 31, price: 553, expediaId: "29611627", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414877vb", image: "https://media.vrbo.com/lodging/30000000/29620000/29611700/29611627/9f7c6177.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Rustic and Cozy Banff Getaway with Hot Tub Access", area: "Banff", type: "Condo", sleeps: 6, bedrooms: 2, bathrooms: "2", rating: 8, reviews: 38, price: 466, expediaId: "87625124", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3026245vb", image: "https://media.vrbo.com/lodging/88000000/87630000/87625200/87625124/d7914ec2.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Relaxing Mountain Getaway — Superior Room", area: "Uptown", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", rating: 1010, reviews: 1, price: 278, expediaId: "92066087", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3309254vb", image: "https://media.vrbo.com/lodging/93000000/92070000/92066100/92066087/5f7d7b37.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "OUT OF BOUNDS — 2 Bed Condo near Banff Park Gate", premierHost: true, area: "Harvie Heights", type: "Apartment", sleeps: 6, bedrooms: 2, bathrooms: "1", rating: 9.6, reviews: 47, price: 276, expediaId: "59641063", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2097439vb", image: "https://media.vrbo.com/lodging/60000000/59650000/59641100/59641063/86f27211.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Gateway Suites: Pet-Friendly Getaway near Banff", area: "Harvie Heights", type: "Condo", sleeps: 2, bathrooms: "1", price: 154, expediaId: "124498116", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5026412vb", image: "https://media.vrbo.com/lodging/125000000/124500000/124498200/124498116/f9ce1c3a.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Beautiful Chalet with Unbeatable Location in Banff", premierHost: true, area: "Downtown", type: "House", sleeps: 8, bedrooms: 4, bathrooms: "4", rating: 1010, reviews: 44, price: 1760, expediaId: "59675580", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9508125", image: "https://media.vrbo.com/lodging/60000000/59680000/59675600/59675580/7a50b875.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Mountain Chalet with Loft and Hot Pools Access", area: "Tunnel Mountain", type: "Condo", sleeps: 6, bedrooms: 1, bathrooms: "1+", rating: 9.2, reviews: 145, price: 610, expediaId: "29632400", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414889vb", image: "https://media.vrbo.com/lodging/30000000/29640000/29632400/29632400/dfe13039.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
];

// Build typed rentals array
const areaCounters: Record<string, number> = {};

export const rentals: VacationRental[] = rawData.map((raw, i) => {
  const mappedArea = areaMap[raw.area || 'Banff'] || 'Downtown Banff';
  const mappedType = typeMap[raw.type || 'House'] || 'House';
  const rating = fixRating(raw.rating);
  const bedrooms = raw.bedrooms || 0;
  const bathrooms = parseBathrooms(raw.bathrooms);
  const premierHost = raw.premierHost || false;
  const slug = slugify(raw.name);

  // Generate coordinates
  const center = areaCenters[mappedArea] || areaCenters['Downtown Banff'];
  const idx = areaCounters[mappedArea] || 0;
  areaCounters[mappedArea] = idx + 1;
  const latOff = seededOffset(raw.expediaId, 1);
  const lngOff = seededOffset(raw.expediaId, 2);
  const angle = idx * 0.8;
  const radius = 0.002 + idx * 0.0008;
  const lat = center[0] + radius * Math.cos(angle) + latOff;
  const lng = center[1] + radius * Math.sin(angle) + lngOff;

  return {
    slug,
    name: raw.name,
    type: mappedType,
    area: mappedArea,
    sleeps: raw.sleeps || 2,
    bedrooms,
    bathrooms,
    rating,
    reviewCount: raw.reviews || 0,
    priceFrom: raw.price,
    image: raw.image,
    vrboUrl: raw.vrboUrl,
    expediaId: raw.expediaId,
    premierHost,
    description: generateDescription(raw.name, mappedType, mappedArea, raw.sleeps || 2, bedrooms, bathrooms),
    highlights: generateHighlights(raw.name, mappedType, mappedArea, raw.sleeps || 2, bedrooms, premierHost),
    lat: parseFloat(lat.toFixed(5)),
    lng: parseFloat(lng.toFixed(5)),
  };
});

export const rentalAreas = [
  { name: 'Downtown Banff', description: 'Walk to restaurants, shops, and nightlife — the heart of Banff Avenue.' },
  { name: 'Tunnel Mountain', description: 'Forested retreat just 5 minutes from downtown with trail access.' },
  { name: 'Banff Springs', description: 'Prestigious area near the Fairmont with riverside trails and views.' },
  { name: 'Harvie Heights', description: 'Just outside the east gate — great value with mountain views and privacy.' },
];
