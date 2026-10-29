# Internal-linker repair — 2026-10-29

Bounded source repair after upstream `ec7aa1e205b6d6daccd18967cac2c4f5344f7a58`: seven affected paragraphs only. No broad content review, metadata date reset, affiliate changes or agent invocation.

- `blogContent2.ts`: `5-day-banff-itinerary` introduction.
- `blogContent3.ts`: introductions for `big-3-banff`, `banff-big-3`, `johston-canyon`, `johnstons-canyon`; the hiking paragraph in `mt-norquay-road`; the photography paragraph in `ink-pots-banff-alberta`.

The repaired paragraphs restore complete readable sentences and relevant existing planning/route links. Existing reviewed route records support the Norquay/Ink Pots references; no new distance, price, timing, access guarantee or personal-experience claim is introduced. Alias URLs and the remaining article prose are retained.

## Generator and regression

Actual generator: `agents/src/agents/internal-linker.js`, scheduled in `agents/src/index.js`. Previously it matched stripped text, replaced that phrase in raw markup, substituted a full title for a single word, and forced unrelated links into middle paragraphs.

The pure insertion export now requires an exact multiword phrase already present in eligible plain paragraph text, preserves the original visible words, skips inline/protected/existing-link markup, and skips an existing target. No forced fallback remains. The runner rejects all 40 retired slugs using the shared `src/data/redirects.mjs` map, refreshed after checkout. It reads/stages only the actual base renderer inputs `blogContent.ts` and `blogContent3.ts`; unused `blogContent1.ts`/`blogContent2.ts` are excluded. The historical `blogContent2.ts` paragraph repair remains part of this bounded source repair. Literal-function replacement prevents dollar sequences in content from expanding as replacement tokens. Slack loads only inside the explicit runner.

`node scripts/check-internal-linker.mjs` passes: actual pure insertion/parser/write exports; exact phrase and casing preservation; protected/existing markup; repeated insertion; forced-fallback and generic-word regressions; 40 alias exclusions; actual renderer input/staging assertions; literal-dollar writes; seven exact repaired paragraphs. It makes no requests, runs no agent, writes no output and performs no site build. A source guard shipping with the repository does not prove a running agent process has restarted.

## Pending legacy audit — source counts only

After the seven repairs, a read-only scan counted opening `<a>` tags inside an already open anchor **within each raw source paragraph**:

| Legacy chunk | Nested openings | Affected paragraphs |
| --- | ---: | ---: |
| `blogContent1.ts` | 203 | 89 |
| `blogContent2.ts` | 35 | 19 |
| `blogContent3.ts` | 57 | 24 |
| Total | 295 | 132 |

These are historical raw-source counts, not counts of public affected pages: chunks 1/2 are unused by the renderer; chunk 3 also includes redirects and bodies superseded by reviewed overrides. The seven repairs do not resolve this wider backlog. The unused `banff-happy-hour` block in `blogContent2.ts` also contains pre-existing injected key/backtick text in prices at lines 3044, 3048 and 3052, causing direct TS import failure. It remains outside this pass; the focused test exercises the generator's actual raw chunk parser.
