#!/bin/bash

# Port Manager Script
# Manage multiple AegisX instances and their ports

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

REGISTRY_FILE="$HOME/.aegisx-port-registry"

# Function: Show all instances
show_instances() {
    print_status "📋 AegisX Instances Registry"
    echo "================================="
    
    if [ ! -f "$REGISTRY_FILE" ]; then
        print_warning "No instances registered yet"
        return
    fi
    
    echo -e "${BLUE}FOLDER${NC}\t\t${BLUE}POSTGRES${NC}\t${BLUE}REDIS${NC}\t${BLUE}API${NC}\t${BLUE}WEB${NC}\t${BLUE}ADMIN${NC}\t${BLUE}PGADMIN${NC}\t${BLUE}STATUS${NC}"
    echo "----------------------------------------------------------------------------------------------------"
    
    while IFS=: read -r folder postgres redis api web admin timestamp; do
        if [ -n "$folder" ]; then
            # Check if containers are running
            if docker ps --format "table {{.Names}}" | grep -q "aegisx.*${folder#aegisx-starter-}"; then
                status="${GREEN}Running${NC}"
            else
                status="${YELLOW}Stopped${NC}"
            fi
            
            printf "%-20s\t%s\t%s\t%s\t%s\t%s\t%s\t%b\n" \
                "$folder" "$postgres" "$redis" "$api" "$web" "$admin" "$status"
        fi
    done < "$REGISTRY_FILE"
}

# Function: Check port conflicts
check_conflicts() {
    print_status "🔍 Checking for port conflicts..."
    
    if [ ! -f "$REGISTRY_FILE" ]; then
        print_success "No instances to check"
        return
    fi
    
    declare -A port_usage
    conflicts=0
    
    # Build port usage map
    while IFS=: read -r folder postgres redis api web admin timestamp; do
        if [ -n "$folder" ]; then
            # Check each port
            for port in $postgres $redis $api $web $admin; do
                if [ -n "${port_usage[$port]}" ]; then
                    print_error "Port conflict: $port used by both ${port_usage[$port]} and $folder"
                    conflicts=1
                else
                    port_usage[$port]=$folder
                fi
            done
        fi
    done < "$REGISTRY_FILE"
    
    if [ $conflicts -eq 0 ]; then
        print_success "No port conflicts detected"
    else
        print_warning "Run 'setup-env.sh' in conflicted folders to reassign ports"
    fi
}

# Function: Stop instance
stop_instance() {
    local folder_name=$1
    
    if [ -z "$folder_name" ]; then
        print_error "Usage: port-manager.sh stop [folder-name]"
        return 1
    fi
    
    # Find instance in registry
    if ! grep -q "^$folder_name:" "$REGISTRY_FILE" 2>/dev/null; then
        print_error "Instance '$folder_name' not found in registry"
        return 1
    fi
    
    print_status "🛑 Stopping instance: $folder_name"
    
    # Extract suffix for container names
    if [ "$folder_name" = "aegisx-starter" ]; then
        containers="aegisx_postgres aegisx_redis"
    else
        suffix=${folder_name#aegisx-starter-}
        suffix=${suffix#-}
        containers="aegisx_${suffix}_postgres aegisx_${suffix}_redis"
    fi
    
    # Stop containers
    for container in $containers; do
        if docker ps -q -f name="$container" | grep -q .; then
            print_status "Stopping container: $container"
            docker stop "$container" >/dev/null 2>&1 || true
        fi
    done
    
    print_success "Instance '$folder_name' stopped"
}

# Function: Stop all instances
stop_all() {
    print_status "🛑 Stopping all AegisX instances..."
    
    if [ ! -f "$REGISTRY_FILE" ]; then
        print_warning "No instances registered"
        return
    fi
    
    while IFS=: read -r folder postgres redis api web admin timestamp; do
        if [ -n "$folder" ]; then
            stop_instance "$folder"
        fi
    done < "$REGISTRY_FILE"
    
    print_success "All instances stopped"
}

# Function: Clean up unused containers and volumes
cleanup() {
    print_status "🧹 Cleaning up unused AegisX resources..."
    
    # Remove stopped AegisX containers
    if docker ps -a --format "table {{.Names}}" | grep -q "aegisx_"; then
        print_status "Removing stopped AegisX containers..."
        docker ps -a --format "table {{.Names}}" | grep "aegisx_" | xargs -r docker rm -f >/dev/null 2>&1 || true
    fi
    
    # Remove unused AegisX volumes
    if docker volume ls --format "table {{.Name}}" | grep -E "(postgres_data|redis_data)"; then
        print_status "Found AegisX volumes:"
        docker volume ls --format "table {{.Name}}" | grep -E "(postgres_data|redis_data)"
        echo ""
        read -p "Remove unused volumes? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker volume ls --format "table {{.Name}}" | grep -E "(postgres_data|redis_data)" | xargs -r docker volume rm >/dev/null 2>&1 || true
            print_success "Unused volumes removed"
        fi
    fi
    
    print_success "Cleanup completed"
}

# Function: Show running services
show_running() {
    print_status "🚀 Running AegisX Services"
    echo "=========================="
    
    # Show running containers
    aegisx_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "aegisx_" || echo "")
    
    if [ -n "$aegisx_containers" ]; then
        echo "$aegisx_containers"
    else
        print_warning "No AegisX containers running"
    fi
    
    echo ""
    
    # Show port usage
    print_status "📊 Port Usage"
    echo "============="
    
    if [ -f "$REGISTRY_FILE" ]; then
        while IFS=: read -r folder postgres redis api web admin timestamp; do
            if [ -n "$folder" ]; then
                echo "$folder:"
                echo "  PostgreSQL: $postgres"
                echo "  Redis: $redis"
                echo "  API: $api"
                echo "  Web: $web"
                echo "  Admin: $admin"
                echo ""
            fi
        done < "$REGISTRY_FILE"
    fi
}

# Function: Show help
show_help() {
    print_status "🛠️ AegisX Port Manager"
    echo "======================="
    echo
    echo "Available commands:"
    echo "  list                    - Show all registered instances"
    echo "  conflicts              - Check for port conflicts"
    echo "  stop [folder-name]     - Stop specific instance"
    echo "  stop-all               - Stop all instances"
    echo "  running                - Show running services"
    echo "  cleanup                - Clean up unused containers and volumes"
    echo "  help                   - Show this help"
    echo
    echo "Examples:"
    echo "  ./scripts/port-manager.sh list"
    echo "  ./scripts/port-manager.sh stop aegisx-starter-mpv"
    echo "  ./scripts/port-manager.sh stop-all"
    echo
    echo "Registry file: $REGISTRY_FILE"
}

# Main script logic
case "${1:-list}" in
    "list"|"ls")
        show_instances
        ;;
    "conflicts"|"check")
        check_conflicts
        ;;
    "stop")
        stop_instance "$2"
        ;;
    "stop-all"|"stopall")
        stop_all
        ;;
    "running"|"status")
        show_running
        ;;
    "cleanup"|"clean")
        cleanup
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac