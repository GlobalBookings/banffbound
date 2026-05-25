#!/usr/bin/env node
/**
 * Live data fetcher orchestrator for BanffBound
 *
 * Runs all data fetchers in parallel and saves results as JSON files
 * to src/data/live/ for Astro pages to consume at build time.
 *
 * Usage: node scripts/fetch-live-data.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'src', 'data', 'live');

// Fetcher registry — each entry maps to a file in ./fetchers/
const FETCHERS = [
  {
    name: 'parks-canada',
    module: './fetchers/parks-canada.mjs',
    fn: 'fetchParksCanada',
    output: 'trail-conditions.json',
  },
  {
    name: 'environment-canada',
    module: './fetchers/environment-canada.mjs',
    fn: 'fetchWeather',
    output: 'weather.json',
  },
  {
    name: 'road-conditions',
    module: './fetchers/road-conditions.mjs',
    fn: 'fetchRoadConditions',
    output: 'roads.json',
  },
  {
    name: 'snow-report',
    module: './fetchers/snow-report.mjs',
    fn: 'fetchSnowReport',
    output: 'snow.json',
  },
  {
    name: 'seasonal',
    module: './fetchers/seasonal.mjs',
    fn: 'fetchSeasonal',
    output: 'season.json',
  },
];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function runFetcher(fetcher) {
  const start = Date.now();
  try {
    const mod = await import(fetcher.module);
    const data = await mod[fetcher.fn]();
    const outputPath = join(OUTPUT_DIR, fetcher.output);
    await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✅ ${fetcher.name} → ${fetcher.output} (${elapsed}s)`);
    return { name: fetcher.name, success: true, elapsed };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`❌ ${fetcher.name} failed (${elapsed}s): ${err.message}`);

    // Write fallback file so the build doesn't break
    try {
      const fallback = {
        updatedAt: new Date().toISOString(),
        error: `Fetcher failed: ${err.message}`,
      };
      const outputPath = join(OUTPUT_DIR, fetcher.output);
      await writeFile(outputPath, JSON.stringify(fallback, null, 2), 'utf-8');
    } catch {
      // ignore write errors
    }

    return { name: fetcher.name, success: false, elapsed, error: err.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  BanffBound — Live Data Fetch');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════\n');

  // Ensure output directory exists
  await ensureDir(OUTPUT_DIR);

  // Run all fetchers in parallel
  const results = await Promise.all(FETCHERS.map(runFetcher));

  // Summary
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n═══════════════════════════════════════');
  console.log(`  Done: ${succeeded} succeeded, ${failed} failed`);
  console.log('═══════════════════════════════════════');

  // Exit with error code only if ALL fetchers failed
  if (succeeded === 0 && FETCHERS.length > 0) {
    process.exit(1);
  }
}

main();
