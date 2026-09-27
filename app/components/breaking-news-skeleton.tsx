import { SkeletonBlock } from "./feed-skeleton";
import styles from "./cluster-news.module.css";

export function RelatedReportsSkeleton() {
  return <div className={styles.related} role="status" aria-label="সম্পর্কিত প্রতিবেদন লোড হচ্ছে">
    {[0, 1, 2].map(i => <div key={i} aria-hidden="true" className="space-y-2 motion-safe:animate-pulse"><SkeletonBlock className="h-5 w-2/3" /><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-6 w-3/4" /></div>)}
  </div>;
}
export function BreakingNewsSkeleton() {
  return <section className={styles.breaking} aria-label="ব্রেকিং সংবাদ লোড হচ্ছে" aria-busy="true">
    <div className={styles.heading}><h2>Breaking</h2><span role="status">লোড হচ্ছে…</span></div>
    <div className={styles.breakingCard}>
      {[0, 1].map(i => <div className={styles.featured} key={i}>
        <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse"><SkeletonBlock className="aspect-video w-full" /><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-6 w-3/4" /></div>
        <RelatedReportsSkeleton />
      </div>)}
      {[0, 1, 2].map(i => <div className={styles.compact} key={i} aria-hidden="true">
        <div className="space-y-3 motion-safe:animate-pulse"><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-6 w-3/4" /><SkeletonBlock className="h-5 w-2/3" /><SkeletonBlock className="h-5 w-1/3" /></div><SkeletonBlock className="aspect-video w-full" />
      </div>)}
    </div>
  </section>;
}
