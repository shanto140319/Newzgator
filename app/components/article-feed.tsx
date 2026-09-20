"use client";
import { useFeedHistory } from "./use-feed-history";
import { ArticleCardsSkeleton } from "./feed-skeleton";
import { ArticlePreview } from "./article-preview";
import { useRouter } from "next/navigation";
import { feedHref } from "../lib/feed-route";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Article, ArticleListResponse, Portal } from "../lib/articles";
type ArticleFeedProps = {
  category: string;
  portalId: string;
  portals: Portal[];
  categoryLabels: Record<string, string>;
  initialItems: Article[];
  initialCursor: string | null;
  initialHasNext: boolean;
  isFallback?: boolean;
};

export function ArticleFeed({
  category,
  portalId,
  portals,
  categoryLabels,
  initialItems,
  initialCursor,
  initialHasNext,
  isFallback = false,
}: ArticleFeedProps) {
  const router = useRouter();
  const [filterPending, startTransition] = useTransition();
  const endpoint = "/api/articles";
  const { feed, setFeed, ready } = useFeedHistory(feedHref(category, portalId), { items: initialItems, cursor: initialCursor, hasNext: initialHasNext });
  const { items, cursor, hasNext } = feed;
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoadPaused, setAutoLoadPaused] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const notice = isFallback ? "লাইভ সংবাদ আনা যায়নি। আবার চেষ্টা করুন।" : "";
  const loadMoreInFlightRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (loadMoreInFlightRef.current || !hasNext || !ready) return;

    loadMoreInFlightRef.current = true;
    setIsLoading(true);
    setLoadMoreError("");

    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (category) params.set("category", category);
      if (portalId) params.set("portalId", portalId);
      const controller = new AbortController();
      controllerRef.current = controller;
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(50_000)]),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Unable to load articles");

      const result = (await response.json()) as ArticleListResponse;
      if (!result.success || !Array.isArray(result.data?.items)) {
        throw new Error(result.message || "Invalid article response");
      }

      if (result.data.hasNext && (!result.data.nextCursor || result.data.nextCursor === cursor)) throw new Error("Cursor did not advance");
      const existingIds = new Set(items.map(item => item.id));
      if (result.data.hasNext && !result.data.items.some(item => !existingIds.has(item.id))) {
        throw new Error("Pagination returned no new articles");
      }
      setFeed(current => {
        const ids = new Set(current.items.map(item => item.id));
        const added = result.data.items.filter(item => {
          if (ids.has(item.id)) return false;
          ids.add(item.id);
          return true;
        });
        return { items: [...current.items, ...added], cursor: result.data.nextCursor, hasNext: result.data.hasNext };
      });
      setAutoLoadPaused(false);
    } catch {
      if (controllerRef.current?.signal.aborted) return;
      setLoadMoreError("নতুন খবর আনা যায়নি। আবার চেষ্টা করুন।");
      setAutoLoadPaused(true);
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [category, portalId, cursor, endpoint, hasNext, items, ready, setFeed]);

  useEffect(() => {
    if (!ready || !hasNext || isLoading || autoLoadPaused || !sentinel.current) return;
    if (typeof IntersectionObserver === "undefined") {
      const checkPosition = () => {
        if (sentinel.current && sentinel.current.getBoundingClientRect().top <= window.innerHeight + 300) void loadMore();
      };
      window.addEventListener("scroll", checkPosition, { passive: true });
      window.addEventListener("resize", checkPosition);
      checkPosition();
      return () => {
        window.removeEventListener("scroll", checkPosition);
        window.removeEventListener("resize", checkPosition);
      };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: "300px 0px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [ready, hasNext, isLoading, autoLoadPaused, loadMore]);

  if (items.length === 0) {
    return (
      <section className="grid place-items-center rounded-[18px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/15 dark:bg-[#111925] reading:border-[#cdbfa6] reading:bg-[#fffaf0]">
        <span className="grid size-10 place-items-center rounded-full bg-[#c83018]/10 font-extrabold text-[#e9482b]" aria-hidden="true">
          !
        </span>
        <h2 className="mt-4 text-xl font-extrabold">{isFallback ? "সংবাদ আনা যায়নি" : "এখনও কোনো খবর পাওয়া যায়নি"}</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400 reading:text-[#756553]">
          কিছুক্ষণ পর আবার পেজটি রিফ্রেশ করুন।
        </p>
      </section>
    );
  }

  const [featured, ...rest] = items;

  return (
    <section data-article-feed aria-busy={!ready} className="grid gap-6" aria-label="সর্বশেষ সংবাদ">
      {notice && (
        <div
          className="mb-[-14px] flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm text-blue-900 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200 reading:border-[#cfbea3] reading:bg-[#eadfc9] reading:text-[#66513d]"
          role="status"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-800 font-serif text-xs font-bold text-white dark:bg-blue-400 dark:text-[#0b1018] reading:bg-[#80684f]">
            i
          </span>
          {notice}
        </div>
      )}

      <ArticlePreview featured article={featured} label={categoryLabels[featured.category] ?? featured.category} />

      {rest.length > 0 && (
        <div className="mt-0">
          <div className="mb-5 flex items-baseline justify-between gap-5 border-b border-slate-200 pb-3 dark:border-white/10 reading:border-[#d8ccb5]">
            <h2 className="text-2xl font-extrabold tracking-[-0.025em] reading:font-serif">
              সর্বশেষ খবর
            </h2>
            <label className="muted flex items-center gap-2 text-xs"><span className="sr-only">সংবাদমাধ্যম বাছাই করুন</span><select aria-label="সংবাদমাধ্যম বাছাই করুন" value={portalId} disabled={!ready || filterPending} className="publisher-select" onChange={event => startTransition(() => router.push(feedHref(category, event.target.value)))}><option value="">সব সংবাদমাধ্যম</option>{portalId && !portals.some(p => String(p.id) === portalId) && <option value={portalId}>নির্বাচিত সংবাদমাধ্যম</option>}{portals.map(p => <option key={p.id} value={p.id}>{p.nameBn || p.name}</option>)}</select>{filterPending && <span role="status">আসছে…</span>}</label>
          </div>
          <div className="story-list">
            {rest.map((article) => (
              <ArticlePreview key={article.id} article={article} label={categoryLabels[article.category] ?? article.category} />
            ))}
          </div>
        </div>
      )}

      {isLoading && <ArticleCardsSkeleton />}
      {hasNext && (
        <div
          ref={sentinel}
          data-feed-sentinel
          className="flex min-h-20 flex-col items-center justify-center gap-2 pt-3 text-sm font-semibold text-slate-600 dark:text-slate-400 reading:text-[#756553]"
          aria-live="polite"
        >
          {isLoading && (
            <>
              <span className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#e9482b] dark:border-white/15 dark:border-t-[#ff8069]" aria-hidden="true" />
              <span>আরও খবর আসছে…</span>
            </>
          )}
          {autoLoadPaused && (
            <>
              <span role="alert">{loadMoreError}</span>
              <button
                className="cursor-pointer rounded-full border border-slate-300 bg-white px-5 py-2 font-extrabold text-[#c83018] dark:border-white/15 dark:bg-[#111925] dark:text-[#ff8069] reading:border-[#cdbfa6] reading:bg-[#fffaf0]"
                onClick={() => {
                  setAutoLoadPaused(false);
                  void loadMore();
                }}
                type="button"
              >
                আবার চেষ্টা করুন
              </button>
            </>
          )}
          {!isLoading && !autoLoadPaused && <span>আরও খবর দেখতে স্ক্রল করুন</span>}
        </div>
      )}
    </section>
  );
}
