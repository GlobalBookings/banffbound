/** Published physical profiles support an individual access conversation, not a device verdict. */
export const accessibilityReviewedAt = '2026-10-29';
export const accessibilitySources = {
  trails: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking',
  report: 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions',
  bulletins: 'https://parks.canada.ca/pn-np/ab/banff/bulletins',
  policy: 'https://parks.canada.ca/voyage-travel/experiences/accessibilite-accessibility',
  roam: 'https://roamtransit.com/about-us/transportation-policies/',
  shuttle: 'https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise/faq',
  gondola: 'https://www.banffjaspercollection.com/attractions/banff-gondola/faqs/',
  springs: 'https://parks.canada.ca/pn-np/ab/banff/sources-banff-springs/accessibilite-accessibility',
};
export const accessProfiles = [
  { id:'fenland', name:'Fenland Loop', distance:'1.9 km loop', surface:'83% hard soil; 15% gravel; 2% decking', width:'162 / 62 cm', grade:'3 / 26%', crossSlope:'3 / 21%', obstacle:'Significant roots; first root obstacle 237 m counterclockwise.', approach:'Count the journey to the trailhead separately. Decide whether a loop leaves enough energy for the return to your base.' },
  { id:'marsh', name:'Marsh Trail', distance:'1.5 km one way', surface:'61% hard soil; 25% gravel; 13% firm soil; 1% decking', width:'287 / 200 cm', grade:'3 / 23%', crossSlope:'4 / 18%', obstacle:'Uneven horse-used trail; mud in wet conditions.', approach:'Cave and Basin is the starting area, but access to the historic building does not establish access along this trail.' },
  { id:'minnewanka', name:'Minnewanka to Stewart Canyon', distance:'1.6 km one way', surface:'49% paved; 47% firm soil; 2% gravel; 2% decking', width:'274 / 100 cm', grade:'5 / 29%', crossSlope:'5 / 31%', obstacle:'Rough paving at the start; rocks and roots from 1 km, with exposure.', approach:'A short day-use-area visit is a different objective from reaching the canyon bridge. Choose the endpoint before arranging the return.' },
];
export const accessFaqs = [
  { question:'Which Banff trail works with my wheelchair or stroller?', answer:'Compare the published surface, narrowest width, maximum grade and cross slope, then discuss your specific device and support needs with Parks Canada. An easy hiking grade, paved section or accessible parking space does not describe the whole route. Snow, ice and temporary works can change access.' },
  { question:'Is the Banff Gondola boardwalk wheelchair accessible?', answer:'The operator publishes accessible loading and elevators between the four summit-building levels. Its summit boardwalk has 368 shallow stairs each way and is not wheelchair accessible. Check device size limits and your actual device with the operator before booking.' },
  { question:'Is there a free national park pass for visitors with disabilities?', answer:'Parks Canada provides free admission and program access for a needed support person accompanying a visitor who depends on that support. This is not a blanket free visitor pass. Parks says no documentation or Access 2 Card is required for this support-person policy; other admission charges can still apply.' },
  { question:'Can I use an accessible shuttle to Lake Louise or Moraine Lake?', answer:'For its regular reserved service Parks Canada publishes an accessible vehicle on request at the Lake Louise Park and Ride with a purchased ticket. Confirm equipment and party arrangements. The published 2026 season ended October 12; it does not establish a 2027 timetable. The 2026 Alpine Start service had no accessible vehicle. Roam is a separate service.' },
  { question:'Where can I arrange adaptive equipment or a lesson?', answer:'Rocky Mountain Adaptive publishes adapted activities, lessons and equipment rentals. Ask about the specific date, venue, equipment, instructor and support before paying. This guide does not verify free all-terrain chair loans at visitor centres.' },
];
