import type { ArticleReactions } from "../lib/articles";
type ReactionIconName = "like" | "dislike" | "important" | "inaccurate";

function ReactionIcon({ name }: { name: ReactionIconName }) {
  if (name === "important") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 3.7 18h16.6L12 3Z" />
        <path strokeLinecap="round" d="M12 9v4.5" />
        <circle cx="12" cy="16.5" r=".7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "inaccurate") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="m9 9 6 6m0-6-6 6" />
      </svg>
    );
  }

  return (
    <svg
      className={name === "dislike" ? "rotate-180" : undefined}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.2 11 3.8c.5-.9 1.8-.6 1.9.4l.2 3.6h4.8c1.5 0 2.5 1.4 2.1 2.8l-1.7 6.5c-.3 1.1-1.3 1.9-2.5 1.9H7.5m0-8.8V19H4.2V10.2h3.3Z" />
    </svg>
  );
}

export function ReactionBar({ reactions, compact = false }: { reactions?: ArticleReactions; compact?: boolean }) {
  const items: Array<{ name: ReactionIconName; label: string; count: number }> = [
    { name: "like", label: "পছন্দ", count: reactions?.likeCount ?? 0 },
    { name: "dislike", label: "অপছন্দ", count: reactions?.dislikeCount ?? 0 },
    { name: "important", label: "গুরুত্বপূর্ণ", count: reactions?.importantCount ?? 0 },
    { name: "inaccurate", label: "ভুল তথ্য", count: reactions?.inaccurateCount ?? 0 },
  ];

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`} role="group" aria-label="পাঠকের প্রতিক্রিয়া">
      {items.map((item) => (
        <span
          key={item.name}
          role="img"
          className={`${compact ? "h-7 min-w-10 px-1.5" : "h-8 min-w-11 px-2"} inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 reading:border-[#ded2bd] reading:bg-[#f7efdf] reading:text-[#756553]`}
          title={item.label}
          aria-label={`${item.label}: ${item.count.toLocaleString("bn-BD")}`}
        >
          <span className="size-3.5 shrink-0">
            <ReactionIcon name={item.name} />
          </span>
          {item.count.toLocaleString("bn-BD")}
        </span>
      ))}
    </div>
  );
}

