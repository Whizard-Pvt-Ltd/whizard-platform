const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const perfectionist = require('eslint-plugin-perfectionist');

module.exports = [
  {
    ignores: ['.nx/**', 'dist/**', 'apps/**/dist/**', 'node_modules/**'],
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: false,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // Perfectionist
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          customGroups: [
            {
              groupName: 'angular',
              elementNamePattern: '@angular',
            },
            {
              groupName: 'libs',
              elementNamePattern: '@whizard',
            },
          ],
          groups: [
            'type-import',
            'value-builtin',
            'angular',
            'libs',
            'value-external',
            'type-internal',
            'value-internal',
            ['type-parent', 'type-sibling', 'type-index'],
            ['value-parent', 'value-sibling', 'value-index'],
            'ts-equals-import',
            'unknown',
          ],
          newlinesBetween: 0,
          tsconfig: {
            rootDir: '.',
          },
        },
      ],
    },
  },

  {
    files: ['libs/contexts/*/src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/application/**',
                '**/infrastructure/**',
                '**/presentation/**',
              ],
              message:
                'Domain layer must stay framework-agnostic and cannot depend on other layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['libs/contexts/*/src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '**/presentation/**'],
              message:
                'Application layer cannot import infrastructure or presentation directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['libs/contexts/*/src/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message:
                'Presentation layer should depend on application contracts, not infrastructure.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['libs/contexts/*/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'ImportDeclaration[source.value=/contexts\\/[^/]+\\/src\\/(?!index(?:\\.ts)?$|public-api(?:\\.ts)?$)/]',
          message:
            'Cross-context imports must use public entry points (index/public-api), never private internal paths.',
        },
      ],
    },
  },
  {
    ignores: ['**/vitest.config.*.timestamp*', '.angular/**'],
  },
];
