'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface TaxRate {
  id: string
  name: string
  rate: number
  default: boolean
}

export default function TaxSettingsPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: '1',
      name: 'Standard Rate',
      rate: 20,
      default: true
    },
    {
      id: '2',
      name: 'Reduced Rate',
      rate: 5,
      default: false
    }
  ])

  const [newRate, setNewRate] = useState({
    name: '',
    rate: ''
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleAddRate = () => {
    if (!newRate.name || !newRate.rate) {
      toast.error('Please fill in all fields')
      return
    }

    const rateValue = parseFloat(newRate.rate.toString())
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      toast.error('Please enter a valid tax rate between 0 and 100')
      return
    }

    setTaxRates([...taxRates, {
      id: Date.now().toString(),
      name: newRate.name,
      rate: rateValue,
      default: false
    }])

    setNewRate({ name: '', rate: '' })
    toast.success('Tax rate added successfully')
  }

  const handleSetDefault = (id: string) => {
    setTaxRates(taxRates.map(rate => ({
      ...rate,
      default: rate.id === id
    })))
    toast.success('Default tax rate updated')
  }

  const handleDeleteRate = (id: string) => {
    const rateToDelete = taxRates.find(rate => rate.id === id)
    if (rateToDelete?.default) {
      toast.error('Cannot delete default tax rate')
      return
    }
    setTaxRates(taxRates.filter(rate => rate.id !== id))
    toast.success('Tax rate deleted')
  }

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
            Tax settings
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 px-6 pr-[24px] py-4">
          {/* Content will go here */}
        </div>
      </div>
    </div>
  )
} 