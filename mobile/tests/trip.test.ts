import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addActivity, addCalendarDays, addDay, applyTemplate, banffDate, banffDateTime,
  budgetTotal, changeSeason, createDefaultState, decodeState, exportTripPack,
  importTripPack, isValidDate, moveActivity, removeDay, sanitizeState,
  tripDayIndex, tripToText, removeTripDay, selectDayPlace, removeActivity, warningsForTrip,
} from '../src/lib/trip.ts';
import { planBookingReminders } from '../src/lib/reminders.ts';
import { places, type Place } from '../src/data/catalog.ts';
import { tripPlanWarnings } from '../src/data/planner.generated.ts';

test('default trip round-trips through bounded state decoding', () => {
  const state = createDefaultState(new Date('2026-10-31T01:00:00Z'));
  assert.equal(state.startDate, '2026-10-30');
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
});

test('reject corruption, future schema, invalid days, unsafe identifiers and non-finite budget', () => {
  const state = createDefaultState();
  assert.equal(decodeState('{broken'), null);
  assert.equal(decodeState(' '.repeat(256_001)), null);
  assert.equal(decodeState(JSON.stringify({ ...state, version: 9 })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, trip: { ...state.trip, days: [['__proto__']] } })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, trip: { ...state.trip, days: [['town', 'town']] } })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, trip: { ...state.trip, days: [['moraine']] } })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, savedPlaceIds: ['../../secret'] })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, budget: { ...state.budget, food: 'unknown' } })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, party: { adults: 0, children: 2 } })), null);
  assert.equal(decodeState(JSON.stringify({ ...state, checkedPackingIds: ['not-in-list'] })), null);
});

test('sanitization preserves the last valid state after an invalid edit', () => {
  const previous = createDefaultState();
  previous.trip.base = 'canmore';
  assert.deepEqual(sanitizeState({ ...previous, startDate: '2026-02-30' }, previous), previous);
});

test('editing days enforces limits and changes never mutate previous objects', () => {
  const state = createDefaultState();
  const original = JSON.stringify(state);
  let plan = addActivity(state.trip, 0, 'cave');
  assert.deepEqual(plan.days[0], ['town', 'culture', 'cave']);
  assert.equal(addActivity(plan, 0, 'dinner'), plan);
  assert.equal(addActivity(plan, 0, 'moraine'), plan);
  assert.equal(addActivity(plan, -1, 'dinner'), plan);
  plan = moveActivity(plan, 0, 2, -1);
  assert.deepEqual(plan.days[0], ['town', 'cave', 'culture']);
  assert.equal(JSON.stringify(state), original);
  while (plan.days.length < 7) plan = addDay(plan);
  assert.equal(addDay(plan), plan);
  while (plan.days.length > 1) plan = removeDay(plan, 0);
  assert.equal(removeDay(plan, 0), plan);
});

test('season changes remove incompatible activities and template changes keep transport and base', () => {
  const state = createDefaultState();
  const winter = { ...state.trip, base: 'canmore' as const, transport: 'drive' as const, days: [['ski'], ['town', 'skate']] };
  const summer = changeSeason(winter, 'summer');
  assert.deepEqual(summer.days, [[], ['town']]);
  assert.deepEqual(winter.days, [['ski'], ['town', 'skate']]);
  const template = applyTemplate(winter, 'first-timer-3');
  assert.equal(template.season, 'summer');
  assert.equal(template.base, 'canmore');
  assert.equal(template.transport, 'drive');
  assert.equal(applyTemplate(winter, 'nonexistent'), winter);
});

test('calendar arithmetic and current day use Banff dates across DST and device boundaries', () => {
  assert.equal(addCalendarDays('2026-03-07', 2), '2026-03-09');
  assert.equal(addCalendarDays('2026-12-31', 1), '2027-01-01');
  assert.equal(isValidDate('2026-02-29'), false);
  assert.equal(isValidDate('2028-02-29'), true);
  assert.equal(banffDate(new Date('2026-11-01T05:30:00Z')), '2026-10-31');
  const state = createDefaultState();
  state.startDate = '2026-10-30';
  assert.equal(tripDayIndex(state, new Date('2026-10-31T01:00:00Z')), 0);
  assert.equal(tripDayIndex(state, new Date('2026-11-05T01:00:00Z')), null);
});

test('Banff wall-clock reminders use seasonal UTC offsets and reject ambiguous or missing DST times', () => {
  assert.equal(banffDateTime('2026-06-05', '09:00')?.toISOString(), '2026-06-05T15:00:00.000Z');
  assert.equal(banffDateTime('2026-12-05', '09:00')?.toISOString(), '2026-12-05T16:00:00.000Z');
  assert.equal(banffDateTime('2026-03-08', '02:30'), null);
  assert.equal(banffDateTime('2026-11-01', '01:30'), null);
  assert.equal(banffDateTime('2026-01-01', '24:00'), null);
});

