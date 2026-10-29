# Wildlife field guide and area planner — 29 October 2026

Scope: `/wildlife` and `/wildlife-tracker`, their pure planning data, seven photographic illustrations and shared navigation wording. The separate safety/calendar/spray source register covers the companion three pages. This is an editorial review, not a field survey, live report feed or qualified ecological assessment.

## What the area model means

Ten existing area IDs are preserved. Unsupported daily/common frequencies, search radii, exact-looking animal-location circles, guaranteed elk/sheep encounters and unverified bear-density rankings are removed. A reference point is an editorial, rounded (two decimal place) reference for a named **public visitor area**, not a wildlife observation, habitat boundary, source-verified GPS point or navigation destination. No iNaturalist coordinate enters this model. Cards provide route/access context and a useful landscape objective even without a sighting.

Species selection matches broad habitat categories described by the field guide, not records of an animal at the point. The same pure filter selects both the rendered cards and the map references. Seasons select the available editorial visit plans; they do not certify that a road/trail is open. Moraine is excluded from winter plans. Full cards, source links and visible FAQs remain available without JavaScript; controls and optional third-party map loading are progressive enhancements. Map requests have failure, timeout and retry handling, including partial initialization cleanup.

| Existing ID | Public visitor-area plan | Source scope |
| --- | --- | --- |
| vermilion-lakes | Wetland/land-based viewpoint | Parks hiking guide + habitat introduction |
| bow-valley-parkway | Managed road corridor | Parks parkway page; eastern17km March1–June25 all-travel 20:00–08:00 restriction, separate vehicle/cycling access |
| lake-minnewanka | Montane lake / selected shore route | Parks seasonal restrictions; no inferred unrestricted backcountry extension |
| fenland-marsh | Fenland designated forest/creek route | Parks detailed hiking profiles; no inferred animal occupancy |
| moraine-lake-road | Separate lake/valley/pass plans | Parks Lake Louise/Moraine transport; no private-car or winter access promise |
| cascade-meadows | Cascade Ponds / Bankhead public landscape | Parks closure information; no measured herd frequency |
| icefields-pkwy-north | Waterfowl Lakes public road-area reference | Parks habitat and deer-family context; replaces arbitrary km50–100 bear/goat hotspot |
| spray-valley | Spray River designated trailhead/route | Parks closures; explicitly rejects winter golf-course-road driving workaround |
| lake-louise-area | Village/lakeshore subalpine context | Parks habitat introduction; distinct from ski-resort gondola/transport |
| johnston-creek | Canyon/Ink Pots route choices | Parks detailed hiking profiles; no blanket group-size rule |

## Primary editorial sources

Reviewed 29 October 2026. Facts are original summaries; government text, photography and maps are not reproduced.

- [Parks: animals and montane/subalpine/alpine habitat](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife).
- [Parks: bear family](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/carnivores/ours-bears).
- [Alberta: bear identification](https://www.alberta.ca/know-your-bears): combined features, colour alone unreliable. No response rule inferred from species identification.
- [Parks: deer family](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/ongules/cervids): elk/moose features, Vermilion viewing context, Icefields/Waterfowl moose context. This older family page has a50m elk sentence conflicting with the focused viewing/elk safety pages; safety distances use the focused sources, and encourage more space when behaviour changes. Old population/location statements are not promoted into current counts or guarantees.
- [Parks: goat/sheep family](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/ongules/bovids): coat/horns and habitat; Minnewanka/Norquay background context, not current sightings.
- [Parks: small mammals](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/smallmammals-petitsmammiferes): pika identification/talus. No inherited undated beaver population claim or projected ground-squirrel frequency.
- [Parks: dog family](https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/carnivores/canin-canine): wolf/coyote identification; no current pack location or population inference.
- [Parks: safely view wildlife](https://parks.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space): minimum30m deer/elk/sheep/moose,100m bears/wolves/cougars/coyotes; roadside guidance;403-762-1470 encounters. Shared contacts and preparation are in `wildlifeSafety.ts`.
- [Parks: Bow Valley Parkway](https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/promenade-de-la-vallee-de-la-bow-bow-valley-parkway).
- [Parks: seasonal closures](https://parks.canada.ca/pn-np/ab/banff/visit/fermetures-closures): golf-course road November–May driving closure, route-specific restrictions.
- [Parks: detailed hiking profiles](https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking).
- [Parks: Lake Louise/Moraine access](https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise).

Removed unsupported legacy salmon-season, fixed bear-population,98% spray effectiveness, guaranteed wildlife, winter wolf circuit and specific camera-lens requirements. No child species URLs created merely for search terms. All existing affiliate tracking identifiers remain intact; no tour or hotel inventory inferred from a search link.

## Historical photograph pilot

Seven images are unchanged iNaturalist medium derivatives, manually visually inspected. Both each observation-data licence and each selected image licence were checked independently as CC BY. Creator credit, material/source link, CC BY4.0 link, historical year and unchanged-image note appear with the image. Publisher licence-code mapping is [open source](https://github.com/inaturalist/inaturalist/blob/main/app/models/shared/license_module.rb) (`CC_VERSION=4.0`, CC_BY URL). Photo HTML pages returned403 to automated readers; licensing evidence came from the unauthenticated public observation API and publisher mapping, not an inferred absence of copyright. The exact credited image, derivative URL, bytes/hash and rights are recorded in `wildlife-photo-rights-2026-10-29.json`.

Sources for method: [iNaturalist licensing](https://help.inaturalist.org/en/support/solutions/articles/151000175695), [API practices](https://www.inaturalist.org/pages/api+recommended+practices), [geoprivacy](https://help.inaturalist.org/en/support/solutions/articles/151000169938-what-is-geoprivacy-what-does-it-mean-for-an-observation-to-be-obscured-), [CC BY4.0](https://creativecommons.org/licenses/by/4.0/).

Discovery queried community place66300, which is not certified as the official park boundary. Images are therefore presented as historical **species illustrations**, not geolocated Banff sightings. Only years2015–2024 are exported. Precise dates, observation IDs, user profiles, coordinate fields, locality descriptions and raw payloads are not published. Raw discovery responses remain temporary files outside the repository. Selected medium bytes were checked for GPS metadata (none). Visual screening rejected a bear-track photo, moose droppings, mother/young photographs and unsuitable scans. No claims about current animal locations, availability or official endorsement are made.

## Verification

`node scripts/check-wildlife-planning.mjs`:800 joint filter combinations, prototype/invalid choices, winter exclusion, seven asset hashes/rights records, two Astro transforms, actual client script card/map agreement and failure/timeout/retry/partial-initialization recovery. Companion checks cover12 months, transport/rental choices, contact distinctions and FAQs. Build/live checks are recorded separately after integration.
