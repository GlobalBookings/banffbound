import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';
import { getOAuth2Client } from '../core/google-auth.js';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const log = createLogger('content-publisher');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || process.env.SITE_URL;
const POSTS_PER_RUN = 3;
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';

function getRepoPaths() {
  return {
    root: WORK_DIR,
    blogData: path.join(WORK_DIR, 'src', 'data', 'blogPosts.ts'),
    blogPage: path.join(WORK_DIR, 'src', 'pages', 'blog', '[slug].astro'),
  };
}

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const EXPEDIA_LINK = 'https://www.expedia.ca/Hotel-Search?destination=Banff%2C+Alberta&camref=1101l3MtWX';
const GYG_LINK = 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO';

const CATEGORIES = ['Planning', 'Itineraries', 'Hiking', 'Guides', 'Seasonal', 'Tips', 'Accommodation', 'Food & Drink'];

// ── Generate image via DALL-E 3 ─────────────────────────────
async function generateImage(query, slug) {
  const { root } = getRepoPaths();
  const imgDir = path.join(root, 'public', 'images', 'blog');
  fs.mkdirSync(imgDir, { recursive: true });

  const imgPath = path.join(imgDir, `${slug}.webp`);
  const publicUrl = `/images/blog/${slug}.webp`;

  // Skip if image already exists (re-run protection)
  if (fs.existsSync(imgPath)) {
    log.info(`Image already exists: ${publicUrl}`);
    return publicUrl;
  }

  // Primary: DALL-E 3
  if (OPENAI_KEY) {
    try {
      const prompt = `Professional travel photography of ${query} in Banff National Park, Canadian Rockies, Alberta, Canada. ` +
        `Photorealistic, golden hour lighting, wide-angle landscape shot, stunning mountain scenery, ` +
        `crystal clear turquoise water where applicable, snow-capped peaks in background, ` +
        `no text or watermarks, National Geographic quality travel photo.`;

      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1792x1024',
          quality: 'standard',
          response_format: 'b64_json',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const b64 = data.data[0].b64_json;
        const buffer = Buffer.from(b64, 'base64');

        // Save as PNG first (DALL-E returns PNG), then we serve it directly
        const pngPath = imgPath.replace('.webp', '.png');
        fs.writeFileSync(pngPath, buffer);

        // Rename to keep consistent naming
        fs.renameSync(pngPath, imgPath);

        log.info(`DALL-E image generated: ${publicUrl} (${(buffer.length / 1024).toFixed(0)}KB)`);
        return publicUrl;
      } else {
        const err = await res.json().catch(() => ({}));
        log.warn(`DALL-E failed: ${err.error?.message || res.statusText}`);
      }
    } catch (err) {
      log.warn(`DALL-E error: ${err.message}`);
    }
  }

  // Fallback: Unsplash search
  if (UNSPLASH_KEY) {
    try {
      const searchTerm = `banff canada ${query}`;
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          // Download and save locally instead of hotlinking
          const photoUrl = data.results[0].urls.regular;
          const imgRes = await fetch(photoUrl);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            fs.writeFileSync(imgPath, buffer);
            log.info(`Unsplash image saved: ${publicUrl}`);
            return publicUrl;
          }
        }
      }
    } catch (err) {
      log.warn(`Unsplash fallback failed: ${err.message}`);
    }
  }

  // Last resort: curated Unsplash ID (external link)
  log.warn(`Using default fallback image for "${query}"`);
  return 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=1200&q=80';
}

// ── Clone or pull the repo ─────────────────────────────────
function ensureRepoCheckout() {
  if (!GH_TOKEN) throw new Error('GITHUB_TOKEN not set');

  const repoUrl = `https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git`;

  if (fs.existsSync(path.join(WORK_DIR, '.git'))) {
    log.info('Pulling latest from main...');
    execSync('git fetch origin main && git reset --hard origin/main', { cwd: WORK_DIR, stdio: 'pipe' });
  } else {
    log.info('Cloning repo...');
    fs.mkdirSync(WORK_DIR, { recursive: true });
    execSync(`git clone --depth 1 ${repoUrl} "${WORK_DIR}"`, { stdio: 'pipe' });
  }

  // Configure git identity
  execSync('git config user.email "agent@banffbound.com"', { cwd: WORK_DIR, stdio: 'pipe' });
  execSync('git config user.name "BanffBound Agent"', { cwd: WORK_DIR, stdio: 'pipe' });
}

// ── Get existing blog slugs ───────────────────────────────
function getExistingSlugs() {
  const { blogData } = getRepoPaths();
  const content = fs.readFileSync(blogData, 'utf8');
  const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  return new Set(slugs);
}

