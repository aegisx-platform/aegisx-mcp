#!/bin/bash

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "nx serve" || true
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:4200 | xargs kill -9 2>/dev/null || true

# Start API server
echo "Starting API server..."
yarn nx serve api --configuration=development > /tmp/api.log 2>&1 &
API_PID=$!

# Start Web server
echo "Starting Web server..."
yarn nx serve web > /tmp/web.log 2>&1 &
WEB_PID=$!

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 30

# Check if servers are running
echo "Checking server status..."
curl -s http://localhost:3333/health/live || echo "API not ready"
curl -s http://localhost:4200 || echo "Web not ready"

# Run E2E tests
echo "Running E2E tests..."
cd apps/e2e
npx playwright test --project=chromium --reporter=list

# Cleanup
echo "Cleaning up..."
kill $API_PID $WEB_PID 2>/dev/null || true

echo "Done!"