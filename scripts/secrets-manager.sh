#!/bin/bash
set -euo pipefail

# AegisX Secrets Management Script
# Handles secure generation, validation, and rotation of secrets

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.production"
ENV_EXAMPLE=".env.production.example"
SECRETS_DIR="./secrets"
BACKUP_DIR="./backups/secrets"
LOG_FILE="./logs/secrets-$(date +'%Y%m%d').log"

# Ensure directories exist
mkdir -p "$SECRETS_DIR" "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Generate secure random string
generate_random_string() {
    local length=${1:-32}
    local charset=${2:-"A-Za-z0-9"}
    
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 $((length * 3 / 4)) | tr -d '=' | head -c "$length"
    elif command -v head >/dev/null 2>&1 && [[ -c /dev/urandom ]]; then
        head -c "$length" /dev/urandom | base64 | tr -d '=+/' | head -c "$length"
    else
        # Fallback method
        cat /dev/urandom | tr -dc "$charset" | head -c "$length"
    fi
}

# Generate JWT secret (longer for better security)
generate_jwt_secret() {
    local length=64
    generate_random_string "$length" "A-Za-z0-9!@#$%^&*"
}

# Generate database password
generate_db_password() {
    local length=24
    generate_random_string "$length" "A-Za-z0-9!@#$%^&*-_"
}

# Generate simple password
generate_simple_password() {
    local length=${1:-16}
    generate_random_string "$length" "A-Za-z0-9"
}

