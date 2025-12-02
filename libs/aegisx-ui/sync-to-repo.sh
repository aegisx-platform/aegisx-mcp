#!/bin/bash

# Sync libs/aegisx-ui to separate repository
# Usage: ./sync-to-repo.sh [branch]

BRANCH=${1:-main}
REMOTE_REPO="git@github.com:aegisx-platform/aegisx-ui.git"

echo "🔄 Syncing @aegisx/ui to separate repository..."
echo "📦 Branch: $BRANCH"
echo "🌐 Remote: $REMOTE_REPO"
echo ""

# Navigate to project root
cd "$(git rev-parse --show-toplevel)"

# Push subtree to separate repository
echo "🚀 Pushing subtree..."
git subtree push --prefix=libs/aegisx-ui "$REMOTE_REPO" "$BRANCH"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully synced to $REMOTE_REPO"
  echo "🔗 View at: https://github.com/aegisx-platform/aegisx-ui"
else
  echo ""
  echo "❌ Failed to sync"
  echo ""
  echo "💡 If this is the first sync, you may need to:"
  echo "   1. Create empty repo at github.com/aegisx-platform/aegisx-ui"
  echo "   2. Run: git subtree split --prefix=libs/aegisx-ui -b aegisx-ui-split"
  echo "   3. Run: git push $REMOTE_REPO aegisx-ui-split:main"
  exit 1
fi
