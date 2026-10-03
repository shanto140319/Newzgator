"use client";
import { useTranslations, useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { fetchComments, postComment, type ArticleComment } from "../lib/client-api";
import { NewsImage } from "./news-image";
import styles from "./article-comments.module.css";

export function ArticleComments({ articleId }: { articleId: number }) {
  const t = useTranslations();
  const locale = useLocale();

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
    try { await postComment(articleId, draft); setDraft(""); setMessage("commentPublished"); await load(); }
    catch { setSendError(true); setMessage("weCouldNotConfirmYourCommentWasSentCheckTheListBeforeTryingAgain"); }
    finally { pendingPost.current = false; setSending(false); }
  }
  return <section className={styles.section} aria-labelledby="comments-heading">
    <h2 id="comments-heading">{t("comments")}</h2>
    <form onSubmit={submit} className={styles.form}>
      <label htmlFor={`comment-${articleId}`}>{t("writeYourComment")}</label>
      <textarea id={`comment-${articleId}`} value={draft} onChange={event => setDraft(event.target.value)} required rows={4} disabled={sending} />
      <button type="submit" disabled={sending || !draft.trim()}>{sending ? t("sending") : t("postComment")}</button>
      {message && <p role={sendError ? "alert" : "status"}>{t(message)}</p>}
    </form>
    <div aria-busy={loading}>
      <ul className={styles.list}>{items.map(item => {
        const name = item.displayName?.trim() || t("reader");
        const timestamp = typeof item.createdAt === "string" ? (/(?:Z|[+-]\d{2}:\d{2})$/.test(item.createdAt) ? item.createdAt : item.createdAt + "+06:00") : "";
        const date = new Date(timestamp);
        return <li key={item.id}>
          <div className={styles.meta}><span className={styles.avatar}>{item.avatarUrl ? <NewsImage src={item.avatarUrl} alt="" width={32} height={32} hideOnError /> : name.slice(0,1)}</span><strong>{name}</strong>{!Number.isNaN(date.getTime()) && <time dateTime={timestamp}>{new Intl.DateTimeFormat(locale, { dateStyle:"medium", timeStyle:"short", timeZone:"Asia/Dhaka" }).format(date)}</time>}</div>
          <p className={styles.body}>{item.body}</p>
        </li>;
      })}</ul>
      {loading && <p role="status">{t("loadingComments")}</p>}
      {loadError && <div role="alert"><p>{t("commentsCouldNotBeLoaded")}</p><button onClick={() => void load(retryCursor.current)} type="button">{t("tryAgain")}</button></div>}
      {!loading && !loadError && !items.length && <p>{t("noCommentsYetBeTheFirstToComment")}</p>}
      {!loading && !loadError && hasNext && <button type="button" onClick={() => void load(cursor || "")}>{t("moreComments")}</button>}
    </div>
  </section>;
}
