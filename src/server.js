const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

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
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
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