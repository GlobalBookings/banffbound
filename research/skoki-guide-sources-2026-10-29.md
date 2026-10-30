# Skoki Lodge guide — full source review, October 29, 2026

## Chosen canonical and initial state

`skoki-lodge-guide` was checked against the actual resolved registry before authoring. It was **not reviewed** in the 72-guide registry. Original publication is **2025-12-27**. Its raw owner is `src/data/blogContent.ts`; the resolved body was approximately527 words and had **no fragment IDs**, no redirect target and no inbound aliases. Canonical merge order is main body, chunk3, then reviewed bodies, followed by the existing bounded hotel-location corrections.

The new dedicated `skokiGuideOverrides.ts` exports `skokiGuideOverrides` and `skokiGuideMetadata`, keyed only by that canonical; `skokiGuideFaqs` is one five-entry array, used once for both visible FAQ and FAQPage, and `reviewDate` is `2026-10-29`. Metadata omits publication fields. New meaningful IDs are `getting-there`, `winter-access`, `summer-access`, `the-lodge`, `what-to-do`, `booking`, `what-to-bring`, `skoki-questions`, `skoki-sources`.

Registration, shared metadata, source counts, booking-context helper, workflow, tools and release verifier are root's scope. No shared source owner, Git operation or PR14 receipt changed. The initial raw text remains intact behind the full override.

## Material corrections

- The old article assigns11km and775m of gain to Fish Creek parking, with a fixed hiking range. It does not account for the upper trailhead, guest staging or differing endpoints. The replacement compares explicit source bases and supplies no arrival-time guarantee.
- The old generic summer/winter windows, $250–350 rate and universal two-night minimum are removed. Published future dates, actual room quotes, fees and current minimums are separate.
- “The lodge provides everything”, daypack-only wording, staff carrying all supplies and implied included wine are replaced with a clear personal-pack, equipment and quote checklist.
- Winter travel is separated from summer hiking. No frozen-lake crossing line, novice route approval, guaranteed track, automatic guide, emergency-shelter claim or zero-avalanche assertion is published.
- The cabin/privacy/night-sky recommendation is removed. The lodge's actual room categories and rustic facilities are described without inventing a surveyed entrance, suitability or availability.
- Current bear **warning** is not relabelled a closure. Future bookings do not establish current or future trail access.
- Conflicting summary and dedicated cancellation wording is exposed. Neither a weather cancellation nor lodge cancellation is represented as an automatic cash refund.

## Primary sources and exact scope

