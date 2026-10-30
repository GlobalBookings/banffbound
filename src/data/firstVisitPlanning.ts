/** Editorial planning steps, without saved state or a travel-readiness score. */
export const firstVisitReviewedAt = '2026-10-29';

export type FirstVisitStepId = 'arrival' | 'base' | 'days' | 'access' | 'quotes' | 'backup';
export interface FirstVisitStep {
  id: FirstVisitStepId;
  title: string;
  task: string;
  links: { href: string; label: string }[];
}

export const firstVisitSteps: readonly FirstVisitStep[] = [
  {
    id: 'arrival', title: 'Join the arrival and return',
    task: 'Work from your actual flight, accommodation entrance and final airport arrival. Join the outward and return legs, including luggage and any local connection.',
    links: [{ href: '/calgary-to-banff/', label: 'Plan the airport journey' }, { href: '/car-free-banff/', label: 'Compare car-free connections' }],
  },
  {
    id: 'base', title: 'Choose a base and room',
    task: 'Compare the overnight location, room layout and facilities you will actually book. Include the journey from that address to each main departure point.',
    links: [{ href: '/towns/', label: 'Compare mountain bases' }, { href: '/book/banff-hotels/', label: 'Compare Banff room choices' }, { href: '/book/lake-louise-stays/', label: 'Compare Lake Louise stays' }, { href: '/blog/banff-hostel-guide/', label: 'Consider a hostel stay' }],
  },
  {
    id: 'days', title: 'Give each day a main outing',
    task: 'Start with one main objective and room for the whole journey. Choose the actual route, resort or activity that fits your group, and keep a different kind of day available.',
    links: [{ href: '/trip-builder/', label: 'Shape an editable itinerary' }, { href: '/ski-day-planner/', label: 'Build a resort day' }, { href: '/learn-to-ski/', label: 'Plan a first lesson' }],
  },
  {
    id: 'access', title: 'Join access, transport and admission',
    task: 'Separate park admission from destination transport, parking and activity tickets. Confirm the actual dates, departure point, check-in and last useful return for the outing you chose.',
    links: [{ href: '/park-pass/', label: 'Work through admission' }, { href: '/shuttle-reservations/', label: 'Plan lake access and returns' }, { href: '/parking/', label: 'Check destination parking' }],
  },
  {
    id: 'quotes', title: 'Compare quotes and confirmations',
    task: 'Use the same people, dates, room nights and booking terms. Keep missing costs unknown, count confirmed inclusions once, and keep the cancellation terms with each dependent booking.',
    links: [{ href: '/trip-cost/', label: 'Compare your actual quotes' }, { href: '/blog/where-to-stay-in-banff/', label: 'Join the stay and journey' }],
  },
  {
    id: 'backup', title: 'Prepare the offline and weather backup',
    task: 'Have the maps, tickets, contacts and equipment you need before leaving connectivity. Review current sources and agree on a different outing if weather, access or the group changes the plan.',
    links: [{ href: '/blog/banff-mobile-connectivity/', label: 'Prepare for connectivity gaps' }, { href: '/packing-list/', label: 'Build a packing checklist' }, { href: '/blog/rainy-day-banff/', label: 'Choose a weather alternative' }, { href: '/conditions/', label: 'Find current source reports' }],
  },
];

const knownStepIds = new Set<string>(firstVisitSteps.map(step => step.id));

export function buildFirstVisitChecklist(value: unknown = []) {
  const selected = new Set(Array.isArray(value)
    ? value.filter((id): id is FirstVisitStepId => typeof id === 'string' && knownStepIds.has(id))
    : []);
  const checkedIds = firstVisitSteps.filter(step => selected.has(step.id)).map(step => step.id);
  const remainingIds = firstVisitSteps.filter(step => !selected.has(step.id)).map(step => step.id);
  const next = firstVisitSteps.find(step => !selected.has(step.id));
  return {
    checkedIds, remainingIds, checkedCount: checkedIds.length, total: firstVisitSteps.length,
    nextId: next?.id ?? null,
    summary: `${checkedIds.length} of ${firstVisitSteps.length} planning steps marked`,
    detail: next ? `Next question: ${next.title.toLowerCase()}.` : 'All six steps are marked. Recheck your actual confirmations and the latest sources before departure.',
    nextHref: next ? `#first-visit-${next.id}` : null,
  };
}
