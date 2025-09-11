#!/bin/bash
set -euo pipefail

# AegisX Environment Configuration Manager
# Manages environment-specific configurations across different deployment stages

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly ENV_DIR="$PROJECT_ROOT/environments"
readonly BACKUP_DIR="$PROJECT_ROOT/backups/environments"

# Supported environments
readonly ENVIRONMENTS=("development" "staging" "production")

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Help message
show_help() {
    cat << EOF
AegisX Environment Configuration Manager

Usage: $0 <command> [options]

Commands:
    init <env>                 Initialize environment configuration
    switch <env>               Switch to specified environment
    validate <env>             Validate environment configuration
    backup <env>               Backup environment configuration
    restore <env> <backup>     Restore environment from backup
    diff <env1> <env2>         Compare two environment configurations
    encrypt <env>              Encrypt sensitive environment variables
    decrypt <env>              Decrypt environment configuration
    secrets <env>              Generate/rotate secrets for environment
    deploy-config <env>        Deploy configuration to target environment
    status                     Show current environment status
    list                       List all available environments

Environments: ${ENVIRONMENTS[*]}

Options:
    -h, --help                 Show this help message
    -v, --verbose              Enable verbose output
    -f, --force                Force operation without confirmation

Examples:
    $0 init production
    $0 switch staging
    $0 validate production
    $0 backup production
    $0 secrets production rotate
    $0 deploy-config production

EOF
}

# Ensure required directories exist
ensure_directories() {
    mkdir -p "$ENV_DIR" "$BACKUP_DIR"
    
    for env in "${ENVIRONMENTS[@]}"; do
        mkdir -p "$ENV_DIR/$env"
    done
}

# Validate environment name
validate_env_name() {
    local env="$1"
    
    if [[ ! " ${ENVIRONMENTS[*]} " =~ \ $env\  ]]; then
        error "Invalid environment: $env"
        error "Supported environments: ${ENVIRONMENTS[*]}"
        exit 1
    fi
}

