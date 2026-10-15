import { Message } from "../components/message";
import { Header } from "../components/header";
import { ArticleCardsSkeleton } from "../components/feed-skeleton";
export default function Loading() {
 return <><Header /><main id="main-content" className="site-container py-8"><h1 className="mb-8 text-3xl font-bold"><Message id="savedArticles" /></h1><ArticleCardsSkeleton /></main></>; }
