import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1000-phase-12-4*.spec.ts',
  timeout: 180000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:8080', headless: true },
  projects: [{ name: 'audit', use: { viewport: { width: 1440, height: 900 } } }],
});
