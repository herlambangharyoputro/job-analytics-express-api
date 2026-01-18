const db = require('../config/database');

// ==========================================
// KPI CARDS ENDPOINTS (4)
// ==========================================

/**
 * KPI Card #1: Total Active Jobs
 * GET /api/v1/analytics/dashboard/summary/total-jobs
 */
exports.getTotalJobs = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as jobs_last_month,
        COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                  AND posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as jobs_prev_month,
        ROUND(
            (COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) - 
             COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                       AND posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END)) * 100.0 / 
            NULLIF(COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                              AND posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END), 0),
            2
        ) as growth_percentage
      FROM jobs
      WHERE is_active = TRUE;
    `;

    const [rows] = await db.query(query);
    const data = rows[0];

    // Get top industry
    const industryQuery = `
      SELECT i.name as industry_name, COUNT(j.id) as job_count,
             ROUND(COUNT(j.id) * 100.0 / 
                   (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE AND posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)), 2) as percentage
      FROM jobs j
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE AND j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY i.id, i.name
      ORDER BY job_count DESC
      LIMIT 1;
    `;

    const [industryRows] = await db.query(industryQuery);
    const topIndustry = industryRows[0] || { industry_name: 'N/A', percentage: 0 };

    res.json({
      success: true,
      data: {
        total_jobs: parseInt(data.total_jobs) || 0,
        jobs_last_month: parseInt(data.jobs_last_month) || 0,
        jobs_prev_month: parseInt(data.jobs_prev_month) || 0,
        growth_percentage: parseFloat(data.growth_percentage) || 0,
        top_industry: topIndustry.industry_name,
        top_industry_percentage: parseFloat(topIndustry.percentage) || 0
      }
    });
  } catch (error) {
    console.error('Error in getTotalJobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch total jobs data',
      error: error.message
    });
  }
};

/**
 * KPI Card #2: Monthly Growth
 * GET /api/v1/analytics/dashboard/summary/monthly-growth
 */
exports.getMonthlyGrowth = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_jobs_this_month,
        COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                  AND posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_jobs_prev_month,
        ROUND(
            (COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) - 
             COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                       AND posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END)) * 100.0 / 
            NULLIF(COUNT(CASE WHEN posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                              AND posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END), 0),
            2
        ) as growth_percentage
      FROM jobs
      WHERE is_active = TRUE;
    `;

    const [rows] = await db.query(query);
    const data = rows[0];

    // Get fastest growing industry
    const growthQuery = `
      SELECT i.name as industry_name,
             COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as current_month,
             COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                       AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as prev_month,
             ROUND(
                (COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) - 
                 COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                           AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END)) * 100.0 / 
                NULLIF(COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                                  AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END), 0),
                2
             ) as growth_rate
      FROM jobs j
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE
      GROUP BY i.id, i.name
      HAVING growth_rate IS NOT NULL
      ORDER BY growth_rate DESC
      LIMIT 1;
    `;

    const [growthRows] = await db.query(growthQuery);
    const fastestGrowing = growthRows[0] || { industry_name: 'N/A', growth_rate: 0 };

    res.json({
      success: true,
      data: {
        new_jobs_this_month: parseInt(data.new_jobs_this_month) || 0,
        new_jobs_prev_month: parseInt(data.new_jobs_prev_month) || 0,
        growth_percentage: parseFloat(data.growth_percentage) || 0,
        fastest_growing_industry: fastestGrowing.industry_name,
        fastest_growing_rate: parseFloat(fastestGrowing.growth_rate) || 0
      }
    });
  } catch (error) {
    console.error('Error in getMonthlyGrowth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly growth data',
      error: error.message
    });
  }
};

/**
 * KPI Card #3: Average Salary Range
 * GET /api/v1/analytics/dashboard/summary/avg-salary
 */
exports.getAvgSalary = async (req, res) => {
  try {
    const query = `
      SELECT 
        AVG((salary_min + salary_max) / 2) as avg_salary,
        MIN(salary_min) as min_salary,
        MAX(salary_max) as max_salary,
        COUNT(CASE WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL THEN 1 END) as jobs_with_salary
      FROM jobs
      WHERE is_active = TRUE 
        AND salary_min IS NOT NULL 
        AND salary_max IS NOT NULL
        AND salary_min > 0;
    `;

    const [rows] = await db.query(query);
    const data = rows[0];

    // Get industry with highest average salary
    const industryQuery = `
      SELECT i.name as industry_name,
             AVG((j.salary_min + j.salary_max) / 2) as avg_salary
      FROM jobs j
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE 
        AND j.salary_min IS NOT NULL 
        AND j.salary_max IS NOT NULL
        AND j.salary_min > 0
      GROUP BY i.id, i.name
      HAVING COUNT(j.id) >= 3
      ORDER BY avg_salary DESC
      LIMIT 1;
    `;

    const [industryRows] = await db.query(industryQuery);
    const topPayingIndustry = industryRows[0] || { industry_name: 'N/A', avg_salary: 0 };

    res.json({
      success: true,
      data: {
        avg_salary: Math.round(parseFloat(data.avg_salary) || 0),
        min_salary: parseInt(data.min_salary) || 0,
        max_salary: parseInt(data.max_salary) || 0,
        jobs_with_salary: parseInt(data.jobs_with_salary) || 0,
        top_paying_industry: topPayingIndustry.industry_name,
        top_paying_avg: Math.round(parseFloat(topPayingIndustry.avg_salary) || 0)
      }
    });
  } catch (error) {
    console.error('Error in getAvgSalary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch average salary data',
      error: error.message
    });
  }
};

