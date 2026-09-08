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

export const sampleArticle: Article = {
  id: 1640,
  headline: "নওগাঁ শহরজুড়ে এআই প্রযুক্তির চোখ, অপরাধী শনাক্ত হবে মুহূর্তেই",
  mainImage:
    "https://www.kalbela.com/cache-images/news_photos/2026/09/05/resize-600x315x1x0-image_325246_1788628314.jpg",
  publishedAt: "2026-09-05T23:11:54",
  category: "bangladesh",
  summary:
    "নওগাঁ শহরকে অপরাধমুক্ত ও নিরাপদ রাখতে জেলা পুলিশের উদ্যোগে শহরের গুরুত্বপূর্ণ পয়েন্টে কৃত্রিম বুদ্ধিমত্তাসম্পন্ন ক্যামেরা স্থাপন করা হয়েছে। ডিজিটাল সার্ভিল্যান্স ব্যবস্থার মাধ্যমে অপরাধী শনাক্তকরণ, যানবাহনের তথ্য সংগ্রহ ও ট্রাফিক নিয়ন্ত্রণে সহায়তা মিলবে।",
  clusterId: 1236,
  isBookmarked: false,
  portal: {
    id: 2,
    name: "Kalbela",
    nameBn: "কালবেলা",
    nameEn: "Kal bela",
    url: "https://www.kalbela.com",
    logo: "https://www.kalbela.com/templates/web-view/images/logo.png",
  },
  articleReactions: {
    articleId: 1640,
    likeCount: 0,
    dislikeCount: 0,
    importantCount: 0,
    inaccurateCount: 0,
    currentUserReaction: null,
  },
};
