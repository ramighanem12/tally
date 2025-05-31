export interface ClosePeriod {
  id: string
  engagement_id: string
  period_format: 'monthly' | 'quarterly' | 'yearly'
  period_year: number
  period_month?: number
  period_quarter?: number
  status: 'incomplete' | 'complete'
  created_at: string
  updated_at: string
} 