# 🔇 CRM PostgreSQL System - Two-Step Silent Installation

## 🎯 Preferred Two-Step Installation

Download first, then execute - safer and more transparent.

### 🚀 Prerequisites Installation

```bash
# Step 1: Download the script
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/install-prerequisites-silent.sh

# Step 2: Make executable and run
chmod +x install-prerequisites-silent.sh
./install-prerequisites-silent.sh
```

### 🛠️ Environment Setup

```bash
# Step 1: Clone repository
git clone https://github.com/mcatania72/CRM-PostgreSQL-System.git
cd CRM-PostgreSQL-System

# Step 2: Download setup script (if not in repo)
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/setup-environment-silent.sh

# Step 3: Make executable and run
chmod +x setup-environment-silent.sh
./setup-environment-silent.sh
```

### 🐳 Complete Deployment

```bash
# Step 1: Start the application
docker-compose up -d

# Step 2: Verify deployment
curl -s http://localhost:4001/api/health && echo "✅ Backend OK" || echo "❌ Backend Failed"
curl -s http://localhost:4000 && echo "✅ Frontend OK" || echo "❌ Frontend Failed"
```

## 📦 Alternative: Download All Scripts First

```bash
# Create working directory
mkdir -p ~/crm-setup
cd ~/crm-setup

# Download all scripts
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/install-prerequisites-silent.sh
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/setup-environment-silent.sh

# Make them executable
chmod +x *.sh

# Inspect scripts (optional but recommended)
ls -la *.sh
head -20 install-prerequisites-silent.sh
head -20 setup-environment-silent.sh

# Execute step by step
./install-prerequisites-silent.sh
git clone https://github.com/mcatania72/CRM-PostgreSQL-System.git
cd CRM-PostgreSQL-System
../setup-environment-silent.sh
docker-compose up -d
```

## 🔍 Script Verification (Recommended)

```bash
# Download and verify before execution
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/install-prerequisites-silent.sh

# Check script content
less install-prerequisites-silent.sh

# Check script size (should be ~9KB)
ls -lh install-prerequisites-silent.sh

# Check for common issues
grep -n "sudo" install-prerequisites-silent.sh
grep -n "curl.*|.*bash" install-prerequisites-silent.sh

# If satisfied, execute
chmod +x install-prerequisites-silent.sh
./install-prerequisites-silent.sh
```

## 📋 Complete Manual Process

### Step-by-Step Manual Installation

```bash
# 1. Download prerequisites script
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/install-prerequisites-silent.sh
chmod +x install-prerequisites-silent.sh

# 2. Run prerequisites installation
./install-prerequisites-silent.sh

# 3. Clone the repository
git clone https://github.com/mcatania72/CRM-PostgreSQL-System.git
cd CRM-PostgreSQL-System

# 4. Run environment setup (script is in the repo)
chmod +x scripts/setup-environment-silent.sh
./scripts/setup-environment-silent.sh

# 5. Deploy with Docker
docker-compose up -d

# 6. Verify installation
echo "Checking services..."
sleep 30
curl -s http://localhost:4001/api/health >/dev/null && echo "✅ Backend running" || echo "❌ Backend failed"
curl -s http://localhost:4000 >/dev/null && echo "✅ Frontend running" || echo "❌ Frontend failed"
```

## 📊 Expected Output

### Prerequisites Script
```bash
$ ./install-prerequisites-silent.sh
Prerequisites installed successfully. Log: /home/devops/crm-postgres-install-silent.log
```

### Environment Setup Script
```bash
$ ./scripts/setup-environment-silent.sh
Environment setup completed successfully. Log: /home/devops/crm-postgres-setup-silent.log
```

### Docker Deployment
```bash
$ docker-compose up -d
Creating network "crm-postgres_crm_network" with driver "bridge"
Creating volume "crm-postgres_postgres_data" with local driver
Creating crm-postgres ... done
Creating crm-backend  ... done
Creating crm-frontend ... done
```

## 🗂️ Files Created

After successful installation, you'll have:

```
~/
├── crm-postgres-install-silent.log     # Prerequisites installation log
├── crm-postgres-setup-silent.log       # Environment setup log
└── CRM-PostgreSQL-System/              # Main application directory
    ├── backend/
    │   └── .env                        # Backend configuration
    ├── frontend/
    │   └── .env                        # Frontend configuration
    ├── .env                            # Docker configuration
    ├── *.env.example                   # Template files
    ├── logs/                           # Application logs
    ├── backups/                        # Backup directory
    └── docker-compose.yml              # Docker deployment
```

## 🔐 Security Best Practices

### Script Verification
```bash
# Verify script authenticity (optional)
wget https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/install-prerequisites-silent.sh
sha256sum install-prerequisites-silent.sh

# Compare with expected hash (if provided)
# Expected hash: [will be provided separately]
```

### Minimal Permissions
```bash
# Run with minimal privileges
# Script will request sudo only when needed for:
# - apt package installation
# - docker group modification
# - firewall configuration

# Check what the script will do
grep -n "sudo" install-prerequisites-silent.sh
```

## ✅ Success Verification

### Check Prerequisites
```bash
# Verify Node.js
node --version
npm --version

# Verify Docker
docker --version
docker compose version

# Verify Git
git --version

# Verify PostgreSQL client
psql --version
```

### Check Environment Files
```bash
cd CRM-PostgreSQL-System

# Verify backend configuration
grep -c "JWT_SECRET\|DB_PASSWORD" backend/.env

# Verify frontend configuration  
grep -c "VITE_API_URL" frontend/.env

# Verify Docker configuration
grep -c "POSTGRES_PASSWORD" .env
```

### Check Application
```bash
# Check Docker containers
docker-compose ps

# Check services
curl http://localhost:4001/api/health
curl -I http://localhost:4000

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

## 🚨 Troubleshooting

### If Prerequisites Fail
```bash
# Check the log file
cat ~/crm-postgres-install-silent.log

# Common issues and fixes:
# - Internet connectivity: ping google.com
# - Permissions: ensure not running as root
# - Disk space: df -h
# - Package conflicts: sudo apt autoremove
```

### If Environment Setup Fails
```bash
# Check the log file
cat ~/crm-postgres-setup-silent.log

# Common issues:
# - Wrong directory: ensure you're in CRM-PostgreSQL-System/
# - Permission issues: check directory permissions
# - Missing tools: ensure openssl or python3 available
```

### If Docker Fails
```bash
# Check Docker daemon
sudo systemctl status docker

# Check Docker permissions
docker run hello-world

# If permission denied:
sudo usermod -aG docker $USER
newgrp docker
```

---

**Perfect for:** Security-conscious installations, manual deployments, step-by-step verification, air-gapped environments.