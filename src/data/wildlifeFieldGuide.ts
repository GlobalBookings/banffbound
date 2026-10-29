import type { WildlifeZone } from './wildlifeZones';
export const wildlifeFieldSources = {
  bears:'https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/carnivores/ours-bears',
  bearId:'https://www.alberta.ca/know-your-bears',
  deer:'https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/ongules/cervids',
  sheep:'https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/ongules/bovids',
  small:'https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/smallmammals-petitsmammiferes',
  dogs:'https://parks.canada.ca/pn-np/ab/banff/nature/faune-wildlife/mammal/carnivores/canin-canine',
};
export interface WildlifeSpecies {
  id:string; name:string; scientific:string; habitat:WildlifeZone['habitat'];
  identify:string; ecology:string; viewing:string; source:string; photo?:string;
}
export const wildlifeSpecies:WildlifeSpecies[] = [
  { id:'elk',name:'Elk · wapiti',scientific:'Cervus canadensis',habitat:['forest','wetland'],photo:'elk',
    identify:'Look for a dark neck, tan rump and large body. Bulls carry branching antlers; an elk without antlers is still an elk.',
    ecology:'Elk use the valley landscape and may be close to developed areas. Mothers protect calves in spring; fall mating behaviour needs extra caution.',
    viewing:'Parks identifies Vermilion Lakes Drive as elk habitat. Choose a public stopping place; a town or roadside animal still needs space.',source:wildlifeFieldSources.deer },
  { id:'grizzly',name:'Grizzly bear',scientific:'Ursus arctos',habitat:['forest','alpine'],photo:'grizzly',
    identify:'A prominent shoulder hump, dished facial profile and small rounded ears are useful clues. Coat colour alone cannot identify a bear.',
    ecology:'Grizzlies use large landscapes and changing seasonal foods, including roots and berries. Protecting connected habitat is part of protecting the species.',
    viewing:'A bear may be encountered while travelling, but there is no current location or probability estimate here. Stay in your vehicle at roadside encounters and move on.',source:wildlifeFieldSources.bearId },
  { id:'black-bear',name:'Black bear',scientific:'Ursus americanus',habitat:['forest'],photo:'black-bear',
    identify:'Usually lacks the prominent grizzly shoulder hump and has a straighter face profile. Black bears can also have brown or cinnamon coats.',
    ecology:'Forest cover is important habitat. Both bear species change where they feed as food becomes available.',
    viewing:'Identify with binoculars or a photograph taken from an appropriate distance. Never move closer to check a feature, and do not base encounter response on colour.',source:wildlifeFieldSources.bearId },
  { id:'bighorn-sheep',name:'Bighorn sheep',scientific:'Ovis canadensis',habitat:['alpine','forest'],photo:'bighorn-sheep',
    identify:'Brown fur and a pale rump. Rams have heavy curling horns; ewes have shorter, narrower brown horns.',
    ecology:'Grazing slopes and nearby rocky escape terrain matter. Their seasonal range can include lower slopes and alpine meadows.',
    viewing:'Parks names the Minnewanka area and Norquay Road among viewing areas. This is background context, not a report that sheep are present today.',source:wildlifeFieldSources.sheep },
  { id:'mountain-goat',name:'Mountain goat',scientific:'Oreamnos americanus',habitat:['alpine'],photo:'mountain-goat',
    identify:'A white coat, beard and narrow black horns distinguish a mountain goat from a brown bighorn sheep.',
    ecology:'Rugged, steep habitat can keep goats far from ordinary visitor routes. A distant animal is a reason to use optics, not to scramble closer.',
    viewing:'Scan from a designated viewpoint or trail when the route itself suits the group. Do not turn a short stop into an unplanned off-trail approach.',source:wildlifeFieldSources.sheep },
  { id:'moose',name:'Moose',scientific:'Alces alces',habitat:['wetland','forest'],photo:'moose',
    identify:'Long legs, a large drooping muzzle and a shoulder hump. Mature bulls may carry broad, flattened antlers.',
    ecology:'Moose are a different animal from elk. Wetland and forest context helps with identification but does not establish occupancy.',
    viewing:'Parks points to the Icefields Parkway near Upper Waterfowl Lake and north of Saskatchewan Crossing. Do not plan a guaranteed townsite moose stop.',source:wildlifeFieldSources.deer },
  { id:'pika',name:'American pika',scientific:'Ochotona princeps',habitat:['alpine'],photo:'pika',
    identify:'A small round body, rounded ears and no obvious tail. Its sharp call can draw your attention before you spot the animal.',
    ecology:'Pikas use rock slides and talus. They are relatives of rabbits, rather than ground squirrels.',
    viewing:'Look from the designated route. Do not clamber across rocks after a call, bait an animal or disturb stored vegetation.',source:wildlifeFieldSources.small },
  { id:'wolf',name:'Wolf',scientific:'Canis lupus',habitat:['forest'],
    identify:'A large dog-like animal with long legs and large feet. Colour varies; a dark coat alone is not an identification.',
    ecology:'Wolf packs use broad landscapes and their numbers change. This guide does not publish pack locations, den sites or a winter viewing circuit.',
    viewing:'Keep at least 100 metres away. Do not follow, call to or lure a wolf; report an encounter to Banff Park Dispatch once you are safe.',source:wildlifeFieldSources.dogs },
  { id:'coyote',name:'Coyote',scientific:'Canis latrans',habitat:['forest','wetland'],
    identify:'A more slender muzzle and prominent pointed ears compared with a wolf. Use the combination of features rather than apparent size alone.',
    ecology:'Coyotes are part of the valley ecosystem, including developed areas. Food rewards can change their behaviour.',
    viewing:'Keep at least 100 metres away, control food and keep dogs leashed. A coyote near town remains a wild carnivore.',source:wildlifeFieldSources.dogs },
];
export const wildlifeSpeciesHabitats = Object.fromEntries(wildlifeSpecies.map(s=>[s.id,s.habitat]));
export const wildlifeTrackerFaqs = [
  { question:'Is this a live wildlife sighting map?',answer:'No. The map contains rounded reference points for public visitor areas. It has no live bear, elk or wolf locations, recent-report feed, ranger tracking or measured sighting frequency. The filters compare habitat and visit plans; they do not predict where an animal is now.' },
  { question:'Where can I see bears and elk in Banff?',answer:'Parks describes bear habitat across the park and names Vermilion Lakes Drive as an elk-viewing area. Choose an ordinary landscape or trail visit, check restrictions and treat any encounter as incidental. No area guarantees a sighting. Do not follow an animal or approach it to improve a view.' },
  { question:'Why does a species filter show several areas?',answer:'It matches broad habitat types described in the field guide, such as forest or wetland. It is not a list of observations at those points. Combine the season and visit-style filters to compare access planning, then read the chosen area’s route and restriction notes.' },
  { question:'Can I visit the Bow Valley Parkway at dawn or dusk?',answer:'The eastern 17 kilometres has an annual March 1–June 25 restriction on all travel from 8 p.m. to 8 a.m. Separate vehicle and cycling arrangements also apply. Check the current Parks Canada page before planning a visit; wildlife activity does not override a closure.' },
  { question:'Where should I report a wildlife encounter?',answer:'Once safe, report bear, cougar, wolf and coyote encounters to Banff Park Dispatch at 403-762-1470. Call 911 for an emergency. Posting a photo or selecting a marker on this guide does not notify Parks Canada.' },
];
export const wildlifeGuideFaqs = [
  { question:'How can I tell a grizzly bear from a black bear?',answer:'Look at a combination of body and face features from a distance: a grizzly typically has a prominent shoulder hump and a dished face, while a black bear usually lacks that prominent hump and has a straighter facial profile. Colour alone is unreliable. Never approach to identify a bear; encounter response depends on behaviour and circumstances, as explained in the safety guide.' },
  { question:'Are elk and moose the same animal?',answer:'No. Elk have a dark neck and pale rump; bulls carry branching antlers. Moose have long legs, a large drooping muzzle and, in mature bulls, broad flattened antlers. An animal without antlers still needs space. Parks Canada’s deer-family guide explains both species.' },
  { question:'What can I enjoy if I do not see a large animal?',answer:'Choose a habitat walk, lake view or interpretation stop that is worthwhile on its own. Listen for birds, notice the change from forest to alpine and learn identification features before travelling. Stay on designated routes and never feed or lure wildlife to complete a checklist.' },
  { question:'Are the photographs current Banff sightings?',answer:'No. The credited images are historical species illustrations selected from openly licensed community photographs. They are not current reports, official Parks Canada photographs or evidence that an animal is at a mapped visitor area. Each image links to its creator and licence.' },
];
