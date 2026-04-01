---
description: Create and push the next semantic version tag
---

# Create Next Tag Command

This command helps you create the next semantic version tag following [Semantic Versioning](https://semver.org/).

## Semantic Versioning Format: `vMAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes (v1.0.0 → v2.0.0)
- **MINOR** - New features (backward compatible) (v0.1.0 → v0.2.0)
- **PATCH** - Bug fixes (backward compatible) (v0.1.0 → v0.1.1)

## Steps to execute:

### 1. Fetch all tags and get the latest
Always fetch from remote first, then list tags sorted by version to get the true latest:
```bash
git fetch --tags && git tag --sort=-version:refname | head -10
```

Use the highest version from the sorted list as the current tag. If no tags exist, the first tag should be `v0.1.0`.

### 3. Show recent commits since last tag
Run: `git log <last-tag>..HEAD --oneline` (or `git log --oneline -10` if no tags exist)

Display the commits to help user decide the version bump.

### 4. Determine next version

Ask the user what type of change this is:
- **MAJOR** (breaking changes) - Increment major version (v0.1.2 → v1.0.0)
- **MINOR** (new features) - Increment minor version (v0.1.2 → v0.2.0)
- **PATCH** (bug fixes) - Increment patch version (v0.1.2 → v0.1.3)

Calculate the next version based on the current tag and user's choice.

### 5. Show what will be tagged

Display:
```
Current tag: v0.1.1
Next tag: v0.1.2

Commits to be included:
<list of commits>

Tag message: Release v0.1.2
```

### 6. Confirm with user

Ask: "Do you want to create and push tag v0.1.2? (yes/no)"

### 7. Create and push tag

If user confirms:
```bash
# Create annotated tag
git tag -a v0.1.2 -m "Release v0.1.2"

# Push tag to remote
git push origin v0.1.2
```

Show success message:
```
✅ Tag v0.1.2 created and pushed successfully!
🚀 GitHub Actions will now build and push Docker images.
📦 View release: https://github.com/your-org/whizard-platform/releases/tag/v0.1.2
```

## Example workflow:

```bash
# Fetch and get latest tag
$ git fetch --tags && git tag --sort=-version:refname | head -10
v0.1.1
...

# Show commits since last tag
$ git log v0.1.1..HEAD --oneline
a1b2c3d feat: add unit tests for login workflow
d4e5f6g fix: resolve ESM module resolution
h7i8j9k refactor: separate logging library

# User chooses: MINOR (new features)
# Next tag: v0.2.0

# Create and push
$ git tag -a v0.2.0 -m "Release v0.2.0"
$ git push origin v0.2.0
```

## Notes:

- Always use annotated tags (`-a` flag) for releases
- Tag messages should be simple: "Release vX.Y.Z"
- Tags trigger CI/CD pipeline to build Docker images (see `.github/workflows/docker-image-whizard-api.yml`)
- After pushing, verify the GitHub Actions workflow starts
