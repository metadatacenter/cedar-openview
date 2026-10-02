import { defineConfig } from '@playwright/test';
const port = Number(process.env.PORT || 4796);
// Hermetic: the built application with its open API answered from fixtures.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: { command: 'node serve.mjs', url: `http://127.0.0.1:${port}`, reuseExistingServer: false },
});
