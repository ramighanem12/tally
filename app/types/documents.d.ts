export interface Document {
  id: string;
  name: string;
  url?: string;
  uploaded_by: string;
  uploaded_at: string;
  status: 'In Review' | 'Accepted' | 'Returned';
  type: string;
  size: number;
  mime_type: string;
  storage_path?: string;
  access?: string;
  engagement?: string;
  metadata?: Record<string, any>;
}

export interface DocumentReview {
  id: string;
  name: string;
  content?: string;
  url?: string;
  status: 'In Review' | 'Accepted' | 'Returned';
  updated: string;
} 