import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../core/logger.js';
import { sendSlack, slackHeader, slackSection, slackDivider } from '../core/slack.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const log = createLogger('trail-conditions');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(__dirname, '..', '..', 'data', 'repo-checkout');
const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || 'GlobalBookings/banffbound';
const PARKS_CANADA_URL = 'https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions';

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

async function fetchTrailConditions() {
  log.info('Fetching Parks Canada trail conditions...');
  const res = await fetch(PARKS_CANADA_URL);
  if (!res.ok) throw new Error(`Parks Canada returned ${res.status}`);
  const html = await res.text();
  return html;
}

async function parseConditions(html) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Parse this Parks Canada trail conditions HTML page and extract trail status information.

For each trail or trail area mentioned, return a JSON array with:
- "name": trail name as written on the page
- "status": one of "open", "caution", "closed"
- "note": the condition note/description (keep it brief, under 100 chars)

Rules:
- If a trail is described as "good" or "open" → status: "open"
- If a trail has warnings, icy conditions, or partial issues → status: "caution"  
- If a trail is described as "closed" or "not maintained" → status: "closed"
- Include cross-country ski trails and winter trails too

Return ONLY valid JSON array, nothing else.

HTML:
${html.substring(0, 15000)}`
    }],
  });

  let text = response.content[0].text.trim();
  text = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    log.error(`Failed to parse Claude response as JSON: ${e.message}`);
    return [];
  }
}

function matchToTrails(conditions) {
  const trailsPath = path.join(WORK_DIR, 'src', 'data', 'trails.ts');
  let content = fs.readFileSync(trailsPath, 'utf8');

  const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const today = new Date().toISOString().split('T')[0];
  const changes = [];

  for (const cond of conditions) {
    const condName = cond.name.toLowerCase();

    for (const slug of slugs) {
      const slugWords = slug.replace(/-xc-ski|-snowshoe|-winter|-ice-walk/g, '').split('-');
      const matchScore = slugWords.filter(w => w.length > 2 && condName.includes(w)).length;

      if (matchScore >= 2 || (matchScore >= 1 && slugWords.length <= 2)) {
        const statusRegex = new RegExp(
          `(slug:\\s*'${slug}'[\\s\\S]*?status:\\s*')([^']+)(')`
        );
        const noteRegex = new RegExp(
          `(slug:\\s*'${slug}'[\\s\\S]*?conditionNote:\\s*')([^']*?)(')`
        );
        const dateRegex = new RegExp(
          `(slug:\\s*'${slug}'[\\s\\S]*?conditionUpdated:\\s*')([^']+)(')`
        );

        const currentStatus = content.match(statusRegex)?.[2];
        if (currentStatus && currentStatus !== cond.status) {
          changes.push({ slug, from: currentStatus, to: cond.status, note: cond.note });
        }

        content = content.replace(statusRegex, `$1${cond.status}$3`);
        content = content.replace(noteRegex, `$1${(cond.note || '').replace(/'/g, "\\'")}$3`);
        content = content.replace(dateRegex, `$1${today}$3`);
        break;
      }
    }
  }

  fs.writeFileSync(trailsPath, content);
  return changes;
}

function gitCommitAndPush(changes) {
  try {
    execSync('git add src/data/trails.ts', { cwd: WORK_DIR, stdio: 'pipe' });
    const diff = execSync('git diff --cached --stat', { cwd: WORK_DIR, encoding: 'utf8' });
    if (!diff.trim()) {
      log.info('No trail condition changes to commit');
      return false;
    }
    const msg = `Update trail conditions: ${changes.length} status change(s)`;
    execSync(`git commit -m "${msg}"`, { cwd: WORK_DIR, stdio: 'pipe' });
    execSync('git push origin main', { cwd: WORK_DIR, stdio: 'pipe' });
    log.info('Pushed trail condition updates');
    return true;
  } catch (err) {
    log.error(`Git push failed: ${err.message}`);
    return false;
  }
}

export async function run() {
  log.info('Trail Conditions Scraper starting...');

  ensureRepoCheckout();

  let html;
  try {
    html = await fetchTrailConditions();
    log.info(`Fetched ${html.length} bytes from Parks Canada`);
  } catch (err) {
    log.error(`Failed to fetch trail conditions: ${err.message}`);
    await sendSlack(
      [slackSection(`:warning: Trail Conditions: Failed to fetch Parks Canada page — ${err.message}`)],
      'Trail Conditions'
    );
    return { updated: 0 };
  }

  const conditions = await parseConditions(html);
  log.info(`Parsed ${conditions.length} trail conditions from Parks Canada`);

  if (conditions.length === 0) {
    log.info('No conditions parsed — skipping');
    return { updated: 0 };
  }

  const changes = matchToTrails(conditions);
  const pushed = gitCommitAndPush(changes);

  const blocks = [slackHeader('Trail Conditions Update')];
  if (changes.length > 0) {
    blocks.push(slackDivider());
    for (const c of changes) {
      const emoji = c.to === 'closed' ? ':no_entry:' : c.to === 'caution' ? ':warning:' : ':white_check_mark:';
      blocks.push(slackSection(`${emoji} *${c.slug}*: ${c.from} → ${c.to}\n_${c.note}_`));
    }
  } else {
    blocks.push(slackSection(':white_check_mark: No status changes detected. All trails unchanged.'));
  }

  blocks.push(slackDivider());
  blocks.push(slackSection(
    pushed
      ? ':rocket: Updates pushed to GitHub.'
      : ':information_source: No changes to push.'
  ));

  await sendSlack(blocks, `Trail Conditions: ${changes.length} changes`);
  return { updated: changes.length };
}
