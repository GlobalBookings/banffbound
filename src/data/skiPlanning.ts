/** Logistical suggestions, not current operating information or terrain advice. */
export const skiResorts = {
  norquay: {
    name: 'Mt. Norquay',
    lessonUrl: 'https://banffnorquay.com/snow-school/',
    transportUrl: 'https://banffnorquay.com/shuttle-service/',
    officialUrl: 'https://banffnorquay.com/',
    checkin: 'For a first-time package, Norquay asks you to check in at Snow School at least an hour before the lesson, before collecting rentals. Your booking confirmation takes priority.',
    arrival: 'Plan to reach the base 90 minutes before a lesson if collecting rentals. This is our suggested buffer, not a resort check-in requirement.',
  },
  louise: {
    name: 'Lake Louise Ski Resort',
    lessonUrl: 'https://www.skilouise.com/rentals-lessons/ski-snowboard-lessons/',
    transportUrl: 'https://www.skilouise.com/getting-here/',
    officialUrl: 'https://www.skilouise.com/',
    checkin: 'Collect or activate your ticket and allow time for rental fitting. If you booked a lesson, check the desk and meeting point in your confirmation; Lake Louise recommends arriving an hour ahead when you need rental equipment.',
    arrival: 'Allow 90 minutes at the base before a lesson when collecting rentals; add a larger buffer on busy dates. This is a planning estimate.',
  },
  sunshine: {
    name: 'Banff Sunshine Village',
    lessonUrl: 'https://www.skibanff.com/lessons-rentals/ski-snowboard-school/the-snow-school',
    transportUrl: 'https://www.skibanff.com/plan/getting-here/free-shuttle',
    officialUrl: 'https://www.skibanff.com/',
    checkin: 'Follow your package instructions at Creekside Lodge at parking-lot level, then allow roughly 20 minutes on the gondola plus queues and walking. Lesson meeting points are up in the village.',
    arrival: 'Allow roughly 2 hours at the base before your first lesson if collecting tickets and rentals, then riding the gondola. This is our conservative planning allowance, not a guarantee.',
  },
} as const;

export type ResortKey = keyof typeof skiResorts;
export type SkiPlanChoices = {
  ability: 'first' | 'beginner' | 'intermediate' | 'advanced';
  base: 'banff' | 'canmore' | 'louise';
  resort: 'auto' | ResortKey;
  transport: 'shuttle' | 'drive';
  group: 'adults' | 'children' | 'mixed';
};

export const defaultSkiChoices: SkiPlanChoices = {
  ability: 'first', base: 'banff', resort: 'auto', transport: 'shuttle', group: 'adults',
};

export function makeSkiDayPlan(choices: SkiPlanChoices) {
  const chosen: ResortKey = choices.resort !== 'auto' ? choices.resort
    : choices.base === 'louise' ? 'louise'
      : choices.ability === 'first' || choices.group === 'children' ? 'norquay' : 'sunshine';
  const resort = skiResorts[chosen];
  const reason = choices.resort !== 'auto'
    ? 'You chose this resort. The plan adapts the arrival and transfer steps to that choice.'
    : choices.base === 'louise'
      ? 'Start by checking your local resort: a Lake Louise base keeps the first transfer simpler. Confirm your exact hotel pickup or road route.'
      : choices.ability === 'first' || choices.group === 'children'
        ? 'Start by checking Norquay’s first-time lesson availability. For a Banff or Canmore base it is a practical option for a lesson-focused day. Another resort may fit better if the lesson time or age group is unavailable.'
        : 'Start by checking Sunshine’s availability for a full resort day. It adds a gondola transfer, so build that into the morning. Your chosen terrain must still match your ability and conditions.';
  const isLearner = choices.ability === 'first' || choices.ability === 'beginner';
  const transfer = choices.transport === 'drive'
    ? 'Check road and resort access conditions before departure. Confirm suitable winter equipment with your rental company, allow for parking and walking, and keep the evening flexible if weather deteriorates.'
    : choices.base === 'canmore'
      ? 'Do not assume a Banff ski shuttle picks up in Canmore. Confirm a direct service or a separate Canmore–Banff transfer, then check that the connection reaches the resort early enough. If it does not, change the lesson time or arrange another transfer.'
      : choices.base === 'louise' && chosen !== 'louise'
        ? 'Do not assume a direct Lake Louise hotel shuttle to this resort. Ask the operator to confirm the full outbound and return connection before booking the lesson; a Banff connection may make an early lesson impractical.'
        : 'Open the current operator timetable and match your exact pickup stop to the required arrival time. Check eligibility, outbound capacity and the final return. Ski shuttle and public transit services are different.';
  const group = choices.group === 'children'
    ? 'Book by each child’s age, discipline and ability. Confirm supervision, lunch, toilet support and parent collection rules. Allow an extra fitting and toilet break before meeting the instructor.'
    : choices.group === 'mixed'
      ? 'Give learners and confident skiers separate morning plans. Agree an indoor lunch meeting point and a return time; do not take a beginner onto harder terrain to keep the group together.'
      : 'Book each person into their actual ability level. Keep a shared indoor meeting point and return plan even if you split up during the day.';
  const session = isLearner
    ? 'Take the booked lesson and practise only on terrain your instructor recommends. A learning-area ticket can have limited lift access; ask before joining friends elsewhere.'
    : choices.ability === 'advanced'
      ? 'Warm up on familiar open terrain and read the current lift/trail report. Advanced ability does not override closures, freeride-zone entry rules or changing conditions. This planner does not select runs or assess avalanche safety.'
      : 'Warm up on easier open terrain, then choose runs using the current trail map and your own ability. Ask resort staff or book a lesson if the snow, visibility or grading feels unfamiliar.';
  return {
    key: chosen, resort, reason, transfer, group, session,
    timeline: [
      { when: 'The evening before', title: 'Make the bookings line up', text: 'Confirm lesson time, correct ticket access, rentals and return transport. Save confirmations and the current resort map offline.' },
      { when: 'Before leaving your base', title: 'Check the day, then travel', text: transfer },
      { when: isLearner ? 'Before your lesson' : 'Before your first run', title: 'Build in an arrival buffer', text: isLearner ? resort.arrival : 'Allow time for ticket activation, rental fitting, walking and any gondola queue. Check actual opening hours rather than assuming an early lift.' },
      { when: 'Check-in & fitting', title: 'Follow your booking instructions', text: resort.checkin },
      { when: 'Morning session', title: isLearner ? 'Learn at your own pace' : 'Warm up before exploring', text: session },
      { when: 'Lunch & afternoon', title: 'Keep a warm-up break', text: 'Eat indoors, check how everyone feels and agree the afternoon plan. Shorten the day for cold, fatigue or poor visibility. A museum, café or another indoor stop in town can be a good alternative; check hours.' },
      { when: 'Before the final return', title: 'Leave time to get off the mountain', text: chosen === 'sunshine' ? 'Check the last gondola download and your bus separately. Allow time to reach the gondola, travel down, return rentals and get to the pickup. Do not build a first day around skiing the ski-out.' : 'Check lift closing and the last bus separately. Leave time to descend within your ability, return rentals and reach the pickup; choose an earlier return if conditions worsen.' },
    ],
  };
}
