import { Header } from "../components/header";
import { ArticleCardsSkeleton } from "../components/feed-skeleton";
export default function Loading() { return <><Header loading /><main id="main-content" className="site-container py-8"><h1 className="mb-8 text-3xl font-bold">সংরক্ষিত সংবাদ</h1><ArticleCardsSkeleton /></main></>; }
