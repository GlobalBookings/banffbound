/** Source fields: https://511.alberta.ca/help/endpoint/winterroads (reviewed 2026-10-28). */
export const ROAD_PROVIDER = '511 Alberta';
export const ROAD_SOURCE_URL = 'https://511.alberta.ca/';
export const MAX_ROAD_REPORT_AGE_HOURS = 6;
const COVERAGE = 'Reported sections only; complete route coverage is not verified.';
const BANFF_AREAS = ['BANFF', 'BANFF NATIONAL PARK'];
const ROADS = [
  { id: 'hwy-1-banff', name: 'Trans-Canada Highway (Hwy 1, Banff area)', number: '1', names: ['HWY 1', 'HIGHWAY 1'], areas: BANFF_AREAS },
  { id: 'hwy-1a-bow-valley', name: 'Bow Valley Parkway (Hwy 1A)', number: '1A', names: ['HWY 1A', 'HIGHWAY 1A', 'BOW VALLEY PARKWAY'], areas: BANFF_AREAS },
  { id: 'hwy-93n', name: 'Icefields Parkway (Hwy 93N)', number: '93N', names: ['HWY 93 N', 'HWY 93N', 'HIGHWAY 93 N', 'HIGHWAY 93N', 'HIGHWAY 93 NORTH', 'ICEFIELDS PARKWAY'], areas: [...BANFF_AREAS, 'JASPER', 'JASPER NATIONAL PARK'] },
  { id: 'hwy-93s', name: 'Highway 93 South (reported sections)', number: '93S', names: ['HWY 93 S', 'HWY 93S', 'HIGHWAY 93 S', 'HIGHWAY 93S', 'HIGHWAY 93 SOUTH'], areas: [...BANFF_AREAS, 'KOOTENAY', 'KOOTENAY NATIONAL PARK'] },
  { id: 'lake-minnewanka', name: 'Lake Minnewanka Road', number: '', names: ['LAKE MINNEWANKA ROAD', 'LAKE MINNEWANKA RD', 'MINNEWANKA ROAD', 'MINNEWANKA RD', 'MINNEWANKA LOOP ROAD'], areas: BANFF_AREAS },
  { id: 'golf-course-road', name: 'Golf Course Road', number: '', names: ['GOLF COURSE ROAD', 'GOLF COURSE RD', 'FAIRMONT BANFF SPRINGS GOLF COURSE ROAD'], areas: BANFF_AREAS },
];
const text = value => typeof value === 'string' && value.trim() ? value.trim() : null;
const identifier = value => text(value)?.replace(/\s+/g, ' ').toUpperCase() || '';
const integer = value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
const conditionList = value => Array.isArray(value) ? value.map(text).filter(Boolean) : text(value) ? [text(value)] : [];
const emptyHighways = () => ROADS.map(({ id, name, number }) => ({ id, name, number, availability: 'unavailable', coverage: COVERAGE, segments: [] }));
const base = () => ({ schemaVersion: 2, provider: ROAD_PROVIDER, sourceUrl: ROAD_SOURCE_URL, retrievedAt: null, maxReportAgeHours: MAX_ROAD_REPORT_AGE_HOURS, availability: 'unavailable', highways: emptyHighways() });

export function unavailableRoadReport(code, message) {
  return { ...base(), error: { code, message } };
}

function reportTime(raw, now) {
  if (raw === null || raw === undefined || raw === '') return { reportedAt: null, reason: 'missing_source_time' };
  // LastUpdated is documented as an integer in Unix SECONDS. Never guess milliseconds or local time.
  if (integer(raw) === null || raw >= 100_000_000_000) return { reportedAt: null, reason: 'invalid_source_time' };
  const timestamp = raw * 1000;
  const reportedAt = new Date(timestamp).toISOString();
  if (timestamp > now) return { reportedAt, reason: 'future_source_time' };
  if (now - timestamp > MAX_ROAD_REPORT_AGE_HOURS * 3_600_000) return { reportedAt, reason: 'stale_source_time' };
  return { reportedAt, reason: null };
}

function normalizeSegment(report, now) {
  const primaryCondition = text(report['Primary Condition']);
  const secondaryConditions = conditionList(report['Secondary Conditions']);
  const time = reportTime(report.LastUpdated, now);
  const missingCondition = !primaryCondition || /^(?:unknown|unavailable|not reported|no data)$/i.test(primaryCondition);
  const unavailableReason = time.reason || (missingCondition ? 'missing_condition' : null);
  const availability = unavailableReason ? 'unavailable' : 'available';
  return {
    id: integer(report.Id),
    section: text(report.LocationDescription),
    roadwayName: text(report.RoadwayName),
    areaName: text(report.AreaName),
    primaryCondition,
    secondaryConditions,
    visibility: text(report.Visibility),
    reportedAt: time.reportedAt,
    availability,
    unavailableReason,
    // This flags only an explicit section report, never an entire route; old closures are not current.
    closureReported: availability === 'available' && [primaryCondition, ...secondaryConditions].some(value => /^(?:closed|road closed|roadway closed)$/i.test(value || '')),
  };
}

export function normalizeRoadReports(reports, now = Date.now()) {
  if (!Array.isArray(reports)) return unavailableRoadReport('invalid_response', '511 Alberta returned an unrecognised road report format. Check the official report.');
  const result = base();
  result.retrievedAt = new Date(now).toISOString();
  for (const report of reports) {
    if (!report || typeof report !== 'object' || Array.isArray(report) || !text(report.LocationDescription)) continue;
    const road = ROADS.find(candidate => candidate.names.includes(identifier(report.RoadwayName)) && candidate.areas.includes(identifier(report.AreaName)));
    if (!road) continue;
    result.highways.find(highway => highway.id === road.id).segments.push(normalizeSegment(report, now));
  }
  for (const highway of result.highways) {
    const available = highway.segments.filter(segment => segment.availability === 'available').length;
    highway.availability = available === 0 ? 'unavailable' : available === highway.segments.length ? 'available' : 'partial';
  }
  const availableRoads = result.highways.filter(highway => highway.availability !== 'unavailable').length;
  result.availability = availableRoads === 0 ? 'unavailable' : result.highways.every(highway => highway.availability === 'available') ? 'available' : 'partial';
  if (!availableRoads) result.error = { code: 'no_current_reports', message: 'No recent verified section reports are available for these roads. Check the official report.' };
  return result;
}
