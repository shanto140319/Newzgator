"use client";
import { useState } from "react";
import { removeBookmark, saveBookmark } from "../lib/client-api";
import { beginAction, updateArticleState, useArticleState } from "./article-state";
export function SaveButton({ articleId, initialSaved = false }: { articleId: number; initialSaved?: boolean }) {
  const state = useArticleState(articleId);
  const saved = state?.saved ?? initialSaved;
  const [error, setError] = useState(false);
  async function toggle() {
    if (!beginAction(articleId)) return;
    setError(false);
    try {
      if (saved) await removeBookmark(articleId);
      else await saveBookmark(articleId);
      updateArticleState(articleId, { saved: !saved });
    } catch { setError(true); } finally { updateArticleState(articleId, { busy: false }); }
  }
  return <span className="inline-flex flex-col gap-1"><button type="button" onClick={toggle} disabled={state?.busy} aria-pressed={saved} className="save-button" title={saved ? "সংরক্ষণ থেকে সরান" : "পরে পড়ার জন্য সংরক্ষণ"}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-6-4-6 4V3Z" /></svg>{saved ? "সংরক্ষিত" : "পরে পড়ুন"}
  </button>{error && <span role="alert" className="text-xs text-[var(--accent)]">সংরক্ষণ বদলানো যায়নি। আবার চেষ্টা করুন।</span>}</span>;
}
