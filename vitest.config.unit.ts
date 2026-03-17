import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { config } from 'dotenv';

config({ path: '.env.test' });

export default defineConfig({
  test: {
    name: 'unit',
    include: [
      'libs/**/tests/unit/**/*.spec.ts',
      'apps/**/__tests__/**/*.spec.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'libs/**/src/**/*.ts'
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/tests/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/index.ts', // Barrel exports
        '**/public-api.ts' // Barrel exports
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },
    // Parallel execution for fast unit tests
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
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
