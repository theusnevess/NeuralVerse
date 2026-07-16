import { defineConfig } from '@playwright/test';
// This explicit selection is the complete legacy Research contract, documented
// in the NV-2500 manifest; the complete command supplies no grep filter.
export default defineConfig({ testDir: '.', testMatch: 'nv-1000-labs-audit.spec.ts', grep: /Research Mode can be opened|UI remains readable in Research Mode/, timeout: 300000, workers: 1, webServer: { command: 'node server.cjs', cwd: '../website', url: 'http://127.0.0.1:8090/index.html', reuseExistingServer: false, env: { PORT: '8090' } }, use: { baseURL: 'http://127.0.0.1:8090', headless: true } });
