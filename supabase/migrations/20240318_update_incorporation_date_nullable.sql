-- Explicitly make incorporation_date nullable (it already is, but let's be explicit)
ALTER TABLE business_details 
ALTER COLUMN incorporation_date TYPE DATE,
ALTER COLUMN incorporation_date DROP NOT NULL; 