# AegisX Production Deployment Makefile
# Simplifies common deployment operations

.PHONY: help install build test deploy status health backup restore logs clean

# Default target
.DEFAULT_GOAL := help

# Environment configuration
ENV ?= production
COMPOSE_FILE ?= docker-compose.prod.yml
MONITORING_COMPOSE_FILE ?= docker-compose.monitoring.yml

# Colors for output
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

## Display this help message
help:
	@echo "$(GREEN)AegisX Production Deployment Commands$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make $(YELLOW)<target>$(RESET)\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n%s\n", substr($$0, 5) }' $(MAKEFILE_LIST)

##@ Development

## Install dependencies
install:
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	yarn install
	@echo "$(GREEN)✅ Dependencies installed$(RESET)"

## Build applications for production
build:
	@echo "$(GREEN)Building applications...$(RESET)"
	yarn build:prod
	@echo "$(GREEN)✅ Build completed$(RESET)"

## Run tests
test:
	@echo "$(GREEN)Running tests...$(RESET)"
	yarn test:ci
	@echo "$(GREEN)✅ Tests completed$(RESET)"

## Run integration tests
test-integration:
	@echo "$(GREEN)Running integration tests...$(RESET)"
	yarn test:integration
	@echo "$(GREEN)✅ Integration tests completed$(RESET)"

##@ Deployment

## Generate production secrets
secrets:
	@echo "$(GREEN)Generating production secrets...$(RESET)"
	./scripts/secrets-manager.sh generate
	@echo "$(GREEN)✅ Secrets generated$(RESET)"

## Setup production environment (run once)
setup:
	@echo "$(GREEN)Setting up production environment...$(RESET)"
	sudo ./scripts/production-setup.sh
	@echo "$(GREEN)✅ Production environment setup completed$(RESET)"

## Deploy to production with zero downtime
deploy:
	@echo "$(GREEN)Deploying to production...$(RESET)"
	./scripts/deploy-production.sh
	@echo "$(GREEN)✅ Deployment completed$(RESET)"

