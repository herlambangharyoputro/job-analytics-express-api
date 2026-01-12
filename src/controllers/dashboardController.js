const dashboardService = require('../services/dashboardService');

class DashboardController {
  
  // GET /api/v1/dashboard/summary
  async getSummary(req, res) {
    try {
      const summary = await dashboardService.getSummaryMetrics();
      
      res.json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        data: summary
      });
      
    } catch (error) {
      console.error('Error in getSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard summary',
        error: error.message
      });
    }
  }

  // GET /api/v1/dashboard/industries
  async getTopIndustries(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const industries = await dashboardService.getTopIndustries(limit);
      
      res.json({
        success: true,
        message: 'Top industries retrieved successfully',
        data: industries
      });
      
    } catch (error) {
      console.error('Error in getTopIndustries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve industries',
        error: error.message
      });
    }
  }

  // GET /api/v1/dashboard/trends
  async getPostingTrends(req, res) {
    try {
      const trends = await dashboardService.getPostingTrends();
      
      res.json({
        success: true,
        message: 'Posting trends retrieved successfully',
        data: trends
      });
      
    } catch (error) {
      console.error('Error in getPostingTrends:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trends',
        error: error.message
      });
    }
  }

  // GET /api/v1/dashboard/recent-jobs
  async getRecentJobs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const jobs = await dashboardService.getRecentJobs(limit);
      
      res.json({
        success: true,
        message: 'Recent jobs retrieved successfully',
        data: jobs
      });
      
    } catch (error) {
      console.error('Error in getRecentJobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent jobs',
        error: error.message
      });
    }
  }

  // GET /api/v1/dashboard/locations
  async getJobsByLocation(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const locations = await dashboardService.getJobsByLocation(limit);
      
      res.json({
        success: true,
        message: 'Jobs by location retrieved successfully',
        data: locations
      });
      
    } catch (error) {
      console.error('Error in getJobsByLocation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve locations',
        error: error.message
      });
    }
  }

}

module.exports = new DashboardController();