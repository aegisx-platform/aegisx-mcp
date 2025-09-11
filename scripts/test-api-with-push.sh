#!/bin/bash

# Script to run API tests before pushing (optional)
# Usage: ./scripts/test-api-with-push.sh

echo "🔬 Running full API integration tests before push..."

# Check if API server is running
if ! curl -s http://localhost:3333/api/health > /dev/null 2>&1; then
    echo "⚠️  API server is not running. Starting API server..."
    yarn nx serve api &
    API_PID=$!
    
    # Wait for API to be ready
    echo "Waiting for API server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3333/api/health > /dev/null 2>&1; then
            echo "✅ API server is ready!"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 30 ]; then
        echo "❌ API server failed to start within 30 seconds"
        kill $API_PID 2>/dev/null
        exit 1
    fi
fi

# Run API tests
cd apps/api && ./scripts/test-all-routes.sh
TEST_RESULT=$?

# Clean up if we started the API server
if [ ! -z "$API_PID" ]; then
    echo "Stopping API server..."
    kill $API_PID 2>/dev/null
fi

if [ $TEST_RESULT -ne 0 ]; then
    echo "❌ API tests failed. Fix the issues before pushing."
    exit 1
fi

echo "✅ All API tests passed!"
echo "🚀 Pushing to remote..."
git push "$@"