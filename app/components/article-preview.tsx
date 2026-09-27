import { TrackedArticleLink, type SourceSurface } from "./tracked-article-link";
import type { Article } from "../lib/articles";
import { NewsImage } from "./news-image";
import { SaveButton } from "./save-button";
import { ReactionBar } from "./reaction-bar";

function Source({ article }: { article: Article }) {
  const name = article.portal.nameBn || article.portal.name;
  const date = new Date(article.publishedAt);
  return <div className="story-source">
    {article.portal.logo && <span className="relative h-7 w-14 shrink-0" aria-hidden="true"><NewsImage src={article.portal.logo} alt="" fill sizes="56px" className="object-contain" /></span>}
    <span className="truncate">{name}</span><span aria-hidden="true">·</span>
    <time dateTime={article.publishedAt}>{Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(date)}</time>
  </div>;
}
export function ArticlePreview({ article, label, featured = false, compact = false, priority = false, sourceSurface }: { article: Article; label: string; featured?: boolean; compact?: boolean; priority?: boolean; sourceSurface?: SourceSurface }) {
  return <article className={featured ? "lead-story" : compact ? "feed-grid-card" : "story-row"}>
    <div className="story-media">
      <div className={(featured ? "lead-photo" : "row-photo") + " relative"}>
        {article.mainImage ? <NewsImage src={article.mainImage} alt="" fill preload={priority} sizes={featured ? "(max-width: 1023px) calc(100vw - 32px), 840px" : compact ? "(max-width: 640px) calc(100vw - 32px), (max-width: 1023px) 45vw, 410px" : "(max-width: 640px) calc(100vw - 32px), (max-width: 1023px) 40vw, 340px"} className="object-cover" /> : <span className="photo-placeholder" role="img" aria-label="ছবি পাওয়া যায়নি">ন</span>}
        {compact && !featured && <Source article={article} />}
      </div>
      {(!compact || featured) && <Source article={article} />}
    </div>
    <div className="story-copy">
      <TrackedArticleLink articleId={article.id} sourceSurface={sourceSurface} href={"/article/" + article.id} prefetch={false} className="story-link"><h2 className="story-title">{article.headline}</h2></TrackedArticleLink>
      <p className="story-summary">{article.summary}</p>
      <div className="story-actions"><ReactionBar articleId={article.id} reactions={article.articleReactions} compact /><SaveButton articleId={article.id} initialSaved={article.isBookmarked} /><span className="muted text-xs">{label}</span></div>
    </div>
  </article>;
}
