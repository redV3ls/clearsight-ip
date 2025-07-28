-- Migration: Add resume and team analysis tables
-- Created: 2025-01-28

-- Resume analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Team analyses table
CREATE TABLE IF NOT EXISTS team_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    team_size INTEGER NOT NULL,
    overall_match REAL NOT NULL,
    critical_gaps_count INTEGER NOT NULL,
    analysis_data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_team_analyses_user_id ON team_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_team_analyses_created_at ON team_analyses(created_at);