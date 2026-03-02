import Anthropic from '@anthropic-ai/sdk';
import { google } from 'googleapis';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const log = createLogger('shareable-content');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const SITE_URL = process.env.SITE_URL || 'https://banffbound.com';
const SC_URL = process.env.SEARCH_CONSOLE_SITE_URL || SITE_URL;
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const CONTENT_TYPES = [
  {
    type: 'comparison',
    templates: [
      'Banff vs Jasper: Which National Park Is Right For You?',
      'Lake Louise vs Moraine Lake: Complete Comparison Guide',
      'Banff Gondola vs Lake Louise Gondola: Which Ride Is Better?',
      'Staying in Banff vs Canmore: Pros, Cons & Price Comparison',
      'Banff in Summer vs Winter: Seasonal Comparison Guide',
      'Camping vs Hotels in Banff: What\'s the Best Way to Stay?',
      'Banff vs Whistler: Canadian Mountain Town Showdown',
      'Johnston Canyon vs Marble Canyon: Which Hike to Choose?',
    ],
  },
  {
    type: 'data-driven',
    templates: [
      'Banff National Park by the Numbers: Stats Every Visitor Should Know',
      'The True Cost of a Banff Trip: Budget Breakdown',
      'Banff Trail Difficulty Rankings: Every Trail Rated',
      'Banff Hotel Price Guide: Average Costs by Area and Season',
      'Busiest vs Quietest Times to Visit Banff: Month-by-Month Data',
      'Banff Wildlife Sighting Guide: Where and When to See Each Animal',
    ],
  },
  {
    type: 'ultimate-list',
    templates: [
      '50 Things to Do in Banff: The Complete Activity Checklist',
      'Every Viewpoint in Banff National Park: The Complete List',
      '25 Free Things to Do in Banff National Park',
      'Every Lake in Banff National Park Worth Visiting',
      'Complete Banff Restaurant Guide: Every Place to Eat Ranked',
      '30 Banff Photography Spots: Where to Get the Best Shots',
    ],
  },
  {
    type: 'seasonal-guide',
    templates: [
      'Banff in March: Complete Guide to Spring in the Rockies',
      'Banff in December: Winter Wonderland Travel Guide',
      'Banff in July: Peak Summer Planning Guide',
      'Banff in September: The Best Month to Visit?',
      'Banff in January: Northern Lights, Skiing & Frozen Adventures',
    ],
  },
];

const EXPEDIA_LINK = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const GYG_LINK = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';

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

function getExistingSlugs() {
  const blogData = path.join(WORK_DIR, 'src', 'data', 'blogPosts.ts');
  const content = fs.readFileSync(blogData, 'utf8');
  return new Set([...content.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]));
}

// ── Pick the best content to create ───────────────────────
async function pickContent(existingSlugs) {
  // Flatten all templates
  const allTemplates = CONTENT_TYPES.flatMap(ct =>
    ct.templates.map(t => ({ type: ct.type, title: t }))
  );

  // Filter out content that roughly matches existing slugs
  const available = allTemplates.filter(t => {
    const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    const words = slug.split('-').filter(w => w.length > 3);
    const isDuplicate = [...existingSlugs].some(existing => {
      const existingWords = existing.split('-');
      const overlap = words.filter(w => existingWords.includes(w));
      return overlap.length >= 3;
    });
    return !isDuplicate;
  });

  if (available.length === 0) return null;

  // Pick one randomly, weighted toward comparison and data-driven (more linkable)
  const weighted = available.flatMap(a => {
    if (a.type === 'comparison') return [a, a, a]; // 3x weight
    if (a.type === 'data-driven') return [a, a, a]; // 3x weight
    if (a.type === 'ultimate-list') return [a, a]; // 2x weight
    return [a]; // 1x weight
  });

  return weighted[Math.floor(Math.random() * weighted.length)];
}

// ── Generate image via DALL-E 3 ───────────────────────────
async function generateImage(topic, slug) {
  const imgDir = path.join(WORK_DIR, 'public', 'images', 'blog');
  fs.mkdirSync(imgDir, { recursive: true });

  const imgPath = path.join(imgDir, `${slug}.webp`);
  const publicUrl = `/images/blog/${slug}.webp`;

  if (fs.existsSync(imgPath)) return publicUrl;

  if (!OPENAI_KEY) {
    return 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=1200&q=80';
  }

  try {
    const prompt = `Professional travel photography of ${topic} in Banff National Park, Canadian Rockies. ` +
      `Photorealistic, golden hour, wide-angle landscape, stunning mountains, no text or watermarks.`;

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1792x1024', quality: 'standard', response_format: 'b64_json' }),
    });

    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync(imgPath, Buffer.from(data.data[0].b64_json, 'base64'));
      log.info(`Image generated: ${publicUrl}`);
      return publicUrl;
    }
  } catch (err) {
    log.warn(`DALL-E failed: ${err.message}`);
  }

  return 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=1200&q=80';
}

