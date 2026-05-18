const HERO_IMAGE_BASE_PATH = '/wydarzenia';

/**
 * Pliki w public/wydarzenia/. Po dodaniu kolejnego zdjęcia dopisz nazwę pliku do tablicy.
 */
export const EVENT_HERO_IMAGE_FILES = [
  'photo-1429962714451-bb934ecdc4ec.avif',
  'photo-1470225620780-dba8ba36b745.avif',
  'photo-1492684223066-81342ee5ff30.avif',
  'photo-1505236858219-8359eb29e329.avif',
  'photo-1513151233558-d860c5398176.avif',
  'photo-1516450360452-9312f5e86fc7.avif',
  'photo-1517457373958-b7bdd4587205.avif',
  'photo-1519671482749-fd09be7ccebf.avif',
  'photo-1524368535928-5b5e00ddc76b.avif',
  'photo-1530103862676-de8c9debad1d.avif',
  'photo-1533174072545-7a4b6ad7a6c3.avif',
  'photo-1545128485-c400e7702796.avif',
  'photo-1566737236500-c8ac43014a67.avif',
  'photo-1584890132374-d69d5d01483e.avif',
  'photo-1588083066783-8828e623bad7.avif',
];

const hashString = (value) => {
  const str = String(value ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/**
 * Stały „losowy” wybór zdjęcia dla wydarzenia (ten sam event → ten sam plik).
 */
export const getEventHeroImageUrl = (eventKey) => {
  if (!EVENT_HERO_IMAGE_FILES.length) {
    return null;
  }

  const index = hashString(eventKey) % EVENT_HERO_IMAGE_FILES.length;
  return `${HERO_IMAGE_BASE_PATH}/${EVENT_HERO_IMAGE_FILES[index]}`;
};
