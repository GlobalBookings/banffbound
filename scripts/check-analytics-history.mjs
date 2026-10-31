import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { analyticsSnapshot, archiveAnalyticsSnapshot } from '../agents/src/core/analytics-history.js';
const input={propertyId:'494425433',overview:{propertyTimeZone:'America/Vancouver',sessions:{val:12,prev:10}},sources:[],devices:[],topPages:[],landingPages:[],affiliateClicks:null,geo:[],errors:[{label:'affiliateClicks',message:'private error token'}],capturedAt:'2026-10-31T04:00:00.000Z'};
const missing=analyticsSnapshot(input);
assert.equal(missing.dateRange.startDate,'2026-10-29');
assert.equal(missing.sections.affiliateClicks.status,'unavailable');assert.equal(missing.sections.affiliateClicks.data,null);
assert.equal(missing.sections.overview.status,'available');assert.ok(!JSON.stringify(missing).includes('private error token'));
const zero=analyticsSnapshot({...input,affiliateClicks:[],errors:[]});assert.equal(zero.sections.affiliateClicks.status,'available');assert.deepEqual(zero.sections.affiliateClicks.data,[]);
const failed=analyticsSnapshot({...input,errors:[{label:'overview'}]});assert.equal(failed.sections.overview.data,null);
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'bb-ga4-history-'));
try{const file=archiveAnalyticsSnapshot(missing,directory);assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),missing);assert.equal(fs.statSync(file).mode&0o777,0o600);assert.throws(()=>archiveAnalyticsSnapshot(zero,directory),{code:'EEXIST'});assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),missing,'An archive never overwrites previous data.');}finally{fs.rmSync(directory,{recursive:true,force:true});}
console.log('Analytics history checks passed: missing versus zero, no raw errors, immutable aggregate snapshots and private file permissions.');
