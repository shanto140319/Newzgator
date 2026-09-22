const COOKIE = "news-reader";
const STORAGE_KEY = "news-reader-id";
const PATTERN = /^usr_[0-9a-f-]{36}$/;

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)news-reader=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return value && PATTERN.test(value) ? value : null;
}

function writeCookie(id: string) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

/** Stable per-browser reader id for X-User-Id. Creates one on first use. */
export function getUserId(): string {
  if (typeof window === "undefined") return "";
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage && PATTERN.test(fromStorage)) {
    if (readCookie() !== fromStorage) writeCookie(fromStorage);
    return fromStorage;
  }
  const fromCookie = readCookie();
  if (fromCookie) {
    localStorage.setItem(STORAGE_KEY, fromCookie);
    return fromCookie;
  }
  const id = "usr_" + crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  writeCookie(id);
  return id;
}
