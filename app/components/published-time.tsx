"use client";
import { useLocale } from "next-intl";
import styles from "./cluster-news.module.css";

export function PublishedTime({ value }: { value?: string }) {
  const locale = useLocale();

  if (!value) return null;
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value + "+06:00";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return <time className={styles.published} dateTime={timestamp}>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(date)}</time>;
}
