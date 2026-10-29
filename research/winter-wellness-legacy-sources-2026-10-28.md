# Remaining canonical wellness guides — 28 October 2026

## Bounded inventory and implementation

Existing canonical slugs inspected directly in `blogContent.ts` and `blogPosts.ts`: `banff-hot-springs-history` and `banff-wellness-retreats`. Their distinct history and retreat-planning intent is retained. No redirects are proposed.

The original history body described railway workers' arrival as the beginning of Banff's story; asserted a thousands-of-years water cycle, a particular 1992 closure cause and an overly narrow snail distribution; presented Upper Hot Springs as open year-round and solely naturally heated; and used an unverified CPR quotation and a guaranteed-scenery visit tip. The replacement uses a sourced park chronology, continuing Indigenous significance, bathhouse development, managed water supply, habitat protection and separate current visit information. The unverified quotation, specific Cave and Basin pool-closure year/cause, precise snail distribution and promotional health claims are not repeated.

The original retreat body placed Red Earth at Moose Hotel, treated Kananaskis reservations as universally mandatory, omitted current closures/age restrictions/guest eligibility, and asserted generic yoga, forest-bathing and retreat availability without a published programme. It also promised nearly empty pools and a universal best experience. The replacement corrects venue identities, compares the actual booking decisions, distinguishes hotel/treatment/pool/class products and requires a published programme for an organised retreat.

Files created only:

- `src/data/winterWellnessLegacyOverrides.ts`
- This source note

Root owns all shared imports, content precedence, metadata and sitemap integration. No builds, publishing, existing snapshots, shared pages or data modules were changed by this bounded pass.

## History sources

| Primary source | Application |
| --- | --- |
| https://parks.canada.ca/lhn-nhs/ab/caveandbasin/culture | Railway workers were not the first people to know the thermal springs; wider cultural context |
| https://parks.canada.ca/lhn-nhs/ab/caveandbasin/culture/heritage-legacy | Continuing Indigenous cultural significance; 1883 claim, 1885 reserve, 1887 park legislation and 1930 name; Parks Canada's acknowledgement of disruption |
| https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/histoire-history | Upper Hot Springs development: 1886 early bathhouse, 1904 government facility, 1915 road, 1932 bathhouse, 1961 work and 1995–96 restoration |
| https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/debit-flow | Geological interpretation; hundreds-of-years journey, changing spring flow, supplemental municipal water and winter heat |
| https://www.parks.canada.ca/pn-np/ab/banff/bulletins/895a27bd-1998-4660-9914-ceda7e37d5ce | Thermal spring and snail-habitat entry restrictions; open visitor walkway is distinct from protected water; no narrow distribution or census claim copied |
| https://parks.canada.ca/voyage-travel/experiences/sources-springs | Cave and Basin bathing prohibition and heritage visitor experience |
| https://parks.canada.ca/lhn-nhs/ab/caveandbasin/visit/heures-hours | Seasonal opening days and closure exceptions; link supplied rather than a blanket open-year-round promise |

## Operating notices, checked 28 October 2026

- https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs still displayed the October 13 to early November maintenance closure. No exact reopening date was supplied. The page also states in-person first-come admission, with no online reservations or advance tickets. Both new articles distinguish historic bathing from actual current operation.
- https://knordicspa.com/transformation-journey/ and https://knordicspa.com/faq/ displayed a closure banner for October 13 through 30 at this check. The transformation body announced reopening on October 30 as **Yora Nordic Spa Kananaskis**, while presenting some elements as coming soon and other facilities as already part of the site. The replacement does not treat a future announcement or a generic map as proof that the spa or every element has reopened. This refresh supersedes the earlier source note's observed October 13–29 versus October 13–30 banner discrepancy; copy remains conditional.
- https://www.chateau-lake-louise.com/wellness/basin-glacial-waters/ displayed an October 26–29, 2026 notice reserving hotel access and dining to registered overnight guests. This is dated explicitly, independently of BASIN's continuing overnight-guest eligibility rule.

## Direct spa and hotel sources

| Primary source | Verified identity or booking distinction |
| --- | --- |
| https://redearthspa.com/ | Red Earth at Caribou Lodge, 521 Banff Avenue; 16+ policy; most services' facility inclusions are time-limited and availability-based; contact before arrival |
| https://moosehotelandsuites.com/meadow-spa/ | Meadow Spa & Pools belongs to Moose Hotel & Suites at 345 Banff Avenue; treatments, lounge and private hot pool; no inference that every hotel pool is included |
| https://banffmeadowspa.com/contact-us/ | Meadow third-floor location, elevators from lobby/parkade and direct booking contact; specific access needs still require confirmation |
| https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs/wellness.html | Current Fairmont Spa name, 18+ minimum, defined facility inclusion with qualifying treatments, salon distinction and recommended reservations |
| https://knordicspa.com/faq/ | Kananaskis Village location behind Pomeroy lodge; 18+ access, advance booking recommendation with availability-based walk-ins, arrival-time booking and stairs to outdoor areas |
| https://www.chateau-lake-louise.com/wellness/basin-glacial-waters/ | BASIN at the Chateau is exclusively available to overnight hotel guests; separate resort navigation distinguishes thermal experience, treatments and resort pool |

The guides do not infer that non-hotel guests are eligible for every product. Readers are directed to ask using their actual guest status, age, intended treatment and date. No prices, unpublished packages, provider affiliations, residency, first-person experiences or promised crowd levels are invented. No third-party review sites were used as authority.

## Contract and verification

`winterWellnessLegacyOverrides: Record<string,string>` contains two HTML bodies. `winterWellnessLegacyMetadata` has the established `title`, `description`, `lastUpdated` and `readTime` fields for the same keys, reviewed `2026-10-28`. No FAQPage schema is added; the bodies contain no independent FAQ schema to contradict visible content.

Internal links lead to the reviewed warm-up guides, `/wellness`, `/winter`, `/winter-stays`, `/packing-list`, `/car-free-banff` and the actual Banff/Lake Louise/Kananaskis town slugs. No affiliate URL is added in this bounded pass. Focused static checks cover module parsing, exact original slug presence, content/metadata key agreement, internal routes, HTML tag structure and external link attributes. Root should complete rendered and shared-integration verification after wiring the module.
