-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  storage_path TEXT,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  type TEXT,
  size BIGINT,
  mime_type TEXT,
  document_type TEXT,
  kind TEXT,
  industry TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS Policies

-- Select policy - Users can view their own projects
CREATE POLICY "Users can view their own projects"
ON projects
FOR SELECT
USING (auth.uid() = uploaded_by);

-- Insert policy - Users can create their own projects
CREATE POLICY "Users can create their own projects"
ON projects
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Update policy - Users can update their own projects
CREATE POLICY "Users can update their own projects"
ON projects
FOR UPDATE
USING (auth.uid() = uploaded_by);

-- Delete policy - Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
ON projects
FOR DELETE
USING (auth.uid() = uploaded_by);

-- Create indexes for better query performance
CREATE INDEX projects_uploaded_by_idx ON projects(uploaded_by);
CREATE INDEX projects_uploaded_at_idx ON projects(uploaded_at DESC);
CREATE INDEX projects_document_type_idx ON projects(document_type);
CREATE INDEX projects_kind_idx ON projects(kind);
CREATE INDEX projects_industry_idx ON projects(industry); 