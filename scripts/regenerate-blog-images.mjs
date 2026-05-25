#!/usr/bin/env node
/**
 * Batch-generate blog header images using Gemini, replacing generic Unsplash/Bynder stock photos.
 * 
 * Usage:  GEMINI_API_KEY=... node scripts/regenerate-blog-images.mjs
 *   --dry-run    List posts that need images without generating
 *   --limit N    Generate only the first N images (for testing)
 *   --concurrency N  Parallel requests (default 3)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BLOG_IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');
const POSTS_FILE = path.join(ROOT, 'src', 'data', 'blogPosts.ts');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : Infinity;
const CONCURRENCY = args.includes('--concurrency') ? parseInt(args[args.indexOf('--concurrency') + 1]) : 3;

// Topic-to-scene mapping for better Gemini prompts
const SCENE_HINTS = {
  ski: 'snow-covered ski slopes with skiers, fresh powder, bright winter sun, ski lift in background',
  skiing: 'snow-covered ski slopes with skiers, fresh powder, bright winter sun, ski lift in background',
  snowboard: 'snowboarder carving through deep powder snow on a mountain slope',
  winter: 'snow-covered Banff town with frosted evergreen trees, mountain backdrop, crisp blue winter sky',
  summer: 'lush green meadows with wildflowers, hikers on a trail, warm golden sunlight, mountain panorama',
  spring: 'melting snow on mountain peaks, early wildflowers, rushing creek, fresh green buds on trees',
  fall: 'golden larch trees on mountainside, vibrant autumn colors, lake reflection, clear blue sky',
  larch: 'brilliant golden larch trees covering a mountainside in autumn, Larch Valley, mountain backdrop',
  hike: 'hikers on a mountain trail with panoramic Rocky Mountain views, alpine meadows',
  hiking: 'hikers on a mountain trail with panoramic Rocky Mountain views, alpine meadows',
  trail: 'winding mountain trail through alpine forest leading toward dramatic peak',
  scrambl: 'exposed rocky mountain scramble route with dramatic views of valleys below',
  lake: 'crystal clear turquoise glacial lake surrounded by towering mountain peaks, mirror reflections',
  restaurant: 'cozy mountain restaurant interior with warm lighting, wooden beams, mountain view through windows',
  food: 'beautifully plated mountain cuisine in a rustic Banff restaurant setting',
  dining: 'elegant mountain dining experience with panoramic window views of Canadian Rockies',
  brunch: 'bright sunny mountain brunch spread with coffee, eggs benedict, mountain view through window',
  breakfast: 'cozy morning breakfast scene with mountain view, fresh pastries, steaming coffee',
  pizza: 'artisan wood-fired pizza in a cozy mountain restaurant in Banff',
  steak: 'premium Alberta beef steak dinner in an upscale Banff mountain restaurant',
  sushi: 'elegant sushi platter in a modern mountain-town restaurant setting',
  coffee: 'cozy mountain coffee shop interior with latte art, snowy peaks visible through the window',
  beer: 'craft beer flight at a mountain brewery with Banff mountain views through windows',
  distiller: 'artisan craft distillery with copper stills in a rustic mountain setting',
  whiskey: 'whiskey tasting flight in a cozy Banff mountain bar with warm wood interior',
  bar: 'lively mountain bar interior with warm lighting, local craft drinks, après-ski atmosphere',
  nightlife: 'vibrant Banff nightlife scene, warm lights on snowy streets, mountain town evening',
  nightclub: 'energetic nightclub scene in a mountain town with dancing and neon lights',
  club: 'lively mountain town nightclub with dance floor and mountain-themed decor',
  hotel: 'luxury mountain hotel exterior at dusk with warm lit windows and mountain backdrop',
  hostel: 'cozy mountain hostel common area with backpackers, mountain views, warm atmosphere',
  cabin: 'rustic log cabin in the Rocky Mountains surrounded by pine trees and snow',
  glamping: 'luxury glamping tent with mountain views, cozy interior with lanterns at dusk',
  camping: 'mountain campsite with tent beside a turquoise lake, campfire, starry sky, Rocky Mountains',
  rv: 'RV parked at a scenic mountain campsite with Rocky Mountain panorama',
  airbnb: 'charming mountain vacation rental with large windows overlooking Banff peaks',
  accommodation: 'cozy mountain lodge with warm fireplace, snow-covered peaks visible through windows',
  gondola: 'gondola cabin ascending above treeline with vast mountain panorama below',
  hot_spring: 'steaming natural hot springs pool with mountain views, misty morning atmosphere',
  wildlife: 'majestic elk standing in a misty mountain meadow at dawn, Rocky Mountains behind',
  bear: 'grizzly bear foraging in a wildflower meadow with mountain backdrop, telephoto shot',
  elk: 'bull elk with massive antlers in autumn meadow, misty mountain morning',
  moose: 'bull moose standing in a mountain lake at dawn, misty atmospheric conditions',
  goat: 'mountain goat perched on a rocky cliff edge with vast valley below',
  bird: 'bald eagle soaring over mountain valley with turquoise river below',
  dog: 'happy dog on a mountain trail with owner, scenic Rocky Mountain background',
  pet: 'dog-friendly mountain hotel patio with pets and mountain views',
  photography: 'photographer with camera on tripod capturing sunrise over mountain peaks',
  aurora: 'vibrant green and purple northern lights over mountain silhouettes and lake reflection',
  stargazing: 'milky way arching over mountain peaks with lake reflection, dark sky preserve',
  northern_lights: 'stunning aurora borealis display over Rocky Mountain peaks and a calm lake',
  sunset: 'dramatic golden sunset over mountain peaks with purple and orange clouds',
  sunrise: 'vivid pink and gold sunrise over mountain peaks reflected in still lake water',
  waterfall: 'powerful waterfall cascading down rocky cliff face surrounded by evergreen forest',
  canyon: 'deep limestone canyon with turquoise water, ice formations on canyon walls',
  drive: 'scenic mountain highway winding through valley with dramatic peaks on both sides',
  parkway: 'the Icefields Parkway winding through mountain valley with glaciers and peaks',
  budget: 'backpacker exploring Banff on foot, mountain town main street, affordable travel vibes',
  kid: 'family with children exploring a scenic mountain trail, fun outdoor adventure',
  family: 'family with children exploring a scenic mountain trail, fun outdoor adventure',
  toddler: 'toddler exploring nature on an easy mountain path with parents, wildflowers',
  teen: 'teenagers on an exciting mountain adventure, rock climbing or mountain biking',
  solo: 'solo traveler on a mountain summit overlooking vast Rocky Mountain panorama',
  romantic: 'couple watching sunset over mountain lake, romantic golden light, mountain silhouettes',
  honeymoon: 'romantic couple on a mountain lakeside at golden hour, intimate atmosphere',
  elopement: 'intimate mountain wedding ceremony on a dramatic cliff overlooking valley',
  proposal: 'romantic mountain proposal spot with stunning panoramic views at golden hour',
  valentine: 'romantic winter scene in Banff, couple walking snowy streets with hearts and lights',
  christmas: 'Banff town decorated for Christmas with snow, twinkling lights, mountain backdrop',
  new_year: 'festive New Year celebration with fireworks over snow-covered mountain town',
  thanksgiving: 'autumn harvest scene with mountain backdrop, warm golden colors, family gathering',
  festival: 'outdoor mountain festival with crowds, stages, and mountain backdrop',
  film: 'outdoor mountain film screening with audience watching under starry mountain sky',
  museum: 'rustic mountain museum interior with historical artifacts and mountain heritage displays',
  bike: 'mountain biker on an alpine trail with panoramic mountain views',
  run: 'trail runner on a mountain path at sunrise with Rocky Mountain panorama',
  climb: 'rock climber on a dramatic mountain face with vast valley below',
  ferrata: 'climber on via ferrata iron rungs on a dramatic cliff face, mountain panorama',
  raft: 'whitewater rafting through mountain rapids with towering peaks in background',
  fish: 'fly fisherman casting in a pristine mountain river with mountain backdrop',
  golf: 'mountain golf course with dramatic Rocky Mountain backdrop, emerald fairway',
  horseback: 'horseback riders on a mountain trail through alpine meadow',
  canoe: 'canoe on turquoise mountain lake with stunning peak reflections',
  swim: 'crystal clear mountain lake swimming spot surrounded by forest and peaks',
  ice_skate: 'ice skating on a frozen mountain lake with snow-covered peaks behind',
  snowshoe: 'snowshoers on a trail through snow-covered evergreen forest, mountain peaks',
  cross_country: 'cross-country skier gliding through snow-covered forest trail, mountain scenery',
  dog_sled: 'dog sled team racing through snowy mountain landscape',
  fat_bike: 'fat tire biker on a snowy mountain trail through frost-covered forest',
  tube: 'snow tubing on a groomed mountain hill with excited riders',
  heli: 'helicopter flying over dramatic mountain peaks and glaciers, pristine powder below',
  avalanche: 'dramatic mountain avalanche terrain with safety equipment in foreground',
  yoga: 'outdoor yoga session on mountain meadow with panoramic peak views at sunrise',
  wellness: 'mountain spa and wellness retreat with hot pools and mountain views',
  packing: 'organized hiking gear and mountain travel essentials laid out, mountains in background',
  car_rental: 'car driving scenic mountain highway through Canadian Rockies, dramatic views',
  bus: 'mountain shuttle bus at scenic stop with passengers and mountain views',
  park_pass: 'Parks Canada entrance gate with Rocky Mountains visible through the gateway',
  drone: 'dramatic aerial drone view of mountain valley with winding river below',
  phone: 'mountain summit with phone showing navigation app, panoramic mountain backdrop',
  digital_nomad: 'laptop workspace in mountain cafe with stunning mountain views through window',
  working: 'young people working in a vibrant mountain town, adventure lifestyle',
  volunteer: 'volunteers maintaining a mountain trail with tools, mountain backdrop',
  conservation: 'pristine mountain wilderness with clear river, untouched old-growth forest',
  climate: 'retreating glacier on a mountain face showing climate change effects',
  accessible: 'wheelchair-accessible mountain boardwalk with panoramic mountain and lake views',
  lgbtq: 'diverse group of friends celebrating on a mountain summit, rainbow pride, inclusivity',
  senior: 'active senior couple enjoying a scenic mountain viewpoint, gentle trail',
  group: 'large group of friends on a mountain summit, celebration, panoramic views',
  cruise: 'boat cruise on a turquoise mountain lake surrounded by towering peaks',
  helicopter: 'scenic helicopter flying over dramatic mountain glaciers and peaks',
  cave: 'entrance to a mountain cave with natural hot spring steam rising',
  picnic: 'scenic mountain picnic spot with spread of food, mountain lake backdrop',
  marathon: 'runners in a mountain marathon with dramatic Rocky Mountain scenery',
  crowd: 'busy Banff Avenue in summer with tourists, mountain backdrop, clear sky',
  shoulder: 'peaceful mountain scene in shoulder season, few visitors, changing colors',
  cost: 'Banff town main street with shops and restaurants, mountain budget travel',
  chinook: 'dramatic warm chinook wind arch cloud over Rocky Mountains in winter',
};

function getSceneHint(slug, title) {
  const text = `${slug} ${title}`.toLowerCase().replace(/['-]/g, '_');
  
  for (const [keyword, hint] of Object.entries(SCENE_HINTS)) {
    if (text.includes(keyword)) return hint;
  }
  
  return 'stunning panoramic view of the Canadian Rocky Mountains with turquoise lake and evergreen forest';
}

function buildPrompt(slug, title) {
  const scene = getSceneHint(slug, title);
  const cleanTitle = title.replace(/['"]/g, '').replace(/2026:?\s*/g, '').trim();
  
  return `Create a professional, photorealistic travel photograph for a blog article titled "${cleanTitle}". ` +
    `The scene should show: ${scene}. ` +
    `Location: Banff National Park, Canadian Rocky Mountains, Alberta, Canada. ` +
    `Style: Professional travel photography, golden hour lighting, vivid natural colors, ` +
    `sharp detail, cinematic wide-angle composition, National Geographic quality. ` +
    `Absolutely no text, no watermarks, no logos, no overlays. Pure landscape/scene photography.`;
}

