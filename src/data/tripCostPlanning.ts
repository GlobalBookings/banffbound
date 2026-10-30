export const tripBudgetReviewedAt = '2026-10-29';
export const tripBudgetCategories = [
  { id: 'lodging', label: 'Accommodation', help: 'Use the actual room, apartment or bed quote. Check occupancy, taxes, parking and required property fees.', bases: [['room-night', 'Per room / night'], ['bed-night', 'Per person / night'], ['party-night', 'Whole party / night'], ['trip', 'Whole party / trip']] },
  { id: 'food', label: 'Food & drinks', help: 'Include groceries, meals, drinks, taxes and your intended tips. Use a whole-party amount if people have different budgets.', bases: [['person-day', 'Per person / day'], ['party-day', 'Whole party / day'], ['trip', 'Whole party / trip']] },
  { id: 'activities', label: 'Activities & equipment', help: 'Add actual tickets for each age, lessons, rentals and required extras across the trip. Check package inclusions before adding them again.', bases: [['trip', 'Whole party / trip']] },
  { id: 'transport', label: 'Getting around', help: 'Enter the party’s whole-trip total: rental or transit, fuel, parking and destination shuttles as applicable. Separate the arrival journey below.', bases: [['trip', 'Whole party / trip']] },
  { id: 'arrival', label: 'Getting here & home', help: 'Include return flights or intercity travel, airport transfers, luggage and other arrival costs you want in this budget.', bases: [['trip', 'Whole party / trip']] },
  { id: 'admission', label: 'Park admission & permits', help: 'Use the applicable party total for your dates, ages, vehicle and existing pass. Do not add an admission charge twice.', bases: [['trip', 'Whole party / trip']] },
  { id: 'extras', label: 'Other trip costs', help: 'Add insurance, clothing, childcare, pet fees or other known costs. A reserve below is extra money you choose to set aside.', bases: [['trip', 'Whole party / trip']] },
] as const;
export type BudgetCategoryId = typeof tripBudgetCategories[number]['id'];
export type BudgetPlanId = 'a' | 'b';
export const tripBudgetModes = [['quoted', 'Enter an amount'], ['included', 'No extra cost / counted elsewhere'], ['omit', 'Leave out of this budget']] as const;
export const defaultTripBudget = {
  people: '2', days: '5', nights: '4', reserve: '0', compare: false, confirmed: false,
  plans: Object.fromEntries(['a', 'b'].map(id => [id, { rooms: '1', items: Object.fromEntries(tripBudgetCategories.map(category => [category.id, { mode: 'quoted', amount: '', basis: category.bases[0][0] }])) }])),
};
export const tripBudgetFaqs = [
  { question: 'How much does a Banff trip cost?', answer: 'Start with current quotes for your actual dates and party. Accommodation, transport and activities vary by room, age, product and booking terms. This planner calculates your entries; it does not supply live prices or a typical market budget.' },
  { question: 'Why are days, nights, rooms and people separate?', answer: 'A five-day trip may have four accommodation nights. A room quote is multiplied by rooms and nights, while a bed quote is multiplied by people and nights. Food can be entered per person per day, for the whole party per day, or as one trip total.' },
  { question: 'What does a blank amount mean?', answer: 'Blank means unknown, not free. Known amounts still produce a subtotal, but missing or deliberately omitted categories prevent a complete trip total. Choose no extra cost only when there is no additional charge or that cost is already counted in another row.' },
  { question: 'Can I compare a hotel package with separate bookings?', answer: 'Yes. Put the package total in one appropriate row, then mark covered rows as counted elsewhere. Add every extra charge separately. Compare the same party, days, nights, currency and coverage, and confirm taxes and required fees before using the difference.' },
  { question: 'Does the planner convert currency or save my quotes?', answer: 'No. Enter all amounts in Canadian dollars using your own conversion where necessary, including any payment or exchange fees you expect. The calculator does not save entries or put them into booking links. Use Clear & start again to remove the current entries, or print the completed budget if you want a copy.' },
];

