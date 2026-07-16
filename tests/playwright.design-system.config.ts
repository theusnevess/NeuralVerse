import { defineConfig } from '@playwright/test';

const origin = 'http://127.0.0.1:8093';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1900-design-system.spec.ts',
  timeout: 300_000,
  workers: 1,
  webServer: { command: 'node server.cjs', cwd: '../website', url: `${origin}/index.html`, reuseExistingServer: false, env: { PORT: '8093' } },
  use: { baseURL: origin, headless: true, screenshot: 'off', trace: 'retain-on-failure' }
});
