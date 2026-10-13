"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cameFromFeed } from "./feed-state";

export function BackToFeedLink({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  return <Link className={className} href="/" onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !cameFromFeed(pathname)) return;
    // Going back in history returns to the feed with its loaded pages and scroll position.
    event.preventDefault();
    router.back();
  }}>{children}</Link>;
}
