#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${1:-}"
HEAD_SHA="${2:-}"

if [[ -z "${BASE_SHA}" || -z "${HEAD_SHA}" ]]; then
  echo "Skipping AI notes check: base/head SHAs not provided."
  exit 0
fi

CHANGED_FILES="$(git diff --name-only "${BASE_SHA}" "${HEAD_SHA}")"

if [[ -z "${CHANGED_FILES}" ]]; then
  echo "No changed files detected."
  exit 0
fi

NOTE_CHANGED=0
CODE_CHANGED=0

while IFS= read -r file; do
  [[ -z "${file}" ]] && continue

  if [[ "${file}" =~ ^docs/ai-notes/.*\.md$ ]]; then
    NOTE_CHANGED=1
  fi

  if [[ "${file}" =~ ^(apps/|libs/|integrations/|data/|tools/|tests/|prisma/) ]]; then
    CODE_CHANGED=1
  fi

  if [[ "${file}" =~ ^(angular\.json|package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|nx\.json|eslint\.config\.js|vitest\.config\.ts|tsconfig(\..*)?\.json)$ ]]; then
    CODE_CHANGED=1
  fi
done <<< "${CHANGED_FILES}"

if [[ "${CODE_CHANGED}" -eq 1 && "${NOTE_CHANGED}" -eq 0 ]]; then
  echo "ERROR: Code/config changes detected but no docs/ai-notes/*.md was added/updated."
  echo "Please add or update an AI note file under docs/ai-notes/."
  exit 1
fi

echo "AI notes check passed."
