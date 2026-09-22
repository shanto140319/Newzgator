import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.kalbela.com/test-image.webp", route => route.abort());
});

test("pagination works and back/reload show a fresh first page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("main article")).toHaveCount(20);
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
  const link = page.locator('a[href="/article/26"]');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page.locator("h1")).toContainText("26");
  await page.goBack();
  await expect(page.locator("main article")).toHaveCount(20);
  await page.goForward();
  await expect(page.locator("h1")).toContainText("26");
  await page.goBack();
  await expect(page.locator("main article")).toHaveCount(20);
  await page.reload();
  await expect(page.locator("main article")).toHaveCount(20);
  expect(errors).toEqual([]);
});

test("category navigation isolates pagination per route", async ({ page }) => {
  await page.goto("/?category=sports");
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
  await page.getByRole("navigation").getByRole("link", { name: "প্রযুক্তি", exact: true }).click();
  await expect(page).toHaveURL(/category=technology/);
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.locator('nav [aria-current="page"]')).toHaveText("প্রযুক্তি");
  await expect(page.locator("main article").first()).toContainText("technology");
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
  await expect(page.locator("main article").last()).toContainText("technology");
  await page.goBack();
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.locator("main article").first()).toContainText("sports");
});

test("details are server rendered with SEO metadata and safe content", async ({ browser, request }) => {
  const response = await request.get("/article/2");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain("সম্পূর্ণ সংবাদ");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3100/article/2");
  await expect(page.locator("h1")).toContainText("2");
  await expect(page).toHaveTitle(/2 — নিউজগেটর/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3100/article/2");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator("main article")).toContainText("<script>alert('unsafe')</script>");
  await context.close();
});

test("invalid IDs and missing articles are rejected", async ({ request }) => {
  for (const id of ["bad", "-1", "0", "999", "9007199254740992"]) {
    const response = await request.get("/article/" + id, { headers: { "User-Agent": "Googlebot" } });
    const html = await response.text();
    expect(response.status() === 404 || html.includes('content="noindex"')).toBeTruthy();
  }
  expect((await request.get("http://localhost:4100/api/v1/articles?cursor=fail")).status()).toBe(500);
});

test("pagination failures can be retried without losing articles", async ({ page }) => {
  await page.goto("/");
  await page.route("**/api/v1/articles?**", route => route.fulfill({ status: 502, body: "{}" }));
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main").getByRole("alert")).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(20);
  await page.unroute("**/api/v1/articles?**");
  await page.getByRole("button", { name: "আবার চেষ্টা করুন" }).click();
  await expect(page.locator("main article")).toHaveCount(40);
});

test("list and details have no serious accessibility violations", async ({ page }) => {
  for (const route of ["/", "/article/2"]) {
    await page.goto(route);
    await expect(page.locator("main article").first()).toBeVisible();
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter(v => ["critical", "serious"].includes(v.impact ?? "")).map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ html: n.html, summary: n.failureSummary })) }))).toEqual([]);
  }
});


test("return-home link loads a fresh feed even when storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage blocked"); };
    Storage.prototype.setItem = () => { throw new Error("Storage blocked"); };
  });
  await page.goto("/");
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
  const link = page.locator('a[href="/article/26"]');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page.locator("h1")).toContainText("26");
  await page.getByRole("link", { name: "← সব খবরে ফিরুন" }).click();
  await expect(page.locator("main article")).toHaveCount(20);
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
});

test("scroll pagination works without IntersectionObserver or a Load More button", async ({ page }) => {
  await page.addInitScript(() => { delete (window as unknown as Record<string, unknown>).IntersectionObserver; });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "আরও খবর দেখুন" })).toHaveCount(0);
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
});


