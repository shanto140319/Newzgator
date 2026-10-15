import { getCategories, getRecommendations } from "../lib/api";
import { Message } from "./message";
import { ArticlePreview } from "./article-preview";
import styles from "./cluster-news.module.css";

export async function RecommendedNews() {
  const [articles, categories] = await Promise.all([
    getRecommendations().catch(() => null),
    getCategories().catch(() => []),
  ]);
  return <section className={styles.breaking} aria-labelledby="recommended-heading">
    <div className={styles.heading}><h2 id="recommended-heading"><Message id="recommendedForYou" /></h2><span><Message id="basedOnYourReading" /></span></div>
    {/* Empty means the reader is anonymous or has no history yet. */}
    {articles?.length ? <div className={styles.recommended}>
      {articles.map(article => <ArticlePreview key={article.id} sourceSurface="RECOMMENDED" compact article={article} category={categories.find(c => c.name === article.category)} />)}
    </div> : <p className={styles.recommendedEmpty}><Message id="browseMoreToGetRecommendations" /></p>}
  </section>;
}
