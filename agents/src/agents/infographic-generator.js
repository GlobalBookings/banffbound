import Anthropic from '@anthropic-ai/sdk';
import puppeteer from 'puppeteer';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const log = createLogger('infographic-gen');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const INFOGRAPHIC_FILE = path.join(DATA_DIR, 'infographics.json');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ── DALL-E 3 image generation ─────────────────────────────

async function generateIllustration(prompt, size = '1792x1024') {
  if (!OPENAI_KEY) {
    log.warn('No OPENAI_API_KEY — using placeholder');
    return null;
  }
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, quality: 'hd', response_format: 'b64_json' }),
    });
    if (!res.ok) { log.warn(`DALL-E error: ${res.status}`); return null; }
    const data = await res.json();
    return `data:image/png;base64,${data.data[0].b64_json}`;
  } catch (err) {
    log.warn(`DALL-E failed: ${err.message}`);
    return null;
  }
}

// ── Render HTML to PNG ────────────────────────────────────

async function renderToPNG(html, outputPath, width = 1200) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width, height: 800, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  const body = await page.$('body');
  const box = await body.boundingBox();
  await page.setViewport({ width, height: Math.ceil(box.height), deviceScaleFactor: 2 });
  await page.screenshot({ path: outputPath, fullPage: true, type: 'png' });
  await browser.close();
  log.info(`Rendered PNG: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB)`);
}

// ── The 5 Infographic Definitions ─────────────────────────

const INFOGRAPHICS = [
  {
    id: 'banff-elevation-cross-section',
    title: 'Banff National Park Elevation Cross-Section',
    subtitle: 'Every Major Peak, Lake & Trail at True Elevation',
    style: 'poster',
    dallePrompts: [
      'A dramatic panoramic landscape photograph of the Banff National Park mountain skyline in Alberta Canada, showing the iconic wedge shape of Mount Rundle on the left, the pointed summit of Cascade Mountain in the centre, and snow-capped peaks stretching toward Lake Louise on the right. The foreground shows the turquoise Bow River winding through dense evergreen forest in the Bow Valley. Golden hour lighting with warm amber tones on the peaks and deep blue-purple shadows in the valleys. Crisp HD detail on the rock faces and snow. Cinematic wide-angle composition, photorealistic, National Geographic quality. No text, no watermarks, no people.',
    ],
    buildHTML: (images) => buildElevationCrossSection(images),
  },
  {
    id: 'banff-hike-decision-tree',
    title: 'Which Banff Hike Is Perfect For You?',
    subtitle: 'Follow the Path to Your Ideal Trail',
    style: 'modern',
    dallePrompts: [
      'A wide landscape photograph looking down a forested hiking trail in Banff National Park with towering snow-capped Rocky Mountain peaks ahead, dense green pine forest on both sides, wildflowers on the trail edges, blue sky with a few clouds. The trail leads toward a dramatic mountain valley. Bright, inviting, HD photorealistic quality. Shallow depth of field on the foreground trail. National Geographic adventure photography style. No text, no watermarks, no people.',
    ],
    buildHTML: (images) => buildHikeDecisionTree(images),
  },
  {
    id: 'icefields-parkway-illustrated-map',
    title: 'The Icefields Parkway: Every Stop on Canada\'s Most Scenic Drive',
    subtitle: '232 km from Lake Louise to Jasper — Illustrated Guide',
    style: 'poster',
    dallePrompts: [
      'A stunning aerial photograph of the Icefields Parkway highway in Banff and Jasper National Parks, Alberta Canada. The winding two-lane road cuts through a dramatic mountain valley with massive snow-covered peaks on both sides, turquoise glacial lakes visible below, the Columbia Icefield glacier in the distance, dense dark green pine forests, and a river running alongside the road. Golden hour light, cinematic drone perspective looking along the length of the highway. HD photorealistic, National Geographic quality. No text, no watermarks.',
    ],
    buildHTML: (images) => buildIcefieldsParkwayMap(images),
  },
  {
    id: 'banff-24-hours',
    title: '24 Hours in Banff: The Perfect Day',
    subtitle: 'Hour-by-Hour Guide from Sunrise to Stargazing',
    style: 'modern',
    dallePrompts: [
      'A four-panel photographic sequence of Mount Rundle and Vermilion Lakes in Banff National Park at four times of day, left to right: (1) vivid pink and orange sunrise reflected in the still lake water, (2) bright midday with deep blue sky and hikers on a nearby trail, (3) golden hour with warm amber light on the mountain peak and long shadows, (4) the Milky Way arching over the mountain silhouette with starry night sky. Each panel seamlessly transitions into the next. Photorealistic, cinematic, HD quality. No text, no watermarks.',
    ],
    buildHTML: (images) => build24HoursClock(images),
  },
  {
    id: 'banff-wildlife-field-guide',
    title: 'Banff Wildlife Field Guide',
    subtitle: 'What You\'ll See, Where to Find It & How to Stay Safe',
    style: 'mixed',
    dallePrompts: [
      'A photorealistic wildlife collage of animals found in Banff National Park, Canada, arranged on a natural forest background: a bull elk with large antlers, a black bear foraging, a grizzly bear catching fish, bighorn sheep on a rocky ledge, a white mountain goat on a cliff, a moose in a wetland, a small pika on alpine rocks, and a bald eagle in flight. Each animal is sharply detailed and naturally lit in its habitat. HD quality, National Geographic wildlife photography style. Rich natural colours, cinematic depth of field. No text, no watermarks.',
    ],
    buildHTML: (images) => buildWildlifeFieldGuide(images),
  },
];

// ── HTML Builders ─────────────────────────────────────────

function baseStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; background: #fafaf7; width: 1200px; }
    .header { background: linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%); padding: 50px 60px 45px; position: relative; overflow: hidden; }
    .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: #c8a96e; }
    .header h1 { color: #fff; font-size: 42px; line-height: 1.15; margin-bottom: 12px; letter-spacing: -0.5px; }
    .header .subtitle { color: #dfc9a0; font-family: Arial, sans-serif; font-size: 18px; font-weight: 400; }
    .footer { background: #1a3a2a; padding: 28px 60px; display: flex; justify-content: space-between; align-items: center; border-top: 5px solid #c8a96e; }
    .footer .brand { color: #fff; font-size: 22px; font-weight: 700; }
    .footer .tagline { color: #dfc9a0; font-family: Arial, sans-serif; font-size: 13px; }
    .footer .url { color: #c8a96e; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; }
    .section { padding: 40px 60px; }
    .section-title { color: #1a3a2a; font-size: 28px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #c8a96e; display: inline-block; }
    .tip-box { background: linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%); color: #fff; border-radius: 16px; padding: 28px 32px; margin: 30px 0; }
    .tip-box .tip-label { color: #c8a96e; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .tip-box p { font-family: Arial, sans-serif; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.9); }
    .badge { display: inline-block; background: #c8a96e; color: #1a3a2a; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
  `;
}

function buildElevationCrossSection(images) {
  const heroImg = images[0];
  const landmarks = [
    { name: 'Columbia Icefield', elev: 3747, type: 'peak', desc: 'Ancient glacier — walk on 300m-thick ice' },
    { name: 'Mt Temple', elev: 3543, type: 'peak', desc: 'Highest peak in Lake Louise area' },
    { name: 'Cascade Mountain', elev: 2998, type: 'peak', desc: 'Banff\'s iconic backdrop, visible from town' },
    { name: 'Sentinel Pass', elev: 2611, type: 'trail', desc: 'Highest maintained trail in the Canadian Rockies' },
    { name: 'Sulphur Mountain', elev: 2281, type: 'peak', desc: 'Ride the gondola ($72) or hike 5.5 km to summit' },
    { name: 'Bow Summit', elev: 2069, type: 'trail', desc: 'Highest point on Icefields Parkway. Peyto Lake viewpoint' },
    { name: 'Bow Lake', elev: 1920, type: 'lake', desc: 'Glacier-fed jewel beside the highway, low crowds' },
    { name: 'Moraine Lake', elev: 1884, type: 'lake', desc: 'Valley of the Ten Peaks — shuttle access only' },
    { name: 'Peyto Lake', elev: 1860, type: 'lake', desc: 'The most photographed viewpoint in the Rockies' },
    { name: 'Lake Louise', elev: 1731, type: 'lake', desc: 'Turquoise icon. Canoe, hike, or simply stare' },
    { name: 'Tunnel Mountain', elev: 1692, type: 'peak', desc: 'Best beginner summit — 1.5 hrs, sunrise views' },
    { name: 'Johnston Canyon', elev: 1500, type: 'trail', desc: 'Catwalk trail past frozen waterfalls in winter' },
    { name: 'Lake Minnewanka', elev: 1484, type: 'lake', desc: 'Largest lake in the park, boat cruises available' },
    { name: 'Town of Banff', elev: 1383, type: 'town', desc: 'Park hub at 1,383m — restaurants, shops, base camp' },
  ];

  const minElev = 1300, maxElev = 3800;
  const typeColors = { town: '#c8a96e', lake: '#4ea8de', trail: '#e67e22', peak: '#1a3a2a' };
  const typeLabels = { town: 'Town', lake: 'Lake', trail: 'Trail', peak: 'Peak' };

  // Horizontal bar chart: each landmark gets its own row, sorted high to low
  const barMaxWidth = 65; // percentage of container
  const getBarWidth = (elev) => ((elev - minElev) / (maxElev - minElev)) * barMaxWidth;

  const landmarkRows = landmarks.map((l, i) => {
    const w = getBarWidth(l.elev);
    const bg = i % 2 === 0 ? '#fff' : '#f8f7f4';
    return `
      <div style="display:grid; grid-template-columns:200px 80px 1fr; align-items:center; padding:14px 28px; background:${bg}; gap:16px;">
        <div>
          <div style="font-family:Georgia,serif; font-size:16px; font-weight:700; color:#1a3a2a; line-height:1.3;">${l.name}</div>
          <div style="font-family:Arial,sans-serif; font-size:11px; color:#6b6b6b; line-height:1.4; margin-top:2px;">${l.desc}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:Arial,sans-serif; font-size:18px; font-weight:800; color:#1a3a2a;">${l.elev.toLocaleString()}m</div>
          <div style="display:inline-block; background:${typeColors[l.type]}; color:#fff; font-family:Arial,sans-serif; font-size:9px; font-weight:700; padding:2px 8px; border-radius:8px; text-transform:uppercase; letter-spacing:0.5px; margin-top:3px;">${typeLabels[l.type]}</div>
        </div>
        <div style="position:relative; height:28px;">
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#f0ede6; border-radius:8px;"></div>
          <div style="position:absolute; top:0; left:0; width:${w}%; height:100%; background:linear-gradient(90deg, ${typeColors[l.type]}cc, ${typeColors[l.type]}); border-radius:8px; transition:width 0.3s;"></div>
        </div>
      </div>`;
  }).join('');

  // Elevation zone labels
  const zones = [
    { name: 'Alpine Tundra', range: 'Above 2,300m', desc: 'Bare rock, lichen, extreme wind. Only pikas and mountain goats.', color: '#8B7355' },
    { name: 'Subalpine', range: '1,800 — 2,300m', desc: 'Spruce-fir forests, alpine meadows, wildflowers in July.', color: '#2d5a3f' },
    { name: 'Montane Valley', range: 'Below 1,800m', desc: 'Lodgepole pine, elk habitat, rivers, and all the towns.', color: '#4a7c59' },
  ];

  const zoneCards = zones.map(z => `
    <div style="flex:1; background:#fff; border-radius:14px; padding:22px; border-top:5px solid ${z.color};">
      <div style="font-family:Georgia,serif; font-size:17px; font-weight:700; color:#1a3a2a; margin-bottom:4px;">${z.name}</div>
      <div style="font-family:Arial,sans-serif; font-size:12px; font-weight:700; color:${z.color}; margin-bottom:8px;">${z.range}</div>
      <div style="font-family:Arial,sans-serif; font-size:13px; color:#2c2c2c; line-height:1.6;">${z.desc}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><style>
    ${baseStyles()}
    .hero {
      position: relative; width: 100%; min-height: 450px; display: flex; align-items: flex-end;
      background: ${heroImg ? `url('${heroImg}') center/cover no-repeat` : 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%)'};
    }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(26,58,42,0.65) 55%, rgba(26,58,42,0.92) 100%); }
    .hero-content { position: relative; z-index: 2; padding: 50px 60px 40px; width: 100%; }
    .hero-content::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: #c8a96e; }
    .hero-content h1 { color: #fff; font-size: 44px; line-height: 1.12; margin-bottom: 12px; letter-spacing: -0.5px; text-shadow: 0 2px 20px rgba(0,0,0,0.4); }
    .hero-content .subtitle { color: #dfc9a0; font-family: Arial, sans-serif; font-size: 18px; font-weight: 400; text-shadow: 0 1px 8px rgba(0,0,0,0.5); }
    .legend { display: flex; gap: 24px; justify-content: center; padding: 20px 60px; background: #f0ede6; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-family: Arial, sans-serif; font-size: 13px; color: #2c2c2c; }
    .legend-dot { width: 14px; height: 14px; border-radius: 50%; }
    .chart-section { padding: 0; }
    .chart-header { padding: 30px 60px 16px; display: flex; justify-content: space-between; align-items: baseline; }
    .chart-header h2 { font-size: 26px; color: #1a3a2a; }
    .chart-header .scale-note { font-family: Arial, sans-serif; font-size: 12px; color: #6b6b6b; }
    .zones { display: flex; gap: 16px; padding: 30px 60px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 30px 60px; }
    .stat-card { background: #fff; border-radius: 16px; padding: 24px; text-align: center; border: 2px solid #f0ede6; }
    .stat-card .number { font-size: 36px; color: #1a3a2a; font-weight: 700; margin-bottom: 4px; }
    .stat-card .label { font-family: Arial, sans-serif; font-size: 13px; color: #6b6b6b; }
  </style></head><body>
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="badge" style="margin-bottom:16px;">Infographic</div>
        <h1>${INFOGRAPHICS[0].title}</h1>
        <div class="subtitle">${INFOGRAPHICS[0].subtitle}</div>
      </div>
    </div>
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#c8a96e;"></div> Towns</div>
      <div class="legend-item"><div class="legend-dot" style="background:#4ea8de;"></div> Lakes</div>
      <div class="legend-item"><div class="legend-dot" style="background:#e67e22;"></div> Trails &amp; Hikes</div>
      <div class="legend-item"><div class="legend-dot" style="background:#1a3a2a;"></div> Mountain Peaks</div>
    </div>
    <div class="chart-section">
      <div class="chart-header">
        <h2>14 Landmarks by Elevation</h2>
        <div class="scale-note">Highest → Lowest &nbsp;|&nbsp; Bar width = relative elevation</div>
      </div>
      ${landmarkRows}
    </div>
    <div style="padding:10px 60px 0;"><h2 style="font-size:24px; color:#1a3a2a; margin-bottom:4px;">Three Life Zones</h2><p style="font-family:Arial,sans-serif; font-size:13px; color:#6b6b6b;">The park spans three distinct ecosystems stacked by elevation</p></div>
    <div class="zones">${zoneCards}</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="number">6,641 km²</div><div class="label">Park Area</div></div>
      <div class="stat-card"><div class="number">3,747m</div><div class="label">Highest Point</div></div>
      <div class="stat-card"><div class="number">1,600+ km</div><div class="label">Hiking Trails</div></div>
      <div class="stat-card"><div class="number">1885</div><div class="label">Year Established</div></div>
    </div>
    <div class="tip-box" style="margin:0 60px 30px;">
      <div class="tip-label">Did You Know?</div>
      <p>Banff National Park spans an elevation range of over 2,400 metres — from the valley floor at 1,383m to glaciated peaks above 3,700m. This dramatic vertical relief creates wildly different ecosystems: montane forests in the valleys, subalpine meadows mid-slope, and bare alpine tundra above treeline (~2,300m). You can experience all three in a single day hike.</p>
    </div>
    <div class="footer">
      <div><div class="brand">⛰️ BanffBound.com</div><div class="tagline" style="margin-top:4px;">Your Complete Guide to Banff National Park</div></div>
      <div class="url">Share freely — just credit BanffBound.com</div>
    </div>
  </body></html>`;
}

function buildHikeDecisionTree(images) {
  const bgImg = images[0];
  const nodes = [
    { id: 'start', q: 'How much time do you have?', opts: [{ label: '1-2 hours', next: 'short' }, { label: '3-4 hours', next: 'medium' }, { label: 'Full day (5+hrs)', next: 'long' }] },
    { id: 'short', q: 'Are you with kids or prefer easy terrain?', opts: [{ label: 'Yes, keep it easy', next: 'r-tunnel' }, { label: 'No, I\'m fit', next: 'r-johnston' }] },
    { id: 'medium', q: 'What\'s your vibe?', opts: [{ label: 'Tea house at the top!', next: 'r-agnes' }, { label: 'Epic lake views', next: 'r-larch' }, { label: 'Fewer crowds', next: 'r-inkpots' }] },
    { id: 'long', q: 'How adventurous are you?', opts: [{ label: 'Challenge me', next: 'r-sentinel' }, { label: 'Epic but doable', next: 'r-sulphur' }, { label: 'Backcountry escape', next: 'r-healy' }] },
  ];
  const results = [
    { id: 'r-tunnel', name: 'Tunnel Mountain', stats: '4.3 km · 260m gain · Easy', desc: 'The perfect first hike in Banff. Summit views of the Bow Valley in under 90 minutes. Go for sunrise — you\'ll have it to yourself.', color: '#4CAF50' },
    { id: 'r-johnston', name: 'Johnston Canyon (Lower Falls)', stats: '2.4 km · 135m gain · Easy', desc: 'Catwalk trail bolted to canyon walls. Lower Falls in 30 min. Continue to Upper Falls for the full experience. Frozen waterfalls in winter.', color: '#4CAF50' },
    { id: 'r-agnes', name: 'Lake Agnes Tea House', stats: '7.2 km · 400m gain · Moderate', desc: 'Hike from Lake Louise to a rustic tea house perched above a mountain lake. Hot tea, fresh scones, 360° views. Reservations not needed.', color: '#FF9800' },
    { id: 'r-larch', name: 'Larch Valley', stats: '8.6 km · 535m gain · Moderate', desc: 'From Moraine Lake into a golden amphitheatre of larch trees (September). One of the most beautiful hikes in the Canadian Rockies.', color: '#FF9800' },
    { id: 'r-inkpots', name: 'Ink Pots via Johnston Canyon', stats: '11.6 km · 315m gain · Moderate', desc: 'Past the canyon crowds to a secret alpine meadow with vivid mineral springs. Most day-trippers turn back at Upper Falls — you keep going.', color: '#FF9800' },
    { id: 'r-sentinel', name: 'Sentinel Pass', stats: '11.6 km · 725m gain · Hard', desc: 'The highest maintained trail in the Canadian Rockies at 2,611m. Scramble through a narrow col with views that will ruin all other hikes for you.', color: '#e74c3c' },
    { id: 'r-sulphur', name: 'Sulphur Mountain', stats: '11 km · 700m gain · Hard', desc: 'Hike what tourists pay $72 to ride the gondola for. Boardwalk summit ridge with 360° views. Descend via gondola if your knees complain.', color: '#e74c3c' },
    { id: 'r-healy', name: 'Healy Pass to Egypt Lake', stats: '18.4 km · 655m gain · Hard', desc: 'A full-day backcountry epic through alpine meadows, past turquoise tarns, with barely another soul. This is the Banff that locals guard.', color: '#e74c3c' },
  ];

  const diffLabel = { '#4CAF50': 'EASY', '#FF9800': 'MODERATE', '#e74c3c': 'HARD' };

  let flowHTML = nodes.map(n => `
    <div style="text-align:center; margin-bottom:40px;">
      <div style="background:#1a3a2a; color:#fff; display:inline-block; padding:16px 32px; border-radius:50px; font-size:20px; font-weight:700; font-family:Georgia,serif;">${n.q}</div>
      <div style="display:flex; justify-content:center; gap:16px; margin-top:20px; flex-wrap:wrap;">
        ${n.opts.map(o => `<div style="background:#c8a96e; color:#1a3a2a; padding:12px 24px; border-radius:30px; font-family:Arial,sans-serif; font-size:15px; font-weight:700; cursor:pointer;">↓ ${o.label}</div>`).join('')}
      </div>
    </div>
  `).join('<div style="width:4px;height:30px;background:#c8a96e;margin:0 auto;border-radius:2px;"></div>');

  let resultCards = results.map(r => `
    <div style="background:#fff; border-radius:20px; padding:28px; border-left:6px solid ${r.color}; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
        <div style="font-size:22px; font-weight:700; color:#1a3a2a; font-family:Georgia,serif;">${r.name}</div>
        <div style="background:${r.color}; color:#fff; padding:4px 14px; border-radius:20px; font-family:Arial,sans-serif; font-size:12px; font-weight:700;">${diffLabel[r.color]}</div>
      </div>
      <div style="font-family:Arial,sans-serif; font-size:14px; color:#6b6b6b; margin-bottom:10px; font-weight:600;">${r.stats}</div>
      <div style="font-family:Arial,sans-serif; font-size:14px; color:#2c2c2c; line-height:1.7;">${r.desc}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><style>
    ${baseStyles()}
    .hero { position:relative; width:100%; min-height:400px; display:flex; align-items:flex-end; background:${bgImg ? `url('${bgImg}') center/cover no-repeat` : 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%)'}; }
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(26,58,42,0.65) 55%, rgba(26,58,42,0.92) 100%); }
    .hero-content { position:relative; z-index:2; padding:50px 60px 40px; width:100%; }
    .hero-content::after { content:''; position:absolute; bottom:0; left:0; right:0; height:6px; background:#c8a96e; }
    .hero-content h1 { color:#fff; font-size:44px; line-height:1.12; margin-bottom:12px; text-shadow:0 2px 20px rgba(0,0,0,0.4); }
    .hero-content .subtitle { color:#dfc9a0; font-family:Arial,sans-serif; font-size:18px; text-shadow:0 1px 8px rgba(0,0,0,0.5); }
    .flow-section { padding: 50px 60px; background: rgba(250,250,247,0.95); }
    .results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 40px 60px; }
  </style></head><body>
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="badge" style="margin-bottom:16px;">Interactive Guide</div>
        <h1>${INFOGRAPHICS[1].title}</h1>
        <div class="subtitle">${INFOGRAPHICS[1].subtitle}</div>
      </div>
    </div>
    <div class="flow-section">${flowHTML}</div>
    <div style="background:#1a3a2a; padding:20px 60px;"><h2 style="color:#c8a96e; font-size:26px; text-align:center;">Your Trail Results</h2></div>
    <div class="results-grid">${resultCards}</div>
    <div class="tip-box" style="margin:0 60px 30px;">
      <div class="tip-label">Essential Trail Tips</div>
      <p>Always carry bear spray ($50 from any outdoor shop in Banff). Start early — trailhead parking fills by 8am in summer. Check Parks Canada trail reports before you go. Lake access roads (Moraine Lake) require shuttle reservations June-October.</p>
    </div>
    <div class="footer">
      <div><div class="brand">⛰️ BanffBound.com</div><div class="tagline" style="margin-top:4px;">Your Complete Guide to Banff National Park</div></div>
      <div class="url">Share freely — just credit BanffBound.com</div>
    </div>
  </body></html>`;
}

function buildIcefieldsParkwayMap(images) {
  const mapImg = images[0];
  const stops = [
    { name: 'Lake Louise', km: 0, elev: '1,731m', time: '—', desc: 'Starting point. Fill up on fuel and grab coffee.', must: true },
    { name: 'Herbert Lake', km: 3, elev: '1,640m', time: '5 min', desc: 'First stop. Mirror reflections at dawn. Quick pullout.', must: false },
    { name: 'Hector Lake Viewpoint', km: 16, elev: '1,700m', time: '10 min', desc: 'Turquoise lake framed by peaks. Roadside viewpoint.', must: false },
    { name: 'Bow Lake', km: 36, elev: '1,920m', time: '30-60 min', desc: 'Stunning glacier-fed lake. Short walk to shore. Num-Ti-Jah Lodge.', must: true },
    { name: 'Bow Summit / Peyto Lake', km: 41, elev: '2,069m', time: '30-45 min', desc: 'Highest point on the parkway. THE classic viewpoint. Short uphill walk.', must: true },
    { name: 'Mistaya Canyon', km: 72, elev: '1,520m', time: '30 min', desc: 'Dramatic carved limestone canyon. Short walk from parking.', must: true },
    { name: 'Saskatchewan Crossing', km: 77, elev: '1,450m', time: '15 min', desc: '⛽ LAST FUEL for 150 km. Snacks and washrooms.', must: true },
    { name: 'Weeping Wall', km: 105, elev: '1,700m', time: '5 min', desc: 'Cascading waterfall cliffs. Best in spring/early summer.', must: false },
    { name: 'Parker Ridge', km: 118, elev: '2,135m', time: '2-3 hrs', desc: 'Best short hike on the parkway. Glacier views from the ridge.', must: true },
    { name: 'Columbia Icefield Centre', km: 127, elev: '1,950m', time: '2-3 hrs', desc: 'Walk on the Athabasca Glacier. Skywalk glass platform. Book ahead.', must: true },
    { name: 'Tangle Falls', km: 140, elev: '1,800m', time: '5 min', desc: 'Roadside waterfall. Quick photo stop.', must: false },
    { name: 'Sunwapta Falls', km: 175, elev: '1,400m', time: '30 min', desc: 'Powerful double waterfall. Short walk from parking.', must: true },
    { name: 'Athabasca Falls', km: 199, elev: '1,200m', time: '30 min', desc: 'Thundering falls, easy access. Multiple viewpoints.', must: true },
    { name: 'Jasper', km: 232, elev: '1,062m', time: '—', desc: 'Finish! Charming mountain town. Stay the night.', must: true },
  ];

  let stopCards = stops.map((s, i) => `
    <div style="display:grid; grid-template-columns:80px 60px 1fr 100px; gap:16px; align-items:center; padding:18px 24px; background:${s.must ? '#fff' : '#fafaf7'}; border-radius:14px; ${s.must ? 'border-left:5px solid #c8a96e; box-shadow:0 2px 12px rgba(0,0,0,0.06);' : 'border-left:5px solid #e0ddd6;'}">
      <div style="text-align:center;">
        <div style="font-family:Arial,sans-serif; font-size:28px; font-weight:800; color:#1a3a2a;">${s.km}</div>
        <div style="font-family:Arial,sans-serif; font-size:10px; color:#6b6b6b; text-transform:uppercase; letter-spacing:1px;">km</div>
      </div>
      <div style="text-align:center;">
        <div style="font-family:Arial,sans-serif; font-size:11px; color:#6b6b6b;">${s.elev}</div>
      </div>
      <div>
        <div style="font-size:17px; font-weight:700; color:#1a3a2a; font-family:Georgia,serif; margin-bottom:3px;">${s.must ? '⭐ ' : ''}${s.name}</div>
        <div style="font-family:Arial,sans-serif; font-size:13px; color:#2c2c2c; line-height:1.5;">${s.desc}</div>
      </div>
      <div style="text-align:right;">
        <div style="background:${s.must ? '#1a3a2a' : '#f0ede6'}; color:${s.must ? '#c8a96e' : '#6b6b6b'}; padding:6px 14px; border-radius:20px; font-family:Arial,sans-serif; font-size:12px; font-weight:600; display:inline-block;">${s.time}</div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><style>
    ${baseStyles()}
    .hero { position:relative; width:100%; min-height:450px; display:flex; align-items:flex-end; background:${mapImg ? `url('${mapImg}') center/cover no-repeat` : 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%)'}; }
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(26,58,42,0.6) 50%, rgba(26,58,42,0.93) 100%); }
    .hero-content { position:relative; z-index:2; padding:50px 60px 40px; width:100%; }
    .hero-content::after { content:''; position:absolute; bottom:0; left:0; right:0; height:6px; background:#c8a96e; }
    .hero-content h1 { color:#fff; font-size:38px; line-height:1.12; margin-bottom:12px; text-shadow:0 2px 20px rgba(0,0,0,0.4); }
    .hero-content .subtitle { color:#dfc9a0; font-family:Arial,sans-serif; font-size:18px; text-shadow:0 1px 8px rgba(0,0,0,0.5); }
    .stops-list { display:flex; flex-direction:column; gap:10px; padding:40px 60px; }
    .drive-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; padding:30px 60px; background:#f0ede6; }
    .drive-stat { text-align:center; }
    .drive-stat .val { font-size:32px; font-weight:700; color:#1a3a2a; }
    .drive-stat .lbl { font-family:Arial,sans-serif; font-size:12px; color:#6b6b6b; margin-top:2px; }
  </style></head><body>
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="badge" style="margin-bottom:16px;">Road Trip Guide</div>
        <h1>${INFOGRAPHICS[2].title}</h1>
        <div class="subtitle">${INFOGRAPHICS[2].subtitle}</div>
      </div>
    </div>
    <div class="drive-stats">
      <div class="drive-stat"><div class="val">232 km</div><div class="lbl">Total Distance</div></div>
      <div class="drive-stat"><div class="val">3-4 hrs</div><div class="lbl">Drive (No Stops)</div></div>
      <div class="drive-stat"><div class="val">8-10 hrs</div><div class="lbl">With All Stops</div></div>
      <div class="drive-stat"><div class="val">14</div><div class="lbl">Must-See Stops</div></div>
      <div class="drive-stat"><div class="val">2,069m</div><div class="lbl">Highest Point</div></div>
    </div>
    <div style="padding:30px 60px 10px;"><div class="section-title">Every Stop, South to North</div><div style="font-family:Arial,sans-serif; font-size:13px; color:#6b6b6b; margin-top:-16px;">⭐ = Don't skip this one</div></div>
    <div class="stops-list">${stopCards}</div>
    <div class="tip-box" style="margin:10px 60px 30px;">
      <div class="tip-label">Pro Tips</div>
      <p>Fill up at Saskatchewan Crossing (km 77) — it's the only fuel on the entire parkway. Start early from Lake Louise for the best light at Peyto Lake. The parkway is typically open year-round but can close temporarily for avalanche control in winter. Cell service is nonexistent for most of the drive — download offline maps.</p>
    </div>
    <div class="footer">
      <div><div class="brand">⛰️ BanffBound.com</div><div class="tagline" style="margin-top:4px;">Your Complete Guide to Banff National Park</div></div>
      <div class="url">Share freely — just credit BanffBound.com</div>
    </div>
  </body></html>`;
}

function build24HoursClock(images) {
  const heroImg = images[0];
  const hours = [
    { time: '5:00 AM', activity: 'Vermilion Lakes Sunrise', desc: 'Drive 5 min from town. Mt Rundle reflections in glass-still water. No crowds. Bring coffee.', icon: '🌅', period: 'dawn' },
    { time: '6:30 AM', activity: 'Grab Breakfast To-Go', desc: 'Wild Flour Bakery (opens 7am) or Whitebark Cafe. Fuel up before the trails.', icon: '☕', period: 'dawn' },
    { time: '7:30 AM', activity: 'Hit the Trail Early', desc: 'Lake Agnes Tea House hike from Lake Louise. Beat the crowds — parking fills by 8:30am.', icon: '🥾', period: 'morning' },
    { time: '11:00 AM', activity: 'Tea at the Tea House', desc: 'Hot tea + fresh scones 2,135m above sea level, overlooking a glacial lake. You earned this.', icon: '🍵', period: 'morning' },
    { time: '12:30 PM', activity: 'Moraine Lake Photo Stop', desc: 'Take the shuttle to the "Twenty Dollar View". Rockpile trail for the classic shot. 15 minutes.', icon: '📸', period: 'afternoon' },
    { time: '1:30 PM', activity: 'Lunch on Bear Street', desc: 'Skip Banff Ave. Bear Street has the locals\' spots: The Bison, Farm & Fire, Bear Street Tavern.', icon: '🍽️', period: 'afternoon' },
    { time: '3:00 PM', activity: 'Bow Falls & Hoodoos Walk', desc: 'Easy riverside walk. Dramatic falls + eerie rock formations. 45 min round trip.', icon: '🏞️', period: 'afternoon' },
    { time: '4:30 PM', activity: 'Banff Upper Hot Springs', desc: 'Soak at 38-40°C with mountain views. Towel + suit rental available. Pure mountain luxury.', icon: '♨️', period: 'afternoon' },
    { time: '6:00 PM', activity: 'Golden Hour from Sulphur Mountain', desc: 'Take the last gondola up ($72). Summit boardwalk in golden light. Descend as the valley glows.', icon: '🚠', period: 'golden' },
    { time: '8:00 PM', activity: 'Dinner at The Bison', desc: 'Alberta beef, elk tartare, craft cocktails. Reserve ahead. Best restaurant in Banff — locals agree.', icon: '🥩', period: 'golden' },
    { time: '9:30 PM', activity: 'Craft Beer on Bear Street', desc: 'Banff Ave Brewing Co or Three Bears Brewery. Flight of local brews. Patio if it\'s warm.', icon: '🍺', period: 'night' },
    { time: '10:30 PM', activity: 'Stargazing at Two Jack Lake', desc: 'Banff is a Dark Sky Preserve. Drive 15 min to Two Jack. Milky Way over the lake. Bring a blanket.', icon: '✨', period: 'night' },
  ];

  const periodColors = { dawn: '#f4845f', morning: '#4ea8de', afternoon: '#c8a96e', golden: '#e67e22', night: '#2c3e50' };
  const periodLabels = { dawn: 'DAWN', morning: 'MORNING', afternoon: 'AFTERNOON', golden: 'GOLDEN HOUR', night: 'NIGHT' };

  let hourCards = hours.map(h => `
    <div style="display:grid; grid-template-columns:90px 1fr; gap:20px; padding:24px 28px; background:#fff; border-radius:16px; border-left:5px solid ${periodColors[h.period]}; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <div style="text-align:center;">
        <div style="font-size:36px; margin-bottom:4px;">${h.icon}</div>
        <div style="font-family:Arial,sans-serif; font-size:16px; font-weight:800; color:#1a3a2a;">${h.time}</div>
        <div style="font-family:Arial,sans-serif; font-size:9px; font-weight:700; color:${periodColors[h.period]}; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">${periodLabels[h.period]}</div>
      </div>
      <div>
        <div style="font-size:19px; font-weight:700; color:#1a3a2a; font-family:Georgia,serif; margin-bottom:6px;">${h.activity}</div>
        <div style="font-family:Arial,sans-serif; font-size:14px; color:#2c2c2c; line-height:1.7;">${h.desc}</div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><style>
    ${baseStyles()}
    .hero { position:relative; width:100%; min-height:420px; display:flex; align-items:flex-end; background:${heroImg ? `url('${heroImg}') center/cover no-repeat` : 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%)'}; }
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(26,58,42,0.6) 50%, rgba(26,58,42,0.93) 100%); }
    .hero-content { position:relative; z-index:2; padding:50px 60px 40px; width:100%; }
    .hero-content::after { content:''; position:absolute; bottom:0; left:0; right:0; height:6px; background:#c8a96e; }
    .hero-content h1 { color:#fff; font-size:44px; line-height:1.12; margin-bottom:12px; text-shadow:0 2px 20px rgba(0,0,0,0.4); }
    .hero-content .subtitle { color:#dfc9a0; font-family:Arial,sans-serif; font-size:18px; text-shadow:0 1px 8px rgba(0,0,0,0.5); }
    .hours-list { display:flex; flex-direction:column; gap:12px; padding:40px 60px; }
  </style></head><body>
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="badge" style="margin-bottom:16px;">Day Planner</div>
        <h1>${INFOGRAPHICS[3].title}</h1>
        <div class="subtitle">${INFOGRAPHICS[3].subtitle}</div>
      </div>
    </div>
    <div class="hours-list">${hourCards}</div>
    <div class="tip-box" style="margin:0 60px 30px;">
      <div class="tip-label">Customize Your Day</div>
      <p>This itinerary works perfectly in summer (June-September). In winter, swap the hike for a Johnston Canyon ice walk, replace Moraine Lake with Lake Minnewanka, and add skiing at one of the Big 3 resorts. The hot springs and stargazing are even better in winter.</p>
    </div>
    <div class="footer">
      <div><div class="brand">⛰️ BanffBound.com</div><div class="tagline" style="margin-top:4px;">Your Complete Guide to Banff National Park</div></div>
      <div class="url">Share freely — just credit BanffBound.com</div>
    </div>
  </body></html>`;
}

function buildWildlifeFieldGuide(images) {
  const guideImg = images[0];
  const animals = [
    { name: 'Elk', latin: 'Cervus canadensis', where: 'Banff townsite, Bow Valley, golf course', when: 'Year-round (rut: Sep-Oct)', chance: '95%', safety: 'Keep 30m distance. Bulls are aggressive during rut season.', fact: 'Banff\'s elk population roams freely through town — you\'ll likely see them grazing on front lawns.', color: '#8B7355' },
    { name: 'Black Bear', latin: 'Ursus americanus', where: 'Bow Valley Parkway, Lake Minnewanka road', when: 'April — October', chance: '40%', safety: 'Carry bear spray. Make noise on trails. Never approach or feed.', fact: 'Despite the name, black bears in Banff can be brown, cinnamon, or blonde. Colour doesn\'t determine species.', color: '#2c2c2c' },
    { name: 'Grizzly Bear', latin: 'Ursus arctos horribilis', where: 'Icefields Parkway, Lake Louise area, backcountry', when: 'May — September', chance: '15%', safety: 'Travel in groups of 4+. Carry bear spray. Know the difference: grizzlies have a shoulder hump.', fact: 'Banff\'s grizzly population is estimated at only 60-80 bears. Each sighting is genuinely rare and special.', color: '#6B4226' },
    { name: 'Bighorn Sheep', latin: 'Ovis canadensis', where: 'Lake Minnewanka road, Mt Norquay road, highways', when: 'Year-round', chance: '70%', safety: 'Often near roads licking salt. Don\'t stop in traffic lanes. Keep 30m distance.', fact: 'Males (rams) headbutt at closing speeds of 60 km/h during fall rut. The sound echoes for kilometres.', color: '#A0937D' },
    { name: 'Mountain Goat', latin: 'Oreamnos americanus', where: 'Parker Ridge, Mt Norquay summit, high alpine', when: 'June — September', chance: '25%', safety: 'Usually at high elevation. They\'re curious but keep your distance — they lick rocks for minerals.', fact: 'Not actually goats — they\'re more closely related to antelopes. Their hooves have rubbery pads for grip.', color: '#E8E4D9' },
    { name: 'Moose', latin: 'Alces alces', where: 'Waterfowl Lakes, Icefields Parkway wetlands', when: 'Year-round (best: dawn)', chance: '10%', safety: 'Most dangerous large animal. Mothers with calves charge without warning. Keep 100m+ distance.', fact: 'The rarest large mammal to spot in Banff. If you see one, consider yourself seriously lucky.', color: '#4A3728' },
    { name: 'Pika', latin: 'Ochotona princeps', where: 'Sentinel Pass, Larch Valley, high-altitude rockfields', when: 'June — September', chance: '60%', safety: 'Harmless and adorable. Listen for their distinctive high-pitched "EEEP!" call from the rocks.', fact: 'Pikas don\'t hibernate — they spend summer harvesting "haystacks" of dried wildflowers to eat all winter.', color: '#B0A090' },
    { name: 'Bald Eagle', latin: 'Haliaeetus leucocephalus', where: 'Vermilion Lakes, Bow River, Lake Minnewanka', when: 'Year-round (best: winter near open water)', chance: '30%', safety: 'Keep 100m distance from nesting sites. Use binoculars or a telephoto lens.', fact: 'In winter, bald eagles congregate near open water sections of the Bow River to fish — one of the best viewing opportunities.', color: '#1a3a2a' },
  ];

  let animalCards = animals.map(a => `
    <div style="background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.06); border-top:5px solid ${a.color};">
      <div style="padding:24px 28px;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;">
          <div>
            <div style="font-size:22px; font-weight:700; color:#1a3a2a; font-family:Georgia,serif;">${a.name}</div>
            <div style="font-family:Arial,sans-serif; font-size:12px; color:#6b6b6b; font-style:italic;">${a.latin}</div>
          </div>
          <div style="background:${a.chance === '95%' || a.chance === '70%' ? '#4CAF50' : a.chance === '40%' || a.chance === '60%' || a.chance === '30%' ? '#FF9800' : '#e74c3c'}; color:#fff; padding:6px 14px; border-radius:20px; font-family:Arial,sans-serif; font-size:13px; font-weight:700;">${a.chance} chance</div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; margin:14px 0; font-family:Arial,sans-serif; font-size:13px;">
          <div><strong style="color:#1a3a2a;">Where:</strong> <span style="color:#2c2c2c;">${a.where}</span></div>
          <div><strong style="color:#1a3a2a;">When:</strong> <span style="color:#2c2c2c;">${a.when}</span></div>
        </div>
        <div style="background:#f0ede6; border-radius:12px; padding:14px 18px; margin:10px 0; font-family:Arial,sans-serif; font-size:13px; line-height:1.6; color:#2c2c2c;">
          <strong style="color:#c8a96e;">🔍 Fun fact:</strong> ${a.fact}
        </div>
        <div style="font-family:Arial,sans-serif; font-size:13px; line-height:1.6; color:#e74c3c;">
          <strong>⚠️ Safety:</strong> ${a.safety}
        </div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><style>
    ${baseStyles()}
    .hero { position:relative; width:100%; min-height:450px; display:flex; align-items:flex-end; background:${guideImg ? `url('${guideImg}') center/cover no-repeat` : 'linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%)'}; }
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(26,58,42,0.55) 50%, rgba(26,58,42,0.93) 100%); }
    .hero-content { position:relative; z-index:2; padding:50px 60px 40px; width:100%; }
    .hero-content::after { content:''; position:absolute; bottom:0; left:0; right:0; height:6px; background:#c8a96e; }
    .hero-content h1 { color:#fff; font-size:44px; line-height:1.12; margin-bottom:12px; text-shadow:0 2px 20px rgba(0,0,0,0.4); }
    .hero-content .subtitle { color:#dfc9a0; font-family:Arial,sans-serif; font-size:18px; text-shadow:0 1px 8px rgba(0,0,0,0.5); }
    .animals-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; padding:40px 60px; }
  </style></head><body>
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="badge" style="margin-bottom:16px;">Field Guide</div>
        <h1>${INFOGRAPHICS[4].title}</h1>
        <div class="subtitle">${INFOGRAPHICS[4].subtitle}</div>
      </div>
    </div>
    <div style="padding:30px 60px 10px;"><div class="section-title">8 Animals You Might Encounter</div></div>
    <div class="animals-grid">${animalCards}</div>
    <div class="tip-box" style="margin:10px 60px 30px;">
      <div class="tip-label">Wildlife Safety Essentials</div>
      <p>Parks Canada requires all visitors to stay at least 30m from elk/deer and 100m from bears/cougars/wolves. Use your car as a blind for roadside wildlife. Never feed any animal — it's illegal (up to $25,000 fine) and causes animals to be relocated or destroyed. Buy bear spray at any outdoor shop in Banff ($50) and know how to use it before you hit the trail.</p>
    </div>
    <div class="footer">
      <div><div class="brand">⛰️ BanffBound.com</div><div class="tagline" style="margin-top:4px;">Your Complete Guide to Banff National Park</div></div>
      <div class="url">Share freely — just credit BanffBound.com</div>
    </div>
  </body></html>`;
}

// ── Infographic state ─────────────────────────────────────

function loadInfographics() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(INFOGRAPHIC_FILE)) return JSON.parse(fs.readFileSync(INFOGRAPHIC_FILE, 'utf8'));
  return { published: [], lastRun: null };
}

function saveInfographics(data) {
  fs.writeFileSync(INFOGRAPHIC_FILE, JSON.stringify(data, null, 2));
}

// ── Repo management ───────────────────────────────────────

function ensureRepoCheckout() {
  if (!GH_TOKEN) throw new Error('GITHUB_TOKEN not set');
  const repoUrl = `https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git`;
  if (fs.existsSync(path.join(WORK_DIR, '.git'))) {
    execSync('git fetch origin main && git reset --hard origin/main', { cwd: WORK_DIR, stdio: 'pipe' });
  } else {
    fs.mkdirSync(WORK_DIR, { recursive: true });
    execSync(`git clone --depth 1 ${repoUrl} "${WORK_DIR}"`, { stdio: 'pipe' });
  }
  execSync('git config user.email "agent@banffbound.com"', { cwd: WORK_DIR, stdio: 'pipe' });
  execSync('git config user.name "BanffBound Agent"', { cwd: WORK_DIR, stdio: 'pipe' });
}

// ── Generate a single infographic ─────────────────────────

export async function generateOne(id) {
  const template = INFOGRAPHICS.find(i => i.id === id);
  if (!template) throw new Error(`Unknown infographic: ${id}`);

  log.info(`Generating: "${template.title}"`);

  // Generate DALL-E illustrations
  const images = [];
  for (const prompt of template.dallePrompts) {
    log.info('Generating DALL-E illustration...');
    const img = await generateIllustration(prompt);
    images.push(img);
  }

  // Build HTML
  const html = template.buildHTML(images);

  // Render to PNG
  const imgDir = path.join(DATA_DIR, '..', '..', 'public', 'images', 'infographics');
  fs.mkdirSync(imgDir, { recursive: true });
  const pngPath = path.join(imgDir, `${id}.png`);
  await renderToPNG(html, pngPath);

  // Also save HTML for reference
  const htmlPath = path.join(imgDir, `${id}.html`);
  fs.writeFileSync(htmlPath, html);

  return { id, title: template.title, pngPath, htmlPath, pngUrl: `/images/infographics/${id}.png` };
}

// ── Main scheduled run ────────────────────────────────────

export async function run() {
  log.info('Infographic Generator starting...');

  const state = loadInfographics();
  const publishedIds = new Set(state.published.map(p => p.id));
  const available = INFOGRAPHICS.filter(t => !publishedIds.has(t.id));

  if (available.length === 0) {
    log.info('All infographics published');
    await sendSlack([slackSection(':white_check_mark: Infographic Generator: all 5 published.')], 'Infographic Generator');
    return { published: 0 };
  }

  const template = available[0];
  const result = await generateOne(template.id);

  // Update state
  state.published.push({
    id: template.id,
    title: template.title,
    type: template.style,
    date: new Date().toISOString(),
    slug: template.id,
    infographicUrl: result.pngUrl,
    embedCode: `<a href="${SITE_URL}/blog/${template.id}"><img src="${SITE_URL}${result.pngUrl}" alt="${template.title}" style="max-width:100%;height:auto;" /></a><p>Source: <a href="${SITE_URL}">BanffBound.com</a></p>`,
  });
  state.lastRun = new Date().toISOString();
  saveInfographics(state);

  const sizeMB = (fs.statSync(result.pngPath).size / (1024 * 1024)).toFixed(1);

  await sendSlack([
    slackHeader('Infographic Generated'),
    slackSection(
      `:art: *${template.title}*\n` +
      `Style: ${template.style} | Size: ${sizeMB} MB\n` +
      `PNG: ${SITE_URL}${result.pngUrl}\n\n` +
      `_Remaining: ${available.length - 1} infographics queued_`
    ),
  ], `Infographic: ${template.title}`);

  return { published: 1, title: template.title, png: result.pngUrl };
}
