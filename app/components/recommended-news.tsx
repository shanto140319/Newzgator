import { getLocale, getTranslations } from "next-intl/server";
import { getCategories, getRecommendations } from "../lib/api";
import { localizedName } from "../lib/localized-name";
import { ArticlePreview } from "./article-preview";
import styles from "./cluster-news.module.css";

export async function RecommendedNews() {
  const [t, locale, articles, categories] = await Promise.all([
    getTranslations(),
    getLocale(),
    getRecommendations().catch(() => null),
    getCategories().catch(() => []),
  ]);
  return <section className={styles.breaking} aria-labelledby="recommended-heading">
    <div className={styles.heading}><h2 id="recommended-heading">{t("recommendedForYou")}</h2><span>{t("basedOnYourReading")}</span></div>
    {/* Empty means the reader is anonymous or has no history yet. */}
    {articles?.length ? <div className={styles.recommended}>
      {articles.map(article => <ArticlePreview key={article.id} sourceSurface="RECOMMENDED" compact article={article} label={localizedName(categories.find(c => c.name === article.category), locale, article.category)} />)}
    </div> : <p className={styles.recommendedEmpty}>{t("browseMoreToGetRecommendations")}</p>}
  </section>;
}
