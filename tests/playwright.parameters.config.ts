import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'nv-1500-parameters.spec.ts',timeout:120000,workers:1,webServer:{command:'node server.cjs',cwd:'../website',url:'http://127.0.0.1:8087/index.html',env:{PORT:'8087'}},use:{baseURL:'http://127.0.0.1:8087',headless:true}});
