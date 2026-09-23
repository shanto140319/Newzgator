export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return;
    return url.href;
  } catch { return; }
}
export function imageUrl(value: unknown): string | undefined {
  const url = safeUrl(value);
  if (!url) return;
  const parsed = new URL(url);
  return parsed.protocol === "https:" && [
    "cdn.banglatribune.net",
    "cdn.bd-pratidin.com",
    "cdn.deshrupantor.net",
    "cdn.dhakapost.com",
    "cdn.ittefaqbd.com",
    "cdn.jugantor.com",
    "www.bd-pratidin.com",
    "samakal.com",
    "cdn.risingbd.com",
    "dailyinqilab.com",
    "ecdn.dhakatribune.net",
    "images.assettype.com",
    "images.dailyamardesh.com",
    "media.prothomalo.com",
    "www.dhakatimes24.com",
    "www.kalbela.com",
    "www.mzamin.com",
    "www.thedailystar.net",
  ].includes(parsed.hostname) ? url : undefined;
}
