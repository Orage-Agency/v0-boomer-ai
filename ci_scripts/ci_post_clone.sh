#!/bin/sh
# Xcode Cloud post-clone hook for Expo React Native + CocoaPods.
# Runs on the Xcode Cloud macOS build VM after git clone, before xcodebuild.
#
# Mirrors the friday-app pattern (ci_scripts/ci_post_clone.sh at repo root)
# but for an Expo project: instead of xcodegen, we run `npm ci` + `pod install`
# so the JS bundle dependencies and CocoaPods are ready for the archive step.

set -euo pipefail

echo "[ci_post_clone] CI_PRIMARY_REPOSITORY_PATH=${CI_PRIMARY_REPOSITORY_PATH:-unset}"
echo "[ci_post_clone] PWD=$(pwd)"

REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"
MOBILE_DIR="$REPO_ROOT/mobile"
IOS_DIR="$MOBILE_DIR/ios"

# 1. Node — Xcode Cloud ships Node via Homebrew but version drifts. Install
#    the LTS used locally (Node 22) via Homebrew if `node` is missing or wrong.
if ! command -v node >/dev/null 2>&1; then
  echo "[ci_post_clone] installing node…"
  brew install node@22 || brew install node
  brew link --overwrite --force node@22 2>/dev/null || true
fi
echo "[ci_post_clone] node=$(node -v) npm=$(npm -v)"

# 2. JS deps for the Expo project.
echo "[ci_post_clone] installing JS deps in $MOBILE_DIR…"
cd "$MOBILE_DIR"
# Use `npm ci` if package-lock.json is present, fall back to `npm install`.
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

# 3. CocoaPods — preinstalled on Xcode Cloud runners, but invoke explicitly.
echo "[ci_post_clone] running pod install in $IOS_DIR…"
cd "$IOS_DIR"
# pod install will generate BoomerAI.xcworkspace if not already present.
pod install --repo-update

echo "[ci_post_clone] done."
