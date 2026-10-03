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
  function scheduleClose() { cancelClose(); timer.current = setTimeout(close, 180); }
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: Event) => { if (event.type === "scroll" && panel.current?.contains(event.target as Node)) return; panel.current?.hidePopover(); setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(event); };
    const outside = (event: PointerEvent) => { if (!panel.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) dismiss(event); };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape); window.addEventListener("resize", dismiss); window.addEventListener("scroll", dismiss, true);
    return () => { window.removeEventListener("pointerdown", outside); window.removeEventListener("keydown", escape); window.removeEventListener("resize", dismiss); window.removeEventListener("scroll", dismiss, true); };
  }, [open]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <>
    <p ref={button} tabIndex={0} className={className} aria-describedby={open ? id : undefined} onMouseEnter={show} onMouseLeave={scheduleClose} onFocus={show} onBlur={scheduleClose} onClick={show}>{summary}</p>
    <div id={id} ref={panel} popover="manual" role="tooltip" className={styles.panel} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <h3>{headline}</h3><p>{summary}</p>
    </div>
  </>;
}
