import fs from 'fs';

const raw = fs.readFileSync(process.argv[2] || '/Users/jackchittenden/.factory/artifacts/tool-outputs/fetch_url-toolu_vrtx_014WRgAnNrDTAVgwphaZGp6V-71166236.log', 'utf8');

const properties = [];
const lines = raw.split('\n');

let current = null;
let lastPhotoGalleryName = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Track photo gallery names to match with property headers
  const photoMatch = line.match(/^### Photo gallery for (.+)$/);
  if (photoMatch) {
    lastPhotoGalleryName = photoMatch[1].replace(/\\\|/g, '|').replace(/\|/g, '').trim();
    continue;
  }

  // Image from photo gallery
  const imgMatch = line.match(/\(https:\/\/media\.vrbo\.com\/lodging\/[^)]+\)/);
  if (imgMatch && lastPhotoGalleryName && (!current || !current.image)) {
    const imgUrl = imgMatch[0].slice(1, -1);
    if (!current) {
      current = { name: lastPhotoGalleryName, image: imgUrl };
    } else if (!current.image) {
      current.image = imgUrl;
    }
    continue;
  }

  // Property name (non-photo-gallery header)
  if (line.startsWith('### ') && !line.includes('Photo gallery')) {
    const name = line.replace('### ', '').replace(/\\\|/g, '|').replace(/\|/g, '').trim();
    if (current && current.name && (current.type || current.reviews || current.image)) {
      properties.push(current);
    }
    current = { name, image: current?.image || null };
    lastPhotoGalleryName = null;
    continue;
  }

  if (!current) continue;

  // Premier Host
  if (line === 'Premier Host') {
    current.premierHost = true;
    continue;
  }

  // Location - Within X District
  const withinMatch = line.match(/^Within (.+?) District$/);
  if (withinMatch) {
    current.area = withinMatch[1];
    continue;
  }

  // Location - distance to center
  const distMatch = line.match(/^[\d.]+ mi \([\d.]+ km\) to (.+?) center$/);
  if (distMatch && !current.area) {
    current.area = distMatch[1];
    continue;
  }

  // Distance to ski lift
  const skiMatch = line.match(/^[\d.]+ mi .+ to the nearest ski lift$/);
  if (skiMatch && !current.area) {
    current.area = 'Banff';
    continue;
  }

  // Type line: House · Sleeps 6 · 2 bedrooms · 2 bathrooms
  const typeMatch = line.match(/^(House|Apartment|Condo|Chalet|Cabin|Lodge|Aparthotel|Cottage|Villa|Townhouse|Bungalow|Studio|Suite|Loft) · Sleeps (up to )?(\d+)/i);
  if (typeMatch) {
    current.type = typeMatch[1];
    current.sleeps = parseInt(typeMatch[3]);
    const bedMatch = line.match(/(\d+) bedroom/);
    const bathMatch = line.match(/(\d+\+?) bathroom/);
    if (bedMatch) current.bedrooms = parseInt(bedMatch[1]);
    if (bathMatch) current.bathrooms = bathMatch[1];
    continue;
  }

  // Rating: "9.29.2 out of 10" or "1010 out of 10" (doubled text from scrape)
  const ratingMatch = line.match(/^(\d+\.?\d?)(\d+\.?\d?) out of 10$/);
  if (ratingMatch && !current.rating) {
    current.rating = parseFloat(ratingMatch[1]);
    continue;
  }

  // Reviews
  const reviewMatch = line.match(/^[\(]?([0-9,]+) reviews?[\)]?$/);
  if (reviewMatch) {
    current.reviews = parseInt(reviewMatch[1].replace(/,/g, ''));
    continue;
  }

  // Price: "CA $139" or "CA $1,143"
  const priceMatch = line.match(/^CA \$([0-9,]+)$/);
  if (priceMatch && !current.price) {
    current.price = parseInt(priceMatch[1].replace(/,/g, ''));
    continue;
  }

  // Vrbo link with expedia property ID
  const linkMatch = line.match(/https:\/\/www\.vrbo\.com\/en-ca\/(cottage-rental|pdp)\/[^\s)]+expediaPropertyId=(\d+)/);
  if (linkMatch && !current.expediaId) {
    current.expediaId = linkMatch[2];
    current.vrboUrl = linkMatch[0].split('?')[0];
    continue;
  }
}

// Push last property
if (current && current.name && (current.type || current.reviews || current.image)) {
  properties.push(current);
}

// Deduplicate
const seen = new Set();
const unique = properties.filter(p => {
  const key = p.name.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

console.log(`Parsed ${unique.length} unique properties`);
console.log('Types:', JSON.stringify([...new Set(unique.map(p => p.type).filter(Boolean))]));
console.log('Areas:', JSON.stringify([...new Set(unique.map(p => p.area).filter(Boolean))]));
console.log('With ratings:', unique.filter(p => p.rating).length);
console.log('With prices:', unique.filter(p => p.price).length);
console.log('With images:', unique.filter(p => p.image).length);
console.log('With Vrbo URLs:', unique.filter(p => p.vrboUrl).length);
console.log('\nFirst 3:');
unique.slice(0, 3).forEach(p => console.log(JSON.stringify(p)));

fs.writeFileSync('/tmp/vrbo-parsed.json', JSON.stringify(unique, null, 2));
console.log('\nSaved to /tmp/vrbo-parsed.json');
