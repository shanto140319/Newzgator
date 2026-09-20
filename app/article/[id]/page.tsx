import { Suspense } from "react";
import { RelatedArticles, RelatedArticlesSkeleton } from "../../components/related-articles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailsView } from "../../components/article-details";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { ApiError, getArticle, getCategories } from "../../lib/api";

type Props = { params: Promise<{ id: string }> };
async function load(params: Props["params"]) {
  const { id } = await params;
  if (typeof id !== "string" || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  try { return await getArticle(id); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await load(params);
  const description = article.details.replace(/\s+/g, " ").slice(0, 160);
  return { title: article.headline + " — নিউজগেটর", description,
    alternates: { canonical: "/article/" + article.id },
    openGraph: { type: "article", locale: "bn_BD", title: article.headline, description, publishedTime: article.publishedAt, images: article.mainImage ? [article.mainImage] : [], url: "/article/" + article.id },
    twitter: { card: article.mainImage ? "summary_large_image" : "summary", title: article.headline, description, images: article.mainImage ? [article.mainImage] : [] },
  };
}
export default async function ArticlePage({ params }: Props) {
  const [article, categories] = await Promise.all([load(params), getCategories().catch(() => [])]);
  return <div id="top" className="flex min-h-screen flex-col bg-[var(--paper)]">
    <Header categories={categories} activeCategory={article.category} />
    <main id="main-content" tabIndex={-1} className="site-container flex-1 py-8 pb-16 max-sm:py-6">
      <div className="detail-grid">
      <ArticleDetailsView article={article} categoryLabel={categories.find(c => c.name === article.category)?.nameBn || article.category} />
      <aside aria-labelledby="related-heading" className="related-panel lg:mt-13">
        <div className="border-b border-slate-100 px-5 py-5 dark:border-white/10 reading:border-[#e8ddc8]">
          <div className="mb-2 h-1 w-8 rounded-full bg-[#c83018]" aria-hidden="true" />
          <h2 id="related-heading" className="text-xl font-extrabold reading:font-serif">সম্পর্কিত সংবাদ</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400 reading:text-[#756553]">একই বিষয়ের আরও প্রতিবেদন</p>
        </div>
        <Suspense key={article.id} fallback={<RelatedArticlesSkeleton />}><RelatedArticles articleId={article.id} /></Suspense>
      </aside>
      </div>
    </main>
    <Footer />
  </div>;
}
