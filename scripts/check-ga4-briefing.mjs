import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { analyticsSnapshot } from '../agents/src/core/analytics-history.js';
const {outputFiles}=await build({entryPoints:['agents/src/agents/ga4-briefing.js'],bundle:true,write:false,platform:'node',format:'iife',globalName:'Briefing',logLevel:'silent',plugins:[{name:'no-external-services',setup(builder){
  const fixtures={
    googleapis:'export const google={analyticsdata:()=>fixtureAnalytics};',
    'google-auth.js':'export function getOAuth2Client(){return {};}',
    'slack.js':'export async function sendSlack(blocks){fixtureMessages.push(blocks);} export const slackHeader=text=>({text}); export const slackSection=text=>({text}); export const slackDivider=()=>({}); export const slackFields=fields=>({fields});',
    'logger.js':'export const createLogger=()=>({info(){},warn(){},error(){}});',
    'analytics-history.js':'export const analyticsSnapshot=fixtureSnapshot; export function archiveAnalyticsSnapshot(value){fixtureArchives.push(value);}',
  };
  builder.onResolve({filter:/googleapis|google-auth\.js$|slack\.js$|logger\.js$|analytics-history\.js$/},args=>({path:args.path.split('/').at(-1),namespace:'fixture'}));
  builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:fixtures[args.path],loader:'js'}));
}}]});
async function run(failure){const messages=[],archives=[];const context={process:{env:{}},Intl,Date,fixtureMessages:messages,fixtureArchives:archives,fixtureSnapshot:analyticsSnapshot,fixtureAnalytics:{properties:{async runReport({requestBody:body}){
 const dims=(body.dimensions||[]).map(x=>x.name);
 if(failure==='overview'&&!dims.length)throw Error('private OAuth details');
 if(dims.includes('eventName')){if(failure==='affiliate')throw Error('private API details');return{data:{rows:[],rowCount:0}};}
 if(!dims.length)return{data:{metadata:{timeZone:'America/Vancouver'},rows:[{metricValues:['10','8','15','0.3','45','2'].map(value=>({value}))}]}};
 return{data:{rows:[]}};
}}}};vm.runInNewContext(outputFiles[0].text,context);return{result:await context.Briefing.run(),messages,archives};}
const missing=await run('affiliate');assert.equal(missing.result.affiliateClicks,null);assert.equal(missing.archives[0].sections.affiliateClicks.data,null);assert.match(JSON.stringify(missing.messages),/Unavailable/);assert.ok(!/No click events recorded/.test(JSON.stringify(missing.messages)));
const zero=await run();assert.equal(zero.result.affiliateClicks,0);assert.equal(zero.archives[0].sections.affiliateClicks.status,'available');assert.match(JSON.stringify(zero.messages),/No click events recorded/);
const unavailable=await run('overview');assert.ok(unavailable.result.error);assert.equal(unavailable.archives[0].sections.overview.data,null);assert.equal(unavailable.messages.length,1);
console.log('GA4 briefing integration checks passed: actual API failure paths retain null, real empty results remain zero, aggregate archives precede notifications, no network or Slack.');
