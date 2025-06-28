#!/bin/bash
# ============================================
# CRM PostgreSQL System - Silent Prerequisites Installer
# Installa tutti i prerequisiti in modalità completamente silente
# ============================================

set -e  # Exit on error

# Silent logging (only to file)
SILENT_LOG="$HOME/crm-postgres-install-silent.log"

# Silent logging function
log_silent() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$SILENT_LOG"
}

# Check system silently
check_system_silent() {
    # Check Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        log_silent "ERROR: This script requires Ubuntu/Debian with apt package manager"
        exit 1
    fi
    
    # Check if running as non-root
    if [ "$EUID" -eq 0 ]; then
        log_silent "ERROR: Please run this script as a non-root user"
        exit 1
    fi
    
    # Check internet connectivity
    if ! ping -c 1 google.com &> /dev/null 2>&1; then
        log_silent "ERROR: Internet connectivity required"
        exit 1
    fi
    
    log_silent "SUCCESS: System requirements check passed"
}

# Silent system update
update_system_silent() {
    log_silent "INFO: Updating system packages..."
    
    # Completely silent apt operations
    export DEBIAN_FRONTEND=noninteractive
    sudo apt-get update -qq > /dev/null 2>&1
    sudo apt-get upgrade -y -qq > /dev/null 2>&1
    
    log_silent "SUCCESS: System packages updated"
}

# Silent Node.js installation
install_nodejs_silent() {
    log_silent "INFO: Installing Node.js 20.x..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_silent "SUCCESS: Node.js $NODE_VERSION already installed (>= 18)"
            return
        fi
    fi
    
    # Install Node.js 20.x silently
    curl -fsSL https://deb.nodesource.com/setup_20.x 2>/dev/null | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
    
    # Verify installation
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        log_silent "SUCCESS: Node.js $NODE_VERSION and npm $NPM_VERSION installed"
    else
        log_silent "ERROR: Node.js installation failed"
        exit 1
    fi
}

# Silent Docker installation
install_docker_silent() {
    log_silent "INFO: Installing Docker and Docker Compose..."
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        log_silent "SUCCESS: Docker already installed: $(docker --version)"
    else
        # Install Docker silently
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common > /dev/null 2>&1
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg 2>/dev/null | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg > /dev/null 2>&1
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null 2>&1
        sudo apt-get update -qq > /dev/null 2>&1
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io > /dev/null 2>&1
        
        # Add user to docker group
        sudo usermod -aG docker $USER > /dev/null 2>&1
        log_silent "SUCCESS: Docker installed: $(docker --version)"
        log_silent "WARNING: Please logout and login again for Docker group membership to take effect"
    fi
    
    # Install Docker Compose
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null 2>&1; then
        log_silent "SUCCESS: Docker Compose already installed"
    else
        # Install Docker Compose v2 silently
        sudo apt-get install -y docker-compose-plugin > /dev/null 2>&1
        
        # Create alias for docker-compose
        if ! grep -q "alias docker-compose='docker compose'" ~/.bashrc 2>/dev/null; then
            echo "alias docker-compose='docker compose'" >> ~/.bashrc 2>/dev/null
        fi
        
        log_silent "SUCCESS: Docker Compose installed"
    fi
}

# Silent Git installation
install_git_silent() {
    log_silent "INFO: Installing Git..."
    
    if command -v git &> /dev/null; then
        log_silent "SUCCESS: Git already installed: $(git --version)"
    else
        sudo apt-get install -y git > /dev/null 2>&1
        log_silent "SUCCESS: Git installed: $(git --version)"
    fi
}

# Silent utilities installation
install_utilities_silent() {
    log_silent "INFO: Installing utility packages..."
    
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
        if dpkg -l | grep -q "^ii  $package " 2>/dev/null; then
            log_silent "SUCCESS: $package already installed"
        else
            sudo apt-get install -y $package > /dev/null 2>&1
            log_silent "SUCCESS: $package installed"
        fi
    done
}

# Silent firewall configuration
configure_firewall_silent() {
    log_silent "INFO: Configuring firewall for CRM PostgreSQL System..."
    
    # Check if UFW is installed
    if command -v ufw &> /dev/null; then
        # Check if UFW is active
        if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
            log_silent "INFO: UFW is active, configuring ports..."
            
            # Open ports for CRM PostgreSQL System
            sudo ufw allow 4000:4010/tcp comment 'CRM PostgreSQL System' > /dev/null 2>&1
            sudo ufw reload > /dev/null 2>&1
            
            log_silent "SUCCESS: Firewall configured for ports 4000-4010"
        else
            log_silent "WARNING: UFW is installed but not active. Ports will be accessible without restrictions."
        fi
    else
        log_silent "WARNING: UFW not installed. Installing and configuring..."
        sudo apt-get install -y ufw > /dev/null 2>&1
        sudo ufw --force enable > /dev/null 2>&1
        sudo ufw allow 4000:4010/tcp comment 'CRM PostgreSQL System' > /dev/null 2>&1
        sudo ufw reload > /dev/null 2>&1
        log_silent "SUCCESS: UFW installed and configured"
    fi
}

# Silent verification
verify_installation_silent() {
    log_silent "INFO: Verifying installation..."
    
    ERRORS=0
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_silent "SUCCESS: Node.js: $(node --version)"
        else
            log_silent "ERROR: Node.js version too old: $(node --version)"
            ERRORS=$((ERRORS + 1))
        fi
    else
        log_silent "ERROR: Node.js not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        log_silent "SUCCESS: npm: $(npm --version)"
    else
        log_silent "ERROR: npm not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        log_silent "SUCCESS: Docker: $(docker --version)"
    else
        log_silent "ERROR: Docker not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null 2>&1; then
        log_silent "SUCCESS: Docker Compose available"
    else
        log_silent "ERROR: Docker Compose not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        log_silent "SUCCESS: Git: $(git --version)"
    else
        log_silent "ERROR: Git not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check PostgreSQL client
    if command -v psql &> /dev/null; then
        log_silent "SUCCESS: PostgreSQL client: $(psql --version)"
    else
        log_silent "WARNING: PostgreSQL client not found (optional)"
    fi
    
    if [ $ERRORS -eq 0 ]; then
        log_silent "SUCCESS: All prerequisites installed successfully!"
        return 0
    else
        log_silent "ERROR: $ERRORS prerequisites failed to install"
        return 1
    fi
}

# Main execution (completely silent)
main() {
    # Initialize silent log
    echo "$(date '+%Y-%m-%d %H:%M:%S') Starting silent prerequisites installation..." > "$SILENT_LOG"
    
    log_silent "INFO: Starting prerequisites installation..."
    
    check_system_silent
    update_system_silent
    install_git_silent
    install_nodejs_silent
    install_docker_silent
    install_utilities_silent
    configure_firewall_silent
    
    if verify_installation_silent; then
        log_silent "SUCCESS: Prerequisites installation completed successfully!"
        # Only output on success (single line)
        echo "Prerequisites installed successfully. Log: $SILENT_LOG"
        exit 0
    else
        log_silent "ERROR: Prerequisites installation failed"
        # Only output on error (single line)
        echo "Prerequisites installation failed. Check log: $SILENT_LOG"
        exit 1
    fi
}

# Export non-interactive environment
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

# Redirect all stdout/stderr to /dev/null except final result
exec 3>&1 4>&2
exec 1>/dev/null 2>&1

# Run main function
main "$@"

# Restore stdout/stderr for final message
exec 1>&3 2>&4