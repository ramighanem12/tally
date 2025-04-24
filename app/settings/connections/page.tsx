'use client'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

export default function Connections() {
  const [activeTab, setActiveTab] = useState('apps')
  
  // Track enabled state for each connection
  const [enabledConnections, setEnabledConnections] = useState<{ [key: string]: boolean }>({
    quickbooks: true,
    xero: false,
    wave: false,
    rippling: false,
    gusto: false,
    deel: false,
    stripe: false,
    billcom: false
  })
  
  // Common input classes for reuse
  const inputClasses = "w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"

  const tabs = [
    { id: 'apps', label: 'Apps' },
    { id: 'settings', label: 'Settings' }
  ]

  const appCategories = [
    {
      name: 'Accounting',
      apps: [
        {
          id: 'quickbooks',
          name: 'QuickBooks',
          status: 'connected',
          icon: '/quickbooks.svg'
        },
        {
          id: 'xero',
          name: 'Xero',
          status: 'disconnected',
          icon: '/xero-svgrepo-com.svg'
        },
        {
          id: 'wave',
          name: 'Wave',
          status: 'disconnected',
          icon: '/ov2lgrxqttiauqhbpsqf (1).webp'
        }
      ]
    },
    {
      name: 'Payroll',
      apps: [
        {
          id: 'rippling',
          name: 'Rippling',
          status: 'disconnected',
          icon: '/ripplingcircle.svg'
        },
        {
          id: 'gusto',
          name: 'Gusto',
          status: 'disconnected',
          icon: '/gustocircle.svg'
        },
        {
          id: 'deel',
          name: 'Deel',
          status: 'disconnected',
          icon: '/deel.svg'
        }
      ]
    },
    {
      name: 'Payments',
      apps: [
        {
          id: 'stripe',
          name: 'Stripe',
          status: 'disconnected',
          icon: '/stripe-v2-svgrepo-com.svg'
        },
        {
          id: 'billcom',
          name: 'Bill.com',
          status: 'disconnected',
          icon: '/billcircle.svg'
        }
      ]
    }
  ]

  const handleToggle = (id: string) => {
    setEnabledConnections(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Add state
  const [isSaving, setIsSaving] = useState(false)

  // Add save handler
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Changes saved successfully')
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="px-6 pr-[24px] py-4 border-b border-[#E4E5E1]">
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Connections
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

      {/* Fixed header with tab switcher */}
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

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pr-[24px] py-4">
          {activeTab === 'apps' && (
            <div className="space-y-6">
              <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                Apps
              </h2>

              {appCategories.map((category) => (
                <div key={category.name} className="space-y-4">
                  <h3 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#646462]">
                    {category.name}
                  </h3>

                  <div className="space-y-[12px]">
                    {category.apps.map((app) => (
                      <div 
                        key={app.id}
                        className="border border-[#E4E5E1] rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[10px]">
                            <Image
                              src={app.icon}
                              alt={app.name}
                              width={24}
                              height={24}
                              className="text-gray-600"
                            />
                            <div>
                              <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                                {app.name}
                              </p>
                              {app.status === 'connected' && (
                                <p className="text-[13px] leading-[18px] font-['Inter'] text-[#646462] mt-0.5">
                                  Connected
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Move toggle to far right */}
                          <button
                            onClick={() => handleToggle(app.id)}
                            className={`relative inline-flex h-[16px] w-[32px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              enabledConnections[app.id] ? 'bg-[#1A1A1A]' : 'bg-[#E4E5E1]'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                enabledConnections[app.id] ? 'translate-x-[16px]' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <>
              {/* Webhook Settings card */}
              <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
                <div className="flex gap-24">
                  {/* Left side */}
                  <div className="flex-1">
                    <h2 className="text-[16px] leading-[24px] font-medium font-['Inter'] text-[#1A1A1A] mb-2">
                      Webhook settings
                    </h2>
                    <p className="text-[14px] leading-[20px] font-['Inter'] text-[#646462]">
                      Configure webhook endpoints for real-time updates.
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[14px] leading-[16px] font-medium font-['Inter'] text-[#1A1A1A] mb-1">
                          Webhook URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://"
                          className={inputClasses}
                        />
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
  )
} 