const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard Summary KPIs (4 endpoints)
router.get('/dashboard/summary/total-jobs', dashboardController.getTotalJobs);
router.get('/dashboard/summary/monthly-growth', dashboardController.getMonthlyGrowth);
router.get('/dashboard/summary/avg-salary', dashboardController.getAvgSalary);
router.get('/dashboard/summary/active-companies', dashboardController.getActiveCompanies);

// Main Charts (6 endpoints)
router.get('/dashboard/charts/top-industries', dashboardController.getTopIndustries);
router.get('/dashboard/charts/job-type-distribution', dashboardController.getJobTypeDistribution);
router.get('/dashboard/charts/location-distribution', dashboardController.getLocationDistribution);
router.get('/dashboard/charts/job-level-distribution', dashboardController.getJobLevelDistribution);
router.get('/dashboard/charts/posting-trends', dashboardController.getPostingTrends);
router.get('/dashboard/charts/top-skills', dashboardController.getTopSkills);

// Secondary Widgets (3 endpoints)
router.get('/dashboard/widgets/recent-activity', dashboardController.getRecentActivity);
router.get('/dashboard/widgets/fastest-growing', dashboardController.getFastestGrowing);
router.get('/dashboard/widgets/salary-preview', dashboardController.getSalaryPreview);

module.exports = router;