#!/bin/bash

echo "🧪 Simple WebSocket Connection Test"
echo "=================================="
echo ""

echo "📍 Instance Configuration:"
echo "  - API Port: 3383"
echo "  - Web Port: 4249"
echo "  - WebSocket Path: /api/ws/"
echo ""

echo "🔍 Testing API Server Availability..."
API_HEALTH=$(curl -s -w "%{http_code}" http://localhost:3383/health -o /dev/null 2>/dev/null)
if [ "$API_HEALTH" = "200" ]; then
    echo "✅ API Server is running on port 3383"
else
    echo "❌ API Server is NOT running on port 3383 (HTTP: $API_HEALTH)"
    echo ""
    echo "🚀 Please start the API server first:"
    echo "   pnpm run dev:api"
    exit 1
fi

echo ""
echo "🔍 Testing WebSocket Health Endpoint..."
WS_HEALTH=$(curl -s http://localhost:3383/api/websocket/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ WebSocket Health Endpoint is accessible"
    echo "$WS_HEALTH" | jq . 2>/dev/null || echo "$WS_HEALTH"
else
    echo "❌ WebSocket Health Endpoint is NOT accessible"
fi

echo ""
echo "🔍 Testing Socket.IO Endpoint..."
SOCKETIO_TEST=$(curl -s -w "%{http_code}" "http://localhost:3383/api/ws/?EIO=4&transport=polling" -o /dev/null 2>/dev/null)
if [ "$SOCKETIO_TEST" = "200" ]; then
    echo "✅ Socket.IO endpoint is responding correctly"
else
    echo "❌ Socket.IO endpoint is NOT responding (HTTP: $SOCKETIO_TEST)"
    echo "   Expected: HTTP 200"
    echo "   Got: HTTP $SOCKETIO_TEST"
fi

echo ""
echo "📊 Testing Current Configuration:"
echo "Frontend WebSocket URL should be: http://localhost:3383"
echo "Frontend WebSocket Path should be: /api/ws/"
echo ""

echo "🌐 Next Steps:"
echo "1. If API server is running, open: http://localhost:4249"
echo "2. Login to the system"
echo "3. Navigate to: http://localhost:4249/realtime-demo"
echo "4. Click 'Connect WebSocket' - it should now work!"
echo ""