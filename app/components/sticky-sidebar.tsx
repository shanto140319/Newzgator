"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function StickySidebar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sidebar = ref.current;
    if (!sidebar) return;
    const measure = () => sidebar.style.setProperty("--sidebar-height", sidebar.offsetHeight + "px");
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);
  return <aside ref={ref} aria-label="সংবাদ আবিষ্কার" className="discovery-sidebar">{children}</aside>;
}
