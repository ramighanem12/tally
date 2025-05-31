'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateClient: () => void
  initialName?: string
}

export default function CreateClientModal({ isOpen, onClose, onCreateClient, initialName = '' }: CreateClientModalProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState('')
  const [type, setType] = useState('Business')
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useAuth()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Update name when initialName changes
  useEffect(() => {
    if (initialName) {
      setName(initialName)
    }
  }, [initialName])

  const handleSubmit = async () => {
    if (!name.trim() || !user) return;
    
    setIsCreating(true)
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          name: name.trim(),
          email: email.trim() || null,
          type,
          user_id: user.id
        })

      if (error) throw error

      toast.success('Client created successfully')
      onCreateClient()
      setName('')
      setEmail('')
      setType('Business')
      onClose()
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Add client manually
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors"
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
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
              Client name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
              Email (optional)
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
              placeholder="Enter client email"
            />
          </div>

          <div>
            <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
              Type
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="block w-full h-[34px] rounded-lg border border-[#E4E5E1] 
                  bg-white py-1 px-3 pr-8 appearance-none
                  text-[14px] leading-[20px] font-oracle text-[#1A1A1A] 
                  focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
              >
                <option value="Business">Business</option>
                <option value="Individual">Individual</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path 
                    d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Separator and buttons */}
        <div className="mt-4 pt-4 border-t border-[#E4E5E1] -mx-6">
          <div className="px-6">
            <div className="flex justify-end gap-1.5">
              <button 
                onClick={onClose}
                className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!name.trim() || isCreating}
                className={`px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors flex items-center gap-2 ${
                  name.trim() && !isCreating
                    ? 'bg-[#1A1A1A] hover:bg-[#333333] text-white' 
                    : 'bg-[#F0F1EF] text-[#646462] cursor-not-allowed'
                }`}
              >
                {isCreating ? (
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
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create client'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 