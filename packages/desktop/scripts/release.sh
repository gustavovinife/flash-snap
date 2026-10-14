#!/usr/bin/env bash
# Releases a new desktop version: bumps the version, builds, uploads to GitHub Releases
# and publishes the release so installed apps auto-update and the site links to it.
# If the previous run failed after bumping, running it again resumes that version.
#
# Usage: yarn release [patch|minor|major]   (default: patch)

set -euo pipefail

cd "$(dirname "$0")/.."

BUMP="${1:-patch}"
REPO="gustavovinife/flash-snap"

fail() {
  echo "❌ $1" >&2
  exit 1
}

[[ "$BUMP" =~ ^(patch|minor|major)$ ]] || fail "Version bump must be patch, minor or major (got '$BUMP')"
[ -f .env ] || fail "packages/desktop/.env is missing (app config baked into the build)"
[ -f .env.sh ] || fail "packages/desktop/.env.sh is missing (GitHub token and Apple notarization credentials)"
command -v gh >/dev/null || fail "GitHub CLI (gh) is required: brew install gh"

[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || fail "Releases must be made from the main branch"
[ -z "$(git status --porcelain)" ] || fail "Commit or stash your changes before releasing"

git fetch origin main --quiet
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || fail "Local main is not in sync with origin/main (pull or push first)"

# GH_TOKEN from .env.sh is used by electron-builder and takes precedence over the gh CLI login
set -a
# shellcheck disable=SC1091
source ./.env.sh
set +a

[ "$(gh api "repos/$REPO" --jq '.permissions.push' 2>/dev/null)" = "true" ] ||
  fail "GH_TOKEN in .env.sh cannot push to $REPO (expired or wrong account?)"

current_version() {
  node -p "require('./package.json').version"
}

RELEASE_STATE="$(gh release view "v$(current_version)" -R "$REPO" --json isDraft \
  --jq 'if .isDraft then "draft" else "published" end' 2>/dev/null || echo missing)"

if [ "$RELEASE_STATE" = "published" ]; then
  yarn version "$BUMP" >/dev/null
  TAG="v$(current_version)"
  echo "🚀 Releasing Flash Snap $TAG"

  # Push before publishing so GitHub creates the release tag on this commit
  git commit --quiet -m "release: $TAG" package.json
  git push --quiet origin main
else
  TAG="v$(current_version)"
  echo "🔁 Resuming unpublished release $TAG"
fi

yarn run publish || fail "Build or upload failed. Fix the problem, then run 'yarn release:desktop' again to resume $TAG."

# macOS builds aren't signed with a Developer ID, so installed Mac apps can't apply them;
# without this file they stop downloading updates they can't install
gh release delete-asset "$TAG" latest-mac.yml -R "$REPO" --yes >/dev/null 2>&1 || true

gh release edit "$TAG" -R "$REPO" --draft=false --latest >/dev/null

echo "✅ Flash Snap $TAG is live: https://github.com/$REPO/releases/tag/$TAG"
