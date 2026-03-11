# Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Hooks

### pre-commit
Runs **lint-staged** on staged files before each commit.
- Automatically fixes ESLint errors where possible
- Only lints files that are staged for commit (fast!)
- Prevents commits with linting errors

### pre-push
Runs full validation before pushing to remote:
1. **ESLint** - Full codebase linting
2. **TypeScript** - Type checking across the entire project

This ensures all code pushed to the repository meets quality standards.

## Bypassing Hooks (Use Sparingly)

If you need to bypass hooks in exceptional cases:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

⚠️ **Warning**: Only bypass hooks when absolutely necessary. Code that bypasses hooks may fail CI/CD pipelines.

## Setup

Hooks are automatically installed when you run:
```bash
pnpm install
```

If hooks aren't working, manually reinstall:
```bash
pnpm husky install
```
