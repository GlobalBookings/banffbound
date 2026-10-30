import type { Area } from './restaurants';

/** Public filter index only: no raw descriptions, photos, coordinates, prices or contacts enter the client bundle. */
export const diningPlanningReviewedAt = '2026-10-29';
export const diningFilterOptions = {
  area: [['all','All areas'],['banff','Banff'],['lake-louise','Lake Louise'],['canmore','Canmore'],['parkway','Parkway & Castle Junction']],
  format: [['all','All dining formats'],['cafe','Cafés & bakeries'],['meal','Restaurant meals'],['pub','Pubs, bars & breweries']],
} as const;
export type DiningAreaChoice = typeof diningFilterOptions.area[number][0];
export type DiningFormatChoice = typeof diningFilterOptions.format[number][0];
export interface DiningFilters { area: DiningAreaChoice; format: DiningFormatChoice; }
export const defaultDiningFilters: DiningFilters = { area: 'all', format: 'all' };
export const diningQueryKeys = { area: 'dining_area', format: 'dining_format' } as const;
export const diningPlannerNote = 'Formats group the checked descriptions in this directory. They do not show live opening, tables, admission or dietary/access suitability. Entries needing checks and the reported Station closure remain in All dining formats.';
const areaKeys: Record<Area, Exclude<DiningAreaChoice,'all'>> = { Banff: 'banff', 'Lake Louise': 'lake-louise', Canmore: 'canmore', 'Highway 1A': 'parkway' };

// Authored from the selected publisher facts. A venue can offer more than one
// format. Pending identities and the sourced renovation closure get no active
// meal category; default All preserves their discovery and status notices.
export const diningFormatMemberships: Record<Exclude<DiningFormatChoice,'all'>, readonly string[]> = {
  cafe: ['wild-flour-bakery','whitebark-cafe','bill-peytos-cafe','baker-creek-bistro'],
  meal: ['the-bison-restaurant','park-distillery','grizzly-house','block-kitchen-bar','juniper-bistro','eddie-burger-bar','tooloulous','banff-ave-brewing-co','nourish-bistro','magpie-and-stump','coyotes-southwestern-grill','bear-street-tavern','fairview-dining-room','walliser-stube','the-alpine-social','bill-peytos-cafe','the-iron-goat','tavern-1883','crazyweed-kitchen','the-drake-canmore','blake-brewpub','storm-mountain-lodge','high-rollers-bowling-pizza','the-rose-and-crown','three-bears-brewery','elk-and-oarsman'],
  pub: ['park-distillery','block-kitchen-bar','eddie-burger-bar','banff-ave-brewing-co','magpie-and-stump','bear-street-tavern','the-alpine-social','fairview-dining-room','the-iron-goat','tavern-1883','the-drake-canmore','blake-brewpub','high-rollers-bowling-pizza','the-rose-and-crown','three-bears-brewery','elk-and-oarsman'],
};
type IndexRow = { slug: string; area: Area; kind: 'restaurant'|'drink' };
const rows = (slugs: string[], area: Area, kind: IndexRow['kind'] = 'restaurant'): IndexRow[] => slugs.map(slug => ({slug,area,kind}));
const publicIndex: IndexRow[] = [
  ...rows(['the-bison-restaurant','park-distillery','grizzly-house','block-kitchen-bar','juniper-bistro','wild-flour-bakery','eddie-burger-bar','tooloulous','banff-ave-brewing-co','nourish-bistro','magpie-and-stump','coyotes-southwestern-grill','bear-street-tavern'],'Banff'),
  ...rows(['lake-louise-station','fairview-dining-room','walliser-stube','trailhead-cafe','bill-peytos-cafe','the-alpine-social'],'Lake Louise'),
  ...rows(['the-iron-goat','tavern-1883','crazyweed-kitchen','the-drake-canmore','blake-brewpub','pd3-by-blake'],'Canmore'),
  ...rows(['baker-creek-bistro','storm-mountain-lodge'],'Highway 1A'),
  ...rows(['high-rollers-bowling-pizza','the-rose-and-crown','whitebark-cafe','three-bears-brewery','elk-and-oarsman'],'Banff','drink'),
];
export const diningPlanningRecords = publicIndex.map(row => ({ ...row, areaKey: areaKeys[row.area], formats: (['cafe','meal','pub'] as const).filter(format => diningFormatMemberships[format].includes(row.slug)) }));

export function normaliseDiningFilters(raw: unknown = {}): DiningFilters {
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string,unknown> : {};
  const result = {...defaultDiningFilters};
  for (const key of ['area','format'] as const) {
    const candidate = value[key];
    if (typeof candidate === 'string' && diningFilterOptions[key].some(([option]) => option === candidate)) (result as Record<string,string>)[key] = candidate;
  }
  return result;
}
export function buildDiningPlan(raw: unknown = {}) {
  const filters = normaliseDiningFilters(raw);
  const visible = diningPlanningRecords.filter(record => (filters.area === 'all' || record.areaKey === filters.area) && (filters.format === 'all' || record.formats.includes(filters.format)));
  const shownCount = visible.length, totalCount = diningPlanningRecords.length;
  return { filters, visibleIds: visible.map(record => record.slug), shownCount, totalCount, empty: shownCount === 0, summary: `${shownCount} of ${totalCount} listed venues shown` };
}
export function readDiningFiltersFromUrl(href: string): DiningFilters {
  try {
    const url = new URL(href), raw: Record<string,string> = {};
    for (const key of ['area','format'] as const) { const values = url.searchParams.getAll(diningQueryKeys[key]); if (values.length === 1) raw[key] = values[0]; }
    return normaliseDiningFilters(raw);
  } catch { return {...defaultDiningFilters}; }
}
/** Only local public settings change; native operator/menu/reservation hrefs are never read or built by the controller. */
export function updateDiningSettingsUrl(href: string, raw: unknown): string | null {
  try {
    const url = new URL(href), filters = normaliseDiningFilters(raw);
    if (!['https:','http:'].includes(url.protocol)) return null;
    for (const key of ['area','format'] as const) { url.searchParams.delete(diningQueryKeys[key]); if (filters[key] !== defaultDiningFilters[key]) url.searchParams.set(diningQueryKeys[key], filters[key]); }
    return url.href;
  } catch { return null; }
}