// ── Find content gaps from Search Console ─────────────────
async function findContentGaps() {
  const auth = getOAuth2Client();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];

  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 500,
      type: 'web',
    },
  });

  const rows = res.data.rows || [];
  const existingSlugs = getExistingSlugs();

  // Find queries where we have impressions but poor rankings (position > 15)
  // or queries that don't match any existing slug
  const gaps = [];

  for (const row of rows) {
    const query = row.keys[0].toLowerCase();

    // Skip very short or branded queries
    if (query.length < 8) continue;
    if (query.includes('banffbound')) continue;

    // Check if we already have a blog post roughly matching this query
    const querySlug = query.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const alreadyCovered = [...existingSlugs].some(slug => {
      const slugWords = slug.split('-');
      const queryWords = querySlug.split('-');
      const overlap = queryWords.filter(w => slugWords.includes(w) && w.length > 3);
      return overlap.length >= 2;
    });

    if (!alreadyCovered && row.impressions >= 2) {
      gaps.push({
        query,
        impressions: row.impressions,
        clicks: row.clicks,
        position: row.position,
      });
    }
  }

  // Score each gap: booking-intent queries get priority over informational ones.
  // Organic strategy: only write content that can generate affiliate revenue.
  const BOOKING_SIGNALS = ['hotel', 'hotels', 'stay', 'lodge', 'lodges', 'resort', 'resorts',
    'book', 'booking', 'tickets', 'ticket', 'tour', 'tours', 'guided', 'gondola',
    'cruise', 'rental', 'rentals', 'cabin', 'cabins', 'chalet', 'chalets',
    'accommodation', 'where to stay', 'best hotels', 'hostel', 'motel', 'inn',
    'price', 'prices', 'cost', 'deals', 'cheap', 'budget', 'luxury', 'spa',
    'admission', 'pass', 'shuttle', 'transfer'];
  const DEPRIORITIZE_SIGNALS = ['weather', 'forecast', 'webcam', 'map', 'directions',
    'history', 'meaning', 'population', 'wiki', 'distance', 'elevation',
    'rules', 'regulations', 'closed', 'hours'];

  for (const gap of gaps) {
    const words = gap.query.toLowerCase();
    let score = gap.impressions;
    // Boost booking-intent queries 3x
    if (BOOKING_SIGNALS.some(s => words.includes(s))) score *= 3;
    // Penalise purely informational queries
    if (DEPRIORITIZE_SIGNALS.some(s => words.includes(s))) score *= 0.3;
    gap._score = score;
  }

  gaps.sort((a, b) => b._score - a._score);

  // Deduplicate by topic cluster -- keep only the highest-impression
  // query per topic so we don't write 3 posts about "sandman hotel"
  const deduped = [];
  const usedClusters = new Set();

  for (const gap of gaps) {
    const words = gap.query.split(/\s+/).filter(w => w.length > 3);
    const clusterKey = words.sort().join(' ');

    // Check if any existing selected gap shares 2+ significant words
    const isDuplicate = deduped.some(existing => {
      const existingWords = existing.query.split(/\s+/).filter(w => w.length > 3);
      const overlap = words.filter(w => existingWords.includes(w));
      return overlap.length >= 2;
    });

    if (!isDuplicate) {
      deduped.push(gap);
    }
  }

  log.info(`Found ${gaps.length} raw gaps, ${deduped.length} unique topics from ${rows.length} queries`);
  return deduped;
}

