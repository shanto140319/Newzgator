"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Article, ArticleListResponse } from "../lib/articles";

type ArticleFeedProps = {
  apiBaseUrl: string;
  initialItems: Article[];
  initialCursor: string | null;
  initialHasNext: boolean;
  isFallback?: boolean;
};

const categoryLabels: Record<string, string> = {
  bangladesh: "বাংলাদেশ",
  international: "বিশ্ব",
  world: "বিশ্ব",
  politics: "রাজনীতি",
  economy: "অর্থনীতি",
  business: "অর্থনীতি",
  sports: "খেলা",
  technology: "প্রযুক্তি",
  tech: "প্রযুক্তি",
  entertainment: "বিনোদন",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "এইমাত্র";

  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

function Source({ article }: { article: Article }) {
  const sourceName = article.portal.nameBn?.trim() || article.portal.name;

  return (
    <div className="source-row">
      <span className="source-logo" aria-hidden="true">
        {sourceName.slice(0, 1)}
      </span>
      <span>{sourceName}</span>
      <span className="meta-separator">•</span>
      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="image-placeholder" aria-label="ছবি পাওয়া যায়নি">
      <span aria-hidden="true">ন</span>
    </div>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <article className="featured-card">
      <div className="featured-image">
        {article.mainImage ? (
          <Image
            src={article.mainImage}
            alt=""
            fill
            priority
            sizes="(max-width: 760px) 100vw, 58vw"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <span className="category-chip">
          {categoryLabels[article.category] ?? article.category}
        </span>
      </div>
      <div className="featured-copy">
        <Source article={article} />
        <h2>{article.headline}</h2>
        <p>{article.summary}</p>
        <a
          className="read-source"
          href={article.portal.url}
          target="_blank"
          rel="noreferrer"
        >
          উৎস দেখুন <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <article className="article-card" style={{ "--index": index } as React.CSSProperties}>
      <div className="card-image">
        {article.mainImage ? (
          <Image
            src={article.mainImage}
            alt=""
            fill
            sizes="(max-width: 640px) 38vw, (max-width: 1000px) 50vw, 33vw"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="card-copy">
        <span className="card-category">
          {categoryLabels[article.category] ?? article.category}
        </span>
        <h3>{article.headline}</h3>
        <p>{article.summary}</p>
        <Source article={article} />
      </div>
    </article>
  );
}

export function ArticleFeed({
  apiBaseUrl,
  initialItems,
  initialCursor,
  initialHasNext,
  isFallback = false,
}: ArticleFeedProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(
    isFallback
      ? "লাইভ সংযোগ পাওয়া যাচ্ছে না—সর্বশেষ সংরক্ষিত খবর দেখানো হচ্ছে।"
      : "",
  );

  const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/articles`;

  useEffect(() => {
    let cancelled = false;

    async function refreshFeed() {
      try {
        const response = await fetch(`${endpoint}?size=12`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (!response.ok) throw new Error("Unable to load articles");

        const result = (await response.json()) as ArticleListResponse;
        if (!cancelled && result.success && Array.isArray(result.data?.items)) {
          setItems(result.data.items);
          setCursor(result.data.nextCursor);
          setHasNext(result.data.hasNext);
          setNotice("");
        }
      } catch {
        if (!cancelled) {
          setNotice("লাইভ সংযোগ পাওয়া যাচ্ছে না—সর্বশেষ সংরক্ষিত খবর দেখানো হচ্ছে।");
        }
      }
    }

    void refreshFeed();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  async function loadMore() {
    setIsLoading(true);
    setNotice("");

    try {
      const params = new URLSearchParams({ size: "12" });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!response.ok) throw new Error("Unable to load articles");

      const result = (await response.json()) as ArticleListResponse;
      setItems((current) => {
        const existing = new Set(current.map((item) => item.id));
        return [...current, ...result.data.items.filter((item) => !existing.has(item.id))];
      });
      setCursor(result.data.nextCursor);
      setHasNext(result.data.hasNext);
    } catch {
      setNotice("নতুন খবর আনা যায়নি। একটু পর আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="empty-state">
        <span aria-hidden="true">!</span>
        <h2>এখনও কোনো খবর পাওয়া যায়নি</h2>
        <p>কিছুক্ষণ পর আবার পেজটি রিফ্রেশ করুন।</p>
      </section>
    );
  }

  const [featured, ...rest] = items;

  return (
    <section className="feed-wrap" aria-label="সর্বশেষ সংবাদ">
      {notice && (
        <div className="feed-notice" role="status">
          <span aria-hidden="true">i</span>
          {notice}
        </div>
      )}

      <FeaturedArticle article={featured} />

      {rest.length > 0 && (
        <div className="latest-block">
          <div className="section-heading">
            <h2>আরও খবর</h2>
            <span>{items.length.toLocaleString("bn-BD")}টি সংবাদ</span>
          </div>
          <div className="article-grid">
            {rest.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </div>
      )}

      {hasNext && (
        <div className="load-more-wrap">
          <button className="load-more" onClick={loadMore} disabled={isLoading}>
            {isLoading ? "খবর আসছে…" : "আরও খবর দেখুন"}
          </button>
        </div>
      )}
    </section>
  );
}