## Deploy monitoring stack
deploy-monitoring:
	@echo "$(GREEN)Deploying monitoring stack...$(RESET)"
	docker-compose -f $(MONITORING_COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Monitoring stack deployed$(RESET)"

##@ Database Management

## Check database migration status
db-status:
	@echo "$(GREEN)Checking database migration status...$(RESET)"
	./scripts/db-migrate-production.sh status
	@echo "$(GREEN)✅ Database status check completed$(RESET)"

## Run database health check
db-health:
	@echo "$(GREEN)Running database health check...$(RESET)"
	./scripts/db-health-check.sh
	@echo "$(GREEN)✅ Database health check completed$(RESET)"

## Apply database migrations (with dry run first)
db-migrate:
	@echo "$(GREEN)Checking pending migrations...$(RESET)"
	./scripts/db-migrate-production.sh migrate --dry-run
	@echo "$(YELLOW)Press Enter to continue with actual migration or Ctrl+C to cancel$(RESET)"
	@read
	@echo "$(GREEN)Applying database migrations...$(RESET)"
	./scripts/db-migrate-production.sh migrate
	@echo "$(GREEN)✅ Database migrations completed$(RESET)"

## Create database backup
db-backup:
	@echo "$(GREEN)Creating database backup...$(RESET)"
	./scripts/db-migrate-production.sh backup full
	@echo "$(GREEN)✅ Database backup completed$(RESET)"

## Rollback last migration (with confirmation)
db-rollback:
	@echo "$(YELLOW)⚠️ WARNING: This will rollback the last migration!$(RESET)"
	@echo "$(YELLOW)Press Enter to continue or Ctrl+C to cancel$(RESET)"
	@read
	@echo "$(GREEN)Rolling back last migration...$(RESET)"
	./scripts/db-migrate-production.sh rollback 1
	@echo "$(GREEN)✅ Database rollback completed$(RESET)"

## Validate database migrations
db-validate:
	@echo "$(GREEN)Validating database migrations...$(RESET)"
	./scripts/db-migrate-production.sh validate
	@echo "$(GREEN)✅ Database validation completed$(RESET)"

##@ SSL/TLS Management

## Generate self-signed certificate for development
ssl-dev:
	@echo "$(GREEN)Generating self-signed certificate for development...$(RESET)"
	./scripts/ssl-setup.sh self-signed localhost
	@echo "$(GREEN)✅ Self-signed certificate generated$(RESET)"

## Generate Let's Encrypt certificate for production (requires domain and email)
ssl-prod:
	@echo "$(GREEN)Generating Let's Encrypt certificate...$(RESET)"
	@read -p "Enter domain name: " domain; \
	read -p "Enter email address: " email; \
	sudo ./scripts/ssl-setup.sh letsencrypt $$domain $$email
	@echo "$(GREEN)✅ Let's Encrypt certificate generated$(RESET)"

## Configure nginx with SSL
ssl-nginx:
	@echo "$(GREEN)Configuring nginx with SSL...$(RESET)"
	@read -p "Enter domain name: " domain; \
	./scripts/ssl-setup.sh nginx $$domain
	@echo "$(GREEN)✅ Nginx SSL configuration completed$(RESET)"

## Setup automatic SSL certificate renewal
ssl-renewal:
	@echo "$(GREEN)Setting up automatic SSL certificate renewal...$(RESET)"
	@read -p "Enter domain name: " domain; \
	read -p "Enter email address: " email; \
	sudo ./scripts/ssl-setup.sh renewal $$domain $$email
	@echo "$(GREEN)✅ SSL certificate renewal setup completed$(RESET)"

## Check SSL certificate status
ssl-check:
	@echo "$(GREEN)Checking SSL certificate status...$(RESET)"
	@read -p "Enter domain name (press Enter for localhost): " domain; \
	domain=$${domain:-localhost}; \
	./scripts/ssl-setup.sh check $$domain
	@echo "$(GREEN)✅ SSL certificate check completed$(RESET)"

## Generate Diffie-Hellman parameters for enhanced security
ssl-dhparam:
	@echo "$(GREEN)Generating Diffie-Hellman parameters...$(RESET)"
	./scripts/ssl-setup.sh dhparam
	@echo "$(GREEN)✅ DH parameters generated$(RESET)"

## Complete SSL setup for production
ssl-full-setup:
	@echo "$(GREEN)Starting complete SSL setup for production...$(RESET)"
	@read -p "Enter domain name: " domain; \
	read -p "Enter email address: " email; \
	echo "$(YELLOW)This will install certbot, generate certificates, configure nginx, and setup renewal$(RESET)"; \
	echo "$(YELLOW)Press Enter to continue or Ctrl+C to cancel$(RESET)"; \
	read; \
	sudo ./scripts/ssl-setup.sh install-certbot && \
	./scripts/ssl-setup.sh dhparam && \
	sudo ./scripts/ssl-setup.sh letsencrypt $$domain $$email && \
	./scripts/ssl-setup.sh nginx $$domain && \
	sudo ./scripts/ssl-setup.sh renewal $$domain $$email
	@echo "$(GREEN)✅ Complete SSL setup finished$(RESET)"

## Quick deploy (skip health checks)
deploy-fast:
	@echo "$(YELLOW)Quick deploying to production (skipping some checks)...$(RESET)"
	./scripts/deploy-production.sh --fast
	@echo "$(GREEN)✅ Quick deployment completed$(RESET)"

## Rollback to previous version
rollback:
	@echo "$(YELLOW)Rolling back to previous version...$(RESET)"
	./scripts/deploy-production.sh --rollback
	@echo "$(GREEN)✅ Rollback completed$(RESET)"

##@ Operations

## Check application status
status:
	@echo "$(GREEN)Checking application status...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(GREEN)Container Health Status:$(RESET)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep aegisx

## Check application health
health:
	@echo "$(GREEN)Checking application health...$(RESET)"
	./scripts/health-monitor.sh status
	@echo ""
	@echo "$(GREEN)API Health:$(RESET)"
	@curl -f http://localhost:3333/health/ready | jq . || echo "$(RED)❌ API health check failed$(RESET)"
	@echo ""

## Show application logs
logs:
	@echo "$(GREEN)Showing application logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f --tail=100

## Show API logs only
logs-api:
	@echo "$(GREEN)Showing API logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f api

## Show web application logs
logs-web:
	@echo "$(GREEN)Showing web application logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f web

## Show database logs
logs-db:
	@echo "$(GREEN)Showing database logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f postgres

## Show monitoring logs
logs-monitoring:
	@echo "$(GREEN)Showing monitoring logs...$(RESET)"
	docker-compose -f $(MONITORING_COMPOSE_FILE) logs -f

##@ Backup & Restore

## Create full backup
backup:
	@echo "$(GREEN)Creating backup...$(RESET)"
	./scripts/backup-restore.sh backup
	@echo "$(GREEN)✅ Backup completed$(RESET)"

## List available backups
backup-list:
	@echo "$(GREEN)Available backups:$(RESET)"
	./scripts/backup-restore.sh list

## Restore from backup (requires BACKUP_FILE environment variable)
restore:
	@echo "$(YELLOW)Restoring from backup: $(BACKUP_FILE)$(RESET)"
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)❌ BACKUP_FILE environment variable required$(RESET)"; \
		echo "Usage: make restore BACKUP_FILE=backup-20240101-120000.tar.gz"; \
		exit 1; \
	fi
	./scripts/backup-restore.sh restore $(BACKUP_FILE)
	@echo "$(GREEN)✅ Restore completed$(RESET)"