// ── Generate a blog post via Claude ───────────────────────
async function generatePost(topic, relatedQueries) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const slug = topic.query
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);

  const queryContext = relatedQueries
    .map(q => `"${q.query}" (${q.impressions} impressions, position ${q.position.toFixed(0)})`)
    .join('\n');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-GB', { month: 'long' });
  const currentDate = new Date().toISOString().split('T')[0];

  const prompt = `Write a comprehensive, SEO-optimized blog post for a Banff, Canada travel guide website called BanffBound.

TODAY'S DATE: ${currentDate}
CURRENT YEAR: ${currentYear}

TARGET KEYWORD: "${topic.query}"

RELATED SEARCHES TO NATURALLY INCORPORATE:
${queryContext}

REQUIREMENTS:
1. Write 1200-1800 words of genuinely helpful, accurate content about Banff National Park
2. Use HTML formatting: <h2>, <h3>, <p>, <ul>/<li>, <strong>, <em>
3. Start with an engaging intro paragraph (no <h1>, the page template adds it)
4. Include 4-6 <h2> sections with detailed, practical information
5. Include a <div class="tip-box"><strong>Pro Tip:</strong> ...</div> somewhere in the article
6. IMPORTANT — Include affiliate links EARLY and CONTEXTUALLY, not just at the end:
   - After the first or second <h2>, include a natural contextual CTA linking to Expedia or GetYourGuide where it fits the content (e.g. "Compare hotel rates on <a href="${EXPEDIA_LINK}" target="_blank" rel="noopener sponsored">Expedia</a>" when discussing accommodation, or "Browse guided tours on <a href="${GYG_LINK}" target="_blank" rel="noopener sponsored">GetYourGuide</a>" when discussing activities)
   - Also end with a closing paragraph that includes both affiliate links
   - Expedia: <a href="${EXPEDIA_LINK}" target="_blank" rel="noopener sponsored">Expedia</a>
   - GetYourGuide: <a href="${GYG_LINK}" target="_blank" rel="noopener sponsored">GetYourGuide</a>
7. IMPORTANT — Include INTERNAL LINKS to relevant BanffBound pages. Use 2-4 of these where they naturally fit the content:
   - Hotel directory: <a href="/hotel-directory">Compare 95+ Banff hotels</a>
   - Tours page: <a href="/tours">Browse Banff tours</a>
   - Hiking guide: <a href="/blog/best-banff-hiking-trails-guide">best Banff hiking trails</a>
   - Lake Louise guide: <a href="/blog/lake-louise-complete-guide">Lake Louise guide</a>
   - Where to stay: <a href="/blog/where-to-stay-in-banff">where to stay in Banff</a>
   - 3-day itinerary: <a href="/blog/3-day-banff-itinerary">3-day Banff itinerary</a>
   - Food guide: <a href="/blog/best-banff-restaurants-where-to-eat">best Banff restaurants</a>
   - Activities: <a href="/activities">Banff activities</a>
8. All information must be accurate for Banff, Alberta, Canada (NOT Banff, Scotland)
9. Include practical details: prices in CAD, distances in km, specific trail names, real restaurant names, etc.
10. Mention Parks Canada where relevant
11. Write in a friendly, authoritative tone -- like a local sharing insider knowledge
12. CRITICAL: This is ${currentYear}. Any year references MUST say ${currentYear} or ${currentYear + 1}. NEVER reference 2024 or any past year as if it is current. If mentioning prices, seasons, or events, frame them for ${currentYear}.
13. Where relevant, reference the current season (it is ${currentMonth} ${currentYear})

CRITICAL: Return ONLY the HTML content, no markdown, no code fences, no preamble. Start with <p> and end with </p>.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  let html = response.content[0].text.trim();
  // Strip markdown code fences if Claude wraps the HTML
  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

  // Pick the best category based on the query
  let category = 'Guides';
  const q = topic.query.toLowerCase();
  if (q.includes('hik') || q.includes('trail') || q.includes('walk')) category = 'Hiking';
  else if (q.includes('hotel') || q.includes('stay') || q.includes('lodge') || q.includes('hostel')) category = 'Accommodation';
  else if (q.includes('itinerar') || q.includes('day')) category = 'Itineraries';
  else if (q.includes('winter') || q.includes('summer') || q.includes('spring') || q.includes('fall') || q.includes('ski')) category = 'Seasonal';
  else if (q.includes('eat') || q.includes('food') || q.includes('restaurant') || q.includes('drink')) category = 'Food & Drink';
  else if (q.includes('tip') || q.includes('how') || q.includes('what') || q.includes('cost') || q.includes('budget')) category = 'Tips';
  else if (q.includes('plan') || q.includes('pack') || q.includes('get to') || q.includes('drive')) category = 'Planning';

  // Generate a proper title from the query
  const titlePrompt = `Generate a click-worthy blog title for a Banff travel guide article about "${topic.query}". 
The current year is ${currentYear}. If the title benefits from a year (e.g. "Best X in Banff ${currentYear}"), include ${currentYear}. NEVER use 2024 or any past year.
Return ONLY the title text, nothing else. Make it 50-65 characters, include "Banff" if not already present.`;

  const titleResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: titlePrompt }],
  });

  const title = titleResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  // Generate meta description
  const descPrompt = `Write a 150-160 character meta description for a Banff travel guide article titled "${title}". 
The current year is ${currentYear}. If helpful, reference ${currentYear}. NEVER use 2024 or past years.
Return ONLY the description text.`;

  const descResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: descPrompt }],
  });

  const description = descResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  // Estimate read time from word count
  const wordCount = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(5, Math.ceil(wordCount / 200))} min read`;

  // Generate a relevant hero image
  const image = await generateImage(topic.query, slug);

  return {
    slug,
    title,
    description,
    date: new Date().toISOString().split('T')[0],
    category,
    image,
    readTime,
    html,
  };
}

