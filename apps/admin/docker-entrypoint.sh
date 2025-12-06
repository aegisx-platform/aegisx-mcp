#!/bin/sh
set -e

# Runtime configuration for Angular app
# This script generates /usr/share/nginx/html/assets/config.json from environment variables

CONFIG_FILE="/usr/share/nginx/html/assets/config.json"

# Default values
API_URL="${API_URL:-/api}"
APP_NAME="${APP_NAME:-AegisX Admin}"
APP_VERSION="${APP_VERSION:-1.0.0}"
ENABLE_ANALYTICS="${ENABLE_ANALYTICS:-false}"
ENABLE_DEBUG="${ENABLE_DEBUG:-false}"

# Generate config.json
cat > "$CONFIG_FILE" << EOF
{
  "apiUrl": "${API_URL}",
  "appName": "${APP_NAME}",
  "version": "${APP_VERSION}",
  "features": {
    "enableAnalytics": ${ENABLE_ANALYTICS},
    "enableDebug": ${ENABLE_DEBUG}
  }
}
EOF

# Set permissions so nginx can read it
chmod 644 "$CONFIG_FILE"

echo "Runtime config generated:"
cat "$CONFIG_FILE"
echo ""

# Execute the main command (nginx)
exec "$@"
