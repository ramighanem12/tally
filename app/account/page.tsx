'use client'
import { useState } from 'react'
import { Country, State } from 'country-state-city'
import CopilotNavigation from "../components/CopilotNavigation"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'payments'>('account')
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
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

  const handleSave = () => {
    // TODO: Save data to API
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data if needed
    setIsEditing(false)
  }

  const handleSaveAddress = () => {
    // TODO: Save address data to API
    setIsEditingAddress(false)
  }

  const handleCancelAddress = () => {
    // Reset address data if needed
    setIsEditingAddress(false)
  }

  const handleCountryChange = (countryCode: string) => {
    setAddressData({
      ...addressData,
      country: countryCode,
      state: '' // Reset state when country changes
    })
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
                {/* Personal Information Card */}
                <div className="bg-gray-50 rounded-lg p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Personal Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">First Name</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{formData.firstName}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">Last Name</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{formData.lastName}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">Email</div>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{formData.email}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">Phone</div>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{formData.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-gray-50 rounded-lg p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Address</h3>
                    {!isEditingAddress ? (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelAddress}
                          className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          className="px-3 py-1.5 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-[13px] text-gray-500 mb-1">Street Address</div>
                      {isEditingAddress ? (
                        <input
                          type="text"
                          value={addressData.street}
                          onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                          className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="text-[14px] text-[#1A1A1A] font-medium">{addressData.street}</div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">City</div>
                        {isEditingAddress ? (
                          <input
                            type="text"
                            value={addressData.city}
                            onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{addressData.city}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">State/Province</div>
                        {isEditingAddress ? (
                          <div className="relative">
                            <select
                              value={addressData.state}
                              onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                              className="w-full px-3 py-2 pr-8 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{getStateName(addressData.state)}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">ZIP Code</div>
                        {isEditingAddress ? (
                          <input
                            type="text"
                            value={addressData.zipCode}
                            onChange={(e) => setAddressData({...addressData, zipCode: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{addressData.zipCode}</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[13px] text-gray-500 mb-1">Country</div>
                      {isEditingAddress ? (
                        <div className="relative">
                          <select
                            value={addressData.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="w-full px-3 py-2 pr-8 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                      ) : (
                        <div className="text-[14px] text-[#1A1A1A] font-medium">{getCountryName(addressData.country)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div>
                {/* Payments content will go here */}
                <p className="text-gray-500">Payment methods content...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 