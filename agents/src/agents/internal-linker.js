import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const log = createLogger('internal-linker');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';

const MAX_LINKS_PER_POST = 3;
const MAX_LINKS_PER_RUN = 15;
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

function getRepoPaths() {
  return {
    root: WORK_DIR,
    blogData: path.join(WORK_DIR, 'src', 'data', 'blogPosts.ts'),
    blogContent: path.join(WORK_DIR, 'src', 'data', 'blogContent.ts'),
  };
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

// ── Parse HTML content blocks from blogContent.ts ──────────
function parseSlugContent() {
  const { blogContent } = getRepoPaths();
  const raw = fs.readFileSync(blogContent, 'utf8');

  // The file has: export const blogContent: Record<string, string> = { 'slug': `...`, ... };
  // We parse each slug -> HTML mapping
  const contentMap = {};
  const slugBlockRegex = /'([^']+)':\s*`([\s\S]*?)`(?:\s*,|\s*\})/g;
  let match;

  while ((match = slugBlockRegex.exec(raw)) !== null) {
    contentMap[match[1]] = match[2];
  }

  log.info(`Parsed ${Object.keys(contentMap).length} content blocks from blogContent.ts`);
  return { raw, contentMap };
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

// ── Find a suitable paragraph and insert a link ────────────
function insertLinkIntoHTML(html, targetSlug, anchorText) {
  // Build significant keywords from the target slug to match against paragraphs
  const targetWords = getSignificantWords(targetSlug.replace(/-/g, ' '));

  // Split HTML into paragraphs
  const paragraphs = html.match(/<p>[\s\S]*?<\/p>/g) || [];

  let bestParagraph = null;
  let bestScore = 0;
  let bestPhrase = null;

  for (const para of paragraphs) {
    // Skip paragraphs that already have links to the same target
    if (para.includes(`/blog/${targetSlug}`)) continue;

    // Skip very short paragraphs or tip boxes
    const plainText = para.replace(/<[^>]*>/g, '');
    if (plainText.length < 80) continue;

    // Score this paragraph by keyword overlap
    const paraWords = getSignificantWords(plainText);
    const overlap = targetWords.filter(w => paraWords.includes(w));
    const overlapScore = overlap.length;

    if (overlapScore > bestScore) {
      bestScore = overlapScore;
      bestParagraph = para;
      bestPhrase = findLinkablePhrase(plainText, targetWords, anchorText);
    }
  }

  // If no keyword match, pick a long middle paragraph as fallback
  if (!bestParagraph && paragraphs.length >= 3) {
    // Pick from middle third of paragraphs
    const middleStart = Math.floor(paragraphs.length / 3);
    const middleEnd = Math.floor((paragraphs.length * 2) / 3);
    for (let i = middleStart; i <= middleEnd; i++) {
      const para = paragraphs[i];
      if (!para) continue;
      const plainText = para.replace(/<[^>]*>/g, '');
      if (plainText.length >= 100) {
        bestParagraph = para;
        bestPhrase = null;
        break;
      }
    }
  }

  if (!bestParagraph) return null;

  // Build the link tag
  const linkTag = `<a href="/blog/${targetSlug}">${anchorText}</a>`;

  let modifiedPara;

  if (bestPhrase && bestParagraph.includes(bestPhrase)) {
    // Replace the matched phrase with a linked version
    modifiedPara = bestParagraph.replace(bestPhrase, linkTag);
  } else {
    // Append a contextual sentence before the closing </p>
    const sentence = ` For more details, check out our guide on ${linkTag}.`;
    modifiedPara = bestParagraph.replace('</p>', `${sentence}</p>`);
  }

  const newHTML = html.replace(bestParagraph, modifiedPara);

  // Verify the replacement actually happened
  if (newHTML === html) return null;

  return newHTML;
}

// ── Find a phrase in text that matches target keywords ─────
function findLinkablePhrase(text, targetWords, anchorText) {
  // Try to find the anchor text literally in the paragraph
  if (text.includes(anchorText)) {
    return anchorText;
  }

  // Try to find a shortened version of anchor text (first 3-4 significant words)
  const anchorWords = getSignificantWords(anchorText);
  if (anchorWords.length >= 2) {
    const shortAnchor = anchorWords.slice(0, 3).join(' ');
    // Search for this sequence in the text
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(shortAnchor);
    if (idx >= 0) {
      return text.substring(idx, idx + shortAnchor.length);
    }
  }

  // Try to match individual target words in a nearby cluster
  for (const word of targetWords) {
    const regex = new RegExp(`\\b(${word}\\w*)\\b`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[0];
    }
  }

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
  log.info('Internal Link Optimiser starting...');

  // 0. Clone/pull latest repo
  ensureRepoCheckout();

  // 1. Read blog post metadata
  const posts = parseBlogPosts();
  if (posts.length === 0) {
    log.warn('No blog posts found -- skipping');
    return { linksAdded: 0, postsModified: 0 };
  }

  // 2. Read HTML content
  const { raw: astroFileContent, contentMap } = parseSlugContent();

  // 3. Build link graph
  const { outbound, inbound } = buildLinkMap(contentMap);

  // 4. Find under-linked posts
  const underLinked = posts.filter(p => {
    const inboundCount = (inbound[p.slug] || []).length;
    return inboundCount < MIN_INBOUND_THRESHOLD && contentMap[p.slug];
  });

  log.info(`Found ${underLinked.length} under-linked posts (< ${MIN_INBOUND_THRESHOLD} inbound links)`);

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

    const newHTML = insertLinkIntoHTML(currentHTML, link.targetSlug, link.anchorText);

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

  // 7. Write modified blogContent.ts back
  const { blogContent } = getRepoPaths();
  let updatedContentFile = astroFileContent;

  for (const slug of modifiedSlugs) {
    const originalHTML = contentMap[slug];
    const newHTML = modifiedContentMap[slug];
    updatedContentFile = updatedContentFile.replace(originalHTML, newHTML);
  }

  fs.writeFileSync(blogContent, updatedContentFile);
  log.info(`Updated blogContent.ts with ${appliedLinks.length} new links across ${modifiedSlugs.size} posts`);

  // 8. Git commit and push
  const { root } = getRepoPaths();
  const commitMsg = `Auto-add ${appliedLinks.length} internal links to improve cross-linking`;
  let pushed = false;

  try {
    execSync('git add src/data/blogContent.ts', { cwd: root, stdio: 'pipe' });
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
