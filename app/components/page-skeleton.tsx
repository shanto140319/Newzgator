import { Header } from "./header";
import { Footer } from "./footer";
import { FeedSkeleton, SkeletonBlock as Block } from "./feed-skeleton";
import { RelatedArticlesSkeleton } from "./related-articles";
import { DiscoverySkeleton } from "./discovery-sidebar";
export function PageSkeleton({ details = false }: { details?: boolean }) {
  return <div id="top" className="flex min-h-screen flex-col" data-page-skeleton={details ? "details" : "home"}>
    <Header loading />
    <main id="main-content" className="site-container flex-1 py-8 pb-16 max-sm:py-6">
      {details ? <div className="detail-grid" role="status" aria-label="সংবাদের বিস্তারিত লোড হচ্ছে"><span className="sr-only">সংবাদের বিস্তারিত লোড হচ্ছে…</span><div aria-hidden="true" className="min-w-0 animate-pulse"><Block className="h-4 w-32" /><Block className="mt-7 h-4 w-24" /><div className="mt-4 space-y-4"><Block className="h-12 w-full" /><Block className="h-12 w-4/5" /></div><div className="mt-6 flex items-center gap-3"><Block className="h-10 w-12" /><Block className="h-6 w-48" /></div><Block className="mt-7 aspect-[16/8.5] rounded-xl" /><div className="mt-7 space-y-4">{[0, 1, 2, 3].map(i => <Block key={i} className="h-4 w-full" />)}</div></div><div className="related-panel lg:mt-13"><div aria-hidden="true" className="p-5"><Block className="h-6 w-36" /></div><RelatedArticlesSkeleton /></div></div> : <><div aria-hidden="true" className="mb-6 space-y-3"><Block className="h-10 w-60" /><Block className="h-4 w-72" /></div><div className="home-grid"><div className="home-feed"><FeedSkeleton /></div><div className="discovery-sidebar"><div className="discovery-panel"><Block className="h-6 w-28" /><DiscoverySkeleton /></div></div></div></>}
    </main><Footer />
  </div>;
}
