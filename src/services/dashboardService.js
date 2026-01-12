const pool = require('../config/database');

class DashboardService {
  
  // Get summary metrics
  async getSummaryMetrics() {
    const connection = await pool.getConnection();
    
    try {
      // Total active jobs
      const [totalResult] = await connection.query(
        'SELECT COUNT(*) as total FROM jobs WHERE is_active = TRUE'
      );
      
      // Jobs by employment type
      const [employmentTypeResult] = await connection.query(`
        SELECT et.name as employment_type, COUNT(*) as count
        FROM jobs j
        JOIN employment_types et ON j.employment_type_id = et.id
        WHERE j.is_active = TRUE
        GROUP BY et.name
        ORDER BY count DESC
      `);
      
      // Jobs posted in last 7 days
      const [recentResult] = await connection.query(`
        SELECT COUNT(*) as count
        FROM jobs
        WHERE is_active = TRUE
        AND posted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      
      // Average salary
      const [salaryResult] = await connection.query(`
        SELECT 
          AVG((salary_min + salary_max) / 2) as avg_salary
        FROM jobs
        WHERE is_active = TRUE
        AND salary_min IS NOT NULL
        AND salary_max IS NOT NULL
      `);

      return {
        total_jobs: totalResult[0].total,
        recent_jobs_7d: recentResult[0].count,
        avg_salary: Math.round(salaryResult[0].avg_salary || 0),
        employment_types: employmentTypeResult
      };
      
    } finally {
      connection.release();
    }
  }

  // Get top industries
  async getTopIndustries(limit = 5) {
    const connection = await pool.getConnection();
    
    try {
      const [results] = await connection.query(`
        SELECT 
          i.name as industry,
          COUNT(*) as job_count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE), 1) as percentage
        FROM jobs j
        JOIN industries i ON j.industry_id = i.id
        WHERE j.is_active = TRUE
        GROUP BY i.name
        ORDER BY job_count DESC
        LIMIT ?
      `, [limit]);
      
      return results;
      
    } finally {
      connection.release();
    }
  }

  // Get posting trends (last 30 days)
  async getPostingTrends() {
    const connection = await pool.getConnection();
    
    try {
      const [results] = await connection.query(`
        SELECT 
          DATE(posted_at) as date,
          COUNT(*) as count
        FROM jobs
        WHERE posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(posted_at)
        ORDER BY date ASC
      `);
      
      return results;
      
    } finally {
      connection.release();
    }
  }

  // Get recent jobs
  async getRecentJobs(limit = 10) {
    const connection = await pool.getConnection();
    
    try {
      const [results] = await connection.query(`
        SELECT 
          j.id,
          j.title,
          c.name as company_name,
          l.city as location,
          i.name as industry,
          et.name as employment_type,
          jl.name as job_level,
          j.salary_min,
          j.salary_max,
          j.posted_at
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        JOIN locations l ON j.location_id = l.id
        JOIN industries i ON j.industry_id = i.id
        JOIN employment_types et ON j.employment_type_id = et.id
        JOIN job_levels jl ON j.job_level_id = jl.id
        WHERE j.is_active = TRUE
        ORDER BY j.posted_at DESC
        LIMIT ?
      `, [limit]);
      
      return results;
      
    } finally {
      connection.release();
    }
  }

  // Get jobs by location
  async getJobsByLocation(limit = 10) {
    const connection = await pool.getConnection();
    
    try {
      const [results] = await connection.query(`
        SELECT 
          l.city as location,
          COUNT(*) as job_count
        FROM jobs j
        JOIN locations l ON j.location_id = l.id
        WHERE j.is_active = TRUE
        GROUP BY l.city
        ORDER BY job_count DESC
        LIMIT ?
      `, [limit]);
      
      return results;
      
    } finally {
      connection.release();
    }
  }

}

module.exports = new DashboardService();