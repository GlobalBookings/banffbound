import fs from 'fs';

const raw = fs.readFileSync('/Users/jackchittenden/.factory/artifacts/tool-outputs/fetch_url-toolu_vrtx_014WRgAnNrDTAVgwphaZGp6V-71166236.log', 'utf8');
const lines = raw.split('\n');

const properties = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();

  // Look for "Photo gallery for X" to start a new property
  const photoMatch = line.match(/^### Photo gallery for (.+)$/);
  if (!photoMatch) { i++; continue; }

  const rawName = photoMatch[1].replace(/\\\|/g, '|').trim();
  const prop = { name: rawName, images: [] };

  // Collect images from photo gallery lines
  i++;
  while (i < lines.length) {
    const l = lines[i].trim();
    const imgM = l.match(/\(https:\/\/media\.vrbo\.com\/lodging\/[^)]+\)/);
    if (imgM) {
      const url = imgM[0].slice(1, -1);
      if (!prop.images.includes(url)) prop.images.push(url);
    }
    // Stop collecting images when we hit the actual property name header
    if (l.startsWith('### ') && !l.includes('Photo gallery')) break;
    // Or when we hit location/type info
    if (l.match(/Within .+ District/) || l.match(/\d+\.\d+ mi/) || l === 'Premier Host' || l === 'Loved by Guests') break;
    i++;
  }

  // Now parse the rest of the property block
  while (i < lines.length) {
    const l = lines[i].trim();

    // Next property starts
    if (l.startsWith('### Photo gallery for ')) break;

    // Premier Host
    if (l === 'Premier Host') { prop.premierHost = true; i++; continue; }

    // Location
    const withinMatch = l.match(/^Within (.+?) District$/);
    if (withinMatch) { prop.area = withinMatch[1]; i++; continue; }

    const distMatch = l.match(/^[\d.]+ mi \([\d.]+ km\) to (.+?) center$/);
    if (distMatch && !prop.area) { prop.area = distMatch[1]; i++; continue; }

    const skiMatch = l.match(/^[\d.]+ mi .+ to the nearest ski lift$/);
    if (skiMatch && !prop.area) { prop.area = 'Banff'; i++; continue; }

    // Type line
    const typeMatch = l.match(/^(House|Apartment|Condo|Chalet|Cabin|Lodge|Aparthotel|Cottage|Villa|Townhouse|Bungalow) · Sleeps (up to )?(\d+)/i);
    if (typeMatch) {
      prop.type = typeMatch[1];
      prop.sleeps = parseInt(typeMatch[3]);
      const bedMatch = l.match(/(\d+) bedroom/);
      const bathMatch = l.match(/(\d+\+?) bathroom/);
      if (bedMatch) prop.bedrooms = parseInt(bedMatch[1]);
      if (bathMatch) prop.bathrooms = bathMatch[1];
      i++; continue;
    }

    // Type without sleeps (e.g. "Condo" or "Aparthotel")
    const simpleTypeMatch = l.match(/^(House|Apartment|Condo|Chalet|Cabin|Lodge|Aparthotel|Cottage|Villa|Townhouse|Bungalow)$/i);
    if (simpleTypeMatch && !prop.type) {
      prop.type = simpleTypeMatch[1];
      i++; continue;
    }

    // Rating: "9.29.2 out of 10" (doubled from scrape)
    const ratingMatch = l.match(/^(\d+\.?\d?)(\d+\.?\d?) out of 10$/);
    if (ratingMatch && !prop.rating) {
      prop.rating = parseFloat(ratingMatch[1]);
      i++; continue;
    }

    // Reviews
    const reviewMatch = l.match(/^\(?([0-9,]+) reviews?\)?$/);
    if (reviewMatch && !prop.reviews) {
      prop.reviews = parseInt(reviewMatch[1].replace(/,/g, ''));
      i++; continue;
    }

    // Price
    const priceMatch = l.match(/^CA \$([0-9,]+)$/);
    if (priceMatch && !prop.price) {
      prop.price = parseInt(priceMatch[1].replace(/,/g, ''));
      i++; continue;
    }

    // Vrbo URL with expedia property ID
    const linkMatch = l.match(/https:\/\/www\.vrbo\.com\/en-ca\/(cottage-rental|pdp)[^\s)]+expediaPropertyId=(\d+)/);
    if (linkMatch && !prop.expediaId) {
      prop.expediaId = linkMatch[2];
      const urlPart = linkMatch[0].split('?')[0];
      prop.vrboUrl = urlPart;
      i++; continue;
    }

    // Pagination marker - stop
    if (l.match(/^\d+ - \d+ of \d+$/)) break;

    i++;
  }

  if (prop.name && (prop.type || prop.images.length > 0 || prop.price)) {
    prop.image = prop.images[0] || null;
    delete prop.images;
    properties.push(prop);
  }
}

// Deduplicate
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
console.log('With ratings:', unique.filter(p => p.rating).length);
console.log('With prices:', unique.filter(p => p.price).length);
console.log('With images:', unique.filter(p => p.image).length);
console.log('With Vrbo URLs:', unique.filter(p => p.vrboUrl).length);
console.log('With bedrooms:', unique.filter(p => p.bedrooms).length);
console.log('\nSample:');
unique.slice(0, 3).forEach(p => console.log(JSON.stringify(p, null, 2)));

fs.writeFileSync('/tmp/vrbo-parsed.json', JSON.stringify(unique, null, 2));
console.log('\nSaved to /tmp/vrbo-parsed.json');
