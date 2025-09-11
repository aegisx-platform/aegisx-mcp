#!/bin/bash

echo "🔧 Setting up optimized Git hooks..."

# Backup existing hooks
if [ -f .husky/pre-push ]; then
    cp .husky/pre-push .husky/pre-push.backup.$(date +%Y%m%d_%H%M%S)
fi

# Install commitlint if not exists
if ! command -v commitlint &> /dev/null; then
    echo "📦 Installing commitlint..."
    yarn add -D @commitlint/cli @commitlint/config-conventional
fi

# Create commitlint config if not exists
if [ ! -f .commitlintrc.json ]; then
    echo '{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat", "fix", "docs", "style", "refactor",
        "perf", "test", "build", "ci", "chore", "revert"
      ]
    ]
  }
}' > .commitlintrc.json
fi

# Setup commit-msg hook
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh

if [ "$SKIP_HOOKS" = "1" ]; then
    exit 0
fi

npx --no -- commitlint --edit "$1"
EOF

chmod +x .husky/commit-msg

# Update package.json scripts
echo "📝 Adding helpful scripts to package.json..."

# Add these scripts if they don't exist
node -e "
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'push:quick': 'SKIP_HOOKS=1 git push',
  'push:force': 'SKIP_HOOKS=1 git push --force-with-lease',
  'commit:fix': 'git commit -m \"fix: \"',
  'commit:feat': 'git commit -m \"feat: \"',
  'test:affected': 'nx affected --target=test',
  'lint:affected': 'nx affected --target=lint',
  'lint:fix': 'nx affected --target=lint --fix'
};
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo "✅ Setup complete!"
echo ""
echo "📋 Usage:"
echo "  Normal push:     git push                    # Runs lint check"
echo "  Quick push:      npm run push:quick          # Skip all hooks"
echo "  Force push:      npm run push:force          # Skip hooks + force"
echo "  Quick commit:    npm run commit:fix          # Start fix commit"
echo "  Test locally:    npm run test:affected       # Run affected tests"
echo ""
echo "🎯 Recommendation: Let CI/CD handle the heavy testing!"