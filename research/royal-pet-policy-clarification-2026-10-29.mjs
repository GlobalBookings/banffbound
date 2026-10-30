import assert from 'node:assert/strict';

// The official FAQ at https://royalcanadianlodge.com/contact/ was read on
// 2026-10-29. Historical landing/stay guards predate this one-field correction.
// Restore only the two exact reviewed source edits before those original
// whole-file digests run. Any other byte change remains a failure.
const previousPolicy = 'Confirm pet eligibility, accessible room requirements and rate terms directly. Ask for the complete quote including the operator’s local experience fee and parking; no fixed fee is quoted here.';
const reviewedPolicy = 'Ordinary pets are not permitted under the current official FAQ. Discuss service-animal arrangements and accessible room requirements directly. Ask for the complete quote including the operator’s local experience fee and parking; no fixed fee is quoted here.';
const addedSource = '\n    { label: "Official ordinary-pet exclusion FAQ", url: "https://royalcanadianlodge.com/contact/" },';

export function restorePriorHotelSource(filename, source) {
  assert.equal(typeof source, 'string');
  if (filename === 'src/data/hotels.ts') {
    assert.equal(source.split(reviewedPolicy).length, 2, 'One exact reviewed Royal policy correction');
    assert.ok(!source.includes(previousPolicy), 'The previous Royal uncertainty must be superseded');
    return source.replace(reviewedPolicy, previousPolicy);
  }
  if (filename === 'src/data/hotelDirectory.ts') {
    assert.equal(source.split(addedSource).length, 2, 'One exact official Royal pet FAQ source');
    return source.replace(addedSource, '');
  }
  return source;
}
