"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, Bookmark, ChevronLeft, ChevronRight, LoaderCircle, Search, Save, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppContext } from "@/hooks/useAppContext";

type BibleEntry = {
  id: string;
  verse: string;
  page: string;
  createdAt?: string;
  user?: { name?: string | null } | null;
};

type SavedPassage = {
  id: string;
  label: string;
  book: string;
  chapter: number;
  start: number;
  end: number;
  text: string;
  createdAt: string;
};

const BIBLE_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalm","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

const STORAGE_KEY = "ccc-ogudu-saved-bible-passages";

const parsePage = (page: string) => {
  const match = page.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: Number(match[2]),
    verse: Number(match[3]),
  };
};

const getBookRange = (book: string, entries: BibleEntry[]) => {
  const maxChapter = entries.reduce((max, item) => {
    const parsed = parsePage(item.page);
    if (parsed && parsed.book === book) {
      return Math.max(max, parsed.chapter);
    }
    return max;
  }, 0);

  const maxVerse = entries.reduce((max, item) => {
    const parsed = parsePage(item.page);
    if (parsed && parsed.book === book) {
      return Math.max(max, parsed.verse);
    }
    return max;
  }, 0);

  return { maxChapter, maxVerse };
};

export default function BiblePage() {
  const { user } = useAppContext();
  const [allEntries, setAllEntries] = useState<BibleEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerseStart, setSelectedVerseStart] = useState(1);
  const [selectedVerseEnd, setSelectedVerseEnd] = useState(1);
  const [savedPassages, setSavedPassages] = useState<SavedPassage[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedPassages(JSON.parse(stored));
      }
    } catch {
      setSavedPassages([]);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("/api/dbhandler", {
          params: { model: "bible" },
          signal: controller.signal,
        });
        const entries = Array.isArray(response.data) ? response.data : [];
        setAllEntries(entries);

        if (entries.length > 0) {
          const firstBookEntry = entries.find((entry) => parsePage(entry.page));
          const firstBook = firstBookEntry ? parsePage(firstBookEntry.page)?.book || selectedBook : selectedBook;
          setSelectedBook((current) => {
            const validBook = BIBLE_BOOKS.includes(current) ? current : firstBook;
            return validBook;
          });
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          console.error("Failed to load Bible passages", fetchError);
          setError("Bible passages could not be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 100);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const bookEntries = useMemo(() => {
    if (!allEntries.length) return [];
    return allEntries.filter((entry) => {
      const parsed = parsePage(entry.page);
      return parsed && parsed.book === selectedBook;
    });
  }, [allEntries, selectedBook]);

  const availableChapters = useMemo(() => {
    const chapters = new Set<number>();
    bookEntries.forEach((entry) => {
      const parsed = parsePage(entry.page);
      if (parsed) chapters.add(parsed.chapter);
    });
    return Array.from(chapters).sort((a, b) => a - b);
  }, [bookEntries]);

  useEffect(() => {
    if (!availableChapters.length) return;

    if (!availableChapters.includes(selectedChapter)) {
      setSelectedChapter(availableChapters[0]);
      return;
    }

    const filtered = bookEntries.filter((entry) => {
      const parsed = parsePage(entry.page);
      return parsed && parsed.chapter === selectedChapter;
    });

    const verseNumbers = filtered.map((entry) => parsePage(entry.page)?.verse ?? 0).sort((a, b) => a - b);
    if (!verseNumbers.length) return;

    setSelectedVerseStart((current) => {
      if (current < 1 || current > verseNumbers[verseNumbers.length - 1]) {
        return verseNumbers[0];
      }
      return current;
    });
    setSelectedVerseEnd((current) => {
      const maxVerse = verseNumbers[verseNumbers.length - 1];
      if (current < 1 || current > maxVerse) {
        return maxVerse;
      }
      return current;
    });
  }, [availableChapters, bookEntries, selectedChapter]);

  const selectedChapterEntries = useMemo(() => {
    return bookEntries.filter((entry) => {
      const parsed = parsePage(entry.page);
      return parsed && parsed.chapter === selectedChapter;
    }).sort((a, b) => {
      const aPage = parsePage(a.page);
      const bPage = parsePage(b.page);
      return (aPage?.verse ?? 0) - (bPage?.verse ?? 0);
    });
  }, [bookEntries, selectedChapter]);

  const visiblePassages = useMemo(() => {
    if (!selectedChapterEntries.length) return [];

    const start = Math.min(selectedVerseStart, selectedVerseEnd);
    const end = Math.max(selectedVerseStart, selectedVerseEnd);

    return selectedChapterEntries.filter((entry) => {
      const parsed = parsePage(entry.page);
      if (!parsed) return false;
      return parsed.verse >= start && parsed.verse <= end;
    });
  }, [selectedChapterEntries, selectedVerseEnd, selectedVerseStart]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    return allEntries.filter((entry) => {
      const pageText = entry.page.toLowerCase();
      const verseText = entry.verse.toLowerCase();
      const searchText = query.trim().toLowerCase();
      return pageText.includes(searchText) || verseText.includes(searchText);
    }).slice(0, 20);
  }, [allEntries, query]);

  const savePassage = () => {
    if (!visiblePassages.length) {
      toast.error("Select at least one verse to save.");
      return;
    }

    const text = visiblePassages.map((entry) => entry.verse).join(" ");
    const label = `${selectedBook} ${selectedChapter}:${Math.min(selectedVerseStart, selectedVerseEnd)}-${Math.max(selectedVerseStart, selectedVerseEnd)}`;
    const nextItem: SavedPassage = {
      id: `${selectedBook}-${selectedChapter}-${selectedVerseStart}-${selectedVerseEnd}-${Date.now()}`,
      book: selectedBook,
      chapter: selectedChapter,
      start: Math.min(selectedVerseStart, selectedVerseEnd),
      end: Math.max(selectedVerseStart, selectedVerseEnd),
      label,
      text,
      createdAt: new Date().toISOString(),
    };

    setSavedPassages((current) => {
      const next = [nextItem, ...current.filter((item) => item.label !== label || item.text !== text)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (user?.id && user.id !== "nil") {
      axios.post("/api/dbhandler?model=bible", {
        page: label,
        verse: text,
        userId: user.id,
      }).catch(() => {
        // fail silently so the local save still works
      });
    }

    toast.success(`Saved ${label}`);
  };

  const loadSavedPassage = (passage: SavedPassage) => {
    setSelectedBook(passage.book);
    setSelectedChapter(passage.chapter);
    setSelectedVerseStart(passage.start);
    setSelectedVerseEnd(passage.end);
    toast.success(`Loaded ${passage.label}`);
  };

  const handlePreviousChapter = () => {
    if (availableChapters.length === 0) return;
    const currentIndex = availableChapters.indexOf(selectedChapter);
    const previous = availableChapters[currentIndex > 0 ? currentIndex - 1 : availableChapters.length - 1];
    setSelectedChapter(previous);
  };

  const handleNextChapter = () => {
    if (availableChapters.length === 0) return;
    const currentIndex = availableChapters.indexOf(selectedChapter);
    const next = availableChapters[(currentIndex + 1) % availableChapters.length];
    setSelectedChapter(next);
  };

  if (loading && !allEntries.length) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-10 text-foreground">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading Bible library…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/15 via-background to-secondary p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-background/80 px-3 py-1 text-sm font-medium text-accent">
                <BookOpen className="h-4 w-4" /> Bible Library
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Read scripture</h1>
            </div>

            <label className="relative block w-full max-w-xl">
              <span className="sr-only">Search scripture</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by verse, chapter or book..."
                className="h-12 rounded-xl border-border/80 bg-background pl-10 text-base shadow-sm"
              />
            </label>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Book</label>
                <select
                  value={selectedBook}
                  onChange={(event) => setSelectedBook(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 focus:border-accent"
                >
                  {BIBLE_BOOKS.map((book) => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chapter</label>
                <select
                  value={selectedChapter}
                  onChange={(event) => setSelectedChapter(Number(event.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 focus:border-accent"
                >
                  {availableChapters.map((chapter) => (
                    <option key={chapter} value={chapter}>{chapter}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reading range</label>
                <div className="flex gap-2">
                  <select
                    value={selectedVerseStart}
                    onChange={(event) => setSelectedVerseStart(Number(event.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 focus:border-accent"
                  >
                    {selectedChapterEntries.map((entry) => {
                      const parsed = parsePage(entry.page);
                      if (!parsed) return null;
                      return <option key={`${entry.id}-start`} value={parsed.verse}>{parsed.verse}</option>;
                    })}
                  </select>
                  <select
                    value={selectedVerseEnd}
                    onChange={(event) => setSelectedVerseEnd(Number(event.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 focus:border-accent"
                  >
                    {selectedChapterEntries.map((entry) => {
                      const parsed = parsePage(entry.page);
                      if (!parsed) return null;
                      return <option key={`${entry.id}-end`} value={parsed.verse}>{parsed.verse}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 text-accent" />
                <span>
                  {selectedBook} {selectedChapter}: {Math.min(selectedVerseStart, selectedVerseEnd)}-{Math.max(selectedVerseStart, selectedVerseEnd)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handlePreviousChapter} className="rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleNextChapter} className="rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {visiblePassages.length ? (
                visiblePassages.map((entry) => {
                  const parsed = parsePage(entry.page);
                  return (
                    <article key={entry.id} className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{entry.page}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setQuery(entry.page)}>
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-lg leading-8 text-foreground">“{entry.verse}”</p>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-muted-foreground">
                  No verses available for this selection.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button type="button" onClick={savePassage} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Save className="mr-2 h-4 w-4" /> Save passage
              </Button>
              <Button type="button" variant="outline" onClick={() => setQuery(`${selectedBook} ${selectedChapter}`)} className="rounded-full">
                <Search className="mr-2 h-4 w-4" /> Search chapter
              </Button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-semibold">Saved passages</h2>
              </div>

              {savedPassages.length ? (
                <div className="space-y-3">
                  {savedPassages.map((passage) => (
                    <button
                      key={passage.id}
                      type="button"
                      onClick={() => loadSavedPassage(passage)}
                      className="w-full rounded-2xl border border-border/70 bg-background p-3 text-left transition-colors hover:border-accent/50 hover:bg-accent/5"
                    >
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{passage.label}</div>
                      <div className="line-clamp-3 text-sm leading-6 text-foreground">{passage.text}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No saved verses yet. Save a chapter excerpt to come back to it later.</p>
              )}
            </div>

            {query.trim() && searchResults.length > 0 && (
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-accent" />
                  <h2 className="text-lg font-semibold">Search results</h2>
                </div>

                <div className="space-y-3">
                  {searchResults.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        const parsed = parsePage(entry.page);
                        if (!parsed) return;
                        setSelectedBook(parsed.book);
                        setSelectedChapter(parsed.chapter);
                        setSelectedVerseStart(parsed.verse);
                        setSelectedVerseEnd(parsed.verse);
                        setQuery("");
                      }}
                      className="w-full rounded-2xl border border-border/70 bg-background p-3 text-left transition-colors hover:border-accent/50 hover:bg-accent/5"
                    >
                      <div className="text-xs font-medium uppercase tracking-[0.15em] text-accent">{entry.page}</div>
                      <div className="mt-2 text-sm leading-6 text-foreground">“{entry.verse}”</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
