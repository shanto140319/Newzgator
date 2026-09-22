import type { Article, ArticleDetails } from "./articles";
import { imageUrl, safeUrl } from "./urls";

export function normalizeArticle<T extends Article | ArticleDetails>(article: T): T {
  return {
    ...article,
    mainImage: imageUrl(article.mainImage) ?? null,
    publishedAt: /(?:Z|[+-]\d{2}:\d{2})$/.test(article.publishedAt)
      ? article.publishedAt
      : article.publishedAt + "+06:00",
    portal: {
      ...article.portal,
      url: safeUrl(article.portal.url) ?? "",
      logo: imageUrl(article.portal.logo) ?? null,
    },
    ...("url" in article ? { url: safeUrl(article.url) ?? "" } : {}),
  };
}
