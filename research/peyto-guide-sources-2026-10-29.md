# Peyto Lake guide full review — prepared October 29, 2026

## Prepared for the next release; not registered or live

The current release's 67 full reviews must not include this new author work. Only three new files were created:

- `src/data/peytoGuideOverrides.ts`
- `scripts/check-peyto-guide.mjs`
- this source record

No existing files, registry, original corpus, shared models, CI, sitemap, Git, hosting or accounts were changed. Root owns later integration and deployment. A passing author check is not evidence of a published guide.

The sole key is canonical `peyto-lake-guide`; its original publication is **2026-02-11**, verified from `originalBlogPosts` in `blogPosts.ts`. Keep that date. Exports are `peytoGuideOverrides`, `peytoGuideMetadata`, `peytoGuideFaqs` (one five-item array) and `reviewDate` (`2026-10-29`). Metadata supplies the new title/description/read time, review date and an explicit illustrative-image flag/note. The retained hero has not been verified as the lake or as current conditions. The visible FAQs and FAQPage JSON-LD are generated together from the same array.

## Four distinct purposes

The replacement helps visitors choose the main lookout, restricted upper-lot accessible approach, longer Bow Summit hike or separate winter snowshoe outing before joining it to their road journey and base. It explains parking eligibility and facilities without treating an accessible label as a universal promise. The shore trail receives a separate planning handoff, without teaching a descent or presenting it as the ordinary viewpoint visit.

The guide uses native links to the existing parking, Parkway, trail and lake planners. Its meal/stay decisions distinguish Lake Louise village from the lakeshore and ski resort, then link the reviewed Lake Louise stay comparison and Lodge at Bow Lake guide. An explicit local commission note accompanies the accommodation handoff. No new provider IDs, prices, availability assertions, ticket product or booking widget were introduced.

## Current primary sources

Read October 29, 2026. Descriptions and facility symbols are not reports that the road, parking, trail or building is open today.

| Source | Verified scope used |
| --- | --- |
| [Parks Canada detailed hiking profiles](https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking) | Main lookout 0.6 km one way / 30 m gain; Bow Summit 3 km one way / 310 m gain, measured from Peyto parking; separate difficult shore route. |
| [Parks Parkway visitor guide](https://parks.canada.ca/pn-np/ab/jasper/activ/itineraires-itineraries/promenadedesglaciers-icefieldsparkway) | Upper-lot 0.3 km barrier-free approach and accessible-vehicle/bus restriction; Peyto/Bow Summit toilet and accessible-toilet symbols; Parkway park-pass requirement. |
| [Parks commercial vehicle guidance](https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/commerciaux-commercial) | Restricted upper area is first come, first served. Access/parking is not reserved by a generic vehicle or operator designation. Follow site controls. |
| [Parks snowshoeing and winter walking: Lake Louise area](https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise) | Exact entry “Peyto Lake viewpoint (Icefields Parkway)”: 570 m loop, snowshoe icon; unplowed upper-road / north-end trail approach and another viewpoint forest loop. |
| [Official Parkway map PDF](https://pcweb2.azureedge.net/-/media/pn-np/ab/jasper/WET4/pdf/visit/depliants-brochures/ete-summer/Summer-on-the-Icefields-Parkway-Guide-2022.pdf) | Approximate 43 km community reference from Lake Louise village, distinct from the hiking description's 40 km highway-junction reference. No ETA inferred. |
| [Parkway winter maintenance](https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter/pcghiver-ipwinter/pcg-securite-safety-ip) | Current road preparations/closures and the distinction between road avalanche control and recreation terrain. |
| [Parks natural-ice guidance](https://parks.canada.ca/pn-np/ab/banff/activ/patinage-skating) | Natural ice is not monitored for safety or its hazards marked. No threshold, freeze date or on-ice activity advice supplied. |
| [Travel Alberta Peyto listing](https://www.travelalberta.com/listings/peyto-lake-1483) | Glacier-produced fine rock particles and the lake's blue appearance; no fixed best month, colour or photographic-light promise. |
| [Parks current bulletins](https://parks.canada.ca/pn-np/ab/banff/bulletins), [current trail report](https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions), [Alberta 511](https://511.alberta.ca/) | Reader handoffs for the actual travel date. The author review supplies no present open/closed or usable-parking status. |

The 2022 map reference was visually verified against the official distance table already rendered for the Parkway review at `/tmp/banffbound-parkway-pdfs/distance-table.png`. Its community origin must not be combined with the hiking route's junction origin. The current Parkway HTML contains inconsistencies for some other stops; this guide does not copy those unrelated figures or revise the shared distance model.

The winter page's linked [Lake Louise area map PDF](https://pcweb2.azureedge.net/-/media/pn-np/ab/banff/WET4/activ/Cross-Country-Skiing/2025_LL_TearOff_Winter_EN_FULL.pdf) includes a different local **Peyto ski trail**, 2.2 km one way. That is not the Peyto Lake viewpoint on Highway 93N. It is deliberately not used as a lake-viewpoint route/map or linked as navigation for this guide. The web page's specifically named lake-viewpoint entry controls the winter description; the guide does not reinterpret its loop distance as a verified car-to-platform total or a cleared road.

The canonical live trail-report page timed out through the research tool. Therefore no current Peyto trail condition or closure outcome is asserted. A published winter outing, an absent bulletin or an operating-month label is not treated as open approval.

## Shared records retained

The existing exported `trails` records already separate `peyto-lake-viewpoint`, `bow-summit-viewpoint` and `peyto-lake-shore`; the main/shore records have the earlier checked scope and Bow Summit receives the current summer-profile projection. `lakePlanning.ts` already separates a viewpoint visit from the difficult shore route and directs winter visitors to the designated description. `parkingData.ts` already limits the upper area and avoids general overflow or transit promises. `parkwayPlanning.ts` retains Peyto's 43 km / 190 km community-map pair. None required modification.

## Legacy claims removed

The replacement omits fabricated personal drives; a universal 500 m or 10–15 minute accessible approach; the claim that the entire main route is wheelchair accessible; wrong additional Bow Summit figures; fixed crowd-free/parking windows; predictable turquoise or frozen months; a claim of no washrooms; and reliance on seasonal roadside food or fuel without checking the actual service. It also replaces the blanket dismissal of the shore trail with a truthful separate difficult-route handoff, and keeps winter viewing on land rather than inferring lake-ice access.

## Focused check

`node scripts/check-peyto-guide.mjs` **passed** October 29, 2026. This is an offline, in-memory author-model check rather than a full site build. It verifies:

- Exactly one canonical body/metadata key, original February 11 publication and illustrative review metadata.
- Four correctly scoped table rows; valid no-JS HTML, unique section targets and accessible native table/FAQ markup.
- Five exact visible/schema-identical FAQ pairs.
- Eleven primary-source handoffs and thirteen actual existing internal routes, including reviewed trails and the located stay comparison.
- Separate junction/community distances, upper-lot eligibility, actual toilets, winter snowshoe scope and natural-ice limits.
- No invented experience, price, parking certainty, ticket/rating schema, merchant IDs or unrelated local Peyto ski-trail figures.
- Read-only consistency with the existing trail, lake, parking and Parkway record contracts.

Prepared and frozen for root's **next-release** integration. No current-registry or production claim is made.
