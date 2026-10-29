#!/usr/bin/env node
/** Offline checks by default; no snapshot-writing orchestrator is imported. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fetchTownEvents,normalizeTownFeed} from './fetchers/town-events.mjs';
import {TOWN_FEEDS,TOWN_FEED_PROVIDER,TOWN_FEED_VERSION,safeTownUrl,eventDateRange,eventMatches,mountainDay,mountainTime,rssInstant,townFeedView} from '../src/data/townFeedModel.mjs';

const retrievedAt = '2026-10-29T05:00:00.000Z';
const item = (id, dates='October 30, 2026', link='https://banff.ca/Calendar.aspx?EID='+id) =>
  '<item><title>Example '+id+'</title><link>'+link.replaceAll('&','&amp;')+'</link><pubDate>Wed, 28 Oct 2026 09:00:00 -0600</pubDate><description>&lt;b&gt;Description:&lt;/b&gt;An example activity.</description><calendarEvent:EventDates>'+dates+'</calendarEvent:EventDates><calendarEvent:EventTimes>05:00 PM - 07:00 PM</calendarEvent:EventTimes><calendarEvent:Location>Example venue</calendarEvent:Location></item>';
const feed = (kind,items='',time='Wed, 28 Oct 2026 12:00:00 -0600') =>
  '<?xml version="1.0"?><rss version="2.0" xmlns:calendarEvent="https://banff.ca/Calendar.aspx"><channel><title>'+TOWN_FEEDS[kind].title+'</title><link>'+TOWN_FEEDS[kind].pageUrl+'</link><lastBuildDate>'+time+'</lastBuildDate>'+items+'</channel></rss>';
const eventXml = feed('events',item(1)+item(2,'October 27, 2026')+item(3,'October 28, 2026 - October 31, 2026'));
const newsXml = feed('news','<item><title>Example announcement</title><link>https://banff.ca/CivicAlerts.aspx?aid=123</link><pubDate>Wed, 28 Oct 2026 10:00:00 -0600</pubDate><description>Example announcement context.</description></item>');
const parsed = await normalizeTownFeed(eventXml,'events',retrievedAt);
assert.equal(parsed.status,'available');
assert.equal(parsed.items.length,3);
assert.equal(parsed.items[0].publishedAt,'2026-10-28T15:00:00.000Z');
assert.equal(parsed.items[0].startDate,'2026-10-30','Publication date is not the event date');
assert.equal(parsed.items[0].description,'An example activity.');
assert.equal(parsed.items[0].times,'05:00 PM - 07:00 PM');
assert.equal(parsed.sourceUpdatedAt,'2026-10-28T18:00:00.000Z');
const empty = await normalizeTownFeed(feed('events'),'events',retrievedAt);
assert.equal(empty.status,'empty');
const partial = await normalizeTownFeed(feed('events',item(1)+item(2,'unknown')),'events',retrievedAt);
assert.equal(partial.status,'partial');
assert.equal(partial.rejectedCount,1);
assert.equal(partial.items.length,1);
const invalid = await normalizeTownFeed(feed('events',item(1,'unknown')),'events',retrievedAt);
assert.equal(invalid.status,'partial','All rejected items must not become a verified empty feed');
assert.equal(invalid.items.length,0);
assert.equal((await normalizeTownFeed(feed('events',item(1)+item(1)),'events',retrievedAt)).items.length,1);
assert.equal((await normalizeTownFeed(feed('events',item(1)+item(1,'November 1, 2026')),'events',retrievedAt)).items.length,2,'Different occurrences retain their dates');
await assert.rejects(normalizeTownFeed('<html>Unavailable</html>','events',retrievedAt));
await assert.rejects(normalizeTownFeed(feed('news'),'events',retrievedAt),/identity/);
await assert.rejects(normalizeTownFeed('<!DOCTYPE rss [<!ENTITY ext SYSTEM "https://example.com/">]>'+feed('events'),'events',retrievedAt),/Unsupported/);
await assert.rejects(normalizeTownFeed('x'.repeat(512001),'events',retrievedAt),/Unsupported/);
const future = await normalizeTownFeed(feed('events',item(1),'Wed, 28 Oct 2026 23:30:00 -0700'),'events',retrievedAt);
assert.equal(future.sourceUpdatedAt,null);
assert(future.sourceUpdatedAtText);
assert(future.sourceTimeIssue.includes('later than retrieval'));
for (const bad of ['javascript:alert(1)','http://banff.ca/Calendar.aspx?EID=1','https://banff.ca.evil.test/Calendar.aspx?EID=1','https://banff.ca@evil.test/Calendar.aspx?EID=1','https://evil.test/Calendar.aspx?EID=1','https://banff.ca:444/Calendar.aspx?EID=1','https://banff.ca/Calendar.aspx?EID=1&EID=bad','https://banff.ca/Calendar.aspx?EID=1&redirect=https://evil.test/','https://banff.ca/Calendar.aspx?EID=bad']) assert.equal(safeTownUrl(bad,'events',true),null,bad);
assert(safeTownUrl('https://www.banff.ca/Calendar.aspx?EID=1','events',true));
for (const date of ['February 31, 2026','October 30','October 31, 2026 - October 1, 2026','tomorrow','']) assert.equal(eventDateRange(date),null,date);
assert.deepEqual(eventDateRange('December 31, 2026 - January 2, 2027'),{startDate:'2026-12-31',endDate:'2027-01-02'});
assert.equal(rssInstant('October 28, 2026'),null,'Do not infer a publication instant from a date without offset');
assert.equal(rssInstant('Wed, 31 Feb 2026 12:00:00 -0600'),null);
assert.equal(mountainDay(Date.parse('2026-10-29T05:59:59Z')),'2026-10-28');
assert.equal(mountainDay(Date.parse('2026-10-29T06:00:00Z')),'2026-10-29');
assert.equal(mountainDay(Date.parse('2026-11-01T07:30:00Z')),'2026-11-01','DST day handled by named time zone');
assert(mountainTime(retrievedAt).endsWith('(Mountain Time)'));

const snapshot = {schemaVersion:TOWN_FEED_VERSION,provider:TOWN_FEED_PROVIDER,feeds:{events:parsed}};
const view = townFeedView(snapshot,'events',Date.parse(retrievedAt));
assert.equal(view.items.length,2,'Past civil dates are excluded; overlapping multiday listings remain');
assert.equal(view.items[0].startDate,'2026-10-28');
assert.equal(townFeedView({...snapshot,schemaVersion:0},'events',Date.parse(retrievedAt)).status,'unavailable');
assert.equal(townFeedView(snapshot,'events',Date.parse(retrievedAt)-1).status,'stale');
assert.equal(townFeedView(snapshot,'events',Date.parse(retrievedAt)+24*3600000+1).status,'stale');
assert.equal(townFeedView({...snapshot,feeds:{events:empty}},'events',Date.parse(retrievedAt)).status,'empty');
assert.equal(townFeedView({...snapshot,feeds:{events:invalid}},'events',Date.parse(retrievedAt)).status,'partial');
const corrupt = structuredClone(snapshot);corrupt.feeds.events.items[0].link='javascript:alert(1)';
assert.equal(townFeedView(corrupt,'events',Date.parse(retrievedAt)).status,'partial');
assert(!townFeedView(corrupt,'events',Date.parse(retrievedAt)).items.some(item=>item.link.startsWith('javascript')));
const futurePublication = structuredClone(snapshot);
futurePublication.feeds.events.items[0].publishedAt = '2099-01-01T00:00:00.000Z';
assert.equal(townFeedView(futurePublication,'events',Date.parse(retrievedAt)).status,'partial');
assert(!townFeedView(futurePublication,'events',Date.parse(retrievedAt)).items.some(item=>item.link===parsed.items[0].link),'Read-time validation rejects a future publication even with an otherwise valid event date');
for (const [offset,accepted] of [[300_000,true],[300_001,false]]) {
  const boundary = structuredClone(snapshot);
  boundary.feeds.events.items[0].publishedAt = new Date(Date.parse(retrievedAt)+offset).toISOString();
  assert.equal(townFeedView(boundary,'events',Date.parse(retrievedAt)).items.some(item=>item.link===parsed.items[0].link),accepted,'Read-time publication bound is retrieval plus five minutes');
}
const parsedNews = await normalizeTownFeed(newsXml,'news',retrievedAt);
const futureNews = {schemaVersion:TOWN_FEED_VERSION,provider:TOWN_FEED_PROVIDER,feeds:{news:structuredClone(parsedNews)}};
futureNews.feeds.news.items[0].publishedAt = '2099-01-01T00:00:00.000Z';
assert.equal(townFeedView(futureNews,'news',Date.parse(retrievedAt)).status,'partial');
assert.equal(townFeedView(futureNews,'news',Date.parse(retrievedAt)).items.length,0,'Future stored news is rejected, not displayed or relabelled as valid empty');
assert(eventMatches(parsed.items[2],{from:'2026-10-30',to:'2026-10-30',query:'example'},Date.parse(retrievedAt)));
assert(!eventMatches(parsed.items[0],{to:'2026-10-29'},Date.parse(retrievedAt)));
assert(!eventMatches(parsed.items[0],{query:'not-in-the-listing'},Date.parse(retrievedAt)));
for (const page of ['src/pages/events.astro','src/pages/index.astro']) {
  const html = await readFile(page,'utf8');
  const noScript = [...html.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)].map(match=>match[1]).find(block=>block.includes('[data-town-results]'));
  assert(noScript,page+': a no-JS fallback is required for the dated feed');
  assert(noScript.includes('[data-town-panel] [data-town-results] { display:none !important; }'),page+': no-JS must hide all Town feed result panels');
  assert(noScript.includes('[data-town-panel][data-town-kind] [data-town-stale][hidden] { display:block !important; }'),page+': the official fallback must override hidden styles');
  assert(noScript.includes('<style is:inline>'),page+': no-JS style must stay inside noscript rather than becoming an always-active stylesheet');
}

let release;
const gate = new Promise(resolve=>{release=resolve;});
const requests = [];
const pending = fetchTownEvents({now:()=>new Date(retrievedAt),fetchImpl:async(url,options)=>{requests.push({url,options});return {ok:true,url,text:async()=>{await gate;return url===TOWN_FEEDS.events.sourceUrl?eventXml:newsXml;}};}});
assert.equal(requests.length,2,'Both requests start together, not three independent page requests');
release();
const fetched = await pending;
assert.equal(fetched.feeds.events.status,'available');
assert.equal(fetched.feeds.news.items.length,1);
assert(requests.every(request=>request.options.headers['User-Agent'].includes('BanffBound')));
const failure = await fetchTownEvents({fetchImpl:async()=>({ok:false,status:503})});
assert.equal(failure.feeds.events.status,'unavailable');
assert.equal(failure.feeds.news.status,'unavailable');
const oneFailure = await fetchTownEvents({fetchImpl:async url=>({ok:true,url,text:async()=>url===TOWN_FEEDS.events.sourceUrl?'<html>error</html>':newsXml})});
assert.equal(oneFailure.feeds.events.status,'unavailable');
assert.equal(oneFailure.feeds.news.status,'available','One source failure must not discard valid announcements');
const wrongHost = await fetchTownEvents({fetchImpl:async()=>({ok:true,url:'https://evil.test/',text:async()=>eventXml})});
assert.equal(wrongHost.feeds.events.status,'unavailable');
const start = Date.now();
const timeout = await fetchTownEvents({timeoutMs:10,fetchImpl:async()=>new Promise(()=>{})});
assert.equal(timeout.feeds.events.status,'unavailable');
assert(Date.now()-start<1000,'One deadline bounds both parallel requests even if a mock ignores abort');
const bodyTimeout = await fetchTownEvents({timeoutMs:10,fetchImpl:async url=>({ok:true,url,text:async()=>new Promise(()=>{})})});
assert.equal(bodyTimeout.feeds.news.status,'unavailable');

const fixtureIndex = process.argv.indexOf('--fixtures');
if (fixtureIndex!==-1) {
  for(const [index,kind] of ['events','news'].entries()) {
    const result=await normalizeTownFeed(await readFile(process.argv[fixtureIndex+1+index],'utf8'),kind,new Date().toISOString());
    assert(['available','partial','empty'].includes(result.status));
    console.log(kind+': '+JSON.stringify({status:result.status,items:result.items.length,sourceTimeIssue:result.sourceTimeIssue}));
  }
}
if(process.argv.includes('--live')) {
  const live=await fetchTownEvents();
  for(const [kind,source] of Object.entries(live.feeds)) {
    assert.notEqual(source.status,'unavailable',kind+' official source failed during live check');
    console.log(kind+': '+JSON.stringify({status:source.status,items:source.items.length,retrievedAt:source.retrievedAt,sourceTimeIssue:source.sourceTimeIssue}));
  }
}
console.log('Town feed checks passed: bounded shared retrieval, identity, empty/failure, safe URLs, dates, Mountain Time, partial validation and expiry. No snapshots written.');
