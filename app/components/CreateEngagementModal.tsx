'use client'
import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  name: string
}

interface ServiceType {
  id: string
  name: string
}

interface CreateEngagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateEngagementModal({ isOpen, onClose }: CreateEngagementModalProps) {
  const [selectedServiceType, setSelectedServiceType] = useState<string>('Monthly')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isServiceTypeDropdownOpen, setIsServiceTypeDropdownOpen] = useState(false)
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const serviceTypeDropdownRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([])
  const [isServiceTypesDropdownOpen, setIsServiceTypesDropdownOpen] = useState(false)
  const serviceTypesDropdownRef = useRef<HTMLDivElement>(null)

  const serviceTypes: ServiceType[] = [
    { id: 'bookkeeping', name: 'Bookkeeping' },
    { id: 'tax-strategy', name: 'Tax strategy' },
    { id: 'tax-preparation', name: 'Tax preparation' }
  ]

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
      if (serviceTypeDropdownRef.current && !serviceTypeDropdownRef.current.contains(event.target as Node)) {
        setIsServiceTypeDropdownOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (serviceTypesDropdownRef.current && !serviceTypesDropdownRef.current.contains(event.target as Node)) {
        setIsServiceTypesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      'Weekly': '#FF6B6B',      // Red
      'Bi-weekly': '#4ECDC4',   // Teal
      'Monthly': '#45B7D1',     // Blue
      'Quarterly': '#96CEB4',   // Green
      'Semi-annual': '#FFEEAD', // Yellow
      'Annual': '#D4A5A5'       // Pink
    };
    return colors[serviceType as keyof typeof colors] || '#9CA3AF';
  };

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const toggleServiceType = (serviceType: ServiceType) => {
    setSelectedServiceTypes(prev => {
      const exists = prev.find(type => type.id === serviceType.id)
      if (exists) {
        return prev.filter(type => type.id !== serviceType.id)
      }
      return [...prev, serviceType]
    })
  }

  const resetForm = () => {
    setSelectedServiceType('Monthly')
    setSelectedClient(null)
    setClientSearch('')
    setSelectedServiceTypes([])
    setIsServiceTypeDropdownOpen(false)
    setIsClientDropdownOpen(false)
    setIsServiceTypesDropdownOpen(false)
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
                  New engagement
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
                      <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
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
                    Service type(s)
                  </label>
                  <div className="relative" ref={serviceTypesDropdownRef}>
                    <button
                      onClick={() => setIsServiceTypesDropdownOpen(!isServiceTypesDropdownOpen)}
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedServiceTypes.length === 0 ? (
                          <span className="text-[14px] leading-[20px] font-oracle text-[#6B7280]">
                            Select service types
                          </span>
                        ) : (
                          selectedServiceTypes.map(type => (
                            <div 
                              key={type.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F6F6] border border-[#E4E5E1]"
                            >
                              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                                {type.name}
                              </span>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleServiceType(type)
                                }}
                                className="ml-1.5 text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer"
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform ${isServiceTypesDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {isServiceTypesDropdownOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1 z-[60]">
                        {serviceTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => toggleServiceType(type)}
                            className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-[#F3F6F6] transition-colors"
                          >
                            <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                              {type.name}
                            </span>
                            {selectedServiceTypes.find(t => t.id === type.id) && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#41629E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedServiceTypes.some(type => type.id === 'bookkeeping') && (
                  <div>
                    <label className="block text-[14px] leading-[20px] font-oracle text-[#4B5563] mb-1.5">
                      Bookkeeping service level
                    </label>
                    <div className="relative" ref={serviceTypeDropdownRef}>
                      <button
                        onClick={() => setIsServiceTypeDropdownOpen(!isServiceTypeDropdownOpen)}
                        className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] outline-none transition-colors bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: getServiceTypeColor(selectedServiceType) }}
                          />
                          <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                            {selectedServiceType}
                          </span>
                        </div>
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-transform ${isServiceTypeDropdownOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {isServiceTypeDropdownOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-lg border border-[#E4E5E1] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.12)] p-1">
                          <div className="max-h-[180px] overflow-y-auto -mb-1">
                            <div className="pb-1">
                              {serviceLevels.map((level) => (
                                <button
                                  key={level}
                                  onClick={() => {
                                    setSelectedServiceType(level)
                                    setIsServiceTypeDropdownOpen(false)
                                  }}
                                  className={`w-full px-3 py-2 flex items-center rounded-lg hover:bg-[#F3F6F6] transition-colors ${
                                    selectedServiceType === level ? 'bg-[#F3F6F6]' : ''
                                  }`}
                                >
                                  <div 
                                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{ backgroundColor: getServiceTypeColor(level) }}
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
                )}
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