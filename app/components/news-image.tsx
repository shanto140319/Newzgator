"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function NewsImage({ src, alt, hideOnError = false, ...props }: ImageProps & { hideOnError?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const url = typeof src === "string" ? src : "";
  if (failed === url) {
    if (hideOnError) return null;
    return <span role="img" aria-label={alt || "ছবি পাওয়া যায়নি"} style={props.fill ? undefined : { width: props.width, height: props.height }} className={`${props.fill ? "absolute inset-0" : "inline-grid"} grid place-items-center bg-slate-200 p-2 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 reading:bg-[#dfd3bd] reading:text-[#514438]`}>{alt || "ছবি পাওয়া যায়নি"}</span>;
  }
  // Some publishers reject optimizer requests; load their images directly.
  const parsed = new URL(url, "http://localhost");
  const direct = ["www.kalbela.com", "www.bd-pratidin.com", "cdn.risingbd.com"].includes(parsed.hostname) || parsed.pathname.endsWith(".svg");
  return <Image {...props} src={src} alt={alt} unoptimized={direct || props.unoptimized} referrerPolicy="no-referrer" onError={() => setFailed(url)} />;
}
