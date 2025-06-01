'use client'
import { useState } from 'react'
import { Country, State } from 'country-state-city'
import CopilotNavigation from "../components/CopilotNavigation"
import { toast } from 'sonner'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'payments'>('account')
  const [isDotsConnected, setIsDotsConnected] = useState(false) // Track Dots connection status
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  })
  const [addressData, setAddressData] = useState({
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  })

  // Get all countries
  const countries = Country.getAllCountries()
  
  // Get states for selected country
  const states = State.getStatesOfCountry(addressData.country)

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.isoCode === code)
    return country ? country.name : code
  }

  const getStateName = (code: string) => {
    const state = states.find(s => s.isoCode === code)
    return state ? state.name : code
  }

  const handleCountryChange = (countryCode: string) => {
    setAddressData({
      ...addressData,
      country: countryCode,
      state: '' // Reset state when country changes
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save data to API
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Account information saved successfully')
  }

  const handleDotsSetup = () => {
    // TODO: Integrate with Dots API to set up payout account
    // This would typically redirect to Dots onboarding flow
    toast.success('Redirecting to Dots setup...')
    // Simulate connection for demo
    setTimeout(() => {
      setIsDotsConnected(true)
      toast.success('Dots payout account connected successfully!')
    }, 2000)
  }

  const handleDotsDisconnect = () => {
    // TODO: Disconnect from Dots
    setIsDotsConnected(false)
    toast.success('Dots account disconnected')
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="account" />
      <div className="flex-1 bg-[#F3F6F6] pt-4 pr-4 pb-4 overflow-hidden">
        <main className="h-full w-full bg-white rounded-lg overflow-y-auto">
          {/* Header section */}
          <div className="pl-8 pr-4 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] leading-[36px] font-semibold text-[#1A1A1A]">
                  Account
                </h1>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="pl-8 pr-6">
            <div className="flex space-x-6 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('account')}
                className={`pb-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === 'account'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Account
                {activeTab === 'account' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`pb-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === 'payments'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Payments
                {activeTab === 'payments' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="pl-8 pr-6 pt-4 pb-6">
            {activeTab === 'account' && (
              <div className="space-y-4">
                {/* Combined Account Information Card */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Personal information</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">First Name</div>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">Last Name</div>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">Email</div>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">Phone</div>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Address</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-[13px] text-gray-500 mb-1">Street Address</div>
                          <input
                            type="text"
                            value={addressData.street}
                            onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">City</div>
                            <input
                              type="text"
                              value={addressData.city}
                              onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">State</div>
                            <div className="relative">
                              <select
                                value={addressData.state}
                                onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                                className="w-full px-3 py-2 pr-8 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 appearance-none bg-white transition-all duration-200 hover:border-slate-300"
                              >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                  <option key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[13px] text-gray-500 mb-1">ZIP Code</div>
                            <input
                              type="text"
                              value={addressData.zipCode}
                              onChange={(e) => setAddressData({...addressData, zipCode: e.target.value})}
                              className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[13px] text-gray-500 mb-1">Country</div>
                          <div className="relative">
                            <select
                              value={addressData.country}
                              onChange={(e) => handleCountryChange(e.target.value)}
                              className="w-full px-3 py-2 pr-8 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 appearance-none bg-white transition-all duration-200 hover:border-slate-300"
                            >
                              <option value="">Select Country</option>
                              {countries.map((country) => (
                                <option key={country.isoCode} value={country.isoCode}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {/* Payout Method Card */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Payout method</h3>
                  </div>
                  
                  {isDotsConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" className="text-black">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-[#1A1A1A]">Payout account connected</div>
                          <div className="text-[13px] text-gray-600">Your Dots account is ready to receive payments</div>
                        </div>
                      </div>
                      <button
                        onClick={handleDotsDisconnect}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Manage payout account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-[14px] text-gray-600 leading-relaxed">
                        Connect your Dots account to receive payments globally. Dots supports 150+ currencies and multiple payment methods including PayPal, Venmo, bank transfers, and more.
                      </div>
                      <button
                        onClick={handleDotsSetup}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Set up payout account
                      </button>
                      <div className="text-[13px] text-gray-500">
                        You'll be redirected to Dots to complete the setup process
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 