'use client'
import { useState } from 'react'
import { Country, State } from 'country-state-city'
import CopilotNavigation from "../components/CopilotNavigation"
import { toast } from 'sonner'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'qualifications' | 'payments'>('account')
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isEditingPayout, setIsEditingPayout] = useState(false)
  const [isEditingLanguages, setIsEditingLanguages] = useState(false)
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
  const [payoutData, setPayoutData] = useState({
    bankName: 'Chase Bank',
    accountType: 'Checking',
    accountNumber: '****1234',
    routingNumber: '****5678'
  })
  const [languageData, setLanguageData] = useState({
    primaryLanguage: 'English',
    secondaryLanguages: ['Spanish', 'French']
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
    toast.success('Personal information updated successfully')
  }

  const handleCancel = () => {
    // Reset form data if needed
    setIsEditing(false)
  }

  const handleSaveAddress = () => {
    // TODO: Save address data to API
    setIsEditingAddress(false)
    toast.success('Address updated successfully')
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

  const handleSavePayout = () => {
    // TODO: Save payout data to API
    setIsEditingPayout(false)
    toast.success('Payout method updated successfully')
  }

  const handleCancelPayout = () => {
    // Reset payout data if needed
    setIsEditingPayout(false)
  }

  const handleSaveLanguages = () => {
    // TODO: Save language data to API
    setIsEditingLanguages(false)
    toast.success('Language preferences updated successfully')
  }

  const handleCancelLanguages = () => {
    // Reset language data if needed
    setIsEditingLanguages(false)
  }

  const availableLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ]

  const handleSecondaryLanguageToggle = (language: string) => {
    setLanguageData(prev => ({
      ...prev,
      secondaryLanguages: prev.secondaryLanguages.includes(language)
        ? prev.secondaryLanguages.filter(lang => lang !== language)
        : [...prev.secondaryLanguages, language]
    }))
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
                onClick={() => setActiveTab('qualifications')}
                className={`pb-3 text-[14px] font-medium transition-colors relative ${
                  activeTab === 'qualifications'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Qualifications
                {activeTab === 'qualifications' && (
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
                <div className="bg-gray-100 rounded-lg p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Personal information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
                <div className="bg-gray-100 rounded-lg p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Address</h3>
                    {!isEditingAddress ? (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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

                {/* Language Preferences Card */}
                <div className="bg-gray-100 rounded-lg p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Language preferences</h3>
                    {!isEditingLanguages ? (
                      <button
                        onClick={() => setIsEditingLanguages(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelLanguages}
                          className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveLanguages}
                          className="px-3 py-1.5 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-[13px] text-gray-500 mb-1">Primary language</div>
                      {isEditingLanguages ? (
                        <div className="relative">
                          <select
                            value={languageData.primaryLanguage}
                            onChange={(e) => setLanguageData({...languageData, primaryLanguage: e.target.value})}
                            className="w-full px-3 py-2 pr-8 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            {availableLanguages.map((language) => (
                              <option key={language} value={language}>
                                {language}
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
                        <div className="text-[14px] text-[#1A1A1A] font-medium">{languageData.primaryLanguage}</div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-[13px] text-gray-500 mb-2">Secondary languages</div>
                      {isEditingLanguages ? (
                        <div className="space-y-2">
                          {availableLanguages
                            .filter(lang => lang !== languageData.primaryLanguage)
                            .map((language) => (
                            <label key={language} className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={languageData.secondaryLanguages.includes(language)}
                                  onChange={() => handleSecondaryLanguageToggle(language)}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded transition-all duration-200 ${
                                  languageData.secondaryLanguages.includes(language)
                                    ? 'bg-[#1A1A1A] border-2 border-[#1A1A1A]'
                                    : 'bg-white border border-gray-300 group-hover:border-gray-400'
                                }`}>
                                  {languageData.secondaryLanguages.includes(language) && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="text-[14px] text-[#1A1A1A] group-hover:text-gray-700 transition-colors">{language}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {languageData.secondaryLanguages.length > 0 ? (
                            languageData.secondaryLanguages.map((language) => (
                              <span
                                key={language}
                                className="inline-flex items-center px-2.5 py-0.5 rounded text-[13px] font-medium bg-gray-200 text-gray-700"
                              >
                                {language}
                              </span>
                            ))
                          ) : (
                            <span className="text-[14px] text-gray-500">None selected</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'qualifications' && (
              <div className="space-y-4">
                {/* Qualifications content will go here */}
                <p className="text-gray-500">Qualifications content...</p>
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {/* Payout Method Card */}
                <div className="bg-gray-100 rounded-lg p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Payout method</h3>
                    {!isEditingPayout ? (
                      <button
                        onClick={() => setIsEditingPayout(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelPayout}
                          className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSavePayout}
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
                        <div className="text-[13px] text-gray-500 mb-1">Bank Name</div>
                        {isEditingPayout ? (
                          <input
                            type="text"
                            value={payoutData.bankName}
                            onChange={(e) => setPayoutData({...payoutData, bankName: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{payoutData.bankName}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">Account Type</div>
                        {isEditingPayout ? (
                          <select
                            value={payoutData.accountType}
                            onChange={(e) => setPayoutData({...payoutData, accountType: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Checking">Checking</option>
                            <option value="Savings">Savings</option>
                          </select>
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{payoutData.accountType}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">Account Number</div>
                        {isEditingPayout ? (
                          <input
                            type="text"
                            value={payoutData.accountNumber}
                            onChange={(e) => setPayoutData({...payoutData, accountNumber: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{payoutData.accountNumber}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-500 mb-1">Routing Number</div>
                        {isEditingPayout ? (
                          <input
                            type="text"
                            value={payoutData.routingNumber}
                            onChange={(e) => setPayoutData({...payoutData, routingNumber: e.target.value})}
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-[14px] text-[#1A1A1A] font-medium">{payoutData.routingNumber}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 