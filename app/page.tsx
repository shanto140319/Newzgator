import { ArticleFeed } from "./components/article-feed";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { sampleArticle } from "./lib/articles";

export default function Home() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="intro" aria-labelledby="latest-heading">
          <div>
            <span className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              লাইভ আপডেট
            </span>
            <h1 id="latest-heading">এখনকার গুরুত্বপূর্ণ খবর</h1>
          </div>
          <p>দেশ, বিশ্ব ও আপনার চারপাশের খবর—এক জায়গায়, সংক্ষেপে।</p>
        </section>

        <ArticleFeed
          apiBaseUrl={
            process.env.NEXT_PUBLIC_ARTICLE_API_BASE_URL ??
            "https://unopposed-extenuate-pyramid.ngrok-free.dev"
          }
          initialItems={[sampleArticle]}
          initialCursor={null}
          initialHasNext={false}
          isFallback
        />
      </main>
      <Footer />
    </div>
  );
}
