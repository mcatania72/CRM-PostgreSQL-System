# 🧪 CRM PostgreSQL System - Istruzioni di Test Complete

## 📋 Sistema Migrato e Pronto

**✅ STATUS: MIGRATION COMPLETED**
- **Repository**: CRM-PostgreSQL-System
- **Backend**: Completamente migrato da SQLite a PostgreSQL
- **Frontend**: Completamente migrato con tutte le pagine e componenti
- **Database**: PostgreSQL 15 configurato
- **Porte**: Frontend 4000, Backend 4001, Database 4002

---

## 🚀 Quick Start

### 1. Clone e Setup
```bash
cd ~
git clone https://github.com/mcatania72/CRM-PostgreSQL-System.git
cd CRM-PostgreSQL-System
```

### 2. Docker Deployment (Raccomandato)
```bash
# Avvia tutto il sistema
docker-compose up -d

# Verifica servizi
docker-compose ps

# Visualizza log
docker-compose logs -f
```

### 3. Setup Manuale (Alternativo)
```bash
# Avvia PostgreSQL
docker-compose up -d postgres

# Backend
cd backend
npm install
npm run build
npm run dev     # Porta 4001

# Frontend (nuovo terminale)
cd frontend
npm install
npm run dev     # Porta 4000
```

---

## 🔧 Configurazione Environment

### Backend (.env)
```env
# Database PostgreSQL
DB_HOST=localhost
DB_PORT=4002
DB_USERNAME=crm_user
DB_PASSWORD=crm_password
DB_DATABASE=crm_db

# Server
PORT=4001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL
FRONTEND_URL=http://localhost:4000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4001/api
```

---

## 🌐 Accesso al Sistema

### URLs
- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:4001/api/health
- **Database**: localhost:4002

### Credenziali Default
- **Email**: admin@crm.local
- **Password**: admin123

---

## 🧪 Test Scenarios

### 1. Health Check
```bash
# Backend health
curl http://localhost:4001/api/health

# Frontend access
curl http://localhost:4000

# Database connection
docker exec crm-postgres pg_isready -U crm_user -d crm_db
```

### 2. API Testing
```bash
# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.local","password":"admin123"}'

# Get customers (sostituisci TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4001/api/customers

# Dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4001/api/dashboard/stats
```

### 3. Database Testing
```bash
# Connessione diretta PostgreSQL
docker exec -it crm-postgres psql -U crm_user -d crm_db

# Verifica tabelle
\dt

# Verifica utenti
SELECT * FROM "user";

# Esci
\q
```

### 4. Frontend Testing
1. **Login Page**: http://localhost:4000/login
2. **Dashboard**: Verifica statistiche e metriche
3. **Clienti**: Test creazione/modifica/eliminazione
4. **Opportunità**: Test pipeline vendite
5. **Attività**: Test gestione compiti
6. **Interazioni**: Test comunicazioni clienti

---

## 📊 Caratteristiche PostgreSQL

### Miglioramenti vs SQLite
- **Concurrency**: Multi-user support
- **Scalability**: Enterprise-grade performance
- **Features**: JSONB, arrays, full-text search
- **Reliability**: ACID compliance, backup/recovery
- **Monitoring**: Built-in metrics and health checks

### Nuove Funzionalità
- **Search Ottimizzato**: ILIKE queries per PostgreSQL
- **Connection Pooling**: Gestione ottimale connessioni
- **Advanced Types**: JSONB per metadata, arrays per tags
- **Indexing**: Indici strategici per performance
- **Health Monitoring**: Endpoint di monitoraggio avanzato

---

## 🐛 Troubleshooting

### Problemi Comuni

#### Database non si connette
```bash
# Verifica container PostgreSQL
docker-compose ps
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### Frontend non raggiunge Backend
```bash
# Verifica proxy Vite
cat frontend/vite.config.ts

# Verifica CORS backend
grep -n "cors" backend/src/app.ts
```

#### Performance lente
```bash
# Verifica indici database
docker exec crm-postgres psql -U crm_user -d crm_db -c "\d+ customer"

# Monitor queries
docker-compose logs backend | grep "query"
```

### Log Debugging
```bash
# Tutti i log
docker-compose logs

# Solo backend
docker-compose logs backend

# Solo database
docker-compose logs postgres

# Live log
docker-compose logs -f
```

---

## 📈 Performance Testing

### Database Performance
```sql
-- Connetti al database
docker exec -it crm-postgres psql -U crm_user -d crm_db

-- Verifica indici
\di

-- Query performance
EXPLAIN ANALYZE SELECT * FROM customer WHERE status = 'active';

-- Statistiche tabelle
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats WHERE tablename = 'customer';
```

### API Performance
```bash
# Test carico con Apache Bench
ab -n 100 -c 10 http://localhost:4001/api/health

# Test con autenticazione
# Prima ottieni token
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.local","password":"admin123"}' | \
  jq -r '.token')

# Poi testa endpoint protetti
ab -n 50 -c 5 -H "Authorization: Bearer $TOKEN" \
  http://localhost:4001/api/customers
```

---

## 🔐 Security Testing

### Authentication
```bash
# Test token scaduto
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:4001/api/customers

# Test senza autenticazione
curl http://localhost:4001/api/customers
```

### SQL Injection Protection
```bash
# Test query maliciose (dovrebbero fallire)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4001/api/customers?search='; DROP TABLE customer; --"
```

### Rate Limiting
```bash
# Test molte richieste rapide
for i in {1..20}; do
  curl http://localhost:4001/api/health &
done
wait
```

---

## 📝 Prossimi Passi

Dopo aver verificato che il sistema PostgreSQL funziona correttamente:

1. **FASE 1**: Validazione Base con PostgreSQL
2. **FASE 2**: Containerizzazione (Docker Compose Enhanced)
3. **FASE 3**: CI/CD Pipeline (Jenkins for PostgreSQL)
4. **FASE 4**: Security & Monitoring (Enhanced)
5. **FASE 5**: Testing Avanzato (PostgreSQL specific)
6. **FASE 6**: Kubernetes Deployment (Production Ready)

---

## ✅ Test Checklist

- [ ] Sistema avviato correttamente
- [ ] Database PostgreSQL connesso
- [ ] Backend risponde su porta 4001
- [ ] Frontend carica su porta 4000
- [ ] Login funziona con credenziali admin
- [ ] Dashboard mostra statistiche
- [ ] Tutte le pagine accessibili
- [ ] API endpoint rispondono
- [ ] Database queries eseguite
- [ ] Performance accettabili
- [ ] Security measures attive
- [ ] Logs chiari e informativi

**🎉 Sistema CRM PostgreSQL pronto per l'uso!**