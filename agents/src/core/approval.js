import { createServer } from 'http';
import express from 'express';
import { createLogger } from './logger.js';
import { sendSlack, slackSection, slackDivider } from './slack.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const log = createLogger('approval');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PENDING_DIR = path.join(__dirname, '..', '..', 'data', 'pending');
const PORT = parseInt(process.env.APPROVAL_PORT || '3100');
const TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours

// Ensure pending directory exists
if (!fs.existsSync(PENDING_DIR)) fs.mkdirSync(PENDING_DIR, { recursive: true });

// In-memory registry of pending callbacks
const pendingCallbacks = new Map();

// ── Save a proposal and send Slack message with action buttons ──
export async function requestApproval(proposalId, summary, actions, onApprove) {
  const proposal = {
    id: proposalId,
    created: new Date().toISOString(),
    summary,
    actions,
    status: 'pending',
  };

  // Save to disk so it survives restarts
  fs.writeFileSync(
    path.join(PENDING_DIR, `${proposalId}.json`),
    JSON.stringify(proposal, null, 2)
  );

  // Register callback
  pendingCallbacks.set(proposalId, {
    onApprove,
    timer: setTimeout(() => expireProposal(proposalId), TIMEOUT_MS),
  });

  // Build Slack message with approval buttons
  const blocks = [
    ...summary,
    slackDivider(),
    {
      type: 'actions',
      block_id: `approval_${proposalId}`,
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Approve', emoji: true },
          style: 'primary',
          action_id: 'approve',
          value: proposalId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Reject', emoji: true },
          style: 'danger',
          action_id: 'reject',
          value: proposalId,
        },
      ],
    },
  ];

  await sendSlack(blocks, `PPC Agent awaiting approval: ${proposalId}`);
  log.info(`Approval requested: ${proposalId} (${actions.length} actions, expires in 4h)`);
}

// ── Handle expiration ──
function expireProposal(proposalId) {
  const entry = pendingCallbacks.get(proposalId);
  if (entry) {
    pendingCallbacks.delete(proposalId);
    updateProposalFile(proposalId, 'expired');
    log.info(`Proposal ${proposalId} expired (no response in 4 hours)`);
    sendSlack(
      [slackSection(`:hourglass: PPC proposal \`${proposalId}\` expired — no action taken.`)],
      'Proposal expired'
    ).catch(() => {});
  }
}

// ── Update proposal file status ──
function updateProposalFile(proposalId, status) {
  const filePath = path.join(PENDING_DIR, `${proposalId}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.status = status;
    data.resolved = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

// ── Express server for Slack interactive callbacks ──
let serverStarted = false;

export function startApprovalServer() {
  if (serverStarted) return;
  serverStarted = true;

  const app = express();

  // Slack sends interactive payloads as application/x-www-form-urlencoded with a "payload" field
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', pending: pendingCallbacks.size });
  });

  // Slack interactive endpoint
  app.post('/slack/actions', async (req, res) => {
    try {
      const payload = JSON.parse(req.body.payload);
      const action = payload.actions?.[0];

      if (!action) {
        res.sendStatus(200);
        return;
      }

      const proposalId = action.value;
      const actionId = action.action_id; // 'approve' or 'reject'
      const user = payload.user?.name || payload.user?.username || 'unknown';

      log.info(`Slack action: ${actionId} on ${proposalId} by ${user}`);

      const entry = pendingCallbacks.get(proposalId);

      if (!entry) {
        // Already processed or expired
        res.json({
          response_type: 'ephemeral',
          text: `Proposal \`${proposalId}\` already processed or expired.`,
        });
        return;
      }

      // Clear timeout
      clearTimeout(entry.timer);
      pendingCallbacks.delete(proposalId);

      if (actionId === 'approve') {
        updateProposalFile(proposalId, 'approved');

        // Acknowledge quickly, then execute
        res.json({
          response_type: 'in_channel',
          text: `:white_check_mark: Approved by ${user}. Executing changes...`,
        });

        try {
          const result = await entry.onApprove();
          await sendSlack(
            [slackSection(`:white_check_mark: PPC changes executed successfully.\n${result || ''}`)],
            'PPC changes applied'
          );
          updateProposalFile(proposalId, 'executed');
          log.info(`Proposal ${proposalId} executed successfully`);
        } catch (err) {
          log.error(`Proposal ${proposalId} execution failed: ${err.message}`);
          await sendSlack(
            [slackSection(`:x: PPC changes failed: ${err.message}`)],
            'PPC changes failed'
          );
          updateProposalFile(proposalId, 'failed');
        }

      } else {
        updateProposalFile(proposalId, 'rejected');
        res.json({
          response_type: 'in_channel',
          text: `:no_entry: Rejected by ${user}. No changes made.`,
        });
        log.info(`Proposal ${proposalId} rejected by ${user}`);
      }

    } catch (err) {
      log.error(`Slack action handler error: ${err.message}`);
      res.sendStatus(200);
    }
  });

  app.listen(PORT, () => {
    log.info(`Approval server listening on port ${PORT}`);
  });
}
