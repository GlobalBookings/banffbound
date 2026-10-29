import { createLogger } from '../core/logger.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const log = createLogger('internal-linker');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';

const MAX_LINKS_PER_POST = 4;
const MAX_LINKS_PER_RUN = 40;
const MIN_INBOUND_THRESHOLD = 2;

// Related category pairs for topical matching
const RELATED_CATEGORIES = {
  'Hiking': ['Guides', 'Seasonal', 'Itineraries'],
  'Guides': ['Hiking', 'Planning', 'Seasonal', 'Tips'],
  'Accommodation': ['Planning', 'Itineraries', 'Tips'],
  'Planning': ['Accommodation', 'Tips', 'Itineraries', 'Guides'],
  'Itineraries': ['Hiking', 'Guides', 'Planning', 'Seasonal'],
  'Seasonal': ['Hiking', 'Guides', 'Itineraries'],
  'Tips': ['Planning', 'Guides', 'Accommodation'],
  'Food & Drink': ['Guides', 'Itineraries', 'Planning'],
};

const CONTENT_CHUNKS = ['blogContent.ts', 'blogContent3.ts'];

function getRepoPaths() {
  return {
    root: WORK_DIR,
    blogData: path.join(WORK_DIR, 'src', 'data', 'blogPosts.ts'),
    blogContentFiles: CONTENT_CHUNKS.map(f => path.join(WORK_DIR, 'src', 'data', f)),
  };
}

// ── Clone or pull the repo ─────────────────────────────────
function ensureRepoCheckout() {
  const GH_TOKEN = process.env.GITHUB_TOKEN;
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

  execSync('git config user.email "agent@banffbound.com"', { cwd: WORK_DIR, stdio: 'pipe' });
  execSync('git config user.name "BanffBound Agent"', { cwd: WORK_DIR, stdio: 'pipe' });
}

// ── Parse blog post metadata from blogPosts.ts ─────────────
function parseBlogPosts() {
  const { blogData } = getRepoPaths();
  const content = fs.readFileSync(blogData, 'utf8');

  const posts = [];
  const entryRegex = /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']*(?:\\.[^']*)*)',\s*description:\s*'([^']*(?:\\.[^']*)*)',\s*date:\s*'([^']+)',\s*category:\s*'([^']+)'/g;
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    posts.push({
      slug: match[1],
      title: match[2].replace(/\\'/g, "'"),
      description: match[3].replace(/\\'/g, "'"),
      date: match[4],
      category: match[5],
    });
  }

  log.info(`Parsed ${posts.length} blog posts from blogPosts.ts`);
  return posts;
}

// ── Parse HTML content blocks from blogContent chunk files ──
export function parseContentBlocks(raw) {
  const contentMap = {};
  const slugBlockRegex = /'([^']+)':\s*`([\s\S]*?)`(?:\s*,|\s*\})/g;
  for (const match of raw.matchAll(slugBlockRegex)) contentMap[match[1]] = match[2];
  return contentMap;
}

// Function replacement preserves literal dollar sequences in legacy HTML.
export function replaceContentBlock(raw, originalHTML, newHTML) {
  return raw.replace(originalHTML, () => newHTML);
}

function parseSlugContent() {
  const { blogContentFiles } = getRepoPaths();
  const contentMap = {};
  const fileContents = {};
  const slugToFile = {};

  for (const filePath of blogContentFiles) {
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, 'utf8');
    fileContents[filePath] = raw;
    for (const [slug, html] of Object.entries(parseContentBlocks(raw))) {
      contentMap[slug] = html;
      slugToFile[slug] = filePath;
    }
  }

  log.info(`Parsed ${Object.keys(contentMap).length} content blocks from ${Object.keys(fileContents).length} chunk files`);
  return { fileContents, contentMap, slugToFile };
}