// ── Write posts to codebase ───────────────────────────────
function writePostsToCodebase(posts) {
  const { blogData, blogPage } = getRepoPaths();

  // 1. Add metadata to blogPosts.ts
  let blogDataContent = fs.readFileSync(blogData, 'utf8');

  for (const post of posts) {
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
  }

  fs.writeFileSync(blogData, blogDataContent);
  log.info(`Added ${posts.length} entries to blogPosts.ts`);

  // 2. Add HTML content to [slug].astro
  let slugPageContent = fs.readFileSync(blogPage, 'utf8');

  for (const post of posts) {
    const contentEntry = `\n  '${post.slug}': \`\n${post.html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\n\`,`;

    slugPageContent = slugPageContent.replace(
      'const content: Record<string, string> = {',
      `const content: Record<string, string> = {${contentEntry}`
    );
  }

  fs.writeFileSync(blogPage, slugPageContent);
  log.info(`Added ${posts.length} content blocks to [slug].astro`);
}

// ── Git commit and push ───────────────────────────────────
function gitCommitAndPush(posts) {
  const { root } = getRepoPaths();
  const titles = posts.map(p => p.title).join(', ');
  const message = `Auto-publish ${posts.length} blog posts: ${titles.slice(0, 200)}`;

  try {
    execSync('git add src/data/blogPosts.ts "src/pages/blog/[slug].astro" public/images/blog/', { cwd: root, stdio: 'pipe' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: root, stdio: 'pipe' });
    execSync('git push origin main', { cwd: root, stdio: 'pipe' });
    log.info('Pushed to GitHub -- site rebuild triggered');
    return true;
  } catch (err) {
    log.error(`Git push failed: ${err.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  log.info('Content Auto-Publisher starting...');

  // 0. Clone/pull latest repo
  ensureRepoCheckout();

  // 1. Find content gaps
  const gaps = await findContentGaps();

  if (gaps.length === 0) {
    log.info('No content gaps found -- skipping');
    await sendSlack(
      [slackSection(':white_check_mark: Content Publisher: no gaps found today. All queries covered.')],
      'Content Publisher'
    );
    return { published: 0 };
  }

  log.info(`Top gaps: ${gaps.slice(0, 10).map(g => `"${g.query}" (${g.impressions} impr)`).join(', ')}`);

  // 2. Generate posts for top gaps
  const postsToWrite = [];
  const existingSlugs = getExistingSlugs();

  for (const gap of gaps.slice(0, POSTS_PER_RUN * 2)) {
    if (postsToWrite.length >= POSTS_PER_RUN) break;

    // Find related queries to give Claude more context
    const related = gaps.filter(g =>
      g !== gap && g.query.split(' ').some(w => gap.query.includes(w) && w.length > 3)
    ).slice(0, 3);

    try {
      const post = await generatePost(gap, [gap, ...related]);

      // Double-check slug doesn't already exist
      if (existingSlugs.has(post.slug)) {
        log.warn(`Slug "${post.slug}" already exists, skipping`);
        continue;
      }

      postsToWrite.push(post);
      existingSlugs.add(post.slug);
      log.info(`Generated: "${post.title}" (${post.readTime})`);
    } catch (err) {
      log.error(`Failed to generate post for "${gap.query}": ${err.message}`);
    }
  }

  if (postsToWrite.length === 0) {
    log.info('No posts generated -- skipping');
    return { published: 0 };
  }

  // 3. Write to codebase
  writePostsToCodebase(postsToWrite);

  // 4. Git commit and push
  const pushed = gitCommitAndPush(postsToWrite);

  // 5. Slack report
  const blocks = [
    slackHeader(`Content Publisher -- ${postsToWrite.length} Posts Published`),
    slackDivider(),
  ];

  for (const post of postsToWrite) {
    blocks.push(slackSection(
      `*${post.title}*\n` +
      `/${post.slug} | ${post.category} | ${post.readTime}\n` +
      `_Target: "${post.description.slice(0, 80)}..."_`
    ));
  }

  blocks.push(slackDivider());
  blocks.push(slackSection(
    pushed
      ? ':rocket: Pushed to GitHub -- site rebuild triggered automatically.'
      : ':warning: Posts written locally but git push failed. Manual push needed.'
  ));

  await sendSlack(blocks, `Published ${postsToWrite.length} blog posts`);

  log.info(`Content Publisher complete: ${postsToWrite.length} posts published`);
  return { published: postsToWrite.length };
}
