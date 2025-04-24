-- Create workflow_runs table
CREATE TABLE workflow_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX workflow_runs_created_by_idx ON workflow_runs(created_by);
CREATE INDEX workflow_runs_created_at_idx ON workflow_runs(created_at);
CREATE INDEX workflow_runs_workflow_id_idx ON workflow_runs(workflow_id);

-- Create policies
CREATE POLICY "Users can view their own workflow runs"
  ON workflow_runs
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own workflow runs"
  ON workflow_runs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflow runs"
  ON workflow_runs
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Add status constraint
ALTER TABLE workflow_runs
  ADD CONSTRAINT valid_status 
  CHECK (status IN ('running', 'completed', 'failed', 'cancelled')); 