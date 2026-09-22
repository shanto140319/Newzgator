import type { Metadata } from "next";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SavedFeed } from "../components/saved-feed";
import { getCategories } from "../lib/api";

export const metadata: Metadata = {
  title: "সংরক্ষিত সংবাদ — নিউজগেটর",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const categories = await getCategories().catch(() => []);
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header categories={categories} />
      <main id="main-content" tabIndex={-1} className="site-container flex-1 py-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-extrabold">সংরক্ষিত সংবাদ</h1>
          <p className="muted mt-2 mb-8">
            পরে পড়ার জন্য রাখা খবর। এই ব্রাউজারেই আপনার তালিকা পাওয়া যাবে।
          </p>
          <SavedFeed
            labels={Object.fromEntries(
              categories.map((c) => [c.name, c.nameBn || c.nameEn || c.name]),
            )}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
