"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { getUserId } from "../lib/user-id";

export const sourceSurfaces = ["TRENDING", "BREAKING", "FEED", "DETAILS", "RELATED", "RECOMMENDED", "SEARCH"] as const;
export type SourceSurface = typeof sourceSurfaces[number];
const base = (process.env.NEXT_PUBLIC_ARTICLE_API_BASE_URL ?? "https://newzgator-api.onrender.com").replace(/\/$/, "");

function recordClick(articleId: number, sourceSurface: SourceSurface) {
  if (!Number.isSafeInteger(articleId) || articleId < 1) return;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // Analytics must still work anonymously when browser storage is unavailable.
  try { headers["X-User-Id"] = getUserId(); } catch {}
  void fetch(base + "/api/v1/analytics/clicks", {
    method: "POST", headers, body: JSON.stringify({ articleId, sourceSurface }),
    keepalive: true,
  }).catch(() => { /* Analytics failures must not interrupt navigation. */ });
}

export function TrackedArticleLink({ articleId, sourceSurface, onClick, onAuxClick, ...props }: ComponentProps<typeof Link> & { articleId: number; sourceSurface?: SourceSurface }) {
  return <Link {...props} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented && sourceSurface) recordClick(articleId, sourceSurface);
  }} onAuxClick={event => {
    onAuxClick?.(event);
    if (event.button === 1 && !event.defaultPrevented && sourceSurface) recordClick(articleId, sourceSurface);
  }} />;
}
