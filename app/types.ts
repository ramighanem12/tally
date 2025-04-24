export type DocumentRequest = {
  id: string;
  name: string;
  description?: string;
  date_requested: string;
  due_date: string | null;
  status: 'pending' | 'completed' | 'overdue';
  completed_date?: string | null;
} 