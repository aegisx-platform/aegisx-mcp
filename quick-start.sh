#!/bin/bash

echo "🚀 AegisX Quick Start"
echo "===================="

# Check requirements
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required"; exit 1; }

# Setup
echo "📦 Installing dependencies..."
yarn install

echo "🔧 Setting up environment..."
cp .env.example .env

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for database..."
sleep 10

echo "🗄️ Running migrations..."
yarn db:migrate
yarn db:seed

echo "
✅ Setup Complete!

🚀 Start development:
   nx run-many --target=serve --projects=api,web

📡 Services:
   API:     http://localhost:3333/health
   Web:     http://localhost:4200  
   Admin:   http://localhost:4201
   pgAdmin: http://localhost:5050

🔐 Default Login:
   Email: admin@aegisx.local
   Pass:  Admin123!

📚 Documentation:
   See README.md for more details
"