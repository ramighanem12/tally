export type DocumentRequest = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  date_requested: string;
  due_date: string | null;
  status: 'pending' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

export type Document = {
  id: string;
  name: string;
  date: string;
  dueDate?: string;
  description?: string;
  type?: string;
  tags?: string[];
  importStatus?: string;
}

export type Notice = {
  id: string;
  name: string;
  date: string;
  status: string;
  tags: string[];
} 