test("publisher images bypass the failing optimizer and fall back on errors", async ({ page }) => {
  const images: string[] = [];
  page.on("request", request => { if (request.resourceType() === "image") images.push(request.url()); });
  await page.route("https://www.kalbela.com/test-image.webp", route => route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") }));
  await page.goto("/article/3");
  await expect.poll(() => page.locator('img[src="https://www.kalbela.com/test-image.webp"]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(images.some(url => url.includes("/_next/image") && url.includes("kalbela"))).toBeFalsy();
  await page.unroute("https://www.kalbela.com/test-image.webp");
  await page.route("https://www.kalbela.com/test-image.webp", route => route.abort());
  await page.reload();
  await expect(page.locator('main span[role="img"]').filter({ hasText: "sports সংবাদ 3" })).toBeVisible();
});

test("detail loading skeleton matches the article layout", async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href="/article/4"]').click();
  await expect(page.locator('[data-page-skeleton="details"]')).toBeVisible();
  await page.screenshot({ path: "test-results/details-loading.png", fullPage: true });
  await expect(page.locator("h1")).toContainText("4");
});


test("home skeleton and mobile pagination preserve the responsive layout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "প্রযুক্তি", exact: true }).click();
  await expect(page.getByRole("status", { name: "সংবাদ লোড হচ্ছে", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/home-loading.png", fullPage: true });
  await expect(page.locator("main article")).toHaveCount(20);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
  const link = page.locator('a[href="/article/26"]');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page.locator("h1")).toContainText("26");
  await page.goBack();
  await expect(page.locator("main article")).toHaveCount(20);
  await page.screenshot({ path: "test-results/mobile-feed.png" });
});

for (const theme of ["dark", "reading"]) {
  test(theme + " theme has no serious accessibility violations", async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem("theme", value), theme);
    for (const route of ["/", "/article/2"]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations.filter(v => ["critical", "serious"].includes(v.impact ?? "")).map(v => ({ id: v.id, nodes: v.nodes.map(n => n.failureSummary) }))).toEqual([]);
    }
  });
}


for (const nextCursor of ["same", "duplicate-page"]) {
  test("pagination pauses on a non-progressing response: " + nextCursor, async ({ page, request }) => {
    const initial = await (await request.get("http://localhost:4100/api/v1/articles?limit=20")).json();
    let calls = 0;
    await page.route("**/api/v1/articles?**", route => {
      calls += 1;
      return route.fulfill({ json: { success: true, data: { ...initial.data, items: nextCursor === "same" ? initial.data.items.map((item: { id: number }) => ({ ...item, id: item.id + 20 })) : initial.data.items, nextCursor: nextCursor === "same" ? initial.data.nextCursor : nextCursor, hasNext: true } } });
    });
    await page.goto("/");
    await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
    await expect(page.locator("main").getByRole("alert")).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(20);
    await page.waitForTimeout(350);
    expect(calls).toBe(1);
  });
}


