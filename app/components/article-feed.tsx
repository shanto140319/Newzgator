"use client";
import { localizedName } from "../lib/localized-name";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Article, Portal } from "../lib/articles";
import { fetchArticles } from "../lib/client-api";
import { feedLayouts } from "../lib/feed-layout";
import { feedHref } from "../lib/feed-route";
import { ArticlePreview } from "./article-preview";
import { ArticleCardsSkeleton } from "./feed-skeleton";

type FeedState = { items: Article[]; cursor: string | null; hasNext: boolean };

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

/** Drop legacy feed snapshots so hard refresh never shows a stale list. */
function clearLegacyFeedCache() {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("news-feed-render")) sessionStorage.removeItem(key);
    }
  } catch {
    /* Storage may be blocked. */
  }
}

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
  const locale = useLocale();

  const t = useTranslations();

  const router = useRouter();
  const [filterPending, startTransition] = useTransition();
  const [feed, setFeed] = useState<FeedState>({
    items: initialItems,
    cursor: initialCursor,
    hasNext: initialHasNext,
  });
  const { items, cursor, hasNext } = feed;
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoadPaused, setAutoLoadPaused] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const notice = isFallback ? t("liveNewsCouldNotBeLoadedPleaseTryAgain") : "";
  const loadMoreInFlightRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const completedCursors = useRef(new Set<string>());
  const autoLoadRef = useRef<() => void>(() => {});

  useEffect(() => {
    clearLegacyFeedCache();
    return () => controllerRef.current?.abort();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadMoreInFlightRef.current || !hasNext || completedCursors.current.has(cursor ?? "")) return;

    loadMoreInFlightRef.current = true;
    setIsLoading(true);
    setLoadMoreError("");

    try {
      const controller = new AbortController();
      controllerRef.current = controller;
      const data = await fetchArticles(
        { category, portalId, cursor: cursor ?? undefined },
        controller.signal,
      );

      if (data.hasNext && (!data.nextCursor || (data.nextCursor === cursor || completedCursors.current.has(data.nextCursor)))) {
        throw new Error("Cursor did not advance");
      }
      const existingIds = new Set(items.map((item) => item.id));
      if (data.hasNext && !data.items.some((item) => !existingIds.has(item.id))) {
        throw new Error("Pagination returned no new articles");
      }
      completedCursors.current.add(cursor ?? "");
      setFeed((current) => {
        const ids = new Set(current.items.map((item) => item.id));
        const added = data.items.filter((item) => {
          if (ids.has(item.id)) return false;
          ids.add(item.id);
          return true;
        });
        return {
          items: [...current.items, ...added],
          cursor: data.nextCursor,
          hasNext: data.hasNext,
        };
      });
      setAutoLoadPaused(false);
    } catch {
      if (controllerRef.current?.signal.aborted) return;
      setLoadMoreError(t("moreNewsCouldNotBeLoadedPleaseTryAgain"));
      setAutoLoadPaused(true);
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [category, portalId, cursor, hasNext, items, t]);

  useEffect(() => {
    autoLoadRef.current = () => {
      if (!isLoading && !autoLoadPaused) void loadMore();
    };
  }, [isLoading, autoLoadPaused, loadMore]);

  useEffect(() => {
    if (!hasNext || !sentinel.current) return;
    if (typeof IntersectionObserver === "undefined") {
      const checkPosition = () => {
        if (
          sentinel.current &&
          sentinel.current.getBoundingClientRect().top <=
            window.innerHeight + 300
        )
          autoLoadRef.current();
      };
      window.addEventListener("scroll", checkPosition, { passive: true });
      window.addEventListener("resize", checkPosition);
      checkPosition();
      return () => {
        window.removeEventListener("scroll", checkPosition);
        window.removeEventListener("resize", checkPosition);
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) autoLoadRef.current();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasNext]);

  if (items.length === 0) {
    return (
      <section className="grid place-items-center rounded-[18px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/15 dark:bg-[#111925] reading:border-[#cdbfa6] reading:bg-[#fffaf0]">
        <span
          className="grid size-10 place-items-center rounded-full bg-[#c83018]/10 font-extrabold text-[#e9482b]"
          aria-hidden="true"
        >
          !
        </span>
        <h2 className="mt-4 text-xl font-extrabold">
          {isFallback ? t("newsCouldNotBeLoaded") : t("noNewsFoundYet")}
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400 reading:text-[#756553]">
          {t("pleaseRefreshThePageInAMoment")}</p>
      </section>
    );
  }

  const featured = items.slice(0, 2);
  const rest = items.slice(2);
  const layouts = feedLayouts(rest.length);

  return (
    <section
      data-article-feed
      className="grid gap-6"
      aria-label={t("latestNews")}
    >
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

      <div className="feed-lead-pair">{featured.map(article => <ArticlePreview key={article.id} sourceSurface="FEED" featured article={article} label={categoryLabels[article.category] ?? article.category} />)}</div>

      {rest.length > 0 && (
        <div className="mt-0">
          <div className="mb-5 flex items-baseline justify-between gap-5 border-b border-slate-200 pb-3 dark:border-white/10 reading:border-[#d8ccb5]">
            <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
              {t("latestStories")}</h2>
            <label className="muted flex items-center gap-2 text-xs">
              <span className="sr-only">{t("chooseAPublisher")}</span>
              <select
                aria-label={t("chooseAPublisher")}
                value={portalId}
                disabled={filterPending}
                className="publisher-select"
                onChange={(event) =>
                  startTransition(() =>
                    router.push(feedHref(category, event.target.value)),
                  )
                }
              >
                <option value="">{t("allPublishers")}</option>
                {portalId &&
                  !portals.some((p) => String(p.id) === portalId) && (
                    <option value={portalId}>{t("selectedPublisher")}</option>
                  )}
                {portals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {localizedName(p, locale)}
                  </option>
                ))}
              </select>
              {filterPending && <span role="status">{t("loading")}</span>}
            </label>
          </div>
          <div className="mixed-story-list">
            {rest.map((article, index) => (
              <ArticlePreview sourceSurface="FEED"
                key={article.id}
                featured={layouts[index] === "featured"}
                compact={layouts[index] === "grid"}
                article={article}
                label={categoryLabels[article.category] ?? article.category}
              />
            ))}
          </div>
        </div>
      )}


      {hasNext && (
        <div
          ref={sentinel}
          data-feed-sentinel
          className="flex min-h-20 flex-col items-center justify-center gap-2 pt-3 text-sm font-semibold text-slate-600 dark:text-slate-400 reading:text-[#756553]"
          aria-live="polite"
        >
          {isLoading && (
            <>
              <span
                className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#e9482b] dark:border-white/15 dark:border-t-[#ff8069]"
                aria-hidden="true"
              />
              <span>{t("loadingMoreNews")}</span>
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
                {t("tryAgain")}</button>
            </>
          )}
          {!isLoading && !autoLoadPaused && (
            <span>{t("scrollForMoreNews")}</span>
          )}
        </div>
      )}
      {isLoading && <ArticleCardsSkeleton />}
    </section>
  );
}

