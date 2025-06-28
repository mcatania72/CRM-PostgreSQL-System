-- PostgreSQL initialization script for CRM Database
-- This script runs automatically when the PostgreSQL container starts

-- Ensure the database exists (already created by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS crm_db;

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;

-- Connect to the database
\c crm_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create schemas if needed (optional)
-- CREATE SCHEMA IF NOT EXISTS crm_data;
-- GRANT USAGE ON SCHEMA crm_data TO crm_user;
-- GRANT CREATE ON SCHEMA crm_data TO crm_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'CRM Database initialized successfully!';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Timestamp: %', now();
END $$;