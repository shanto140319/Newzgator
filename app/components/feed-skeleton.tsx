export function FeedSkeleton() {
  return (
    <div className="feed-wrap" aria-label="সংবাদ লোড হচ্ছে" aria-busy="true">
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="skeleton skeleton-card" key={index} />
        ))}
      </div>
    </div>
  );
}
