'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface FormData {
  name: string
  state: string
  ein: string
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const inputStyles = `
  w-full px-3 py-2 text-sm
  text-gray-900 dark:text-white
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  hover:border-gray-300 dark:hover:border-gray-600
  rounded-lg
  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
  transition-colors
`;

export default function OrganizationDetailsPanel({ isOpen, onClose, onSave }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isShowing, setIsShowing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    state: '',
    ein: ''
  })

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => {
        setIsShowing(false)
      }, 300)
    }
  }, [isOpen])

  const formatEIN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Format as XX-XXXXXXX
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`
  }

  const handleEINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEIN(e.target.value)
    setFormData(prev => ({ ...prev, ein: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const promise = new Promise(async (resolve, reject) => {
      try {
        const { error } = await supabase
          .from('organizations')
          .upsert([
            {
              id: user?.id,
              ...formData
            }
          ])

        if (error) throw error

        onSave()
        onClose()
        resolve(undefined)
      } catch (error: any) {
        console.error('Error saving organization details:', error)
        reject(error)
      } finally {
        setLoading(false)
      }
    })

    toast.promise(promise, {
      loading: 'Saving organization details...',
      success: 'Organization details saved successfully',
      error: 'Failed to save organization details'
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        aria-hidden={!isOpen}
        className={`
          fixed inset-0 bg-gray-900/5 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        fixed top-4 right-4 bottom-4 w-[400px]
        transform ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+16px)]'}
        transition-transform duration-300 ease-out
        bg-white rounded-lg shadow-sm
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Organization details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 65px)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg
                    hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    transition-colors"
                  placeholder="Acme Inc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  State
                </label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className={`${inputStyles} pr-8 appearance-none cursor-pointer`}
                    required
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  EIN
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={handleEINChange}
                  className={inputStyles}
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                  required
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg
                    text-sm font-medium text-white bg-gray-900 hover:bg-gray-800
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200"
                >
                  {loading ? 'Saving...' : 'Save details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 