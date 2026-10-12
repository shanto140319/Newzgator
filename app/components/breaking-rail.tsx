"use client";

import { useTranslations } from "next-intl";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./cluster-news.module.css";

const AUTO_SCROLL_MS = 2000;

function measure(element: HTMLElement, count: number) {
  const first = element.firstElementChild as HTMLElement | null;
  if (!first) return null;
  const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
  const card = first.offsetWidth + gap;
  return { gap, card, set: card * count };
}

// The rail holds the stories followed by identical copies, so jumping by exactly one set is invisible.
function step(
  element: HTMLElement,
  count: number,
  direction: number,
  page: boolean,
  smooth: boolean,
) {
  const size = measure(element, count);
  if (!size) return;
  const distance = page
    ? Math.max(1, Math.floor(element.clientWidth / size.card)) * size.card
    : size.card;
  if (element.children.length > count) {
    if (direction > 0 && element.scrollLeft >= size.set)
      element.scrollLeft -= size.set;
    else if (direction < 0 && element.scrollLeft < distance)
      element.scrollLeft += size.set;
  }
  element.scrollBy({
    left: direction * distance,
    behavior: smooth ? "smooth" : "auto",
  });
}

export function BreakingRail({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const count = Children.count(children);
  const [copies, setCopies] = useState(1);
  function scroll(direction: number) {
    const element = rail.current;
    if (!element) return;
    step(
      element,
      count,
      direction,
      true,
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const size = measure(element, count);
      if (!size) return;
      // Loop only when the stories overflow; keep enough copies that a full step never hits the end.
      const overflows = size.set - size.gap > element.clientWidth;
      setCopies(
        overflows
          ? 1 + Math.ceil((2 * element.clientWidth + size.card) / size.set)
          : 1,
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [count]);
  useEffect(() => {
    const timer = setInterval(() => {
      const element = rail.current;
      if (
        !element ||
        document.hidden ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      if (
        element.children.length <= count ||
        element.parentElement?.matches(":hover, :focus-within")
      )
        return;
      step(element, count, 1, false, true);
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [count]);
  return (
    <>
      <div className={styles.railControls}>
        <button
          type="button"
          aria-label={t("previousBreaking")}
          aria-controls="breaking-rail"
          onClick={() => scroll(-1)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={t("nextBreaking")}
          aria-controls="breaking-rail"
          onClick={() => scroll(1)}
        >
          →
        </button>
      </div>
      <div
        ref={rail}
        id="breaking-rail"
        className={styles.breakingRail}
        tabIndex={0}
        role="region"
        aria-label={t("breakingScroll")}
      >
        {children}
        {Array.from({ length: copies - 1 }, (_, index) => (
          <div key={index} style={{ display: "contents" }}>
            {children}
          </div>
        ))}
      </div>
    </>
  );
}
