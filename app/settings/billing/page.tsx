'use client'
import { useState } from 'react'
import AddCardModal from '@/app/components/AddCardModal'

export default function Billing() {
  const [plan, setPlan] = useState('personal')
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  
  // Add billing address form state
  const [billingAddress, setBillingAddress] = useState({
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: ''
  })

  // States array for dropdown
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

  // Handle billing address form changes
  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBillingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Add some dummy invoice data
  const [invoices] = useState([
    {
      id: 'INV-001',
      date: 'Mar 1, 2024',
      total: '$1,999.00',
      balance: '$0.00'
    }
  ])

  // Common input classes for reuse
  const inputClasses = "w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'invoices', label: 'Invoices' }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="px-6 pr-[24px] py-4 border-b border-[#E4E5E1]">
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Billing
          </h1>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-[#E4E5E1]">
        <div className="px-6 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-[14px] leading-[20px] font-medium font-oracle border-b-2 transition-colors ${
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 px-6 pr-[24px] py-4">
          {activeTab === 'overview' && (
            <>
              {/* Add banner at the very top */}
              <div className="bg-[#FFF4EB] border border-[#FFB77E] rounded-xl px-4 py-3 relative">
                <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] flex items-center gap-1.5">
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
                  Set up your payment method to finalize your onboarding
                </p>
              </div>

              {/* Current plan card */}
              <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
                <div className="flex gap-24">
                  {/* Left side */}
                  <div className="flex-1">
                    <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                      Current plan
                    </h2>
                    <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                      Manage your subscription plan and billing cycle.
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                          Plan
                        </label>
                        <div className="relative">
                          <select 
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            className={`${inputClasses} pr-8 appearance-none bg-white`}
                          >
                            <option value="personal">Personal ($1,999/year)</option>
                            <option value="standard">Standard ($2,499/year)</option>
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

              {/* Payment method card */}
              <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
                <div className="flex gap-24">
                  {/* Left side */}
                  <div className="flex-1">
                    <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                      Payment method
                    </h2>
                    <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                      Manage your payment methods and billing information.
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                          Card
                        </label>
                        
                        {/* Payment methods list */}
                        <div className="space-y-2">
                          <label className="flex items-start gap-2 w-full px-3 py-2.5 rounded-lg border border-[#E4E5E1] bg-white cursor-pointer hover:bg-[#F0F0F0] transition-colors">
                            <input 
                              type="radio" 
                              name="payment-method" 
                              value="visa4242" 
                              defaultChecked 
                              className="h-3.5 w-3.5 border-[#E4E5E1] text-[#1A1A1A] focus:ring-[#1A1A1A] mt-[5px]"
                            />
                            <div className="w-7 h-7 bg-[#F5F5F3] rounded-lg flex items-center justify-center mt-0.5">
                              <img 
                                src="/visalogo.svg" 
                                alt="Visa" 
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="flex flex-col py-0.5">
                              <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                                Visa ending in 4242
                              </span>
                              <span className="text-[14px] leading-[20px] font-normal font-oracle text-[#646462]">
                                Expires 12/2024
                              </span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2 w-full px-3 py-2.5 rounded-lg border border-[#E4E5E1] bg-white cursor-pointer hover:bg-[#F0F0F0] transition-colors">
                            <input 
                              type="radio" 
                              name="payment-method" 
                              value="mastercard8888" 
                              className="h-3.5 w-3.5 border-[#E4E5E1] text-[#1A1A1A] focus:ring-[#1A1A1A] mt-[5px]"
                            />
                            <div className="w-7 h-7 bg-[#F5F5F3] rounded-lg flex items-center justify-center mt-0.5">
                              <img 
                                src="/Mastercard-Logo.wine.svg" 
                                alt="Mastercard" 
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="flex flex-col py-0.5">
                              <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                                Mastercard ending in 8888
                              </span>
                              <span className="text-[14px] leading-[20px] font-normal font-oracle text-[#646462]">
                                Expires 08/2025
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <button 
                        onClick={() => setIsAddCardModalOpen(true)}
                        className="flex items-center gap-1.5 bg-[#F0F1EF] hover:bg-[#E4E5E1] px-4 h-[32px] rounded-full transition-colors"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24"
                          className="text-[#1A1A1A]"
                        >
                          <path 
                            fill="currentColor"
                            d="M 12.232422 1.9824219 A 1.250125 1.250125 0 0 0 11.001953 3.25 L 11.001953 10.992188 L 3.2460938 10.992188 A 1.250125 1.250125 0 1 0 3.2460938 13.492188 L 11.001953 13.492188 L 11.001953 20.775391 A 1.250125 1.250125 0 1 0 13.501953 20.775391 L 13.501953 13.492188 L 20.755859 13.492188 A 1.250125 1.250125 0 1 0 20.755859 10.992188 L 13.501953 10.992188 L 13.501953 3.25 A 1.250125 1.250125 0 0 0 12.232422 1.9824219 z"
                          />
                        </svg>
                        <span className="font-[500] leading-[16px] font-oracle text-[14px] text-[#1A1A1A]">Add card</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing address card */}
              <div className="border border-[#E4E5E1] rounded-xl px-8 py-6">
                <div className="flex gap-24">
                  {/* Left side */}
                  <div className="flex-1">
                    <h2 className="text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                      Billing address
                    </h2>
                    <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                      The address associated with your payment method.
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
                          type="text" 
                          name="address"
                          value={billingAddress.address}
                          onChange={handleBillingAddressChange}
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
                          Street address line 2
                        </label>
                        <input 
                          type="text" 
                          name="addressLine2"
                          value={billingAddress.addressLine2}
                          onChange={handleBillingAddressChange}
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
                            value={billingAddress.city}
                            onChange={handleBillingAddressChange}
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
                              value={billingAddress.state}
                              onChange={handleBillingAddressChange}
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
                            value={billingAddress.zip}
                            onChange={handleBillingAddressChange}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
                Invoice history
              </h2>

              {/* Invoice table */}
              <div className="w-[600px]">
                <div className="grid grid-cols-4 gap-4 py-2 border-b border-[#E4E5E1]">
                  <div className="text-[14px] leading-[20px] font-[500] font-oracle text-[#646462]">
                    ID
                  </div>
                  <div className="text-[14px] leading-[20px] font-[500] font-oracle text-[#646462]">
                    Date
                  </div>
                  <div className="text-[14px] leading-[20px] font-[500] font-oracle text-[#646462]">
                    Invoice Total
                  </div>
                  <div className="text-[14px] leading-[20px] font-[500] font-oracle text-[#646462]">
                    Balance Due
                  </div>
                </div>

                {invoices.length === 0 ? (
                  <div className="py-4 text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                    No invoices yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E4E5E1]">
                    {invoices.map((invoice) => (
                      <div 
                        key={invoice.id} 
                        className="grid grid-cols-4 gap-4 h-[42px] items-center relative group cursor-pointer"
                        onClick={() => {
                          // Create a link element
                          const link = document.createElement('a')
                          link.href = '/sample.pdf'
                          link.download = 'sample.pdf'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        {/* Update hover background to have permanent rounded corners */}
                        <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                        
                        {/* Chevron that appears on hover */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path 
                              fillRule="evenodd" 
                              clipRule="evenodd" 
                              d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
                              fill="#646462"
                            />
                          </svg>
                        </div>

                        <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                          <span className="block transition-transform group-hover:translate-x-2">
                            {invoice.id}
                          </span>
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                          {invoice.date}
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                          {invoice.total}
                        </div>
                        <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] relative">
                          {invoice.balance}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add modal component */}
      <AddCardModal 
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
      />
    </div>
  )
} 