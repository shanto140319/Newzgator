import Link from "next/link";
import type { Article } from "../lib/articles";
import { NewsImage } from "./news-image";
import { ReactionBar } from "./reaction-bar";

function Source({ article }: { article: Article }) {
  const name = article.portal.nameBn || article.portal.name;
  const date = new Date(article.publishedAt);
  return <div className="story-source">
    <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded bg-white text-xs font-bold text-slate-700" aria-hidden="true">{article.portal.logo ? <NewsImage src={article.portal.logo} alt="" fill sizes="28px" className="object-contain" /> : name.slice(0, 1)}</span>
    <span className="truncate">{name}</span><span aria-hidden="true">·</span>
    <time dateTime={article.publishedAt}>{Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(date)}</time>
  </div>;
}
export function ArticlePreview({ article, label, featured = false }: { article: Article; label: string; featured?: boolean }) {
  return <article className={featured ? "lead-story" : "story-row"}>
    {featured && <div className="lead-photo relative">{article.mainImage ? <NewsImage src={article.mainImage} alt="" fill preload sizes="(max-width: 1023px) calc(100vw - 32px), 840px" className="object-cover" /> : <span className="photo-placeholder" role="img" aria-label="ছবি পাওয়া যায়নি">ন</span>}</div>}
    <div className="story-copy">
      <Source article={article} />
      <Link href={"/article/" + article.id} prefetch={false} className="story-link">
        <div className="min-w-0 flex-1"><h2 className="story-title">{article.headline}</h2><p className="story-summary">{article.summary}</p>{featured && <span className="story-read">বিস্তারিত পড়ুন <span aria-hidden="true">→</span></span>}</div>
        {!featured && <div className="row-photo relative">{article.mainImage ? <NewsImage src={article.mainImage} alt="" fill sizes="(max-width: 640px) 104px, 180px" className="object-cover" /> : <span className="photo-placeholder" aria-hidden="true">ন</span>}</div>}
      </Link>
      {!featured && <div className="mt-3 flex flex-wrap items-center gap-4"><ReactionBar reactions={article.articleReactions} compact /><span className="muted text-xs">{label}</span></div>}
    </div>
  </article>;
}
