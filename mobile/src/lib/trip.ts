import {
  activityById,
  activityFitsSeason,
  createTripPlan,
  defaultTripPlan,
  MAX_DAY_ACTIVITIES,
  MAX_TRIP_DAYS,
  plannerTemplates,
  tripPlanWarnings,
  type TripPlan,
  type TripSeason,
} from '../data/planner.generated.ts';
import { places, type Place } from '../data/catalog.ts';

export type Booking = {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string;
  markedBooked: boolean;
};

/** User-entered estimates in CAD, not fetched quotes or per-person prices. */
export type Budget = {
  accommodation: number | null;
  arrival: number | null;
  admission: number | null;
  transport: number | null;
  activities: number | null;
  food: number | null;
  other: number | null;
};

export type AppState = {
  version: 1;
  trip: TripPlan;
  startDate: string;
  party: { adults: number; children: number };
  bookings: Booking[];
  savedPlaceIds: string[];
  checkedPackingIds: string[];
  /** A specific venue selected for a generic planner stop, keyed by day index and activity ID. */
  dayPlaces: Record<string, string>;
  budget: Budget;
  downloadedAt: string | null;
  remindersEnabled: boolean;
};

export const MAX_STATE_BYTES = 256_000;
export const MAX_BOOKINGS = 80;
export const MAX_SAVED_PLACES = 200;
export const BANFF_TIMEZONE = 'America/Edmonton';
/** Verified government policy; override stale device tzdata after Alberta's final 2026 clock change. */
export const BANFF_TIME_POLICY = {
  effectiveDate: '2026-11-01',
  effectiveInstant: '2026-11-01T06:00:00Z',
  utcOffsetMinutes: -360,
  sourceUrl: 'https://www.alberta.ca/albertas-new-time-system-abt',
  reviewedAt: '2026-10-30',
} as const;
const PERMANENT_ALBERTA_TIME_START = Date.parse(BANFF_TIME_POLICY.effectiveInstant);
const BUDGET_KEYS = ['accommodation', 'arrival', 'admission', 'transport', 'activities', 'food', 'other'] as const;
const safeId = /^[a-z0-9][a-z0-9_-]{0,79}$/i;
const placeById = new Map(places.map(place => [place.id, place]));

export const packingItems = [
  { id: 'layers', title: 'Layers and weather protection', detail: 'Pack for changing mountain weather and the actual activities you choose.' },
  { id: 'footwear', title: 'Suitable footwear', detail: 'Choose footwear and traction for your route and current conditions.' },
  { id: 'water', title: 'Water and snacks', detail: 'Bring enough for your outing; services can be seasonal or unavailable.' },
  { id: 'power', title: 'Charged phone and power bank', detail: 'Download your plan before leaving connectivity.' },
  { id: 'bookings', title: 'Booking details and return journey', detail: 'Check the meeting point, departure date and last return separately.' },
  { id: 'admission', title: 'Admission and transport passes', detail: 'Park entry, parking and shuttle tickets are separate arrangements.' },
  { id: 'sun', title: 'Sun protection', detail: 'Include sunglasses, sunscreen and a hat appropriate to the season.' },
  { id: 'medication', title: 'Personal essentials', detail: 'Bring your medication and anything your party needs during the outing.' },
  { id: 'winter', title: 'Winter gloves, hat and warm layers', detail: 'For winter visits, plan warm breaks and dry spare layers.' },
  { id: 'outdoor', title: 'Equipment for your chosen outing', detail: 'Confirm required equipment with the operator or current official route guidance.' },
] as const;
const packingIds = new Set<string>(packingItems.map(item => item.id));

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 2020 || year > 2100) return false;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function banffDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: banffTimeZoneForInstant(now), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function banffTimeZoneForInstant(now: Date): string {
  // IANA Etc/GMT signs are reversed: GMT+6 denotes UTC-6, including on older ICU versions.
  return now.getTime() >= PERMANENT_ALBERTA_TIME_START ? 'Etc/GMT+6' : BANFF_TIMEZONE;
}

export function formatBanffDateTime(now: Date, options: Omit<Intl.DateTimeFormatOptions, 'timeZone'> = {}): string {
  return new Intl.DateTimeFormat('en-CA', { ...options, timeZone: banffTimeZoneForInstant(now) }).format(now);
}

/** Calendar arithmetic deliberately avoids the device timezone and DST day lengths. */
export function addCalendarDays(date: string, offset: number): string {
  if (!isValidDate(date) || !Number.isInteger(offset) || Math.abs(offset) > 3660) throw new Error('Choose a valid date and day offset.');
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
  if (!isValidDate(result)) throw new Error('This date is outside the supported range.');
  return result;
}

