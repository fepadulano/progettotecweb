import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  // il round trip reale (registrazione, login, avvio partita) tocca il backend,
  // il database e l'API di Wikipedia: serve più margine del default di 5s
  expect: {
    timeout: 15 * 1000,
  },
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // due server perché i test attraversano tutto lo stack, non solo il frontend
  webServer: [
    {
      command: 'npm run dev',
      cwd: './backend',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60 * 1000,
    },
    {
      command: 'npm start',
      cwd: './frontend',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
});
