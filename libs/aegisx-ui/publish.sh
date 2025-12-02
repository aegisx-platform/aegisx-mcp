#!/bin/bash

# Publish script for @aegisx/ui
# Usage: ./publish.sh <otp-code>
#
# Prerequisites:
#   1. Build the library: pnpm nx build aegisx-ui
#   2. Navigate to dist: cd dist/libs/aegisx-ui
#   3. Run this script: ../../../libs/aegisx-ui/publish.sh <otp>

if [ -z "$1" ]; then
  echo "❌ Error: OTP code required"
  echo "Usage: ./publish.sh <otp-code>"
  echo ""
  echo "Get OTP from your authenticator app and run:"
  echo "  ./publish.sh 123456"
  echo ""
  echo "📋 Full workflow:"
  echo "  1. pnpm nx build aegisx-ui"
  echo "  2. cd dist/libs/aegisx-ui"
  echo "  3. ../../../libs/aegisx-ui/publish.sh <otp>"
  exit 1
fi

OTP=$1

echo "📦 Publishing @aegisx/ui to npm..."
echo ""

# Check if we're in the dist directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo ""
  echo "Make sure you're in the dist directory:"
  echo "  1. pnpm nx build aegisx-ui"
  echo "  2. cd dist/libs/aegisx-ui"
  echo "  3. Run this script again"
  exit 1
fi

# Publish to npm with OTP
npm publish --access public --otp="$OTP"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully published to npm!"
  echo "🔗 View at: https://www.npmjs.com/package/@aegisx/ui"
  echo ""
  echo "📋 Next steps:"
  echo "  1. Sync to standalone repo: cd libs/aegisx-ui && ./sync-to-repo.sh main"
  echo "  2. Create GitHub release"
  echo "  3. Update CHANGELOG.md"
else
  echo ""
  echo "❌ Failed to publish"
  exit 1
fi
