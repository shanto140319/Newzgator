import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Article, ArticleDetails, ArticleListResponse, Category, RelatedArticle, Portal, TrendingCluster } from "./articles";
import { safeUrl, imageUrl } from "./urls";

const base = (process.env.ARTICLE_API_BASE_URL ?? process.env.NEXT_PUBLIC_ARTICLE_API_BASE_URL ?? "https://newzgator-api.onrender.com").replace(/\/$/, "");
const requestTimeoutMs = 45_000;
export class ApiError extends Error {
  constructor(public status: number) { super("Article service unavailable"); }
}
async function request(path: string, timeoutMs = requestTimeoutMs) {
  const id = (await cookies()).get("news-reader")?.value;
  const response = await fetch(base + path, {
    cache: "no-store", redirect: "error",
    headers: { Accept: "application/json", ...(id ? { "X-User-Id": id } : {}) },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new ApiError(response.status);
  const result = await response.json();
  if (!result.success || !result.data) throw new ApiError(502);
  return result.data;
}
function normalize<T extends Article | ArticleDetails>(article: T): T {
  if (!Number.isSafeInteger(article.id) || article.id < 1 || typeof article.headline !== "string" || !article.portal || typeof article.portal.name !== "string" || typeof article.publishedAt !== "string" || typeof article.category !== "string") throw new ApiError(502);
  if ("summary" in article && typeof article.summary !== "string") throw new ApiError(502);
  if ("details" in article && typeof article.details !== "string") throw new ApiError(502);
  return { ...article, mainImage: imageUrl(article.mainImage) ?? null,
    publishedAt: /(?:Z|[+-]\d{2}:\d{2})$/.test(article.publishedAt) ? article.publishedAt : article.publishedAt + "+06:00",
    portal: { ...article.portal, url: safeUrl(article.portal.url) ?? "", logo: imageUrl(article.portal.logo) ?? null },
    ...("url" in article ? { url: safeUrl(article.url) ?? "" } : {}),
  };
}
export const getCategories = cache(async (): Promise<Category[]> => {
  const data: Category[] = await request("/api/v1/categories");
  if (!Array.isArray(data) || data.some(c => !c || typeof c.name !== "string" || !/^[a-z0-9-]{1,80}$/.test(c.name) || (c.nameBn !== null && typeof c.nameBn !== "string") || (c.nameEn !== null && typeof c.nameEn !== "string"))) throw new ApiError(502);
  return [...new Map(data.map(c => [c.name, c])).values()];
});
export async function getArticles(category = "", cursor = "", portalId = ""): Promise<ArticleListResponse["data"]> {
  const params = new URLSearchParams({ limit: "20" });
  if (category) params.set("category", category);
  if (cursor) params.set("cursor", cursor);
  if (portalId) params.set("portalId", portalId);
  const data = await request("/api/v1/articles?" + params);
  if (!Array.isArray(data.items) || typeof data.hasNext !== "boolean" || (data.nextCursor !== null && typeof data.nextCursor !== "string")) throw new ApiError(502);
  return { ...data, items: data.items.map((item: Article) => normalize(item)), hasNext: data.hasNext && !!data.nextCursor };
}
export const getArticle = cache(async (id: string): Promise<ArticleDetails> => normalize(await request("/api/v1/articles/" + id)));

export async function getRelatedArticles(id: number): Promise<RelatedArticle[]> {
  const data: unknown = await request("/api/v1/articles/" + id + "/related?limit=6", 15_000);
  if (!Array.isArray(data)) throw new ApiError(502);
  const seen = new Set<number>([id]);
  return data.filter((item): item is RelatedArticle => {
    if (!item || !Number.isSafeInteger(item.id) || item.id < 1 || seen.has(item.id) || typeof item.headline !== "string" || typeof item.summary !== "string" || typeof item.category !== "string" || typeof item.portalName !== "string" || typeof item.publishedAt !== "string") return false;
    seen.add(item.id);
    return true;
  }).slice(0, 6).map(item => ({ ...item, mainImage: imageUrl(item.mainImage) ?? null, portalLogo: imageUrl(item.portalLogo) ?? null }));
}

export const getPortals = cache(async (): Promise<Portal[]> => {
  const data: unknown = await request("/api/v1/portals", 10_000);
  if (!Array.isArray(data)) throw new ApiError(502);
  const seen = new Set<number>();
  return data.filter((item): item is Portal => {
    if (!item || !Number.isSafeInteger(item.id) || item.id < 1 || typeof item.name !== "string" || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).map(item => ({ id: item.id, name: item.name, nameBn: typeof item.nameBn === "string" ? item.nameBn : null, nameEn: typeof item.nameEn === "string" ? item.nameEn : null, logo: imageUrl(item.logo) ?? null, url: safeUrl(item.url) ?? "" }));
});
export async function getTrending(): Promise<TrendingCluster[]> {
  const data: unknown = await request("/api/v1/trending/trending?hours=24&limit=3&minArticles=2", 10_000);
  if (!Array.isArray(data)) throw new ApiError(502);
  const seen = new Set<number>();
  return data.filter((item): item is TrendingCluster => {
    if (!item || !Number.isSafeInteger(item.clusterId) || seen.has(item.clusterId) || typeof item.topicTitle !== "string" || !Number.isSafeInteger(item.totalArticles) || item.totalArticles < 1 || !Number.isSafeInteger(item.leadArticle?.id) || item.leadArticle.id < 1) return false;
    seen.add(item.clusterId);
    return true;
  }).slice(0, 3).map(item => ({ clusterId: item.clusterId, topicTitle: item.topicTitle, totalArticles: item.totalArticles, leadArticle: { id: item.leadArticle.id, mainImage: imageUrl(item.leadArticle.mainImage) ?? null } }));
}

export async function utilityRequest(path: string, method: string, body?: unknown) {
  const id = (await cookies()).get("news-reader")?.value;
  if (!id) throw new ApiError(401);
  const response = await fetch(base + path, { method, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000), headers: { Accept: "application/json", "Content-Type": "application/json", "X-User-Id": id }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  if (!response.ok) throw new ApiError(response.status);
  if (response.status === 204) return null;
  const result = await response.json();
  if (result.success === false) throw new ApiError(502);
  return result;
}
export async function getBookmarks(cursor = ""): Promise<ArticleListResponse["data"]> {
  const data = await request("/api/v1/bookmarks?" + new URLSearchParams({ limit: "20", ...(cursor ? { cursor } : {}) }));
  if (!Array.isArray(data.items) || typeof data.hasNext !== "boolean" || (data.nextCursor !== null && typeof data.nextCursor !== "string")) throw new ApiError(502);
  return { items: data.items.map((entry: { article: Article }) => normalize({ ...entry.article, summary: entry.article.summary ?? "", isBookmarked: true })), nextCursor: data.nextCursor, hasNext: data.hasNext && !!data.nextCursor, size: data.items.length };
}
