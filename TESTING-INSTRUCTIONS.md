# 🧪 CRM PostgreSQL System - Testing Instructions

## 📋 Pre-Test Setup

### System Requirements
- Docker & Docker Compose
- Node.js 18+ (for manual testing)
- curl or Postman (for API testing)
- Modern browser (for frontend testing)

### Environment Preparation
```bash
# Navigate to project directory
cd ~/CRM-PostgreSQL-System

# Ensure no port conflicts
sudo netstat -tulpn | grep :400[0-4]

# If needed, stop conflicting services
# docker stop $(docker ps -q)
```

---

## 🚀 Test Scenario 1: Docker Deployment

### Step 1: Full Stack Deployment
```bash
# Start all services
docker-compose up -d

# Expected output:
# ✅ Creating network "crm-network"
# ✅ Creating volume "crm_postgres_data"
# ✅ Creating crm-postgres
# ✅ Creating crm-backend
# ✅ Creating crm-frontend
```

### Step 2: Health Verification
```bash
# Check service status
docker-compose ps

# Expected output:
#     Name                 State           Ports
# crm-postgres     Up (healthy)   0.0.0.0:4002->5432/tcp
# crm-backend      Up (healthy)   0.0.0.0:4001->4001/tcp
# crm-frontend     Up (healthy)   0.0.0.0:4000->80/tcp

# Test health endpoints
curl -s http://localhost:4001/api/health | jq .
curl -s http://localhost:4000/health
```

### Step 3: Database Verification
```bash
# Connect to PostgreSQL
docker exec -it crm-postgres psql -U crm_user -d crm_db

# Run in PostgreSQL shell:
\dt                    # List tables
\d users              # Describe users table
SELECT COUNT(*) FROM users;           # Should show seeded users
SELECT COUNT(*) FROM customers;       # Should show seeded customers
\q                    # Exit
```

### Expected Results ✅
- All 3 containers running and healthy
- Database contains seeded data
- Health endpoints return 200 OK
- No error logs in `docker-compose logs`

---

## 🔐 Test Scenario 2: Authentication Flow

### Step 1: Login API Test
```bash
# Test admin login
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.local","password":"admin123"}' | \
  jq -r '.token')

echo "Token: $TOKEN"

# Test invalid login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"wrong"}'
```

### Step 2: Protected Endpoint Test
```bash
# Test protected endpoint with token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4001/api/auth/profile | jq .

# Test without token (should fail)
curl http://localhost:4001/api/customers
```

### Step 3: Frontend Login Test
```bash
# Open browser
echo "Open: http://localhost:4000"

# Manual test:
# 1. Should see login page
# 2. Login with admin@crm.local / admin123
# 3. Should redirect to dashboard
# 4. Navigation should work
```

### Expected Results ✅
- Valid login returns JWT token
- Invalid login returns 401 error
- Protected endpoints work with token
- Protected endpoints fail without token
- Frontend login/logout works correctly

---

## 📊 Test Scenario 3: CRUD Operations

### Step 1: Customer Management
```bash
# Create customer
CUSTOMER_ID=$(curl -s -X POST http://localhost:4001/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "company": "Test Corp",
    "email": "test@testcorp.com",
    "phone": "+1-555-TEST",
    "status": "prospect"
  }' | jq -r '.customer.id')

echo "Created Customer ID: $CUSTOMER_ID"

# Read customer
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4001/api/customers/$CUSTOMER_ID | jq .

# Update customer
curl -X PUT http://localhost:4001/api/customers/$CUSTOMER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active", "notes": "Updated via API test"}'

# List customers with search
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4001/api/customers?search=Test&page=1&limit=10" | jq .
```

### Step 2: Opportunity Management
```bash
# Create opportunity
OPP_ID=$(curl -s -X POST http://localhost:4001/api/opportunities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Opportunity",
    "description": "API test opportunity",
    "value": 50000,
    "stage": "proposal",
    "probability": 60,
    "customerId": '$CUSTOMER_ID',
    "expectedCloseDate": "2025-08-15"
  }' | jq -r '.opportunity.id')

echo "Created Opportunity ID: $OPP_ID"

# Test opportunity closure
curl -X POST http://localhost:4001/api/opportunities/$OPP_ID/close \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"won": true}'
```

### Expected Results ✅
- All CRUD operations return 200/201 status
- Created resources have valid IDs
- Read operations return complete data
- Updates modify data correctly
- Search and pagination work
- Foreign key relationships work

---

## 🧹 Cleanup

### Remove Test Data
```bash
# Stop all services
docker-compose down

# Remove volumes (optional - removes all data)
# docker-compose down -v

# Remove images (optional)
# docker rmi crm-postgresql-system_backend crm-postgresql-system_frontend

echo "Cleanup completed"
```

---

## 🎯 Success Criteria

### ✅ All Tests Should Pass
1. **Docker Deployment**: All services start and are healthy
2. **Authentication**: Login/logout works, tokens are valid
3. **CRUD Operations**: Create, read, update, delete all work
4. **Data Persistence**: Data survives container restarts
5. **Error Handling**: Proper error responses for invalid requests
6. **Performance**: Response times under 200ms

### 📋 Test Report Template
```markdown
# Test Results - CRM PostgreSQL System

**Date**: [DATE]
**Tester**: [NAME]
**Environment**: [LOCAL/STAGING/PROD]

## Test Results
- [ ] Docker Deployment
- [ ] Authentication Flow
- [ ] CRUD Operations
- [ ] Data Persistence
- [ ] Error Handling
- [ ] Performance

## Issues Found
- [List any issues]

## Notes
- [Additional observations]
```

---

**🎉 Ready for Production Testing!**

Once all tests pass, the system is ready for the next development phases (CI/CD, Kubernetes, etc.).