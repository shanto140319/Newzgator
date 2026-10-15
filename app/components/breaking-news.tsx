import { BreakingRail } from "./breaking-rail";
import { Message } from "./message";
import { PublishedTime } from "./published-time";
import { RelatedReportsSkeleton } from "./breaking-news-skeleton";
import { TrackedArticleLink } from "./tracked-article-link";
import { Suspense } from "react";
import type { TrendingCluster } from "../lib/articles";
import { getRelatedArticles, getTrending } from "../lib/api";
import { NewsImage } from "./news-image";
import { ClusterPortals } from "./cluster-portals";
import styles from "./cluster-news.module.css";

function LeadMetadata({ story }: { story: TrendingCluster }) {
  const url = story.leadArticle.url;
  const host = url ? new URL(url).hostname.replace(/^www\./, "") : "";
  const portal = story.sourcePortals.find(source => source.portalUrl && new URL(source.portalUrl).hostname.replace(/^www\./, "") === host);
  return <div className={styles.photoMetadata}>
    {(portal || host) && <span className={styles.photoPublisher} title={portal?.portalName || host}>{portal?.portalName || host}</span>}
    <PublishedTime value={story.leadArticle.publishedAt} />
  </div>;
}

async function RelatedReports({ id }: { id: number }) {
  const reports = await getRelatedArticles(id).catch(() => []);
  return <div className={styles.related}>{reports.length ? reports.slice(0, 3).map(report => <div key={report.id}>
    <div className={styles.relatedMetadata}><span className={styles.relatedPublisher} title={report.portalName}>{report.portalName}</span><PublishedTime value={report.publishedAt} /></div>
    <TrackedArticleLink articleId={report.id} sourceSurface="RELATED" href={`/article/${report.id}`} prefetch={false}><h4>{report.headline}</h4></TrackedArticleLink>
  </div>) : <p className={styles.meta}><Message id="noAdditionalReportsAreAvailableForThisStory" /></p>}</div>;
}

export async function TrendingNews() {
  const stories = await getTrending({ hours: 12, limit: 10, minArticles: 5 }).catch(() => null);
  if (!stories?.length) return null;
  const featured = stories.slice(0, 2);
  const others = stories.slice(2, 10);
  return <section className={styles.breaking} aria-labelledby="trending-heading">
    <div className={styles.heading}><h2 id="trending-heading"><Message id="trending" /></h2><span><Message id="last12Hours" /></span></div>
    <div className={styles.breakingCard}>
    {featured.map(lead => <div className={styles.featured} key={lead.clusterId}>
      <div className={styles.lead}>
        <TrackedArticleLink articleId={lead.leadArticle.id} sourceSurface="TRENDING" href={`/article/${lead.leadArticle.id}`} prefetch={false}>
          <div className={styles.photo}>{lead.leadArticle.mainImage ? <NewsImage src={lead.leadArticle.mainImage} alt="" fill sizes="(max-width: 640px) 90vw, (max-width: 1280px) 46vw, 590px" className="object-cover" /> : <span aria-hidden="true"><Message id="n" /></span>}<LeadMetadata story={lead} /></div>
          <h3>{lead.leadArticle.headline}</h3>
        </TrackedArticleLink>
      </div>
      <Suspense fallback={<RelatedReportsSkeleton />}><RelatedReports id={lead.leadArticle.id} /></Suspense>
    </div>)}
    {others.map(story => <div className={styles.compact} key={story.clusterId}>
      <div className={styles.compactCopy}>
        <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="TRENDING" href={`/article/${story.leadArticle.id}`} prefetch={false}><h3>{story.leadArticle.headline}</h3></TrackedArticleLink>
        <ClusterPortals portals={story.sourcePortals} />
        <PublishedTime value={story.leadArticle.publishedAt} />
      </div>
      <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="TRENDING" href={`/article/${story.leadArticle.id}`} prefetch={false} aria-label={story.leadArticle.headline}>
        <div className={styles.photo}>{story.leadArticle.mainImage ? <NewsImage src={story.leadArticle.mainImage} alt="" fill sizes="(max-width: 640px) 27vw, (max-width: 1280px) 28vw, 360px" className="object-cover" /> : <span aria-hidden="true"><Message id="n" /></span>}</div>
      </TrackedArticleLink>
    </div>)}
    </div>
  </section>;
}

export async function BreakingNews() {
  const stories = await getTrending({ hours: 3, limit: 5, minArticles: 3 }).catch(() => null);
  if (!stories?.length) return null;
  return <section className={styles.breakingStrip} aria-labelledby="breaking-heading">
    <div className={styles.heading}><h2 id="breaking-heading"><span className={styles.liveDot} aria-hidden="true" /><Message id="breaking" /></h2><span><Message id="last3Hours" /></span></div>
    <BreakingRail>
      {stories.map(story => <article className={styles.railCard} key={story.clusterId}>
        <TrackedArticleLink articleId={story.leadArticle.id} sourceSurface="BREAKING" href={`/article/${story.leadArticle.id}`} prefetch={false}>
          <div className={styles.railPhoto}>{story.leadArticle.mainImage ? <NewsImage src={story.leadArticle.mainImage} alt="" fill sizes="112px" className="object-cover" /> : <span aria-hidden="true"><Message id="n" /></span>}</div>
          <div className={styles.railCopy}><h3>{story.leadArticle.headline}</h3><PublishedTime value={story.leadArticle.publishedAt} /></div>
        </TrackedArticleLink>
      </article>)}
    </BreakingRail>
  </section>;
}
