import 'dotenv/config';
import { Resend } from 'resend';

// Replicate the detection logic from inbox-monitor
const GYG_COMMISSION_RATE = 0.08;

function detectAffiliateSale(from, subject, body) {
  const text = `${subject}\n${body}`;
  const textLower = text.toLowerCase();

  const isGYG = textLower.includes('getyourguide') &&
    (textLower.includes('new booking') || textLower.includes('contributed to the'));

  if (isGYG) {
    const productMatch = body.match(/GetYourGuide product[:\s]*\n?\s*\*?([^\n*]+)\*?/i)
      || body.match(/booking of.*?:\s*\n?\s*\*?([^\n*]+)\*?/i);
    const product = productMatch
      ? productMatch[1].replace(/^\*+|\*+$/g, '').trim()
      : 'Unknown GYG Product';

    const priceMatch = body.match(/Price[:\s*]*([\d,]+\.?\d*)\s*(CAD|USD|EUR|GBP)/i);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
    const currency = priceMatch?.[2] || 'CAD';

    const dateMatch = body.match(/Date[:\s*]*([\d]{2}-[\d]{2}-[\d]{4})/i);
    const bookingDate = dateMatch ? dateMatch[1] : null;

    const refMatch = text.match(/R(\d{5,8})/);
    const reference = refMatch ? `R${refMatch[1]}` : null;

    const commission = price > 0 ? parseFloat((price * GYG_COMMISSION_RATE).toFixed(2)) : 0;

    return {
      partner: 'getyourguide',
      product,
      price,
      currency,
      commission,
      commissionRate: GYG_COMMISSION_RATE,
      bookingDate,
      reference,
    };
  }
  return null;
}

async function run() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Fetch the forwarded GYG email
  const emailId = '372f1f95-99d9-4344-b998-ae8eeabb3a28';
  console.log(`Fetching email ${emailId}...\n`);

  const { data: email, error } = await resend.emails.receiving.get(emailId);
  if (error) {
    console.error('Error:', JSON.stringify(error));
    return;
  }

  const from = email.from;
  const subject = email.subject;
  const body = email.text || '';

  console.log('From:', from);
  console.log('Subject:', subject);
  console.log('---\n');

  const sale = detectAffiliateSale(from, subject, body);

  if (sale) {
    console.log('SALE DETECTED:');
    console.log(`  Partner: ${sale.partner}`);
    console.log(`  Product: ${sale.product}`);
    console.log(`  Price: $${sale.price} ${sale.currency}`);
    console.log(`  Commission: $${sale.commission} (${sale.commissionRate * 100}%)`);
    console.log(`  Booking Date: ${sale.bookingDate}`);
    console.log(`  Reference: ${sale.reference}`);
  } else {
    console.log('NO SALE DETECTED — detection logic needs fixing');
    console.log('\nBody preview for debugging:');
    console.log(body.slice(0, 500));
  }
}

run().catch(err => console.error('Failed:', err.message));
