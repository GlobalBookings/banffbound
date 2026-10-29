/** Shared, browser-safe Town feed contract. Source record: research/town-event-sources-2026-10-28.md. */
export const TOWN_FEED_PROVIDER = 'Town of Banff RSS';
export const TOWN_FEED_VERSION = 1;
export const TOWN_FEED_MAX_AGE_HOURS = 24;
export const TOWN_FEEDS = Object.freeze({
  events: { sourceUrl: 'https://www.banff.ca/RSSFeed.aspx?ModID=58&CID=Events-25', pageUrl: 'https://banff.ca/Calendar.aspx', title: 'Banff, AB - Calendar - Events', itemPath: '/calendar.aspx', idParam: 'eid' },
  news: { sourceUrl: 'https://www.banff.ca/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml', pageUrl: 'https://banff.ca/CivicAlerts.aspx', title: 'Banff, AB - News Flash', itemPath: '/civicalerts.aspx', idParam: 'aid' },
});
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const htmlEntities = { amp:'&', apos:"'", quot:'"', nbsp:' ', lt:'<', gt:'>', rsquo:"'", lsquo:"'", ndash:'–', mdash:'—' };
export function plainText(value, limit = 400) {
  if (typeof value !== 'string') return '';
  return value.replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, entity) => {
      if (entity[0] !== '#') return htmlEntities[entity.toLowerCase()] ?? whole;
      const n = Number.parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
    }).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,limit);
}
export function safeTownUrl(value, kind, item = false) {
  if (typeof value !== 'string' || value !== value.trim() || /[\u0000-\u0020\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['banff.ca','www.banff.ca'].includes(url.hostname) || url.username || url.password || url.port) return null;
    if (kind) {
      const source = TOWN_FEEDS[kind];
      if (!source || url.pathname.toLowerCase() !== source.itemPath) return null;
      if (item) {
        const params = [...url.searchParams];
        if (params.length !== 1 || params[0][0].toLowerCase() !== source.idParam || !/^[1-9]\d*$/.test(params[0][1])) return null;
      }
    }
    url.hash = '';
    return url.href;
  } catch { return null; }
}
function civilDate(year, month, day) {
  const date = new Date(Date.UTC(year,month-1,day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month-1 && date.getUTCDate() === day
    ? [year,String(month).padStart(2,'0'),String(day).padStart(2,'0')].join('-') : null;
}
export function validCivilDate(value) {
  const m = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m && civilDate(Number(m[1]),Number(m[2]),Number(m[3])) === value ? value : null;
}
function namedDate(value) {
  const m = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  const month = m ? months.findIndex(month => month.toLowerCase() === m[1].toLowerCase()) + 1 : 0;
  return m && month ? civilDate(Number(m[3]),month,Number(m[2])) : null;
}
export function eventDateRange(value) {
  const label = plainText(value,160);
  const parts = label.split(/\s+[–—-]\s+/);
  if (parts.length > 2) return null;
  const startDate = namedDate(parts[0]);
  const endDate = namedDate(parts[1] || parts[0]);
  return startDate && endDate && endDate >= startDate ? { startDate,endDate } : null;
}
export function isoInstant(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value ? value : null;
}
export function rssInstant(value) {
  if (typeof value !== 'string') return null;
  const m = value.trim().match(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(GMT|[+-]\d{4})$/);
  if (!m) return null;
  const month = months.findIndex(month => month.slice(0,3).toLowerCase() === m[2].toLowerCase()) + 1;
  if (!month || !civilDate(Number(m[3]),month,Number(m[1])) || Number(m[4]) > 23 || Number(m[5]) > 59 || Number(m[6]) > 59) return null;
  if (m[7] !== 'GMT' && (Number(m[7].slice(1,3)) > 14 || Number(m[7].slice(3)) > 59 || (Number(m[7].slice(1,3)) === 14 && Number(m[7].slice(3)) !== 0))) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}
export function normalizeTownItem(item, kind, retrievedAt) {
  const title = plainText(item?.title,200);
  const link = safeTownUrl(item?.link,kind,true);
  if (!title || !link) return null;
  const published = rssInstant(item.pubDate);
  const publishedAt = published && Date.parse(published) <= Date.parse(retrievedAt) + 300_000 ? published : null;
  const description = plainText(item.content || item.description || item.contentSnippet,2000).split(/Description:\s*/i).at(-1).trim();
  const result = { title,link,description:description.slice(0,300),publishedAt };
  if (kind === 'news') return result;
  const dates = plainText(item.eventDates,160);
  const range = eventDateRange(dates);
  if (!range) return null;
  return { ...result, ...range, dates, times:plainText(item.eventTimes,120), location:plainText(item.eventLocation,200) };
}
export function mountainDay(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Edmonton',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  return ['year','month','day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
export function mountainTime(value) {
  return isoInstant(value) ? new Intl.DateTimeFormat('en-CA',{timeZone:'America/Edmonton',dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) + ' (Mountain Time)' : 'Unavailable';
}
export function eventMatches(item, { from = '',to = '',query = '' } = {}, now = Date.now()) {
  const today = mountainDay(now);
  const first = validCivilDate(from) && from > today ? from : today;
  return Boolean(validCivilDate(item?.startDate) && validCivilDate(item?.endDate) && item.endDate >= first
    && (!validCivilDate(to) || item.startDate <= to)
    && [item.title,item.description,item.location].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
}
function storedItem(item, kind, retrievedAt) {
  if (!item || !plainText(item.title) || !safeTownUrl(item.link,kind,true)) return false;
  if (typeof item.description !== 'string') return false;
  if (item.publishedAt !== null && (!isoInstant(item.publishedAt) || Date.parse(item.publishedAt) > Date.parse(retrievedAt)+300_000)) return false;
  return kind === 'news' || (typeof item.times === 'string' && typeof item.location === 'string' && validCivilDate(item.startDate) && validCivilDate(item.endDate) && item.startDate <= item.endDate && eventDateRange(item.dates)?.startDate === item.startDate && eventDateRange(item.dates)?.endDate === item.endDate);
}
/** A shared snapshot is revalidated on read; a failed/partial feed is never a valid empty feed. */
export function townFeedView(snapshot, kind, now = Date.now()) {
  const source = TOWN_FEEDS[kind];
  const fallback = { status:'unavailable',items:[],retrievedAt:null,expiresAt:null,sourceUpdatedAt:null,sourceUpdatedAtText:null,sourceTimeIssue:null,rejectedCount:0,message:'The Town feed could not be verified. Open the official source for current listings.' };
  const feed = snapshot?.feeds?.[kind];
  if (!source || snapshot?.schemaVersion !== TOWN_FEED_VERSION || snapshot?.provider !== TOWN_FEED_PROVIDER || feed?.sourceUrl !== source.sourceUrl || !isoInstant(feed.retrievedAt)) return fallback;
  const retrieved = Date.parse(feed.retrievedAt);
  const expiresAt = new Date(retrieved + TOWN_FEED_MAX_AGE_HOURS*3_600_000).toISOString();
  const sourceUpdated = isoInstant(feed.sourceUpdatedAt);
  const view = { ...fallback,retrievedAt:feed.retrievedAt,expiresAt,sourceUpdatedAt:sourceUpdated && Date.parse(sourceUpdated) <= retrieved+300_000 ? sourceUpdated : null,sourceUpdatedAtText:plainText(feed.sourceUpdatedAtText,120)||null,sourceTimeIssue:plainText(feed.sourceTimeIssue,200)||null,rejectedCount:Number.isInteger(feed.rejectedCount)&&feed.rejectedCount>=0?feed.rejectedCount:0 };
  if (retrieved > now || now > Date.parse(expiresAt)) return { ...view,status:'stale',message:'This dated feed snapshot has expired or its retrieval time cannot be verified. Use the official source for current listings.' };
  if (!['available','partial','empty'].includes(feed.status) || !Array.isArray(feed.items) || (feed.status === 'empty' && feed.items.length) || (feed.status === 'available' && !feed.items.length)) return view;
  const valid = feed.items.filter(item => storedItem(item,kind,feed.retrievedAt));
  const corrupt = valid.length !== feed.items.length;
  const items = kind === 'events' ? valid.filter(item => item.endDate >= mountainDay(now)).sort((a,b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title)) : valid.slice().sort((a,b) => (b.publishedAt||'').localeCompare(a.publishedAt||''));
  const status = corrupt || feed.status === 'partial' ? 'partial' : feed.status;
  const message = items.length ? (status === 'partial' ? 'Some source items could not be verified. Confirm the listed details with the organiser.' : 'A dated selection from the Town feed; confirm the original source for current details.')
    : status === 'partial' ? (kind === 'news' ? 'No verified announcements are available from this partial snapshot. Open the Town news page for current releases.' : 'No date-verified listings are available from this partial snapshot. This does not mean that no events are scheduled.')
    : feed.status === 'empty' ? (kind === 'news' ? 'The verified news feed returned no items when retrieved. Open the Town news page for updates.' : 'The verified feed returned no items when retrieved. Other Town calendar categories or organiser calendars may contain more listings.')
    : 'No remaining event dates appear in this snapshot. Check the full calendar for other listings and later updates.';
  return { ...view,status,items,message };
}
