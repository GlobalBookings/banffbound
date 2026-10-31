import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { places, guides, dataVersion, plannerTemplatesForApp, contentProvenance, photoCredits } from '../src/data/catalog';
import { activityById, createTripPlan, decodeTripPlan, encodeTripPlan, activityFitsSeason, MAX_DAY_ACTIVITIES, MAX_TRIP_DAYS } from '../src/data/planner.generated';
import { calculateParkPassPlan, defaultParkPassInputs } from '../src/data/parkPass.generated';
import { calculateTripBudget, defaultTripBudget } from '../src/data/tripCost.generated';

test('launch catalogue has useful breadth without duplicate or empty records', () => {
  assert.ok(places.length >= 40);
  assert.equal(new Set(places.map(place => place.id)).size, places.length);
  assert.ok(guides.length >= 12);
  assert.equal(new Set(guides.map(guide => guide.id)).size, guides.length);
  for (const category of ['lakes', 'walks', 'attractions', 'food', 'stays', 'winter', 'essentials']) {
    assert.ok(places.some(place => place.category === category), 'Missing ' + category);
  }
  for (const place of places) {
    assert.ok(place.description.length > 35, place.id);
    assert.ok(place.tips.length >= 1, place.id);
    assert.ok(place.tips.every(tip => tip.trim().length > 15), place.id);
    assert.equal(new URL(place.sourceUrl).protocol, 'https:', place.id);
    assert.equal(new URL(place.guideUrl).hostname, 'banffbound.com', place.id);
    assert.match(place.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, place.id);
    assert.equal(Number.isNaN(Date.parse(place.reviewedAt)), false, place.id);
    if (place.offlineGuideId) assert.ok(guides.some(guide => guide.id === place.offlineGuideId), place.id);
    if (place.plannerActivityId) assert.ok(activityById[place.plannerActivityId], place.id);
    assert.equal('status' in place, false, 'No live opening or safety status in an editorial record');
  }
});

test('coordinate confidence is preserved and unavailable locations do not acquire map pins', () => {
  for (const place of places) {
    if (place.coordinateStatus === 'unavailable') {
      assert.equal(place.latitude, undefined, place.id);
      assert.equal(place.longitude, undefined, place.id);
    } else {
      assert.ok(Number.isFinite(place.latitude) && Number.isFinite(place.longitude), place.id);
      assert.ok(place.latitude! >= -90 && place.latitude! <= 90, place.id);
      assert.ok(place.longitude! >= -180 && place.longitude! <= 180, place.id);
      if (place.coordinateStatus === 'verified') assert.equal(new URL(place.coordinateSource!).protocol, 'https:', place.id);
      else assert.ok(place.coordinateNote?.toLowerCase().includes('indicative'), place.id);
    }
  }
  const hotel = places.find(place => place.id === 'fairmont-banff-springs');
  assert.equal(hotel?.coordinateStatus, 'verified');
  assert.equal(places.find(place => place.id === 'lake-louise')?.coordinateStatus, 'indicative');
  assert.equal(places.find(place => place.id === 'the-iron-goat')?.coordinateStatus, 'unavailable');
});

test('offline guides contain their actual content and retain source/review identity', () => {
  for (const guide of guides) {
    assert.ok(guide.summary.length > 35, guide.id);
    assert.ok(guide.sections.length >= 3, guide.id);
    assert.ok(guide.sections.every(section => section.title.length > 5 && section.body.length > 60), guide.id);
    assert.ok(guide.sections.every(section => !/<(?:script|iframe|style)\b/i.test(section.body)), guide.id);
    assert.equal(new URL(guide.sourceUrl).protocol, 'https:');
    assert.match(guide.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.ok(guides.find(guide => guide.id === 'moraine-lake')?.sections.some(section => /winter/i.test(section.title)));
  assert.ok(guides.find(guide => guide.id === 'car-free')?.sections.some(section => /return/i.test(section.body)));
});

test('all six launch templates round-trip and respect season and plan limits', () => {
  assert.equal(plannerTemplatesForApp.length, 6);
  const seasons = new Set<string>();
  for (const id of plannerTemplatesForApp) {
    const plan = createTripPlan(id);
    seasons.add(plan.season);
    assert.deepEqual(decodeTripPlan(encodeTripPlan(plan)), plan, id);
    assert.ok(plan.days.length >= 1 && plan.days.length <= MAX_TRIP_DAYS);
    for (const day of plan.days) {
      assert.ok(day.length <= MAX_DAY_ACTIVITIES);
      assert.equal(new Set(day).size, day.length);
      for (const activityId of day) assert.ok(activityFitsSeason(activityById[activityId], plan.season), activityId);
    }
  }
  assert.deepEqual([...seasons].sort(), ['summer', 'winter']);
});

test('mobile publishes the calculator logic and does not reinterpret unknown quotes as zero totals', () => {
  const admission = calculateParkPassPlan(defaultParkPassInputs);
  assert.equal(admission.state, 'compare');
  assert.ok(admission.rows.length > 0);
  const budget = calculateTripBudget(defaultTripBudget);
  assert.equal(budget.errors.length, 0);
  assert.equal(budget.plans[0].complete, false);
  assert.equal(budget.plans[0].totalCents, null);
  assert.ok(budget.plans[0].missingCount > 0);
});

test('generated modules exactly preserve the current reviewed source and its hashes', async () => {
  for (const [original, generated] of [
    ['src/data/tripPlanner.ts', 'planner.generated.ts'],
    ['src/data/parkPassPlanning.ts', 'parkPass.generated.ts'],
    ['src/data/tripCostPlanning.ts', 'tripCost.generated.ts'],
  ]) {
    const originalText = await readFile(new URL('../../' + original, import.meta.url), 'utf8');
    const generatedText = await readFile(new URL('../src/data/' + generated, import.meta.url), 'utf8');
    assert.equal(createHash('sha256').update(originalText).digest('hex'), contentProvenance[original as keyof typeof contentProvenance]);
    assert.equal(generatedText.split('\n').slice(2).join('\n'), originalText);
  }
  assert.match(dataVersion, /^2026-10-30-[a-f0-9]{12}$/);
});

test('used documented winter photographs retain attribution and licence records', () => {
  const usedPaths = places.map(place => place.image ? new URL(place.image).pathname : '').filter(path => path.startsWith('/images/winter-activities/'));
  assert.ok(usedPaths.length >= 7);
  for (const imagePath of usedPaths) {
    const credit = photoCredits.find(item => item.src === imagePath);
    assert.ok(credit, imagePath);
    assert.ok(credit.author.length > 1);
    assert.equal(new URL(credit.sourceUrl).protocol, 'https:');
    assert.equal(new URL(credit.licenseUrl).protocol, 'https:');
    assert.ok(credit.changeNote.length > 5);
  }
});