// ── Generate the shareable content ────────────────────────
async function generateContent(template) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-GB', { month: 'long' });

  const slug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

  const typeInstructions = {
    comparison: `Create a detailed comparison with a clear summary table at the top using <table> HTML. Include pros/cons for each option, who each is best for, and a final verdict.`,
    'data-driven': `Include specific numbers, statistics, and data points. Use HTML <table> elements for data presentation. Include real prices in CAD, real distances in km, and factual information.`,
    'ultimate-list': `Create a numbered list with detailed descriptions for each item. Include practical details (location, price, duration, difficulty where applicable). Group items into logical sections with <h2> headings.`,
    'seasonal-guide': `Cover weather, activities, what to pack, events, crowd levels, and prices for that specific month/season. Include a month-at-a-glance summary.`,
  };

  const prompt = `Write a comprehensive, highly shareable blog post for BanffBound, a Banff National Park travel guide.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}
CURRENT YEAR: ${currentYear}
CURRENT MONTH: ${currentMonth}

TITLE: "${template.title}"
CONTENT TYPE: ${template.type}

SPECIAL INSTRUCTIONS FOR THIS TYPE:
${typeInstructions[template.type]}

REQUIREMENTS:
1. Write 2000-3000 words -- this needs to be the definitive resource on this topic
2. Use HTML formatting: <h2>, <h3>, <p>, <ul>/<li>, <ol>/<li>, <table>, <strong>, <em>
3. Start with an engaging intro paragraph (no <h1>)
4. Make it the kind of content other sites would want to link to as a reference
5. Include a <div class="tip-box"><strong>Pro Tip:</strong> ...</div> for insider tips
6. Include a <div class="tip-box"><strong>Key Takeaway:</strong> ...</div> for summaries
7. All information must be accurate for Banff, Alberta, Canada
8. Include real prices in CAD, real distances, specific location names
9. End with affiliate links:
   - Expedia: <a href="${EXPEDIA_LINK}" target="_blank" rel="noopener sponsored">book accommodation on Expedia</a>
   - GetYourGuide: <a href="${GYG_LINK}" target="_blank" rel="noopener sponsored">book tours on GetYourGuide</a>
10. CRITICAL: This is ${currentYear}. Any year references MUST say ${currentYear}. NEVER reference 2024 or any past year as current.

CRITICAL: Return ONLY the HTML content. No markdown, no code fences. Start with <p> and end with </p>.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  let html = response.content[0].text.trim();
  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

  // Generate meta description
  const descResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: `Write a 150-160 character meta description for: "${template.title}". Current year is ${currentYear}. Return ONLY the text.` }],
  });
  const description = descResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  const wordCount = html.replace(/<[^>]*>/g, '').split(/\s+/).length;

  let category = 'Guides';
  if (template.type === 'comparison') category = 'Guides';
  else if (template.type === 'seasonal-guide') category = 'Seasonal';
  else if (template.type === 'ultimate-list') category = 'Guides';
  else if (template.type === 'data-driven') category = 'Tips';

  const image = await generateImage(template.title, slug);

  return {
    slug,
    title: template.title,
    description,
    date: new Date().toISOString().split('T')[0],
    category,
    image,
    readTime: `${Math.max(5, Math.ceil(wordCount / 200))} min read`,
    html,
    wordCount,
    type: template.type,
  };
}

// ── Write to codebase ─────────────────────────────────────
function writeToCodebase(post) {
  const blogData = path.join(WORK_DIR, 'src', 'data', 'blogPosts.ts');
  const blogPage = path.join(WORK_DIR, 'src', 'pages', 'blog', '[slug].astro');

  // Add metadata
  let blogDataContent = fs.readFileSync(blogData, 'utf8');
  const entry = `  {
    slug: '${post.slug}',
    title: '${post.title.replace(/'/g, "\\'")}',
    description: '${post.description.replace(/'/g, "\\'")}',
    date: '${post.date}',
    category: '${post.category}',
    image: '${post.image}',
    readTime: '${post.readTime}',
  },`;

  blogDataContent = blogDataContent.replace(
    'export const blogPosts: BlogPost[] = [',
    `export const blogPosts: BlogPost[] = [\n${entry}`
  );
  fs.writeFileSync(blogData, blogDataContent);

  // Add HTML content
  let slugPageContent = fs.readFileSync(blogPage, 'utf8');
  const contentEntry = `\n  '${post.slug}': \`\n${post.html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\n\`,`;

  slugPageContent = slugPageContent.replace(
    'const content: Record<string, string> = {',
    `const content: Record<string, string> = {${contentEntry}`
  );
  fs.writeFileSync(blogPage, slugPageContent);

  log.info(`Written to codebase: ${post.slug}`);
}

function gitCommitAndPush(post) {
  const message = `Auto-publish shareable content: ${post.title.slice(0, 150)}`;

  try {
    execSync('git add src/data/blogPosts.ts "src/pages/blog/[slug].astro" public/images/blog/', { cwd: WORK_DIR, stdio: 'pipe' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: WORK_DIR, stdio: 'pipe' });
    execSync('git push origin main', { cwd: WORK_DIR, stdio: 'pipe' });
    log.info('Pushed to GitHub');
    return true;
  } catch (err) {
    log.error(`Git push failed: ${err.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Shareable Content Generator starting...');

  ensureRepoCheckout();

  const existingSlugs = getExistingSlugs();
  const template = await pickContent(existingSlugs);

  if (!template) {
    log.info('All shareable templates already published');
    await sendSlack(
      [slackSection(':white_check_mark: Shareable Content: all templates used. Add new ones to expand.')],
      'Shareable Content'
    );
    return { published: 0 };
  }

  log.info(`Selected: "${template.title}" (${template.type})`);

  const post = await generateContent(template);
  log.info(`Generated: ${post.wordCount} words, ${post.readTime}`);

  writeToCodebase(post);
  const pushed = gitCommitAndPush(post);

  await sendSlack([
    slackHeader('Shareable Content Published'),
    slackSection(
      `:sparkles: *${post.title}*\n` +
      `Type: ${post.type} | ${post.wordCount} words | ${post.readTime}\n` +
      `URL: ${SITE_URL}/blog/${post.slug}\n\n` +
      `_${post.description}_`
    ),
    slackDivider(),
    slackSection(
      pushed
        ? ':rocket: Pushed to GitHub -- site rebuild triggered.'
        : ':warning: Written locally but push failed.'
    ),
  ], `Shareable content: ${post.title}`);

  return { published: 1, title: post.title, type: post.type, words: post.wordCount };
}