function extractPosts() {
  const content = fs.readFileSync(POSTS_FILE, 'utf-8');
  const posts = [];

  // Split into individual post objects (between { and })
  const blockRegex = /\{\s*\n\s*slug:\s*'([^']+)'[\s\S]*?\n\s*\}/g;
  let block;

  while ((block = blockRegex.exec(content)) !== null) {
    const text = block[0];
    const slugMatch = text.match(/slug:\s*'([^']+)'/);
    const titleMatch = text.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
    const imageMatch = text.match(/image:\s*'([^']+)'/);

    if (slugMatch && titleMatch && imageMatch) {
      const slug = slugMatch[1];
      const title = titleMatch[1].replace(/\\'/g, "'");
      const image = imageMatch[1];

      if (image.startsWith('http')) {
        posts.push({ slug, title, image });
      }
    }
  }

  return posts;
}

async function generateGeminiImage(prompt) {
  const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  throw new Error('No image in Gemini response');
}

function updatePostsFile(slugToLocalPath) {
  let content = fs.readFileSync(POSTS_FILE, 'utf-8');
  let count = 0;

  for (const [slug, localPath] of Object.entries(slugToLocalPath)) {
    // Find the block for this slug and replace its image URL
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRegex = new RegExp(
      `(\\{\\s*\\n\\s*slug:\\s*'${escaped}'[\\s\\S]*?image:\\s*')https?://[^']+(')`
    );
    const before = content;
    content = content.replace(blockRegex, `$1${localPath}$2`);
    if (content !== before) count++;
  }

  fs.writeFileSync(POSTS_FILE, content);
  return count;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processInBatches(posts, concurrency) {
  const results = {};
  let completed = 0;
  let failed = 0;
  let skipped = 0;
  const total = posts.length;

  for (let i = 0; i < posts.length; i += concurrency) {
    const batch = posts.slice(i, i + concurrency);
    const promises = batch.map(async (post) => {
      const imgPath = path.join(BLOG_IMG_DIR, `${post.slug}.webp`);
      const publicUrl = `/images/blog/${post.slug}.webp`;

      // Skip if local image already exists
      if (fs.existsSync(imgPath)) {
        skipped++;
        completed++;
        console.log(`[${completed}/${total}] SKIP ${post.slug} (already exists)`);
        results[post.slug] = publicUrl;
        return;
      }

      const prompt = buildPrompt(post.slug, post.title);

      try {
        const buffer = await generateGeminiImage(prompt);
        fs.writeFileSync(imgPath, buffer);
        results[post.slug] = publicUrl;
        completed++;
        console.log(`[${completed}/${total}] OK   ${post.slug} (${(buffer.length / 1024).toFixed(0)}KB)`);
      } catch (err) {
        failed++;
        completed++;
        console.error(`[${completed}/${total}] FAIL ${post.slug}: ${err.message}`);

        // Rate limit retry once after a pause
        if (err.message.includes('429') || err.message.includes('RATE')) {
          console.log('  → Rate limited, waiting 30s and retrying...');
          await sleep(30000);
          try {
            const buffer = await generateGeminiImage(prompt);
            fs.writeFileSync(imgPath, buffer);
            results[post.slug] = publicUrl;
            failed--;
            console.log(`  → RETRY OK ${post.slug}`);
          } catch (retryErr) {
            console.error(`  → RETRY FAIL ${post.slug}: ${retryErr.message}`);
          }
        }
      }
    });

    await Promise.all(promises);

    // Small delay between batches to respect rate limits
    if (i + concurrency < posts.length) {
      await sleep(2000);
    }
  }

  return { results, completed, failed, skipped };
}

async function main() {
  if (!GEMINI_API_KEY && !DRY_RUN) {
    console.error('ERROR: GEMINI_API_KEY not set');
    process.exit(1);
  }

  fs.mkdirSync(BLOG_IMG_DIR, { recursive: true });

  const posts = extractPosts();
  console.log(`Found ${posts.length} blog posts with external image URLs`);

  if (DRY_RUN) {
    console.log('\n--- DRY RUN ---');
    for (const p of posts.slice(0, LIMIT)) {
      const exists = fs.existsSync(path.join(BLOG_IMG_DIR, `${p.slug}.webp`));
      console.log(`${exists ? 'SKIP' : 'GENERATE'} ${p.slug} → ${p.title.slice(0, 60)}`);
    }
    const needGen = posts.filter(p => !fs.existsSync(path.join(BLOG_IMG_DIR, `${p.slug}.webp`)));
    console.log(`\n${needGen.length} images to generate, ${posts.length - needGen.length} already exist`);
    return;
  }

  const postsToProcess = posts.slice(0, LIMIT);
  console.log(`Processing ${postsToProcess.length} posts (concurrency: ${CONCURRENCY})...\n`);

  const { results, failed, skipped } = await processInBatches(postsToProcess, CONCURRENCY);

  const generated = Object.keys(results).length - skipped;
  console.log(`\n--- DONE ---`);
  console.log(`Generated: ${generated}  |  Skipped: ${skipped}  |  Failed: ${failed}`);

  if (Object.keys(results).length > 0) {
    console.log(`\nUpdating blogPosts.ts...`);
    const updated = updatePostsFile(results);
    console.log(`Updated ${updated} image references in blogPosts.ts`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
