import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transform } from '@astrojs/compiler';

// Inspect the same resolved bodies as the page, after override precedence and
// bounded corrections. This is a markup/content-presence check, not a factual review.
const { outputFiles } = await build({ stdin: { contents: "export * from './src/data/blogContentRegistry.ts'; export {allBlogPosts} from './src/data/blogPosts.ts'; export * from './src/data/legacyTextCorrections.ts'; export {blogRedirects} from './src/data/redirects.mjs';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const data = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
function anchorIssues(html) {
  const issues = []; let open = false;
  const tokens = /<!--[\s\S]*?(?:-->|$)|<\/?([a-z][a-z0-9:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  for (const token of html.matchAll(tokens)) {
    if (token[1]?.toLowerCase() !== 'a') continue;
    if (/^<\//.test(token[0])) { if (!open) issues.push('unmatched closing anchor'); open = false; }
    else { if (open) issues.push('nested anchor'); open = true; }
  }
  if (open) issues.push('unclosed anchor');
  return issues;
}
assert.deepEqual(anchorIssues('<p><a href="/a">A</a>, <a href="/b">B</a></p>'), []);
assert.deepEqual(anchorIssues('<!-- <a href="/a"> --><p>Escaped &lt;a&gt; example.</p>'), []);
assert.ok(anchorIssues('<p><a href="/a">A <a href="/b">B</a></a></p>').includes('nested anchor'));
assert.ok(anchorIssues('<p><a href="/a">A</p>').includes('unclosed anchor'));
const posts = data.allBlogPosts.filter(post => !Object.hasOwn(data.blogRedirects, post.slug));
const records = posts.map(post => {
  assert.ok(data.resolvedBlogContent[post.slug]?.trim(), `Missing canonical article body: ${post.slug}`);
  const html = data.resolveBlogContent(post.slug);
  assert.ok(!html.includes('Content coming soon.'), `Placeholder canonical body: ${post.slug}`);
  const issues = anchorIssues(html);
  assert.deepEqual(issues, [], `Resolved ${post.slug}: ${issues.join(', ')}`);
  return { slug: post.slug, words: html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length, anchorIssues: issues.length, fullBodyReview: Object.hasOwn(data.reviewedBlogBodies, post.slug), openingTextCorrection: Object.hasOwn(data.legacyTextCorrections, post.slug) };
});
assert.equal(posts.length, 295, 'Changing canonical/alias coverage requires an explicit audit update.');
assert.equal(Object.keys(data.reviewedBlogBodies).length, 94, 'The bounded paragraph repairs do not create full-body reviews.');
assert.equal(Object.keys(data.legacyTextCorrections).length, 8);
for (const [slug, correction] of Object.entries(data.legacyTextCorrections)) {
  assert.ok(posts.some(post => post.slug === slug), `Corrected slug is canonical: ${slug}`);
  assert.equal(correction.correctedAt, '2026-10-29');
  assert.equal(correction.paragraph, 'opening paragraph');
  assert.ok(correction.summary && !Object.hasOwn(data.reviewedBlogBodies, slug));
  const opening = data.resolveBlogContent(slug).match(/<p\b[^>]*>[\s\S]*?<\/p>/i)?.[0] || '';
  assert.ok(opening.length > 150 && !/After (?:years|countless)|As someone|During my last|I (?:can tell|have|spent)|I've/i.test(opening), `Repaired opening removes unsupported personal visits: ${slug}`);
}
const page = await readFile('src/pages/blog/[slug].astro', 'utf8');
assert.ok(page.includes('resolveBlogContent(post.slug)') && page.includes('partialCorrectionLabel={textCorrection'));
assert.ok(page.includes('Object.hasOwn(reviewedBlogBodies, post.slug) ? undefined'), 'A later full review supersedes the bounded correction label.');
assert.ok(!page.includes('const blogContent ='), 'The renderer must use the shared registry rather than a second merge.');
const layout = await readFile('src/layouts/BlogLayout.astro', 'utf8');
assert.ok(layout.includes('partialCorrectionLabel') && layout.includes('datePublished: isoDate'));
for (const [filename, source] of [['src/pages/blog/[slug].astro', page], ['src/layouts/BlogLayout.astro', layout]]) {
  const result = await transform(source, { filename });
  assert.deepEqual(result.diagnostics.filter(d => d.severity === 1), [], filename);
}
const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--report'));
if (args.length) await writeFile(args[1], JSON.stringify({ checkedAtUTC: new Date().toISOString(), scope: 'Canonical resolved article presence, source anchor structure and bounded correction labels; not a factual review of all articles.', canonicalBodies: records.length, fullBodyReviews: 94, paragraphCorrections: 8, missingBodies: 0, anchorIssues: 0, records }, null, 2) + '\n', { flag: 'wx' });
console.log(`Blog content checks passed: ${records.length} canonical resolved bodies, no placeholders/nested or unbalanced anchors; 94 full-body reviews remain distinct from 8 opening repairs; actual renderer/registry, correction scope, two Astro transforms. No network or site build.`);
