import { useTranslations } from "next-intl";
import { SkeletonBlock } from "./feed-skeleton";
import styles from "./cluster-news.module.css";

export function RelatedReportsSkeleton() {
  const t = useTranslations();

  return <div className={styles.related} role="status" aria-label={t("loadingRelatedReports")}>
    {[0, 1, 2].map(i => <div key={i} aria-hidden="true" className="space-y-2 motion-safe:animate-pulse"><SkeletonBlock className="h-5 w-2/3" /><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-6 w-3/4" /></div>)}
  </div>;
}
export function BreakingNewsSkeleton({ rail = false }: { rail?: boolean }) {
  const t = useTranslations();

  if (rail) return <section className={styles.breakingStrip} aria-busy="true" aria-label={t("loadingBreakingNews")}><div className={styles.heading}><h2>{t("breaking")}</h2></div><div className={styles.breakingRail}>{[0,1,2,3,4].map(i => <div className={styles.railCard} key={i}><SkeletonBlock className="h-28 w-full motion-safe:animate-pulse" /></div>)}</div></section>;
  return <section className={styles.breaking} aria-label={t("loadingTrendingStories")} aria-busy="true">
    <div className={styles.heading}><h2>{t("trending")}</h2><span role="status">{t("loadingAlt")}</span></div>
    <div className={styles.breakingCard}>
      {[0, 1].map(i => <div className={styles.featured} key={i}>
        <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse"><SkeletonBlock className="aspect-video w-full" /><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-6 w-3/4" /></div>
        <RelatedReportsSkeleton />
      </div>)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div className={styles.compact} key={i} aria-hidden="true">
        <div className="space-y-3 motion-safe:animate-pulse"><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-6 w-3/4" /><SkeletonBlock className="h-5 w-2/3" /><SkeletonBlock className="h-5 w-1/3" /></div><SkeletonBlock className="aspect-video w-full" />
      </div>)}
    </div>
  </section>;
}