##@ Monitoring

## Open Grafana dashboard
grafana:
	@echo "$(GREEN)Opening Grafana dashboard...$(RESET)"
	@echo "🔗 http://localhost:3030"
	@echo "👤 Username: admin"
	@echo "🔑 Password: Check .env.production file"

## Open Prometheus dashboard  
prometheus:
	@echo "$(GREEN)Opening Prometheus dashboard...$(RESET)"
	@echo "🔗 http://localhost:9090"

## Check metrics endpoint
metrics:
	@echo "$(GREEN)API Metrics:$(RESET)"
	@curl -s http://localhost:3333/metrics | head -20

##@ Maintenance

## Update container images
update:
	@echo "$(GREEN)Updating container images...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) pull
	@echo "$(GREEN)✅ Images updated$(RESET)"

## Restart all services
restart:
	@echo "$(GREEN)Restarting services...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Services restarted$(RESET)"

## Restart specific service (requires SERVICE environment variable)
restart-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(RED)❌ SERVICE environment variable required$(RESET)"; \
		echo "Usage: make restart-service SERVICE=api"; \
		exit 1; \
	fi
	@echo "$(GREEN)Restarting $(SERVICE) service...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) restart $(SERVICE)
	@echo "$(GREEN)✅ $(SERVICE) service restarted$(RESET)"

## Stop all services
stop:
	@echo "$(YELLOW)Stopping all services...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down
	docker-compose -f $(MONITORING_COMPOSE_FILE) down
	@echo "$(GREEN)✅ All services stopped$(RESET)"

## Clean unused Docker resources
clean:
	@echo "$(YELLOW)Cleaning unused Docker resources...$(RESET)"
	docker system prune -f
	docker volume prune -f
	@echo "$(GREEN)✅ Cleanup completed$(RESET)"

