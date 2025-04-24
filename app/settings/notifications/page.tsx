'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

// First, let's define our boolean notification keys as a const array
const NOTIFICATION_KEYS = [
  'document_request',
  'notice_review',
  'new_plan_item',
  'plan_item_action',
  'new_deduction',
  'new_tax_credit',
  'tax_strategy_update',
  'new_tax_filing',
  'meetings',
  'meeting_notes',
  'service_updates',
  'new_service',
  'new_invoice',
  'connection_sync'
] as const // Make this a const array

// Create a type from our const array
type NotificationKey = typeof NOTIFICATION_KEYS[number]

// Update the NotificationPreferences type
type NotificationPreferences = {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  email_frequency: string;
} & {
  [K in NotificationKey]: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('preferences')
  const [masterEnabled, setMasterEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [emailFrequency, setEmailFrequency] = useState('immediate')
  
  // Initialize with default values
  const defaultNotificationState: NotificationPreferences = {
    document_request: true,
    notice_review: true,
    new_plan_item: true,
    plan_item_action: true,
    new_deduction: true,
    new_tax_credit: true,
    tax_strategy_update: true,
    new_tax_filing: true,
    meetings: true,
    meeting_notes: true,
    service_updates: true,
    new_service: true,
    new_invoice: true,
    connection_sync: true,
    email_frequency: 'immediate'
  }

  const [enabledNotifications, setEnabledNotifications] = useState<NotificationPreferences>(defaultNotificationState)
  
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user's notification preferences
  useEffect(() => {
    async function fetchNotificationPreferences() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('notifications_preferences')
          .select('*')
          .single()

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
            throw error
          }
        }

        if (data) {
          setEnabledNotifications(data)
          setEmailFrequency(data.email_frequency)
          // Check if any notifications are enabled to set master toggle
          const hasEnabledNotifications = Object.entries(data)
            .filter(([key]) => key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at' && key !== 'email_frequency')
            .some(([_, value]) => value === true)
          setMasterEnabled(hasEnabledNotifications)
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error)
        toast.error('Failed to load notification preferences')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotificationPreferences()
  }, [user])

  // Update the handleToggle function to use NotificationKey
  const handleToggle = (id: NotificationKey) => {
    setEnabledNotifications(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Update handleMasterToggle to use NOTIFICATION_KEYS
  const handleMasterToggle = () => {
    const newMasterState = !masterEnabled
    setMasterEnabled(newMasterState)
    
    setEnabledNotifications(prev => ({
      ...prev,
      ...Object.fromEntries(NOTIFICATION_KEYS.map(key => [key, newMasterState]))
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const dataToSave = {
        ...enabledNotifications,
        email_frequency: emailFrequency,
        user_id: user.id
      }

      // Check if preferences already exist
      const { data: existingData } = await supabase
        .from('notifications_preferences')
        .select('id')
        .single()

      let error
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('notifications_preferences')
          .update(dataToSave)
          .eq('user_id', user.id)
        error = updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('notifications_preferences')
          .insert([dataToSave])
        error = insertError
      }

      if (error) throw error

      toast.success('Changes saved successfully')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const notificationCategories = [
    {
      name: 'General notifications',
      notifications: [
        {
          id: 'document_request',
          name: 'Document request',
          description: 'Get notified when there is a new document request'
        },
        {
          id: 'notice_review',
          name: 'Notice review',
          description: 'Get notified when a notice is reviewed'
        },
        {
          id: 'new_plan_item',
          name: 'New plan item',
          description: 'Get notified when a new item is added to your plan'
        },
        {
          id: 'plan_item_action',
          name: 'Action needed on a plan item',
          description: 'Get notified when action is needed on a plan item'
        },
        {
          id: 'new_deduction',
          name: 'New deduction opportunity',
          description: 'Get notified about new deduction opportunities'
        },
        {
          id: 'new_tax_credit',
          name: 'New tax credit opportunity',
          description: 'Get notified about new tax credit opportunities'
        },
        {
          id: 'tax_strategy_update',
          name: 'Update to tax strategy',
          description: 'Get notified when there are updates to your tax strategy'
        },
        {
          id: 'new_tax_filing',
          name: 'New tax filing',
          description: 'Get notified when there is a new tax filing'
        },
        {
          id: 'meetings',
          name: 'Meeting updates',
          description: 'Get notified about new meetings and schedule changes'
        },
        {
          id: 'meeting_notes',
          name: 'Meeting notes ready',
          description: 'Get notified when meeting notes are ready'
        }
      ]
    },
    {
      name: 'Billing',
      notifications: [
        {
          id: 'new_invoice',
          name: 'New invoice',
          description: 'Get notified when a new invoice is generated'
        }
      ]
    },
    {
      name: 'Connections',
      notifications: [
        {
          id: 'connection_sync',
          name: 'Connection sync issue',
          description: 'Get notified when there is a sync issue with your connections'
        }
      ]
    },
    {
      name: 'Features',
      notifications: [
        {
          id: 'service_updates',
          name: 'New features',
          description: 'Get notified when we release new features'
        },
        {
          id: 'new_service',
          name: 'New service available',
          description: 'Get notified when new services become available'
        }
      ]
    }
  ]

  const tabs = [
    { id: 'preferences', label: 'Preferences' },
    { id: 'settings', label: 'Settings' }
  ]

  // Update the email frequency select handler
  const handleEmailFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmailFrequency(e.target.value)
  }

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
          <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Notifications
          </h1>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors flex items-center gap-2"
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

      {/* Tab switcher */}
      <div className="border-b border-[#E4E5E1]">
        <div className="px-6 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-[14px] leading-[20px] font-medium font-['Inter'] border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-[#1A1A1A] text-[#1A1A1A]' 
                  : 'border-transparent text-[#646462] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pr-[24px] py-4">
          <div className="space-y-6">
            {activeTab === 'preferences' && (
              <>
                {/* Master toggle section with user's email */}
                <div className="border border-[#E4E5E1] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                        Enable email notifications
                      </p>
                      <p className="text-[13px] leading-[18px] font-['Inter'] text-[#646462] mt-0.5">
                        Enable notifications to {user?.email}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleMasterToggle}
                      className={`relative inline-flex h-[16px] w-[32px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        masterEnabled ? 'bg-[#1A1A1A]' : 'bg-[#E4E5E1]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          masterEnabled ? 'translate-x-[16px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {notificationCategories.map((category) => (
                  <div key={category.name} className="space-y-4">
                    <h3 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#646462]">
                      {category.name}
                    </h3>

                    <div className="space-y-[12px]">
                      {category.notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`border border-[#E4E5E1] rounded-lg p-3 transition-opacity ${
                            !masterEnabled ? 'opacity-70 pointer-events-none' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                                {notification.name}
                              </p>
                              <p className="text-[13px] leading-[18px] font-['Inter'] text-[#646462] mt-0.5">
                                {notification.description}
                              </p>
                            </div>

                            <button
                              onClick={() => handleToggle(notification.id as NotificationKey)}
                              disabled={!masterEnabled}
                              className={`relative inline-flex h-[16px] w-[32px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                enabledNotifications[notification.id as NotificationKey] && masterEnabled
                                  ? 'bg-[#1A1A1A]' 
                                  : 'bg-[#E4E5E1]'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  enabledNotifications[notification.id as NotificationKey] && masterEnabled
                                    ? 'translate-x-[16px]' 
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'settings' && (
              <>
                {/* Email Delivery Settings */}
                <div className={`border border-[#E4E5E1] rounded-xl px-6 py-5 transition-opacity ${
                  !masterEnabled ? 'opacity-70 pointer-events-none' : ''
                }`}>
                  <div className="flex gap-24">
                    <div className="flex-1">
                      <h2 className="text-[16px] leading-[24px] font-medium font-['Inter'] text-[#1A1A1A] mb-2">
                        Email delivery settings
                      </h2>
                      <p className="text-[14px] leading-[20px] font-['Inter'] text-[#646462]">
                        Choose when and how you'd like to receive email notifications.
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                            Email frequency
                          </label>
                          <select 
                            value={emailFrequency}
                            onChange={handleEmailFrequencyChange}
                            className="w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
                          >
                            <option value="immediate">Send immediately</option>
                            <option value="daily">Daily digest</option>
                            <option value="weekly">Weekly digest</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 