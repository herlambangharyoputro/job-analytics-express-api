const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard API endpoints
router.get('/summary', dashboardController.getSummary);
router.get('/industries', dashboardController.getTopIndustries);
router.get('/trends', dashboardController.getPostingTrends);
router.get('/recent-jobs', dashboardController.getRecentJobs);
router.get('/locations', dashboardController.getJobsByLocation);

module.exports = router;