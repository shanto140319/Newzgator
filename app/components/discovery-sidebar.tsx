import { localizedName } from "../lib/localized-name";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations, getLocale } from "next-intl/server";
import { TrackedArticleLink } from "./tracked-article-link";
import styles from "./cluster-news.module.css";
import { StickySidebar } from "./sticky-sidebar";
import { Suspense } from "react";
import Link from "next/link";
import { getTrending } from "../lib/api";
import { feedHref } from "../lib/feed-route";
import type { Portal, TrendingCluster } from "../lib/articles";
import { NewsImage } from "./news-image";
import { SkeletonBlock } from "./feed-skeleton";

export function DiscoverySkeleton() {
  const t = useTranslations();

  return <div role="status" aria-label={t("loadingTrendingStories")} className="discovery-loading"><span className="sr-only">{t("loadingTrendingStoriesAlt")}</span>{[0, 1, 2].map(i => <div key={i} aria-hidden="true" className="flex animate-pulse gap-3 py-4"><SkeletonBlock className="size-16 shrink-0" /><div className="flex-1 space-y-3"><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-3 w-2/3" /></div></div>)}</div>;
}
function LeadPublisher({ story }: { story: TrendingCluster }) {
  const url = story.leadArticle.url;
  if (!url) return null;
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const portal = story.sourcePortals.find(source => source.portalUrl && new URL(source.portalUrl).hostname.replace(/^www\./, "") === hostname);
  if (!portal?.portalLogo) return null;
  return <span className={styles.imagePublisher}><NewsImage src={portal.portalLogo} alt={portal.portalName} width={64} height={22} hideOnError /></span>;
}
async function TrendingStories() {
  const t = await getTranslations();
  const locale = await getLocale();

  const stories = await getTrending({ hours: 12, limit: 10, minArticles: 5 }).catch(() => null);
  if (!stories?.length) return <p className="muted py-5 text-sm">{stories ? t("noTrendingStoriesRightNow") : t("trendingStoriesCouldNotBeLoaded")}</p>;
  return <ol className={styles.trendingList}>{stories.map((story, i) => <li className={styles.trend} key={story.clusterId}>
    <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="TRENDING" href={"/article/" + story.leadArticle.id} prefetch={false}>
      <div className={styles.trendPhoto}>{story.leadArticle.mainImage ? <NewsImage src={story.leadArticle.mainImage} alt="" fill sizes="(max-width: 1023px) 90vw, 312px" className="object-cover" /> : <span aria-hidden="true">{t("n")}</span>}<span className={styles.rank}>{(i + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })} {t("trendingNow")}</span><LeadPublisher story={story} /></div>
      <h3>{story.topicTitle}</h3>
    </TrackedArticleLink>
    <p className={styles.portalLine} title={story.sourcePortals.slice(0, 5).map(portal => portal.portalName).join(" · ")}>{story.sourcePortals.slice(0, 5).map((portal, index) => <span key={portal.portalId}>{index > 0 && " · "}{portal.portalUrl ? <a href={portal.portalUrl} target="_blank" rel="noopener noreferrer">{portal.portalName}</a> : portal.portalName}</span>)}</p>
    <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="TRENDING" className={styles.coverage} href={"/article/" + story.leadArticle.id} prefetch={false}>{t("moreReports")}</TrackedArticleLink>
  </li>)}</ol>;
}
function PublisherLinks({ portals, category, portalId }: { portals: Portal[]; category: string; portalId: string }) {
  const locale = useLocale();

  return <ul className="publisher-list">{portals.map(portal => <li key={portal.id}><Link prefetch={false} href={feedHref(category, String(portal.id))} aria-current={portalId === String(portal.id) ? "page" : undefined} className="publisher-link"><span className="relative grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded bg-white text-sm font-bold text-slate-700">{portal.logo ? <NewsImage src={portal.logo} alt="" hideOnError fill sizes="48px" className="object-contain p-1" /> : (localizedName(portal, locale)).slice(0, 1)}</span><span className="min-w-0 flex-1">{localizedName(portal, locale)}</span><span aria-hidden="true">›</span></Link></li>)}</ul>;
}
export function DiscoverySidebar({ portals, category, portalId }: { portals: Portal[]; category: string; portalId: string }) {
  const t = useTranslations();

  return <StickySidebar>
    <section className={styles.trending} aria-labelledby="trending-heading"><h2 id="trending-heading" className="text-xl font-extrabold">{t("trending")}</h2><Suspense fallback={<DiscoverySkeleton />}><TrendingStories /></Suspense></section>
    <section className="discovery-panel publisher-panel" aria-labelledby="publishers-heading">
      <h2 id="publishers-heading" className="text-xl font-extrabold">{t("publishers")}</h2>
      {portals.length ? <PublisherLinks portals={portals} category={category} portalId={portalId} /> : <p className="muted py-5 text-sm">{t("thePublisherListIsCurrentlyUnavailable")}</p>}
    </section>
    <a className="sidebar-top" href="#top">{t("backToTop")}</a>
  </StickySidebar>;
}
