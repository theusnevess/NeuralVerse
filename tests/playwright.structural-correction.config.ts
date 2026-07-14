import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1000-labs-structural-correction.spec.ts',
  timeout: 180_000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    screenshot: 'off',
    trace: 'off',
  },
});