test('trip export omits private booking notes by default and import validates its envelope', () => {
  const state = createDefaultState();
  state.remindersEnabled = true;
  state.bookings.push({ id: 'booking-1', title: 'Shuttle', date: '2026-12-05', time: '09:00', notes: 'PRIVATE confirmation 123', markedBooked: true });
  const normal = exportTripPack(state);
  assert.equal(normal.includes('PRIVATE'), false);
  assert.equal(tripToText(state).includes('PRIVATE'), false);
  assert.equal(importTripPack(normal)?.bookings[0].notes, '');
  assert.equal(importTripPack(normal)?.remindersEnabled, false);
  assert.equal(importTripPack(exportTripPack(state, { includePrivateNotes: true }))?.bookings[0].notes, 'PRIVATE confirmation 123');
  assert.equal(tripToText(state, { includePrivateNotes: true }).includes('PRIVATE'), true);
  assert.equal(importTripPack(JSON.stringify(state)), null);
  assert.equal(importTripPack(normal.replace('banffbound-trip', 'other-trip')), null);
  assert.equal(importTripPack(normal.replace('"version": 1', '"version": 99')), null);
});

test('budget arithmetic sums user estimates without floating-point residue', () => {
  assert.equal(budgetTotal({ ...createDefaultState().budget, accommodation: 0.1, transport: 0.2, activities: 0, food: 0, other: 0 }), 0.3);
});

test('blank budget fields remain unknown while an explicit zero survives storage and file export', () => {
  const state = createDefaultState();
  assert.equal(Object.values(state.budget).every(value => value === null), true);
  state.budget.transport = 0;
  state.budget.food = 120.25;
  const restored = decodeState(JSON.stringify(state));
  assert.equal(restored?.budget.accommodation, null);
  assert.equal(restored?.budget.transport, 0);
  assert.equal(budgetTotal(state.budget), 120.25);
  const imported = importTripPack(exportTripPack(state));
  assert.equal(imported?.budget.accommodation, null);
  assert.equal(imported?.budget.transport, 0);
  assert.equal(imported?.budget.food, 120.25);
});

test('existing version one numeric budgets and missing reminder preference migrate without changing known costs', () => {
  const original = { ...createDefaultState(), budget: { accommodation: 0, transport: 15.5, activities: 0, food: 45, other: 0 } };
  const serialized = JSON.stringify(original).replace(',"remindersEnabled":false', '');
  const restored = decodeState(serialized);
  assert.deepEqual(restored?.budget, { ...original.budget, admission: null, arrival: null });
  assert.equal(restored?.remindersEnabled, false);
});

test('admission and arrival costs remain separate and legacy amounts are never reallocated', () => {
  const state = createDefaultState();
  state.budget.admission = 24.5;
  state.budget.arrival = 100;
  state.budget.activities = 55;
  state.budget.other = 7;
  assert.equal(budgetTotal(state.budget), 186.5);
  const restored = decodeState(JSON.stringify(state));
  assert.equal(restored?.budget.admission, 24.5);
  assert.equal(restored?.budget.arrival, 100);
  assert.equal(restored?.budget.activities, 55);
  assert.equal(restored?.budget.other, 7);
  const legacy = JSON.parse(JSON.stringify(state));
  delete legacy.budget.admission;
  delete legacy.budget.arrival;
  const migrated = decodeState(JSON.stringify(legacy));
  assert.equal(migrated?.budget.admission, null);
  assert.equal(migrated?.budget.arrival, null);
  assert.equal(migrated?.budget.activities, 55);
  assert.equal(migrated?.budget.other, 7);
});

test('imported files cannot grant reminder consent or carry another device download status', () => {
  const state = createDefaultState();
  state.downloadedAt = '2026-10-30T12:00:00Z';
  const pack = JSON.parse(exportTripPack(state));
  pack.state.remindersEnabled = true;
  pack.state.password = 'unrecognised field';
  const imported = importTripPack(JSON.stringify(pack));
  assert.equal(imported?.downloadedAt, null);
  assert.equal(imported?.remindersEnabled, false);
  assert.equal(Object.hasOwn(imported ?? {}, 'password'), false);
});

test('a selected restaurant remains the actual venue in storage, shared text and imported trip files', () => {
  const state = createDefaultState();
  const selected = selectDayPlace(state, 2, 'dinner', 'nourish-bistro');
  assert.equal(selected.dayPlaces['2:dinner'], 'nourish-bistro');
  assert.equal(decodeState(JSON.stringify(selected))?.dayPlaces['2:dinner'], 'nourish-bistro');
  assert.equal(importTripPack(exportTripPack(selected))?.dayPlaces['2:dinner'], 'nourish-bistro');
  assert.equal(tripToText(selected).includes('Nourish Bistro'), true);
  assert.equal(tripToText(selected).includes('The Bison Restaurant'), false);
  assert.equal(selectDayPlace(state, 0, 'town', 'nourish-bistro'), state);
  assert.equal(selectDayPlace(state, 7, 'dinner', 'nourish-bistro'), state);
});

