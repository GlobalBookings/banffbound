import fs from 'fs';

const slugs = [
  'banff-new-years-eve',
  'banff-valentines-day',
  'banff-park-museum',
  'banff-fat-biking',
  'banff-canada-150',
  'banff-climate-change',
];

let content = fs.readFileSync('src/data/blogPosts.ts', 'utf-8');
let count = 0;

for (const slug of slugs) {
  const localPath = `/images/blog/${slug}.webp`;
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(\\{\\s*\\n\\s*slug:\\s*'${escaped}'[\\s\\S]*?image:\\s*')https?://[^']+(')`
  );
  const before = content;
  content = content.replace(regex, `$1${localPath}$2`);
  if (content !== before) {
    count++;
    console.log(`Updated: ${slug}`);
  } else {
    console.log(`NOT FOUND: ${slug}`);
  }
}

fs.writeFileSync('src/data/blogPosts.ts', content);
console.log(`\nTotal updated: ${count}`);
