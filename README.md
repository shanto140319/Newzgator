# Newzgator

Bengali news reader built with Next.js App Router.

## Run

Copy .env.example to .env.local and configure NEXT_PUBLIC_ARTICLE_API_BASE_URL, ARTICLE_API_BASE_URL, and SITE_URL.
Run npm install, then npm run dev. Production: npm run build followed by npm start.

## Data and navigation

The API origin is https://newzgator-api.onrender.com. Lists use /api/v1/articles?limit=20 and details use /api/v1/articles/{id}. NEXT_PUBLIC_ARTICLE_API_BASE_URL is used by the browser; ARTICLE_API_BASE_URL can override it on the server. SITE_URL is the frontend origin used for SEO metadata.


- Categories come from /api/v1/categories; the selected category is encoded in the home URL.
- Article details use /article/[id]; old /article?id= links redirect permanently.
- Initial articles and details render on the server. Client pagination, bookmarks, and reactions call the article API directly with an X-User-Id header.
- A stable reader id (`usr_…`) is stored in a cookie and localStorage on first visit so the same browser is recognized.
- Scrolling within 300 pixels of the feed bottom loads another page. Pagination has no Load More button; a scroll/resize fallback supports browsers without IntersectionObserver. A retry button appears only after a failed request.
- Loaded articles, cursor, and scroll are saved per history entry and category URL. Browser Back and the detail page's home link restore the list before scrolling. Memory backs up optional session storage; caches keep at most 20 snapshots. Reload recovery requires session storage.
- API timestamps without an offset are treated as Bangladesh local time.

## Images

Approved publisher image hosts are configured in app/lib/urls.ts and next.config.ts. Keep these lists in sync when adding publishers.
Kalbela currently returns HTTP 403 HTML to server image requests, and remote SVG logos are served directly. If a publisher refuses an image request, the UI shows a stable placeholder. Other approved raster images retain Next.js optimization. Missing API image URLs also use placeholders.

## Checks

- npm run lint
- npm run build
- npm run test:e2e
- npm run test:dev (requires the configured article API; reuses or starts the development server on port 3000)

The development regression loads three real batches and tests both Back and the home link with further pagination requests blocked, verifying that the article list and opaque cursor survive Strict Mode replay.

Production browser tests use installed Microsoft Edge and local fixture servers on ports 3100 and 4100. Run the build first. They cover scroll pagination, Back/Forward, reload, return-home links, blocked storage, category isolation, retries, metadata, invalid inputs, image failure, skeletons, mobile layout, and accessibility scans in all themes.
