-- Migration: Fix resume analyses foreign key constraint
-- Created: 2025-08-07

-- Drop the existing table
DROP TABLE IF EXISTS resume_analyses;

-- Recreate without foreign key constraint for now
CREATE TABLE IF NOT EXISTS resume_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    analysis_data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(created_at);