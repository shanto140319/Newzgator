import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testIgnore: "**/*.dev.spec.ts", timeout: 30000, workers: 1,
  use: { baseURL: "http://localhost:3100", channel: "msedge", viewport: { width: 1280, height: 800 } },
  webServer: [
    { command: "node tests/fixture-api.cjs", url: "http://localhost:4100/api/v1/categories" },
    { command: "node node_modules/next/dist/bin/next start -p 3100", url: "http://localhost:3100", env: { ARTICLE_API_BASE_URL: "http://localhost:4100", SITE_URL: "http://localhost:3100" } },
  ],
});
