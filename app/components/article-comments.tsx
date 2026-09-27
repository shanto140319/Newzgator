"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { fetchComments, postComment, type ArticleComment } from "../lib/client-api";
import { NewsImage } from "./news-image";
import styles from "./article-comments.module.css";

export function ArticleComments({ articleId }: { articleId: number }) {
  const [items, setItems] = useState<ArticleComment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState(false);
  const pendingPost = useRef(false);
  const request = useRef<AbortController | null>(null);
  const retryCursor = useRef("");
  const load = useCallback(async (nextCursor = "") => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    retryCursor.current = nextCursor; setLoading(true); setLoadError(false);
    try {
      const data = await fetchComments(articleId, nextCursor, controller.signal);
      if (controller.signal.aborted) return;
      setItems(previous => [...new Map((nextCursor ? [...previous, ...data.items] : data.items).map(item => [item.id, item])).values()]);
      setCursor(data.nextCursor); setHasNext(data.hasNext);
    } catch { if (!controller.signal.aborted) setLoadError(true); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, [articleId]);
  useEffect(() => {
    const controller = new AbortController(); request.current = controller;
    void fetchComments(articleId, "", controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setItems(data.items); setCursor(data.nextCursor); setHasNext(data.hasNext);
    }).catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => request.current?.abort();
  }, [articleId]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!draft.trim() || pendingPost.current) return;
    pendingPost.current = true; setSending(true); setMessage(""); setSendError(false);
    try { await postComment(articleId, draft); setDraft(""); setMessage("আপনার মন্তব্য প্রকাশিত হয়েছে।"); await load(); }
    catch { setSendError(true); setMessage("মন্তব্য পাঠানো নিশ্চিত করা যায়নি। আবার পাঠানোর আগে তালিকা দেখে নিন।"); }
    finally { pendingPost.current = false; setSending(false); }
  }
  return <section className={styles.section} aria-labelledby="comments-heading">
    <h2 id="comments-heading">মন্তব্য</h2>
    <form onSubmit={submit} className={styles.form}>
      <label htmlFor={`comment-${articleId}`}>আপনার মতামত লিখুন</label>
      <textarea id={`comment-${articleId}`} value={draft} onChange={event => setDraft(event.target.value)} required rows={4} disabled={sending} />
      <button type="submit" disabled={sending || !draft.trim()}>{sending ? "পাঠানো হচ্ছে…" : "মন্তব্য প্রকাশ করুন"}</button>
      {message && <p role={sendError ? "alert" : "status"}>{message}</p>}
    </form>
    <div aria-busy={loading}>
      <ul className={styles.list}>{items.map(item => {
        const name = item.displayName?.trim() || "পাঠক";
        const timestamp = typeof item.createdAt === "string" ? (/(?:Z|[+-]\d{2}:\d{2})$/.test(item.createdAt) ? item.createdAt : item.createdAt + "+06:00") : "";
        const date = new Date(timestamp);
        return <li key={item.id}>
          <div className={styles.meta}><span className={styles.avatar}>{item.avatarUrl ? <NewsImage src={item.avatarUrl} alt="" width={32} height={32} hideOnError /> : name.slice(0,1)}</span><strong>{name}</strong>{!Number.isNaN(date.getTime()) && <time dateTime={timestamp}>{new Intl.DateTimeFormat("bn-BD", { dateStyle:"medium", timeStyle:"short", timeZone:"Asia/Dhaka" }).format(date)}</time>}</div>
          <p className={styles.body}>{item.body}</p>
        </li>;
      })}</ul>
      {loading && <p role="status">মন্তব্য লোড হচ্ছে…</p>}
      {loadError && <div role="alert"><p>মন্তব্য আনা যাচ্ছে না।</p><button onClick={() => void load(retryCursor.current)} type="button">আবার চেষ্টা করুন</button></div>}
      {!loading && !loadError && !items.length && <p>এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি লিখুন।</p>}
      {!loading && !loadError && hasNext && <button type="button" onClick={() => void load(cursor || "")}>আরও মন্তব্য দেখুন</button>}
    </div>
  </section>;
}
