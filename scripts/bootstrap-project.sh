#!/usr/bin/env bash
set -euo pipefail

# Bootstrap a new project from this framework.
#
# Usage:
#   bash scripts/bootstrap-project.sh /path/to/new-project
#
# The target must be a git repository with no project files yet.
# This creates an independent project copy; it does not create a fork
# and does not add a runtime dependency on ai-dev-framework.

KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: bash scripts/bootstrap-project.sh /path/to/new-project" >&2
  exit 2
fi

if [[ ! -d "$TARGET/.git" ]]; then
  echo "FAIL: target is not a git repository: $TARGET" >&2
  exit 1
fi

TARGET="$(cd "$TARGET" && pwd)"

if [[ "$TARGET" == "$KIT_ROOT" ]]; then
  echo "FAIL: target must not be the framework repository itself." >&2
  exit 1
fi

# Refuse non-empty project trees so bootstrap cannot overwrite user work.
if find "$TARGET" -mindepth 1 -maxdepth 1 ! -name .git -print -quit | grep -q .; then
  echo "FAIL: target repository is not empty (apart from .git)." >&2
  exit 1
fi

copy_dir() {
  local src="$1"
  local dst="$2"
  mkdir -p "$dst"
  cp -a "$src"/. "$dst"/
}

echo "==> Bootstrapping framework from: $KIT_ROOT"
echo "==> Target: $TARGET"

# Core
copy_dir "$KIT_ROOT/core/docs" "$TARGET/docs"

# Project layer
copy_dir "$KIT_ROOT/templates" "$TARGET"

# Scripts
mkdir -p "$TARGET/scripts"
cp "$KIT_ROOT/scripts/framework-check.mjs" "$TARGET/scripts/"
cp "$KIT_ROOT/scripts/product-check.mjs" "$TARGET/scripts/"

# Claude Code adapter
mkdir -p "$TARGET/.claude" "$TARGET/.github/workflows"
copy_dir "$KIT_ROOT/adapters/claude-code/.claude" "$TARGET/.claude"
cp "$KIT_ROOT/adapters/claude-code/workflows/requirement-to-task.yml" "$TARGET/.github/workflows/"

echo
echo "Bootstrap complete."
echo "Next: fill project-specific markers, run:"
echo "  node scripts/framework-check.mjs"
echo
echo "Do not start Product Agent requirement interview until bootstrap is complete."

# Note: PROJECT_BOOTSTRAP.md is copied explicitly so the new project retains the bootstrap contract.
