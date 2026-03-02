import fs from 'fs';

const raw = fs.readFileSync('/Users/jackchittenden/.factory/artifacts/tool-outputs/fetch_url-toolu_vrtx_014WRgAnNrDTAVgwphaZGp6V-71166236.log', 'utf8');

// Normalize unicode: replace non-breaking spaces with regular spaces
const normalized = raw.replace(/\u00a0/g, ' ').replace(/\\/g, '');
const lines = normalized.split('\n');

const properties = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();

  const photoMatch = line.match(/^### Photo gallery for (.+)$/);
  if (!photoMatch) { i++; continue; }

  const rawName = photoMatch[1].replace(/\|/g, '').trim();
  const prop = { name: rawName, images: [] };

  i++;
  // Scan forward for all property data until next photo gallery
  while (i < lines.length) {
    const l = lines[i].trim();
    if (l.startsWith('### Photo gallery for ')) break;
    if (l.match(/^\d+ - \d+ of \d+$/)) break;

    // Images
    const imgM = l.match(/https:\/\/media\.vrbo\.com\/lodging\/[^)\s]+/);
    if (imgM) {
      const url = imgM[0];
      if (!prop.images.includes(url)) prop.images.push(url);
    }

    // Premier Host
    if (l === 'Premier Host') prop.premierHost = true;

    // Location
    const withinMatch = l.match(/^Within (.+?) District$/);
    if (withinMatch) prop.area = withinMatch[1];

    const distMatch = l.match(/^[\d.]+ mi \([\d.]+ km\) to (.+?) center$/);
    if (distMatch && !prop.area) prop.area = distMatch[1];

    // Type: "House · Sleeps 6 · 2 bedrooms · 2 bathrooms"
    const typeMatch = l.match(/^(House|Apartment|Condo|Chalet|Cabin|Lodge|Aparthotel|Cottage|Villa|Townhouse|Bungalow)/i);
    if (typeMatch && (l.includes('Sleeps') || l.match(/^(House|Apartment|Condo|Chalet|Cabin|Lodge|Aparthotel|Cottage|Villa|Townhouse|Bungalow)$/i))) {
      prop.type = typeMatch[1];
      const sleepsMatch = l.match(/Sleeps (up to )?(\d+)/);
      if (sleepsMatch) prop.sleeps = parseInt(sleepsMatch[2]);
      const bedMatch = l.match(/(\d+) bedroom/);
      if (bedMatch) prop.bedrooms = parseInt(bedMatch[1]);
      const bathMatch = l.match(/(\d+\+?) bathroom/);
      if (bathMatch) prop.bathrooms = bathMatch[1];
    }

    // Rating: "9.29.2 out of 10" (doubled from scrape rendering)
    const ratingMatch = l.match(/^(\d+\.?\d?)\1? out of 10$/);
    if (ratingMatch && !prop.rating) {
      prop.rating = parseFloat(ratingMatch[1]);
    }
    // Alternative rating format
    const ratingMatch2 = l.match(/^(\d+\.\d)(\d+\.\d) out of 10$/);
    if (ratingMatch2 && !prop.rating) {
      prop.rating = parseFloat(ratingMatch2[1]);
    }
    // "1010 out of 10"
    const ratingMatch3 = l.match(/^(\d{2})(\d{2}) out of 10$/);
    if (ratingMatch3 && !prop.rating) {
      prop.rating = parseFloat(ratingMatch3[1]);
    }

    // Reviews
    const reviewMatch = l.match(/^\(?([0-9,]+) reviews?\)?$/);
    if (reviewMatch && !prop.reviews) {
      prop.reviews = parseInt(reviewMatch[1].replace(/,/g, ''));
    }

    // Price
    const priceMatch = l.match(/CA \$([0-9,]+)$/);
    if (priceMatch && !prop.price) {
      prop.price = parseInt(priceMatch[1].replace(/,/g, ''));
    }

    // Vrbo URL
    const linkMatch = l.match(/https:\/\/www\.vrbo\.com\/en-ca\/(cottage-rental|pdp)\/[^\s)]+expediaPropertyId=(\d+)/);
    if (linkMatch && !prop.expediaId) {
      prop.expediaId = linkMatch[2];
      prop.vrboUrl = linkMatch[0].split('?')[0];
    }

    i++;
  }

  prop.image = prop.images[0] || null;
  delete prop.images;
  if (prop.name) properties.push(prop);
}

// Deduplicate by expediaId or name
const seen = new Set();
const unique = properties.filter(p => {
  const key = p.expediaId || p.name.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

console.log(`Parsed ${unique.length} unique properties`);
console.log('Types:', JSON.stringify([...new Set(unique.map(p => p.type).filter(Boolean))]));
console.log('Areas:', JSON.stringify([...new Set(unique.map(p => p.area).filter(Boolean))]));
console.log('With type:', unique.filter(p => p.type).length);
console.log('With sleeps:', unique.filter(p => p.sleeps).length);
console.log('With bedrooms:', unique.filter(p => p.bedrooms).length);
console.log('With ratings:', unique.filter(p => p.rating).length);
console.log('With prices:', unique.filter(p => p.price).length);
console.log('With images:', unique.filter(p => p.image).length);
console.log('With Vrbo URLs:', unique.filter(p => p.vrboUrl).length);
console.log('\nSample:');
unique.slice(0, 5).forEach(p => console.log(JSON.stringify(p)));

fs.writeFileSync('/tmp/vrbo-parsed.json', JSON.stringify(unique, null, 2));
console.log('\nSaved to /tmp/vrbo-parsed.json');
