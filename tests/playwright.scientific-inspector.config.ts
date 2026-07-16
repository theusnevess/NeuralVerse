import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: 'nv-1400-scientific-inspector.spec.ts', timeout: 300000, workers: 1, webServer: { command: 'node server.cjs', cwd: '../website', url: 'http://127.0.0.1:8086/index.html', env: { PORT: '8086' } }, use: { baseURL: 'http://127.0.0.1:8086', headless: true } });
