import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    name: 'integration',
    include: ['libs/**/tests/integration/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    globals: true,
    passWithNoTests: true,
    testTimeout: 10000, // Integration tests can be slower
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'libs/**/src/infrastructure/**/*.ts',
        'libs/**/src/application/services/**/*.ts'
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/tests/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts'
      ]
    },
    // Serial execution for DB-dependent tests
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    setupFiles: ['./tests/setup/integration-setup.ts']
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
