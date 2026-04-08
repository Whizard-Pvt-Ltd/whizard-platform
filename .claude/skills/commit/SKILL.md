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

## Follow the Conventional Commits format strictly for commit messages.

**# Use the structure below:**

\`\n\<type>\[optional scope]: \<description>\n\n\[optional body]\n\n\[optional footer(s)] \n\`

**# Guidelines:**

**\*\*Type and Scope\*\***: Choose an appropriate type (e.g., \`feat\`, \`fix\`, \`chore\`, \`refactor\`, \`docs\`, \`style\`, \`test\`, \`perf\`, \`ci\`, \`build\`, \`revert\` ) and optional scope to describe the affected module or feature.

Follow Conventional Commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `docs:` - Documentation
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

**\*\*Description\*\***:Capitalization and Punctuation: Capitalize the first word and do not end in punctuation. If using Conventional Commits, remember to use all lowercase. Write a concise, informative description in the header; use backticks if referencing code or specific terms. Ideally it should be  50-60 characters

**\*\*Body\*\***: For additional details, use a well-structured body section: 

* Use bullet points (\`\*\`) for clarity.
* Clearly describe the motivation, context, or technical details behind the change, if applicable.
* Commit messages should be clear, informative, and professional, aiding readability and project tracking.
* The body should be restricted to 80-100 characters.

**\*\*Specification\*\***

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in RFC 2119.

* Commits MUST be prefixed with a type, which consists of a noun, feat, fix, etc., followed by the OPTIONAL scope, OPTIONAL !, and REQUIRED terminal colon and space.
* The type feat MUST be used when a commit adds a new feature to your application or library.
* The type fix MUST be used when a commit represents a bug fix for your application.
* A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis, e.g., fix(parser):
* A description MUST immediately follow the colon and space after the type/scope prefix. The description is a short summary of the code changes, e.g., fix: array parsing issue when multiple spaces were contained in string.
* A longer commit body MAY be provided after the short description, providing additional contextual information about the code changes. The body MUST begin one blank line after the description.
* A commit body is free-form and MAY consist of any number of newline separated paragraphs.
* One or more footers MAY be provided one blank line after the body. Each footer MUST consist of a word token, followed by either a :\\\<space> or \\\<space># separator, followed by a string value (this is inspired by the git trailer convention).
* A footer’s token MUST use - in place of whitespace characters, e.g., Acked-by (this helps differentiate the footer section from a multi-paragraph body). An exception is made for BREAKING CHANGE, which MAY also be used as a token.
* A footer’s value MAY contain spaces and newlines, and parsing MUST terminate when the next valid footer token/separator pair is observed.
* Breaking changes MUST be indicated in the type/scope prefix of a commit, or as an entry in the footer.
* If included as a footer, a breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon, space, and description, e.g., BREAKING CHANGE: environment variables now take precedence over config files.
* If included in the type/scope prefix, breaking changes MUST be indicated by a ! immediately before the :. If ! is used, BREAKING CHANGE: MAY be omitted from the footer section, and the commit description SHALL be used to describe the breaking change.
* Types other than feat and fix MAY be used in your commit messages, e.g., docs: update ref docs.
* The units of information that make up Conventional Commits MUST NOT be treated as case sensitive by implementors, with the exception of BREAKING CHANGE which MUST be uppercase.
* BREAKING-CHANGE MUST be synonymous with BREAKING CHANGE, when used as a token in a footer.
