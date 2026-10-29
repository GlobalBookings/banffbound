# Winter guide review — 28 October 2026

This source review supports `src/data/winterGuideOverrides.ts`. It replaces legacy winter copy through a final content merge rather than editing the large generated-looking legacy modules. The guide metadata has the same review date; it is an editorial review date, not a live condition timestamp.

## Material corrections

- Johnston Canyon: the Parks Canada winter walking page currently reports temporary closures beginning 13 October 2026 for rock-slope remediation, including the main trail to both falls and the P1 facilities. The guide shows a dated alert, does not claim reopening, and distinguishes the Moose Meadows route from the normal main-trail distances.
- Pipestone Loop: Parks Canada's Lake Louise Nordic page currently marks a winter closure for fire management operations. The guide shows a dated alert rather than suggesting it as an open default.
- Route-specific winter tire rules: the existing page incorrectly implied Lake Louise was beyond the BC border. Lake Louise is in Alberta. Parks Canada distinguishes #93N/#93S in Banff (November 1–March 31 or snow/ice-covered) from Highway 1 in Yoho / #93S in Kootenay (October 1–April 30).
- Snowshoeing: removed Taylor Lake, Boom Lake and Chester Lake as generic first-timer recommendations. Replaced with designated winter route choices and explicit avalanche-zone boundaries. Fairview Lookout is an out-and-back; do not suggest its loop as a casual extension.
- Nordic skiing: Spray River is not presented as hazard-free. The official route description identifies avalanche paths 4.5–5 km from its trailhead. Great Divide's distance is explicitly one way; shorter turnarounds are encouraged.
- Skating: removed calendar-based assurances and suggestions that unmonitored natural lakes are suitable beginner destinations. Explicitly distinguishes municipal rinks, the designated Lake Louise skating area and the rest of a natural ice surface. Town guidance says not to skate/walk on the Bow River.
- Heli-skiing: replaces a Banff-centred resort-style pitch with actual BC day bases, operator-approved ability, travel planning, package comparison and cancellation questions. No invented live prices, guaranteed terrain, or implied affiliate relationship with either heli operator.
- Accommodation: distinguishes Sunshine Mountain Lodge's gondola-dependent slope-side stay from Banff or Lake Louise hotels requiring a resort transfer. No current prices or assumed package inclusions.

## Primary and operator sources

| Source | URL | Evidence used |
| --- | --- | --- |
| Parks Canada: winter walking in Banff | https://parks.canada.ca/pn-np/ab/banff/activ/marchehiver-winterwalking/banff | Johnston Canyon closure, normal Lower Falls 1.2 km one way / Upper Falls 2.5 km one way, ice cleats and poles |
| Parks Canada: Banff bulletins | https://parks.canada.ca/pn-np/ab/banff/bulletins | Destination for rechecking current closure notices; guide does not invent an end date |
| Parks Canada: Banff driving | https://parks.canada.ca/pn-np/ab/banff/securite-safety/conduite-driving | Route-specific tire/chains windows, road report links, daylight travel and vehicle kit |
| Parks Canada: Icefields Parkway | https://parks.canada.ca/pn-np/ab/banff/visit/promenadedesglaciers-icefieldsparkway | Weather and avalanche-control closures, snow-tire markings and route planning |
| Parks Canada: Banff snowshoeing | https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/banff | Tunnel Mountain Drive / Johnson Lake distances and winter route designations; shared-trail etiquette |
| Parks Canada: Lake Louise snowshoeing | https://parks.canada.ca/pn-np/ab/banff/activ/raquette-snowshoeing/lakelouise | Louise Creek / Fairview Lookout distances, avalanche warnings, Moraine Road winter endpoint |
| Parks Canada: Banff cross-country ski routes | https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/banff | Tunnel Mountain beginner loops, dog restrictions, Spray River avalanche-path warning |
| Parks Canada: Lake Louise cross-country routes | https://parks.canada.ca/pn-np/ab/banff/activ/skidefond-xcski/lakelouise | Pipestone closure, Great Divide 9.8 km one way, Moraine Lake Road endpoint |
| Parks Canada: winter safety | https://www.parks.canada.ca/home/pn-np/ab/banff/securite-safety/hiver-winter | Natural ice is not monitored or marked by Parks Canada |
| Town of Banff: skating | https://banff.ca/110/Outdoor-Ice-Skating | Named municipal rinks, Fenlands indoor sessions, closure conditions and explicit Bow River warning |
| Banff & Lake Louise Tourism: Lake Louise skating | https://www.banfflakelouise.com/experiences/ice-skating-lake-louise | Skating information, rental providers and planning links |
| Fairmont Chateau Lake Louise: activities | https://www.chateau-lake-louise.com/experience/activities/ | Direct hotel activities information for checking skating arrangements |
| Sunshine: lodge guest directory | https://www.skibanff.com/plan-your-visit/sunshine-mountain-lodge-guest-directory | Gondola-dependent winter access, check-in and current guest instructions |
| CMH Purcell | https://www.cmhheli.com/destinations/purcell | Golden day base, approximate Banff travel orientation, day-program structure and ability descriptions |
| RK Heliski FAQ | https://rkheliski.com/plan-your-trip/frequently-asked-questions/ | Ability-based grouping, equipment and package types, conditional cancellation/refund cases |
| Trail Sports Nordic lessons | https://trailsports.com/cross-country-ski/cross-country-ski-lessons-tours/ | Instruction, separate equipment arrangements, trail pass and parking-pass requirements |

## Integration

```ts
import { winterGuideOverrides, winterGuideMetadata } from '../../data/winterGuideOverrides';
const blogContent = { ...blogContentMain, ...blogContent3, ...winterGuideOverrides };
// Apply metadata overrides wherever blog post titles/descriptions are displayed,
// not just inside a single article, to keep listing cards consistent.
const updatedPost = { ...post, ...winterGuideMetadata[post.slug] };
```

All seven keys already exist in `blogPosts.ts`. The module includes native expandable FAQs and planning checklists. New internal links assume root will create `/learn-to-ski`, `/ski-day-planner`, `/winter-stays` and `/towns` alongside `/winter`.

Existing affiliate IDs used only where relevant: Expedia `camref=1101l3MtWX`, GetYourGuide `partner_id=QW960HO`. These links have `rel="noopener sponsored"` and nearby disclosure. Official operator/source links are direct non-affiliate links. Live prices and booking availability are deliberately left to the booking provider.

## Verification still needed at integration

- Build all article routes after the final merge and metadata wiring.
- Check each new internal path exists and resolves, including the existing hotel directory property slugs.
- Verify the generated article has the new alert/content and review date rather than legacy text.
- Check mobile table overflow and keyboard operation of native `details` elements.
- Condition alerts are dated snapshots. Recheck Parks bulletins before a public release or a later seasonal refresh.
