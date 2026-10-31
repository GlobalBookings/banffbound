import activityPhotos from './banffExperiencePhotoCredits.json';
import winterPhotos from './winterActivityPhotoCredits.json';

const photo = (id: string) => {
  const item = activityPhotos.find(value => value.id === id) || winterPhotos.find(value => value.id === id);
  if (!item) throw new Error(`Missing credited experience photograph: ${id}`);
  return item;
};

/** Neutral BanffBound editorial hero; supplier/activity photos appear in the guide body. */
export function getExperienceHeroPhoto() { return photo('banff-winter-town'); }

export function getExperiencePhoto(category: string, departure: string) {
  // The specific activity determines the photograph; broad filter labels and
  // words inside place names (for example Kananaskis) must not select a sport.
  const subject = category.toLowerCase();
  if (/lake-louise-ice-skating/.test(subject)) return photo('lake-louise-skating');
  if (/lake-fishing-charters/.test(subject)) return photo('minnewanka');
  if (/food-tours/.test(subject)) return photo('banff-food');
  if (/stargazing-night-walks/.test(subject)) return photo('lake-louise-night-sky');
  if (/scenic-helicopter-flights/.test(subject)) return photo('canmore-nordic-winter');
  if (/raft/.test(subject)) return photo('rafting');
  if (/scenic-river-floats/.test(subject)) return photo('canoeing');
  if (/airport|yyc|shared.transfer|private.transfer/.test(subject)) return photo('calgary-airport');
  if (/sleigh|wagon|cookout|carriage/.test(subject)) return photo('sleigh-horses');
  if (/horse|equestrian|trail riding/.test(subject)) return photo('horse-riding');
  if (/raft|whitewater|white.water/.test(subject)) return photo('rafting');
  if (/cav(?:e|ing)|underground/.test(subject)) return photo('caving');
  if (/icefield|glacier|skywalk/.test(subject)) return photo('icefield');
  if (/cruise|minnewanka/.test(subject)) return photo('minnewanka');
  if (/canoe|kayak|paddle|river float/.test(subject)) return photo('canoeing');
  if (/wildlife|wolfdog|grizzly|animal/.test(subject)) return photo('wildlife');
  if (/food|culinary|tasting|dining/.test(subject)) return photo('banff-food');
  if (/stargaz|night.sky|night walk/.test(subject)) return photo('lake-louise-night-sky');
  if (/johnston|grotto|icewalk|ice walk/.test(subject)) return photo('johnston-frozen-falls');
  if (/\bski(?:ing)?\b|snowboard|cross.country/.test(subject)) return photo('lake-louise-ski-slopes');
  if (/snowshoe|winter|frozen/.test(subject)) return photo('snowshoe-banff-landscape');
  if (/gondola|chairlift/.test(subject)) return photo('gondola-winter');
  if (/yoho|emerald/.test(subject)) return photo('emerald-lake');
  if (/moraine|sunrise|lake tour|lakes|sightseeing|private|multi.day/.test(subject)) return photo('moraine-sunrise');
  return photo('banff-winter-town');
}
