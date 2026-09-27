"use client";

import type { MouseEvent, ReactNode, WheelEvent } from "react";

export function CategoryScroll({ className, children }: { className: string; children: ReactNode }) {
  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.currentTarget.scrollLeft += event.deltaY;
    event.preventDefault();
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest("a");
    if (link) link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return <div className={className} onWheel={handleWheel} onClick={handleClick}>{children}</div>;
}
