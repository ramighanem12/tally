export interface Request {
  id: string
  name: string
  description: string
  status: 'In Progress' | 'Completed' | 'Blocked'
  created_at: string
  created_by: string
  assigned_to?: string
  due_date?: string
  category?: string
  priority?: string
  engagement_id: string
} 