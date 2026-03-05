import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function run() {
  console.log('Checking Resend inbox for recent emails...\n');

  try {
    const result = await resend.emails.receiving.list();
    console.log('Raw API response keys:', Object.keys(result));
    console.log('Raw data type:', typeof result.data);

    const data = result.data;
    if (data && typeof data === 'object') {
      // Could be { data: [...] } or { object: 'list', data: [...] }
      const emails = Array.isArray(data) ? data : (data.data || []);
      console.log(`\nRaw data structure:`, JSON.stringify(data).slice(0, 500));

      if (Array.isArray(emails) && emails.length > 0) {
        console.log(`\nFound ${emails.length} received email(s):\n`);
        for (const email of emails.slice(0, 10)) {
          console.log(`  ID: ${email.id}`);
          console.log(`  From: ${email.from}`);
          console.log(`  Subject: ${email.subject}`);
          console.log(`  Date: ${email.created_at}`);
          console.log('  ---');
        }

        const latest = emails[0];
        console.log(`\nFetching full content of most recent email (${latest.id})...\n`);
        const { data: full, error: fullErr } = await resend.emails.receiving.get(latest.id);
        if (fullErr) {
          console.error('Error fetching email:', JSON.stringify(fullErr));
          return;
        }
        console.log('From:', full.from);
        console.log('To:', full.to);
        console.log('Subject:', full.subject);
        console.log('Date:', full.created_at);
        console.log('\nBody (text):');
        console.log(full.text?.slice(0, 2000) || '(no text body)');
      } else {
        console.log('No emails found or unexpected format.');
        console.log('Full response:', JSON.stringify(result).slice(0, 1000));
      }
    } else {
      console.log('Unexpected response:', JSON.stringify(result).slice(0, 1000));
    }
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.statusCode) console.error('Status:', err.statusCode);
  }
}

run();
