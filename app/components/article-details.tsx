import { NewsImage } from "./news-image";
import Link from "next/link";
import type { ArticleDetails } from "../lib/articles";
import { ReactionBar } from "./reaction-bar";

export function ArticleDetailsView({ article, categoryLabel }: { article: ArticleDetails; categoryLabel: string }) {
  const publisher = article.portal.nameBn?.trim() || article.portal.name;
  const date = new Date(article.publishedAt);
  return <article className="detail-story">
    <Link className="muted inline-flex text-sm font-semibold hover:underline" href="/">← সব খবরে ফিরুন</Link>
    <header className="mt-7">
      <span className="text-sm font-bold text-[var(--accent)]">{categoryLabel}</span>
      <h1 className="detail-title">{article.headline}</h1>
      <div className="mt-6 flex items-center gap-3">
        <span className="relative grid h-10 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-lg font-bold text-slate-700">{article.portal.logo ? <NewsImage src={article.portal.logo} alt="" fill sizes="48px" className="object-contain p-1" /> : publisher.slice(0, 1)}</span>
        <div className="min-w-0"><p className="text-sm font-bold">{publisher}</p><time className="muted mt-1 block text-xs" dateTime={article.publishedAt}>{Number.isNaN(date.getTime()) ? "সময় পাওয়া যায়নি" : new Intl.DateTimeFormat("bn-BD", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(date)}</time></div>
      </div>
    </header>
    {article.mainImage && <div className="detail-photo relative"><NewsImage src={article.mainImage} alt={article.headline} fill preload sizes="(max-width: 1023px) calc(100vw - 32px), 860px" className="object-cover" /></div>}
    <div className="detail-body whitespace-pre-line">{article.details.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    <footer className="mt-8 flex flex-wrap items-center gap-5 border-t border-[var(--line)] pt-6">
      {article.url && <a className="source-button" href={article.url} target="_blank" rel="noreferrer">মূল সংবাদ পড়ুন <span aria-hidden="true">↗</span></a>}
      <ReactionBar reactions={article.articleReactions} />
    </footer>
  </article>;
}