# Validate password strength
validate_password_strength() {
    local password=$1
    local min_length=12
    local score=0
    
    # Check minimum length
    if [[ ${#password} -ge $min_length ]]; then
        score=$((score + 1))
    else
        return 1
    fi
    
    # Check for uppercase
    if [[ "$password" =~ [A-Z] ]]; then
        score=$((score + 1))
    fi
    
    # Check for lowercase
    if [[ "$password" =~ [a-z] ]]; then
        score=$((score + 1))
    fi
    
    # Check for numbers
    if [[ "$password" =~ [0-9] ]]; then
        score=$((score + 1))
    fi
    
    # Check for special characters
    if [[ "$password" =~ [!@#\$%\^&\*\-_] ]]; then
        score=$((score + 1))
    fi
    
    # Require at least 4 out of 5 criteria
    if [[ $score -ge 4 ]]; then
        return 0
    else
        return 1
    fi
}

# Check if environment file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$ENV_EXAMPLE" ]]; then
            log "Creating $ENV_FILE from example..."
            cp "$ENV_EXAMPLE" "$ENV_FILE"
        else
            error "Environment file $ENV_FILE and example file $ENV_EXAMPLE not found"
            exit 1
        fi
    fi
}

# Backup current environment file
backup_env_file() {
    if [[ -f "$ENV_FILE" ]]; then
        local backup_file="$BACKUP_DIR/env-backup-$(date +'%Y%m%d-%H%M%S')"
        cp "$ENV_FILE" "$backup_file"
        log "Environment file backed up to: $backup_file"
    fi
}

# Update environment variable
update_env_var() {
    local var_name=$1
    local var_value=$2
    local env_file=${3:-$ENV_FILE}
    
    # Escape special characters for sed
    local escaped_value=$(printf '%s\n' "$var_value" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    if grep -q "^${var_name}=" "$env_file"; then
        # Update existing variable
        sed -i.bak "s|^${var_name}=.*|${var_name}=${escaped_value}|" "$env_file"
    else
        # Add new variable
        echo "${var_name}=${var_value}" >> "$env_file"
    fi
    
    # Remove backup file created by sed
    rm -f "${env_file}.bak"
}

# Generate all secrets
generate_all_secrets() {
    log "Generating all production secrets..."
    
    check_env_file
    backup_env_file
    
    # Generate core secrets
    log "Generating PostgreSQL password..."
    local postgres_password=$(generate_db_password)
    update_env_var "POSTGRES_PASSWORD" "$postgres_password"
    
    log "Generating Redis password..."
    local redis_password=$(generate_db_password)
    update_env_var "REDIS_PASSWORD" "$redis_password"
    
    log "Generating JWT secret..."
    local jwt_secret=$(generate_jwt_secret)
    update_env_var "JWT_SECRET" "$jwt_secret"
    
    log "Generating Grafana admin password..."
    local grafana_password=$(generate_simple_password 20)
    update_env_var "GRAFANA_ADMIN_PASSWORD" "$grafana_password"
    
    # Generate optional secrets if they exist in the file
    if grep -q "^SMTP_PASSWORD=" "$ENV_FILE"; then
        log "Generating SMTP password..."
        local smtp_password=$(generate_simple_password 16)
        update_env_var "SMTP_PASSWORD" "$smtp_password"
    fi
    
    if grep -q "^AWS_SECRET_ACCESS_KEY=" "$ENV_FILE"; then
        log "Generating AWS secret access key..."
        local aws_secret=$(generate_random_string 40)
        update_env_var "AWS_SECRET_ACCESS_KEY" "$aws_secret"
    fi
    
    # Save secrets to secure file
    save_secrets_to_file
    
    success "All secrets generated successfully!"
    warn "IMPORTANT: Store these secrets securely and never commit them to version control"
    
    display_secrets_summary
}

# Save secrets to encrypted file
save_secrets_to_file() {
    local secrets_file="$SECRETS_DIR/production-secrets-$(date +'%Y%m%d-%H%M%S').txt"
    
    {
        echo "=== AegisX Production Secrets ==="
        echo "Generated: $(date)"
        echo ""
        echo "POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)"
        echo "REDIS_PASSWORD=$(grep "^REDIS_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)"
        echo "JWT_SECRET=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2-)"
        echo "GRAFANA_ADMIN_PASSWORD=$(grep "^GRAFANA_ADMIN_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)"
        
        if grep -q "^SMTP_PASSWORD=" "$ENV_FILE"; then
            echo "SMTP_PASSWORD=$(grep "^SMTP_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)"
        fi
        
        if grep -q "^AWS_SECRET_ACCESS_KEY=" "$ENV_FILE"; then
            echo "AWS_SECRET_ACCESS_KEY=$(grep "^AWS_SECRET_ACCESS_KEY=" "$ENV_FILE" | cut -d'=' -f2-)"
        fi
        
        echo ""
        echo "=== Security Notes ==="
        echo "1. Store this file securely and restrict access"
        echo "2. Never commit secrets to version control"
        echo "3. Rotate secrets regularly"
        echo "4. Use external secret management in production"
        echo "5. Monitor for credential leaks"
        
    } > "$secrets_file"
    
    chmod 600 "$secrets_file"
    
    # Encrypt if GPG is available
    if command -v gpg >/dev/null 2>&1; then
        log "Encrypting secrets file..."
        if gpg --symmetric --cipher-algo AES256 "$secrets_file"; then
            rm "$secrets_file"
            secrets_file="${secrets_file}.gpg"
            success "Secrets encrypted and saved to: $secrets_file"
        else
            warn "Failed to encrypt secrets file"
            success "Secrets saved to: $secrets_file"
        fi
    else
        success "Secrets saved to: $secrets_file"
        warn "Install GPG for automatic encryption"
    fi
}

# Validate environment file
validate_env_file() {
    log "Validating environment file..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found"
        return 1
    fi
    
    local validation_errors=0
    
    # Check for required variables
    local required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "GRAFANA_ADMIN_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            error "Required variable $var not found"
            validation_errors=$((validation_errors + 1))
        else
            local value=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2-)
            
            # Check if value is placeholder
            if [[ "$value" == *"CHANGE_THIS"* ]] || [[ -z "$value" ]]; then
                error "Variable $var contains placeholder or empty value"
                validation_errors=$((validation_errors + 1))
            else
                # Validate password strength for password fields
                if [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"SECRET"* ]]; then
                    if validate_password_strength "$value"; then
                        success "$var has strong password"
                    else
                        warn "$var password may be weak"
                    fi
                fi
            fi
        fi
    done
    
    # Check for insecure defaults
    local insecure_patterns=(
        "password.*123"
        "secret.*abc"
        "admin.*admin"
        "test.*test"
        "default.*default"
    )
    
    for pattern in "${insecure_patterns[@]}"; do
        if grep -iq "$pattern" "$ENV_FILE"; then
            warn "Potentially insecure default value found matching pattern: $pattern"
        fi
    done
    
    if [[ $validation_errors -eq 0 ]]; then
        success "Environment file validation passed"
        return 0
    else
        error "Environment file validation failed with $validation_errors errors"
        return 1
    fi
}

# Rotate specific secret
rotate_secret() {
    local secret_name=$1
    
    if [[ -z "$secret_name" ]]; then
        error "Please specify secret name to rotate"
        return 1
    fi
    
    log "Rotating secret: $secret_name"
    
    check_env_file
    backup_env_file
    
    case "$secret_name" in
        "postgres"|"POSTGRES_PASSWORD")
            local new_password=$(generate_db_password)
            update_env_var "POSTGRES_PASSWORD" "$new_password"
            success "PostgreSQL password rotated"
            warn "Remember to restart PostgreSQL container after rotation"
            ;;
        "redis"|"REDIS_PASSWORD")
            local new_password=$(generate_db_password)
            update_env_var "REDIS_PASSWORD" "$new_password"
            success "Redis password rotated"
            warn "Remember to restart Redis container after rotation"
            ;;
        "jwt"|"JWT_SECRET")
            local new_secret=$(generate_jwt_secret)
            update_env_var "JWT_SECRET" "$new_secret"
            success "JWT secret rotated"
            warn "All existing JWTs will be invalidated"
            ;;
        "grafana"|"GRAFANA_ADMIN_PASSWORD")
            local new_password=$(generate_simple_password 20)
            update_env_var "GRAFANA_ADMIN_PASSWORD" "$new_password"
            success "Grafana admin password rotated"
            ;;
        *)
            error "Unknown secret: $secret_name"
            return 1
            ;;
    esac
    
    # Save updated secrets
    save_secrets_to_file
}

