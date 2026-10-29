# Photo spots handoff review — 2026-10-28

Only `src/pages/photo-spots.astro` and this source note were changed for this task. All ten destination cards retained; Athabasca Falls explicitly identified as a separate Jasper National Park extension. Unused coordinates/elevations and the broken local sunrise algorithm removed.

## Primary sources

- https://nrc.canada.ca/en/research-development/products-services/software-applications/sun-calculator/ and https://nrc.canada.ca/en/research-development/products-services/software-applications/interpreting-results-sunrisesunset-calculator — official date/location/time-zone calculator; Standard Time tables require adding an hour where daylight saving applies. Theoretical sea horizon and terrain mean apparent local sun arrival/disappearance can differ. Replaced exact today/golden-hour clock with these resources and a mountain-shadow explanation.
- https://parks.canada.ca/pn-np/ab/banff/visit/les10-top10/louise — Lake Louise community/lakeshore and Moraine Lake access. Moraine Road closed to personal vehicles year-round, seasonal permitted transport; Moraine Lake inaccessible in winter due to avalanche hazard. Summer ideas do not become winter routes. No dawn canoe availability or first-shuttle light guarantee retained.
- https://parks.canada.ca/pn-np/ab/banff/visit/promenadedesglaciers-icefieldsparkway — Bow Lake/Peyto viewpoint locality, viewing platform and seasonal Parkway facilities. No fence-climbing or informal viewpoint instruction. Current route checks remain required.
- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions — current Banff trails; inspected recent snow/ice comments but not baked live status into evergreen cards. Sentinel Pass treated as alpine hiking with separate transport, snow, wildlife restrictions and return assessment.
- https://www.banfflakelouise.com/experiences/two-jack-lake — official destination information, seasonal transport/locality. Replaced wading direction with permitted land-based viewpoint; no reflection, wildlife or low-crowd promise.
- https://www.banfflakelouise.com/experiences/vermilion-lakes — official destination reference; no implied ice assessment or guaranteed wildlife/sky conditions.
- https://parks.canada.ca/pn-np/ab/banff/bulletins/06d4ef61-a3c9-4b65-8dfc-66d056252d6c — Johnston Canyon main trail/P1 closure. Existing shared `WinterStatusNotice` imported, card clearly flagged, scheduled end not represented as actual reopening.
- https://parks.canada.ca/pn-np/ab/jasper/activ/experience/sentiers-trails/glaciers-icefields — Athabasca Falls is a Jasper destination; stay on designated trails and behind railings. No Banff coordinates retained. Jasper current bulletins linked separately.
- https://parks.canada.ca/pn-np/ab/jasper/activ/experience/hiver-winter — winter landmarks include Athabasca Falls, still subject to current road/trail conditions. The card is not an instruction to walk onto river ice.
- https://parks.canada.ca/voyage-travel/conseils-tips/trucs-photo-tips — general composition, wildlife space and permit references. Page links the current guidance rather than inventing a wildlife encounter or firsthand experience.
- https://parks.canada.ca/pn-np/ab/banff/info/permis-permit/drone — recreational drone prohibition.
- https://banff.ca/688/Film-Permits — current municipal commercial filming/photography requirements and jurisdiction differences. Direct reader to applicable manager, rather than claiming one permit covers all destinations.
- https://parks.canada.ca/pn-np/ab/banff/securite-safety/conduite-driving and https://511.alberta.ca/ — road and winter access checks. Replaced central-road/bridge photography instructions with pedestrian-space and designated-parking advice.

## Interaction and metadata

- Two progressive-enhancement filters: summer/winter research season and early/day/evening/overcast light ideas. They narrow research suggestions, never establish safe/open access.
- Default renders all ten complete cards, sources, guide links and FAQ without JavaScript.
- Reset restores both selectors; live result count identifies the separate Jasper destination, and a visible empty state handles unmatched combinations.
- Local `[hidden]` rules prevent grid/card display styles from overriding filtering.
- Five native expandable FAQs share the exact strings used in FAQPage schema. SEO title and description no longer promise exact sunrise or guaranteed golden-hour windows.
- No dates/prices/bookings or output clocks are invented; light and composition ideas remain editorial suggestions.