test("legacy detail bookmarks redirect to the canonical path", async ({ request }) => {
  const response = await request.get("/article?id=2", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("http://localhost:3100/article/2");
});


test("related stories stream independently and sit beside the article", async ({ page }) => {
  await page.goto("/article/6", { waitUntil: "commit" });
  await expect(page.locator("h1")).toContainText("6");
  const sidebar = page.getByRole("complementary");
  await expect(sidebar.getByRole("status")).toBeVisible();
  await expect(sidebar.getByRole("link")).toHaveCount(3);
  await expect(sidebar.getByText("সংবাদ উৎস", { exact: true })).toHaveCount(3);
  const articleBox = await page.locator("main article").boundingBox();
  const sidebarBox = await sidebar.boundingBox();
  expect(sidebarBox!.x).toBeGreaterThan(articleBox!.x + articleBox!.width);
  await page.screenshot({ path: "test-results/details-sidebar-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await sidebar.boundingBox())!.y).toBeGreaterThan((await page.locator("main article").boundingBox())!.y + (await page.locator("main article").boundingBox())!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: "test-results/details-sidebar-mobile.png", fullPage: true });
  await sidebar.locator('a[href="/article/21"]').click();
  await expect(page).toHaveURL(/\/article\/21$/);
  await expect(page.locator("h1")).toContainText("21");
});

for (const [id, message] of [[7, "সম্পর্কিত সংবাদ এখন আনা যাচ্ছে না। একটু পর আবার দেখুন।"], [8, "এই মুহূর্তে সম্পর্কিত সংবাদ পাওয়া যায়নি।"]] as const) {
  test("related endpoint state does not hide the article: " + id, async ({ page }) => {
    await page.goto("/article/" + id);
    await expect(page.locator("h1")).toContainText(String(id));
    await expect(page.getByRole("complementary").getByText(message)).toBeVisible();
    await expect(page.locator("main article")).toBeVisible();
  });
}


test("publisher filtering keeps cursor pagination and category history isolated", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", req => { if (new URL(req.url()).pathname === "/api/v1/articles") requests.push(req.url()); });
  await page.goto("/?category=sports");
  await page.getByLabel("সংবাদমাধ্যম বাছাই করুন").selectOption("2");
  await expect(page).toHaveURL(/category=sports&portalId=2/);
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.locator("main article").first()).toContainText("দ্বিতীয় উৎস");
  await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
  await expect(page.locator("main article")).toHaveCount(40);
  expect(requests.some(url => url.includes("portalId=2") && url.includes("cursor="))).toBeTruthy();
  const link = page.locator('a[href="/article/26"]');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page.locator("h1")).toContainText("26");
  await page.goBack();
  await expect(page).toHaveURL(/category=sports&portalId=2/);
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.locator("main article").first()).toContainText("দ্বিতীয় উৎস");
  await page.getByLabel("সংবাদমাধ্যম বাছাই করুন").selectOption("");
  await expect(page).toHaveURL(/\/\?category=sports$/);
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.locator("main article").first()).toContainText("সংবাদ উৎস");
});

test("homepage discovery matches the desktop and mobile layout", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "সংবাদ আবিষ্কার" });
  await expect(sidebar.getByRole("heading", { name: "আলোচনায়" })).toBeVisible();
  await expect(sidebar.getByText("৮টি প্রতিবেদন", { exact: false })).toBeVisible();
  expect((await sidebar.boundingBox())!.x).toBeGreaterThan((await page.locator("[data-article-feed]").boundingBox())!.x);
  await page.screenshot({ path: "test-results/home-redesign-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await sidebar.boundingBox())!.y).toBeLessThan((await page.locator("[data-article-feed]").boundingBox())!.y);
  await expect(page.getByLabel("সংবাদমাধ্যম বাছাই করুন")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: "test-results/home-redesign-mobile.png" });
  await sidebar.locator('a[href="/article/101"]').click();
  await expect(page.locator("h1")).toContainText("101");
});


test("persistent sidebar stays reachable and summaries remain complete", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "সংবাদ আবিষ্কার" });
  await expect(sidebar.getByRole("heading", { name: "আলোচনায়" })).toBeVisible();
  await page.evaluate(() => scrollTo(0, 2200));
  const first = await sidebar.boundingBox();
  await page.evaluate(() => scrollBy(0, 700));
  const second = await sidebar.boundingBox();
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);
  await expect(sidebar.getByRole("link", { name: "উপরে যান ↑" })).toBeInViewport();
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.evaluate(() => scrollBy(0, 700));
  const short = await sidebar.boundingBox();
  expect(short!.y + short!.height).toBeLessThanOrEqual(500);
  await expect(sidebar.getByRole("link", { name: "উপরে যান ↑" })).toBeInViewport();
  await sidebar.getByRole("link", { name: "উপরে যান ↑" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const summary = page.locator(".story-summary").nth(1);
    expect(await summary.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBeTruthy();
    expect(await summary.evaluate(el => getComputedStyle(el).webkitLineClamp)).toBe("none");
    await expect(page.locator("main article").first().getByRole("button", { name: /পরে পড়ুন/ })).toBeEnabled();
    await expect(page.locator("main article").first().getByRole("group", { name: "পাঠকের প্রতিক্রিয়া" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
