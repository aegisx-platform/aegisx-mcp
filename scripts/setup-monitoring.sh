#!/bin/bash

# AegisX Monitoring Setup Script
set -e

echo "🔧 Setting up AegisX monitoring stack..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create monitoring directories
echo "📁 Creating monitoring configuration directories..."
mkdir -p monitoring/{grafana/{dashboards,datasources},prometheus}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install docker-compose first.${NC}"
    exit 1
fi

# Copy monitoring environment configuration if it doesn't exist
if [ ! -f .env.monitoring ]; then
    echo "📋 Creating monitoring environment configuration..."
    cp .env.monitoring.example .env.monitoring
    echo -e "${YELLOW}⚠️  Please review and update .env.monitoring with your settings${NC}"
fi

# Start monitoring stack
echo "🚀 Starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

services=("prometheus" "grafana" "loki" "node-exporter")
all_running=true

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.monitoring.yml ps | grep -q "${service}.*Up"; then
        echo -e "✅ ${service} is running"
    else
        echo -e "${RED}❌ ${service} is not running${NC}"
        all_running=false
    fi
done

if [ "$all_running" = true ]; then
    echo -e "${GREEN}🎉 Monitoring stack is ready!${NC}"
    echo ""
    echo "📊 Access URLs:"
    echo "   Grafana:    http://localhost:3030 (admin/aegisx123)"
    echo "   Prometheus: http://localhost:9090"
    echo "   Node Exp:   http://localhost:9100/metrics"
    echo "   cAdvisor:   http://localhost:8080"
    echo ""
    echo "📈 API Endpoints:"
    echo "   Metrics:    http://localhost:3333/metrics"
    echo "   Health:     http://localhost:3333/health/ready"
    echo "   Liveness:   http://localhost:3333/health/live"
    echo ""
    echo "📝 Logs:"
    echo "   Application logs are stored in ./logs/"
    echo "   Structured JSON logging is enabled"
    echo ""
    echo "🚨 To stop monitoring:"
    echo "   docker-compose -f docker-compose.monitoring.yml down"
else
    echo -e "${RED}⚠️  Some services failed to start. Check the logs:${NC}"
    echo "   docker-compose -f docker-compose.monitoring.yml logs"
fi

# Install dependencies if package.json was updated
if [ -f package.json ] && [ -f yarn.lock ]; then
    echo "📦 Installing monitoring dependencies..."
    ppnpm install
elif [ -f package.json ]; then
    echo -e "${YELLOW}⚠️  Please run 'ppnpm install' to install monitoring dependencies${NC}"
fi

echo ""
echo "✨ Monitoring setup complete!"