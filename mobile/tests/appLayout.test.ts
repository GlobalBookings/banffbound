import assert from "node:assert/strict";
import { test } from "node:test";
import { appLayout } from "../src/lib/appLayout";

test("compact layouts keep bottom navigation and a single card column", () => {
  for (const width of [0, 320, 402, 466, 603]) {
    const layout = appLayout(width, 678, 21);
    assert.equal(layout.sidebarWidth, 0);
    assert.equal(layout.twoColumns, false);
  }
});

test("opened portrait has room for two cards and keeps bottom navigation", () => {
  const layout = appLayout(669, 903, 21);
  assert.equal(layout.sidebarWidth, 0);
  assert.equal(layout.twoColumns, true);
  assert.equal(layout.mapHeight, 480);
});

test("a sidebar leaves enough width for two columns and enough safe height for navigation", () => {
  const landscape = appLayout(869, 620, 21);
  assert.equal(landscape.sidebarWidth, 212);
  assert.equal(landscape.twoColumns, true);
  assert.equal(appLayout(849, 620, 21).sidebarWidth, 0);
  assert.equal(appLayout(869, 580, 21).sidebarWidth, 0);
  assert.equal(appLayout(1032, 1320, 21).sidebarWidth, 255);
});

test("a short wide display keeps bottom navigation and reduces map height", () => {
  const layout = appLayout(620, 442, 21);
  assert.equal(layout.sidebarWidth, 0);
  assert.equal(layout.twoColumns, true);
  assert.equal(layout.mapHeight, 300);
});
