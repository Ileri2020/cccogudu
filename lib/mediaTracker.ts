/**
 * Shared media tracker for CCC Ogudu Cathedral
 * Tracks media IDs seen/played by the user across the music player and blog feeds.
 * Prioritizes unseen media over seen media in current playlists until all have been seen,
 * at which point the playlist cycle starts again.
 */

const SEEN_MEDIA_KEY = "ccl_seen_media_ids";

export function getSeenMediaIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_MEDIA_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch (e) {
    return new Set();
  }
}

export function markMediaAsSeen(mediaId: string | number | undefined | null) {
  if (!mediaId || typeof window === "undefined") return;
  try {
    const idStr = String(mediaId);
    const seen = getSeenMediaIds();
    if (!seen.has(idStr)) {
      seen.add(idStr);
      localStorage.setItem(SEEN_MEDIA_KEY, JSON.stringify(Array.from(seen)));
      window.dispatchEvent(new CustomEvent("ccl_media_seen", { detail: { id: idStr } }));
    }
  } catch (e) {
    console.error("Failed to mark media as seen:", e);
  }
}

export function resetSeenMediaIds(idsToReset?: string[]) {
  if (typeof window === "undefined") return;
  try {
    if (!idsToReset || idsToReset.length === 0) {
      localStorage.removeItem(SEEN_MEDIA_KEY);
    } else {
      const seen = getSeenMediaIds();
      idsToReset.forEach((id) => seen.delete(String(id)));
      localStorage.setItem(SEEN_MEDIA_KEY, JSON.stringify(Array.from(seen)));
    }
    window.dispatchEvent(new CustomEvent("ccl_media_seen_reset"));
  } catch (e) {
    console.error("Failed to reset seen media:", e);
  }
}

/**
 * Prioritizes medias not yet seen by the user.
 * If all medias in the current playlist have already been seen/played,
 * the playlist starts again from the beginning.
 */
export function prioritizeUnseenMedia<T extends { id: string | number }>(playlist: T[]): T[] {
  if (!playlist || playlist.length <= 1) return playlist;
  const seenSet = getSeenMediaIds();

  const unseen = playlist.filter((item) => !seenSet.has(String(item.id)));
  const seen = playlist.filter((item) => seenSet.has(String(item.id)));

  // If user has seen all medias in the current playlist, start again
  if (unseen.length === 0) {
    return playlist;
  }

  // Prioritize unseen first, followed by seen
  return [...unseen, ...seen];
}
