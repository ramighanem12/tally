-- Create the business_details table
CREATE TABLE business_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  legal_name TEXT,
  dba TEXT,
  entity_type TEXT,
  state_of_incorporation TEXT,
  ein TEXT,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  incorporation_date DATE NULL,
  fiscal_period TEXT,
  industry TEXT,
  revenue_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE business_details ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own business details
CREATE POLICY "Users can view their own business details"
ON business_details
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own business details
CREATE POLICY "Users can insert their own business details"
ON business_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own business details
CREATE POLICY "Users can update their own business details"
ON business_details
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before update
CREATE TRIGGER update_business_details_updated_at
    BEFORE UPDATE
    ON business_details
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 