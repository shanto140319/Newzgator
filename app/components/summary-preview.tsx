"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./summary-preview.module.css";

export function SummaryPreview({ summary, headline, className = "" }: { summary: string; headline: string; className?: string }) {
  const id = useId();
  const button = useRef<HTMLParagraphElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  function cancelClose() { if (timer.current) clearTimeout(timer.current); }
  function close() { cancelClose(); panel.current?.hidePopover(); setOpen(false); }
  function show() {
    cancelClose();
    const target = panel.current, trigger = button.current;
    if (!target || !trigger) return;
    target.showPopover();
    const rect = trigger.getBoundingClientRect();
    const width = target.getBoundingClientRect().width;
    const below = innerHeight - rect.bottom - 20;
    const above = rect.top - 20;
    const useBelow = below >= Math.min(320, above);
    target.style.maxHeight = `${Math.max(80, useBelow ? below : above)}px`;
    target.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
    target.style.top = `${useBelow ? rect.bottom + 8 : Math.max(12, rect.top - target.getBoundingClientRect().height - 8)}px`;
    setOpen(true);
  }
  // The summary stays open while the pointer is anywhere on its story card or on the panel itself.
  function scheduleClose() {
    cancelClose();
    timer.current = setTimeout(() => {
      if (button.current?.closest("article")?.matches(":hover") || panel.current?.matches(":hover")) return;
      close();
    }, 180);
  }
  const scheduleCloseRef = useRef(scheduleClose);
  useEffect(() => { scheduleCloseRef.current = scheduleClose; });
  useEffect(() => {
    if (!open) return;
    const card = button.current?.closest("article");
    const leaveCard = () => scheduleCloseRef.current();
    card?.addEventListener("mouseleave", leaveCard);
    const dismiss = (event: Event) => {
      // Only scrolls that move the summary matter; the auto-scrolling breaking rail must not close it.
      if (event.type === "scroll" && !(event.target === document || (event.target as Node).contains(button.current))) return;
      panel.current?.hidePopover(); setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(event); };
    const outside = (event: PointerEvent) => { if (!panel.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) dismiss(event); };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape); window.addEventListener("resize", dismiss); window.addEventListener("scroll", dismiss, true);
    return () => { card?.removeEventListener("mouseleave", leaveCard); window.removeEventListener("pointerdown", outside); window.removeEventListener("keydown", escape); window.removeEventListener("resize", dismiss); window.removeEventListener("scroll", dismiss, true); };
  }, [open]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <>
    <p ref={button} tabIndex={0} className={className} aria-describedby={open ? id : undefined} onMouseEnter={show} onMouseLeave={scheduleClose} onFocus={show} onBlur={scheduleClose} onClick={show}>{summary}</p>
    <div id={id} ref={panel} popover="manual" role="tooltip" className={styles.panel} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <h3>{headline}</h3><p>{summary}</p>
    </div>
  </>;
}
