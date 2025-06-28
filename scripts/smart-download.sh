#!/bin/bash
# ============================================
# CRM PostgreSQL System - Smart Download Script
# Gestisce download intelligente con backup automatico
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project settings
PROJECT_NAME="CRM-PostgreSQL-System"
REPO_URL="https://github.com/mcatania72/CRM-PostgreSQL-System.git"
TARGET_DIR="/home/devops/$PROJECT_NAME"

print_header() {
    echo -e "${BLUE}"
    echo "======================================="
    echo "   CRM PostgreSQL System"
    echo "   Smart Download & Update"
    echo "======================================="
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if directory exists
check_existing_directory() {
    if [ -d "$TARGET_DIR" ]; then
        log_warning "Directory $TARGET_DIR already exists"
        return 0
    else
        log_info "Directory $TARGET_DIR does not exist"
        return 1
    fi
}

# Check if it's a git repository
check_git_repo() {
    if [ -d "$TARGET_DIR/.git" ]; then
        log_info "Existing directory is a git repository"
        return 0
    else
        log_warning "Existing directory is NOT a git repository"
        return 1
    fi
}

# Update existing git repository
update_git_repo() {
    log_info "Updating existing git repository..."
    cd "$TARGET_DIR"
    
    # Check current remote
    CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [ "$CURRENT_REMOTE" = "$REPO_URL" ]; then
        log_info "Repository URL matches, updating..."
        git fetch origin
        git reset --hard origin/main
        git clean -fd
        log_success "Repository updated successfully"
    else
        log_warning "Repository URL doesn't match"
        log_warning "Current: $CURRENT_REMOTE"
        log_warning "Expected: $REPO_URL"
        return 1
    fi
}

# Backup existing directory
backup_directory() {
    local backup_name="${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="/home/devops/$backup_name"
    
    log_info "Creating backup: $backup_name"
    mv "$TARGET_DIR" "$backup_path"
    log_success "Backup created: $backup_path"
}

# Fresh clone
fresh_clone() {
    log_info "Performing fresh clone..."
    cd /home/devops
    git clone "$REPO_URL"
    log_success "Repository cloned successfully"
}

# Interactive mode - ask user what to do
interactive_choice() {
    echo
    log_warning "Directory $TARGET_DIR already exists!"
    echo
    echo "Choose an option:"
    echo "1) Update existing repository (if it's a git repo)"
    echo "2) Backup existing and fresh clone"
    echo "3) Remove existing and fresh clone"
    echo "4) Abort operation"
    echo
    read -p "Enter your choice [1-4]: " -n 1 -r choice
    echo
    
    case $choice in
        1)
            if check_git_repo; then
                if update_git_repo; then
                    return 0
                else
                    log_error "Failed to update repository"
                    return 1
                fi
            else
                log_error "Directory is not a git repository, cannot update"
                return 1
            fi
            ;;
        2)
            backup_directory
            fresh_clone
            return 0
            ;;
        3)
            log_warning "Removing existing directory..."
            rm -rf "$TARGET_DIR"
            fresh_clone
            return 0
            ;;
        4)
            log_info "Operation aborted by user"
            exit 0
            ;;
        *)
            log_error "Invalid choice"
            return 1
            ;;
    esac
}

# Auto mode - smart automatic handling
auto_mode() {
    if check_git_repo; then
        log_info "Auto mode: Updating existing git repository"
        if update_git_repo; then
            return 0
        else
            log_warning "Update failed, creating backup and fresh clone"
            backup_directory
            fresh_clone
            return 0
        fi
    else
        log_info "Auto mode: Creating backup and fresh clone"
        backup_directory
        fresh_clone
        return 0
    fi
}

# Main function
main() {
    print_header
    
    # Parse arguments
    MODE="interactive"
    if [ "$1" = "--auto" ] || [ "$1" = "-a" ]; then
        MODE="auto"
    fi
    
    log_info "Starting smart download in $MODE mode..."
    log_info "Target directory: $TARGET_DIR"
    log_info "Repository URL: $REPO_URL"
    echo
    
    # Check if directory exists
    if check_existing_directory; then
        if [ "$MODE" = "auto" ]; then
            auto_mode
        else
            interactive_choice
        fi
    else
        # Directory doesn't exist, just clone
        fresh_clone
    fi
    
    # Verify final result
    if [ -d "$TARGET_DIR" ] && [ -f "$TARGET_DIR/docker-compose.yml" ]; then
        log_success "✅ Repository ready at: $TARGET_DIR"
        log_info "Next steps:"
        echo "  cd $TARGET_DIR"
        echo "  ./scripts/setup-environment-silent.sh"
        echo "  docker-compose up -d"
    else
        log_error "❌ Something went wrong. Repository not properly downloaded."
        exit 1
    fi
}

# Usage information
usage() {
    echo "Usage: $0 [--auto|-a]"
    echo
    echo "Modes:"
    echo "  (no args)  Interactive mode - asks what to do if directory exists"
    echo "  --auto     Automatic mode - smart handling without prompts"
    echo
    echo "Examples:"
    echo "  $0                # Interactive mode"
    echo "  $0 --auto         # Automatic mode"
}

# Handle help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    usage
    exit 0
fi

# Run main function
main "$@"