// Screen tests (npm run test:screen): the built app is started with
// `vite preview` and driven in Chromium by Playwright. See tests/screen/.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/screen',
  // Facit files are the same on every computer, so no platform in the name
  snapshotPathTemplate: '{testDir}/facit/{arg}{ext}',
  // Screenshots and traces of failed tests (ignored by git)
  outputDir: 'test-results',
  fullyParallel: true,
  timeout: 120000,
  reporter: [['list']],
  use: {
    // A missing button or text fails the test after 10 seconds
    actionTimeout: 10000,
    baseURL: 'http://localhost:4173/wpcedit/',
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 1,
    screenshot: 'only-on-failure',
    launchOptions: {
      // Only needed where Playwright's own Chromium cannot be installed
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/wpcedit/',
    reuseExistingServer: !process.env.CI,
  },
});
