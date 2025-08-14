-- Migration: Add narrative_analysis table for optimized narrative CV analysis
-- Created: 2025-08-14

CREATE TABLE IF NOT EXISTS narrative_analysis (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  narrative TEXT NOT NULL,
  analysis_type TEXT NOT NULL, -- 'standalone' | 'job-comparison'
  word_count INTEGER NOT NULL DEFAULT 0,
  has_job_description INTEGER DEFAULT 0, -- D1 uses INTEGER for boolean
  processing_time_ms INTEGER,
  ai_provider TEXT DEFAULT 'deepseek',
  ai_model TEXT DEFAULT 'deepseek-reasoner',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_narrative_analysis_user_id ON narrative_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_narrative_analysis_created_at ON narrative_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_narrative_analysis_analysis_type ON narrative_analysis(analysis_type);