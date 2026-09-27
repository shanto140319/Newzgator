"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { searchArticles, type SearchArticle } from "../lib/client-api";
import { NewsImage } from "./news-image";
import header from "./header.module.css";
import styles from "./search-modal.module.css";

export function SearchModal() {
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
      <label className="sr-only" htmlFor="site-search">খবর খুঁজুন</label><span aria-hidden="true" className={header.searchIcon}>⌕</span>
      <input id="site-search" type="search" placeholder="খবর বা বিষয় খুঁজুন" value={query} onChange={e => setQuery(e.target.value)} maxLength={200} required />
      <button type="submit">খুঁজুন</button>
    </form>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="search-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } }}>
      <div className={styles.top}><h2 id="search-title">সংবাদ অনুসন্ধান</h2><button type="button" onClick={close} aria-label="অনুসন্ধান বন্ধ করুন">✕</button></div>
      <form className={header.search} role="search" onSubmit={submit}><label className="sr-only" htmlFor="modal-search">খবর খুঁজুন</label><input id="modal-search" type="search" value={query} onChange={e => setQuery(e.target.value)} maxLength={200} required /><button type="submit">খুঁজুন</button></form>
      <div className={styles.results} aria-busy={loading}>
        {loading ? <p role="status">খবর খোঁজা হচ্ছে…</p> : error ? <div role="alert"><p>অনুসন্ধান করা যাচ্ছে না। আবার চেষ্টা করুন।</p><button type="button" onClick={() => void run(searched, page)}>আবার চেষ্টা করুন</button></div> : <>
          <p role="status" className={styles.count}>“{searched}” — {total.toLocaleString("bn-BD")}টি ফলাফল</p>
          {!items.length && <p>কোনো সংবাদ পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</p>}
          <ul>{items.map(item => <li key={item.id}><Link href={`/article/${item.id}`} prefetch={false} onClick={close} className={styles.result}><div><span className={styles.count}>{item.publisher}</span><h3>{item.headline}</h3><p className={styles.summary}>{item.summary}</p></div>{item.mainImage && <div className={styles.photo}><NewsImage src={item.mainImage} alt="" fill sizes="100px" className="object-cover" /></div>}</Link></li>)}</ul>
          {(page > 0 || hasNext) && <nav className={styles.pagination} aria-label="অনুসন্ধানের পৃষ্ঠা"><button type="button" disabled={page === 0} onClick={() => void run(searched, page - 1)}>আগের পৃষ্ঠা</button><span>{(page + 1).toLocaleString("bn-BD")}</span><button type="button" disabled={!hasNext} onClick={() => void run(searched, page + 1)}>পরের পৃষ্ঠা</button></nav>}
        </>}
      </div>
    </dialog>
  </>;
}
