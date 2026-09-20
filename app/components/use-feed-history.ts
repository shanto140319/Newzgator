"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { Article } from "../lib/articles";
export type FeedState = { items: Article[]; cursor: string | null; hasNext: boolean };
type Snapshot = FeedState & { scrollY: number };
const memory = new Map<string, Snapshot>();
const prefix = "news-feed-render-v3:";
const limit = 20;
function readSnapshot(key: string): Snapshot | undefined {
  const cached = memory.get(key);
  if (cached) return cached;
  try {
    const value = JSON.parse(sessionStorage.getItem(prefix + key) ?? "null");
    if (value && Array.isArray(value.items) && typeof value.hasNext === "boolean" && (value.cursor === null || typeof value.cursor === "string") && Number.isFinite(value.scrollY) && value.scrollY >= 0) return value;
  } catch { /* Storage is optional. */ }
}
function saveSnapshot(key: string, value: Snapshot) {
  memory.delete(key);
  memory.set(key, value);
  if (memory.size > limit) memory.delete(memory.keys().next().value!);
  try {
    sessionStorage.setItem(prefix + key, JSON.stringify(value));
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(prefix));
    for (const old of keys.filter(k => k !== prefix + key).slice(0, Math.max(0, keys.length - limit))) sessionStorage.removeItem(old);
  } catch { /* In-memory restoration also works with blocked/full storage. */ }
}

export function useFeedHistory(route: string, initial: FeedState) {
  const [feed, setFeed] = useState(initial);
  const [ready, setReady] = useState(false);
  const current = useRef<Snapshot>({ ...initial, scrollY: 0 });
  const restoring = useRef(false);
  const persist = useRef<(() => void) | null>(null);

  // Run before restoration: a mount still has first-batch props, so synchronizing
  // after restoration would overwrite the restored snapshot during Strict Mode replay.
  useLayoutEffect(() => {
    current.current = { ...current.current, ...feed };
    persist.current?.();
  }, [feed]);

  useLayoutEffect(() => {
    const entry = history.state?.newsFeed;
    const key = entry?.route === route ? entry.key : crypto.randomUUID();
    history.replaceState({ ...history.state, newsFeed: { route, key } }, "");
    // The route snapshot also covers the detail page's Home link, which pushes a new entry.
    const saved = readSnapshot(key) ?? readSnapshot(route);
    let frame = 0;
    let observer: ResizeObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      restoring.current = false;
      observer?.disconnect();
      clearTimeout(timer);
      current.current.scrollY = window.scrollY;
      setReady(true);
    };
    if (saved) {
      // Keep pagination suspended until the restored list has been painted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(false);
      restoring.current = true;
      current.current = saved;
      // Restore the full list before the browser can paint or attempt to scroll.
      setFeed({ items: saved.items, cursor: saved.cursor, hasNext: saved.hasNext });
      const restore = () => {
        if (cancelled) return;
        window.scrollTo({ top: saved.scrollY, behavior: "instant" });
        if (Math.abs(window.scrollY - saved.scrollY) < 2) finish();
      };
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          observer = new ResizeObserver(restore);
          observer.observe(document.body);
          timer = setTimeout(finish, 2000);
          restore();
        });
      });
    } else {
      setReady(true);
    }
    const track = () => { if (!restoring.current) current.current = { ...current.current, scrollY: window.scrollY }; };
    const save = () => {
      saveSnapshot(key, current.current);
      saveSnapshot(route, current.current);
    };
    persist.current = save;
    save();
    const leaving = (event: MouseEvent) => {
      if ((event.target as Element)?.closest?.("a[href]")) { interrupt(); track(); save(); }
    };
    const interrupt = () => { if (restoring.current) { cancelAnimationFrame(frame); finish(); } };
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("pagehide", save);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    document.addEventListener("click", leaving, true);
    return () => {
      cancelled = true;
      persist.current = null;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("scroll", track);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      document.removeEventListener("click", leaving, true);
      save();
    };
  }, [route]);
  return { feed, setFeed, ready };
}
