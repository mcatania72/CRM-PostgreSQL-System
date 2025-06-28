#!/bin/bash
# ============================================
# CRM PostgreSQL System - Silent Environment Setup
# Crea automaticamente tutti i file .env in modalità completamente silente
# ============================================

set -e  # Exit on error

# Silent logging (only to file)
SILENT_LOG="$HOME/crm-postgres-setup-silent.log"
PROJECT_ROOT=$(pwd)

# Silent logging function
log_silent() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$SILENT_LOG"
}

# Generate secure key silently
generate_secure_key() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32 2>/dev/null
    elif command -v python3 &> /dev/null; then
        python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null
    else
        cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1 2>/dev/null
    fi
}

# Generate secure password silently
generate_password() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32 2>/dev/null | tr -d "/+=" | cut -c1-20
    else
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 20 | head -n 1 2>/dev/null
    fi
}

# Create backend .env silently
create_backend_env_silent() {
    log_silent "INFO: Creating backend environment file..."
    
    # Generate secure secrets
    JWT_SECRET=$(generate_secure_key)
    DB_PASSWORD=$(generate_password)
    SESSION_SECRET=$(generate_secure_key)
    ENCRYPTION_KEY=$(generate_secure_key)
    
    # Backup existing file if present
    if [ -f "$PROJECT_ROOT/backend/.env" ]; then
        cp "$PROJECT_ROOT/backend/.env" "$PROJECT_ROOT/backend/.env.backup.$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
        log_silent "INFO: Backed up existing backend .env"
    fi
    
    # Create backend .env file
    cat > "$PROJECT_ROOT/backend/.env" 2>/dev/null << EOF
# ============================================
# CRM PostgreSQL System - Backend Configuration
# Generated automatically on $(date)
# ============================================

# Database PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=4002
DB_USERNAME=crm_user
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=crm_db
DB_SCHEMA=public

# Database Connection Pool
DB_CONNECTION_LIMIT=20
DB_CONNECTION_TIMEOUT=60000
DB_IDLE_TIMEOUT=30000

# Server Configuration
PORT=4001
NODE_ENV=development
HOST=0.0.0.0

# Security - JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security - Session Configuration
SESSION_SECRET=${SESSION_SECRET}
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
COOKIE_MAX_AGE=86400000

# Security - Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}
HASH_ROUNDS=12

# CORS Configuration
FRONTEND_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:3000
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# API Configuration
API_PREFIX=/api
API_VERSION=v1
MAX_REQUEST_SIZE=50mb
REQUEST_TIMEOUT=30000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined
LOG_FILE=logs/backend.log
LOG_MAX_SIZE=100mb
LOG_MAX_FILES=5

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10mb
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000
EOF

    log_silent "SUCCESS: Backend .env created with secure secrets"
}

# Create frontend .env silently
create_frontend_env_silent() {
    log_silent "INFO: Creating frontend environment file..."
    
    # Backup existing file if present
    if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
        cp "$PROJECT_ROOT/frontend/.env" "$PROJECT_ROOT/frontend/.env.backup.$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
        log_silent "INFO: Backed up existing frontend .env"
    fi
    
    # Create frontend .env file
    cat > "$PROJECT_ROOT/frontend/.env" 2>/dev/null << EOF
# ============================================
# CRM PostgreSQL System - Frontend Configuration
# Generated automatically on $(date)
# ============================================

# API Configuration
VITE_API_URL=http://localhost:4001/api
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=CRM PostgreSQL System
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=Enterprise CRM with PostgreSQL
VITE_APP_COMPANY=Your Company Name

# Environment
VITE_NODE_ENV=development
VITE_BUILD_VERSION=$(date +%Y%m%d-%H%M%S)

# Features Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_SERVICE_WORKER=false

# UI Configuration
VITE_DEFAULT_THEME=light
VITE_DEFAULT_LANGUAGE=en
VITE_ITEMS_PER_PAGE=25
VITE_MAX_UPLOAD_SIZE=10485760

# Security
VITE_ENABLE_CSP=true
VITE_SECURE_COOKIES=false

# Performance
VITE_CACHE_DURATION=3600000
VITE_DEBOUNCE_DELAY=300
VITE_REQUEST_RETRY_COUNT=3

# Development Tools
VITE_SHOW_PERFORMANCE_METRICS=true
VITE_ENABLE_ERROR_BOUNDARY=true
VITE_LOG_LEVEL=info

# Brand Configuration
VITE_BRAND_PRIMARY_COLOR=#3b82f6
VITE_BRAND_SECONDARY_COLOR=#64748b
VITE_BRAND_SUCCESS_COLOR=#10b981
VITE_BRAND_WARNING_COLOR=#f59e0b
VITE_BRAND_ERROR_COLOR=#ef4444
EOF

    log_silent "SUCCESS: Frontend .env created"
}