test('removing a day shifts later selected venues and removing a stop prunes its orphaned venue', () => {
  const state = createDefaultState();
  state.trip.days = [['dinner'], ['town'], ['dinner']];
  const selected = selectDayPlace(selectDayPlace(state, 0, 'dinner', 'the-bison-restaurant'), 2, 'dinner', 'nourish-bistro');
  const shifted = removeTripDay(selected, 0);
  assert.deepEqual(shifted.trip.days, [['town'], ['dinner']]);
  assert.deepEqual(shifted.dayPlaces, { '1:dinner': 'nourish-bistro' });
  assert.deepEqual(selected.dayPlaces, { '0:dinner': 'the-bison-restaurant', '2:dinner': 'nourish-bistro' });
  const removed = sanitizeState({ ...shifted, trip: removeActivity(shifted.trip, 1, 'dinner') }, shifted);
  assert.deepEqual(removed.dayPlaces, {});
});

test('legacy trips gain an empty selected venue map and retired or mismatched venues cannot redirect stops', () => {
  const state = createDefaultState();
  const legacy = JSON.parse(JSON.stringify(state));
  delete legacy.dayPlaces;
  assert.deepEqual(decodeState(JSON.stringify(legacy))?.dayPlaces, {});
  assert.deepEqual(decodeState(JSON.stringify({ ...state, dayPlaces: { '2:dinner': 'unknown-retired-place', '0:town': 'nourish-bistro' } }))?.dayPlaces, {});
  assert.equal(decodeState(JSON.stringify({ ...state, dayPlaces: { '8:dinner': 'nourish-bistro' } })), null);
});

test('without selected venues the warning list remains exactly the original planner output', () => {
  const state = createDefaultState();
  assert.deepEqual(warningsForTrip(state), tripPlanWarnings(state.trip));
  state.trip.base = 'canmore';
  state.trip.transport = 'drive';
  assert.deepEqual(warningsForTrip(state), tripPlanWarnings(state.trip));
});

test('restaurant transport advice uses the selected venue area rather than the generic Banff dinner', () => {
  const state = createDefaultState();
  state.trip.base = 'canmore';
  state.trip.days = [['dinner']];
  // Fixture exercises adding a Canmore restaurant to the catalogue without publishing invented content.
  const canmoreRestaurant: Place = { ...places.find(place => place.id === 'nourish-bistro')!, id: 'canmore-restaurant-fixture', name: 'Canmore restaurant fixture', area: 'canmore' };
  const catalogue = [...places, canmoreRestaurant];
  state.dayPlaces = { '0:dinner': canmoreRestaurant.id };
  assert.deepEqual(warningsForTrip(state, catalogue), []);
  state.dayPlaces = { '0:dinner': 'nourish-bistro' };
  assert.equal(warningsForTrip(state).some(warning => warning.includes('from Canmore to Banff') && warning.includes('final return')), true);
});

test('selected venues preserve mixed-area, full-day and driving planning checks', () => {
  const state = createDefaultState();
  state.trip.base = 'canmore';
  state.trip.days = [['town', 'dinner'], ['ski', 'dinner']];
  const canmoreRestaurant: Place = { ...places.find(place => place.id === 'nourish-bistro')!, id: 'canmore-restaurant-fixture', name: 'Canmore restaurant fixture', area: 'canmore' };
  state.dayPlaces = { '0:dinner': canmoreRestaurant.id, '1:dinner': canmoreRestaurant.id };
  const warnings = warningsForTrip(state, [...places, canmoreRestaurant]);
  assert.equal(warnings.some(warning => warning.startsWith('Day 1 combines different towns')), true);
  assert.equal(warnings.some(warning => warning.startsWith('Day 2 is a big day')), true);
  state.trip.transport = 'drive';
  const driving = warningsForTrip(state, [...places, canmoreRestaurant]);
  assert.equal(driving.some(warning => warning.includes('drive from Canmore to Banff')), true);
  assert.equal(driving.at(-1), tripPlanWarnings(state.trip).at(-1));
});

test('reminder plan excludes private notes and expired or ambiguous times', () => {
  const state = createDefaultState();
  const booking = { id: 'booking-1', title: 'My shuttle', date: '2026-12-05', time: '09:00', notes: 'private details', markedBooked: true };
  state.bookings = [booking];
  const reminders = planBookingReminders(state.bookings, { now: new Date('2026-12-01T00:00Z') });
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].at.toISOString(), '2026-12-05T15:30:00.000Z');
  assert.equal(reminders[0].body.includes('private'), false);
  assert.equal(reminders[0].body.includes('Marked booked by you'), true);
  assert.equal(planBookingReminders(state.bookings, { now: new Date('2026-12-06T00:00Z') }).length, 0);
  assert.equal(planBookingReminders([{ ...booking, date: '2026-11-01', time: '01:30' }], { now: new Date('2026-10-01T00:00Z') }).length, 0);
});
