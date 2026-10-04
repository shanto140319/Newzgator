import { BreakingNewsSkeleton } from "./breaking-news-skeleton";
import { useTranslations } from "next-intl";
import { Header } from "./header";
import { Footer } from "./footer";
import { FeedSkeleton, SkeletonBlock as Block } from "./feed-skeleton";
import { RelatedArticlesSkeleton } from "./related-articles";
export function PageSkeleton({ details = false }: { details?: boolean }) {
  const t = useTranslations();

  return <div id="top" className="flex min-h-screen flex-col" data-page-skeleton={details ? "details" : "home"}>
    <Header />
    <main id="main-content" className="site-container flex-1 py-8 pb-16 max-sm:py-6">
      {details ? <div className="detail-grid" role="status" aria-label={t("loadingArticleDetails")}><span className="sr-only">{t("loadingArticleDetailsAlt")}</span><div aria-hidden="true" className="min-w-0 animate-pulse"><Block className="h-4 w-32" /><Block className="mt-7 h-4 w-24" /><div className="mt-4 space-y-4"><Block className="h-12 w-full" /><Block className="h-12 w-4/5" /></div><div className="mt-6 flex items-center gap-3"><Block className="h-10 w-12" /><Block className="h-6 w-48" /></div><Block className="mt-7 aspect-[16/8.5] rounded-xl" /><div className="mt-7 space-y-4">{[0, 1, 2, 3].map(i => <Block key={i} className="h-4 w-full" />)}</div></div><div className="related-panel lg:mt-13"><div aria-hidden="true" className="p-5"><Block className="h-6 w-36" /></div><RelatedArticlesSkeleton /></div></div> : <><BreakingNewsSkeleton rail /><div className="home-full-width"><div className="home-feed"><BreakingNewsSkeleton /><FeedSkeleton /></div></div></>}
    </main><Footer />
  </div>;
}
