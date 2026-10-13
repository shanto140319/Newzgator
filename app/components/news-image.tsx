"use client";
import { useTranslations } from "next-intl";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function NewsImage({ src, alt, hideOnError = false, ...props }: ImageProps & { hideOnError?: boolean }) {
  const t = useTranslations();

  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const url = typeof src === "string" ? src : "";
  if (failed === url) {
    if (hideOnError) return null;
    return <span role="img" aria-label={alt || t("imageUnavailable")} style={props.fill ? undefined : { width: props.width, height: props.height }} className={`${props.fill ? "absolute inset-0" : "inline-grid"} grid place-items-center bg-slate-200 p-2 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 reading:bg-[#dfd3bd] reading:text-[#514438]`}>{alt || t("imageUnavailable")}</span>;
  }
  // Until the file arrives the image box pulses like the page skeletons.
  const placeholder = loaded === url ? "" : " bg-slate-200 motion-safe:animate-pulse dark:bg-white/10 reading:bg-[#dfd3bd]";
  return <Image {...props} src={src} alt={alt} className={(props.className ?? "") + placeholder} referrerPolicy="no-referrer" onLoad={() => setLoaded(url)} onError={() => setFailed(url)} />;
}
