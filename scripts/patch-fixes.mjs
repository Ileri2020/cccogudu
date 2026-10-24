import fs from 'fs';
import path from 'path';

// 1. Update app/home/page.tsx: change defaultCategory="ccc hymns" to defaultCategory="ccc"
const homePath = path.resolve('app/home/page.tsx');
let homeContent = fs.readFileSync(homePath, 'utf8');
homeContent = homeContent.replace('defaultCategory="ccc hymns"', 'defaultCategory="ccc"');
fs.writeFileSync(homePath, homeContent, 'utf8');
console.log('Updated app/home/page.tsx to defaultCategory="ccc"');

// 2. Update components/sub/music.tsx
const musicPath = path.resolve('components/sub/music.tsx');
let musicContent = fs.readFileSync(musicPath, 'utf8');

// Ensure default track has category "ccc"
const oldTrack = `    id: "cld-hymn-1",
    title: "Olore - Celestial Hymn 420",
    artist: "CCC Ogudu Youth Fellowship",
    category: "hymn",`;

const newTrack = `    id: "cld-hymn-1",
    title: "Olore - Celestial Hymn 420",
    artist: "CCC Ogudu Youth Fellowship",
    category: "ccc",`;

if (musicContent.includes(oldTrack)) {
  musicContent = musicContent.replace(oldTrack, newTrack);
}

// Ensure filteredTracks matches "ccc" / "heritage"
const oldFilter = `    // Specific match for CCC Hymns playlist
    if (cat === "ccc hymns" || cat === "ccchymns" || cat === "ccc-hymns" || cat === "hymn" || cat === "hymns") {`;

const newFilter = `    // Specific match for CCC Heritage playlist
    if (cat === "ccc" || cat === "heritage") {
      const results = cloudinaryTracks.filter((t) => {
        const trackCat = t.category.toLowerCase();
        return trackCat === "ccc" || trackCat.includes("ccc") || trackCat.includes("heritage");
      });
      if (results.length > 0) return results;
    }

    // Specific match for CCC Hymns playlist
    if (cat === "ccc hymns" || cat === "ccchymns" || cat === "ccc-hymns" || cat === "hymn" || cat === "hymns") {`;

if (musicContent.includes(oldFilter) && !musicContent.includes('// Specific match for CCC Heritage playlist')) {
  musicContent = musicContent.replace(oldFilter, newFilter);
}

fs.writeFileSync(musicPath, musicContent, 'utf8');
console.log('Updated components/sub/music.tsx for CCC Heritage playlist filtering');
