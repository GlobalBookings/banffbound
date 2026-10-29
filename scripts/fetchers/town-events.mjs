/** One bounded producer for /events and the homepage; no page-level network requests. */
import Parser from 'rss-parser';
import { TOWN_FEEDS,TOWN_FEED_PROVIDER,TOWN_FEED_VERSION,normalizeTownItem,plainText,rssInstant,safeTownUrl } from '../../src/data/townFeedModel.mjs';

export async function normalizeTownFeed(xml, kind, retrievedAt) {
  const source = TOWN_FEEDS[kind];
  if (typeof xml !== 'string' || xml.length > 512_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported feed document');
  const parser = new Parser({ customFields:{item:[['calendarEvent:EventDates','eventDates'],['calendarEvent:EventTimes','eventTimes'],['calendarEvent:Location','eventLocation']]} });
  const feed = await parser.parseString(xml);
  if (feed.title !== source.title || !safeTownUrl(feed.link,kind) || !Array.isArray(feed.items) || feed.items.length > 500) throw new Error('Unexpected Town feed identity or size');
  const items = [];
  const seen = new Set();
  let rejectedCount = 0;
  for (const item of feed.items) {
    const normalized = normalizeTownItem(item,kind,retrievedAt);
    if (!normalized) { rejectedCount++; continue; }
    const key = normalized.link + (normalized.startDate || '');
    if (!seen.has(key)) { items.push(normalized); seen.add(key); }
  }
  const sourceUpdatedAtText = plainText(feed.lastBuildDate || feed.pubDate,120) || null;
  const parsedTime = rssInstant(sourceUpdatedAtText);
  const futureTime = parsedTime && Date.parse(parsedTime) > Date.parse(retrievedAt) + 300_000;
  return { sourceUrl:source.sourceUrl,pageUrl:source.pageUrl,retrievedAt,sourceUpdatedAt:futureTime?null:parsedTime,sourceUpdatedAtText,sourceTimeIssue:futureTime?'Source feed clock is later than retrieval; its update time is unverified.':sourceUpdatedAtText&&!parsedTime?'Source feed update time could not be verified.':null,
    status:rejectedCount?'partial':feed.items.length?'available':'empty',rejectedCount,items };
}
async function fetchFeed(kind,{fetchImpl,timeoutMs,now}) {
  const source = TOWN_FEEDS[kind];
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((resolve,reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Town feed timeout')); },timeoutMs); });
  try {
    return await Promise.race([timeout,(async () => {
      const response = await fetchImpl(source.sourceUrl,{signal:controller.signal,headers:{Accept:'application/rss+xml, application/xml, text/xml','User-Agent':'BanffBoundEvents/1.0 (+https://banffbound.com/events)'}});
      if (!response.ok) throw new Error('HTTP '+response.status);
      if (response.url && (!safeTownUrl(response.url) || new URL(response.url).pathname.toLowerCase() !== '/rssfeed.aspx')) throw new Error('Unexpected feed redirect');
      if (Number(response.headers?.get('content-length')) > 512_000) throw new Error('Feed exceeds size limit');
      return normalizeTownFeed(await response.text(),kind,now().toISOString());
    })()]);
  } catch (error) {
    console.log('[town-events] '+kind+' unavailable: '+error.message);
    return {sourceUrl:source.sourceUrl,pageUrl:source.pageUrl,retrievedAt:now().toISOString(),sourceUpdatedAt:null,sourceUpdatedAtText:null,sourceTimeIssue:null,status:'unavailable',rejectedCount:0,items:[],error:'The official feed could not be retrieved or validated.'};
  } finally { clearTimeout(timer); }
}
export async function fetchTownEvents({fetchImpl=globalThis.fetch,timeoutMs=8_000,now=()=>new Date()}={}) {
  const values = await Promise.all(Object.keys(TOWN_FEEDS).map(kind=>fetchFeed(kind,{fetchImpl,timeoutMs,now})));
  return {schemaVersion:TOWN_FEED_VERSION,provider:TOWN_FEED_PROVIDER,retrievedAt:now().toISOString(),feeds:Object.fromEntries(Object.keys(TOWN_FEEDS).map((kind,index)=>[kind,values[index]]))};
}
