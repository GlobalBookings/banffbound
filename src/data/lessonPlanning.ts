/** Published product examples, reviewed 2026-10-29. No live availability or suitability assessment. */
export const lessonReviewedAt = '2026-10-29';
export type LessonDiscipline = 'all' | 'ski' | 'snowboard';
export type LessonFormat = 'all' | 'lesson' | 'daycare';
export type LessonChoices = { age: number | null; discipline: LessonDiscipline; format: LessonFormat };
export type LessonProgramme = {
  id: string; resort: string; name: string; minAge: number; maxAge: number | null;
  ageLabel: string; format: 'lesson' | 'daycare'; formatLabel: string;
  disciplines: readonly ('ski' | 'snowboard')[]; includes: string; check: string; url: string;
};

export const lessonProgrammes: readonly LessonProgramme[] = [
  { id: 'norquay-kinder', resort: 'Mt. Norquay', name: 'Kinder private lesson', minAge: 3, maxAge: 5,
    ageLabel: 'Ages 3–5', format: 'lesson', formatLabel: 'Private lesson', disciplines: ['ski', 'snowboard'],
    includes: 'Instruction only; tickets and rental equipment are add-ons. The operator lists ski and snowboard sessions.',
    check: 'Ask Snow School to confirm the chosen discipline, equipment fit and session for a first-timer. Check in before collecting rentals, at least an hour before the lesson.',
    url: 'https://banffnorquay.com/snow-school/children-youth/' },
  { id: 'norquay-youth-first', resort: 'Mt. Norquay', name: 'Youth first-time package', minAge: 6, maxAge: 14,
    ageLabel: 'Ages 6–14', format: 'lesson', formatLabel: 'First-time package', disciplines: ['ski', 'snowboard'],
    includes: 'Lesson, equipment rental and magic-carpet-only ticket. This is restricted learning-area access.',
    check: 'Select the session and discipline; confirm helmet inclusion. Visit Snow School before rentals, at least an hour before the lesson.',
    url: 'https://banffnorquay.com/snow-school/first-time-ski-snowboard/' },
  { id: 'norquay-adult-first', resort: 'Mt. Norquay', name: 'Adult first-time package', minAge: 15, maxAge: null,
    ageLabel: 'Ages 15+', format: 'lesson', formatLabel: 'First-time package', disciplines: ['ski', 'snowboard'],
    includes: 'Lesson, equipment rental and magic-carpet-only ticket. The adult product begins at 15 here.',
    check: 'Confirm the selected session, helmet and ticket limitations. Visit Snow School before rentals, at least an hour before the lesson.',
    url: 'https://banffnorquay.com/snow-school/first-time-ski-snowboard/' },
  { id: 'louise-kids', resort: 'Lake Louise Ski Resort', name: 'Kids Level 1 group lesson', minAge: 5, maxAge: 12,
    ageLabel: 'Ages 5–12', format: 'lesson', formatLabel: 'Group lesson; extras separate', disciplines: ['ski', 'snowboard'],
    includes: 'Instruction; ticket, equipment and supervised lunch are separate choices. Do not assume the adult beginner bundle applies.',
    check: 'Book Level 1 for a first-ever day. Equipment sizes for ages 5–6 are limited: confirm fit before paying. Allow at least the school’s recommended hour when renting.',
    url: 'https://www.skilouise.com/ski-snowboard-lessons/kids-lessons/kids-group-lessons/' },
  { id: 'louise-adult', resort: 'Lake Louise Ski Resort', name: 'Adult/teen beginner package', minAge: 13, maxAge: null,
    ageLabel: 'Ages 13+', format: 'lesson', formatLabel: 'Level 1–2 group package', disciplines: ['ski', 'snowboard'],
    includes: 'Beginner packages include equipment rentals and a Learning Area ticket. The adult age band starts at 13.',
    check: 'Select Level 1 for a first-ever day and confirm helmet and selected access. The school recommends arriving an hour ahead when collecting equipment.',
    url: 'https://www.skilouise.com/ski-snowboard-lessons/adult-lessons/adult-group-lessons/' },
  { id: 'sunshine-tiny-tigers', resort: 'Banff Sunshine Village', name: 'Tiny Tigers lesson with daycare', minAge: 3, maxAge: 6,
    ageLabel: 'Lesson add-on ages 3–6', format: 'daycare', formatLabel: 'Daycare required; lesson extra', disciplines: ['ski', 'snowboard'],
    includes: 'The lesson is an add-on to a daycare booking, rather than a standalone group lesson. A child lift ticket is included; confirm equipment separately.',
    check: 'Bring child ID. Collect the ticket at Creekside before riding to the village; accompanying adults need their own gondola access. Confirm handover and lunch arrangements.',
    url: 'https://www.skibanff.com/lessons/daycare-tiny-tiger-lessons' },
  { id: 'sunshine-kids', resort: 'Banff Sunshine Village', name: 'Kids Kampus group lesson', minAge: 6, maxAge: 12,
    ageLabel: 'Ages 6–12', format: 'lesson', formatLabel: 'Group lesson; extras separate', disciplines: ['ski', 'snowboard'],
    includes: 'Instruction; lift tickets and rentals are booking add-ons. Kids rental packages include helmets; lunch is an optional extra.',
    check: 'Request the never-ever level. Lessons meet in the village above the gondola; accompanying adults also need lift or sightseeing access.',
    url: 'https://www.skibanff.com/lessons/group-lessons' },
  { id: 'sunshine-adult', resort: 'Banff Sunshine Village', name: 'Adult/teen group lesson', minAge: 13, maxAge: null,
    ageLabel: 'Ages 13+', format: 'lesson', formatLabel: 'Group lesson; extras separate', disciplines: ['ski', 'snowboard'],
    includes: 'Instruction; lift tickets and rentals are add-ons. Adult rental packages exclude helmets, so arrange one separately.',
    check: 'Request the never-ever level. Allow for ticket collection, fitting and the gondola to the village meeting area.',
    url: 'https://www.skibanff.com/lessons/group-lessons' },
];

