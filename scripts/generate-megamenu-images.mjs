#!/usr/bin/env node
/**
 * Generate megamenu card images using Gemini.
 *
 * Image specs:
 *   - Display size: 200px x 112px (16:9 aspect ratio, inside .mega-featured column)
 *   - File size: 400x225px (2x retina)
 *   - Format: PNG from Gemini, served as-is (small file at this resolution)
 *   - Location: public/images/menu/
 *
 * Usage: GEMINI_API_KEY=... node scripts/generate-megamenu-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'menu');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

if (!GEMINI_API_KEY) {
  console.error('Set GEMINI_API_KEY env var');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const CARDS = [
  // Things To Do
  {
    file: 'trail-map.png',
    prompt: 'A wide-angle aerial photograph of a hiking trail winding through the Canadian Rockies in Banff National Park, with mountains, pine forest, and a turquoise river below. Landscape orientation, 16:9 aspect ratio, vivid natural colors, golden hour lighting. No text or watermarks.',
  },
  {
    file: 'lakes.png',
    prompt: 'A stunning photograph of Moraine Lake in Banff National Park, showing the iconic turquoise water surrounded by the Valley of the Ten Peaks. Shot from the rockpile viewpoint. Landscape orientation, 16:9 aspect ratio, clear sky, summer day. No text or watermarks.',
  },
  {
    file: 'eat-and-drink.png',
    prompt: 'A cozy restaurant interior in Banff town with mountain views through large windows, warm wood decor, candles on tables, and plates of Canadian cuisine. Landscape orientation, 16:9 aspect ratio, warm evening lighting. No text or watermarks.',
  },
  // Plan Your Trip
  {
    file: 'planning-tools.png',
    prompt: 'A flat-lay photograph of trip planning items on a wooden table: a paper map of Banff National Park, hiking boots, a compass, binoculars, and a coffee mug with mountain scenery visible through a window behind. Landscape orientation, 16:9 aspect ratio, bright natural light. No text or watermarks.',
  },
  {
    file: 'what-to-do-today.png',
    prompt: 'A bright sunny morning in Banff town with the main street (Banff Avenue) leading towards Cascade Mountain, blue sky, people walking, shops and cafes visible. Summer day. Landscape orientation, 16:9 aspect ratio. No text or watermarks.',
  },
  {
    file: 'packing-list.png',
    prompt: 'A neatly organized hiking backpack with gear laid out: layers, rain jacket, water bottle, trail snacks, bear spray canister, and hiking poles, with the Canadian Rockies visible through a cabin window behind. Landscape orientation, 16:9 aspect ratio, warm natural light. No text or watermarks.',
  },
  // Safety
  {
    file: 'wildlife-safety.png',
    prompt: 'A grizzly bear in a meadow in Banff National Park with mountains in the background, photographed from a safe distance with a telephoto lens. The bear is grazing peacefully. Landscape orientation, 16:9 aspect ratio, morning light. No text or watermarks.',
  },
  {
    file: 'emergency-card.png',
    prompt: 'A mountain rescue scene in the Canadian Rockies: a Parks Canada ranger with a radio standing at a trailhead information board, with dramatic mountain peaks and alpine forest behind. Landscape orientation, 16:9 aspect ratio, clear sky. No text or watermarks.',
  },
  // Where To Stay
  {
    file: 'hotel-directory.png',
    prompt: 'The Fairmont Banff Springs Hotel (castle-like building) nestled among pine trees with the Bow River and Rocky Mountains in the background. Classic Banff landmark shot. Landscape orientation, 16:9 aspect ratio, golden hour. No text or watermarks.',
  },
  {
    file: 'lake-louise-hotels.png',
    prompt: 'The Fairmont Chateau Lake Louise hotel on the shore of Lake Louise with turquoise glacial water in the foreground and Victoria Glacier behind. Summer day. Landscape orientation, 16:9 aspect ratio. No text or watermarks.',
  },
  {
    file: 'luxury-resorts.png',
    prompt: 'A luxury mountain lodge room with floor-to-ceiling windows looking out at snow-capped Rocky Mountain peaks, a stone fireplace, and rustic-elegant Canadian decor. Landscape orientation, 16:9 aspect ratio, warm interior lighting. No text or watermarks.',
  },
];

async function generateImage(prompt) {
  const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }
  throw new Error('No image in response');
}

async function run() {
  console.log(`Generating ${CARDS.length} megamenu card images...\n`);
  console.log('Image specs: 400x225px (2x retina for 200x112 display at 16:9)\n');

  let success = 0;
  let fail = 0;

  for (const card of CARDS) {
    const outPath = path.join(OUT_DIR, card.file);

    if (fs.existsSync(outPath)) {
      console.log(`  SKIP  ${card.file} (already exists)`);
      success++;
      continue;
    }

    try {
      process.stdout.write(`  GEN   ${card.file}...`);
      const buf = await generateImage(card.prompt);
      fs.writeFileSync(outPath, buf);
      const kb = (buf.length / 1024).toFixed(0);
      console.log(` ${kb}KB`);
      success++;
      // Rate limit: wait 2s between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log(` FAIL: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${success} generated, ${fail} failed`);
}

run();
