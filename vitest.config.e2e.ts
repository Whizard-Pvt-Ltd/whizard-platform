import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    name: 'e2e',
    include: ['tests/e2e/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    globals: true,
    testTimeout: 30000, // E2E tests can be slow
    hookTimeout: 30000,
    // Serial execution for E2E tests
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    setupFiles: ['./tests/setup/e2e-setup.ts']
  },
  resolve: {
    alias: {
      '@whizard/identity-access': path.resolve(__dirname, 'libs/contexts/identity-access/src/index.ts'),
      '@whizard/shared-kernel': path.resolve(__dirname, 'libs/shared/kernel/src/index.ts'),
      '@whizard/shared-infrastructure': path.resolve(__dirname, 'libs/shared/infrastructure/src/index.ts'),
      '@whizard/shared-logging': path.resolve(__dirname, 'libs/shared/logging/src/index.ts'),
      '@whizard/shared-ui': path.resolve(__dirname, 'libs/shared/ui/src/index.ts'),
      '@whizard/core-api-client': path.resolve(__dirname, 'libs/shared/core-api-client/src/index.ts')
    }
  }
});