## Full cleanup (removes all data - use with caution)
clean-all:
	@echo "$(RED)⚠️  WARNING: This will remove ALL data including databases!$(RESET)"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(YELLOW)Performing full cleanup...$(RESET)"; \
		docker-compose -f $(COMPOSE_FILE) down -v; \
		docker-compose -f $(MONITORING_COMPOSE_FILE) down -v; \
		docker system prune -a -f; \
		docker volume prune -f; \
		echo "$(GREEN)✅ Full cleanup completed$(RESET)"; \
	else \
		echo "$(GREEN)Cleanup cancelled$(RESET)"; \
	fi

##@ Database

## Run database migrations
db-migrate:
	@echo "$(GREEN)Running database migrations...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) exec -T api npm run db:migrate
	@echo "$(GREEN)✅ Migrations completed$(RESET)"

## Seed database with initial data
db-seed:
	@echo "$(GREEN)Seeding database...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) exec -T api npm run db:seed
	@echo "$(GREEN)✅ Database seeded$(RESET)"

## Database backup (separate from full backup)
db-backup:
	@echo "$(GREEN)Creating database backup...$(RESET)"
	./scripts/backup-restore.sh db-backup
	@echo "$(GREEN)✅ Database backup completed$(RESET)"

##@ SSL/TLS

## Generate SSL certificates using Let's Encrypt
ssl-cert:
	@echo "$(GREEN)Generating SSL certificates...$(RESET)"
	./scripts/production-setup.sh ssl
	@echo "$(GREEN)✅ SSL certificates generated$(RESET)"

## Renew SSL certificates
ssl-renew:
	@echo "$(GREEN)Renewing SSL certificates...$(RESET)"
	./scripts/production-setup.sh ssl-renew
	@echo "$(GREEN)✅ SSL certificates renewed$(RESET)"

##@ Quick Commands

## Full production deployment workflow
deploy-full: build test backup deploy deploy-monitoring health
	@echo "$(GREEN)🎉 Full deployment completed successfully!$(RESET)"

## Emergency stop (immediate shutdown)
emergency-stop:
	@echo "$(RED)🚨 Emergency stop - shutting down immediately$(RESET)"
	docker kill $(shell docker ps -q --filter "name=aegisx") 2>/dev/null || true
	@echo "$(GREEN)✅ Emergency stop completed$(RESET)"

## Check if environment is ready for deployment
pre-deploy-check:
	@echo "$(GREEN)Running pre-deployment checks...$(RESET)"
	@./scripts/deploy-production.sh --check-only
	@echo "$(GREEN)✅ Pre-deployment checks passed$(RESET)"

## Show system resource usage
resources:
	@echo "$(GREEN)System Resource Usage:$(RESET)"
	@echo ""
	@echo "$(YELLOW)Memory Usage:$(RESET)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep aegisx || echo "No AegisX containers running"
	@echo ""
	@echo "$(YELLOW)Disk Usage:$(RESET)"
	@df -h | grep -E "(Size|/opt/aegisx|/var/lib/docker)" || true

## Show deployment info
info:
	@echo "$(GREEN)AegisX Production Deployment Information$(RESET)"
	@echo ""
	@echo "$(YELLOW)Environment:$(RESET) $(ENV)"
	@echo "$(YELLOW)Compose File:$(RESET) $(COMPOSE_FILE)"
	@echo "$(YELLOW)Monitoring:$(RESET) $(MONITORING_COMPOSE_FILE)"
	@echo ""
	@echo "$(YELLOW)Key URLs:$(RESET)"
	@echo "  🌐 API:        http://localhost:3333"
	@echo "  🖥️  Web:        http://localhost:4200"
	@echo "  ⚙️  Admin:      http://localhost:4201" 
	@echo "  📊 Grafana:    http://localhost:3030"
	@echo "  📈 Prometheus: http://localhost:9090"
	@echo ""
	@echo "$(YELLOW)Health Checks:$(RESET)"
	@echo "  ❤️  API:        http://localhost:3333/health/ready"
	@echo "  📊 Metrics:    http://localhost:3333/metrics"