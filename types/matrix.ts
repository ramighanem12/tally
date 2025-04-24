export interface Matrix {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  engagement: string | null;
  access: string | null;
  description: string | null;
  metadata: Record<string, any>;
}

export interface MatrixColumn {
  id: string;
  name: string;
  prompt: string;
  order_index: number;
}

export interface MatrixDocument {
  id: string;
  document_id: string;
  document: {
    id: string;
    name: string;
    url: string;
  };
  order_index: number;
}

export interface MatrixCell {
  cell_id: string;
  matrix_id: string;
  document_id: string;
  column_id: string;
  extracted_text: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
} 