export function tripDayIndex(state: AppState, now = new Date()): number | null {
  const today = banffDate(now);
  const distance = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${state.startDate}T00:00:00Z`)) / 86_400_000);
  return distance >= 0 && distance < state.trip.days.length ? distance : null;
}

export function createDefaultState(now = new Date()): AppState {
  return {
    version: 1,
    trip: defaultTripPlan(),
    startDate: banffDate(now),
    party: { adults: 2, children: 0 },
    bookings: [],
    savedPlaceIds: [],
    checkedPackingIds: [],
    dayPlaces: {},
    budget: { accommodation: null, arrival: null, admission: null, transport: null, activities: null, food: null, other: null },
    downloadedAt: null,
    remindersEnabled: false,
  };
}

function validTrip(value: unknown): value is TripPlan {
  if (!record(value) || !['winter', 'summer'].includes(String(value.season)) || !['banff', 'canmore', 'louise'].includes(String(value.base)) || !['car-free', 'drive'].includes(String(value.transport))) return false;
  if (!Array.isArray(value.days) || value.days.length < 1 || value.days.length > MAX_TRIP_DAYS) return false;
  const season = value.season as TripSeason;
  return value.days.every(day => Array.isArray(day) && day.length <= MAX_DAY_ACTIVITIES && new Set(day).size === day.length && day.every(id => typeof id === 'string' && Object.hasOwn(activityById, id) && activityFitsSeason(activityById[id], season)));
}

function validStringArray(value: unknown, max: number, accepted?: Set<string>): value is string[] {
  return Array.isArray(value) && value.length <= max && new Set(value).size === value.length && value.every(id => typeof id === 'string' && safeId.test(id) && (!accepted || accepted.has(id)));
}

function validBooking(value: unknown): value is Booking {
  return record(value) && typeof value.id === 'string' && safeId.test(value.id)
    && typeof value.title === 'string' && value.title.trim().length > 0 && value.title.length <= 120
    && (value.date === '' || isValidDate(value.date)) && (value.time === '' || isValidTime(value.time))
    && typeof value.notes === 'string' && value.notes.length <= 2000 && typeof value.markedBooked === 'boolean';
}

function parseDayPlaces(value: unknown, plan: TripPlan): Record<string, string> | null {
  if (value === undefined) return {}; // Earlier version-one trips have no specific venue mapping.
  if (!record(value) || Object.keys(value).length > MAX_TRIP_DAYS * MAX_DAY_ACTIVITIES) return null;
  const entries = Object.entries(value);
  if (!entries.every(([key, placeId]) => /^[0-6]:[a-z0-9][a-z0-9_-]{0,79}$/i.test(key) && typeof placeId === 'string' && safeId.test(placeId))) return null;
  return Object.fromEntries(entries.filter(([key, placeId]) => {
    const separator = key.indexOf(':');
    const dayIndex = Number(key.slice(0, separator));
    const activityId = key.slice(separator + 1);
    const place = placeById.get(placeId as string);
    // Orphans from removed stops or retired catalogue records fall back to a generic stop.
    return plan.days[dayIndex]?.includes(activityId) && place?.plannerActivityId === activityId && (place.season === 'all' || place.season === plan.season);
  })) as Record<string, string>;
}

function parseState(value: unknown): AppState | null {
  if (!record(value) || value.version !== 1 || !validTrip(value.trip) || !isValidDate(value.startDate)) return null;
  if (!record(value.party) || !Number.isInteger(value.party.adults) || !Number.isInteger(value.party.children) || Number(value.party.adults) < 1 || Number(value.party.adults) > 30 || Number(value.party.children) < 0 || Number(value.party.children) > 30) return null;
  if (!Array.isArray(value.bookings) || value.bookings.length > MAX_BOOKINGS || !value.bookings.every(validBooking) || new Set(value.bookings.map(booking => booking.id)).size !== value.bookings.length) return null;
  if (!validStringArray(value.savedPlaceIds, MAX_SAVED_PLACES) || !validStringArray(value.checkedPackingIds, packingItems.length, packingIds)) return null;
  const dayPlaces = parseDayPlaces(value.dayPlaces, value.trip);
  if (dayPlaces === null) return null;
  if (!record(value.budget)) return null;
  // These fields were added to version one; preserve original amounts without inferring a split.
  const budget: Record<string, unknown> = { ...value.budget, admission: value.budget.admission === undefined ? null : value.budget.admission, arrival: value.budget.arrival === undefined ? null : value.budget.arrival };
  if (!BUDGET_KEYS.every(key => budget[key] === null || typeof budget[key] === 'number' && Number.isFinite(budget[key]) && Number(budget[key]) >= 0 && Number(budget[key]) <= 1_000_000)) return null;
  if (value.downloadedAt !== null && (typeof value.downloadedAt !== 'string' || value.downloadedAt.length > 32 || !Number.isFinite(Date.parse(value.downloadedAt)))) return null;
  if (value.remindersEnabled !== undefined && typeof value.remindersEnabled !== 'boolean') return null;
  // Return owned objects only: no extra or prototype-supplied fields enter storage.
  return {
    version: 1,
    trip: { season: value.trip.season, base: value.trip.base, transport: value.trip.transport, days: value.trip.days.map(day => [...day]) },
    startDate: value.startDate,
    party: { adults: Number(value.party.adults), children: Number(value.party.children) },
    bookings: value.bookings.map(booking => ({ id: booking.id, title: booking.title.trim(), date: booking.date, time: booking.time, notes: booking.notes, markedBooked: booking.markedBooked })),
    savedPlaceIds: [...value.savedPlaceIds],
    checkedPackingIds: [...value.checkedPackingIds],
    dayPlaces,
    budget: Object.fromEntries(BUDGET_KEYS.map(key => [key, budget[key] === null ? null : Math.round(Number(budget[key]) * 100) / 100])) as Budget,
    downloadedAt: value.downloadedAt as string | null,
    remindersEnabled: value.remindersEnabled === true,
  };
}

export function decodeState(serialized: string | null | undefined): AppState | null {
  if (typeof serialized !== 'string' || serialized.length === 0 || serialized.length > MAX_STATE_BYTES) return null;
  try { return parseState(JSON.parse(serialized)); } catch { return null; }
}

/** Invalid mutations are rejected as a whole, keeping the last valid state. */
export function sanitizeState(value: unknown, fallback = createDefaultState()): AppState {
  return parseState(value) ?? parseState(fallback) ?? createDefaultState();
}

export function editDay(plan: TripPlan, dayIndex: number, ids: string[]): TripPlan {
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= plan.days.length) return plan;
  const next = { ...plan, days: plan.days.map((day, index) => index === dayIndex ? [...ids] : [...day]) };
  return validTrip(next) ? next : plan;
}

export function addActivity(plan: TripPlan, dayIndex: number, activityId: string): TripPlan {
  const day = plan.days[dayIndex];
  if (!day || day.includes(activityId)) return plan;
  return editDay(plan, dayIndex, [...day, activityId]);
}

export function removeActivity(plan: TripPlan, dayIndex: number, activityId: string): TripPlan {
  return plan.days[dayIndex] ? editDay(plan, dayIndex, plan.days[dayIndex].filter(id => id !== activityId)) : plan;
}

export function moveActivity(plan: TripPlan, dayIndex: number, activityIndex: number, direction: -1 | 1): TripPlan {
  const day = plan.days[dayIndex];
  const destination = activityIndex + direction;
  if (!day || !Number.isInteger(activityIndex) || activityIndex < 0 || activityIndex >= day.length || destination < 0 || destination >= day.length) return plan;
  const next = [...day];
  [next[activityIndex], next[destination]] = [next[destination], next[activityIndex]];
  return editDay(plan, dayIndex, next);
}

export function addDay(plan: TripPlan): TripPlan {
  return plan.days.length < MAX_TRIP_DAYS ? { ...plan, days: [...plan.days.map(day => [...day]), []] } : plan;
}

export function removeDay(plan: TripPlan, dayIndex: number): TripPlan {
  return plan.days.length > 1 && Number.isInteger(dayIndex) && dayIndex >= 0 && dayIndex < plan.days.length
    ? { ...plan, days: plan.days.filter((_, index) => index !== dayIndex).map(day => [...day]) } : plan;
}

/** Remove a calendar day and keep each later selected venue attached to its shifted day. */
export function removeTripDay(state: AppState, dayIndex: number): AppState {
  const trip = removeDay(state.trip, dayIndex);
  if (trip === state.trip) return state;
  const dayPlaces: Record<string, string> = {};
  for (const [key, placeId] of Object.entries(state.dayPlaces)) {
    const separator = key.indexOf(':');
    const index = Number(key.slice(0, separator));
    const activityId = key.slice(separator + 1);
    if (index !== dayIndex) dayPlaces[`${index > dayIndex ? index - 1 : index}:${activityId}`] = placeId;
  }
  return sanitizeState({ ...state, trip, dayPlaces }, state);
}

export function selectDayPlace(state: AppState, dayIndex: number, activityId: string, placeId: string): AppState {
  const place = placeById.get(placeId);
  if (!Number.isInteger(dayIndex) || !state.trip.days[dayIndex]?.includes(activityId) || place?.plannerActivityId !== activityId || place.season !== 'all' && place.season !== state.trip.season) return state;
  return { ...state, dayPlaces: { ...state.dayPlaces, [`${dayIndex}:${activityId}`]: placeId } };
}

/** Add the place's planner stop if needed, then retain the precise venue selected by the traveller. */
export function addPlaceToDay(state: AppState, dayIndex: number, placeId: string): AppState {
  const place = placeById.get(placeId);
  const activityId = place?.plannerActivityId;
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= state.trip.days.length || !place || !activityId || !Object.hasOwn(activityById, activityId)
    || !activityFitsSeason(activityById[activityId], state.trip.season) || place.season !== 'all' && place.season !== state.trip.season) return state;
  const existing = state.trip.days[dayIndex].includes(activityId);
  const trip = existing ? state.trip : addActivity(state.trip, dayIndex, activityId);
  if (!existing && trip === state.trip) return state;
  return selectDayPlace({ ...state, trip }, dayIndex, activityId, placeId);
}

/** Planning checks follow the actual selected venue, while generic stops keep the original rules. */
export function warningsForTrip(state: AppState, catalogue: readonly Place[] = places): string[] {
  const selectedById = catalogue === places ? placeById : new Map(catalogue.map(place => [place.id, place]));
  const activitiesByDay = state.trip.days.map((day, dayIndex) => day.map(id => {
    const activity = activityById[id];
    const selected = selectedById.get(state.dayPlaces[`${dayIndex}:${id}`]);
    if (!activity) return null;
    if (selected?.plannerActivityId === id && (selected.season === 'all' || selected.season === state.trip.season)) {
      return { ...activity, area: selected.area, transfer: activity.transfer || selected.area === 'regional', selected: true };
    }
    return { ...activity, selected: false };
  }).filter(activity => activity !== null));
  if (!activitiesByDay.some(day => day.some(activity => activity.selected))) return tripPlanWarnings(state.trip);
  const warnings: string[] = [];
  const baseNames = { banff: 'Banff', canmore: 'Canmore', louise: 'Lake Louise' };
  activitiesByDay.forEach((activities, index) => {
    const label = `Day ${index + 1}`;
    const hours = activities.reduce((sum, activity) => sum + activity.hours, 0);
    if (!activities.length) warnings.push(`${label} is open. Keep it as a rest or travel day, or add an outing.`);
    if (hours > 8 || activities.some(activity => activity.fullDay) && activities.length > 1) warnings.push(`${label} is a big day. Consider keeping only the main outing and a flexible evening.`);
    const areas = new Set(activities.map(activity => activity.area).filter(area => area !== 'regional'));
    if (areas.size > 1) warnings.push(`${label} combines different towns or areas. Check the complete transfer and return before booking.`);
    const awayAreas = [...areas].filter(area => area !== state.trip.base);
    if (state.trip.transport === 'car-free') {
      if (awayAreas.length) warnings.push(`${label}: confirm the complete journey from ${baseNames[state.trip.base]} to ${awayAreas.map(area => baseNames[area]).join(' and ')} and the final return, especially for an evening meal. Town transit and resort shuttles are different services.`);
      else if (activities.some(activity => activity.transfer)) warnings.push(`${label} needs a confirmed activity transfer or public-transit connection. Check the actual stop, date and final return; a town bus is not a resort shuttle.`);
      if (state.trip.base === 'canmore' && activities.some(activity => activity.area === 'regional')) warnings.push(`${label}: check the separate Canmore connection before booking a resort or regional outing with an early start.`);
    } else if (awayAreas.length) warnings.push(`${label}: allow for the drive from ${baseNames[state.trip.base]} to ${awayAreas.map(area => baseNames[area]).join(' and ')}, parking and the return. Activity allowances do not include those journeys.`);
  });
  if (state.trip.transport === 'drive') warnings.push('Driving plan: check road access, weather, parking and the vehicle’s actual equipment. Keep enough flexibility to postpone an outing.');
  return warnings;
}

export function changeSeason(plan: TripPlan, season: TripSeason): TripPlan {
  if (season !== 'winter' && season !== 'summer') return plan;
  return { ...plan, season, days: plan.days.map(day => day.filter(id => Object.hasOwn(activityById, id) && activityFitsSeason(activityById[id], season))) };
}

export function applyTemplate(plan: TripPlan, templateId: string): TripPlan {
  if (!plannerTemplates.some(template => template.id === templateId)) return plan;
  return { ...createTripPlan(templateId), base: plan.base, transport: plan.transport };
}

export function budgetTotal(budget: Budget): number {
  return Math.round(BUDGET_KEYS.reduce((sum, key) => sum + (budget[key] ?? 0), 0) * 100) / 100;
}

export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (const character of value) {
    const code = character.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export function newBookingId(): string {
  return `booking-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type TripPack = { format: 'banffbound-trip'; version: 1; exportedAt: string; privateNotesIncluded: boolean; state: AppState };

export function exportTripPack(state: AppState, options: { includePrivateNotes?: boolean; now?: Date } = {}): string {
  const safe = sanitizeState(state);
  const include = options.includePrivateNotes === true;
  const shared: AppState = { ...safe, remindersEnabled: false, bookings: safe.bookings.map(booking => ({ ...booking, notes: include ? booking.notes : '' })) };
  const pack: TripPack = { format: 'banffbound-trip', version: 1, exportedAt: (options.now ?? new Date()).toISOString(), privateNotesIncluded: include, state: shared };
  return JSON.stringify(pack, null, 2);
}

export function importTripPack(serialized: string): AppState | null {
  if (typeof serialized !== 'string' || serialized.length > MAX_STATE_BYTES || utf8ByteLength(serialized) > MAX_STATE_BYTES) return null;
  try {
    const pack = JSON.parse(serialized);
    if (!record(pack) || pack.format !== 'banffbound-trip' || pack.version !== 1 || typeof pack.privateNotesIncluded !== 'boolean' || typeof pack.exportedAt !== 'string' || !Number.isFinite(Date.parse(pack.exportedAt))) return null;
    const state = parseState(pack.state);
    // A file from another device cannot establish this device's download status or consent.
    return state ? { ...state, downloadedAt: null, remindersEnabled: false } : null;
  } catch { return null; }
}

export function tripToText(state: AppState, options: { includePrivateNotes?: boolean } = {}): string {
  const base = { banff: 'Banff', canmore: 'Canmore', louise: 'Lake Louise' };
  const lines = ['My BanffBound trip', `${state.trip.days.length} days from ${state.startDate} · ${base[state.trip.base]} · ${state.trip.transport === 'drive' ? 'Driving' : 'Car-free'}`, ''];
  state.trip.days.forEach((day, index) => {
    lines.push(`Day ${index + 1} · ${addCalendarDays(state.startDate, index)}`);
    lines.push(...(day.length ? day.map(id => {
      const selected = placeById.get(state.dayPlaces[`${index}:${id}`]);
      return `• ${selected?.name ?? activityById[id]?.name ?? 'Unlisted activity'}`;
    }) : ['• Flexible day']));
    lines.push('');
  });
  if (state.bookings.length) {
    lines.push('Booking checklist — status recorded by the traveller');
    state.bookings.forEach(booking => {
      lines.push(`• ${booking.title}${booking.date ? ` · ${booking.date}` : ''}${booking.time ? ` ${booking.time} Banff time` : ''} · ${booking.markedBooked ? 'Marked booked by me' : 'To arrange'}`);
      if (options.includePrivateNotes && booking.notes) lines.push(`  ${booking.notes}`);
    });
    lines.push('');
  }
  lines.push('Check current operations, access and return transport before departure.', 'https://banffbound.com');
  return lines.join('\n');
}

/** Resolve Banff wall time using verified Alberta Time policy, preserving historical DST validation. */
export function banffDateTime(date: string, time: string): Date | null {
  if (!isValidDate(date) || !isValidTime(time)) return null;
  const expected = `${date} ${time}`;
  const nominal = Date.parse(`${date}T${time}:00Z`);
  if (date >= BANFF_TIME_POLICY.effectiveDate) return new Date(nominal - BANFF_TIME_POLICY.utcOffsetMinutes * 60_000);
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: BANFF_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const matches: Date[] = [];
  // Before the policy change Edmonton used UTC-6 or UTC-7; reject historical gaps and folds.
  for (const offset of [6, 7]) {
    const candidate = new Date(nominal + offset * 3_600_000);
    const fields = Object.fromEntries(formatter.formatToParts(candidate).map(part => [part.type, part.value]));
    const actual = `${fields.year}-${fields.month}-${fields.day} ${fields.hour}:${fields.minute}`;
    if (actual === expected) matches.push(candidate);
  }
  return matches.length === 1 ? matches[0] : null;
}
