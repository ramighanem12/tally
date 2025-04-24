-- Create matrix_columns table
CREATE TABLE matrix_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matrix_id UUID REFERENCES matrices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create matrix_documents table (junction table)
CREATE TABLE matrix_documents (
  matrix_id UUID REFERENCES matrices(id) ON DELETE CASCADE,
  document_id UUID REFERENCES docs(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (matrix_id, document_id)
);

-- Create matrix_cells table
CREATE TABLE matrix_cells (
  matrix_id UUID REFERENCES matrices(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  column_id UUID REFERENCES matrix_columns(id) ON DELETE CASCADE,
  extracted_text TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (matrix_id, document_id, column_id)
);

-- Enable RLS
ALTER TABLE matrix_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_cells ENABLE ROW LEVEL SECURITY;

-- Matrix columns policies
CREATE POLICY "Users can view their own matrix columns"
  ON matrix_columns
  FOR SELECT
  USING (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own matrix columns"
  ON matrix_columns
  FOR INSERT
  WITH CHECK (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own matrix columns"
  ON matrix_columns
  FOR UPDATE
  USING (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own matrix columns"
  ON matrix_columns
  FOR DELETE
  USING (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

-- Matrix documents policies
CREATE POLICY "Users can view their own matrix documents"
  ON matrix_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matrices 
      WHERE id = matrix_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own matrix documents"
  ON matrix_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matrices 
      WHERE id = matrix_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own matrix documents"
  ON matrix_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM matrices 
      WHERE id = matrix_id 
      AND created_by = auth.uid()
    )
  );

-- Matrix cells policies
CREATE POLICY "Users can view their own matrix cells"
  ON matrix_cells
  FOR SELECT
  USING (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own matrix cells"
  ON matrix_cells
  FOR INSERT
  WITH CHECK (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own matrix cells"
  ON matrix_cells
  FOR UPDATE
  USING (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own matrix cells"
  ON matrix_cells
  FOR DELETE
  USING (
    matrix_id IN (
      SELECT id FROM matrices WHERE created_by = auth.uid()
    )
  );

-- Add policy for reading documents
CREATE POLICY "Users can view their own documents" 
ON docs 
FOR SELECT 
USING (uploaded_by = auth.uid()); 