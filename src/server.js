const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Test database connection and run migrations
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Database connected successfully');
  
  // Run migrations
  const migrationPath = path.join(__dirname, 'database/migrations/001_create_tables.sql');
  
  if (fs.existsSync(migrationPath)) {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📦 Running ${statements.length} migration statements...`);
    
    let completed = 0;
    let failed = 0;
    
    statements.forEach((statement, index) => {
      connection.query(statement, (err) => {
        if (err) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            console.error(`❌ Statement ${index + 1} failed:`, err.message);
            failed++;
          }
        }
        completed++;
        
        if (completed === statements.length) {
          if (failed === 0) {
            console.log('✅ Database migrations completed successfully');
          } else {
            console.log(`⚠️  Migrations completed with ${failed} errors`);
          }
          connection.release();
        }
      });
    });
  } else {
    console.log('⚠️  No migrations found at:', migrationPath);
    connection.release();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'IndoJobMarket Express API is running',
    version: 'v1',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to IndoJobMarket Express API',
    version: 'v1',
    endpoints: {
      health: '/health',
      dashboard: {
        summary: '/api/v1/dashboard/summary',
        industries: '/api/v1/dashboard/industries',
        trends: '/api/v1/dashboard/trends',
        recentJobs: '/api/v1/dashboard/recent-jobs',
        locations: '/api/v1/dashboard/locations'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 IndoJobMarket Express API');
  console.log('=================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  /api/v1/dashboard/summary`);
  console.log(`   GET  /api/v1/dashboard/industries`);
  console.log(`   GET  /api/v1/dashboard/trends`);
  console.log(`   GET  /api/v1/dashboard/recent-jobs`);
  console.log(`   GET  /api/v1/dashboard/locations`);
  console.log('=================================');
});