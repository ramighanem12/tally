-- Create queries table
CREATE TABLE queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_run_at TIMESTAMPTZ,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    query_text TEXT,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX queries_created_by_idx ON queries(created_by);
CREATE INDEX queries_project_id_idx ON queries(project_id);
CREATE INDEX queries_created_at_idx ON queries(created_at);

-- Enable Row Level Security
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own queries
CREATE POLICY "Users can view own queries"
    ON queries
    FOR SELECT
    USING (auth.uid() = created_by);

-- Allow users to insert their own queries
CREATE POLICY "Users can insert own queries"
    ON queries
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own queries
CREATE POLICY "Users can update own queries"
    ON queries
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own queries
CREATE POLICY "Users can delete own queries"
    ON queries
    FOR DELETE
    USING (auth.uid() = created_by);

-- Create enum type for query status
CREATE TYPE query_status AS ENUM (
    'draft',
    'running',
    'completed',
    'failed',
    'cancelled'
);

-- Add status constraint
ALTER TABLE queries
    ADD CONSTRAINT valid_status 
    CHECK (status::query_status IN ('draft', 'running', 'completed', 'failed', 'cancelled'));

-- Add type constraint
ALTER TABLE queries
    ADD CONSTRAINT valid_type 
    CHECK (type IN ('analysis', 'report', 'audit', 'custom'));

-- Create function to update last_run_at
CREATE OR REPLACE FUNCTION update_query_last_run()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'running' THEN
        NEW.last_run_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_run_at
CREATE TRIGGER update_query_last_run_trigger
    BEFORE UPDATE ON queries
    FOR EACH ROW
    WHEN (NEW.status = 'running')
    EXECUTE FUNCTION update_query_last_run();

-- Create query_cells table
create table if not exists public.query_cells (
  id uuid not null default uuid_generate_v4() primary key,
  query_id uuid not null references public.queries(id) on delete cascade,
  document_id uuid not null references public.vault(id) on delete cascade,
  column_id uuid not null references public.query_columns(id) on delete cascade,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  status text default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR')),
  error_message text,
  metadata jsonb default '{}'::jsonb,
  unique(query_id, document_id, column_id)
);

-- Add RLS policies for query_cells
alter table public.query_cells enable row level security;

create policy "Users can view their own query cells"
  on public.query_cells for select
  using (auth.uid() = created_by);

create policy "Users can insert their own query cells"
  on public.query_cells for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own query cells"
  on public.query_cells for update
  using (auth.uid() = created_by);

create policy "Users can delete their own query cells"
  on public.query_cells for delete
  using (auth.uid() = created_by);

-- Create index for faster lookups
create index if not exists query_cells_query_id_idx on public.query_cells(query_id);
create index if not exists query_cells_document_id_idx on public.query_cells(document_id);
create index if not exists query_cells_column_id_idx on public.query_cells(column_id); 