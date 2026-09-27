import { imageHosts } from "./image-hosts";

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return;
    return url.href;
  } catch {
    return;
  }
}
export function imageUrl(value: unknown): string | undefined {
  const url = safeUrl(value);
  if (!url) return;
  const parsed = new URL(url);
  // The publisher redirects legacy .com image URLs to .net.
  if (parsed.hostname === "www.bhorerkagoj.com") parsed.hostname = "www.bhorerkagoj.net";
  return parsed.protocol === "https:" && imageHosts.includes(parsed.hostname) ? parsed.href : undefined;
}
