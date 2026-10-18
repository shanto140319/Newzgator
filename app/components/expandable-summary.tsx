"use client";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./expandable-summary.module.css";

export function ExpandableSummary({ summary, details, className = "" }: { summary: string; details?: ReactNode; className?: string }) {
  const t = useTranslations();
  const id = useId();
  const text = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  // Only offer "show more" when the fixed-height summary actually hides text.
  useEffect(() => {
    const el = text.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [summary]);
  // Expanding keeps the card's height and lets the full summary scroll inside it.
  function toggle() {
    if (expanded && text.current) text.current.scrollTop = 0;
    setExpanded(!expanded);
  }
  return <div className={styles.wrap}>
    <p id={id} ref={text} tabIndex={expanded ? 0 : undefined} className={`${className} ${styles.text}`} data-expanded={expanded || undefined}>{summary}</p>
    {(overflowing || details) && <div className={styles.toggleRow} data-expanded={expanded || !overflowing || undefined}>
      {overflowing && <button type="button" className={styles.toggle} aria-expanded={expanded} aria-controls={id} onClick={toggle}>
        {expanded ? t("showLess") : t("showMore")}
      </button>}
      {details}
    </div>}
  </div>;
}
