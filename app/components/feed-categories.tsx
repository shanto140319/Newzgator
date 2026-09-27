import Link from "next/link";
import type { Category } from "../lib/articles";
import { feedHref } from "../lib/feed-route";
import { CategoryScroll } from "./category-scroll";
import styles from "./feed-categories.module.css";
export function FeedCategories({ categories, activeCategory, portalId, loading = false }: { categories: Category[]; activeCategory: string; portalId: string; loading?: boolean }) {
 return (      <nav aria-label="সংবাদ বিভাগ" id="feed-categories" className={styles.categoryNav}>
        <CategoryScroll className={styles.categoryInner}>
          {loading ? (
            <span
              aria-hidden="true"
              className="flex items-center gap-8 animate-pulse"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <span
                  key={i}
                  className="h-4 w-16 rounded bg-slate-200 dark:bg-white/10"
                />
              ))}
            </span>
          ) : (
            [
              { name: "", nameBn: "সর্বশেষ", nameEn: "Latest" },
              ...categories,
            ].map((category) => (
              <Link
                key={category.name}
                prefetch={false}
                href={feedHref(category.name, portalId) + "#feed-categories"}
                aria-current={
                  category.name === activeCategory ? "page" : undefined
                }
                className={styles.categoryLink}
              >
                {category.nameBn || category.nameEn || category.name}
              </Link>
            ))
          )}
        </CategoryScroll>
      </nav>);
}
