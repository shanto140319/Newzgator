export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={"rounded-md bg-slate-200 dark:bg-white/10 reading:bg-[#dfd3bd] " + className} />;
}
export function ArticleCardsSkeleton() {
  return <div role="status" aria-label="আরও সংবাদ লোড হচ্ছে"><span className="sr-only">আরও সংবাদ লোড হচ্ছে…</span>{[0, 1, 2].map(i => <div key={i} aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] animate-pulse gap-5 border-b border-slate-200 py-5 dark:border-white/10"><div className="flex-1 space-y-3"><SkeletonBlock className="h-4 w-28" /><SkeletonBlock className="h-6 w-full" /><SkeletonBlock className="h-4 w-4/5" /><SkeletonBlock className="h-4 w-3/4" /></div><SkeletonBlock className="order-first aspect-video w-full" /></div>)}</div>;
}
export function FeedSkeleton() {
  return <div className="space-y-6" role="status" aria-label="সংবাদ লোড হচ্ছে"><span className="sr-only">সংবাদ লোড হচ্ছে…</span><div aria-hidden="true" className="lead-story animate-pulse"><SkeletonBlock className="aspect-[2/1] rounded-none" /><div className="space-y-3 p-5"><SkeletonBlock className="h-4 w-44" /><SkeletonBlock className="h-8 w-full" /><SkeletonBlock className="h-8 w-3/4" /><SkeletonBlock className="h-4 w-full" /><SkeletonBlock className="h-4 w-4/5" /></div></div><SkeletonBlock className="h-7 w-36" /><ArticleCardsSkeleton /></div>;
}
