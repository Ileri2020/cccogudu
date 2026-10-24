import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// 1. Fix app/blog/page.tsx: Remove forced dark mode
// -------------------------------------------------------------
const blogPath = path.resolve('app/blog/page.tsx');
let blogContent = fs.readFileSync(blogPath, 'utf8');

const oldThemeEffect = `  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const mobileThemeRef = useRef<string | undefined>(undefined);

  const [initialTab, setInitialTab] = useState("ccc");

  useEffect(() => {
    if (!isMobile) return;

    mobileThemeRef.current = theme;
    if (theme !== 'dark') setTheme('dark');

    return () => {
      if (mobileThemeRef.current && mobileThemeRef.current !== 'dark') {
        setTheme(mobileThemeRef.current as 'light' | 'system');
      }
      mobileThemeRef.current = undefined;
    };
  }, [isMobile]);`;

const newThemeEffect = `  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const [initialTab, setInitialTab] = useState("ccc");`;

if (blogContent.includes(oldThemeEffect)) {
  blogContent = blogContent.replace(oldThemeEffect, newThemeEffect);
  fs.writeFileSync(blogPath, blogContent, 'utf8');
  console.log('Fixed blog/page.tsx: Removed forced dark mode');
} else {
  console.log('oldThemeEffect not directly matched, checking partial');
  const effectRegex = /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!isMobile\)\s*return;[\s\S]*?\}, \s*\[isMobile\]\);/;
  if (effectRegex.test(blogContent)) {
    blogContent = blogContent.replace(effectRegex, '');
    blogContent = blogContent.replace('const mobileThemeRef = useRef<string | undefined>(undefined);', '');
    fs.writeFileSync(blogPath, blogContent, 'utf8');
    console.log('Fixed blog/page.tsx via regex');
  }
}

// -------------------------------------------------------------
// 2. Fix components/myComponents/subs/post.tsx: Theme-aware feed
// -------------------------------------------------------------
const postPath = path.resolve('components/myComponents/subs/post.tsx');
let postContent = fs.readFileSync(postPath, 'utf8');

postContent = postContent.replace(
  'overflow-hidden bg-black text-white md:mt-10 md:h-auto',
  'overflow-hidden bg-background text-foreground md:mt-10 md:h-auto'
);

postContent = postContent.replace(
  'bg-gradient-to-b from-black/75 to-transparent px-4 pb-8',
  'bg-gradient-to-b from-background/90 via-background/60 to-transparent px-4 pb-8 text-foreground'
);

postContent = postContent.replace(
  'bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-[max(env(safe-area-inset-bottom),1rem)] md:relative md:inset-auto md:bg-secondary md:p-2',
  'bg-gradient-to-t from-background via-background/90 to-transparent p-4 pb-[max(env(safe-area-inset-bottom),1rem)] text-foreground md:relative md:inset-auto md:bg-secondary md:p-2'
);

fs.writeFileSync(postPath, postContent, 'utf8');
console.log('Updated post.tsx for light and dark theme mode support');

// -------------------------------------------------------------
// 3. Fix components/sub/music.tsx:
//    - Map postCategory so Array.isArray(post.for) includes ALL categories (e.g. "worship ccc")
//    - Make defaultCategory="ccc"
//    - Put CCC tracks first in DEFAULT_TRACKS
// -------------------------------------------------------------
const musicPath = path.resolve('components/sub/music.tsx');
let musicContent = fs.readFileSync(musicPath, 'utf8');

// Update DEFAULT_TRACKS with CCC hymns first
const oldDefaultTracks = `const DEFAULT_TRACKS: MediaTrack[] = [
  {
    id: "cld-praise-1",
    title: "This Kind God Another One Mo Dey (OG Drummer)",
    artist: "CCC Ogudu Choir & Drummers",
    category: "praise",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4"),
    duration: 195,
    likes: 420,
    comments: [
      { id: "c1", user: "Bro Samuel", text: "Celestial percussion at its finest! Hallelujah!", time: "15 mins ago" },
      { id: "c2", user: "Sis Folake", text: "Blessing my soul today.", time: "1 hour ago" },
    ],
  },`;

const newDefaultTracks = `const DEFAULT_TRACKS: MediaTrack[] = [
  {
    id: "cld-ccc-1",
    title: "Olore - Celestial Hymn 420",
    artist: "CCC Ogudu Youth Fellowship",
    category: "ccc",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847202/olore_dzeew9.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847202/olore_dzeew9.mp4"),
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: 245,
    likes: 610,
    comments: [
      { id: "c5", user: "Mother Bola", text: "Touching spiritual hymn. Amen.", time: "Yesterday" },
    ],
  },
  {
    id: "cld-ccc-2",
    title: "CCC Hymns Worship Medley",
    artist: "CCC Ogudu Central Choir",
    category: "ccc",
    videoUrl: "https://res.cloudinary.com/dvqqk9rep/video/upload/v1775040032/ccc_hymns_worship_medley_asozkz.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/dvqqk9rep/video/upload/v1775040032/ccc_hymns_worship_medley_asozkz.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/dvqqk9rep/video/upload/v1775040032/ccc_hymns_worship_medley_asozkz.mp4"),
    duration: 310,
    likes: 720,
    comments: [
      { id: "c6", user: "Leader Ezekiel", text: "Divine heritage praise. Hallelujah!", time: "Today" },
    ],
  },
  {
    id: "cld-praise-1",
    title: "This Kind God Another One Mo Dey (OG Drummer)",
    artist: "CCC Ogudu Choir & Drummers",
    category: "praise",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4"),
    duration: 195,
    likes: 420,
    comments: [
      { id: "c1", user: "Bro Samuel", text: "Celestial percussion at its finest! Hallelujah!", time: "15 mins ago" },
      { id: "c2", user: "Sis Folake", text: "Blessing my soul today.", time: "1 hour ago" },
    ],
  },`;

if (musicContent.includes(oldDefaultTracks)) {
  musicContent = musicContent.replace(oldDefaultTracks, newDefaultTracks);
}

// Fix postCategory mapping so all categories in post.for are preserved (e.g., ["worship", "ccc"] -> "worship ccc")
const oldPostCategory = `              const postCategory = Array.isArray(post.for)
                ? post.for[0] || "praise"
                : typeof post.for === "string"
                ? post.for
                : "worship";`;

const newPostCategory = `              const postCategory = Array.isArray(post.for)
                ? post.for.join(" ").toLowerCase()
                : typeof post.for === "string"
                ? post.for.toLowerCase()
                : "worship";`;

if (musicContent.includes(oldPostCategory)) {
  musicContent = musicContent.replace(oldPostCategory, newPostCategory);
}

// Update defaultCategory prop default to "ccc"
musicContent = musicContent.replace('defaultCategory = "all"', 'defaultCategory = "ccc"');
musicContent = musicContent.replace(
  'const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);',
  'const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory || "ccc");'
);

fs.writeFileSync(musicPath, musicContent, 'utf8');
console.log('Updated music.tsx for CCC Heritage default playlist and category mapping');
