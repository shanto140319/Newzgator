import { BreakingNewsSkeleton } from "./components/breaking-news-skeleton";
import { FeedCategories } from "./components/feed-categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleFeed } from "./components/article-feed";
import { BreakingNews } from "./components/breaking-news";
import { DiscoverySidebar } from "./components/discovery-sidebar";
import { FeedSkeleton } from "./components/feed-skeleton";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { getArticles, getCategories, getPortals } from "./lib/api";
import type { Portal } from "./lib/articles";
import { feedHref, validPortalId } from "./lib/feed-route";

type Props = {
  searchParams: Promise<{
    category?: string | string[];
    portalId?: string | string[];
  }>;
};
async function filtersFor(searchParams: Props["searchParams"]) {
  const { category = "", portalId = "" } = await searchParams;
  if (
    typeof category !== "string" ||
    (category && !/^[a-z0-9-]{1,80}$/.test(category)) ||
    typeof portalId !== "string" ||
    (portalId && !validPortalId(portalId))
  )
    notFound();
  return { category, portalId };
}
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { category, portalId } = await filtersFor(searchParams);
  const categories = await getCategories().catch(() => []);
  const label = categories.find((c) => c.name === category)?.nameBn ?? category;
  return {
    title: category
      ? label + " সংবাদ — নিউজগেটর"
      : "নিউজগেটর — সব খবর এক পাতায়",
    alternates: { canonical: feedHref(category, portalId) },
  };
}
async function ServerArticleFeed({
  category,
  portalId,
  labels,
  portals,
}: {
  category: string;
  portalId: string;
  labels: Record<string, string>;
  portals: Portal[];
}) {
  const data = await getArticles(category, "", portalId).catch(() => null);
  return (
    <ArticleFeed
      key={feedHref(category, portalId)}
      category={category}
      portalId={portalId}
      portals={portals}
      categoryLabels={labels}
      initialItems={data?.items ?? []}
      initialCursor={data?.nextCursor ?? null}
      initialHasNext={data?.hasNext ?? false}
      isFallback={!data}
    />
  );
}
export default async function Home({ searchParams }: Props) {
  const { category, portalId } = await filtersFor(searchParams);
  const [categories, portals] = await Promise.all([
    getCategories().catch(() => null),
    getPortals().catch(() => []),
  ]);
  if (category && categories && !categories.some((c) => c.name === category))
    notFound();
  const label =
    categories?.find((c) => c.name === category)?.nameBn ?? category;
  const publisher = portals.find((p) => String(p.id) === portalId);
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="site-container flex-1 py-8 pb-16 max-sm:py-6"
      >
        <h1 className="sr-only">{category ? label + " সংবাদ" : "নিউজগেটর সংবাদ"}</h1>
        {portalId && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="muted text-sm">{publisher ? (publisher.nameBn || publisher.name) + " থেকে সর্বশেষ সংবাদ" : "নির্বাচিত সংবাদমাধ্যম"}</p>
          <Link className="text-sm font-semibold text-[var(--accent)] hover:underline" href={feedHref(category)}>সব সংবাদমাধ্যম ×</Link>
        </div>}
        <div className="home-grid">
          <div className="home-feed min-w-0">
            <Suspense fallback={<BreakingNewsSkeleton />}>
              <BreakingNews />
            </Suspense>
            <FeedCategories categories={categories ?? []} activeCategory={category} portalId={portalId} />
            <Suspense
              key={feedHref(category, portalId)}
              fallback={<FeedSkeleton />}
            >
              <ServerArticleFeed
                category={category}
                portalId={portalId}
                portals={portals}
                labels={Object.fromEntries(
                  (categories ?? []).map((c) => [
                    c.name,
                    c.nameBn || c.nameEn || c.name,
                  ]),
                )}
              />
            </Suspense>
          </div>
          <DiscoverySidebar
            portals={portals}
            category={category}
            portalId={portalId}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
