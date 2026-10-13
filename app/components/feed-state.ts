"use client";
import type { Article } from "../lib/articles";

export type FeedState = { items: Article[]; cursor: string | null; hasNext: boolean };
// Module state survives client navigations but not a reload, so a refresh always shows a fresh feed.
const feeds = new Map<string, FeedState & { origin: string }>();
let exitedTo = "";

/** The origin identifies the server's first page; a different one means newer articles arrived. */
export function restoreFeed(key: string, origin: string): FeedState | undefined {
  const saved = feeds.get(key);
  return saved?.origin === origin ? { items: saved.items, cursor: saved.cursor, hasNext: saved.hasNext } : undefined;
}
export function saveFeed(key: string, origin: string, feed: FeedState) { feeds.set(key, { ...feed, origin }); }
export function markFeedExit(path: string) { exitedTo = path; }
export function cameFromFeed(path: string) { return exitedTo === path; }