/**
 * KPI Card #4: Active Companies
 * GET /api/v1/analytics/dashboard/summary/active-companies
 */
exports.getActiveCompanies = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT c.id) as total_companies,
        COUNT(DISTINCT CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN c.id END) as companies_this_month,
        COUNT(DISTINCT CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                            AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN c.id END) as companies_prev_month
      FROM companies c
      JOIN jobs j ON c.id = j.company_id
      WHERE j.is_active = TRUE;
    `;

    const [rows] = await db.query(query);
    const data = rows[0];

    const companiesThisMonth = parseInt(data.companies_this_month) || 0;
    const companiesPrevMonth = parseInt(data.companies_prev_month) || 0;
    const growthPercentage = companiesPrevMonth > 0 
      ? ((companiesThisMonth - companiesPrevMonth) * 100.0 / companiesPrevMonth).toFixed(2)
      : 0;

    // Get industry with most companies hiring
    const industryQuery = `
      SELECT i.name as industry_name,
             COUNT(DISTINCT c.id) as company_count
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE 
        AND j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY i.id, i.name
      ORDER BY company_count DESC
      LIMIT 1;
    `;

    const [industryRows] = await db.query(industryQuery);
    const mostActiveIndustry = industryRows[0] || { industry_name: 'N/A', company_count: 0 };

    res.json({
      success: true,
      data: {
        total_companies: parseInt(data.total_companies) || 0,
        companies_this_month: companiesThisMonth,
        companies_prev_month: companiesPrevMonth,
        growth_percentage: parseFloat(growthPercentage) || 0,
        most_active_industry: mostActiveIndustry.industry_name,
        companies_in_top_industry: parseInt(mostActiveIndustry.company_count) || 0
      }
    });
  } catch (error) {
    console.error('Error in getActiveCompanies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active companies data',
      error: error.message
    });
  }
};

// ==========================================
// MAIN CHARTS ENDPOINTS (6)
// ==========================================

/**
 * Chart #1: Top Industries (Bar Chart)
 * GET /api/v1/analytics/dashboard/charts/top-industries
 */
exports.getTopIndustries = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.name as industry,
        COUNT(j.id) as job_count,
        ROUND(COUNT(j.id) * 100.0 / (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE), 2) as percentage
      FROM jobs j
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE
      GROUP BY i.id, i.name
      HAVING COUNT(j.id) >= 3
      ORDER BY job_count DESC
      LIMIT 10;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        industry: row.industry,
        job_count: parseInt(row.job_count),
        percentage: parseFloat(row.percentage)
      }))
    });
  } catch (error) {
    console.error('Error in getTopIndustries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top industries data',
      error: error.message
    });
  }
};

/**
 * Chart #2: Job Type Distribution (Pie Chart)
 * GET /api/v1/analytics/dashboard/charts/job-type-distribution
 */
exports.getJobTypeDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        et.name as job_type,
        COUNT(j.id) as count,
        ROUND(COUNT(j.id) * 100.0 / (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE), 2) as percentage
      FROM jobs j
      JOIN employment_types et ON j.employment_type_id = et.id
      WHERE j.is_active = TRUE
      GROUP BY et.id, et.name
      ORDER BY count DESC;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        job_type: row.job_type,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      }))
    });
  } catch (error) {
    console.error('Error in getJobTypeDistribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job type distribution data',
      error: error.message
    });
  }
};

/**
 * Chart #3: Location Distribution (Horizontal Bar)
 * GET /api/v1/analytics/dashboard/charts/location-distribution
 */
exports.getLocationDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.city as location,
        COUNT(j.id) as job_count,
        ROUND(COUNT(j.id) * 100.0 / (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE), 2) as percentage
      FROM jobs j
      JOIN locations l ON j.location_id = l.id
      WHERE j.is_active = TRUE
      GROUP BY l.city
      HAVING COUNT(j.id) >= 3
      ORDER BY job_count DESC
      LIMIT 10;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        location: row.location,
        job_count: parseInt(row.job_count),
        percentage: parseFloat(row.percentage)
      }))
    });
  } catch (error) {
    console.error('Error in getLocationDistribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location distribution data',
      error: error.message
    });
  }
};

/**
 * Chart #4: Job Level Distribution (Stacked Bar)
 * GET /api/v1/analytics/dashboard/charts/job-level-distribution
 */
exports.getJobLevelDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        jl.name as job_level,
        COUNT(j.id) as count,
        ROUND(COUNT(j.id) * 100.0 / (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE), 2) as percentage
      FROM jobs j
      JOIN job_levels jl ON j.job_level_id = jl.id
      WHERE j.is_active = TRUE
      GROUP BY jl.id, jl.name
      ORDER BY 
        CASE jl.name
          WHEN 'Entry Level' THEN 1
          WHEN 'Junior' THEN 2
          WHEN 'Mid Level' THEN 3
          WHEN 'Senior' THEN 4
          WHEN 'Lead' THEN 5
          WHEN 'Manager' THEN 6
          WHEN 'Director' THEN 7
          WHEN 'Executive' THEN 8
          ELSE 9
        END;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        job_level: row.job_level,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      }))
    });
  } catch (error) {
    console.error('Error in getJobLevelDistribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job level distribution data',
      error: error.message
    });
  }
};

/**
 * Chart #5: Posting Trends (Line Chart - Last 30 Days)
 * GET /api/v1/analytics/dashboard/charts/posting-trends
 */
exports.getPostingTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(posted_at) as date,
        COUNT(id) as job_count
      FROM jobs
      WHERE is_active = TRUE 
        AND posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(posted_at)
      ORDER BY date ASC;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        date: row.date,
        job_count: parseInt(row.job_count)
      }))
    });
  } catch (error) {
    console.error('Error in getPostingTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posting trends data',
      error: error.message
    });
  }
};

/**
 * Chart #6: Top Skills (Horizontal Bar)
 * GET /api/v1/analytics/dashboard/charts/top-skills
 */
exports.getTopSkills = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.name as skill,
        s.category,
        COUNT(DISTINCT js.job_id) as job_count,
        ROUND(COUNT(DISTINCT js.job_id) * 100.0 / (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE), 2) as percentage
      FROM skills s
      JOIN job_skills js ON s.id = js.skill_id
      JOIN jobs j ON js.job_id = j.id
      WHERE j.is_active = TRUE
      GROUP BY s.id, s.name, s.category
      HAVING COUNT(DISTINCT js.job_id) >= 3
      ORDER BY job_count DESC
      LIMIT 15;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        skill: row.skill,
        category: row.category,
        job_count: parseInt(row.job_count),
        percentage: parseFloat(row.percentage)
      }))
    });
  } catch (error) {
    console.error('Error in getTopSkills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top skills data',
      error: error.message
    });
  }
};

// ==========================================
// SECONDARY WIDGETS ENDPOINTS (3)
// ==========================================

/**
 * Widget #1: Recent Activity (Last 7 Days Daily Stats)
 * GET /api/v1/analytics/dashboard/widgets/recent-activity
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(posted_at) as date,
        COUNT(id) as jobs_posted,
        COUNT(DISTINCT company_id) as companies_active
      FROM jobs
      WHERE posted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(posted_at)
      ORDER BY date DESC;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        date: row.date,
        jobs_posted: parseInt(row.jobs_posted),
        companies_active: parseInt(row.companies_active)
      }))
    });
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity data',
      error: error.message
    });
  }
};

/**
 * Widget #2: Fastest Growing Segments
 * GET /api/v1/analytics/dashboard/widgets/fastest-growing
 */
exports.getFastestGrowing = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.name as segment,
        COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as current_month,
        COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                  AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as prev_month,
        ROUND(
          (COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) - 
           COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                     AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END)) * 100.0 / 
          NULLIF(COUNT(CASE WHEN j.posted_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
                            AND j.posted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END), 0),
          2
        ) as growth_rate
      FROM jobs j
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE
      GROUP BY i.id, i.name
      HAVING growth_rate IS NOT NULL AND growth_rate > 0
      ORDER BY growth_rate DESC
      LIMIT 5;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        segment: row.segment,
        current_month: parseInt(row.current_month),
        prev_month: parseInt(row.prev_month),
        growth_rate: parseFloat(row.growth_rate)
      }))
    });
  } catch (error) {
    console.error('Error in getFastestGrowing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fastest growing segments data',
      error: error.message
    });
  }
};

/**
 * Widget #3: Salary Preview (Ranges by Industry)
 * GET /api/v1/analytics/dashboard/widgets/salary-preview
 */
exports.getSalaryPreview = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.name as industry,
        MIN(j.salary_min) as min_salary,
        MAX(j.salary_max) as max_salary,
        AVG((j.salary_min + j.salary_max) / 2) as avg_salary,
        COUNT(j.id) as job_count
      FROM jobs j
      JOIN industries i ON j.industry_id = i.id
      WHERE j.is_active = TRUE 
        AND j.salary_min IS NOT NULL 
        AND j.salary_max IS NOT NULL
        AND j.salary_min > 0
      GROUP BY i.id, i.name
      HAVING COUNT(j.id) >= 3
      ORDER BY avg_salary DESC
      LIMIT 8;
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows.map(row => ({
        industry: row.industry,
        min_salary: parseInt(row.min_salary),
        max_salary: parseInt(row.max_salary),
        avg_salary: Math.round(parseFloat(row.avg_salary)),
        job_count: parseInt(row.job_count)
      }))
    });
  } catch (error) {
    console.error('Error in getSalaryPreview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary preview data',
      error: error.message
    });
  }
};
