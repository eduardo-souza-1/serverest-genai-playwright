import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, retries: 0,
  timeout: 60000, expect: { timeout: 5000 },
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: process.env.API_BASE_URL || 'https://compassuol.serverest.dev/',
    extraHTTPHeaders: { Accept: 'application/json' }, trace: 'off' }
});
