-- PlayDate Database Initialization Script
-- This script will be run when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance (tables will be created by SQLAlchemy)
-- These will be applied after the tables are created

-- Note: The actual table creation is handled by SQLAlchemy in the Flask app
-- This file is mainly for any initial data or database-specific configurations

-- You can add initial seed data here if needed
-- For example:
-- INSERT INTO users (name, email, age, bio, city, interests, photos, preferences, created_at, updated_at) 
-- VALUES 
--   ('Alice Demo', 'alice@playdate.com', 25, 'Love gaming and meeting new people!', 'San Francisco', 
--    '["gaming", "music", "travel"]', '[]', '{"ageRange": {"min": 22, "max": 30}, "maxDistance": 50}', 
--    NOW(), NOW()),
--   ('Bob Demo', 'bob@playdate.com', 28, 'Puzzle enthusiast and coffee lover', 'New York', 
--    '["puzzles", "coffee", "books"]', '[]', '{"ageRange": {"min": 24, "max": 32}, "maxDistance": 25}', 
--    NOW(), NOW());

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Triggers will be added after tables are created by the application
