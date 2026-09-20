import { defineConfig } from "@playwright/test";
// Uses the real development app/API to catch Strict Mode effect replay regressions.
export default defineConfig({
  testDir: "./tests", testMatch: "**/*.dev.spec.ts", timeout: 60000, workers: 1,
  use: { baseURL: "http://localhost:3000", channel: "msedge", viewport: { width: 1280, height: 800 } },
  webServer: { command: "node node_modules/next/dist/bin/next dev -p 3000", url: "http://localhost:3000", reuseExistingServer: true },
});
