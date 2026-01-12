const pool = require('../../config/database');
const { runMigrations } = require('../migrations/001_create_tables');

async function seedJobs() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🌱 Seeding jobs data...');

    // Check if jobs already have data
    const [existingJobs] = await connection.query('SELECT COUNT(*) as count FROM jobs');
    
    if (existingJobs[0].count >= 100) {
      console.log(`✅ Jobs table already has ${existingJobs[0].count} records`);
      console.log('✅ Skipping seeding - using existing data');
      return;
    }

    // Get reference data
    const [companies] = await connection.query('SELECT id FROM companies');
    const [locations] = await connection.query('SELECT id FROM locations');
    const [industries] = await connection.query('SELECT id FROM industries');
    const [employmentTypes] = await connection.query('SELECT id FROM employment_types');
    const [jobLevels] = await connection.query('SELECT id FROM job_levels');
    const [jobFunctions] = await connection.query('SELECT id FROM job_functions');

    console.log('✅ Found reference data:');
    console.log(`   - ${companies.length} companies`);
    console.log(`   - ${locations.length} locations`);
    console.log(`   - ${industries.length} industries`);
    console.log(`   - ${employmentTypes.length} employment types`);
    console.log(`   - ${jobLevels.length} job levels`);
    console.log(`   - ${jobFunctions.length} job functions`);

    // Clear existing jobs
    await connection.query('DELETE FROM jobs');
    console.log('✅ Cleared existing jobs data');

    const jobTitles = [
      'Software Engineer', 'Data Analyst', 'Product Manager', 
      'Sales Executive', 'Marketing Manager', 'HR Specialist',
      'Financial Analyst', 'Business Analyst', 'Operations Manager',
      'Customer Success Manager', 'DevOps Engineer', 'UI/UX Designer',
      'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
      'QA Engineer', 'System Administrator', 'Network Engineer'
    ];

    const jobs = [];

    // Generate 150 sample jobs
    for (let i = 1; i <= 150; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
      const jobLevel = jobLevels[Math.floor(Math.random() * jobLevels.length)];
      const jobFunction = jobFunctions[Math.floor(Math.random() * jobFunctions.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      
      // Salary based on level (1=Junior, 7=C-Level based on your job_levels.sql)
      let salaryMin, salaryMax;
      if (jobLevel.id <= 1) { // Junior
        salaryMin = 4000000 + Math.floor(Math.random() * 2000000);
        salaryMax = salaryMin + 2000000;
      } else if (jobLevel.id <= 3) { // Mid to Senior
        salaryMin = 8000000 + Math.floor(Math.random() * 4000000);
        salaryMax = salaryMin + 4000000;
      } else if (jobLevel.id <= 5) { // Manager to Senior Manager
        salaryMin = 15000000 + Math.floor(Math.random() * 5000000);
        salaryMax = salaryMin + 5000000;
      } else { // Director to C-Level
        salaryMin = 25000000 + Math.floor(Math.random() * 10000000);
        salaryMax = salaryMin + 10000000;
      }

      // Posted date (last 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const postedAt = new Date();
      postedAt.setDate(postedAt.getDate() - daysAgo);

      jobs.push([
        title,
        company.id,
        location.id,
        employmentType.id,
        jobLevel.id,
        jobFunction.id,
        industry.id,
        salaryMin,
        salaryMax,
        postedAt,
        new Date(),
        true
      ]);
    }

    // Insert jobs with FK relationships
    const query = `
      INSERT INTO jobs (
        title, company_id, location_id, employment_type_id, job_level_id,
        job_function_id, industry_id, salary_min, salary_max, 
        posted_at, scraped_at, is_active
      ) VALUES ?
    `;
    
    await connection.query(query, [jobs]);
    console.log(`✅ Inserted ${jobs.length} sample jobs`);

    console.log('✅ Seeding completed successfully');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function runSeeders() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Skip migrations (tables already exist)
    console.log('⏭️  Skipping migrations - tables already exist\n');
    
    // Seed jobs data
    await seedJobs();
    
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runSeeders();
}

module.exports = { seedJobs, runSeeders };