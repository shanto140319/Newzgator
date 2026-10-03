import { localizedName } from "../lib/localized-name";
import { useTranslations, useLocale } from "next-intl";
import { SummaryPreview } from "./summary-preview";
import { TrackedArticleLink, type SourceSurface } from "./tracked-article-link";
import type { Article } from "../lib/articles";
import { NewsImage } from "./news-image";
import { SaveButton } from "./save-button";
import { ReactionBar } from "./reaction-bar";

function Source({ article }: { article: Article }) {
  const locale = useLocale();

  const name = localizedName(article.portal, locale);
  const date = new Date(article.publishedAt);
  return <div className="story-source">
    {article.portal.logo && <span className="relative h-7 w-14 shrink-0" aria-hidden="true"><NewsImage src={article.portal.logo} alt="" fill sizes="56px" className="object-contain" /></span>}
    <span className="truncate">{name}</span><span aria-hidden="true">·</span>
    <time dateTime={article.publishedAt}>{Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(date)}</time>
  </div>;
}
export function ArticlePreview({ article, label, featured = false, compact = false, priority = false, sourceSurface }: { article: Article; label: string; featured?: boolean; compact?: boolean; priority?: boolean; sourceSurface?: SourceSurface }) {
  const t = useTranslations();

  return <article className={featured ? "lead-story" : compact ? "feed-grid-card" : "story-row"}>
    <div className="story-media">
      <div className={(featured ? "lead-photo" : "row-photo") + " relative"}>
        {article.mainImage ? <NewsImage src={article.mainImage} alt="" fill preload={priority} sizes={featured ? "(max-width: 1023px) calc(100vw - 32px), 840px" : compact ? "(max-width: 640px) calc(100vw - 32px), (max-width: 1023px) 45vw, 410px" : "(max-width: 640px) calc(100vw - 32px), (max-width: 1023px) 40vw, 340px"} className="object-cover" /> : <span className="photo-placeholder" role="img" aria-label={t("imageUnavailable")}>{t("n")}</span>}
        {compact && !featured && <Source article={article} />}
      </div>
      {(!compact || featured) && <Source article={article} />}
    </div>
    <div className="story-copy">
      <TrackedArticleLink articleId={article.id} sourceSurface={sourceSurface} href={"/article/" + article.id} prefetch={false} className="story-link"><h2 className="story-title">{article.headline}</h2></TrackedArticleLink>
      {!featured && article.summary ? <SummaryPreview className="story-summary" summary={article.summary} headline={article.headline} /> : <p className="story-summary">{article.summary}</p>}
      <div className="story-actions"><ReactionBar articleId={article.id} reactions={article.articleReactions} compact /><SaveButton articleId={article.id} initialSaved={article.isBookmarked} /><span className="muted text-xs">{label}</span></div>
    </div>
  </article>;
}