# Create Docker .env silently
create_docker_env_silent() {
    log_silent "INFO: Creating Docker environment file..."
    
    # Get the same database password from backend .env
    DB_PASSWORD=$(grep "^DB_PASSWORD=" "$PROJECT_ROOT/backend/.env" 2>/dev/null | cut -d'=' -f2 || generate_password)
    
    # Backup existing file if present
    if [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.backup.$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
        log_silent "INFO: Backed up existing Docker .env"
    fi
    
    # Create Docker .env file
    cat > "$PROJECT_ROOT/.env" 2>/dev/null << EOF
# ============================================
# CRM PostgreSQL System - Docker Configuration
# Generated automatically on $(date)
# ============================================

# Project Configuration
PROJECT_NAME=crm-postgresql-system
COMPOSE_PROJECT_NAME=crm-postgres

# Service Ports
FRONTEND_PORT=4000
BACKEND_PORT=4001
POSTGRES_PORT=4002
ADMINER_PORT=4003
GRAFANA_PORT=4004
PROMETHEUS_PORT=4005

# PostgreSQL Configuration
POSTGRES_DB=crm_db
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_HOST=postgres
POSTGRES_SCHEMA=public

# PostgreSQL Advanced Configuration
POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256
POSTGRES_HOST_AUTH_METHOD=scram-sha-256
POSTGRES_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_SHARED_BUFFERS=128MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB

# Development Configuration
NODE_ENV=development
DEBUG=true
HOT_RELOAD=true

# Volumes
POSTGRES_DATA_VOLUME=postgres_data
UPLOADS_VOLUME=uploads_data
LOGS_VOLUME=logs_data

# Network
NETWORK_NAME=crm_network
NETWORK_SUBNET=172.20.0.0/16

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30s
HEALTH_CHECK_TIMEOUT=10s
HEALTH_CHECK_RETRIES=3
HEALTH_CHECK_START_PERIOD=40s

# Resource Limits
BACKEND_MEMORY_LIMIT=512m
FRONTEND_MEMORY_LIMIT=256m
POSTGRES_MEMORY_LIMIT=1g

# Restart Policies
RESTART_POLICY=unless-stopped

# Monitoring (optional)
ENABLE_MONITORING=false
MONITORING_RETENTION=15d

# Backup Configuration
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_DIRECTORY=./backups
EOF

    log_silent "SUCCESS: Docker .env created"
}

# Create example files silently
create_env_examples_silent() {
    log_silent "INFO: Creating example environment files..."
    
    # Create backend .env.example
    if [ -f "$PROJECT_ROOT/backend/.env" ]; then
        cp "$PROJECT_ROOT/backend/.env" "$PROJECT_ROOT/backend/.env.example" 2>/dev/null
        # Replace sensitive values with placeholders
        sed -i 's/JWT_SECRET=.*/JWT_SECRET=your-super-secret-jwt-key-change-in-production/' "$PROJECT_ROOT/backend/.env.example" 2>/dev/null
        sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=your-secure-database-password/' "$PROJECT_ROOT/backend/.env.example" 2>/dev/null
        sed -i 's/SESSION_SECRET=.*/SESSION_SECRET=your-session-secret-key/' "$PROJECT_ROOT/backend/.env.example" 2>/dev/null
        sed -i 's/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=your-encryption-key/' "$PROJECT_ROOT/backend/.env.example" 2>/dev/null
    fi
    
    # Create frontend .env.example
    if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
        cp "$PROJECT_ROOT/frontend/.env" "$PROJECT_ROOT/frontend/.env.example" 2>/dev/null
    fi
    
    # Create docker .env.example
    if [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.example" 2>/dev/null
        sed -i 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=your-secure-database-password/' "$PROJECT_ROOT/.env.example" 2>/dev/null
    fi
    
    log_silent "SUCCESS: Example environment files created"
}

# Create directories silently
create_directories_silent() {
    log_silent "INFO: Creating necessary directories..."
    
    DIRECTORIES=(
        "$PROJECT_ROOT/backend/logs"
        "$PROJECT_ROOT/backend/uploads"
        "$PROJECT_ROOT/backend/temp"
        "$PROJECT_ROOT/frontend/dist"
        "$PROJECT_ROOT/logs"
        "$PROJECT_ROOT/backups"
        "$PROJECT_ROOT/data/postgres"
    )
    
    for dir in "${DIRECTORIES[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir" 2>/dev/null
            log_silent "SUCCESS: Created directory: $dir"
        else
            log_silent "INFO: Directory already exists: $dir"
        fi
    done
    
    # Set proper permissions
    chmod 755 "$PROJECT_ROOT/backend/logs" 2>/dev/null || true
    chmod 755 "$PROJECT_ROOT/backend/uploads" 2>/dev/null || true
    chmod 700 "$PROJECT_ROOT/backups" 2>/dev/null || true
    
    log_silent "SUCCESS: Directory permissions set"
}

# Update .gitignore silently
update_gitignore_silent() {
    log_silent "INFO: Updating .gitignore..."
    
    if [ -f "$PROJECT_ROOT/.gitignore" ]; then
        # Check if our entries are already there
        if ! grep -q "# Environment files (keep examples)" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
            cat >> "$PROJECT_ROOT/.gitignore" 2>/dev/null << 'EOF'

# Environment files (keep examples)
.env
.env.local
.env.development
.env.production

# Runtime data
logs/
temp/
uploads/
backups/

# PostgreSQL data
data/postgres/
postgres-data/

# Runtime logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Generated files
dist/
build/
coverage/
.nyc_output/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
            log_silent "SUCCESS: .gitignore updated"
        else
            log_silent "INFO: .gitignore already up to date"
        fi
    else
        log_silent "WARNING: .gitignore not found, skipping update"
    fi
}

# Silent verification
verify_setup_silent() {
    log_silent "INFO: Verifying environment setup..."
    
    ERRORS=0
    
    # Check backend .env
    if [ -f "$PROJECT_ROOT/backend/.env" ]; then
        log_silent "SUCCESS: Backend .env exists"
        # Verify required variables
        REQUIRED_BACKEND_VARS=("JWT_SECRET" "DB_PASSWORD" "PORT" "DB_HOST")
        for var in "${REQUIRED_BACKEND_VARS[@]}"; do
            if grep -q "^$var=" "$PROJECT_ROOT/backend/.env" 2>/dev/null; then
                log_silent "SUCCESS: $var configured"
            else
                log_silent "ERROR: $var missing"
                ERRORS=$((ERRORS + 1))
            fi
        done
    else
        log_silent "ERROR: Backend .env missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check frontend .env
    if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
        log_silent "SUCCESS: Frontend .env exists"
    else
        log_silent "ERROR: Frontend .env missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check docker .env
    if [ -f "$PROJECT_ROOT/.env" ]; then
        log_silent "SUCCESS: Docker .env exists"
    else
        log_silent "ERROR: Docker .env missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check directories
    if [ -d "$PROJECT_ROOT/backend/logs" ]; then
        log_silent "SUCCESS: Required directories created"
    else
        log_silent "ERROR: Required directories missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ $ERRORS -eq 0 ]; then
        log_silent "SUCCESS: Environment setup verification passed!"
        return 0
    else
        log_silent "ERROR: $ERRORS issues found in environment setup"
        return 1
    fi
}

# Main execution (completely silent)
main() {
    # Initialize silent log
    echo "$(date '+%Y-%m-%d %H:%M:%S') Starting silent environment setup..." > "$SILENT_LOG"
    
    log_silent "INFO: Starting environment setup..."
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ] && [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
        log_silent "ERROR: Please run this script from the CRM-PostgreSQL-System root directory"
        echo "Error: Please run from CRM-PostgreSQL-System root directory. Log: $SILENT_LOG"
        exit 1
    fi
    
    create_directories_silent
    create_backend_env_silent
    create_frontend_env_silent
    create_docker_env_silent
    create_env_examples_silent
    update_gitignore_silent
    
    if verify_setup_silent; then
        log_silent "SUCCESS: Environment setup completed successfully!"
        # Only output on success (single line)
        echo "Environment setup completed successfully. Log: $SILENT_LOG"
        exit 0
    else
        log_silent "ERROR: Environment setup failed"
        # Only output on error (single line)
        echo "Environment setup failed. Check log: $SILENT_LOG"
        exit 1
    fi
}

# Export non-interactive environment
export DEBIAN_FRONTEND=noninteractive

# Redirect all stdout/stderr to /dev/null except final result
exec 3>&1 4>&2
exec 1>/dev/null 2>&1

# Run main function
main "$@"

# Restore stdout/stderr for final message
exec 1>&3 2>&4