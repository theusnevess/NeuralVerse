import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1000-phase-12-5*.spec.ts',
  timeout: 180000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:8080', headless: true },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
});
