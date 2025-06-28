#!/bin/bash
# ============================================
# CRM PostgreSQL System - Environment Setup
# Crea automaticamente tutti i file .env necessari
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT=$(pwd)

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> ~/crm-postgres-setup.log
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') SUCCESS: $1" >> ~/crm-postgres-setup.log
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') WARNING: $1" >> ~/crm-postgres-setup.log
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: $1" >> ~/crm-postgres-setup.log
}

print_header() {
    echo -e "${BLUE}"
    echo "======================================="
    echo "   CRM PostgreSQL System Setup"
    echo "   Environment Configuration"
    echo "======================================="
    echo -e "${NC}"
}

generate_secure_key() {
    # Generate cryptographically secure random key
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    elif command -v python3 &> /dev/null; then
        python3 -c "import secrets; print(secrets.token_hex(32))"
    else
        # Fallback to /dev/urandom
        cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1
    fi
}

generate_password() {
    # Generate secure password
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32 | tr -d "/+=" | cut -c1-20
    else
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 20 | head -n 1
    fi
}

create_backend_env() {
    log "Creating backend environment file..."
    
    # Generate secure secrets
    JWT_SECRET=$(generate_secure_key)
    DB_PASSWORD=$(generate_password)
    SESSION_SECRET=$(generate_secure_key)
    ENCRYPTION_KEY=$(generate_secure_key)
    
    # Create backend .env file
    cat > "$PROJECT_ROOT/backend/.env" << EOF
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

# Production Database (commented for development)
# PROD_DB_HOST=your-rds-endpoint.amazonaws.com
# PROD_DB_PORT=5432
# PROD_DB_NAME=crm_production
# PROD_DB_USER=crm_prod_user
# PROD_DB_PASSWORD=super-secure-production-password

# Optional: Redis Configuration (for future caching)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# Optional: Email Configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Optional: Monitoring
# PROMETHEUS_ENABLED=false
# GRAFANA_ENABLED=false
# MONITORING_PORT=4003
EOF

    log_success "Backend .env created with secure secrets"
}

create_frontend_env() {
    log "Creating frontend environment file..."
    
    # Create frontend .env file
    cat > "$PROJECT_ROOT/frontend/.env" << EOF
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

# Social/External Integration (optional)
# VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
# VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
# VITE_HOTJAR_ID=xxxxxxx

# Brand Configuration
VITE_BRAND_PRIMARY_COLOR=#3b82f6
VITE_BRAND_SECONDARY_COLOR=#64748b
VITE_BRAND_SUCCESS_COLOR=#10b981
VITE_BRAND_WARNING_COLOR=#f59e0b
VITE_BRAND_ERROR_COLOR=#ef4444
EOF

    log_success "Frontend .env created"
}

