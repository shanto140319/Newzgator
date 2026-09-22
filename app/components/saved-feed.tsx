"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ArticleListResponse } from "../lib/articles";
import { fetchBookmarks } from "../lib/client-api";
import { ArticlePreview } from "./article-preview";
import { ArticleCardsSkeleton } from "./feed-skeleton";
import { useSavedArticles } from "./article-state";

type Data = ArticleListResponse["data"];
const empty: Data = { items: [], nextCursor: null, hasNext: false, size: 0 };

export function SavedFeed({ labels }: { labels: Record<string, string> }) {
  const [data, setData] = useState(empty);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const visible = useSavedArticles(data.items);

  const load = useCallback(async (mode: "replace" | "append") => {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError(false);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const cursor = mode === "append" ? (data.nextCursor ?? "") : "";
      const next = await fetchBookmarks(cursor, abort.signal);
      if (
        mode === "append" &&
        next.hasNext &&
        (!next.nextCursor ||
          next.nextCursor === data.nextCursor ||
          !next.items.some((item) => !data.items.some((old) => old.id === item.id)))
      ) {
        throw new Error("Cursor did not advance");
      }
      setData((current) => {
        if (mode === "replace") return next;
        const seen = new Set(current.items.map((item) => item.id));
        return {
          ...next,
          items: [
            ...current.items,
            ...next.items.filter((item) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            }),
          ],
        };
      });
    } catch {
      if (!abort.signal.aborted) setError(true);
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }, [data]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    void loadRef.current("replace");
    return () => {
      controller.current?.abort();
      lock.current = false;
    };
  }, []);

  useEffect(() => {
    if (!data.hasNext || error || loading || !sentinel.current) return;
    const check = () => {
      if (sentinel.current && sentinel.current.getBoundingClientRect().top < innerHeight + 300) {
        void load("append");
      }
    };
    if (typeof IntersectionObserver === "undefined") {
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check);
      check();
      return () => {
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void load("append");
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [data.hasNext, error, loading, load]);

  return (
    <section aria-label="সংরক্ষিত সংবাদ" aria-busy={loading && !visible.length}>
      {visible.map((article) => (
        <ArticlePreview
          key={article.id}
          article={article}
          label={labels[article.category] ?? article.category}
        />
      ))}
      {!visible.length && !error && !loading && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-10 text-center">
          <h2 className="text-xl font-bold">এখনও কোনো সংবাদ সংরক্ষণ করা নেই</h2>
          <p className="muted mt-3">খবরের নিচে ‘পরে পড়ুন’ চাপলে এখানে পাবেন।</p>
          <Link href="/" className="source-button mt-5">
            সর্বশেষ খবর দেখুন
          </Link>
        </div>
      )}
      {loading && <ArticleCardsSkeleton />}
      {error && (
        <div role="alert" className="py-6 text-center">
          <p>সংরক্ষিত সংবাদ আনা যায়নি।</p>
          <button
            type="button"
            className="source-button mt-3"
            onClick={() => void load(visible.length ? "append" : "replace")}
            disabled={loading}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}
      {data.hasNext && <div ref={sentinel} data-saved-sentinel className="h-10" />}
    </section>
  );
}
