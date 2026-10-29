# Accessibility planning review — 29 October 2026

Replaces the finite legacy `/accessible-trails` page while retaining its canonical path. The previous page inferred whole-route wheelchair/stroller suitability from general hiking grades and invented free chair loans and a perpetual disability pass. No such loan, pass, device suitability or independently accessible hotel room is asserted by the replacement.

## Primary sources checked

- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking — three published physical profiles (Fenland, Marsh, Minnewanka–Stewart Canyon). The page compares typical/minimum width and typical/maximum longitudinal/cross slopes, with measured surface mixes and obstacles. These are profiles, not live reports or individual device assessments. Exact values are in `src/data/accessibilityPlanning.ts` and are not inferred from route grades.
- https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions and https://parks.canada.ca/pn-np/ab/banff/bulletins — fresh access checks. The Johnston notice is separately linked in the fully reviewed destination guide; its scheduled end is not treated as reopening.
- https://parks.canada.ca/voyage-travel/experiences/accessibilite-accessibility — support-person admission, communication requests and service-animal policy. No universal free visitor admission asserted.
- https://www.banffjaspercollection.com/attractions/banff-gondola/faqs/ — device size limits/loading, building elevators and outdoor-boardwalk distinction. Access to the building does not establish access to the stair route.
- https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs and its `/accessibilite-accessibility` page — dated maintenance notice and facility/transfer/equipment arrangements. No reopening date or individual transfer feasibility is guaranteed.
- https://parks.canada.ca/voyage-travel/experiences/sources-springs and https://parks.canada.ca/lhn-nhs/ab/caveandbasin/activ/activites-activities/introduction-basictour — documented heritage-venue access and introductory-tour format, separate from surrounding trails.
- https://www.banfflakelouise.com/accessibility and https://www.banff.ca/654/Bow-Falls-Trail — short viewing-approach ideas versus the whole Bow Falls route. No unverified path paving or slope claim is retained.
- https://roamtransit.com/about-us/transportation-policies/ — equipment/stop/space questions, not all-device fit or an assisted-transfer promise.
- https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/faq — regular shuttle versus Alpine Start and Moraine parking. The published 2026 season is past; no 2027 dates inferred.
- https://rockymountainadaptive.com/ — actual adapted activity, lesson and equipment enquiry resource, without asserting every resort offers every programme.
- https://www.fairmont.com/en/hotels/banff/fairmont-banff-springs.html — specifically named mobility-accessible roll-in-shower room category. Individual availability/layout remains a direct hotel confirmation; existing property guide and Expedia tracking retained.

## Product and verification scope

All content and the complete three-profile table render without JavaScript. Optional selectors compare two columns, allow a same-profile selection, announce the selection and reset to all profiles. Five native checklist boxes do not save personal data or submit requests. FAQ markup and visible questions use one shared array. Decorative landscape is not claimed to document trail accessibility.

The new guide addresses published visitor features and practical arrangements. It does not establish current path clearance, equipment availability, an individual device verdict or an accommodation booking. Other legacy accessibility claims elsewhere in the blog library remain outside this finite page review.