| Source | Fact or boundary used |
| --- | --- |
| https://skokilodge.com/ | Current operator identity and backcountry setting; winter announcement. Promotional “all levels” wording and visitor quotations are not a capability assessment or personal evidence. |
| https://www.skoki.com/rates/ | Published winter December18,2026–April5,2027 and summer June18–October13,2027; meals included, fees/taxes extra; actual quote/booking route. No numeric rate or unconditional room availability copied. Cabin occupancy wording differs from the accommodation page, so the selected category's actual party/minimum needs confirmation. |
| https://www.skoki.com/location/ | Seasonal preparation links, operator route context and direction to current Parks/Avalanche Canada information. No coordinates, turn-by-turn path, lake crossing or inferred safe detour reproduced. |
| https://skokilodge.com/accommodation/index.php | Main lodge plus three guest cabins/22guest capacity; upstairs lodge rooms, named bed configurations, bedding, wash basins, outhouses, meal format and alcohol sold separately. General no-electricity wording is not used to deny the preparation sheets' limited charging provision. No room inventory or guaranteed access claimed. |
| https://skoki.com/FAQ/index.php | Ordinary meals for overnight guests; no included guide or pack delivery; equipment enquiry and seasonal-staging context. Its winter Fish Creek/shuttle/lift paragraph differs from the newer linked winter sheet, so no obsolete parking/lift procedure is copied as the current universal arrangement. |
| https://www.skoki.com/contact/ | Native lodge enquiry route. No email, form, account or booking action was performed. |
| https://www.skoki.com/pdf/Skoki-Info-Sheet-Winter.pdf | Current linked winter sheet: lift-based staging, experience expectation, independent guiding/pack carriage and rescue responsibility. Its unsupported-as-a-universal-safety-rule “no avalanche paths” sentence is not repeated; current terrain/forecast and competence checks remain separate. No exact lift manoeuvres, ice-crossing line or desk-floor directions published. |
| https://skokilodge.com/pdf/Skoki-Info-Sheet-Summer.pdf | Upper trailhead reached through check-in and Fish Creek shuttle; missed connection adds4km. Return transfer is a separate arrangement. No guaranteed early pickup or current seat promised. Published snack/day-tea service does not make the lodge a general meal stop or rescue base. |
| https://www.skoki.com/rates/cancellation.php | Dedicated terms distinguish guest disruption exclusions, lodge cancellation, credits and deferral. Rates/FAQ/prep summaries have more optimistic refund wording. Readers are directed to confirmation of the governing terms, not promised a refund. No legal interpretation or insurance coverage assurance. |
| https://www.pc.gc.ca/apps/dfhd/page_nhs_eng.aspx?i=90606&id=4 | Parks heritage record: opened1931, designated1992; rustic construction and early ski tourism. Historical building inventory is not substituted for current guest-room inventory. |
| https://www.parks.canada.ca/pn-np/ab/banff/info/gestion-management/skoki |2020management statement's approximately14.5km trailhead reference. Used as heritage-location context, not as current check-in, operating-licence status, transport or route guarantee. |
| https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking | Deception Pass summer endpoint:11.5km one way from Fish Creek. It is not the lodge distance or a winter travel recommendation. No assumption that the room season means snow-free hiking. |
| https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/avalanche/echelle-ratings/eeta-ates-2/simple-1 | Lists Skoki via Boulder/Deception under **Simple, Class 1**. This terrain classification is not zero risk, a daily forecast, a maintained trail or beginner approval. |
| https://www.parcs.canada.ca/pn-np/mtn/securiteenmontagne-mountainsafety/hiver-winter/randonnee-touring | Training, current forecasts, transceiver/shovel/probe, skills and flexibility for backcountry travel. No month is labelled an automatic suitable day. |
| https://parks.canada.ca/pn-np/ab/banff/securite-safety/hiver-winter | Winter hazards and unmonitored natural ice. No thickness threshold or marked route inferred for the lodge approach. |
| https://parks.canada.ca/pn-np/ab/banff/bulletins | Current index lists the Skoki bear warning; read again for actual-date restrictions. Other campsite, water and temporary-control notices do not become blanket lodge closures. |
| https://parks.canada.ca/voyage-travel/securite-safety/bulletins/74085a8f-8138-410f-8956-83929a79d6b8 | Bear warning issued September2,2026 covers the Skoki trails, including lodge area and Deception Pass. The bulletin's stale generic page-modified footer is not its issue date. No assertion that the warning has ended or permanently defines all future travel. |

The `skokilodge.com` operator homepage links its `www.skoki.com` booking, contact, location and rates pages; these are publisher-linked domains, not guessed alternatives. A failed initial winter-PDF fetch on the first hostname was resolved using the document linked from the operator's `www.skoki.com` location page. No authentication, paywall bypass or old2018sheet substituted.

## Retained referrals and authentic handoffs

The two exact inherited authored destinations remain:

- https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX
- https://www.getyourguide.com/banff-l284/?partner_id=QW960HO

They are disclosed as affiliate **searches for a separate Banff portion**, not Skoki rooms, guiding, gear/pack transport or a lodge package. The actual Skoki booking/enquiry handoff remains the official operator. No new provider, property ID, offer or commission term is invented. Root will use a Lake Louise area context for shared fallback slots, separately labelled as frontcountry searches; that is outside this module's authored URLs.

Internal handoffs cover reviewed Deception Pass summer data, touring readiness, beginner lessons, packing, Lake Louise stays, car-free connections, dated roads and winter bases. No Banff ski-day tool is claimed to cover the self-propelled lodge journey.

## Validation and remaining scope

`node scripts/check-skoki-guide.mjs` checks raw publication before metadata merging, one substantial canonical body and metadata, five identical visible/schema FAQs, exact retained referral URLs and IDs, real canonical internal routes/fragments, primary sources, separate winter/summer/start/endpoint/skill/cancellation sections and illustrative-image contract. Negative fixtures reject the inherited price/distance basis, novice/zero-risk/guide/pack/refund/rescue/included-equipment claims, ice-crossing directions, missing body gates, changed seasons, FAQ divergence, nested anchors and publication resets. No site build or network.

The hero image's identity and capture conditions remain unverified: `imageIsIllustrative: true` and an explicit image note allow shared rendering to omit Article photographic identity. No licence, named lodge, room or approach identity is inferred from the filename.

This full review does not claim that other raw Skoki references are corrected. The reviewed ski-touring override takes precedence over its old raw approach prose. Other directly rendered references should be evaluated through the registry before a future repair; no unrelated guide was edited or marked fresh here.
