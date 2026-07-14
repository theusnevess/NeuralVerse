import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'nv-1000-labs-audit.spec.ts',
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/nv-1000-audit-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  projects: [
    {
      name: 'audit',
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
});
