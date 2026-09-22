import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import type { Category } from "../lib/articles";
import { feedHref } from "../lib/feed-route";

export function Header({ categories = [], activeCategory, portalId = "", loading = false }: { categories?: Category[]; activeCategory?: string; portalId?: string; loading?: boolean }) {
  return <header className="site-header">
    <div className="site-container flex min-h-22 items-center justify-between gap-4 max-sm:min-h-19">
      <Link className="brand" href="/" aria-label="নিউজগেটর হোম"><span className="brand-mark" aria-hidden="true">ন</span><span>নিউজ<span className="text-[#d73822] dark:text-[#ff8069]">গেটর</span></span></Link>
      <p className="muted hidden text-sm md:block">দেশ ও বিশ্বের খবর, এক জায়গায়</p>
      <ThemeSwitcher />
    </div>
    <nav aria-label="সংবাদ বিভাগ" className="category-nav">
      <div className="site-container flex min-h-13 items-stretch gap-8 overflow-x-auto [scrollbar-width:none] max-sm:gap-6">
        <Link href="/saved" prefetch={false} className="category-link">সংরক্ষিত</Link>
        {loading ? <span aria-hidden="true" className="flex items-center gap-8 animate-pulse">{Array.from({ length: 8 }, (_, i) => <span key={i} className="h-4 w-16 rounded bg-slate-200 dark:bg-white/10" />)}</span> : [{ name: "", nameBn: "সর্বশেষ", nameEn: "Latest" }, ...categories].map(category => <Link key={category.name} prefetch={false} href={feedHref(category.name, portalId)} aria-current={category.name === activeCategory ? "page" : undefined} className="category-link">{category.nameBn || category.nameEn || category.name}</Link>)}
      </div>
    </nav>
  </header>;
}
