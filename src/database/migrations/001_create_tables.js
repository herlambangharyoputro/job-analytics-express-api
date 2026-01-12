const pool = require('../../config/database');

async function runMigrations() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Running migrations...');

    // Create jobs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        location VARCHAR(100),
        employment_type VARCHAR(50),
        job_level VARCHAR(100),
        industry VARCHAR(100),
        salary_min DECIMAL(12,2),
        salary_max DECIMAL(12,2),
        posted_at TIMESTAMP,
        scraped_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_industry (industry),
        INDEX idx_location (location),
        INDEX idx_employment_type (employment_type),
        INDEX idx_posted_at (posted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created table: jobs');

    // Create mod01_dashboard_cache table (for future caching)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mod01_dashboard_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(100) UNIQUE NOT NULL,
        cache_data JSON NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cache_key (cache_key),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Created table: mod01_dashboard_cache');

    console.log('✅ All migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { runMigrations };