import type { Trail } from './trails';

/** Permanent route descriptions never establish today's operating status or winter suitability. */
export function trailSeasonLabel(season: Trail['season']): string {
  return season === 'summer' ? 'Summer route description' : season === 'winter' ? 'Winter activity description' : 'Multiple seasons; check current route';
}

export function trailPark(trail: Trail): string {
  return trail.park || (trail.area === 'Kootenay' ? 'Kootenay National Park' : 'Banff National Park');
}

export function trailReportUrl(trail: Trail): string {
  return trail.area === 'Kootenay'
    ? 'https://parks.canada.ca/pn-np/bc/kootenay/activ/randonnee-hike/etat-sentiers-trail-conditions'
    : 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions';
}

export function trailBulletinsUrl(trail: Trail): string {
  return trail.area === 'Kootenay' ? 'https://parks.canada.ca/pn-np/bc/kootenay/bulletins' : 'https://parks.canada.ca/pn-np/ab/banff/bulletins';
}

export function isDirectoryTrail(trail: Trail): boolean {
  return trail.directoryEligible !== false;
}
