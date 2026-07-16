import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-2100-motion-microinteractions.spec.ts',
  timeout: 300_000,
  workers: 1,
  webServer: { command: 'node server.cjs', cwd: '../website', url: 'http://127.0.0.1:8085/index.html', reuseExistingServer: false, env: { PORT: '8085' } },
  use: { baseURL: 'http://127.0.0.1:8085', headless: true, screenshot: 'off', trace: 'retain-on-failure' }
});
