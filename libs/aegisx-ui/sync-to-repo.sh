#!/bin/bash

# Sync libs/aegisx-ui to separate repository
# Usage: ./sync-to-repo.sh [branch]

BRANCH=${1:-main}
REMOTE_REPO="git@github.com:aegisx-platform/aegisx-ui.git"

echo "Syncing @aegisx/ui to separate repository..."
echo "Branch: $BRANCH"
echo "Remote: $REMOTE_REPO"
echo ""

# Navigate to project root
cd "$(git rev-parse --show-toplevel)"

# Push subtree to separate repository
echo "Pushing subtree..."
git subtree push --prefix=libs/aegisx-ui "$REMOTE_REPO" "$BRANCH"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully synced to $REMOTE_REPO"
  echo "View at: https://github.com/aegisx-platform/aegisx-ui"
else
  echo ""
  echo "❌ Failed to sync"
  exit 1
fi
