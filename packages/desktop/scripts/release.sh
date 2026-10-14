#!/usr/bin/env bash
# Releases a new desktop version: bumps the version, builds, uploads to GitHub Releases
# and publishes the release so installed apps auto-update and the site links to it.
#
# Usage: yarn release [patch|minor|major]   (default: patch)

set -euo pipefail

cd "$(dirname "$0")/.."

BUMP="${1:-patch}"
REPO="gustavowebjs/flash-snap"

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

yarn version "$BUMP" >/dev/null
VERSION="$(node -p "require('./package.json').version")"
TAG="v$VERSION"

echo "🚀 Releasing Flash Snap $TAG"

# Push before publishing so GitHub creates the release tag on this commit
git commit --quiet -m "release: $TAG" package.json
git push --quiet origin main

if ! yarn run publish; then
  fail "Build or upload failed. Fix the problem, then run: yarn run publish && gh release edit $TAG -R $REPO --draft=false --latest"
fi

gh release edit "$TAG" -R "$REPO" --draft=false --latest >/dev/null

echo "✅ Flash Snap $TAG is live: https://github.com/$REPO/releases/tag/$TAG"
