# Canonical Banff viewpoints guide — 28 October 2026

Created only `src/data/viewGuideOverride.ts` and this source note. Root owns shared imports/metadata and the `banff-views` → `banff-view` consolidation.

The replacement removes fabricated first-person claims, stale blanket access promises and the plural body's nested-anchor corruption. It describes seven actual choices rather than promising fifteen. It distinguishes town views, separate lake excursions, seasonal transport, designated winter routes and gondola operations. No prices, fixed light guarantees, unmonitored ice directions or off-trail photo instructions are used.

## Verified sources

| Source | URL | Application |
| --- | --- | --- |
| Town: Surprise Corner | https://www.banff.ca/1110/Surprise-Corner | Location, viewing platform, small parking lot, explicit prohibition on unstable cliff access |
| Town: Bow Falls Trail | https://banff.ca/654/Bow-Falls-Trail | Winter clifftop-section closure; summer approach must not be assumed fully open in winter |
| Town: water safety | https://www.banff.ca/1386/Water-Safety | Stay off Bow River ice and keep river hazards in view when planning town photography |
| Banff & Lake Louise Tourism: Vermilion Lakes | https://www.banfflakelouise.com/experiences/vermilion-lakes | Lake-view destination; no promise of reflections or wildlife encounters |
| Parks Canada: Lake Louise and Moraine Lake | https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise | Distinct destinations and date-specific lake access/transport planning |
| Parks Canada: seasonal restrictions | https://www.parcs.canada.ca/pn-np/ab/banff/visit/fermetures-closures | Personal vehicle restriction on Moraine Lake Road, subject to the published rules/exceptions |
| Parks Canada: Lake Louise winter routes | https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise | Designated winter routes, avalanche warnings for tea-house trails and Moraine road beyond its winter viewpoint |
| Parks Canada: winter safety | https://www.parks.canada.ca/home/pn-np/ab/banff/securite-safety/hiver-winter | Winter conditions, thin ice and changing access; old tracks do not establish safe travel |
| Banff Gondola: hours/location | https://www.banffjaspercollection.com/attractions/banff-gondola/hours-location/ | Mountain Avenue/Sulphur Mountain geography, date-dependent operations, last uploads and changeable hours |
| Parks Canada: wildlife viewing | https://www.parcs.canada.ca/pn-np/ab/banff/visit/faune-wildlife/espace-space | Do not approach, follow, entice or disturb wildlife for a photograph |
| Parks Canada: drones | https://www.parks.canada.ca/pn-np/ab/banff/info/permis-permit/drone | Recreational drone prohibition |

## Integration and checks

- `viewGuideOverride` exports a `Record<string,string>` keyed only by the existing singular `banff-view` slug.
- `viewGuideMetadata` follows the existing override shape: `title`, `description`, `lastUpdated`, `readTime`.
- Review date is 2026-10-28; it is not a live visibility or access timestamp.
- Links to `/photo-spots`, `/trip-builder`, `/winter` and `/towns/` are included as requested.
- Root should merge after the legacy body modules, include the metadata in the shared post-export merge, and add the plural redirect.
- Static content/tag checks were performed. No shared-file edits or builds were performed.
