---
description: Clean, validate, test, and commit code changes
---

# Git Commit Command

This command performs a comprehensive validation before committing:

1. **Clean Build** - Removes old build artifacts
2. **Lint** - Checks code quality
3. **Unit Tests** - Runs all unit tests
4. **Type Check** - Validates TypeScript types
5. **Build All** - Ensures everything compiles
6. **Commit** - Commits the changes

## Steps to execute:

### 1. Clean build artifacts
Run: `pnpm clean:dist`

### 2. Run linting
Run: `pnpm lint`

If linting fails, fix the issues and run again.

### 3. Run unit tests
Run: `pnpm test:unit`

If tests fail, fix them before proceeding.

### 4. Type check
Run: `pnpm build`

If type checking fails, fix the errors.

### 5. Build all projects
Run: `pnpm build:all`

This ensures all apps and libraries compile successfully.

### 6. Check git status
Run: `git status`

Review what files will be committed.

### 7. Stage files
Ask the user which files to stage:
- All files: `git add .`
- Specific files: `git add <file1> <file2>`

### 8. Commit
Ask the user for a commit message and commit:
`git commit -m "commit message"`

## Example workflow:

```bash
# Clean
pnpm clean:dist

# Validate
pnpm lint
pnpm test:unit
pnpm build
pnpm build:all

# Commit
git add .
git commit -m "feat: add unit tests for Stack Auth login workflow"
```

## Commit Message Convention

Follow Conventional Commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `docs:` - Documentation
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

Examples:
- `feat: add Stack Auth integration`
- `fix: resolve ESM module resolution issue`
- `test: add unit tests for login workflow`
- `refactor: separate logging from infrastructure library`
