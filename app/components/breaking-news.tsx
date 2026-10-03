import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { RelatedReportsSkeleton } from "./breaking-news-skeleton";
import { TrackedArticleLink } from "./tracked-article-link";
import { Suspense } from "react";
import type { TrendingCluster } from "../lib/articles";
import { getRelatedArticles, getTrending } from "../lib/api";
import { NewsImage } from "./news-image";
import { ClusterPortals } from "./cluster-portals";
import styles from "./cluster-news.module.css";

function PublishedTime({ value }: { value?: string }) {
  const locale = useLocale();

  if (!value) return null;
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value + "+06:00";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return <time className={styles.published} dateTime={timestamp}>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(date)}</time>;
}

function LeadMetadata({ story }: { story: TrendingCluster }) {
  const url = story.leadArticle.url;
  const host = url ? new URL(url).hostname.replace(/^www\./, "") : "";
  const portal = story.sourcePortals.find(source => source.portalUrl && new URL(source.portalUrl).hostname.replace(/^www\./, "") === host);
  return <div className={styles.photoMetadata}>
    {(portal || host) && <span className={styles.photoPublisher} title={portal?.portalName || host}>{portal?.portalLogo ? <NewsImage src={portal.portalLogo} alt={portal.portalName} width={64} height={22} hideOnError /> : portal?.portalName || host}</span>}
    <PublishedTime value={story.leadArticle.publishedAt} />
  </div>;
}

async function RelatedReports({ id }: { id: number }) {
  const t = await getTranslations();

  const reports = await getRelatedArticles(id).catch(() => []);
  return <div className={styles.related}>{reports.length ? reports.slice(0, 3).map(report => <div key={report.id}>
    <div className={styles.relatedMetadata}><span className={styles.relatedPublisher} title={report.portalName}>{report.portalLogo ? <NewsImage src={report.portalLogo} alt={report.portalName} width={64} height={22} hideOnError /> : report.portalName}</span><PublishedTime value={report.publishedAt} /></div>
    <TrackedArticleLink articleId={report.id} sourceSurface="RELATED" href={`/article/${report.id}`} prefetch={false}><h4>{report.headline}</h4></TrackedArticleLink>
  </div>) : <p className={styles.meta}>{t("noAdditionalReportsAreAvailableForThisStory")}</p>}</div>;
}

export async function BreakingNews() {
  const t = await getTranslations();

  const stories = await getTrending({ hours: 3, limit: 5, minArticles: 3 }).catch(() => null);
  if (!stories?.length) return null;
  const featured = stories.slice(0, 2);
  const others = stories.slice(2, 5);
  return <section className={styles.breaking} aria-labelledby="breaking-heading">
    <div className={styles.heading}><h2 id="breaking-heading">Breaking</h2><span>{t("last3Hours")}</span></div>
    <div className={styles.breakingCard}>
    {featured.map(lead => <div className={styles.featured} key={lead.clusterId}>
      <div className={styles.lead}>
        <TrackedArticleLink articleId={lead.leadArticle.id} sourceSurface="BREAKING" href={`/article/${lead.leadArticle.id}`} prefetch={false}>
          <div className={styles.photo}>{lead.leadArticle.mainImage ? <NewsImage src={lead.leadArticle.mainImage} alt="" fill sizes="(max-width: 640px) 90vw, 320px" className="object-cover" /> : <span aria-hidden="true">{t("n")}</span>}<LeadMetadata story={lead} /></div>
          <h3>{lead.leadArticle.headline}</h3>
        </TrackedArticleLink>
      </div>
      <Suspense fallback={<RelatedReportsSkeleton />}><RelatedReports id={lead.leadArticle.id} /></Suspense>
    </div>)}
    {others.map(story => <div className={styles.compact} key={story.clusterId}>
      <div className={styles.compactCopy}>
        <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="BREAKING" href={`/article/${story.leadArticle.id}`} prefetch={false}><h3>{story.leadArticle.headline}</h3></TrackedArticleLink>
        <ClusterPortals portals={story.sourcePortals} />
        <PublishedTime value={story.leadArticle.publishedAt} />
      </div>
      <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="BREAKING" href={`/article/${story.leadArticle.id}`} prefetch={false} aria-label={story.leadArticle.headline}>
        <div className={styles.photo}>{story.leadArticle.mainImage ? <NewsImage src={story.leadArticle.mainImage} alt="" fill sizes="(max-width: 640px) 27vw, (max-width: 1023px) 28vw, 250px" className="object-cover" /> : <span aria-hidden="true">{t("n")}</span>}</div>
      </TrackedArticleLink>
    </div>)}
    </div>
  </section>;
}
