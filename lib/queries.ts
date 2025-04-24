import { supabase } from '@/lib/supabase'

export interface Profile {
  email: string
}

export interface Engagement {
  id: string
  client: string
  name: string
  status: 'Pending' | 'In progress' | 'Complete' | 'Archived'
  start_date: string
  end_date: string
  lead: string
  requests_numerator: number
  requests_denominator: number
  created_at?: string
  updated_at?: string
}

interface RawEngagement {
  id: string
  client: string
  name: string
  status: 'Pending' | 'In progress' | 'Complete' | 'Archived'
  start_date: string
  end_date: string
  lead_id: string
  created_at: string
  updated_at: string
  profiles: Profile | null
}

export interface Sheet {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  engagement_id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export async function getEngagements() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user)

    const { data, error } = await supabase
      .from('engagements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase query error:', error)
      return []
    }

    console.log('Raw data from Supabase:', data)

    const transformedData = (data || []).map(eng => ({
      ...eng,
      lead: 'Unknown',
      requests: {
        completed: eng.requests_numerator || 0,
        total: eng.requests_denominator || 0
      }
    }))

    console.log('Transformed data:', transformedData)
    return transformedData
  } catch (err) {
    console.error('Unexpected error in getEngagements:', err)
    return []
  }
}

export async function getEngagementSheets(engagementId: string): Promise<Sheet[]> {
  const { data, error } = await supabase
    .from('sheets')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sheets:', error);
    return [];
  }

  return data || [];
} 