# Initialize environment configuration
init_environment() {
    local env="$1"
    validate_env_name "$env"
    
    log "Initializing $env environment configuration..."
    
    local env_file="$ENV_DIR/$env/.env.$env"
    local secrets_file="$ENV_DIR/$env/.env.$env.secrets"
    local config_file="$ENV_DIR/$env/config.json"
    
    # Create base environment file
    if [[ ! -f "$env_file" ]]; then
        cat > "$env_file" << EOF
# AegisX $env Environment Configuration
NODE_ENV=$env
API_VERSION=v1

# Server Configuration
API_PORT=3333
WEB_PORT=4200
ADMIN_PORT=4201

# Database Configuration
POSTGRES_DB=aegisx_${env}
POSTGRES_USER=aegisx_user
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PORT=6379

# Feature Flags
ENABLE_SWAGGER=$([ "$env" != "production" ] && echo "true" || echo "false")
ENABLE_DEBUG=$([ "$env" == "development" ] && echo "true" || echo "false")
ENABLE_CORS_DEBUG=$([ "$env" != "production" ] && echo "true" || echo "false")

# Monitoring
LOG_LEVEL=$([ "$env" == "development" ] && echo "debug" || echo "info")
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true

EOF
        success "Created base environment file: $env_file"
    else
        warn "Environment file already exists: $env_file"
    fi
    
    # Create secrets template
    if [[ ! -f "$secrets_file" ]]; then
        cat > "$secrets_file" << EOF
# AegisX $env Secrets (DO NOT COMMIT)
# Generated: $(date)

# Database Secrets
POSTGRES_PASSWORD=CHANGE_ME_$(openssl rand -hex 16)
REDIS_PASSWORD=CHANGE_ME_$(openssl rand -hex 16)

# JWT Secrets
JWT_SECRET=CHANGE_ME_$(openssl rand -hex 32)
JWT_REFRESH_SECRET=CHANGE_ME_$(openssl rand -hex 32)

# Session Secret
SESSION_SECRET=CHANGE_ME_$(openssl rand -hex 24)

# Monitoring Secrets
GRAFANA_ADMIN_PASSWORD=CHANGE_ME_$(openssl rand -hex 12)

EOF
        success "Created secrets file: $secrets_file"
        warn "Please update the secrets in: $secrets_file"
    else
        warn "Secrets file already exists: $secrets_file"
    fi
    
    # Create environment-specific configuration
    if [[ ! -f "$config_file" ]]; then
        cat > "$config_file" << EOF
{
  "environment": "$env",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0.0",
  "description": "AegisX $env environment configuration",
  "settings": {
    "deployment": {
      "strategy": "$([ "$env" == "production" ] && echo "blue-green" || echo "direct")",
      "healthCheckTimeout": $([ "$env" == "production" ] && echo "60" || echo "30"),
      "rollbackEnabled": $([ "$env" == "production" ] && echo "true" || echo "false")
    },
    "scaling": {
      "apiReplicas": $([ "$env" == "production" ] && echo "3" || echo "1"),
      "webReplicas": $([ "$env" == "production" ] && echo "2" || echo "1"),
      "autoScaling": $([ "$env" == "production" ] && echo "true" || echo "false")
    },
    "security": {
      "tlsEnabled": $([ "$env" == "production" ] && echo "true" || echo "false"),
      "rateLimiting": $([ "$env" == "production" ] && echo "strict" || echo "permissive"),
      "corsOrigins": $([ "$env" == "development" ] && echo "[\"*\"]" || echo "[\"https://yourdomain.com\"]")
    },
    "monitoring": {
      "metricsRetention": "$([ "$env" == "production" ] && echo "30d" || echo "7d")",
      "logLevel": "$([ "$env" == "development" ] && echo "debug" || echo "info")",
      "alertingEnabled": $([ "$env" == "production" ] && echo "true" || echo "false")
    },
    "backup": {
      "schedule": "$([ "$env" == "production" ] && echo "0 2 * * *" || echo "0 4 * * 0")",
      "retention": "$([ "$env" == "production" ] && echo "30" || echo "7")",
      "enabled": $([ "$env" != "development" ] && echo "true" || echo "false")
    }
  }
}
EOF
        success "Created configuration file: $config_file"
    else
        warn "Configuration file already exists: $config_file"
    fi
    
    # Create environment-specific docker-compose override
    local compose_override="$ENV_DIR/$env/docker-compose.$env.yml"
    if [[ ! -f "$compose_override" ]]; then
        cat > "$compose_override" << EOF
version: '3.8'

# AegisX $env Environment Override
services:
  api:
    environment:
      - NODE_ENV=$env
    deploy:
      replicas: $([ "$env" == "production" ] && echo "3" || echo "1")
      resources:
        limits:
          cpus: '$([ "$env" == "production" ] && echo "1.0" || echo "0.5")'
          memory: $([ "$env" == "production" ] && echo "1G" || echo "512M")
        reservations:
          cpus: '$([ "$env" == "production" ] && echo "0.5" || echo "0.25")'
          memory: $([ "$env" == "production" ] && echo "512M" || echo "256M")

  web:
    deploy:
      replicas: $([ "$env" == "production" ] && echo "2" || echo "1")
      resources:
        limits:
          cpus: '$([ "$env" == "production" ] && echo "0.5" || echo "0.25")'
          memory: $([ "$env" == "production" ] && echo "512M" || echo "256M")

  postgres:
    environment:
      - POSTGRES_DB=aegisx_${env}
    command: >
      postgres
      -c shared_buffers=$([ "$env" == "production" ] && echo "256MB" || echo "128MB")
      -c effective_cache_size=$([ "$env" == "production" ] && echo "1GB" || echo "512MB")
      -c max_connections=$([ "$env" == "production" ] && echo "100" || echo "50")

EOF
        success "Created Docker Compose override: $compose_override"
    fi
    
    success "Environment '$env' initialized successfully!"
    log "Next steps:"
    log "1. Update secrets in: $secrets_file"
    log "2. Review configuration in: $config_file"
    log "3. Validate with: $0 validate $env"
}

# Switch to environment
switch_environment() {
    local env="$1"
    validate_env_name "$env"
    
    log "Switching to $env environment..."
    
    local env_file="$ENV_DIR/$env/.env.$env"
    local secrets_file="$ENV_DIR/$env/.env.$env.secrets"
    local target_env_file="$PROJECT_ROOT/.env.$env"
    
    if [[ ! -f "$env_file" ]]; then
        error "Environment file not found: $env_file"
        error "Run: $0 init $env"
        exit 1
    fi
    
    # Backup current configuration
    if [[ -f "$target_env_file" ]]; then
        cp "$target_env_file" "$BACKUP_DIR/.env.$env.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Combine base config and secrets
    cat "$env_file" > "$target_env_file"
    if [[ -f "$secrets_file" ]]; then
        echo "" >> "$target_env_file"
        echo "# Secrets (from $secrets_file)" >> "$target_env_file"
        cat "$secrets_file" >> "$target_env_file"
    fi
    
    # Set current environment marker
    echo "$env" > "$PROJECT_ROOT/.current-env"
    
    success "Switched to $env environment"
    log "Active environment file: $target_env_file"
}

