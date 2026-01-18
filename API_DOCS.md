# API Documentation - Module 01

**Version:** 1.0.0  
**Base URL (Local):** `http://localhost:8002/api/v1/analytics`  
**Base URL (Production):** `https://express-api.herlambangharyo.my.id/api/v1/analytics`

---

## Authentication

**Current:** No authentication required (open API)  
**Future:** JWT-based authentication

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {} // Development only
}
```

---

## Endpoints

### 1. KPI Cards (4 endpoints)

#### 1.1 Total Active Jobs
**GET** `/dashboard/summary/total-jobs`

Returns total active jobs with growth metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_jobs": 150,
    "jobs_last_month": 85,
    "jobs_prev_month": 65,
    "growth_percentage": 30.77,
    "top_industry": "Technology",
    "top_industry_percentage": 34.12
  }
}
```

#### 1.2 Monthly Growth
**GET** `/dashboard/summary/monthly-growth`

#### 1.3 Average Salary
**GET** `/dashboard/summary/avg-salary`

#### 1.4 Active Companies
**GET** `/dashboard/summary/active-companies`

---

### 2. Main Charts (6 endpoints)

#### 2.1 Top Industries
**GET** `/dashboard/charts/top-industries`

Returns top 10 industries by job count.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "industry": "Technology",
      "job_count": 51,
      "percentage": 34.0
    }
  ]
}
```

#### 2.2 Job Type Distribution
**GET** `/dashboard/charts/job-type-distribution`

#### 2.3 Location Distribution
**GET** `/dashboard/charts/location-distribution`

#### 2.4 Job Level Distribution
**GET** `/dashboard/charts/job-level-distribution`

#### 2.5 Posting Trends
**GET** `/dashboard/charts/posting-trends`

#### 2.6 Top Skills
**GET** `/dashboard/charts/top-skills`

---

### 3. Widgets (3 endpoints)

#### 3.1 Recent Activity
**GET** `/dashboard/widgets/recent-activity`

#### 3.2 Fastest Growing
**GET** `/dashboard/widgets/fastest-growing`

#### 3.3 Salary Preview
**GET** `/dashboard/widgets/salary-preview`

---

## Testing

```bash
# Test with curl
curl http://localhost:8002/api/v1/analytics/dashboard/summary/total-jobs

# Test with browser
http://localhost:8002/api/v1/analytics/dashboard/charts/top-skills
```

---

**Last Updated:** January 18, 2026