// ── Extract existing internal links from HTML ──────────────
function extractInternalLinks(html) {
  const links = [];
  const linkRegex = /href="(\/blog\/[^"]+|\/hotel-directory[^"]*|\/tours[^"]*|\/activities[^"]*)"/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }

  return links;
}

// ── Build link graph across all posts ──────────────────────
function buildLinkMap(contentMap) {
  // outbound[slug] = [list of paths this post links to]
  // inbound[slug] = [list of slugs that link TO this post]
  const outbound = {};
  const inbound = {};

  for (const slug of Object.keys(contentMap)) {
    outbound[slug] = extractInternalLinks(contentMap[slug]);
    if (!inbound[slug]) inbound[slug] = [];
  }

  // Populate inbound from outbound links
  for (const [sourceSlug, links] of Object.entries(outbound)) {
    for (const link of links) {
      // Extract target slug from /blog/some-slug
      const blogMatch = link.match(/^\/blog\/([^/?#]+)/);
      if (blogMatch) {
        const targetSlug = blogMatch[1];
        if (!inbound[targetSlug]) inbound[targetSlug] = [];
        inbound[targetSlug].push(sourceSlug);
      }
    }
  }

  return { outbound, inbound };
}

// ── Get significant words from a string (length > 4) ──────
function getSignificantWords(text) {
  const stopWords = new Set(['about', 'their', 'there', 'these', 'those', 'which', 'where', 'would', 'could', 'should', 'being', 'after', 'before', 'under', 'above', 'between', 'through', 'during', 'other', 'every', 'while']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopWords.has(w));
}

// ── Calculate topical relevance between two posts ──────────
function calculateRelevance(postA, postB) {
  let score = 0;

  // Word overlap in slug
  const slugWordsA = getSignificantWords(postA.slug.replace(/-/g, ' '));
  const slugWordsB = getSignificantWords(postB.slug.replace(/-/g, ' '));
  const slugOverlap = slugWordsA.filter(w => slugWordsB.includes(w)).length;
  score += slugOverlap * 3;

  // Word overlap in title
  const titleWordsA = getSignificantWords(postA.title);
  const titleWordsB = getSignificantWords(postB.title);
  const titleOverlap = titleWordsA.filter(w => titleWordsB.includes(w)).length;
  score += titleOverlap * 2;

  // Same category
  if (postA.category === postB.category) {
    score += 2;
  }

  // Related categories
  const related = RELATED_CATEGORIES[postA.category] || [];
  if (related.includes(postB.category)) {
    score += 1;
  }

  return score;
}

// ── Insert only an existing, exact multiword phrase ────────
// Exported for offline regression checks. Importing this module never runs the
// agent, loads Slack, checks out a repository, writes content or makes requests.
export function insertLinkIntoHTML(html, targetSlug, anchorText, retiredSlugs = new Set()) {
  if (typeof html !== 'string' || typeof targetSlug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetSlug) || retiredSlugs.has(targetSlug)) return null;
  const targetPath = `/blog/${targetSlug}`;
  const hrefs = html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi);
  for (const [, , href] of hrefs) {
    if (href.split(/[?#]/, 1)[0].replace(/\/$/, '') === targetPath) return null;
  }

  // Never replace a lone generic word (such as "Banff") with a post title.
  // The visible anchor always remains the exact phrase already in the prose.
  const phrases = [...new Set([
    typeof anchorText === 'string' ? anchorText.trim() : '',
    targetSlug.replace(/-/g, ' '),
    targetSlug.replace(/^(?:best|complete|ultimate)-/, '').replace(/-(?:(?:complete|ultimate|travel)-)?guide$/, '').replace(/-/g, ' '),
  ])].filter(phrase => phrase.split(/\s+/).length >= 2 && phrase.length >= 8)
    .sort((a, b) => b.length - a.length);
  if (!phrases.length) return null;
  const patterns = phrases.map(phrase => new RegExp(
    `(?<![a-z0-9])${phrase.split(/\s+/).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')}(?![a-z0-9])`, 'i'
  ));

  // Tokenize tags including quoted attributes, comments and raw/protected
  // elements. Only plain paragraph text outside these contexts is eligible.
  // Paragraphs containing any inline markup are deliberately left unchanged.
  const protectedTags = new Set(['a', 'script', 'style', 'pre', 'code', 'textarea', 'button', 'select', 'template', 'noscript', 'svg', 'math']);
  const tokens = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\/?([a-z][a-z0-9:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  const protectedStack = [];
  let paragraph = null;
  for (const token of html.matchAll(tokens)) {
    const markup = token[0];
    const name = token[1]?.toLowerCase();
    const closing = /^<\//.test(markup);
    if (name === 'p' && closing) {
      if (paragraph && !paragraph.hasMarkup && !protectedStack.length) {
        const text = html.slice(paragraph.start, token.index);
        if (text.length >= 80 && !/[<>]/.test(text)) {
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (!match) continue;
            const offset = paragraph.start + match.index;
            const link = `<a href="${targetPath}">${match[0]}</a>`;
            return html.slice(0, offset) + link + html.slice(offset + match[0].length);
          }
        }
      }
      paragraph = null;
    } else if (name === 'p' && !closing) {
      paragraph = protectedStack.length ? null : { start: token.index + markup.length, hasMarkup: false };
    } else if (paragraph) {
      paragraph.hasMarkup = true;
    }
    if (protectedTags.has(name)) {
      if (!closing && !/\/\s*>$/.test(markup)) protectedStack.push(name);
      if (closing) {
        const index = protectedStack.lastIndexOf(name);
        if (index >= 0) protectedStack.splice(index);
      }
    }
  }
  // No forced middle-paragraph sentence: absence of a natural phrase is a skip.
  return null;
}

// ── Generate anchor text from a post's title ───────────────
function generateAnchorText(post) {
  let anchor = post.title;

  // Remove year references and "Your Ultimate/Complete/Epic" fluff
  anchor = anchor.replace(/\s*:?\s*\d{4}('s)?\s*/g, ' ');
  anchor = anchor.replace(/\b(Your|Ultimate|Complete|Epic|Guide|Adventure)\b\s*/gi, '');
  anchor = anchor.trim().replace(/\s+/g, ' ').replace(/^[\s:]+|[\s:]+$/g, '');

  // If still too long, take first ~50 chars at a word boundary
  if (anchor.length > 55) {
    anchor = anchor.substring(0, 50).replace(/\s\S*$/, '').trim();
  }

  // Ensure it's not empty after cleanup
  if (anchor.length < 5) {
    anchor = post.title.substring(0, 50);
  }

  return anchor;
}

// ── Main ──────────────────────────────────────────────────
export async function run() {
  const { sendSlack, slackHeader, slackSection, slackDivider } = await import('../core/slack.js');
  log.info('Internal Link Optimiser starting...');

  // 0. Clone/pull latest repo
  ensureRepoCheckout();

  // Use the site's exact canonical alias map without loading the Astro/TS app.
  // Refresh the module cache key when this long-running agent pulls a new map.
  // Missing/invalid maps fail closed instead of adding links to retired URLs.
  const redirectFile = path.join(WORK_DIR, 'src', 'data', 'redirects.mjs');
  const redirectUrl = pathToFileURL(redirectFile);
  redirectUrl.searchParams.set('mtime', String(fs.statSync(redirectFile).mtimeMs));
  const { blogRedirects } = await import(redirectUrl.href);
  if (!blogRedirects || typeof blogRedirects !== 'object' || Array.isArray(blogRedirects)) throw new Error('Canonical blog alias map unavailable');
  const retiredSlugs = new Set(Object.keys(blogRedirects));

  // 1. Read blog post metadata
  const posts = parseBlogPosts().filter(post => !retiredSlugs.has(post.slug));
  if (posts.length === 0) {
    log.warn('No blog posts found -- skipping');
    return { linksAdded: 0, postsModified: 0 };
  }

  // 2. Read HTML content
  const { fileContents, contentMap, slugToFile } = parseSlugContent();

  // 3. Build link graph
  const { outbound, inbound } = buildLinkMap(contentMap);

  // 4. Find under-linked posts, prioritizing money/affiliate pages
  const MONEY_SLUGS = new Set([
    'where-to-stay-in-banff', 'banff-skiing-guide', 'best-banff-hiking-trails-guide',
    '3-day-banff-itinerary', '5-day-banff-itinerary', '7-day-banff-itinerary',
    'banff-trip-cost-budget-guide', 'best-banff-restaurants-where-to-eat',
    'lake-louise-complete-guide', 'moraine-lake-guide', 'icefields-parkway-guide',
    'banff-weather-best-time-to-visit', 'best-time-to-visit-banff', 'banff-vs-jasper',
    'calgary-to-banff-guide', 'banff-camping-guide', 'banff-park-pass-guide',
  ]);

  const underLinked = posts
    .filter(p => {
      const inboundCount = (inbound[p.slug] || []).length;
      return inboundCount < MIN_INBOUND_THRESHOLD && contentMap[p.slug];
    })
    .sort((a, b) => {
      const aIsMoney = MONEY_SLUGS.has(a.slug) ? 0 : 1;
      const bIsMoney = MONEY_SLUGS.has(b.slug) ? 0 : 1;
      return aIsMoney - bIsMoney;
    });

  log.info(`Found ${underLinked.length} under-linked posts (< ${MIN_INBOUND_THRESHOLD} inbound links, money pages prioritized)`);

  if (underLinked.length === 0) {
    log.info('All posts are well-linked -- nothing to do');
    await sendSlack(
      [slackSection(':white_check_mark: Internal Linker: all blog posts have sufficient cross-links.')],
      'Internal Linker'
    );
    return { linksAdded: 0, postsModified: 0 };
  }

  // 5. For each under-linked post, find related posts to link FROM
  const linkPlan = []; // { sourceSlug, targetSlug, anchorText }
  let totalLinksPlanned = 0;

  // Create a set of all existing links for quick lookup
  const existingLinks = new Set();
  for (const [slug, links] of Object.entries(outbound)) {
    for (const link of links) {
      existingLinks.add(`${slug}->${link}`);
    }
  }

  for (const targetPost of underLinked) {
    if (totalLinksPlanned >= MAX_LINKS_PER_RUN) break;

    // Score all other posts by relevance to this target
    const candidates = posts
      .filter(p => p.slug !== targetPost.slug && contentMap[p.slug])
      .map(p => ({
        post: p,
        relevance: calculateRelevance(targetPost, p),
      }))
      .filter(c => c.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);

    for (const candidate of candidates) {
      if (totalLinksPlanned >= MAX_LINKS_PER_RUN) break;

      const sourceSlug = candidate.post.slug;
      const linkKey = `${sourceSlug}->/blog/${targetPost.slug}`;

      // Skip if this link already exists
      if (existingLinks.has(linkKey)) continue;

      // Skip if we already planned too many links from this source
      const linksFromSource = linkPlan.filter(l => l.sourceSlug === sourceSlug).length;
      if (linksFromSource >= MAX_LINKS_PER_POST) continue;

      const anchorText = generateAnchorText(targetPost);

      linkPlan.push({
        sourceSlug,
        targetSlug: targetPost.slug,
        anchorText,
        relevanceScore: candidate.relevance,
      });

      existingLinks.add(linkKey);
      totalLinksPlanned++;
    }
  }

  log.info(`Planned ${linkPlan.length} new internal links`);

  if (linkPlan.length === 0) {
    log.info('No suitable link opportunities found');
    await sendSlack(
      [slackSection(':information_source: Internal Linker: no suitable cross-link opportunities found this run.')],
      'Internal Linker'
    );
    return { linksAdded: 0, postsModified: 0 };
  }

  // 6. Apply links to HTML content
  const modifiedSlugs = new Set();
  const appliedLinks = [];
  const modifiedContentMap = { ...contentMap };

  for (const link of linkPlan) {
    const currentHTML = modifiedContentMap[link.sourceSlug];
    if (!currentHTML) continue;

    // Double-check the link doesn't already exist in the (possibly already modified) HTML
    if (currentHTML.includes(`/blog/${link.targetSlug}`)) {
      log.info(`Link to ${link.targetSlug} already exists in ${link.sourceSlug}, skipping`);
      continue;
    }

    const newHTML = insertLinkIntoHTML(currentHTML, link.targetSlug, link.anchorText, retiredSlugs);

    if (newHTML) {
      modifiedContentMap[link.sourceSlug] = newHTML;
      modifiedSlugs.add(link.sourceSlug);
      appliedLinks.push(link);
      log.info(`Added link: ${link.sourceSlug} -> ${link.targetSlug} ("${link.anchorText}")`);
    } else {
      log.warn(`Could not find suitable insertion point in ${link.sourceSlug} for link to ${link.targetSlug}`);
    }
  }

  if (appliedLinks.length === 0) {
    log.info('No links could be inserted -- skipping');
    await sendSlack(
      [slackSection(':information_source: Internal Linker: found under-linked posts but could not find natural insertion points.')],
      'Internal Linker'
    );
    return { linksAdded: 0, postsModified: 0 };
  }

  // 7. Write modified content back to chunk files
  const modifiedFiles = new Set();
  for (const slug of modifiedSlugs) {
    const filePath = slugToFile[slug];
    if (!filePath) continue;
    const originalHTML = contentMap[slug];
    const newHTML = modifiedContentMap[slug];
    if (!fileContents[filePath]) continue;
    fileContents[filePath] = replaceContentBlock(fileContents[filePath], originalHTML, newHTML);
    modifiedFiles.add(filePath);
  }

  for (const filePath of modifiedFiles) {
    fs.writeFileSync(filePath, fileContents[filePath]);
  }
  log.info(`Updated ${modifiedFiles.size} chunk file(s) with ${appliedLinks.length} new links across ${modifiedSlugs.size} posts`);

  // 8. Git commit and push
  const { root } = getRepoPaths();
  const commitMsg = `Auto-add ${appliedLinks.length} internal links to improve cross-linking`;
  let pushed = false;

  try {
    execSync('git add src/data/blogContent.ts src/data/blogContent3.ts', { cwd: root, stdio: 'pipe' });
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: root, stdio: 'pipe' });
    execSync('git push origin main', { cwd: root, stdio: 'pipe' });
    log.info('Pushed to GitHub -- site rebuild triggered');
    pushed = true;
  } catch (err) {
    log.error(`Git push failed: ${err.message}`);
  }

  // 9. Slack report
  const blocks = [
    slackHeader(`Internal Linker -- ${appliedLinks.length} Links Added`),
    slackDivider(),
  ];

  for (const link of appliedLinks) {
    blocks.push(slackSection(
      `:link: *${link.sourceSlug}* → /blog/${link.targetSlug}\n` +
      `_Anchor: "${link.anchorText}"_ (relevance: ${link.relevanceScore})`
    ));
  }

  blocks.push(slackDivider());
  blocks.push(slackSection(
    `*Summary:* ${appliedLinks.length} links added across ${modifiedSlugs.size} posts\n` +
    (pushed
      ? ':rocket: Pushed to GitHub -- site rebuild triggered automatically.'
      : ':warning: Changes written locally but git push failed. Manual push needed.')
  ));

  await sendSlack(blocks, `Internal Linker: ${appliedLinks.length} links added`);

  log.info(`Internal Link Optimiser complete: ${appliedLinks.length} links added, ${modifiedSlugs.size} posts modified`);
  return { linksAdded: appliedLinks.length, postsModified: modifiedSlugs.size };
}
