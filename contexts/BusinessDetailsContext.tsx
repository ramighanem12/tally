'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

interface BusinessDetails {
  legal_name: string | null;
  logo_url: string | null;
  entity_type: string | null;
  fiscal_period: string | null;
}

interface BusinessDetailsContextType {
  businessDetails: BusinessDetails | null;
  setBusinessDetails: (details: BusinessDetails | null) => void;
  refreshBusinessDetails: () => Promise<void>;
  isLoading: boolean;
}

const BusinessDetailsContext = createContext<BusinessDetailsContextType>({
  businessDetails: null,
  setBusinessDetails: () => {},
  refreshBusinessDetails: async () => {},
  isLoading: true
})

export function BusinessDetailsProvider({ children }: { children: React.ReactNode }) {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>({
    legal_name: null,
    logo_url: null,
    entity_type: null,
    fiscal_period: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const fetchBusinessDetails = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('business_details')
        .select('legal_name, logo_url, entity_type, fiscal_period')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No data found
          setBusinessDetails({ legal_name: null, logo_url: null, entity_type: null, fiscal_period: null })
          return
        }
        throw error
      }

      setBusinessDetails(data)
    } catch (error) {
      console.error('Error fetching business details:', error)
      setBusinessDetails({ legal_name: null, logo_url: null, entity_type: null, fiscal_period: null })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinessDetails()
  }, [user])

  return (
    <BusinessDetailsContext.Provider 
      value={{ 
        businessDetails, 
        setBusinessDetails,
        refreshBusinessDetails: fetchBusinessDetails,
        isLoading
      }}
    >
      {children}
    </BusinessDetailsContext.Provider>
  )
}

export const useBusinessDetails = () => useContext(BusinessDetailsContext) 