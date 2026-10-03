import { useTranslations } from "next-intl";
import { Header } from "../components/header";
import { ArticleCardsSkeleton } from "../components/feed-skeleton";
export default function Loading() {
  const t = useTranslations();
 return <><Header /><main id="main-content" className="site-container py-8"><h1 className="mb-8 text-3xl font-bold">{t("savedArticles")}</h1><ArticleCardsSkeleton /></main></>; }
