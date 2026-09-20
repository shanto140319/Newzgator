import Link from "next/link";
import { getRelatedArticles } from "../lib/api";
import { NewsImage } from "./news-image";
import { SkeletonBlock } from "./feed-skeleton";

export function RelatedArticlesSkeleton() {
  return <div role="status" aria-label="সম্পর্কিত সংবাদ লোড হচ্ছে" className="space-y-6 p-5">
    <span className="sr-only">সম্পর্কিত সংবাদ লোড হচ্ছে…</span>
    {Array.from({ length: 4 }, (_, index) => <div aria-hidden="true" key={index} className="flex animate-pulse gap-3"><div className="flex-1 space-y-2"><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-4/5" /><SkeletonBlock className="mt-3 h-3 w-24" /></div><SkeletonBlock className="size-20 shrink-0 rounded-xl" /></div>)}
  </div>;
}
export async function RelatedArticles({ articleId }: { articleId: number }) {
  const articles = await getRelatedArticles(articleId).catch(() => null);
  if (!articles?.length) return <p className="px-5 py-8 text-sm leading-7 text-slate-600 dark:text-slate-400 reading:text-[#756553]">{articles ? "এই মুহূর্তে সম্পর্কিত সংবাদ পাওয়া যায়নি।" : "সম্পর্কিত সংবাদ এখন আনা যাচ্ছে না। একটু পর আবার দেখুন।"}</p>;
  return <ul className="divide-y divide-slate-100 px-5 dark:divide-white/10 reading:divide-[#e8ddc8]">
    {articles.map(article => <li key={article.id} className="py-5">
      <Link href={"/article/" + article.id} prefetch={false} className="group flex items-start gap-3 rounded-lg">
        <div className="min-w-0 flex-1"><p className="mb-1 text-xs font-semibold text-[var(--accent)]">{article.portalName}</p><h3 className="line-clamp-3 text-base font-extrabold leading-relaxed transition-colors group-hover:text-[#c83018] dark:group-hover:text-[#ff8069] reading:font-serif">{article.headline}</h3></div>
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 reading:bg-[#eadfc9]">
          {article.mainImage ? <NewsImage src={article.mainImage} alt="" fill sizes="80px" className="object-cover transition-transform group-hover:scale-105" /> : <span aria-hidden="true" className="grid size-full place-items-center text-3xl font-black text-slate-400 reading:text-[#756553]">ন</span>}
        </div>
      </Link>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400 reading:text-[#756553]">{article.summary}</p>
    </li>)}
  </ul>;
}
