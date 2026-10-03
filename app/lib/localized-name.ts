/** Prefer the API's translated label, falling back to its stable name. */
export function localizedName(item: { name: string; nameBn?: string | null; nameEn?: string | null } | undefined, locale: string, fallback = "") {
  if (!item) return fallback;
  return (locale === "en" ? item.nameEn : item.nameBn)?.trim() || item.name;
}
