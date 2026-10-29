/** Fixed editorial destinations; no query-string or reader data enters links. */
export function getArticleBookingContext(slug: unknown, curatedBookingLinks = false) {
  const jasper = typeof slug === 'string' && ['jasper-town','jasper-national-park','jasper-canada','jasper-alberta','calgary-to-jasper'].includes(slug);
  const bowLake = typeof slug === 'string' && ['numtijah-lodge','num-ti-jah-lodge'].includes(slug);
  const destination = jasper ? 'Jasper, Alberta' : bowLake ? 'Lake Louise, Alberta' : 'Banff, Alberta';
  const hotelLabel = jasper ? 'Jasper' : bowLake ? 'Lake Louise area' : 'Banff';
  const tourLabel = jasper ? 'Jasper' : bowLake ? 'Lake Louise' : 'Banff';
  return {
    hotelLabel, tourLabel,
    hotelHref: 'https://www.expedia.ca/Hotel-Search?destination=' + encodeURIComponent(destination) + '&camref=1101l3MtWX',
    tourHref: jasper || bowLake
      ? 'https://www.getyourguide.com/s/?q=' + encodeURIComponent(tourLabel + ', Alberta') + '&partner_id=QW960HO&cmp=banffboundblog'
      : 'https://www.getyourguide.com/banff-l284/?partner_id=QW960HO&cmp=banffboundblog',
    suppressAutomaticCTA: curatedBookingLinks === true || jasper || bowLake,
  };
}
