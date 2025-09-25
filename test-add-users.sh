#!/bin/bash

echo "🧪 Adding Test Users to Database"
echo "==============================="
echo ""

API_URL="http://localhost:3383"

echo "🔑 Testing registration endpoint..."

# Test user 1
echo "Creating test user 1..."
USER1=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice",
    "password": "password123",
    "firstName": "Alice",
    "lastName": "Johnson"
  }')

echo "User 1 response: $USER1"

# Test user 2  
echo "Creating test user 2..."
USER2=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com", 
    "username": "bob",
    "password": "password123",
    "firstName": "Bob",
    "lastName": "Smith"
  }')

echo "User 2 response: $USER2"

# Test user 3
echo "Creating test user 3..."
USER3=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "charlie@example.com",
    "username": "charlie", 
    "password": "password123",
    "firstName": "Charlie",
    "lastName": "Brown"
  }')

echo "User 3 response: $USER3"

echo ""
echo "✅ Test users created!"
echo ""
echo "📋 You can now login with any of these accounts:"
echo "   - alice@example.com / password123"
echo "   - bob@example.com / password123" 
echo "   - charlie@example.com / password123"
echo ""
echo "🚀 Next steps:"
echo "1. Go to http://localhost:4249/login"
echo "2. Login with one of the accounts above"
echo "3. Go to http://localhost:4249/realtime-demo"
echo "4. Test the real-time features!"