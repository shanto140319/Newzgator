"use client";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { TrackedArticleLink } from "./tracked-article-link";
import { searchArticles, type SearchArticle } from "../lib/client-api";
import { NewsImage } from "./news-image";
import header from "./header.module.css";
import styles from "./search-modal.module.css";

export function SearchModal() {
  const t = useTranslations();
  const locale = useLocale();

  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [items, setItems] = useState<SearchArticle[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const previousOverflow = useRef("");
  useEffect(() => () => { controller.current?.abort(); if (dialog.current?.open) document.body.style.overflow = previousOverflow.current; }, []);
  function close() { controller.current?.abort(); dialog.current?.close(); document.body.style.overflow = previousOverflow.current; }
  async function run(q: string, nextPage: number) {
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    setSearched(q); setPage(nextPage); setLoading(true); setError(false); setItems([]); setHasNext(false);
    try {
      const result = await searchArticles(q, nextPage, request.signal);
      if (!request.signal.aborted) { setItems(result.items); setHasNext(result.hasNext); setTotal(result.total); }
    } catch { if (!request.signal.aborted) setError(true); }
    finally { if (!request.signal.aborted) setLoading(false); }
  }
  function submit(event: FormEvent) {
    event.preventDefault(); const q = query.trim(); if (!q) return;
    if (!dialog.current?.open) { previousOverflow.current = document.body.style.overflow; dialog.current?.showModal(); document.body.style.overflow = "hidden"; }
    void run(q, 0);
  }
  return <>
    <form className={header.search} role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor="site-search">{t("searchNews")}</label><span aria-hidden="true" className={header.searchIcon}>⌕</span>
      <input id="site-search" type="search" placeholder={t("searchNewsOrTopics")} value={query} onChange={e => setQuery(e.target.value)} maxLength={200} required />
      <button type="submit">{t("search")}</button>
    </form>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="search-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } }}>
      <div className={styles.top}><h2 id="search-title">{t("searchArticles")}</h2><button type="button" onClick={close} aria-label={t("closeSearch")}>✕</button></div>
      <form className={header.search} role="search" onSubmit={submit}><label className="sr-only" htmlFor="modal-search">{t("searchNews")}</label><input id="modal-search" type="search" value={query} onChange={e => setQuery(e.target.value)} maxLength={200} required /><button type="submit">{t("search")}</button></form>
      <div className={styles.results} aria-busy={loading}>
        {loading ? <p role="status">{t("searchingForNews")}</p> : error ? <div role="alert"><p>{t("searchIsUnavailablePleaseTryAgain")}</p><button type="button" onClick={() => void run(searched, page)}>{t("tryAgain")}</button></div> : <>
          <p role="status" className={styles.count}>{t("resultCount", { query: searched, count: total.toLocaleString(locale) })}</p>
          {!items.length && <p>{t("noArticlesFoundTryAnotherSearch")}</p>}
          <ul>{items.map(item => <li key={item.id}><TrackedArticleLink articleId={item.id} sourceSurface="SEARCH" href={`/article/${item.id}`} prefetch={false} onClick={close} className={styles.result}><div><span className={styles.count}>{locale === "en" ? item.publisherEn : item.publisher}</span><h3>{item.headline}</h3><p className={styles.summary}>{item.summary}</p></div>{item.mainImage && <div className={styles.photo}><NewsImage src={item.mainImage} alt="" fill sizes="100px" className="object-cover" /></div>}</TrackedArticleLink></li>)}</ul>
          {(page > 0 || hasNext) && <nav className={styles.pagination} aria-label={t("searchPagination")}><button type="button" disabled={page === 0} onClick={() => void run(searched, page - 1)}>{t("previousPage")}</button><span>{(page + 1).toLocaleString(locale)}</span><button type="button" disabled={!hasNext} onClick={() => void run(searched, page + 1)}>{t("nextPage")}</button></nav>}
        </>}
      </div>
    </dialog>
  </>;
}
