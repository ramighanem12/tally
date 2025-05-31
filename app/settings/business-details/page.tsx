'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useBusinessDetails } from '@/contexts/BusinessDetailsContext'
import Image from 'next/image'

// Update the interface to handle both form and database types
interface BusinessDetails {
  id?: string;
  user_id?: string;
  legal_name: string;
  dba: string;
  entity_type: string;
  state_of_incorporation: string;
  ein: string;
  address: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  incorporation_date: string | null;  // Allow null for database
  fiscal_period: string;
  industry: string;
  revenue_range: string;
  logo_url: string | null;  // Add this field
  created_at?: string;  // Database timestamp
  updated_at?: string;  // Database timestamp
}

// Add this type near the top of the file
declare global {
  interface Window {
    google: typeof google;
  }
}

// Add these helper functions before the component
const getFileExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

export default function BusinessDetailsPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [isAdvisorBannerClosing, setIsAdvisorBannerClosing] = useState(false)
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  // Track form state
  const [formData, setFormData] = useState<BusinessDetails>({
    legal_name: '',
    dba: '',
    entity_type: '',
    state_of_incorporation: '',
    ein: '',
    address: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    incorporation_date: '',
    fiscal_period: 'calendar',
    industry: '',
    revenue_range: '',
    logo_url: null
  })
  const [isSaving, setIsSaving] = useState(false)
  // Add state to track if required fields are saved
  const [hasRequiredFields, setHasRequiredFields] = useState(false);
  const { setBusinessDetails, refreshBusinessDetails } = useBusinessDetails()

  // Common input classes for reuse
  const inputClasses = "w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
  
  // Entity type options
  const entityTypes = [
    'Sole Proprietorship',
    'Limited Liability Company (LLC)',
    'Corporation (C-Corp)',
    'S Corporation (S-Corp)',
    'Partnership',
    'Limited Partnership (LP)',
    'Non-Profit'
  ]

  // State options with standard capitalization
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
  ]

  // Add these constants after other options arrays
  const industries = [
    { code: '11', name: 'Agriculture, Forestry, Fishing and Hunting' },
    { code: '23', name: 'Construction' },
    { code: '31-33', name: 'Manufacturing' },
    { code: '42', name: 'Wholesale Trade' },
    { code: '44-45', name: 'Retail Trade' },
    { code: '48-49', name: 'Transportation and Warehousing' },
    { code: '51', name: 'Information' },
    { code: '52', name: 'Finance and Insurance' },
    { code: '53', name: 'Real Estate and Rental and Leasing' },
    { code: '54', name: 'Professional, Scientific, and Technical Services' },
    { code: '56', name: 'Administrative and Support Services' },
    { code: '61', name: 'Educational Services' },
    { code: '62', name: 'Health Care and Social Assistance' },
    { code: '71', name: 'Arts, Entertainment, and Recreation' },
    { code: '72', name: 'Accommodation and Food Services' },
    { code: '81', name: 'Other Services (except Public Administration)' }
  ]

  const revenueRanges = [
    'Less than $50,000',
    '$50,000 - $100,000',
    '$100,000 - $250,000',
    '$250,000 - $500,000',
    '$500,000 - $1 million',
    '$1 million - $5 million',
    '$5 million - $10 million',
    'More than $10 million'
  ]

  // Add ref for the address input
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  // Add this function to check if Google Maps is loaded
  const isGoogleMapsLoaded = () => {
    return typeof window !== 'undefined' && window.google && window.google.maps;
  };

  // Update the Google Places useEffect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let autocompleteInstance: google.maps.places.Autocomplete | null = null;

    const initAutocomplete = () => {
      // Check if input ref exists
      if (!addressInputRef.current) {
        timeoutId = setTimeout(initAutocomplete, 100);
        return;
      }

      // Check if Google Maps is loaded
      if (typeof window.google === 'undefined' || !window.google.maps) {
        timeoutId = setTimeout(initAutocomplete, 100);
        return;
      }

      try {
        // Create autocomplete instance
        autocompleteInstance = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address'],
            types: ['address']
          }
        );

        // Add place_changed listener
        const placeChangedListener = autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance?.getPlace();
          if (!place?.address_components) return;

          let streetNumber = '';
          let streetName = '';
          let city = '';
          let state = '';
          let zip = '';

          place.address_components.forEach((component) => {
            const type = component.types[0];
            switch (type) {
              case 'street_number':
                streetNumber = component.long_name;
                break;
              case 'route':
                streetName = component.long_name;
                break;
              case 'locality':
                city = component.long_name;
                break;
              case 'administrative_area_level_1':
                state = component.long_name;
                break;
              case 'postal_code':
                zip = component.long_name;
                break;
            }
          });

          // Update form data with address components and clear address_line2
          setFormData(prev => ({
            ...prev,
            address: `${streetNumber} ${streetName}`.trim(),
            address_line2: '', // Clear address line 2
            city,
            state,
            zip
          }));
        });

        return () => {
          if (placeChangedListener) {
            google.maps.event.removeListener(placeChangedListener);
          }
        };
      } catch (error) {
        console.error('Error initializing Google Places:', error);
      }
    };

    // Start initialization
    const initialize = () => {
      if (typeof window !== 'undefined') {
        initAutocomplete();
      }
    };

    initialize();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, []); // Empty dependency array

  // Update useEffect to handle types
  useEffect(() => {
    async function fetchBusinessDetails() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('business_details')
          .select('*')
          .eq('user_id', user.id)
          .single()

        console.log('Fetched data:', data)

        // Add this debug code to check the storage
        if (data?.logo_url) {
          const { data: storageData, error: storageError } = await supabase.storage
            .from('documents')
            .list('logos/')
          
          console.log('Storage contents:', storageData)
          console.log('Storage error:', storageError)
        }

        if (error) {
          if (error.code !== 'PGRST116') {
            throw error
          }
        }

        if (data) {
          const formattedData: BusinessDetails = {
            ...data,
            legal_name: data.legal_name ?? '',
            dba: data.dba ?? '',
            entity_type: data.entity_type ?? '',
            state_of_incorporation: data.state_of_incorporation ?? '',
            ein: data.ein ?? '',
            address: data.address ?? '',
            address_line2: data.address_line2 ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            zip: data.zip ?? '',
            incorporation_date: data.incorporation_date ?? '',
            fiscal_period: data.fiscal_period ?? 'calendar',
            industry: data.industry ?? '',
            revenue_range: data.revenue_range ?? '',
            logo_url: data.logo_url || null
          }
          console.log('Formatted data:', formattedData)
          setFormData(formattedData)
          
          // Check if all required fields are filled in the saved data
          setHasRequiredFields(areAllFieldsFilled(data))
        }
      } catch (error) {
        console.error('Error fetching business details:', error)
        toast.error('Failed to load business details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessDetails()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDismissBanner = () => {
    setIsAdvisorBannerClosing(true)
    setTimeout(() => {
      setShowBanner(false)
    }, 300)
  }

  const handleSave = async () => {
    if (!user) return

    // Add EIN validation
    if (formData.ein && !validateEIN(formData.ein)) {
      toast.error('Please enter a valid 9-digit EIN')
      return
    }

    setIsSaving(true)
    try {
      // Handle logo upload if there's a new file
      let logo_url = formData.logo_url  // This will be null if logo was removed
      if (logoFile) {
        const fileExt = getFileExtension(logoFile.name)
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(`logos/${fileName}`, logoFile)

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`logos/${fileName}`)

        logo_url = publicUrl
      }

      // Prepare the data - handle empty date
      const dataToSave = {
        ...formData,
        incorporation_date: formData.incorporation_date || null,
        logo_url  // This will be null if logo was removed
      }

      // Check if business details already exist
      const { data: existingData } = await supabase
        .from('business_details')
        .select('id')
        .single()

      let error
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('business_details')
          .update(dataToSave)
          .eq('user_id', user.id)
        error = updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('business_details')
          .insert([{ ...dataToSave, user_id: user.id }])
        error = insertError
      }

      if (error) throw error

      // Update hasRequiredFields state based on saved data
      setHasRequiredFields(areAllFieldsFilled(dataToSave))
      
      // Refresh the business details context after successful save
      await refreshBusinessDetails()
      
      toast.success('Changes saved successfully')
    } catch (error) {
      console.error('Error saving business details:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Add this helper function near the top of the file
  const formatEIN = (ein: string) => {
    // Remove all non-digits
    const digits = ein.replace(/\D/g, '')
    // Format as XX-XXXXXXX
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`
    }
    return digits
  }

  // Add validation function
  const validateEIN = (ein: string) => {
    const digits = ein.replace(/\D/g, '')
    return digits.length === 9
  }

  // Update the required fields list
  const areAllFieldsFilled = (data: BusinessDetails): boolean => {
    const requiredFields: (keyof BusinessDetails)[] = [
      'legal_name',
      'dba',
      'entity_type',
      'state_of_incorporation',
      'ein',
      'address',
      'city',
      'state',
      'zip',
      'incorporation_date'
    ];

    return requiredFields.every(field => {
      const value = data[field];
      return value !== null && value !== undefined && value !== '';
    });
  };

  // Inside the component, add this state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add these handlers after other handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Also clear the logo_url in formData
    setFormData(prev => ({
      ...prev,
      logo_url: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add loading state to the component
  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#F0F1EF] rounded w-1/4" />
          <div className="h-32 bg-[#F0F1EF] rounded" />
          <div className="h-32 bg-[#F0F1EF] rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="px-6 pr-[24px] py-4 border-b border-[#E4E5E1]">
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Business details
          </h1>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 px-6 pr-[24px] py-4">
          {/* Top Banner */}
          {showBanner && !hasRequiredFields && (
            <div 
              className={`transform transition-all duration-300 ease-out
                ${isAdvisorBannerClosing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              <div className="bg-[#FFF4EB] border border-[#FFB77E] rounded-xl px-4 py-3 relative mb-4">
                <button 
                  className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-lg hover:bg-[#FFE4CA] transition-colors"
                  onClick={handleDismissBanner}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24"
                    className="text-[#1A1A1A]"
                  >
                    <path 
                      fill="currentColor"
                      d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"
                    />
                  </svg>
                </button>
                <p className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] flex items-center gap-1.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24"
                    className="text-[#1A1A1A]"
                  >
                    <path 
                      fill="currentColor" 
                      d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z"
                    />
                  </svg>
                  Complete your business profile to help us better understand your company and finalize your onboarding
                </p>
              </div>
            </div>
          )}

          {/* Business details card */}
          <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
            <div className="flex gap-24">
              {/* Left side */}
              <div className="flex-1">
                <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                  Business details
                </h2>
                <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                  Your company's legal information for tax and compliance purposes.
                </p>
              </div>

              {/* Right side */}
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Company legal name
                    </label>
                    <input 
                      type="text" 
                      name="legal_name"
                      value={formData.legal_name}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      DBA name
                    </label>
                    <input 
                      type="text" 
                      name="dba"
                      value={formData.dba}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Entity type
                    </label>
                    <div className="relative">
                      <select
                        name="entity_type"
                        value={formData.entity_type}
                        onChange={handleInputChange}
                        className={`${inputClasses} pr-8 appearance-none bg-white`}
                      >
                        <option value="">Select entity type</option>
                        {entityTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      State of Incorporation
                    </label>
                    <div className="relative">
                      <select
                        name="state_of_incorporation"
                        value={formData.state_of_incorporation}
                        onChange={handleInputChange}
                        className={`${inputClasses} pr-8 appearance-none bg-white`}
                      >
                        <option value="">Select state of incorporation</option>
                        {states.map(state => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      EIN
                    </label>
                    <input 
                      type="text" 
                      name="ein"
                      value={formData.ein}
                      onChange={(e) => {
                        const formatted = formatEIN(e.target.value)
                        if (formatted.length <= 10) { // 10 includes the hyphen
                          setFormData(prev => ({
                            ...prev,
                            ein: formatted
                          }))
                        }
                      }}
                      placeholder="XX-XXXXXXX"
                      maxLength={10}
                      className={`${inputClasses} ${
                        formData.ein && !validateEIN(formData.ein) 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : ''
                      }`}
                    />
                    {formData.ein && !validateEIN(formData.ein) && (
                      <p className="mt-1 text-[12px] leading-[16px] font-oracle text-red-500">
                        Please enter a valid 9-digit EIN
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Incorporation date
                    </label>
                    <input 
                      type="date" 
                      name="incorporation_date"
                      value={formData.incorporation_date || ''}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Fiscal period
                    </label>
                    <div className="relative">
                      <select 
                        name="fiscal_period"
                        value={formData.fiscal_period}
                        onChange={handleInputChange}
                        className={`${inputClasses} pr-8 appearance-none bg-white`}
                      >
                        <option value="calendar">Calendar year (Jan - Dec)</option>
                        <option value="fiscal">Custom fiscal year</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organization logo card */}
          <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
            <div className="flex gap-24">
              {/* Left side */}
              <div className="flex-1">
                <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                  Organization logo
                </h2>
                <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                  Upload your organization's logo. This will be displayed in various places across the platform.
                </p>
              </div>

              {/* Right side */}
              <div className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Logo preview */}
                    <div className="w-[51px] h-[51px] rounded-lg border border-[#E4E5E1] overflow-hidden flex items-center justify-center bg-white">
                      {(logoPreview || formData.logo_url) ? (
                        <Image
                          src={logoPreview || (formData.logo_url as string)}
                          alt="Organization logo"
                          width={51}
                          height={51}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            console.error('Image failed to load:', formData.logo_url)
                            const target = e.target as HTMLImageElement;
                            target.src = ''; // Clear the broken image
                            setFormData(prev => ({
                              ...prev,
                              logo_url: null
                            }));
                          }}
                        />
                      ) : (
                        <svg 
                          className="w-6 h-6 text-[#646462]" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            fill="currentColor"
                            d="M 5.75 3 C 4.2429372 3 3 4.2429372 3 5.75 L 3 18.25 C 3 19.757063 4.2429372 21 5.75 21 L 18.25 21 C 19.757063 21 21 19.757063 21 18.25 L 21 5.75 C 21 4.2429372 19.757063 3 18.25 3 L 5.75 3 z M 5.75 5 L 18.25 5 C 18.674937 5 19 5.3250628 19 5.75 L 19 16.585938 L 15.416016 13.001953 C 14.641623 12.22756 13.356168 12.229721 12.583984 13.005859 L 12.003906 13.589844 L 10.414062 12 C 10.027771 11.613708 9.5141976 11.419879 9 11.419922 C 8.4858024 11.419965 7.9719732 11.612974 7.5859375 12 L 5 14.585938 L 5 5.75 C 5 5.3250628 5.3250628 5 5.75 5 z M 15.5 7 A 1.5 1.5 0 0 0 15.5 10 A 1.5 1.5 0 0 0 15.5 7 z M 9 13.414062 A 1.0001 1.0001 0 0 0 9.0019531 13.414062 L 12.292969 16.707031 A 1.0001 1.0001 0 1 0 13.707031 15.292969 L 13.417969 15.003906 L 14.001953 14.416016 L 18.53125 18.945312 C 18.444757 18.978832 18.350711 19 18.25 19 L 5.75 19 C 5.3250628 19 5 18.674937 5 18.25 L 5 17.414062 L 9 13.414062 z"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <div className="flex gap-1.5">
                        <label
                          htmlFor="logo-upload"
                          className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors cursor-pointer flex items-center"
                        >
                          Choose file
                        </label>
                        {(logoPreview || formData.logo_url) && (
                          <button
                            onClick={handleRemoveLogo}
                            className="inline-flex items-center px-3.5 h-[32px] bg-white border border-[#E4E5E1] rounded-full font-oracle font-[500] text-[14px] leading-[16px] text-[#1A1A1A] hover:border-[#BBBDB7] transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] leading-[16px] font-oracle text-[#646462]">
                    Recommended size: 256x256 pixels. Maximum file size: 5MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business address card */}
          <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
            <div className="flex gap-24">
              {/* Left side */}
              <div className="flex-1">
                <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                  Business address
                </h2>
                <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                  Your business address will be used for invoicing and tax purposes.
                </p>
              </div>

              {/* Right side */}
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Street address
                    </label>
                    <input 
                      ref={addressInputRef}
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Street address line 2
                    </label>
                    <input 
                      type="text" 
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                        City
                      </label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                        State
                      </label>
                      <div className="relative">
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`${inputClasses} pr-8 appearance-none bg-white`}
                        >
                          <option value="">Select state</option>
                          {states.map(state => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                        ZIP code
                      </label>
                      <input 
                        type="text" 
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business activity card */}
          <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
            <div className="flex gap-24">
              {/* Left side */}
              <div className="flex-1">
                <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                  Business activity
                </h2>
                <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                  Information about your business operations and scale.
                </p>
              </div>

              {/* Right side */}
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Industry/NAICS code
                    </label>
                    <div className="relative">
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className={`${inputClasses} pr-8 appearance-none bg-white`}
                      >
                        <option value="">Select industry</option>
                        {industries.map(industry => (
                          <option key={industry.code} value={industry.code}>
                            {industry.name} ({industry.code})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                      Estimated revenue range
                    </label>
                    <div className="relative">
                      <select
                        name="revenue_range"
                        value={formData.revenue_range}
                        onChange={handleInputChange}
                        className={`${inputClasses} pr-8 appearance-none bg-white`}
                      >
                        <option value="">Select revenue range</option>
                        {revenueRanges.map(range => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 