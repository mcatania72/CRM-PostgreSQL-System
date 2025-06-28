#!/bin/bash
# ============================================
# CRM PostgreSQL System - Prerequisites Installer
# Installa tutti i prerequisiti necessari automaticamente
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> ~/crm-postgres-install.log
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') SUCCESS: $1" >> ~/crm-postgres-install.log
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') WARNING: $1" >> ~/crm-postgres-install.log
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: $1" >> ~/crm-postgres-install.log
}

print_header() {
    echo -e "${BLUE}"
    echo "======================================="
    echo "   CRM PostgreSQL System Setup"
    echo "   Prerequisites Installation"
    echo "======================================="
    echo -e "${NC}"
}

check_system() {
    log "Checking system requirements..."
    
    # Check Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        log_error "This script requires Ubuntu/Debian with apt package manager"
        exit 1
    fi
    
    # Check if running as non-root
    if [ "$EUID" -eq 0 ]; then
        log_error "Please run this script as a non-root user (use sudo only when prompted)"
        exit 1
    fi
    
    # Check internet connectivity
    if ! ping -c 1 google.com &> /dev/null; then
        log_error "Internet connectivity required for downloading packages"
        exit 1
    fi
    
    log_success "System requirements check passed"
}

update_system() {
    log "Updating system packages..."
    sudo apt update -qq
    sudo apt upgrade -y -qq
    log_success "System packages updated"
}

install_nodejs() {
    log "Installing Node.js 20.x..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_success "Node.js $NODE_VERSION already installed (>= 18)"
            return
        fi
    fi
    
    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_success "Node.js $NODE_VERSION and npm $NPM_VERSION installed"
    else
        log_error "Node.js installation failed"
        exit 1
    fi
}

install_docker() {
    log "Installing Docker and Docker Compose..."
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        log_success "Docker already installed: $(docker --version)"
    else
        # Install Docker
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update -qq
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        log_success "Docker installed: $(docker --version)"
        log_warning "Please logout and login again for Docker group membership to take effect"
    fi
    
    # Install Docker Compose
    if command -v docker-compose &> /dev/null; then
        log_success "Docker Compose already installed: $(docker-compose --version)"
    else
        # Install Docker Compose v2
        sudo apt-get install -y docker-compose-plugin
        
        # Create alias for docker-compose
        if ! grep -q "alias docker-compose='docker compose'" ~/.bashrc; then
            echo "alias docker-compose='docker compose'" >> ~/.bashrc
        fi
        
        log_success "Docker Compose installed"
    fi
}

install_git() {
    log "Installing Git..."
    
    if command -v git &> /dev/null; then
        log_success "Git already installed: $(git --version)"
    else
        sudo apt-get install -y git
        log_success "Git installed: $(git --version)"
    fi
}

install_utilities() {
    log "Installing utility packages..."
    
    PACKAGES=(
        "curl"
        "wget"
        "unzip"
        "jq"
        "tree"
        "htop"
        "vim"
        "nano"
        "net-tools"
        "postgresql-client"
    )
    
    for package in "${PACKAGES[@]}"; do
        if dpkg -l | grep -q "^ii  $package "; then
            log_success "$package already installed"
        else
            sudo apt-get install -y $package
            log_success "$package installed"
        fi
    done
}

configure_firewall() {
    log "Configuring firewall for CRM PostgreSQL System..."
    
    # Check if UFW is installed
    if command -v ufw &> /dev/null; then
        # Check if UFW is active
        if sudo ufw status | grep -q "Status: active"; then
            log "UFW is active, configuring ports..."
            
            # Open ports for CRM PostgreSQL System
            sudo ufw allow 4000:4010/tcp comment 'CRM PostgreSQL System'
            sudo ufw reload
            
            log_success "Firewall configured for ports 4000-4010"
        else
            log_warning "UFW is installed but not active. Ports will be accessible without restrictions."
        fi
    else
        log_warning "UFW not installed. Installing and configuring..."
        sudo apt-get install -y ufw
        sudo ufw --force enable
        sudo ufw allow 4000:4010/tcp comment 'CRM PostgreSQL System'
        sudo ufw reload
        log_success "UFW installed and configured"
    fi
}

verify_installation() {
    log "Verifying installation..."
    
    ERRORS=0
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_success "✅ Node.js: $(node --version)"
        else
            log_error "❌ Node.js version too old: $(node --version)"
            ERRORS=$((ERRORS + 1))
        fi
    else
        log_error "❌ Node.js not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        log_success "✅ npm: $(npm --version)"
    else
        log_error "❌ npm not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        log_success "✅ Docker: $(docker --version)"
    else
        log_error "❌ Docker not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        log_success "✅ Docker Compose available"
    else
        log_error "❌ Docker Compose not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        log_success "✅ Git: $(git --version)"
    else
        log_error "❌ Git not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check PostgreSQL client
    if command -v psql &> /dev/null; then
        log_success "✅ PostgreSQL client: $(psql --version)"
    else
        log_warning "⚠️ PostgreSQL client not found (optional)"
    fi
    
    if [ $ERRORS -eq 0 ]; then
        log_success "🎉 All prerequisites installed successfully!"
        return 0
    else
        log_error "❌ $ERRORS prerequisites failed to install"
        return 1
    fi
}

print_next_steps() {
    echo -e "${GREEN}"
    echo "======================================="
    echo "   Prerequisites Installation Complete"
    echo "======================================="
    echo -e "${NC}"
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. If Docker was just installed, logout and login again"
    echo "2. Run: ./setup-environment.sh"
    echo "3. Run: docker-compose up -d"
    echo "4. Access: http://localhost:4000"
    echo
    echo -e "${BLUE}Log file:${NC} ~/crm-postgres-install.log"
    echo
}

# Main execution
main() {
    print_header
    
    log "Starting prerequisites installation..."
    
    check_system
    update_system
    install_git
    install_nodejs
    install_docker
    install_utilities
    configure_firewall
    
    if verify_installation; then
        print_next_steps
        exit 0
    else
        log_error "Prerequisites installation failed. Check log: ~/crm-postgres-install.log"
        exit 1
    fi
}

# Run main function
main "$@"