"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function NewsImage({ src, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const url = typeof src === "string" ? src : "";
  if (failed === url) {
    return <span role="img" aria-label={alt || "ছবি পাওয়া যায়নি"} className="absolute inset-0 grid place-items-center bg-slate-200 p-2 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 reading:bg-[#dfd3bd] reading:text-[#514438]">{alt || "ছবি পাওয়া যায়নি"}</span>;
  }
  // This publisher returns 403 HTML to server-side image requests.
  const direct = url.startsWith("https://www.kalbela.com/") || new URL(url, "http://localhost").pathname.endsWith(".svg");
  return <Image {...props} src={src} alt={alt} unoptimized={direct || props.unoptimized} referrerPolicy="no-referrer" onError={() => setFailed(url)} />;
}