create_docker_env() {
    log "Creating Docker environment file..."
    
    # Get the same database password from backend .env
    DB_PASSWORD=$(grep "^DB_PASSWORD=" "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2)
    
    # Create Docker .env file
    cat > "$PROJECT_ROOT/.env" << EOF
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

# Security
JWT_SECRET_FILE=/run/secrets/jwt_secret
DB_PASSWORD_FILE=/run/secrets/db_password

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

    log_success "Docker .env created"
}

create_env_examples() {
    log "Creating example environment files..."
    
    # Create backend .env.example
    cp "$PROJECT_ROOT/backend/.env" "$PROJECT_ROOT/backend/.env.example"
    # Replace sensitive values with placeholders
    sed -i 's/JWT_SECRET=.*/JWT_SECRET=your-super-secret-jwt-key-change-in-production/' "$PROJECT_ROOT/backend/.env.example"
    sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=your-secure-database-password/' "$PROJECT_ROOT/backend/.env.example"
    sed -i 's/SESSION_SECRET=.*/SESSION_SECRET=your-session-secret-key/' "$PROJECT_ROOT/backend/.env.example"
    sed -i 's/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=your-encryption-key/' "$PROJECT_ROOT/backend/.env.example"
    
    # Create frontend .env.example
    cp "$PROJECT_ROOT/frontend/.env" "$PROJECT_ROOT/frontend/.env.example"
    
    # Create docker .env.example
    cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.example"
    sed -i 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=your-secure-database-password/' "$PROJECT_ROOT/.env.example"
    
    log_success "Example environment files created"
}

create_directories() {
    log "Creating necessary directories..."
    
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
            mkdir -p "$dir"
            log_success "Created directory: $dir"
        else
            log "Directory already exists: $dir"
        fi
    done
    
    # Set proper permissions
    chmod 755 "$PROJECT_ROOT/backend/logs"
    chmod 755 "$PROJECT_ROOT/backend/uploads"
    chmod 700 "$PROJECT_ROOT/backups"
}

update_gitignore() {
    log "Updating .gitignore..."
    
    # Add environment-specific ignores if not already present
    if [ -f "$PROJECT_ROOT/.gitignore" ]; then
        cat >> "$PROJECT_ROOT/.gitignore" << 'EOF'

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
        log_success ".gitignore updated"
    else
        log_warning ".gitignore not found, skipping update"
    fi
}

print_secrets_summary() {
    echo -e "${GREEN}"
    echo "======================================="
    echo "   Environment Setup Complete"
    echo "======================================="
    echo -e "${NC}"
    echo
    echo -e "${BLUE}Generated Files:${NC}"
    echo "• backend/.env - Backend configuration with secure secrets"
    echo "• frontend/.env - Frontend configuration"
    echo "• .env - Docker configuration"
    echo "• *.env.example - Template files for sharing"
    echo
    echo -e "${BLUE}Generated Secrets:${NC}"
    echo "• JWT_SECRET: $(grep '^JWT_SECRET=' "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2 | cut -c1-16)..."
    echo "• DB_PASSWORD: $(grep '^DB_PASSWORD=' "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2 | cut -c1-8)..."
    echo "• SESSION_SECRET: $(grep '^SESSION_SECRET=' "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2 | cut -c1-16)..."
    echo
    echo -e "${YELLOW}⚠️ IMPORTANT:${NC}"
    echo "• These .env files contain sensitive information"
    echo "• They are automatically added to .gitignore"
    echo "• Never commit .env files to version control"
    echo "• Use .env.example files for sharing configurations"
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Review the generated .env files"
    echo "2. Customize any values as needed"
    echo "3. Run: docker-compose up -d"
    echo "4. Access: http://localhost:4000"
    echo
    echo -e "${BLUE}Log file:${NC} ~/crm-postgres-setup.log"
    echo
}

verify_setup() {
    log "Verifying environment setup..."
    
    ERRORS=0
    
    # Check backend .env
    if [ -f "$PROJECT_ROOT/backend/.env" ]; then
        log_success "✅ Backend .env exists"
        # Verify required variables
        REQUIRED_BACKEND_VARS=("JWT_SECRET" "DB_PASSWORD" "PORT" "DB_HOST")
        for var in "${REQUIRED_BACKEND_VARS[@]}"; do
            if grep -q "^$var=" "$PROJECT_ROOT/backend/.env"; then
                log_success "  ✅ $var configured"
            else
                log_error "  ❌ $var missing"
                ERRORS=$((ERRORS + 1))
            fi
        done
    else
        log_error "❌ Backend .env missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check frontend .env
    if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
        log_success "✅ Frontend .env exists"
    else
        log_error "❌ Frontend .env missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check docker .env
    if [ -f "$PROJECT_ROOT/.env" ]; then
        log_success "✅ Docker .env exists"
    else
        log_error "❌ Docker .env missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check directories
    if [ -d "$PROJECT_ROOT/backend/logs" ]; then
        log_success "✅ Required directories created"
    else
        log_error "❌ Required directories missing"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ $ERRORS -eq 0 ]; then
        log_success "🎉 Environment setup verification passed!"
        return 0
    else
        log_error "❌ $ERRORS issues found in environment setup"
        return 1
    fi
}

# Main execution
main() {
    print_header
    
    log "Starting environment setup..."
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ] && [ ! -f "package.json" ]; then
        log_error "Please run this script from the CRM-PostgreSQL-System root directory"
        exit 1
    fi
    
    create_directories
    create_backend_env
    create_frontend_env
    create_docker_env
    create_env_examples
    update_gitignore
    
    if verify_setup; then
        print_secrets_summary
        exit 0
    else
        log_error "Environment setup failed. Check log: ~/crm-postgres-setup.log"
        exit 1
    fi
}

# Run main function
main "$@"