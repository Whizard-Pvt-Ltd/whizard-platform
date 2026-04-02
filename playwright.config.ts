import { defineConfig } from '@playwright/test';

const includeFuture = process.env.PW_INCLUDE_FUTURE === '1';

export default defineConfig({
  testDir: '.',
  grepInvert: includeFuture ? undefined : /@future\b/,
});
