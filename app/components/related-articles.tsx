import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SummaryPreview } from "./summary-preview";
import { TrackedArticleLink } from "./tracked-article-link";
import { getRelatedArticles } from "../lib/api";
import { NewsImage } from "./news-image";
import { SkeletonBlock } from "./feed-skeleton";

export function RelatedArticlesSkeleton() {
  const t = useTranslations();

  return <div role="status" aria-label={t("loadingRelatedNews")} className="space-y-6 p-5">
    <span className="sr-only">{t("loadingRelatedNewsAlt")}</span>
    {Array.from({ length: 4 }, (_, index) => <div aria-hidden="true" key={index} className="flex animate-pulse gap-3"><div className="flex-1 space-y-2"><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-4/5" /><SkeletonBlock className="mt-3 h-3 w-24" /></div><SkeletonBlock className="size-20 shrink-0 rounded-xl" /></div>)}
  </div>;
}
export async function RelatedArticles({ articleId }: { articleId: number }) {
  const t = await getTranslations();

  const articles = await getRelatedArticles(articleId).catch(() => null);
  if (!articles?.length) return <p className="px-5 py-8 text-sm leading-7 text-slate-600 dark:text-slate-400 reading:text-[#756553]">{articles ? t("noRelatedNewsIsAvailableRightNow") : t("relatedNewsCouldNotBeLoadedPleaseTryAgainLater")}</p>;
  return <ul className="divide-y divide-slate-100 px-5 dark:divide-white/10 reading:divide-[#e8ddc8]">
    {articles.map(article => <li key={article.id} className="related-summary-card py-5">
      <TrackedArticleLink articleId={article.id} sourceSurface="RELATED" href={"/article/" + article.id} prefetch={false} className="group flex items-start gap-3 rounded-lg">
        <div className="min-w-0 flex-1"><p className="mb-1 text-xs font-semibold text-[var(--accent)]">{article.portalName}</p><h3 className="line-clamp-3 text-base font-extrabold leading-relaxed transition-colors group-hover:text-[#c83018] dark:group-hover:text-[#ff8069]">{article.headline}</h3></div>
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 reading:bg-[#eadfc9]">
          {article.mainImage ? <NewsImage src={article.mainImage} alt="" fill sizes="80px" className="object-cover transition-transform group-hover:scale-105" /> : <span aria-hidden="true" className="grid size-full place-items-center text-3xl font-black text-slate-400 reading:text-[#756553]">{t("n")}</span>}
        </div>
      </TrackedArticleLink>
      {article.summary && <SummaryPreview className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400 reading:text-[#756553]" summary={article.summary} headline={article.headline} />}
    </li>)}
  </ul>;
}
