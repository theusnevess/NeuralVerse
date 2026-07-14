import { defineConfig } from '@playwright/test';

/** Audit-only configuration: leaves the product regression configuration untouched. */
export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1000-phase-12-0-archaeology.spec.ts',
  timeout: 240000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:8080', headless: true },
  projects: [{ name: 'audit', use: { viewport: { width: 1440, height: 900 } } }],
});
