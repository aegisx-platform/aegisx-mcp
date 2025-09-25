#!/bin/bash

# Load environment variables from .env.local (if exists) and .env
# Usage: ./scripts/load-env.sh <command>
# Example: ./scripts/load-env.sh nx serve api --port=$API_PORT

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_debug() {
    if [[ "$DEBUG_ENV" == "true" ]]; then
        echo -e "${BLUE}[DEBUG] $1${NC}"
    fi
}

print_info() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Function to load environment file
load_env_file() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        print_debug "Loading environment from: $env_file"
        
        # Export variables from the file
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Skip comments and empty lines
            if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
                continue
            fi
            
            # Extract key=value pairs
            if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]// /}"  # Remove spaces
                value="${BASH_REMATCH[2]}"
                
                # Remove quotes if present
                if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then
                    value="${BASH_REMATCH[1]}"
                fi
                
                # Export the variable
                export "$key=$value"
                print_debug "Exported: $key=$value"
            fi
        done < "$env_file"
        
        print_info "Loaded environment from: $env_file"
        return 0
    else
        print_debug "Environment file not found: $env_file"
        return 1
    fi
}

# Main execution
main() {
    print_debug "Starting environment loader..."
    
    # Load environment files in order (later files override earlier ones)
    load_env_file ".env" || true
    load_env_file ".env.local" || true
    
    # Show key ports for debugging
    if [[ "$DEBUG_ENV" == "true" ]]; then
        echo -e "${BLUE}[DEBUG] Current environment:${NC}"
        echo -e "${BLUE}  API_PORT: ${API_PORT:-3333}${NC}"
        echo -e "${BLUE}  WEB_PORT: ${WEB_PORT:-4200}${NC}"
        echo -e "${BLUE}  ADMIN_PORT: ${ADMIN_PORT:-4201}${NC}"
        echo -e "${BLUE}  DATABASE_PORT: ${DATABASE_PORT:-5432}${NC}"
        echo -e "${BLUE}  REDIS_PORT: ${REDIS_PORT:-6380}${NC}"
    fi
    
    # Execute the command with loaded environment
    if [[ $# -eq 0 ]]; then
        print_error "No command provided"
        print_info "Usage: $0 <command> [args...]"
        print_info "Example: $0 nx serve api --port=\$API_PORT"
        exit 1
    fi
    
    print_info "Executing: $*"
    
    # For shell -c commands, handle them specially
    if [[ ("$1" == "bash" || "$1" == "sh") && "$2" == "-c" ]]; then
        print_debug "Executing $1 command: $3"
        # Execute shell -c with expanded variables (but don't eval since vars are already exported)
        "$1" -c "$3"
    else
        # Expand shell variables in arguments
        local expanded_args=()
        for arg in "$@"; do
            expanded_args+=("$(eval echo "$arg")")
        done
        
        print_debug "Expanded command: ${expanded_args[*]}"
        
        # Execute the command with loaded environment
        "${expanded_args[@]}"
    fi
}

# Run main function with all arguments
main "$@"