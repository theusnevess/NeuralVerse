import { defineConfig } from '@playwright/test';

const origin = 'http://127.0.0.1:8096';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-2600-strict-visual-audit.spec.ts',
  timeout: 300_000,
  workers: 1,
  retries: 0,
  webServer: { command: 'node server.cjs', cwd: '../website', url: `${origin}/index.html`, reuseExistingServer: false, env: { PORT: '8096' } },
  use: { baseURL: origin, headless: true, screenshot: 'off', trace: 'retain-on-failure', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
});
