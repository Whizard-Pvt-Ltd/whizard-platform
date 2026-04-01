import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'contract',
    include: ['tests/contract/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    globals: true,
    testTimeout: 5000
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
