import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-2500-playwright-governance.spec.ts',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: { headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' }
});
