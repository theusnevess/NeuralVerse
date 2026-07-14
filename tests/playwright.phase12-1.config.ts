import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1000-phase-12-1-isolated-shell.spec.ts',
  timeout: 60000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:8080', headless: true },
  projects: [{ name: 'audit', use: { viewport: { width: 1440, height: 900 } } }],
});
