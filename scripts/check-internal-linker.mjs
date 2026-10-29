import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { blogRedirects } from '../src/data/redirects.mjs';

// Import only the pure export; never call the agent runner, scheduler or Slack.
const source = await readFile('agents/src/agents/internal-linker.js', 'utf8');
const beforeRunner = source.slice(0, source.indexOf('export async function run()'));
assert.ok(!/from\s+['"][^'"]*slack|import\(['"][^'"]*slack/.test(beforeRunner), 'Slack must load only inside the explicit agent runner.');
assert.ok(!/^\s*(?:await\s+)?run\s*\(/m.test(source), 'Importing the linker must not start the agent.');
assert.match(source, /const CONTENT_CHUNKS = \['blogContent.ts', 'blogContent3.ts'\]/, 'Only the two actual renderer inputs can be mutated.');
assert.match(source, /git add src\/data\/blogContent.ts src\/data\/blogContent3.ts'/, 'The staging list also excludes unused legacy chunks.');
const renderer = await readFile('src/pages/blog/[slug].astro', 'utf8');
assert.match(renderer, /from ['"]\.\.\/\.\.\/data\/blogContentRegistry['"]/);
const registry = await readFile('src/data/blogContentRegistry.ts', 'utf8');
assert.match(registry, /from ['"]\.\/blogContent['"]/);
assert.match(registry, /from ['"]\.\/blogContent3['"]/);
assert.ok(!/from ['"]\.\/blogContent[12]['"]/.test(registry));
const { insertLinkIntoHTML: insert, parseContentBlocks, replaceContentBlock } = await import('../agents/src/agents/internal-linker.js');
const tail = ' Leave enough room for the return journey, meals and the particular needs of everyone in the group.';
const paragraph = text => `<p>${text}${tail}</p>`;
const stripAnchors = html => html.replace(/<\/?a\b[^>]*>/gi, '');
const plain = paragraph('Use the Lake Louise guide to compare the village and lakeshore.');
const linked = insert(plain, 'lake-louise-complete-guide', 'Lake Louise');
assert.equal(linked, plain.replace('Lake Louise', '<a href="/blog/lake-louise-complete-guide">Lake Louise</a>'));
assert.equal(stripAnchors(linked), plain, 'Adding a link preserves every original word.');
assert.equal(insert(linked, 'lake-louise-complete-guide', 'Lake Louise'), null, 'Repeat insertion is idempotent.');
assert.equal(insert(paragraph('Lake Louisette has different spelling.'), 'lake-louise', 'Lake Louise'), null, 'Whole phrase boundaries matter.');
const mixedCase = paragraph('Explore the LAKE   LOUISE area with an independent transport plan.');
assert.ok(insert(mixedCase, 'lake-louise', 'Lake Louise').includes('>LAKE   LOUISE</a>'), 'Original casing and whitespace are retained.');

for (const href of ['/blog/lake-louise/', '/blog/lake-louise?x=1', '/blog/lake-louise/#arrival']) {
  assert.equal(insert(`<p><a href='${href}'>Existing link</a></p>${plain}`, 'lake-louise', 'Lake Louise'), null, 'Existing target, including slash/query/fragment, prevents duplication.');
}
const protectedParagraph = paragraph('<a href="/blog/summer-banff-itinerary">Lake Louise summer planning</a> is already linked.');
assert.equal(insert(protectedParagraph, 'lake-louise', 'Lake Louise'), null, 'Never nest a new link inside an existing one.');
const withLaterParagraph = insert(protectedParagraph + plain, 'lake-louise', 'Lake Louise');
assert.ok(withLaterParagraph.startsWith(protectedParagraph), 'Existing linked paragraph is preserved byte for byte.');
assert.equal(stripAnchors(withLaterParagraph.slice(protectedParagraph.length)), plain);
assert.equal(insert(paragraph('Try <strong>Lake Louise</strong> as the main destination.'), 'lake-louise', 'Lake Louise'), null, 'Conservatively leave inline markup unchanged.');
for (const tag of ['a', 'script', 'style', 'pre', 'code', 'textarea', 'button', 'select', 'template', 'noscript', 'svg', 'math']) {
  assert.equal(insert(`<${tag}>${plain}</${tag}>`, 'lake-louise', 'Lake Louise'), null, `No insertion in protected ${tag} context.`);
}
assert.equal(insert(`<!-- ${plain} -->`, 'lake-louise', 'Lake Louise'), null, 'Comments are inert.');
assert.equal(insert(`<p data-note="Lake Louise">Choose a destination and confirm the current route.${tail}</p>`, 'lake-louise', 'Lake Louise'), null, 'Attributes are not paragraph text.');
assert.equal(insert(paragraph('There are many things to do in Banff National Park.'), 'banff-big-3', "Banff's Big 3"), null, 'A lone generic word cannot become an unrelated title.');
assert.equal(insert(paragraph('Plan your meals and warm breaks.') .repeat(4), 'johnsons-canyon', "Johnson's Canyon Banff Most Underrated Hidden Gem"), null, 'No unrelated middle-paragraph append fallback.');
for (const slug of ['../x', 'lake-louise" onclick="x', '', null, undefined]) assert.equal(insert(plain, slug, 'Lake Louise'), null);
const retiredSlugs = new Set(Object.keys(blogRedirects));
for (const slug of retiredSlugs) assert.equal(insert(paragraph(slug.replace(/-/g, ' ')), slug, slug.replace(/-/g, ' '), retiredSlugs), null, `Retired target rejected: ${slug}`);
assert.match(source, /parseBlogPosts\(\)\.filter\(post => !retiredSlugs\.has\(post.slug\)\)/, 'Runner excludes retired sources and targets.');
assert.match(source, /insertLinkIntoHTML\(currentHTML, link.targetSlug, link.anchorText, retiredSlugs\)/, 'Runner passes the exact shared alias map to insertion.');
assert.match(source, /src', 'data', 'redirects.mjs'/, 'Use the site canonical map without an Astro/TS runtime.');

const blogContent2 = parseContentBlocks(await readFile('src/data/blogContent2.ts', 'utf8'));
const blogContent3 = parseContentBlocks(await readFile('src/data/blogContent3.ts', 'utf8'));
const dollarHtml = '<p>Literal $& and $` and $\' sequences stay intact.</p>';
assert.equal(replaceContentBlock('BEFORE old AFTER', 'old', dollarHtml), 'BEFORE ' + dollarHtml + ' AFTER', 'Writing HTML cannot interpret dollar replacement tokens.');
assert.match(source, /replaceContentBlock\(fileContents\[filePath\], originalHTML, newHTML\)/, 'The runner uses literal content replacement.');
const repairs = [
  [blogContent2, '5-day-banff-itinerary', 'Five days in Banff give you room'],
  [blogContent3, 'big-3-banff', "Banff's three main downhill ski resorts"],
  [blogContent3, 'mt-norquay-road', 'Summer hiking near Norquay includes'],
  [blogContent3, 'banff-big-3', 'The <strong>Banff Big 3</strong> means'],
  [blogContent3, 'johston-canyon', 'Johnston Canyon is a waterfall outing'],
  [blogContent3, 'johnstons-canyon', '<a href="/blog/johnston-canyon-guide">Johnston Canyon</a> is a Banff'],
  [blogContent3, 'ink-pots-banff-alberta', 'At the Ink Pots, take photographs'],
];
for (const [content, slug, opening] of repairs) {
  const p = content[slug].match(/<p>[\s\S]*?<\/p>/g).find(p => p.startsWith('<p>' + opening));
  assert.ok(p, 'Exact repaired paragraph: ' + slug);
  let depth = 0;
  for (const token of p.matchAll(/<\/?a\b[^>]*>/gi)) {
    if (/^<\//.test(token[0])) depth--;
    else { assert.equal(depth, 0, slug + ': no nested anchor'); depth++; }
    assert.ok(depth >= 0, slug + ': no unmatched closing anchor');
  }
  assert.equal(depth, 0, slug + ': balanced anchors');
  assert.ok(!/For more details, check out our guide on|During my last visit|countless|300,000|2\.1-kilometer/.test(p), slug + ': no corrupted or unsupported inherited paragraph claim');
  const text = stripAnchors(p);
  assert.equal(insert(p, 'banff-adventure-weekend', 'Banff Weekend: Rafting, Via Ferrata & More', retiredSlugs), null, 'Original generic-Banff regression is skipped: ' + slug);
  assert.ok(text.length > 150, slug + ': useful complete paragraph retained');
}
console.log(`Internal-linker checks passed: exact phrase/text preservation, protected/existing markup, idempotence, literal dollar writes, actual chunk parser, no forced fallback, ${retiredSlugs.size} canonical alias exclusions, import-safe pure export and seven repaired paragraphs. No agent execution, Slack, network, writes or site build.`);
