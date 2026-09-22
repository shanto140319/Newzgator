import { StickySidebar } from "./sticky-sidebar";
import { Suspense } from "react";
import Link from "next/link";
import { getTrending } from "../lib/api";
import { feedHref } from "../lib/feed-route";
import type { Portal } from "../lib/articles";
import { NewsImage } from "./news-image";
import { SkeletonBlock } from "./feed-skeleton";

export function DiscoverySkeleton() {
  return <div role="status" aria-label="আলোচিত সংবাদ লোড হচ্ছে" className="discovery-loading"><span className="sr-only">আলোচিত সংবাদ লোড হচ্ছে…</span>{[0, 1, 2].map(i => <div key={i} aria-hidden="true" className="flex animate-pulse gap-3 py-4"><SkeletonBlock className="size-16 shrink-0" /><div className="flex-1 space-y-3"><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-3 w-2/3" /></div></div>)}</div>;
}
async function TrendingStories() {
  const stories = await getTrending().catch(() => null);
  if (!stories?.length) return <p className="muted py-5 text-sm">{stories ? "এই মুহূর্তে আলোচিত সংবাদ নেই।" : "আলোচিত সংবাদ এখন আনা যাচ্ছে না।"}</p>;
  return <ol className="trending-list">{stories.map((story, i) => <li key={story.clusterId}>
    <Link href={"/article/" + story.leadArticle.id} prefetch={false} className="trending-link">
      <span className="trending-number" aria-hidden="true">{(i + 1).toLocaleString("bn-BD", { minimumIntegerDigits: 2 })}</span>
      <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">{story.leadArticle.mainImage ? <NewsImage src={story.leadArticle.mainImage} alt="" fill sizes="64px" className="object-cover" /> : <span className="muted grid size-full place-items-center text-2xl" aria-hidden="true">ন</span>}</span>
      <span className="min-w-0"><h3 className="line-clamp-3 text-sm font-bold leading-6">{story.topicTitle}</h3><span className="muted mt-1 block text-xs">{story.totalArticles.toLocaleString("bn-BD")}টি প্রতিবেদন <span aria-hidden="true">↗</span></span></span>
    </Link>
  </li>)}</ol>;
}
function PublisherLinks({ portals, category, portalId }: { portals: Portal[]; category: string; portalId: string }) {
  return <ul className="publisher-list">{portals.map(portal => <li key={portal.id}><Link prefetch={false} href={feedHref(category, String(portal.id))} aria-current={portalId === String(portal.id) ? "page" : undefined} className="publisher-link"><span className="relative grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded bg-white text-sm font-bold text-slate-700">{portal.logo ? <NewsImage src={portal.logo} alt="" fill sizes="48px" className="object-contain p-1" /> : (portal.nameBn || portal.name).slice(0, 1)}</span><span className="min-w-0 flex-1">{portal.nameBn || portal.name}</span><span aria-hidden="true">›</span></Link></li>)}</ul>;
}
export function DiscoverySidebar({ portals, category, portalId }: { portals: Portal[]; category: string; portalId: string }) {
  return <StickySidebar>
    <section className="discovery-panel" aria-labelledby="trending-heading"><h2 id="trending-heading" className="text-xl font-extrabold">আলোচনায়</h2><Suspense fallback={<DiscoverySkeleton />}><TrendingStories /></Suspense></section>
    <section className="discovery-panel publisher-panel" aria-labelledby="publishers-heading">
      <h2 id="publishers-heading" className="text-xl font-extrabold">সংবাদমাধ্যম</h2>
      {portals.length ? <><PublisherLinks portals={portals.slice(0, 4)} category={category} portalId={portalId} />{portals.length > 4 && <details className="more-publishers"><summary>সব সংবাদমাধ্যম</summary><PublisherLinks portals={portals.slice(4)} category={category} portalId={portalId} /></details>}</> : <p className="muted py-5 text-sm">সংবাদমাধ্যমের তালিকা এখন পাওয়া যাচ্ছে না।</p>}
    </section>
    <a className="sidebar-top" href="#top">উপরে যান ↑</a>
  </StickySidebar>;
}
