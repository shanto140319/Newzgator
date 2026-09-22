"use client";

import type { Article, ArticleListResponse } from "./articles";
import { normalizeArticle } from "./normalize-article";
import { getUserId } from "./user-id";

const base = (
  process.env.NEXT_PUBLIC_ARTICLE_API_BASE_URL ??
  "https://newzgator-api.onrender.com"
).replace(/\/$/, "");

type ApiResult<T> = { success?: boolean; data?: T; message?: string };

async function clientRequest<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 50_000,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-User-Id", getUserId());
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(base + path, {
    ...init,
    headers,
    signal: AbortSignal.any([
      AbortSignal.timeout(timeoutMs),
      ...(init.signal ? [init.signal] : []),
    ]),
  });
  if (response.status === 204) return null as T;
  const result = (await response.json()) as ApiResult<T> & T;
  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Request failed");
  }
  return ("data" in result && result.data !== undefined ? result.data : result) as T;
}

function asArticlePage(data: ArticleListResponse["data"]): ArticleListResponse["data"] {
  if (
    !Array.isArray(data.items) ||
    typeof data.hasNext !== "boolean" ||
    (data.nextCursor !== null && typeof data.nextCursor !== "string")
  ) {
    throw new Error("Invalid article response");
  }
  return {
    ...data,
    items: data.items.map((item) => normalizeArticle(item as Article)),
    hasNext: data.hasNext && !!data.nextCursor,
  };
}

export async function fetchArticles(
  params: { category?: string; portalId?: string; cursor?: string },
  signal?: AbortSignal,
): Promise<ArticleListResponse["data"]> {
  const query = new URLSearchParams({ limit: "20" });
  if (params.category) query.set("category", params.category);
  if (params.portalId) query.set("portalId", params.portalId);
  if (params.cursor) query.set("cursor", params.cursor);
  return asArticlePage(await clientRequest("/api/v1/articles?" + query, { signal }));
}

export async function fetchBookmarks(cursor = "", signal?: AbortSignal): Promise<ArticleListResponse["data"]> {
  const query = new URLSearchParams({ limit: "20", ...(cursor ? { cursor } : {}) });
  type BookmarkPage = {
    items: Array<{ article: Article }>;
    nextCursor: string | null;
    hasNext: boolean;
    size?: number;
  };
  const data = await clientRequest<BookmarkPage>("/api/v1/bookmarks?" + query, { signal });
  if (!Array.isArray(data.items) || typeof data.hasNext !== "boolean") {
    throw new Error("Invalid bookmark response");
  }
  return {
    items: data.items.map((entry) =>
      normalizeArticle({
        ...entry.article,
        summary: entry.article.summary ?? "",
        isBookmarked: true,
      }),
    ),
    nextCursor: data.nextCursor,
    hasNext: data.hasNext && !!data.nextCursor,
    size: data.items.length,
  };
}

export async function saveBookmark(articleId: number) {
  await clientRequest("/api/v1/bookmarks", {
    method: "POST",
    body: JSON.stringify({ articleId }),
  }, 20_000);
}

export async function removeBookmark(articleId: number) {
  await clientRequest("/api/v1/bookmarks/" + articleId, { method: "DELETE" }, 20_000);
}

export async function postReaction(articleId: number, reaction: string) {
  return clientRequest<{ articleId: number; activeReaction: string | null }>(
    "/api/v1/articles/" + articleId + "/reactions",
    { method: "POST", body: JSON.stringify({ reaction }) },
    20_000,
  );
}