# Validate environment configuration
validate_environment() {
    local env="$1"
    validate_env_name "$env"
    
    log "Validating $env environment configuration..."
    
    local env_file="$ENV_DIR/$env/.env.$env"
    local secrets_file="$ENV_DIR/$env/.env.$env.secrets"
    local config_file="$ENV_DIR/$env/config.json"
    
    local errors=0
    
    # Check required files
    for file in "$env_file" "$config_file"; do
        if [[ ! -f "$file" ]]; then
            error "Missing file: $file"
            ((errors++))
        fi
    done
    
    if [[ ! -f "$secrets_file" ]] && [[ "$env" != "development" ]]; then
        error "Missing secrets file: $secrets_file"
        ((errors++))
    fi
    
    # Validate configuration file JSON
    if [[ -f "$config_file" ]]; then
        if ! jq . "$config_file" > /dev/null 2>&1; then
            error "Invalid JSON in configuration file: $config_file"
            ((errors++))
        fi
    fi
    
    # Check for default passwords
    if [[ -f "$secrets_file" ]]; then
        if grep -q "CHANGE_ME" "$secrets_file"; then
            error "Default passwords found in: $secrets_file"
            error "Please update all CHANGE_ME values"
            ((errors++))
        fi
    fi
    
    # Validate environment variables
    if [[ -f "$env_file" ]]; then
        local required_vars=("NODE_ENV" "API_PORT" "POSTGRES_DB")
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$env_file"; then
                error "Missing required variable: $var"
                ((errors++))
            fi
        done
    fi
    
    if [[ $errors -eq 0 ]]; then
        success "Environment '$env' validation passed!"
    else
        error "Environment '$env' validation failed with $errors error(s)"
        exit 1
    fi
}

# Generate/rotate secrets for environment
manage_secrets() {
    local env="$1"
    local action="${2:-generate}"
    validate_env_name "$env"
    
    local secrets_file="$ENV_DIR/$env/.env.$env.secrets"
    
    case "$action" in
        generate)
            log "Generating new secrets for $env environment..."
            
            # Backup existing secrets
            if [[ -f "$secrets_file" ]]; then
                cp "$secrets_file" "$secrets_file.backup.$(date +%Y%m%d_%H%M%S)"
            fi
            
            # Generate new secrets
            cat > "$secrets_file" << EOF
# AegisX $env Secrets (DO NOT COMMIT)
# Generated: $(date)
# Action: $action

# Database Secrets
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# JWT Secrets
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

# Session Secret
SESSION_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-32)

# Monitoring Secrets
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-16)

# API Keys (customize as needed)
ADMIN_API_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

EOF
            success "Generated new secrets for $env environment"
            warn "Please update any external services with new credentials"
            ;;
        rotate)
            log "Rotating secrets for $env environment..."
            manage_secrets "$env" "generate"
            log "Consider updating dependent services"
            ;;
        *)
            error "Invalid secrets action: $action"
            error "Supported actions: generate, rotate"
            exit 1
            ;;
    esac
}

# Show current environment status
show_status() {
    log "AegisX Environment Status"
    echo
    
    local current_env_file="$PROJECT_ROOT/.current-env"
    if [[ -f "$current_env_file" ]]; then
        local current_env=$(cat "$current_env_file")
        success "Current environment: $current_env"
    else
        warn "No environment currently active"
    fi
    
    echo
    log "Available environments:"
    for env in "${ENVIRONMENTS[@]}"; do
        local env_file="$ENV_DIR/$env/.env.$env"
        local config_file="$ENV_DIR/$env/config.json"
        
        if [[ -f "$env_file" && -f "$config_file" ]]; then
            echo "  ✅ $env (configured)"
        elif [[ -f "$env_file" ]]; then
            echo "  ⚠️  $env (partial - missing config.json)"
        else
            echo "  ❌ $env (not initialized)"
        fi
    done
}

# Main function
main() {
    ensure_directories
    
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        init)
            [[ $# -eq 0 ]] && { error "Environment name required"; exit 1; }
            init_environment "$1"
            ;;
        switch)
            [[ $# -eq 0 ]] && { error "Environment name required"; exit 1; }
            switch_environment "$1"
            ;;
        validate)
            [[ $# -eq 0 ]] && { error "Environment name required"; exit 1; }
            validate_environment "$1"
            ;;
        secrets)
            [[ $# -eq 0 ]] && { error "Environment name required"; exit 1; }
            manage_secrets "$1" "${2:-generate}"
            ;;
        status)
            show_status
            ;;
        list)
            log "Available environments: ${ENVIRONMENTS[*]}"
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"