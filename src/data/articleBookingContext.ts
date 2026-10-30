/** Fixed editorial destinations; no query-string or reader data enters links. */
export function getArticleBookingContext(slug: unknown, curatedBookingLinks = false) {
  const jasper = typeof slug === 'string' && ['jasper-town','jasper-national-park','jasper-canada','jasper-alberta','calgary-to-jasper'].includes(slug);
  const bowLake = typeof slug === 'string' && ['numtijah-lodge','num-ti-jah-lodge'].includes(slug);
  const skoki = slug === 'skoki-lodge-guide';
  const lakeHike = typeof slug === 'string' && ['larch-valley-hike','sentinel-pass-hike'].includes(slug);
  const lakeLouise = bowLake || skoki || lakeHike;
  const golden = slug === 'golden-bc-day-trip';
  const destination = jasper ? 'Jasper, Alberta' : lakeLouise ? 'Lake Louise, Alberta' : golden ? 'Golden, British Columbia' : 'Banff, Alberta';
  const hotelLabel = jasper ? 'Jasper' : lakeLouise ? 'Lake Louise area' : golden ? 'Golden' : 'Banff';
  const tourLabel = jasper ? 'Jasper' : lakeLouise ? 'Lake Louise' : golden ? 'Golden' : 'Banff';
  return {
    hotelLabel, tourLabel,
    hotelHref: 'https://www.expedia.ca/Hotel-Search?destination=' + encodeURIComponent(destination) + '&camref=1101l3MtWX',
    tourHref: jasper || lakeLouise || golden
      ? 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(destination) + '&partner_id=QW960HO&cmp=banffboundblog'
      : 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO&cmp=banffboundblog',
    suppressAutomaticCTA: curatedBookingLinks === true || jasper || lakeLouise || golden,
  };
}
