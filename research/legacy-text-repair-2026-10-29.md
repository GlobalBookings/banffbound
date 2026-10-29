# Legacy opening-text repair — 2026-10-29

## Exact scope

This is a bounded text/markup correction, **not a full source review**. It changes one opening paragraph in each of 13 currently canonical bodies. Titles, descriptions, original publication dates, full-review dates, redirects, remaining paragraphs and affiliate identifiers are untouched. No current price, venue, hotel operation, access, travel-time or availability claim is introduced.

The renderer resolves `blogContent.ts`, then `blogContent3.ts`, then 12 override maps (52 unique reviewed bodies), followed by bounded hotel-location corrections. Forty aliases redirect before the content renders. Before this repair, 13 of 295 canonical resolved bodies had 34 nested-anchor openings. A separate raw count found three nested openings in main, of which its `banff-bars` introduction is replaced by chunk 3; the two lodge introductions still resolved from main. The rest of the visible corruption resolved from chunk 3. No canonical body was missing, “coming soon,” or under 300 words in this scan; word count alone does not establish useful or verified content.

| Canonical slug | Actual owner | Removed opening-text problem | Replacement scope |
| --- | --- | --- | --- |
| `nightclub-banff` | `blogContent3.ts` | Seven nested links: “Sky Bistro Best Best Nightlife Clubs…” plus personal experience | Evening format, actual event/entry and return planning |
| `banff-nightclubs` | `blogContent3.ts` | Six nested links: “Bear Street Horseback Riding in Score…” plus training fiction | Event, entry requirements and transport |
| `new-places-to-eat-in-banff` | `blogContent3.ts` | Four nested dining titles plus training/visit fiction | Current menu/address, dated opening evidence and reservation policy |
| `banff-clubs` | `blogContent3.ts` | Three nested titles replacing Banff; personal visits | Dancing/music/conversation choice and journey home |
| `banff-bars` | `blogContent3.ts` | Three nested viewpoint/nightlife titles replacing Banff | Bar format, current menu/event and return checks |
| `golden-banff` | `blogContent3.ts` | Two nested restaurant/ski titles replacing Banff; personal experience | Banff photography choices; separate Golden town planning |
| `jasper-town` | `blogContent3.ts` | Two nested road-trip titles replacing Jasper; personal experience | Town/park/travel-day split and reviewed Jasper resource |
| `jasper-national-park` | `blogContent3.ts` | Two nested Jasper titles; personal experience | Journey, stops, base and official conditions sources |
| `deals-in-banff` | `blogContent3.ts` | Nested climbing/wildlife titles replacing Banff; personal experience | Complete dated quotes, inclusions and planning tools |
| `johnsons-canyon` | `blogContent3.ts` | Nested typo-guide titles: “Johnson’s Johnston’s Johnston Canyon…”; personal visits | Distinct endpoints and reviewed canyon/winter guides |
| `calgary-to-jasper` | `blogContent3.ts` | Nested weather/road-trip titles replacing Jasper; personal experience | Journey stages, overnight and reviewed access resources |
| `numtijah-lodge` | `blogContent.ts` | Nested Boundary/Sunshine titles replacing Banff | Actual operator/season/room checks and lake visit versus stay |
| `num-ti-jah-lodge` | `blogContent.ts` | Nested Boundary/Sunshine titles replacing Banff | Current identity/season checks and separate stay planning |

The replacement paragraphs link existing reviewed planning resources, including towns, car-free travel, the trip builder, winter stays, quote calculator, lake/photo planning, conditions, and reviewed Jasper/canyon guides. They do not re-verify the remainder of these articles. `src/data/legacyTextCorrections.ts` records each exact slug, correction date, paragraph and summary for root's partial-correction label. It does not apply bodies or alter metadata.

## Broader review remains

Priority full-review/consolidation proposals remain separate from this repair:

1. **Canyon duplicates:** `johnsons-canyon`, `johston-canyon` and `johnstons-canyon` duplicate the reviewed `johnston-canyon-guide`. Unrepaired paragraphs still claim year-round opening, a six-person maximum and generic reseller shuttle operation/prices. Consider consolidating after checking URL history and exact redirect scope.
2. **Bow Lake lodge variants:** `numtijah-lodge` and `num-ti-jah-lodge` need a current operator/property source review and one deliberate canonical intent. Remaining prose asserts room inventories/rates and conflicting seasonal operation; one promotes natural-lake skating and winter activities. Intro repair does not resolve these claims.
3. **New restaurants:** `new-places-to-eat-in-banff` still needs dated official opening/location evidence for its named venues, current menus and removal of fabricated visits/prices. Do not treat its “12 new…2026” title as verified by this correction.
4. **Nightlife cluster:** `nightclub-banff`, `banff-nightclubs`, `banff-clubs`, `club-in-banff`, `banff-bars` and `banff-nightlife-guide` need intent consolidation and operator/event/late transport review. Current venue identities, addresses, covers, hours and crowd claims are outside this pass.
5. **Jasper cluster:** retain distinct Calgary-origin journey intent only if substantively reviewed; consider consolidating generic Jasper duplicates with reviewed `jasper-alberta`. Remaining `jasper-national-park` prose claims year-round Maligne Canyon access, trail availability and undated rates without the reviewed recovery context.

The new linker source guard prevents the specific nested/existing-link/title-replacement recurrence but does not certify all historical link text or facts. The old raw source counts in `internal-linker-repair-2026-10-29.md` include unused chunks, aliases and superseded bodies; they are not public affected-page counts. No aliases or redirects are added here.

## Focused validation

The edit operation checks each target's actual winning source, requires nested markup in its old opening, and verifies all surrounding text plus affiliate parameters are byte-preserved. Offline in-memory module checks validate the 13 manifest entries/date, balanced new links, removal of first-person claims in the corrected paragraphs, internal-route existence, and zero nested anchors across the 295 resolved canonical bodies. No site build, live publication, account or host action is performed. Root owns label/integration and the reusable resolved-body audit.
