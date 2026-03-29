export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  capacity: number;
  fillTimes: {
    peakSummer: string;   // July-Aug weekends
    summer: string;       // June-Sep weekdays
    shoulder: string;     // May, Oct
    winter: string;       // Nov-Apr
  };
  tips: string;
  alternatives: string[];
  transitOption?: string;
}

export const parkingLots: ParkingLot[] = [
  {
    id: 'lake-louise-main',
    name: 'Lake Louise Main Lot',
    location: 'Lake Louise',
    lat: 51.4167, lng: -116.1767,
    capacity: 400,
    fillTimes: {
      peakSummer: '5:30 AM',
      summer: '7:00 AM',
      shoulder: '9:00 AM',
      winter: 'Rarely fills',
    },
    tips: 'This lot fills before sunrise in July and August. If you arrive after 7 AM on a summer weekend, you will not get a spot. The overflow lot opens when this fills but it goes fast too.',
    alternatives: ['Parks Canada shuttle from Lake Louise Ski Resort', 'Roam Transit Route 8S from Banff'],
    transitOption: 'Roam Route 8S / Parks Canada Shuttle',
  },
  {
    id: 'moraine-lake',
    name: 'Moraine Lake (Shuttle Only)',
    location: 'Lake Louise',
    lat: 51.3217, lng: -116.1860,
    capacity: 0,
    fillTimes: {
      peakSummer: 'No private parking',
      summer: 'No private parking',
      shoulder: 'No private parking',
      winter: 'Road closed',
    },
    tips: 'Private vehicles are banned from Moraine Lake Road June-October. You MUST take the Parks Canada shuttle from Lake Louise Ski Resort. Shuttle reservations open April 15 at 8 AM MT and sell out within minutes for peak dates.',
    alternatives: ['Parks Canada shuttle (reservation required)', 'Commercial tour operators'],
    transitOption: 'Parks Canada Shuttle from Lake Louise Ski Resort',
  },
  {
    id: 'lake-minnewanka',
    name: 'Lake Minnewanka Parking',
    location: 'Banff',
    lat: 51.2327, lng: -115.4900,
    capacity: 150,
    fillTimes: {
      peakSummer: '8:00 AM',
      summer: '9:30 AM',
      shoulder: '10:30 AM',
      winter: 'Rarely fills',
    },
    tips: 'Less extreme than Lake Louise but still fills on summer weekends. The lot at Two Jack Lake fills first -- head straight to the main Minnewanka lot. Afternoons clear out as boat tour groups leave.',
    alternatives: ['Two Jack Lake lot', 'Johnson Lake lot', 'Roam Transit Route 6'],
    transitOption: 'Roam Route 6 (summer only)',
  },
  {
    id: 'johnston-canyon',
    name: 'Johnston Canyon Parking',
    location: 'Castle Junction',
    lat: 51.2454, lng: -115.8396,
    capacity: 100,
    fillTimes: {
      peakSummer: '8:30 AM',
      summer: '9:30 AM',
      shoulder: '10:00 AM',
      winter: '10:00 AM',
    },
    tips: 'One of the most congested lots in the park. In summer the overflow extends along Bow Valley Parkway shoulders. Winter is also busy for ice walk tours. Arrive before 9 AM any season.',
    alternatives: ['Park at Castle Junction and walk/cycle 2 km', 'Roam Transit Route 4 (summer)'],
    transitOption: 'Roam Route 4 (summer only)',
  },
  {
    id: 'banff-gondola',
    name: 'Banff Gondola / Hot Springs',
    location: 'Banff',
    lat: 51.1495, lng: -115.5720,
    capacity: 200,
    fillTimes: {
      peakSummer: '9:00 AM',
      summer: '10:00 AM',
      shoulder: '11:00 AM',
      winter: '10:30 AM',
    },
    tips: 'Shared lot for the gondola and Upper Hot Springs. Summer afternoons are the worst. Morning gondola riders leave by noon, freeing spots. Hot springs lot fills again after 4 PM.',
    alternatives: ['Roam Route 1 from downtown Banff', 'Walk up Mountain Avenue (30 min from town)'],
    transitOption: 'Roam Route 1',
  },
  {
    id: 'tunnel-mountain',
    name: 'Tunnel Mountain Trailhead',
    location: 'Banff',
    lat: 51.1782, lng: -115.5512,
    capacity: 30,
    fillTimes: {
      peakSummer: '8:00 AM',
      summer: '9:00 AM',
      shoulder: '10:00 AM',
      winter: '10:30 AM',
    },
    tips: 'Small lot fills fast because the trail is short and popular. Street parking on St. Julien Road is the overflow option. Sunset hikers create a second rush around 7 PM in summer.',
    alternatives: ['Street parking on St. Julien Road', 'Walk from downtown Banff (15 min)'],
    transitOption: 'Roam Route 2',
  },
  {
    id: 'bow-falls',
    name: 'Bow Falls / Banff Springs',
    location: 'Banff',
    lat: 51.1618, lng: -115.5575,
    capacity: 50,
    fillTimes: {
      peakSummer: '10:00 AM',
      summer: '10:30 AM',
      shoulder: 'Rarely fills',
      winter: 'Rarely fills',
    },
    tips: 'Smaller than you would expect. Tour buses take several spots. The Fairmont hotel lot is for guests only. Walk from town via the Bow River trail (20 min) to avoid the lot entirely.',
    alternatives: ['Walk from downtown via Bow River trail', 'Roam Route 1'],
    transitOption: 'Roam Route 1',
  },
  {
    id: 'sunshine-village',
    name: 'Sunshine Village Base',
    location: 'Banff',
    lat: 51.0750, lng: -115.7630,
    capacity: 1500,
    fillTimes: {
      peakSummer: '9:00 AM',
      summer: '10:00 AM',
      shoulder: 'Rarely fills',
      winter: '8:30 AM (ski season)',
    },
    tips: 'Massive lot but fills on powder days in winter and busy summer weekends for Sunshine Meadows shuttle. Arrive before 9 AM for Sunshine Meadows; before 8 AM on ski powder days.',
    alternatives: ['Ski bus from Banff (winter)', 'Healy Creek trailhead nearby'],
  },
  {
    id: 'peyto-lake',
    name: 'Peyto Lake Viewpoint',
    location: 'Icefields Parkway',
    lat: 51.7167, lng: -116.5333,
    capacity: 40,
    fillTimes: {
      peakSummer: '9:00 AM',
      summer: '10:00 AM',
      shoulder: '11:00 AM',
      winter: 'Road may be closed',
    },
    tips: 'Tiny lot for an iconic viewpoint. The new viewing platform has improved flow, but the lot is still undersized. Midday is worst. Early morning or late afternoon gives you the lot and better light.',
    alternatives: ['Bow Summit lot (short walk to viewpoint)', 'Visit Mistaya Canyon instead'],
  },
  {
    id: 'parker-ridge',
    name: 'Parker Ridge Trailhead',
    location: 'Icefields Parkway',
    lat: 51.7833, lng: -116.7167,
    capacity: 25,
    fillTimes: {
      peakSummer: '9:30 AM',
      summer: '10:30 AM',
      shoulder: 'Rarely fills',
      winter: 'Road closed',
    },
    tips: 'Small gravel lot for one of the best short hikes on the Parkway. Start early. Most hikers take 2-3 hours, so spots open up late morning as early birds return.',
    alternatives: ['Wilcox Pass trailhead (5 km south)'],
  },
  {
    id: 'banff-central',
    name: 'Banff Central Parking (Bear St)',
    location: 'Banff',
    lat: 51.1760, lng: -115.5700,
    capacity: 250,
    fillTimes: {
      peakSummer: '10:00 AM',
      summer: '11:00 AM',
      shoulder: '12:00 PM',
      winter: '11:00 AM',
    },
    tips: 'Paid parking ($4/hr, max $16/day). The parkade on Bear Street is your best bet downtown. Free lots exist at the train station and industrial area but are a 10-15 min walk.',
    alternatives: ['Train Station free lot', 'Industrial compound free lot', 'Roam Transit from hotel'],
    transitOption: 'Roam Transit local routes',
  },
];
