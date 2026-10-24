import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, '../public/en_kjv.json');

const prisma = new PrismaClient();

const bookNames = {
  gen: 'Genesis', exo: 'Exodus', lev: 'Leviticus', num: 'Numbers', deu: 'Deuteronomy',
  jos: 'Joshua', jdg: 'Judges', rut: 'Ruth', '1sa': '1 Samuel', '2sa': '2 Samuel',
  '1ki': '1 Kings', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles',
  ezr: 'Ezra', neh: 'Nehemiah', est: 'Esther', job: 'Job', psa: 'Psalm', pro: 'Proverbs',
  ecc: 'Ecclesiastes', sol: 'Song of Solomon', isa: 'Isaiah', jer: 'Jeremiah', lam: 'Lamentations',
  ezk: 'Ezekiel', dan: 'Daniel', hos: 'Hosea', jol: 'Joel', amo: 'Amos', oba: 'Obadiah',
  jon: 'Jonah', mic: 'Micah', nam: 'Nahum', hab: 'Habakkuk', zep: 'Zephaniah', hag: 'Haggai',
  zek: 'Zechariah', mal: 'Malachi', mat: 'Matthew', mrk: 'Mark', luk: 'Luke', joh: 'John',
  act: 'Acts', rom: 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', gal: 'Galatians',
  eph: 'Ephesians', php: 'Philippians', col: 'Colossians', '1th': '1 Thessalonians',
  '2th': '2 Thessalonians', '1ti': '1 Timothy', '2ti': '2 Timothy', tit: 'Titus', phm: 'Philemon',
  heb: 'Hebrews', jam: 'James', '1pe': '1 Peter', '2pe': '2 Peter', '1jo': '1 John',
  '2jo': '2 John', '3jo': '3 John', jud: 'Jude', rev: 'Revelation',
};

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Bible JSON not found at: ${jsonPath}`);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const books = parsed?.books || {};

  const records = [];

  for (const [bookKey, chapters] of Object.entries(books)) {
    const bookName = bookNames[bookKey] || bookKey.toUpperCase();
    const chapterMap = chapters || {};

    for (const [chapterNumber, verses] of Object.entries(chapterMap)) {
      if (!Array.isArray(verses)) continue;

      verses.forEach((verseText, index) => {
        const text = String(verseText || '').trim();
        if (!text) return;

        records.push({
          verse: text,
          page: `${bookName} ${chapterNumber}:${index + 1}`,
        });
      });
    }
  }

  if (records.length === 0) {
    throw new Error('No Bible verses were found in the JSON file.');
  }

  let user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'bible-loader@cccogudu.local',
        username: 'Bible Loader',
        name: 'Bible Loader',
        role: 'admin',
        department: 'admin',
      },
    });
  }

  await prisma.bible.deleteMany({});

  for (const batch of chunk(records, 500)) {
    await prisma.bible.createMany({
      data: batch.map((record) => ({
        ...record,
        userId: user.id,
      })),
    });
  }

  const total = await prisma.bible.count();
  console.log(`Imported ${total} Bible verses into the database using user ${user.id}.`);
}

main()
  .catch((error) => {
    console.error('Bible import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
