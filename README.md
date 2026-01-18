# Module 01 - Dashboard Ringkasan Pasar Kerja API

Express.js backend API untuk Module 01 - IndoJobMarket Analytics Platform

## 📋 Overview

Backend API untuk dashboard ringkasan pasar kerja Indonesia dengan 13 endpoints untuk KPI cards, charts, dan widgets.

**Tech Stack:**
- Node.js 20+
- Express.js 4.18.x
- MySQL 8.0
- mysql2 (Promise-based)

**Port:** 8002  
**Base URL:** `http://localhost:8002`

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` dan sesuaikan dengan konfigurasi MySQL lokal:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=indojobmarket_dev
PORT=8002
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3100,http://localhost:3000
```

### 3. Setup Database

Pastikan XAMPP MySQL sudah running, lalu jalankan migration:

```bash
# Via phpMyAdmin
# 1. Buka http://localhost/phpmyadmin
# 2. Pilih database 'indojobmarket_dev'
# 3. Klik tab SQL
# 4. Copy-paste isi file migrations/001_create_skills_tables.sql
# 5. Klik Go
```

Atau via command line:
```bash
mysql -u root -p indojobmarket_dev < migrations/001_create_skills_tables.sql
```

### 4. Start Server

Development mode (dengan auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di: `http://localhost:8002`

---

## 📡 API Endpoints (13 Total)

### Base URL
```
http://localhost:8002/api/v1/analytics
```

### 1. KPI Cards (4 endpoints)

#### Total Active Jobs
```http
GET /dashboard/summary/total-jobs
```

Response:
```json
{
  "success": true,
  "data": {
    "total_jobs": 150,
    "jobs_last_month": 85,
    "jobs_prev_month": 65,
    "growth_percentage": 30.77,
    "top_industry": "Technology",
    "top_industry_percentage": 34.0
  }
}
```

#### Monthly Growth
```http
GET /dashboard/summary/monthly-growth
```

#### Average Salary Range
```http
GET /dashboard/summary/avg-salary
```

#### Active Companies
```http
GET /dashboard/summary/active-companies
```

---

### 2. Main Charts (6 endpoints)

#### Top Industries (Bar Chart)
```http
GET /dashboard/charts/top-industries
```

#### Job Type Distribution (Pie Chart)
```http
GET /dashboard/charts/job-type-distribution
```

#### Location Distribution (Horizontal Bar)
```http
GET /dashboard/charts/location-distribution
```

#### Job Level Distribution (Stacked Bar)
```http
GET /dashboard/charts/job-level-distribution
```

#### Posting Trends (Line Chart)
```http
GET /dashboard/charts/posting-trends
```

#### Top Skills (Horizontal Bar)
```http
GET /dashboard/charts/top-skills
```

---

### 3. Secondary Widgets (3 endpoints)

#### Recent Activity
```http
GET /dashboard/widgets/recent-activity
```

#### Fastest Growing Segments
```http
GET /dashboard/widgets/fastest-growing
```

#### Salary Preview
```http
GET /dashboard/widgets/salary-preview
```

---

## 🗂️ Project Structure

```
job-analytics-express-api/
├── config/
│   └── database.js              # MySQL connection pool
├── controllers/
│   └── dashboardController.js   # 13 endpoint implementations
├── routes/
│   └── analytics.js             # Route definitions
├── migrations/
│   └── 001_create_skills_tables.sql
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── server.js                    # Express app entry point
└── README.md                    # This file
```

---

## 🗄️ Database Schema

### New Tables Created (by migration)

#### Skills Table (72 records)
- 12 categories: Programming Language, Frontend Framework, Backend Framework, Database, Cloud, DevOps, Version Control, Machine Learning, Mobile Development, Data & Analytics, Soft Skills, Security

#### Job Skills Junction Table (~500 records)
- Links jobs to skills (many-to-many relationship)

### Existing Tables Required
- `jobs` (150 records) - Main jobs table
- `companies` - Company information
- `industries` - Industry categories
- `locations` - Geographic locations
- `employment_types` - Job types
- `job_levels` - Seniority levels
- `job_functions` - Job function categories

---

## 🔒 Data Privacy Implementation

### ✅ Compliant Features
- No company names in public API
- Aggregated data only (min 3-5 jobs per segment)
- City-level location (no addresses)
- Salary ranges (not exact values)
- No PII exposed

### ❌ Protected Data
- Individual job details
- Company-specific data
- Contact information
- Applicant data
- Specific addresses

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8002/health
```

### Test KPI Endpoint
```bash
curl http://localhost:8002/api/v1/analytics/dashboard/summary/total-jobs
```

### Test Chart Endpoint
```bash
curl http://localhost:8002/api/v1/analytics/dashboard/charts/top-skills
```

### Test All Endpoints
Open in browser:
- http://localhost:8002/api/v1/analytics/dashboard/summary/total-jobs
- http://localhost:8002/api/v1/analytics/dashboard/charts/top-industries
- http://localhost:8002/api/v1/analytics/dashboard/widgets/recent-activity

---

## 🚢 Deployment

### Railway Deployment

1. **Connect Repository:**
   - Login to Railway.app
   - New Project → Deploy from GitHub
   - Select repository

2. **Configure Environment Variables:**
   ```
   DB_HOST=<railway-mysql-host>
   DB_PORT=3306
   DB_USER=<railway-mysql-user>
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=railway
   PORT=8002
   NODE_ENV=production
   ALLOWED_ORIGINS=https://dashboard.herlambangharyo.my.id
   ```

3. **Custom Domain:**
   - Settings → Networking → Custom Domain
   - Add: `express-api.herlambangharyo.my.id`

4. **Deploy:**
   Railway akan otomatis deploy setiap push ke main branch.

---

## 🛠️ Troubleshooting

### Database Connection Failed

**Symptoms:**
```
❌ Database connection failed:
```

**Solutions:**
1. Pastikan XAMPP MySQL running
2. Check `.env` credentials
3. Verify database exists: `SHOW DATABASES;`
4. Test connection: `mysql -u root -p`

### Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::8002
```

**Solutions:**
1. Change port in `.env`: `PORT=8003`
2. Or kill process: 
   ```bash
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8002).OwningProcess | Stop-Process
   ```

### Empty Response / No Data

**Solutions:**
1. Verify data exists: `SELECT COUNT(*) FROM jobs WHERE is_active = TRUE;`
2. Check migration ran successfully
3. Verify tables created: `SHOW TABLES;`

---

## 📝 Development Notes

### Query Optimization
- Indexes on frequently queried columns
- Connection pooling enabled (max 10 connections)
- Parameterized queries for SQL injection prevention

### Error Handling
- Comprehensive try-catch blocks
- Descriptive error messages
- Development vs production error modes

### CORS Configuration
- Configurable allowed origins
- Credentials support
- Pre-flight handling

---

## 📋 Checklist

### Backend Development ✅
- [x] Express.js project setup
- [x] MySQL connection configured
- [x] Database tables created (skills, job_skills)
- [x] 72 skills seeded across 12 categories
- [x] 4 KPI endpoints implemented
- [x] 6 chart endpoints implemented
- [x] 3 widget endpoints implemented
- [x] Error handling middleware
- [x] CORS configuration
- [x] Request logging (Morgan)
- [x] Privacy compliance verified

### Next Steps
- [ ] Frontend integration (Next.js)
- [ ] Production deployment (Railway)
- [ ] Custom domain configuration
- [ ] End-to-end testing
- [ ] Performance monitoring

---

## 👤 Author

**Herlambang Haryo Putro**  
📧 herlambangharyoputro@gmail.com  
🔗 github.com/herlambangharyoputro

---

## 📄 License

MIT License - Part of IndoJobMarket Analytics Platform

---

**Last Updated:** January 18, 2026  
**Version:** 1.0.0  
**Status:** Development Ready ✅