export function formatBudgetMoney(cents: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', currencyDisplay: 'code', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}
type ErrorEntry = { field: string; message: string };
type BudgetRow = { id: BudgetCategoryId; label: string; state: 'known' | 'included' | 'missing' | 'omitted'; cents: number | null; detail: string };
export type TripBudgetResult = {
  errors: ErrorEntry[]; people: number | null; days: number | null; nights: number | null; reserve: number | null; confirmed: boolean;
  plans: { id: BudgetPlanId; rows: BudgetRow[]; complete: boolean; subtotalCents: number; reserveCents: number; knownWithReserveCents: number; totalCents: number | null; perPersonCents: number | null; perPersonDayCents: number | null; missingCount: number; omittedCount: number }[];
  comparison: { state: 'off' | 'incomplete' | 'unconfirmed' | 'tie' | 'different'; lower: BudgetPlanId | null; differenceCents: number | null; text: string };
};
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function numeric(value: unknown, max: number, integer = false): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const raw = String(value).trim();
  if (!raw || !(integer ? /^\d+$/ : /^\d+(?:\.\d{1,2})?$/).test(raw)) return null;
  const number = Number(raw);
  return Number.isFinite(number) && number <= max ? number : null;
}
export function calculateTripBudget(value: unknown): TripBudgetResult {
  const input = object(value), errors: ErrorEntry[] = [];
  function count(key: string, label: string, min: number, max: number) {
    const value = numeric(input[key], max, true);
    if (value === null || value < min) errors.push({ field: 'budget-' + key, message: `${label}: enter a whole number from ${min} to ${max}.` });
    return value;
  }
  const people = count('people', 'People', 1, 30), days = count('days', 'Days', 1, 90), nights = count('nights', 'Nights', 0, 90);
  const reserve = numeric(input.reserve, 100);
  if (reserve === null) errors.push({ field: 'budget-reserve', message: 'Reserve: enter a percentage from 0 to 100, with at most two decimal places.' });
  if (days !== null && nights !== null && nights > days) errors.push({ field: 'budget-nights', message: 'Nights cannot exceed the total travel days counted in this plan. Include arrival and departure days.' });
  const confirmed = input.confirmed === true, compare = input.compare === true;
  const result: TripBudgetResult = { errors, people, days, nights, reserve, confirmed, plans: [], comparison: { state: 'off', lower: null, differenceCents: null, text: 'Add Plan B to compare two budgets for the same trip.' } };
  if (errors.length) return result;
  const plans = object(input.plans);
  for (const id of (compare ? ['a', 'b'] : ['a']) as BudgetPlanId[]) {
    const plan = object(plans[id]), items = object(plan.items), rows: BudgetRow[] = [];
    for (const category of tripBudgetCategories) {
      const item = object(items[category.id]), field = `budget-${id}-${category.id}`;
      if (!tripBudgetModes.some(([mode]) => mode === item.mode)) { errors.push({ field: field + '-mode', message: `Plan ${id.toUpperCase()} — ${category.label}: choose how to handle this cost.` }); continue; }
      if (item.mode === 'included') { rows.push({ id: category.id, label: category.label, state: 'included', cents: 0, detail: 'You marked no extra cost / counted elsewhere.' }); continue; }
      if (item.mode === 'omit') { rows.push({ id: category.id, label: category.label, state: 'omitted', cents: null, detail: 'Left out of this budget; this is a partial budget.' }); continue; }
      if (!category.bases.some(([basis]) => basis === item.basis)) { errors.push({ field: field + '-basis', message: `Plan ${id.toUpperCase()} — ${category.label}: choose a valid amount basis.` }); continue; }
      let multiplier = 1, detail = 'Whole-party trip total.';
      if (item.basis === 'room-night') {
        const rooms = numeric(plan.rooms, 15, true);
        if (nights! > 0 && (rooms === null || rooms < 1)) { errors.push({ field: `budget-${id}-rooms`, message: `Plan ${id.toUpperCase()} — rooms: enter a whole number from 1 to 15 for a per-room quote.` }); continue; }
        multiplier = nights! * (rooms ?? 0); detail = `${rooms ?? 0} room(s) × ${nights} night(s).`;
      } else if (item.basis === 'bed-night') { multiplier = people! * nights!; detail = `${people} people × ${nights} night(s). Use only when this same bed rate applies to everyone.`; }
      else if (item.basis === 'party-night') { multiplier = nights!; detail = `Whole party × ${nights} night(s).`; }
      else if (item.basis === 'person-day') { multiplier = people! * days!; detail = `${people} people × ${days} day(s).`; }
      else if (item.basis === 'party-day') { multiplier = days!; detail = `Whole party × ${days} day(s).`; }
      if (multiplier === 0) { rows.push({ id: category.id, label: category.label, state: 'known', cents: 0, detail: 'Zero accommodation nights; no nightly cost added.' }); continue; }
      if (item.amount === '' || item.amount === undefined || item.amount === null || (typeof item.amount === 'string' && !item.amount.trim())) { rows.push({ id: category.id, label: category.label, state: 'missing', cents: null, detail: 'Amount not entered.' }); continue; }
      const amount = numeric(item.amount, 1000000);
      if (amount === null) { errors.push({ field: field + '-amount', message: `Plan ${id.toUpperCase()} — ${category.label}: enter 0 to 1,000,000 CAD, with at most two decimal places; leave unknown amounts blank.` }); continue; }
      rows.push({ id: category.id, label: category.label, state: 'known', cents: Math.round(amount * 100) * multiplier, detail });
    }
    const subtotalCents = rows.reduce((sum, row) => sum + (row.cents ?? 0), 0), reserveCents = Math.round(subtotalCents * reserve! / 100);
    const missingCount = rows.filter(row => row.state === 'missing').length, omittedCount = rows.filter(row => row.state === 'omitted').length;
    const complete = rows.length === tripBudgetCategories.length && missingCount === 0 && omittedCount === 0;
    const totalCents = complete ? subtotalCents + reserveCents : null;
    result.plans.push({ id, rows, complete, subtotalCents, reserveCents, knownWithReserveCents: subtotalCents + reserveCents, totalCents,
      perPersonCents: totalCents === null ? null : Math.round(totalCents / people!), perPersonDayCents: totalCents === null ? null : Math.round(totalCents / people! / days!), missingCount, omittedCount });
  }
  if (errors.length) { result.plans = []; return result; }
  if (!compare) {
    const a = result.plans[0];
    result.comparison.text = a.complete
      ? `Plan A entered whole-trip total: ${formatBudgetMoney(a.totalCents!)}. Add Plan B to compare another budget.${confirmed ? '' : ' Check the CAD, tax and required-fee basis before using the total.'}`
      : `Plan A: ${formatBudgetMoney(a.knownWithReserveCents)} entered so far, with ${a.missingCount} unknown and ${a.omittedCount} left-out categories. Add the remaining costs for a whole-trip total.`;
  } else {
    const [a, b] = result.plans;
    if (!a.complete || !b.complete) result.comparison = { state: 'incomplete', lower: null, differenceCents: null, text: 'Both plans need all seven categories covered before comparing whole-trip totals. Blank and left-out costs are not zero.' };
    else if (!confirmed) result.comparison = { state: 'unconfirmed', lower: null, differenceCents: null, text: 'Confirm the same CAD, tax and required-fee basis below before comparing the two totals.' };
    else {
      const differenceCents = Math.abs(a.totalCents! - b.totalCents!), lower = a.totalCents! < b.totalCents! ? 'a' : 'b';
      result.comparison = differenceCents === 0 ? { state: 'tie', lower: null, differenceCents: 0, text: 'Your entered whole-trip totals are equal. Room type, inclusions, travel and booking terms can still differ.' } : { state: 'different', lower, differenceCents, text: `Plan ${lower.toUpperCase()} has an entered whole-trip total ${formatBudgetMoney(differenceCents)} lower. This compares your entries, not every available offer.` };
    }
  }
  return result;
}
