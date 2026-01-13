-- Create tables for Module 01 Dashboard

-- Jobs table (main table)
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company_id BIGINT,
    location_id BIGINT,
    employment_type_id INT,
    job_level_id INT,
    job_function_id INT,
    industry_id BIGINT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency VARCHAR(3) DEFAULT 'IDR',
    description_short TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    source_url TEXT,
    posted_at TIMESTAMP NULL,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_count_min INT,
    employee_count_max INT,
    industry_id BIGINT,
    slug VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    full_name VARCHAR(255),
    slug VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employment Types table
CREATE TABLE IF NOT EXISTS employment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Levels table
CREATE TABLE IF NOT EXISTS job_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Functions table
CREATE TABLE IF NOT EXISTS job_functions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Industries table
CREATE TABLE IF NOT EXISTS industries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert reference data for employment types
INSERT INTO employment_types (name) VALUES 
('Full Time'), ('Kontrak'), ('Part Time'), ('Remote'), ('Freelance'), ('Magang')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert reference data for job levels
INSERT INTO job_levels (name) VALUES 
('Junior / Entry Level'), ('Mid Level'), ('Senior Level'), 
('Manager'), ('Senior Manager'), ('Director'), ('C-Level')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert reference data for job functions
INSERT INTO job_functions (name) VALUES 
('Software Development'), ('Data Science'), ('Product Management'),
('Sales & Marketing'), ('Finance & Accounting'), ('Human Resources'),
('Operations'), ('Customer Service'), ('Design'), ('Engineering')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert reference data for industries
INSERT INTO industries (name) VALUES 
('Technology'), ('Finance'), ('Healthcare'), ('Manufacturing'),
('Retail'), ('Education'), ('Consulting'), ('Real Estate'),
('Transportation'), ('Media & Entertainment')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert reference data for locations
INSERT INTO locations (city, province, country, full_name, slug) VALUES 
('Jakarta', 'DKI Jakarta', 'Indonesia', 'Jakarta, DKI Jakarta', 'jakarta'),
('Surabaya', 'Jawa Timur', 'Indonesia', 'Surabaya, Jawa Timur', 'surabaya'),
('Bandung', 'Jawa Barat', 'Indonesia', 'Bandung, Jawa Barat', 'bandung'),
('Medan', 'Sumatera Utara', 'Indonesia', 'Medan, Sumatera Utara', 'medan'),
('Semarang', 'Jawa Tengah', 'Indonesia', 'Semarang, Jawa Tengah', 'semarang'),
('Yogyakarta', 'DI Yogyakarta', 'Indonesia', 'Yogyakarta, DI Yogyakarta', 'yogyakarta'),
('Bali', 'Bali', 'Indonesia', 'Bali, Bali', 'bali'),
('Makassar', 'Sulawesi Selatan', 'Indonesia', 'Makassar, Sulawesi Selatan', 'makassar')
ON DUPLICATE KEY UPDATE city=VALUES(city);

-- Insert reference data for companies
INSERT INTO companies (name, employee_count_min, employee_count_max, industry_id, slug) VALUES 
('PT Teknologi Nusantara', 201, 500, 1, 'pt-teknologi-nusantara'),
('PT Bank Digital Indonesia', 501, 1000, 2, 'pt-bank-digital-indonesia'),
('RS Mitra Sehat', 51, 200, 3, 'rs-mitra-sehat'),
('PT Industri Jaya', 1001, 5000, 4, 'pt-industri-jaya'),
('PT Retail Makmur', 201, 500, 5, 'pt-retail-makmur'),
('Universitas Maju Bersama', 51, 200, 6, 'universitas-maju-bersama'),
('PT Konsultan Profesional', 11, 50, 7, 'pt-konsultan-profesional'),
('PT Property Sejahtera', 51, 200, 8, 'pt-property-sejahtera'),
('PT Logistik Cepat', 201, 500, 9, 'pt-logistik-cepat'),
('PT Media Kreatif', 11, 50, 10, 'pt-media-kreatif')
ON DUPLICATE KEY UPDATE name=VALUES(name);