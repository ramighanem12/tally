-- Create templates table
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT,
  access TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own templates
CREATE POLICY "Users can view their own templates" ON templates
  FOR SELECT USING (auth.uid() = created_by);

-- Create policy to allow users to insert their own templates
CREATE POLICY "Users can create their own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create policy to allow users to update their own templates
CREATE POLICY "Users can update their own templates" ON templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Create policy to allow users to delete their own templates
CREATE POLICY "Users can delete their own templates" ON templates
  FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index on created_by for faster queries
CREATE INDEX templates_created_by_idx ON templates(created_by);

-- Create index on updated_at for sorting
CREATE INDEX templates_updated_at_idx ON templates(updated_at DESC); 