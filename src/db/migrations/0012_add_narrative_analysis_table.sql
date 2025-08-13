-- Migration: Add narrative_analysis table optimized for D1 free plan
-- This table is designed specifically for narrative CV analysis results

CREATE TABLE narrative_analysis (
  id TEXT PRIMARY KEY,                    -- D1 works better with TEXT for UUIDs
  user_id TEXT NOT NULL,                  -- Foreign key to users table
  narrative TEXT NOT NULL,                -- The main narrative content
  analysis_type TEXT NOT NULL,            -- 'standalone' or 'job-comparison'
  word_count INTEGER NOT NULL DEFAULT 0,  -- Word count of the narrative
  has_job_description INTEGER DEFAULT 0,  -- D1 uses INTEGER for boolean (0/1)
  processing_time_ms INTEGER,             -- Processing time in milliseconds
  ai_provider TEXT DEFAULT 'deepseek',    -- AI provider used
  ai_model TEXT DEFAULT 'deepseek-reasoner', -- AI model used
  created_at TEXT DEFAULT (datetime('now')), -- D1 datetime format
  updated_at TEXT DEFAULT (datetime('now')), -- D1 datetime format
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for efficient user queries (important for D1 performance)
CREATE INDEX idx_narrative_analysis_user_id ON narrative_analysis(user_id);

-- Create index for analysis type filtering
CREATE INDEX idx_narrative_analysis_type ON narrative_analysis(analysis_type);

-- Create index for created_at for chronological queries
CREATE INDEX idx_narrative_analysis_created_at ON narrative_analysis(created_at);

-- Create composite index for user + created_at (most common query pattern)
CREATE INDEX idx_narrative_analysis_user_created ON narrative_analysis(user_id, created_at DESC);