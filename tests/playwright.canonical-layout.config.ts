import { defineConfig } from '@playwright/test';

const canonicalOrigin = 'http://127.0.0.1:8083';

export default defineConfig({
  testDir: '.',
  testMatch: 'nv-1000-labs-canonical-layout.spec.ts',
  timeout: 300_000,
  workers: 1,
  webServer: {
    command: 'node server.cjs',
    cwd: '../website',
    url: `${canonicalOrigin}/index.html`,
    reuseExistingServer: false,
    env: { PORT: '8083' }
  },
  use: { baseURL: canonicalOrigin, headless: true, screenshot: 'off', trace: 'retain-on-failure' }
});
