# First-lesson age and discipline handoff — 29 October 2026

Bounded refresh: `src/pages/learn-to-ski.astro`, `src/pages/ski-day-planner.astro`, `src/data/skiPlanning.ts`, new pure browser-compatible `src/data/lessonPlanning.ts`, and `scripts/check-lesson-planning.mjs`. No vendor script, booking submission, live availability, rate feed or eligibility assessment is introduced.

## Current primary product evidence

All sources below were retrieved/reviewed on 2026-10-29. Dates are editorial checks, not current operating or availability timestamps. The chooser compares one learner's age on the lesson date, their sport and whether a daycare-dependent product is wanted. Every example currently lists both ski and snowboard sessions; discipline therefore changes the booking brief, not fabricated age exclusions.

| Primary source | Rules used and limitations |
| --- | --- |
| [Norquay first-time ski and snowboard](https://banffnorquay.com/snow-school/first-time-ski-snowboard/) | First-time youth6–14/adult15+; instruction, rental equipment and magic-carpet-only access. Check in at Snow School before rentals, at least an hour before the booked start. The page lists differing durations and a shorter benefits summary; no session times, prices or universal duration are copied. Confirm the selected session and helmet. |
| [Norquay children and youth](https://banffnorquay.com/snow-school/children-youth/) | Kinder private3–5 is a distinct product. The table explicitly lists ski and snowboard, although introductory prose refers to skis; the card asks the school to confirm sport/session. Lesson-only pricing structure, tickets/rentals add-ons. No discounted-price promise retained. |
| [Lake Louise kids groups](https://www.skilouise.com/ski-snowboard-lessons/kids-lessons/kids-group-lessons/) | Ski and snowboard5–12, Level1 for never-ever. Children's instruction is separate from ticket/rental/lunch choices; do not inherit adult bundle inclusions. Equipment sizes for5–6 are limited. School recommends arriving an hour ahead when renting. |
| [Lake Louise adult/teen groups](https://www.skilouise.com/ski-snowboard-lessons/adult-lessons/adult-group-lessons/) | Adult product starts13. Levels1–2 beginner packages include rentals and Learning Area ticket; Level1 for a first-ever day. Both disciplines listed. Helmet must be confirmed rather than inferred. |
| [Sunshine group lessons](https://www.skibanff.com/lessons/group-lessons) | Kids Kampus6–12/adult-teen13+, both sports. Lift access and rentals are add-ons; kids rentals include helmets, adult rentals exclude them. Village meeting area above gondola; accompanying adults need access too. Current session/cancellation details remain with the school. |
| [Sunshine Tiny Tigers](https://www.skibanff.com/lessons/daycare-tiny-tiger-lessons) | Ski/snowboard lesson add-on3–6 can only be purchased with daycare; daycare's younger minimum is not a lesson minimum. Child ticket included, child ID required, Creekside collection then gondola to village. Accompanying adult needs lift/season/sightseeing access. Equipment and handover/lunch require confirmation. |

## Scope and visitor decisions

Eight complete server-rendered examples are native direct information/booking-option links. There is no claim to list every private/adaptive product. Age13/14 maps to different named product groups by school; these labels do not define legal adulthood. Under-range or daycare-only outside3–6 returns a visible explanation plus all three school's native enquiry links, not “sold out” or “cannot ski”. Blank age shows all examples. Invalid/fractional/duplicate query choices fail to the full comparison with a visible correction message; raw values never become HTML or URLs. Tool input accepts whole ages1–120; this is an input bound, not a school's maximum age.

Query fields are `lesson_age`, `lesson_sport` (`all`, `ski`, `snowboard`) and `lesson_format` (`all`, `lesson`, `daycare`). Apply/reset preserve unrelated URL parameters and hash. Copy explicitly shares age/lesson choices, never checklist ticks or bookings; clipboard denial offers a selectable input. Repeated Astro initialization does not duplicate listeners. The existing local readiness checklist and storage key are preserved.

The day planner no longer treats “family with children learning” as grounds for automatically selecting Norquay (or another resort). With `group=children&resort=auto`, it leaves the resort unresolved, links to age/sport comparison and gives a conditional transport/arrival sequence. A user-selected confirmed resort remains supported. Adult logistical suggestions, current transport sources and original planning buffers otherwise retain their existing scope; general transport evidence remains reviewed2026-10-28 and is labelled separately from the newly checked lesson products.

Focused offline verification covers age boundaries3/5/6/12/13/14/15, under-range and daycare-only empty states, all120 ages across both sports/formats, malformed input and duplicate query restore, real client application/reset/context preservation, clipboard success/denial, repeated initialization, FAQ/template parity, Astro transforms, and all day-planner combinations with family automatic/explicit choices. It does not establish operating dates, a learner's suitability or booking availability. Root owns full build, live verification, CI and lastmod integration.

## Deferred follow-ups (not implemented in this release)

1. Heli comparison: operator-specific transport, own boots/board reservation and refund distinctions. [CMH Purcell](https://www.cmhheli.com/destinations/purcell) describes self-drive and no accommodation/transport inclusion; [RK transportation](https://rkheliski.com/plan-your-trip/transportation/) describes paid transfers subject to minimum guest numbers and separate transport refund limits. Existing sourced heli canonical remains unchanged.
2. Whole-day quote worksheet: compare visitor-entered dated lesson/access/rental/transport totals and prevent double counting bundle inclusions. Existing lift-access calculator intentionally excludes those extras and remains unchanged.
