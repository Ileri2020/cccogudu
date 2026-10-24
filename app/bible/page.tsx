"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, LoaderCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type BibleEntry = {
  id: string;
  verse: string;
  page: string;
  createdAt?: string;
  user?: { name?: string | null } | null;
};

export default function BiblePage() {
  const [entries, setEntries] = useState<BibleEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("/api/dbhandler", {
          params: { model: "bible", ...(query.trim() ? { search: query.trim() } : {}) },
          signal: controller.signal,
        });
        setEntries(Array.isArray(response.data) ? response.data : []);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          console.error("Failed to load Bible passages", fetchError);
          setError("Bible passages could not be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <main className="min-h-[70vh] bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/15 via-background to-secondary p-6 shadow-sm sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-background/75 px-3 py-1 text-sm font-medium text-accent">
              <BookOpen className="h-4 w-4" /> Scripture library
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Bible passages</h1>
            <p className="mt-3 text-muted-foreground sm:text-lg">
              Search and read scripture passages shared with the CCC Ogudu community.
            </p>
            <label className="relative mt-7 block max-w-xl">
              <span className="sr-only">Search passages or references</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search verse text or reference..."
                className="h-12 rounded-xl border-border/80 bg-background pl-12 text-base shadow-sm"
              />
            </label>
          </div>
          <BookOpen aria-hidden="true" className="absolute -bottom-12 -right-8 hidden h-64 w-64 rotate-[-12deg] text-accent/10 sm:block" />
        </section>

        <section aria-live="polite" className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{query.trim() ? "Search results" : "Community passages"}</h2>
            {!loading && <span className="text-sm text-muted-foreground">{entries.length} {entries.length === 1 ? "passage" : "passages"}</span>}
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Loading passages…
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-destructive">{error}</div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 font-medium">No passages found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another reference or search term.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                  <p className="text-base leading-7 sm:text-lg sm:leading-8">“{entry.verse}”</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
                    <h3 className="font-semibold text-accent">{entry.page}</h3>
                    {entry.user?.name && <span className="truncate text-xs text-muted-foreground">Shared by {entry.user.name}</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