export const lessonSchoolContacts = [
  { name: 'Norquay Snow School', url: 'https://banffnorquay.com/snow-school/' },
  { name: 'Lake Louise Snow School', url: 'https://www.skilouise.com/rentals-lessons/ski-snowboard-lessons/' },
  { name: 'Sunshine Snow School', url: 'https://www.skibanff.com/lessons-rentals/ski-snowboard-school/the-snow-school' },
] as const;

export function parseLessonChoices(input: unknown): { choices: LessonChoices; errors: Partial<Record<keyof LessonChoices, string>> } {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const choices: LessonChoices = { age: null, discipline: 'all', format: 'all' };
  const errors: Partial<Record<keyof LessonChoices, string>> = {};
  if (raw.age !== undefined && raw.age !== '') {
    if (typeof raw.age === 'string' && /^\d{1,3}$/.test(raw.age.trim()) && Number(raw.age) >= 1 && Number(raw.age) <= 120) choices.age = Number(raw.age);
    else errors.age = 'Enter an age in whole years from 1 to 120, or leave age blank to compare every listed programme.';
  }
  if (raw.discipline !== undefined && raw.discipline !== '') {
    if (raw.discipline === 'all' || raw.discipline === 'ski' || raw.discipline === 'snowboard') choices.discipline = raw.discipline;
    else errors.discipline = 'Choose skiing, snowboarding or undecided.';
  }
  if (raw.format !== undefined && raw.format !== '') {
    if (raw.format === 'all' || raw.format === 'lesson' || raw.format === 'daycare') choices.format = raw.format;
    else errors.format = 'Choose a listed lesson format.';
  }
  return { choices, errors };
}

export function matchLessonProgrammes(choices: LessonChoices) {
  return lessonProgrammes.filter(programme =>
    (choices.age === null || choices.age >= programme.minAge && (programme.maxAge === null || choices.age <= programme.maxAge)) &&
    (choices.discipline === 'all' || programme.disciplines.includes(choices.discipline)) &&
    (choices.format === 'all' || choices.format === programme.format));
}

export function lessonBookingBrief(choices: LessonChoices): string {
  const sport = choices.discipline === 'all' ? 'ski or snowboard' : choices.discipline === 'ski' ? 'ski' : 'snowboard';
  const age = choices.age === null ? 'Confirm the learner’s age band' : `For a ${choices.age}-year-old learner`;
  return `${age}, ask for a first-ever ${sport} lesson and confirm equipment fit, ticket access, check-in, cancellation terms and return transport. ${choices.discipline === 'all' ? 'Choose the sport before reserving equipment.' : choices.discipline === 'snowboard' ? 'Confirm snowboard boots and board rental, rather than a ski package.' : 'Confirm ski boots, skis and the school’s equipment instructions.'}`;
}
