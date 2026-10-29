const VRBO_CAMREF = '1101l3MtWL';
const VRBO_CREATIVE = '1011l63087';
const VRBO_ADREF = 'PZBJVX1Er0';

export function vrboAffiliateUrl(vrboUrl: string): string {
  const target = new URL(vrboUrl);
  if (target.protocol !== 'https:' || !['vrbo.com', 'www.vrbo.com'].includes(target.hostname)) throw new Error('Expected a public Vrbo property URL');
  return `https://vrbo.com/affiliate?landingPage=${encodeURIComponent(vrboUrl)}&camref=${VRBO_CAMREF}&creativeref=${VRBO_CREATIVE}&adref=${VRBO_ADREF}`;
}

export type RentalBase = 'banff' | 'tunnel-mountain' | 'harvie-heights' | 'unknown';
export interface VacationRental {
  slug: string;
  name: string;
  type: string | null;
  area: string | null;
  base: RentalBase;
  importedSleeps: number | null;
  importedBedrooms: number | null;
  importedBathrooms: string | null;
  image: string;
  vrboUrl: string;
  expediaId: string;
  verificationStatus: 'historical-provider-import';
  providerDetailsCheckedOn: null;
  coordinateStatus: 'unavailable';
  lat: null;
  lng: null;
}

export const rentalImportProvenance = {
  provider: 'Vrbo',
  capturedAt: null,
  reviewedOn: '2026-10-29',
  sourceUrl: 'https://www.vrbo.com/en-ca/search?typeaheadCollationId=47a754f8-293b-412b-b999-dda568c6380c&latLong=51.17816%2C-115.56467&mapBounds=51.11494%2C-115.67162&mapBounds=51.2413%2C-115.45772&adults=2&sort=RECOMMENDED',
  note: 'Preserved provider search import with no reliable capture date. Listing labels were normalized in the original curation. Labels, provider photos, area fields and room counts are historical leads, not independently verified current room, availability or licensing information.',
};

