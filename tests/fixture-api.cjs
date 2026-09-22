/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("node:http");
const categories = [{ name: "sports", nameBn: "খেলাধুলা", nameEn: "Sports" }, { name: "technology", nameBn: "প্রযুক্তি", nameEn: "Technology" }];
const encodeCursor = offset => Buffer.from("1789573187524::" + offset).toString("base64url");
function article(id, category = "sports") { return {
  id, headline: category + " সংবাদ " + id, category, summary: "এটি একটি পরীক্ষামূলক সংবাদের সারসংক্ষেপ। ".repeat(8),
  publishedAt: "2026-09-15T10:00:00", mainImage: id === 3 ? "https://www.kalbela.com/test-image.webp" : null, clusterId: id, isBookmarked: false,
  portal: { id: 1, name: "Test source", nameBn: "সংবাদ উৎস", nameEn: "Test source", logo: null, url: "javascript:alert(1)" },
  articleReactions: { articleId: id, likeCount: 1, dislikeCount: 0, importantCount: 0, inaccurateCount: 0, currentUserReaction: null },
}; }
const readers = new Map();
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  res.setHeader("Content-Type", "application/json");
  const userId = req.headers["x-user-id"] || "anonymous";
  if (!readers.has(userId)) readers.set(userId, { saved: new Set(), reactions: new Map() });
  const reader = readers.get(userId);
  const personalize = item => {
    const active = reader.reactions.get(item.id) ?? null;
    return { ...item, isBookmarked: reader.saved.has(item.id), articleReactions: { ...item.articleReactions, likeCount: 1 + (active === "LIKE" ? 1 : 0), dislikeCount: active === "DISLIKE" ? 1 : 0, importantCount: active === "IMPORTANT" ? 1 : 0, inaccurateCount: active === "INACCURATE" ? 1 : 0, currentUserReaction: active } };
  };
  if (req.method === "POST") {
    let raw = ""; for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || "{}");
    if (url.pathname.endsWith("/reactions")) {
      const id = Number(url.pathname.split("/").at(-2));
      const activeReaction = reader.reactions.get(id) === body.reaction ? null : body.reaction;
      reader.reactions.set(id, activeReaction);
      return res.end(JSON.stringify({ articleId: id, activeReaction, isReacted: !!activeReaction }));
    }
    if (url.pathname === "/api/v1/bookmarks") { reader.saved.add(body.articleId); res.writeHead(201); return res.end(JSON.stringify({ success: true })); }
  }
  if (req.method === "DELETE" && url.pathname.startsWith("/api/v1/bookmarks/")) { reader.saved.delete(Number(url.pathname.split("/").pop())); return res.end(JSON.stringify({ success: true })); }
  let data;
  if (url.pathname === "/api/v1/bookmarks") {
    const offset = Number(url.searchParams.get("cursor") || 0);
    const ids = [...reader.saved].reverse();
    const entries = ids.slice(offset, offset + 20).map(id => ({ bookmarkId: id, bookmarkedAt: "2026-09-22T00:00:00Z", article: { ...personalize(article(id)), summary: null, articleReactions: null } }));
    return res.end(JSON.stringify({ success: true, data: { items: entries, nextCursor: offset + 20 < ids.length ? String(offset + 20) : null, hasNext: offset + 20 < ids.length, size: entries.length } }));
  }
  if (url.pathname === "/api/v1/categories") data = categories;
  else if (url.pathname === "/api/v1/portals") data = [1, 2].map(id => ({ ...article(1).portal, id, nameBn: id === 1 ? "সংবাদ উৎস" : "দ্বিতীয় উৎস" }));
  else if (url.pathname === "/api/v1/trending/trending") data = [101, 102, 103].map((id, i) => ({ clusterId: id, topicTitle: "আলোচিত সংবাদ " + id, totalArticles: 8 - i, leadArticle: article(id) }));
  else if (url.pathname === "/api/v1/articles") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 20, 1), 50);
    const cursor = url.searchParams.get("cursor");
    const decoded = cursor ? Buffer.from(cursor, "base64url").toString("utf8") : "1789573187524::0";
    const match = /^1789573187524::(\d+)$/.exec(decoded);
    const offset = match ? Number(match[1]) : NaN;
    if (url.searchParams.get("cursor") === "fail") { res.writeHead(500); return res.end("{}"); }
    if (!Number.isSafeInteger(offset)) { res.writeHead(400); return res.end("{}"); }
    const category = url.searchParams.get("category") || "sports";
    data = { items: Array.from({ length: limit }, (_, i) => { const item = article(offset + i + 1, category); const portalId = Number(url.searchParams.get("portalId")) || 1; return { ...item, portal: { ...item.portal, id: portalId, nameBn: portalId === 2 ? "দ্বিতীয় উৎস" : "সংবাদ উৎস" } }; }), hasNext: offset < limit * 3, nextCursor: offset < limit * 3 ? encodeCursor(offset + limit) : null, size: limit };
  } else if (/\/articles\/\d+\/related$/.test(url.pathname)) {
    const id = Number(url.pathname.split("/").at(-2));
    if (id === 7) { res.writeHead(503); return res.end("{}"); }
    data = id === 8 ? [] : [21, 22, 23].map(relatedId => {
      const item = article(relatedId);
      return { ...item, portal: undefined, portalName: "সংবাদ উৎস", portalLogo: null };
    });
    if (id === 6) { setTimeout(() => res.end(JSON.stringify({ success: true, data })), 1500); return; }
  } else {
    const id = Number(url.pathname.split("/").pop());
    if (!id || id === 999) { res.writeHead(404); return res.end("{}"); }
    if (id === 500) { res.writeHead(500); return res.end("{}"); }
    data = { ...article(id), details: "সম্পূর্ণ সংবাদ। <script>alert('unsafe')</script> ".repeat(20), url: "javascript:alert(1)" };
  }
  if (url.pathname === "/api/v1/articles") data.items = data.items.map(personalize);
  else if (/\/articles\/\d+$/.test(url.pathname)) data = personalize(data);
  const send = () => res.end(JSON.stringify({ success: true, data }));
  if (url.pathname === "/api/v1/articles/4" || (url.pathname === "/api/v1/articles" && url.searchParams.get("category") === "technology")) setTimeout(send, 1500); else send();
}).listen(4100);
