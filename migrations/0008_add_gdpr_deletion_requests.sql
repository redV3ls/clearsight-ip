-- Migration: Add GDPR deletion requests table
-- Created: 2025-01-27

CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  confirmation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TEXT NOT NULL,
  completed_at TEXT,
  grace_period_hours INTEGER NOT NULL DEFAULT 72,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_requests_user_id ON gdpr_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_requests_status ON gdpr_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_requests_scheduled_for ON gdpr_deletion_requests(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_requests_token ON gdpr_deletion_requests(confirmation_token);