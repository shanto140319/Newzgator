import { test, expect } from "@playwright/test";

test("development feed paginates without restoring a session cache", async ({ page }) => {
  const pagination: string[] = [];
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/api/v1/articles") pagination.push(request.url());
  });
  await page.route("**/*", route => route.request().resourceType() === "image" ? route.abort() : route.continue());
  await page.goto("/");
  await expect(page.locator("[data-article-feed]")).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.getByRole("button", { name: "আরও খবর দেখুন" })).toHaveCount(0);
  for (const count of [40, 60]) {
    await page.locator("[data-feed-sentinel]").scrollIntoViewIfNeeded();
    await expect(page.locator("main article")).toHaveCount(count);
  }
  const link = page.locator('main article a[href^="/article/"]').nth(25);
  await link.evaluate(element => element.scrollIntoView({ block: "center" }));
  const detailHref = await link.getAttribute("href");
  expect(await page.evaluate(() => sessionStorage.getItem("news-feed-render-v3:/"))).toBeNull();
  expect(pagination).toHaveLength(2);
  await link.click();
  await expect(page).toHaveURL(new RegExp(detailHref! + "$"));
  await expect(page.locator("main article h1")).toBeVisible();
  await page.goBack();
  await expect(page.locator("main article")).toHaveCount(20);
  await page.goto("/article/2");
  await page.getByRole("link", { name: "← সব খবরে ফিরুন" }).click();
  await expect(page.locator("main article")).toHaveCount(20);
  expect(await page.evaluate(() =>
    Object.keys(sessionStorage).some(key => key.startsWith("news-feed-render")),
  )).toBeFalsy();
});