interface RawProperty {
  name: string;
  area?: string;
  type?: string;
  sleeps?: number;
  bedrooms?: number;
  bathrooms?: string;
  expediaId: string;
  vrboUrl: string;
  image: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// Group only the imported area label; this is not a verified property address.
function importedBase(area?: string): RentalBase {
  if (area === 'Harvie Heights') return 'harvie-heights';
  if (area === 'Tunnel Mountain') return 'tunnel-mountain';
  if (['Banff Springs', 'Banff Centre', 'Downtown', 'Uptown', 'Banff'].includes(area || '')) return 'banff';
  return 'unknown';
}

// Price/review/host-status fields were removed because the undated scrape cannot
// support current claims. Missing room data stays null; names infer no amenities.
const rawData: RawProperty[] = [
  { name: "Banff Gate- Private Entrance 2-Level Townhouse", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "79144952", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2844924vb", image: "https://media.vrbo.com/lodging/80000000/79150000/79145000/79144952/5f78a6db.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff's Finest Guest Studio Glacier Studios", area: "Banff Springs", type: "Apartment", sleeps: 2, bathrooms: "1", expediaId: "31338995", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p257571vb", image: "https://media.vrbo.com/lodging/32000000/31340000/31339000/31338995/41d64449.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "2 Bedroom Chalet between Canmore & Banff", area: "Harvie Heights", type: "Chalet", sleeps: 7, bedrooms: 2, bathrooms: "2", expediaId: "66037689", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9555540", image: "https://media.vrbo.com/lodging/67000000/66040000/66037700/66037689/a85aac2d.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Spacious Condo Getaway to the Rockies", area: "Harvie Heights", type: "Lodge", sleeps: 8, bedrooms: 2, bathrooms: "1", expediaId: "67592255", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2313677vb", image: "https://media.vrbo.com/lodging/68000000/67600000/67592300/67592255/8242bf35.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "The Ugly Bunny Guest House — King Bed", area: "Banff Centre", type: "Apartment", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "70759390", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9604204", image: "https://media.vrbo.com/lodging/71000000/70760000/70759400/70759390/444409e0.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Central Banff Rockies Suite with Rooftop Hot Pools", area: "Downtown", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "124851117", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5041451vb", image: "https://media.vrbo.com/lodging/125000000/124860000/124851200/124851117/23df5411.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Douglas Fir Resort and Chalets", area: "Tunnel Mountain", type: "Condo", sleeps: 6, expediaId: "904421", vrboUrl: "https://www.vrbo.com/en-ca/pdp/lo/904421", image: "https://media.vrbo.com/lodging/1000000/910000/904500/904421/234b6465.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "2 Bedroom Mountain View Suite at Banff Gate", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "67204344", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9567286", image: "https://media.vrbo.com/lodging/68000000/67210000/67204400/67204344/53ab0e4f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Rustic Value Banff Condo with Fireplace", area: "Banff", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "29611198", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414872vb", image: "https://media.vrbo.com/lodging/30000000/29620000/29611200/29611198/b096c033.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "The Cedar — Downtown, Walking Distance to Shops", area: "Banff Centre", type: "Apartment", sleeps: 4, bedrooms: 2, bathrooms: "2", expediaId: "94781037", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9831345", image: "https://media.vrbo.com/lodging/95000000/94790000/94781100/94781037/016975aa.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Huckleberry Lodge Mountain Getaway Near Banff", area: "Harvie Heights", type: "Cabin", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "119220663", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p4724148vb", image: "https://media.vrbo.com/lodging/120000000/119230000/119220700/119220663/cb020d00.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Hidden Ridge Resort", area: "Tunnel Mountain", type: "Condo", sleeps: 8, expediaId: "3845", vrboUrl: "https://www.vrbo.com/en-ca/pdp/lo/3845", image: "https://media.vrbo.com/lodging/1000000/10000/3900/3845/f856ea7c.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Mountain Retreat Townhouse — 2 Mins to Banff Gate", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "66541452", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9561962", image: "https://media.vrbo.com/lodging/67000000/66550000/66541500/66541452/40dc2f32.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff Gateway Townhouse with Hot Tub and BBQ", area: "Harvie Heights", type: "Condo", sleeps: 8, bedrooms: 2, bathrooms: "2+", expediaId: "114744952", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p20134601", image: "https://media.vrbo.com/lodging/115000000/114750000/114745000/114744952/w2570h1290x113y0-d307a7cf.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Loft Suite Along Banff Ave with Mountain View", area: "Uptown", type: "Apartment", sleeps: 4, bathrooms: "1", expediaId: "66046512", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2246295vb", image: "https://media.vrbo.com/lodging/67000000/66050000/66046600/66046512/d26337f8.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Private Access Townhouse One Gate to Banff", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "69330989", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9587201", image: "https://media.vrbo.com/lodging/70000000/69340000/69331000/69330989/ced7a45f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Stunning Mountain View Townhouse, Sleeps 6", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2+", expediaId: "112562578", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p20105192", image: "https://media.vrbo.com/lodging/113000000/112570000/112562600/112562578/fb3e19e1.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Two Storey Cozy Chalet with Mountain Views near Banff Gate", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "61582172", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9528535", image: "https://media.vrbo.com/lodging/62000000/61590000/61582200/61582172/4427e392.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Mountain View Cozy 2-Storey Chalet with Hot Tub and BBQ", area: "Harvie Heights", type: "Condo", sleeps: 8, bedrooms: 2, bathrooms: "1+", expediaId: "22796239", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1270443vb", image: "https://media.vrbo.com/lodging/23000000/22800000/22796300/22796239/49d4b4f4.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff Gate Rockies Mountain View with BBQ and Hot Tub", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2+", expediaId: "111686994", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p20089889", image: "https://media.vrbo.com/lodging/112000000/111690000/111687000/111686994/04b5a66f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Basecamp Suites Banff", area: "Downtown", type: "Condo", sleeps: 10, expediaId: "74883714", vrboUrl: "https://www.vrbo.com/en-ca/pdp/lo/74883714", image: "https://media.vrbo.com/lodging/75000000/74890000/74883800/74883714/705e1791.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Wolf Den B&B Suite A — 2 Bedroom Private Suite", area: "Banff", type: "Apartment", sleeps: 4, bedrooms: 2, bathrooms: "1+", expediaId: "58015116", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9497616", image: "https://media.vrbo.com/lodging/59000000/58020000/58015200/58015116/306c26bd.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Bear Themed Townhome — 2BR 2Bath Cozy and Rustic", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "72855806", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9627896", image: "https://media.vrbo.com/lodging/73000000/72860000/72855900/72855806/ec19d95c.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Pet Friendly 2BR with Mountain Views and Hot Tub", area: "Harvie Heights", type: "Condo", sleeps: 4, bedrooms: 2, bathrooms: "1+", expediaId: "66499100", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2268720vb", image: "https://media.vrbo.com/lodging/67000000/66500000/66499100/66499100/481db032.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Bright and Open Loft King Suite with Mountain Views", area: "Uptown", type: "Apartment", sleeps: 2, bathrooms: "1", expediaId: "66144884", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2248956vb", image: "https://media.vrbo.com/lodging/67000000/66150000/66144900/66144884/97816612.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "A Peaceful Mountain Retreat in Banff's Most Elegant Homes", area: "Banff Springs", expediaId: "91870309", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3294230vb", image: "https://media.vrbo.com/lodging/92000000/91880000/91870400/91870309/ad42a0f8.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Entire Townhouse with Hot Tub — 3 Min to Banff", area: "Harvie Heights", type: "House", sleeps: 8, bedrooms: 2, bathrooms: "1", expediaId: "64659339", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9548292", image: "https://media.vrbo.com/lodging/65000000/64660000/64659400/64659339/ce746f17.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Welcome to Banff — 2 Bedroom Townhouse", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "66802893", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9563597", image: "https://media.vrbo.com/lodging/67000000/66810000/66802900/66802893/cd2ec091.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Mountain View King Studio at Banff National Park Gate", area: "Harvie Heights", type: "Apartment", sleeps: 2, bedrooms: 1, bathrooms: "1", expediaId: "107441697", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p4129918vb", image: "https://media.vrbo.com/lodging/108000000/107450000/107441700/107441697/w1914h1276x3y2-b96b411f.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff 2 Bedroom House with Private Hot Tub", area: "Uptown", type: "House", sleeps: 5, bedrooms: 2, bathrooms: "2", expediaId: "33501942", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p826836vb", image: "https://media.vrbo.com/lodging/34000000/33510000/33502000/33501942/c62639de.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Spacious Private Suite in the Heart of Banff", area: "Downtown", type: "Apartment", sleeps: 2, bedrooms: 1, bathrooms: "1", expediaId: "57714205", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2053965vb", image: "https://media.vrbo.com/lodging/58000000/57720000/57714300/57714205/f7939870.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Renovated Condo at the Base of Tunnel Mountain", area: "Banff", type: "Condo", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "72274714", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2523875vb", image: "https://media.vrbo.com/lodging/73000000/72280000/72274800/72274714/9386910e.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Gateway Suites: Cozy Getaway Near Banff and Canmore", area: "Harvie Heights", type: "Condo", sleeps: 4, bathrooms: "1", expediaId: "124468443", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5024820vb", image: "https://media.vrbo.com/lodging/125000000/124470000/124468500/124468443/5fed2fa0.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Rockies Escape with Grotto Hot Pools Access", area: "Uptown", type: "Condo", sleeps: 3, bedrooms: 1, bathrooms: "1", expediaId: "29625756", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414883vb", image: "https://media.vrbo.com/lodging/30000000/29630000/29625800/29625756/730d04e6.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Family Fun Private Townhome near Banff Gate", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "69939516", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9595565", image: "https://media.vrbo.com/lodging/70000000/69940000/69939600/69939516/7e35dab9.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Spacious Private King Suite Steps to Downtown Banff", area: "Banff Centre", type: "Apartment", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "89790887", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9765728", image: "https://media.vrbo.com/lodging/90000000/89800000/89790900/89790887/1c89bf91.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Lodge at Banff Getaway", area: "Harvie Heights", type: "House", sleeps: 7, bedrooms: 2, bathrooms: "2", expediaId: "100426062", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9895316", image: "https://media.vrbo.com/lodging/101000000/100430000/100426100/100426062/w920h683x59y0-a0e58f0d.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Gateway Suites: Near Canmore and Banff", area: "Harvie Heights", type: "Condo", sleeps: 4, bathrooms: "1", expediaId: "125090444", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5050670vb", image: "https://media.vrbo.com/lodging/126000000/125100000/125090500/125090444/53fbb184.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "NewReno Mountain View King Bed Jacuzzi Chalet", area: "Harvie Heights", type: "House", sleeps: 9, bedrooms: 2, bathrooms: "2", expediaId: "89666670", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9762591", image: "https://media.vrbo.com/lodging/90000000/89670000/89666700/89666670/29b01879.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Condo with Hot Pools Access", area: "Tunnel Mountain", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "29634054", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414885vb", image: "https://media.vrbo.com/lodging/30000000/29640000/29634100/29634054/w1024h692x0y31-20d72a82.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Steam Room and Pools — Chalet-Inspired Room in Banff", area: "Downtown", type: "Condo", sleeps: 2, bedrooms: 1, bathrooms: "1", expediaId: "87625185", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3026255vb", image: "https://media.vrbo.com/lodging/88000000/87630000/87625200/87625185/f25e911c.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Banff Gate Vacation Townhouse", area: "Harvie Heights", type: "House", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "74424647", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9646009", image: "https://media.vrbo.com/lodging/75000000/74430000/74424700/74424647/589275d5.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Studio with Mountain Views — Sleeps 4 Near Banff", area: "Harvie Heights", type: "Condo", sleeps: 4, bathrooms: "1", expediaId: "120780143", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p4858050vb", image: "https://media.vrbo.com/lodging/121000000/120790000/120780200/120780143/67058aba.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Deluxe Rockies Suite — Grotto Hot Pools Access", area: "Uptown", type: "Condo", sleeps: 3, bedrooms: 1, bathrooms: "1", expediaId: "29611627", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414877vb", image: "https://media.vrbo.com/lodging/30000000/29620000/29611700/29611627/9f7c6177.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Rustic and Cozy Banff Getaway with Hot Tub Access", area: "Banff", type: "Condo", sleeps: 6, bedrooms: 2, bathrooms: "2", expediaId: "87625124", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3026245vb", image: "https://media.vrbo.com/lodging/88000000/87630000/87625200/87625124/d7914ec2.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Relaxing Mountain Getaway — Superior Room", area: "Uptown", type: "Condo", sleeps: 4, bedrooms: 1, bathrooms: "1", expediaId: "92066087", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p3309254vb", image: "https://media.vrbo.com/lodging/93000000/92070000/92066100/92066087/5f7d7b37.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "OUT OF BOUNDS — 2 Bed Condo near Banff Park Gate", area: "Harvie Heights", type: "Apartment", sleeps: 6, bedrooms: 2, bathrooms: "1", expediaId: "59641063", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p2097439vb", image: "https://media.vrbo.com/lodging/60000000/59650000/59641100/59641063/86f27211.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Gateway Suites: Pet-Friendly Getaway near Banff", area: "Harvie Heights", type: "Condo", sleeps: 2, bathrooms: "1", expediaId: "124498116", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p5026412vb", image: "https://media.vrbo.com/lodging/125000000/124500000/124498200/124498116/f9ce1c3a.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Beautiful Chalet with Unbeatable Location in Banff", area: "Downtown", type: "House", sleeps: 8, bedrooms: 4, bathrooms: "4", expediaId: "59675580", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p9508125", image: "https://media.vrbo.com/lodging/60000000/59680000/59675600/59675580/7a50b875.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
  { name: "Cozy Mountain Chalet with Loft and Hot Pools Access", area: "Tunnel Mountain", type: "Condo", sleeps: 6, bedrooms: 1, bathrooms: "1+", expediaId: "29632400", vrboUrl: "https://www.vrbo.com/en-ca/cottage-rental/p1414889vb", image: "https://media.vrbo.com/lodging/30000000/29640000/29632400/29632400/dfe13039.jpg?impolicy=resizecrop&ra=fit&rw=455&rh=455" },
];

export const rentals: VacationRental[] = rawData.map(raw => ({
  slug: slugify(raw.name),
  name: raw.name,
  type: raw.type ?? null,
  area: raw.area ?? null,
  base: importedBase(raw.area),
  importedSleeps: raw.sleeps ?? null,
  importedBedrooms: raw.bedrooms ?? null,
  importedBathrooms: raw.bathrooms ?? null,
  image: raw.image,
  vrboUrl: raw.vrboUrl,
  expediaId: raw.expediaId,
  verificationStatus: 'historical-provider-import',
  providerDetailsCheckedOn: null,
  coordinateStatus: 'unavailable',
  lat: null,
  lng: null,
}));
