'use client'
import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
}

interface CreateBookkeepingModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSuccess: () => void
}

export default function CreateBookkeepingModal({ isOpen, onClose, onCreateSuccess }: CreateBookkeepingModalProps) {
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<string>('Monthly')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isServiceLevelDropdownOpen, setIsServiceLevelDropdownOpen] = useState(false)
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const serviceLevelDropdownRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const [clientSearch, setClientSearch] = useState('')

  const serviceLevels = [
    'Weekly',
    'Bi-weekly',
    'Monthly',
    'Quarterly',
    'Semi-annual',
    'Annual'
  ]

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');

      if (!error && data) {
        setClients(data);
      }
    };

    fetchClients();
  }, []);

  // Handle click outside for both dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceLevelDropdownRef.current && !serviceLevelDropdownRef.current.contains(event.target as Node)) {
        setIsServiceLevelDropdownOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getServiceLevelColor = (serviceLevel: string) => {
    const colors = {
      'Weekly': '#FF6B6B',      // Red
      'Bi-weekly': '#4ECDC4',   // Teal
      'Monthly': '#45B7D1',     // Blue
      'Quarterly': '#96CEB4',   // Green
      'Semi-annual': '#FFEEAD', // Yellow
      'Annual': '#D4A5A5'       // Pink
    };
    return colors[serviceLevel as keyof typeof colors] || '#9CA3AF';
  };

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const resetForm = () => {
    setSelectedServiceLevel('Monthly')
    setSelectedClient(null)
    setClientSearch('')
    setIsServiceLevelDropdownOpen(false)
    setIsClientDropdownOpen(false)
  }

  // Add function to create initial periods
  const createInitialPeriods = async (engagementId: string) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Create next 12 monthly periods
    const periods = Array.from({ length: 12 }, (_, i) => {
      const periodMonth = ((month + i - 1) % 12) + 1
      const periodYear = year + Math.floor((month + i - 1) / 12)
      
      return {
        engagement_id: engagementId,
        period_format: 'monthly',
        period_year: periodYear,
        period_month: periodMonth,
        status: i === 0 ? 'blocked' : 'in_progress'
      }
    })

    const { error } = await supabase
      .from('bookkeeping_engagement_close_periods')
      .insert(periods)

    if (error) throw error
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog 
        onClose={() => {
          resetForm()
          onClose()
        }} 
        className="relative z-50"
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px]" />
        </Transition.Child>

        {/* Modal */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-[22px] leading-[26px] font-medium font-oracle text-[#1A1A1A]">
                  New bookkeeping engagement
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F6F6] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                    Client
                  </label>
                  <div className="relative" ref={clientDropdownRef}>
                    <button
                      onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                    >
                      <span className={`text-[14px] leading-[20px] font-oracle ${selectedClient ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>
                        {selectedClient?.name || 'Select a client'}
                      </span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {isClientDropdownOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1 z-10">
                        <div className="p-1">
                          <input
                            type="text"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Search clients..."
                            className="w-full h-8 px-2 rounded-md border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] placeholder-[#9A9A99] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[180px] overflow-y-auto -mb-1">
                          {filteredClients.length > 0 ? (
                            <div className="pb-1">
                              {filteredClients.map((client) => (
                                <button
                                  key={client.id}
                                  onClick={() => {
                                    setSelectedClient(client)
                                    setIsClientDropdownOpen(false)
                                    setClientSearch('')
                                  }}
                                  className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F7F7F7] transition-colors ${
                                    selectedClient?.id === client.id ? 'bg-[#F7F7F7]' : ''
                                  }`}
                                >
                                  <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                    {client.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-3 py-2 pb-3">
                              <div className="text-[14px] leading-[20px] font-oracle text-[#6B7280] mb-2">
                                No clients found
                              </div>
                              <button
                                onClick={() => {
                                  console.log('Create new client:', clientSearch)
                                }}
                                className="flex items-center gap-1.5 text-[14px] leading-[20px] font-medium font-oracle text-[#41629E] hover:text-[#385389] transition-colors"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Create "{clientSearch}"
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                    Service level
                  </label>
                  <div className="relative" ref={serviceLevelDropdownRef}>
                    <button
                      onClick={() => setIsServiceLevelDropdownOpen(!isServiceLevelDropdownOpen)}
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{ backgroundColor: getServiceLevelColor(selectedServiceLevel) }}
                        />
                        <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                          {selectedServiceLevel}
                        </span>
                      </div>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${isServiceLevelDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {isServiceLevelDropdownOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1">
                        <div className="max-h-[180px] overflow-y-auto -mb-1">
                          <div className="pb-1">
                            {serviceLevels.map((level) => (
                              <button
                                key={level}
                                onClick={() => {
                                  setSelectedServiceLevel(level)
                                  setIsServiceLevelDropdownOpen(false)
                                }}
                                className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F3F6F6] transition-colors ${
                                  selectedServiceLevel === level ? 'bg-[#F3F6F6]' : ''
                                }`}
                              >
                                <div 
                                  className="w-1.5 h-1.5 rounded-full mr-1.5"
                                  style={{ backgroundColor: getServiceLevelColor(level) }}
                                />
                                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                  {level}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetForm()
                    onClose()
                  }}
                  className="px-3 h-8 rounded-lg text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] hover:bg-[#F3F6F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedClient) {
                      toast.error('Please select a client')
                      return
                    }

                    try {
                      const { data: { user } } = await supabase.auth.getUser()
                      
                      const { data, error } = await supabase
                        .from('bookkeeping_engagements')
                        .insert({
                          client_id: selectedClient.id,
                          service_level: selectedServiceLevel,
                          created_by: user?.id
                        })
                        .select('id')
                        .single()

                      if (error) throw error

                      // Create initial periods
                      await createInitialPeriods(data.id)

                      toast.success(`Bookkeeping engagement for ${selectedClient.name} created successfully`)
                      onCreateSuccess()
                      onClose()
                    } catch (error) {
                      console.error('Error creating bookkeeping engagement:', error)
                      toast.error('Failed to create bookkeeping engagement')
                    }
                  }}
                  className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors border border-[#344D7A]"
                >
                  Create engagement
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
} 