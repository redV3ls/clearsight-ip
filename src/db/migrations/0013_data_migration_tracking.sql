-- Migration tracking table for data migration operations
-- This table tracks migration progress and results

CREATE TABLE IF NOT EXISTS migration_log (
  id TEXT PRIMARY KEY,
  migration_type TEXT NOT NULL,
  user_id TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  successful_migrations INTEGER DEFAULT 0,
  failed_migrations INTEGER DEFAULT 0,
  skipped_migrations INTEGER DEFAULT 0,
  error_details TEXT, -- JSON string of errors
  processing_time_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_migration_log_user_id ON migration_log(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_log_status ON migration_log(status);
CREATE INDEX IF NOT EXISTS idx_migration_log_type ON migration_log(migration_type);
CREATE INDEX IF NOT EXISTS idx_migration_log_started_at ON migration_log(started_at);

-- Migration metadata table for storing additional migration information
CREATE TABLE IF NOT EXISTS migration_metadata (
  id TEXT PRIMARY KEY,
  migration_log_id TEXT NOT NULL,
  analysis_id TEXT NOT NULL,
  legacy_data TEXT, -- JSON string of original legacy data
  migration_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'migrated', 'failed', 'skipped'
  error_message TEXT,
  migrated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (migration_log_id) REFERENCES migration_log(id)
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_migration_metadata_log_id ON migration_metadata(migration_log_id);
CREATE INDEX IF NOT EXISTS idx_migration_metadata_analysis_id ON migration_metadata(analysis_id);
CREATE INDEX IF NOT EXISTS idx_migration_metadata_status ON migration_metadata(migration_status);