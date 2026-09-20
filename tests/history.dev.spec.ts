import { test, expect } from "@playwright/test";

test("development Strict Mode restores all batches and the opaque cursor without refetching", async ({ page }) => {
  const pagination: string[] = [];
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/api/articles") pagination.push(request.url());
  });
  await page.route("**/*", route => route.request().resourceType() === "image" ? route.abort() : route.continue());
  await page.goto("/");
  await expect(page.locator("[data-article-feed]")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.getByRole("button", { name: "আরও খবর দেখুন" })).toHaveCount(0);
  for (const count of [40, 60]) {
    await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
    await expect(page.locator("main article")).toHaveCount(count);
  }
  const link = page.locator('main article a[href^="/article/"]').nth(25);
  // Center the link so Playwright doesn't itself scroll it again when clicking.
  await link.evaluate(element => element.scrollIntoView({ block: "center" }));

  const detailHref = await link.getAttribute("href");
  const cachedCursor = await page.evaluate(() => JSON.parse(sessionStorage.getItem("news-feed-render-v3:/")!).cursor);
  expect(cachedCursor).toEqual(expect.any(String));
  expect(pagination).toHaveLength(2);
  // Returning must work even if the API becomes unavailable.
  await page.route("**/api/articles?**", route => route.abort());
  // Capture the actual click position: browser automation may scroll the link
  // into view after an earlier measurement but before dispatching the click.
  await page.evaluate(() => document.addEventListener("click", () => {
    sessionStorage.setItem("test:leaving-scroll", String(scrollY));
  }, { capture: true, once: true }));
  await link.click();
  await expect(page).toHaveURL(new RegExp(detailHref! + "$"));
  await expect(page.locator("main article h1")).toBeVisible();
  const y = await page.evaluate(() => Number(sessionStorage.getItem("test:leaving-scroll")));
  await page.goBack();
  await expect(page.locator("[data-article-feed]")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("main article")).toHaveCount(60);
  await expect.poll(() => page.evaluate(savedY => Math.abs(scrollY - savedY), y)).toBeLessThan(5);
  await expect.poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem("news-feed-render-v3:/")!).items.length)).toBe(60);
  await link.evaluate(element => element.scrollIntoView({ block: "center" }));

  // Capture the actual click position: browser automation may scroll the link
  // into view after an earlier measurement but before dispatching the click.
  await page.evaluate(() => document.addEventListener("click", () => {
    sessionStorage.setItem("test:leaving-scroll", String(scrollY));
  }, { capture: true, once: true }));
  await link.click();
  await expect(page.locator("main article h1")).toBeVisible();
  const returnY = await page.evaluate(() => Number(sessionStorage.getItem("test:leaving-scroll")));
  await page.getByRole("link", { name: "← সব খবরে ফিরুন" }).click();
  await expect(page.locator("[data-article-feed]")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("main article")).toHaveCount(60);
  await expect.poll(() => page.evaluate(savedY => Math.abs(scrollY - savedY), returnY)).toBeLessThan(5);
  const restored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("news-feed-render-v3:/")!));
  expect(restored.items).toHaveLength(60);
  expect(restored.cursor).toBe(cachedCursor);
  expect(pagination).toHaveLength(2);
});
