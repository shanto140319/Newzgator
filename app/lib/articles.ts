export type Portal = {
  id: number;
  name: string;
  nameBn: string | null;
  nameEn: string | null;
  url: string;
  logo: string | null;
};

export type ArticleReactions = {
  articleId: number;
  likeCount: number;
  dislikeCount: number;
  importantCount: number;
  inaccurateCount: number;
  currentUserReaction: string | null;
};

export type Article = {
  id: number;
  headline: string;
  mainImage: string | null;
  publishedAt: string;
  category: string;
  summary: string;
  clusterId: number;
  isBookmarked: boolean;
  portal: Portal;
  articleReactions: ArticleReactions;
};

export type ArticleListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Article[];
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  };
  timestamp: string;
};

export type ArticleDetails = Omit<Article, "summary" | "clusterId"> & {
  url: string;
  details: string;
};

export type ArticleDetailsResponse = {
  success: boolean;
  message: string;
  data: ArticleDetails;
  timestamp: string;
};

export type Category = { name: string; nameBn: string | null; nameEn: string | null };

export type RelatedArticle = Pick<Article, "id" | "headline" | "mainImage" | "publishedAt" | "category" | "summary"> & { portalName: string; portalLogo: string | null };

export type TrendingCluster = {
  clusterId: number;
  topicTitle: string;
  totalArticles: number;
  leadArticle: Pick<Article, "id" | "mainImage">;
};
