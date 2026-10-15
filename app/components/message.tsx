"use client";
import { useLocale, useTranslations } from "next-intl";
import type { Category } from "../lib/articles";
import { localizedName } from "../lib/localized-name";

/** Interface text for server components that follows the in-place language switch; named values are localized too. */
export function Message({ id, values }: { id: string; values?: Record<string, string | number | Category> }) {
  const t = useTranslations();
  const locale = useLocale();
  return t(id, values && Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === "object" ? localizedName(value, locale) : value])));
}
