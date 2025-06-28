# 📋 CRM PostgreSQL System - Prerequisites

## 🎯 System Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: 4GB (8GB recommended)
- **Storage**: 10GB free space
- **CPU**: 2 cores (4 cores recommended)
- **Network**: Internet connectivity for package downloads

### Required Software
- **Node.js**: 18.x or 20.x (will be installed automatically)
- **npm**: 8.x+ (included with Node.js)
- **Docker**: 20.x+ (will be installed automatically)
- **Docker Compose**: 2.x+ (will be installed automatically)
- **Git**: 2.x+ (will be installed automatically)
- **PostgreSQL Client**: 13+ (will be installed automatically)

## 🚀 Automated Installation

### One-Command Setup
```bash
# Download and run the prerequisites installer
curl -fsSL https://raw.githubusercontent.com/mcatania72/CRM-PostgreSQL-System/main/scripts/install-prerequisites.sh | bash
```

### Manual Download and Run
```bash
# Clone the repository
git clone https://github.com/mcatania72/CRM-PostgreSQL-System.git
cd CRM-PostgreSQL-System

# Make scripts executable
chmod +x scripts/*.sh

# Install prerequisites
./scripts/install-prerequisites.sh
```

## 🔧 What Gets Installed

### Core Dependencies
- **Node.js 20.x**: JavaScript runtime for backend and build tools
- **npm**: Package manager for Node.js dependencies
- **Docker**: Container platform for PostgreSQL and services
- **Docker Compose**: Multi-container orchestration
- **Git**: Version control system

### System Utilities
- **curl**: HTTP client for API testing
- **wget**: File downloader
- **unzip**: Archive extraction
- **jq**: JSON processor for API responses
- **tree**: Directory structure visualization
- **htop**: System monitoring
- **vim/nano**: Text editors
- **net-tools**: Network utilities
- **postgresql-client**: PostgreSQL command-line tools

### Security Configuration
- **UFW Firewall**: Configured for ports 4000-4010
- **Docker Group**: User added to docker group
- **Secure Defaults**: Firewall rules for CRM system

## 🔍 Verification

After installation, the script will verify:

```bash
✅ Node.js: v20.x.x
✅ npm: 10.x.x
✅ Docker: 24.x.x
✅ Docker Compose: 2.x.x
✅ Git: 2.x.x
✅ PostgreSQL client: 15.x
```

## 🛡️ Firewall Configuration

The installer automatically configures UFW firewall:

```bash
# Ports opened for CRM PostgreSQL System
4000/tcp    # Frontend (React)
4001/tcp    # Backend (Node.js API)
4002/tcp    # PostgreSQL Database
4003/tcp    # Adminer (Database GUI)
4004/tcp    # Grafana (Monitoring)
4005/tcp    # Prometheus (Metrics)
```

## 🔧 Manual Prerequisites (if needed)

### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Install utilities
sudo apt-get install -y git curl wget unzip jq tree htop vim nano net-tools postgresql-client

# Configure firewall
sudo ufw enable
sudo ufw allow 4000:4010/tcp
```

### CentOS/RHEL
```bash
# Update system
sudo dnf update -y

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Install Docker
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Install utilities
sudo dnf install -y git curl wget unzip jq tree htop vim nano net-tools postgresql

# Configure firewall
sudo firewall-cmd --permanent --add-port=4000-4010/tcp
sudo firewall-cmd --reload
```

## 🚨 Troubleshooting

### Common Issues

**1. Permission Denied for Docker**
```bash
# Logout and login again, or run:
newgrp docker
```

**2. Node.js Version Too Old**
```bash
# Remove old Node.js and reinstall
sudo apt remove nodejs npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Firewall Blocking Ports**
```bash
# Check UFW status
sudo ufw status

# Reset and reconfigure if needed
sudo ufw --force reset
sudo ufw enable
sudo ufw allow 4000:4010/tcp
```

**4. Docker Compose Command Not Found**
```bash
# Use docker compose (v2) instead of docker-compose
docker compose version

# Or create alias
echo "alias docker-compose='docker compose'" >> ~/.bashrc
source ~/.bashrc
```

### Log Files
- Installation log: `~/crm-postgres-install.log`
- Setup log: `~/crm-postgres-setup.log`
- Application logs: `logs/` directory

### Verification Commands
```bash
# Check all prerequisites
node --version
npm --version
docker --version
docker compose version
git --version
psql --version

# Test Docker
docker run hello-world

# Check ports
sudo netstat -tlnp | grep -E ":(4000|4001|4002)"

# Check firewall
sudo ufw status
```

## ✅ Success Criteria

Prerequisites are successfully installed when:

- ✅ All software versions meet minimum requirements
- ✅ Docker runs without sudo
- ✅ Firewall allows CRM system ports
- ✅ PostgreSQL client can connect
- ✅ No permission errors
- ✅ All verification commands pass

## 📞 Support

If you encounter issues:

1. Check the log files for detailed error messages
2. Verify system requirements are met
3. Run the verification commands
4. Check the troubleshooting section
5. Create an issue on GitHub with the log files

---

**Next Steps**: After successful prerequisites installation, run `./scripts/setup-environment.sh` to configure the application environment.