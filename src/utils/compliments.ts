const MALE_CELEBRITIES = [
  'Reza Rahadian',
  'Nicholas Saputra',
  'Iqbaal Ramadhan',
  'Jefri Nichol',
  'Vino G. Bastian',
  'Angga Yunanda',
  'Refal Hady',
  'Chicco Jerikho',
  'Bryan Domani',
  'Arya Saloka',
  'Al Ghazali',
  'Herjunot Ali'
];

const FEMALE_CELEBRITIES = [
  'Dian Sastrowardoyo',
  'Chelsea Islan',
  'Pevita Pearce',
  'Raisa',
  'Maudy Ayunda',
  'Anya Geraldine',
  'Amanda Manopo',
  'Prilly Latuconsina',
  'Isyana Sarasvati',
  'Tara Basro',
  'Cinta Laura',
  'Yuki Kato'
];

const FEMALE_NAME_KEYWORDS = [
  'PUTRI',
  'DEWI',
  'FITRI',
  'SARI',
  'INTAN',
  'NISSA',
  'VANNY',
  'NOVITA',
  'SELVIA',
  'LUFITA',
  'JESSICA',
  'ALYA',
  'KAMILA',
  'MAHSYA',
  'SALSA',
  'NAZWA',
  'TIFANI',
  'DIVA',
  'NABILAH',
  'RISSA',
  'ILLA',
  'NIA',
  'APRINA',
  'WARIZKA',
  'INDAH',
  'FERA',
  'LISTIANA',
  'WILFRIDA'
];

export function getGroomingCompliment(staffName: string): string {
  const upper = staffName.toUpperCase();
  const isFemale = FEMALE_NAME_KEYWORDS.some((kw) => upper.includes(kw));

  if (isFemale) {
    const randomCeleb = FEMALE_CELEBRITIES[Math.floor(Math.random() * FEMALE_CELEBRITIES.length)];
    return `Cantik amat deh mirip ${randomCeleb}! Terima kasih ya sudah mengisi 😊`;
  } else {
    const randomCeleb = MALE_CELEBRITIES[Math.floor(Math.random() * MALE_CELEBRITIES.length)];
    return `Cakep amat deh mirip ${randomCeleb}! Terima kasih ya sudah mengisi 😎`;
  }
}
