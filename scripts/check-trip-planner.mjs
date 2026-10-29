/** Run against the real typed planning module using Astro's installed build compiler. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
const source = await readFile(new URL('../src/data/tripPlanner.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader:'ts', format:'esm' });
const planner = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const base = { v:1, s:'winter', b:'banff', t:'car-free', d:[['town']] };
const decode = value => planner.decodeTripPlan(JSON.stringify(value));
for (const template of planner.plannerTemplates) {
  const plan = planner.createTripPlan(template.id);
  assert.deepEqual(planner.decodeTripPlan(planner.encodeTripPlan(plan)), plan, template.id);
}
for (const id of ['first-timer-3','adventure-5','ultimate-7','winter-5','family-5']) {
  assert(planner.plannerTemplates.some(template => template.id === id), `Retain legacy template ${id}`);
}
for (const invalid of ['bad','null','[]','{}','x'.repeat(6001)]) assert.equal(planner.decodeTripPlan(invalid), null);
assert.equal(decode({ ...base, d:[['moraine']] }), null, 'Do not accept summer activities in a winter link');
assert.equal(decode({ ...base, d:[['town','town']] }), null, 'Reject duplicate activities within one day');
assert.equal(decode({ ...base, d:[['__proto__']] }), null, 'Do not accept inherited map properties');
assert.equal(decode({ ...base, d:[['<script>']] }), null, 'Only known activity identifiers are accepted');
assert.equal(decode({ ...base, d:[['town','culture','dinner','lake']] }), null, 'Reject overloaded shared state');
assert.equal(decode({ ...base, d:Array(8).fill([]) }), null, 'Reject overlong shared trips');
assert.equal(decode({ ...base, d:[] }), null, 'Keep at least one day');
assert(decode({ ...base, d:[[]] }), 'An open rest day is a valid plan');
assert.equal(decode({ ...base, b:'unknown' }), null);
assert.equal(decode({ ...base, t:'teleport' }), null);
const warnings = (base, transport, ids) => planner.tripPlanWarnings({ season:'winter', base, transport, days:[ids] });
assert(warnings('canmore','car-free',['dinner']).some(text => text.includes('final return')), 'Do not omit town-evening returns');
assert(warnings('banff','car-free',['canmore']).some(text => text.includes('Canmore')), 'Banff–Canmore still requires transport');
assert(warnings('louise','car-free',['town']).some(text => text.includes('Lake Louise')), 'Check the return to the overnight base');
assert(!warnings('canmore','drive',['ski']).some(text => text.includes('connection')), 'Do not give bus-connection advice to a driving plan');
assert(warnings('banff','car-free',['ski','town']).some(text => text.includes('main outing')), 'Flag a crowded full-day plan');
for (const base of ['banff','canmore','louise']) assert.equal(new URL(planner.tripStayUrl(base)).searchParams.get('camref'), '1101l3MtWX');
console.log(`Trip planner checks passed: ${planner.plannerTemplates.length} templates, legacy links, shared-state rejection, transport and affiliate invariants.`);
