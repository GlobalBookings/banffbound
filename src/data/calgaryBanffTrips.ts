import { banffExperienceGroups, experienceBookingUrl, experienceProducts } from './banffExperiences';

export const calgaryRouteSections = [
  { id: 'city-transfer', title: 'Shuttles and transfers from Calgary city', intro: 'Use the city pickup on your ticket. A departure from YYC is a separate option.', options: [
    ['694465', 'Shared shuttle from Calgary to Canmore or Banff', 'Choose the city pickup and your Bow Valley stop in the booking options.'],
    ['830673', 'Private Calgary-to-Banff transfer', 'Confirm whether the booked pickup is your Calgary address or YYC, plus the vehicle and luggage allowance.'],
  ] },
  { id: 'airport-transfer', title: 'From Calgary Airport (YYC)', intro: 'Choose the actual destination and leave time after landing for bags and the walk to the pickup point.', options: [
    ['860485', 'Fairy Bus shared airport shuttle to Banff', 'Scheduled YYC pickup and a Banff drop-off. Read the terminal meeting instructions.'],
    ['695024', 'Banff Explorer shared airport shuttle to Banff', 'Choose a departure with time to collect luggage and reach the meeting point.'],
    ['461535', 'Vivo Green shared shuttle to Canmore or Banff', 'The listing describes a Calgary airport pickup. Verify your stop and any park pass requirement.'],
    ['430459', 'Shared airport transfer towards Banff and Lake Louise', 'The listing has multiple directions and destinations. Confirm that your selected fare serves the exact address.'],
    ['437643', 'Private YYC-to-Banff transfer', 'Confirm the terminal handoff, flight delay arrangements and room for your luggage.'],
    ['848456', 'Private Calgary-to-Lake Louise transfer', 'Check the Calgary pickup, the precise village or lakeshore address and the group price.'],
  ] },
  { id: 'banff-day-trips', title: 'Banff, Lake Louise and Yoho day trips', intro: 'Match the itinerary to the season. Moraine Lake stops and alternatives vary by tour and date.', options: [
    ['561080', 'Banff National Park and Lake Louise day trip', 'A guided park day with a Calgary starting option. Check the selected meeting point and seasonal stops.'],
    ['789422', 'Lake Louise, Moraine Lake, Emerald Lake and Johnston Canyon', 'The listing names a downtown Calgary pickup. Check the route and substitutions on your date.'],
    ['751175', 'Four stops plus free time in Banff town', 'Compare this downtown Calgary option if time in town matters as well as the lakes and canyon.'],
    ['644038', 'Yoho and Banff lakes with a Johnston Canyon stop', 'A downtown Calgary departure is listed. Check the selected itinerary and time on foot.'],
    ['1004220', 'Four-lake trip with a winter route option', 'Read the dated itinerary to see which lakes are visited and whether Bow Lake replaces a summer stop.'],
    ['1360868', 'Yoho waterfalls and Emerald Lake', 'Choose the Calgary departure if offered for your date. Check how much walking is involved and seasonal access.'],
    ['602050', 'Banff town, the gondola and Johnston Canyon', 'The operator names a Calgary meeting point. Check whether the selected option includes the gondola ticket.'],
    ['741802', 'Banff town and the lakes with a gondola or hot springs option', 'Downtown Calgary pickup is listed. Budget separately for admission where the operator excludes it.'],
    ['1000720', 'Wolfdog sanctuary, Canmore and Banff', 'A downtown Calgary pickup and sanctuary introductory visit are listed. Check the minimum age and return.'],
    ['1122716', 'Railway history through Banff, Morant’s Curve and Field', 'A Calgary pickup option is listed. This is a guided road tour, so check the actual stops.'],
  ] },
  { id: 'parkway', title: 'Icefields Parkway and glacier trips', intro: 'Check whether the glacier or Skywalk is operating and included. A winter tour may take a different route.', options: [
    ['738880', 'Columbia Icefield, Peyto Lake and Crowfoot Glacier', 'Pick the downtown Calgary departure and check whether glacier and Skywalk admission is a separate cost.'],
    ['988784', 'Icefields Parkway waterfalls or Abraham Lake in winter', 'Calgary pickup is listed. Choose the itinerary for your date and check the conditions before travel.'],
    ['1130627', 'Guided Icefields Parkway day with a Skywalk option', 'The listing names a downtown Calgary departure. Check the dated route and admission terms.'],
  ] },
  { id: 'longer-trips', title: 'Private tours and multi-day trips', intro: 'Compare your entire journey, including overnight arrangements, park fees and the final drop-off.', options: [
    ['1393781', 'Private Rockies day in an SUV', 'Choose the Calgary pickup and agree the route and any tickets with the operator.'],
    ['741876', 'Three days around Banff, Yoho and the Parkway', 'Confirm the Calgary starting point, where each day ends and which nights or admission fees are included.'],
  ] },
  { id: 'return', title: 'From Banff or Canmore back to YYC', intro: 'Book the reverse direction separately if it is not already on your ticket.', options: [
    ['858142', 'Shared shuttle from Banff town centre to YYC', 'Check the Banff meeting point and choose a departure with enough time for your flight.'],
    ['695211', 'Shared return shuttle from Banff or Canmore', 'Match the pickup to your overnight address, then check your airline’s required airport arrival time.'],
  ] },
] as const;

const productsById = new Map(experienceProducts.map(product => [product.productId, product]));
export const calgaryTripSections = calgaryRouteSections.map(section => ({
  ...section,
  options: section.options.map(([id, title, note]) => {
    const product = productsById.get(id);
    const group = banffExperienceGroups.find(item => item.productIds.includes(id));
    if (!product || !group) throw new Error(`Calgary trip ${id} needs a catalogue identity and guide`);
    return { id, title, note, booking: experienceBookingUrl(product.productUrl, id), guide: group.canonicalPath };
  }),
}));
export const calgaryTripCount = calgaryTripSections.reduce((total, section) => total + section.options.length, 0);
export const calgaryCatalogueGroups = banffExperienceGroups.filter(group => group.departureIds.includes('calgary') && group.id !== 'airport-shared-departures');