# Display secrets summary (masked)
display_secrets_summary() {
    log "=== Secrets Summary ==="
    
    if [[ -f "$ENV_FILE" ]]; then
        echo ""
        echo "PostgreSQL Password: $(grep "^POSTGRES_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/./*/g')"
        echo "Redis Password: $(grep "^REDIS_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/./*/g')"
        echo "JWT Secret: $(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/./*/g')"
        echo "Grafana Admin Password: $(grep "^GRAFANA_ADMIN_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/./*/g')"
        echo ""
        log "Use 'docker-compose restart' to apply new secrets"
    else
        error "Environment file not found"
    fi
}

# Check secret age
check_secret_age() {
    log "Checking secret age..."
    
    # Get file modification time
    if [[ -f "$ENV_FILE" ]]; then
        local file_age=$(stat -f %m "$ENV_FILE" 2>/dev/null || stat -c %Y "$ENV_FILE" 2>/dev/null)
        local current_time=$(date +%s)
        local age_days=$(( (current_time - file_age) / 86400 ))
        
        echo "Environment file age: $age_days days"
        
        if [[ $age_days -gt 90 ]]; then
            warn "Secrets are older than 90 days - consider rotation"
        elif [[ $age_days -gt 30 ]]; then
            log "Secrets are older than 30 days - monitor for rotation"
        else
            success "Secrets are relatively fresh"
        fi
    fi
}

# Generate Docker secrets
generate_docker_secrets() {
    log "Generating Docker secrets..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found"
        return 1
    fi
    
    # Create docker secrets directory
    local docker_secrets_dir="./docker/secrets"
    mkdir -p "$docker_secrets_dir"
    
    # Extract secrets and create files
    local secrets=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD" 
        "JWT_SECRET"
        "GRAFANA_ADMIN_PASSWORD"
    )
    
    for secret in "${secrets[@]}"; do
        local value=$(grep "^${secret}=" "$ENV_FILE" | cut -d'=' -f2-)
        if [[ -n "$value" ]]; then
            echo -n "$value" > "$docker_secrets_dir/${secret,,}_secret"
            chmod 600 "$docker_secrets_dir/${secret,,}_secret"
            success "Created Docker secret file for $secret"
        fi
    done
    
    success "Docker secrets created in $docker_secrets_dir/"
    warn "Ensure these files are not committed to version control"
}

# Script usage
usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  generate           - Generate all production secrets (default)"
    echo "  validate           - Validate environment file"
    echo "  rotate [secret]    - Rotate specific secret"
    echo "  summary            - Display secrets summary (masked)"
    echo "  age                - Check secret age"
    echo "  docker-secrets     - Generate Docker secrets files"
    echo ""
    echo "Secret names for rotation:"
    echo "  postgres           - PostgreSQL password"
    echo "  redis              - Redis password"
    echo "  jwt                - JWT secret"
    echo "  grafana            - Grafana admin password"
    echo ""
    echo "Examples:"
    echo "  $0                     # Generate all secrets"
    echo "  $0 validate            # Validate environment"
    echo "  $0 rotate jwt          # Rotate JWT secret"
    echo "  $0 summary             # Show summary"
}

# Main function
main() {
    local command="${1:-generate}"
    
    case "$command" in
        "generate")
            generate_all_secrets
            ;;
        "validate")
            validate_env_file
            ;;
        "rotate")
            local secret_name=$2
            if [[ -z "$secret_name" ]]; then
                error "Please specify secret to rotate"
                usage
                exit 1
            fi
            rotate_secret "$secret_name"
            ;;
        "summary")
            display_secrets_summary
            ;;
        "age")
            check_secret_age
            ;;
        "docker-secrets")
            generate_docker_secrets
            ;;
        "-h"|"--help")
            usage
            exit 0
            ;;
        *)
            echo "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"