"use client";

import { useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./cluster-news.module.css";

export function BreakingRail({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  function scroll(direction: number) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * .8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  return <>
    <div className={styles.railControls}>
      <button type="button" aria-label={t("previousBreaking")} aria-controls="breaking-rail" onClick={() => scroll(-1)}>←</button>
      <button type="button" aria-label={t("nextBreaking")} aria-controls="breaking-rail" onClick={() => scroll(1)}>→</button>
    </div>
    <div ref={rail} id="breaking-rail" className={styles.breakingRail} tabIndex={0} role="region" aria-label={t("breakingScroll")}>{children}</div>
  </>;
}
