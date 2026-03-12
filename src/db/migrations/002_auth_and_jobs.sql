-- Add password hash column for JWT login
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Simple Postgres-backed job queue
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NULL,
  last_error TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_queue_status_created
  ON job_queue(status, created_at);