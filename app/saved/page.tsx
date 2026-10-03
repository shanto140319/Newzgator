import { localizedName } from "../lib/localized-name";
import { getLocale, getTranslations } from "next-intl/server";
import { getCategories } from "../lib/api";
import type { Metadata } from "next";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SavedFeed } from "../components/saved-feed";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("savedArticlesNewsgator"), robots: { index: false, follow: false } };
}

export default async function SavedPage() {
  const locale = await getLocale();

  const t = await getTranslations();

  const categories = await getCategories().catch(() => []);
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="site-container flex-1 py-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-extrabold">{t("savedArticles")}</h1>
          <p className="muted mt-2 mb-8">
            {t("storiesSavedForLaterSelectUnsaveToRemoveThemFromThisList")}</p>
          <SavedFeed
            labels={Object.fromEntries(
              categories.map((c) => [c.name, localizedName(c, locale)]),
            )}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
