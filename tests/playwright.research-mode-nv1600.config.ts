import { defineConfig } from '@playwright/test';

// Shares the legacy Research Mode server contract without changing its suite selection.
export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1600-research-mode.spec.ts',
  timeout: 300000,
  workers: 1,
  webServer: {
    command: 'node server.cjs',
    cwd: '../website',
    url: 'http://127.0.0.1:8090/index.html',
    reuseExistingServer: false,
    env: { PORT: '8090' }
  },
  use: { baseURL: 'http://127.0.0.1:8090', headless: true }
});
