'use client'
import { WorkflowInput } from '@/data/workflows'
import { useState, useEffect, useRef } from 'react'
import FileUploadZone from './FileUploadZone'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import CreateClientModal from './CreateClientModal'

interface WorkflowInputsProps {
  id?: string
  inputs: WorkflowInput[]
  onSubmit: (data: Record<string, any>) => void
  renderSubmitButton?: boolean
  noPadding?: boolean
}

// Add interface for Client
interface Client {
  id: string;
  name: string;
}

// Move filterClients outside of both components and add proper typing
function filterClients(clients: Client[], search: string): Client[] {
  const searchLower = search.toLowerCase()
  return clients.filter(client => 
    client.name.toLowerCase().includes(searchLower)
  )
}

export default function WorkflowInputs({ 
  id,
  inputs = [], 
  onSubmit,
  renderSubmitButton = false,
  noPadding = false
}: WorkflowInputsProps) {
  console.log('WorkflowInputs received inputs:', inputs)
  
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File[]>>({})
  const [clients, setClients] = useState<Client[]>([])

  // Add state and fetch function for clients
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Add helper to get client name by id
  const getClientName = (clientId: string) => {
    return clients.find(client => client.id === clientId)?.name || ''
  }

  const handleInputChange = (inputId: string, value: any) => {
    setFormData(prev => ({ ...prev, [inputId]: value }))
  }

  const handleFileChange = (inputId: string, files: File[]) => {
    setFiles(prev => ({ ...prev, [inputId]: files }))
    // Fix the files object structure in onSubmit
    onSubmit({ ...formData, files: { [inputId]: files }})
  }

  const handleVaultImport = async (inputId: string, docIds: string[]) => {
    // Fetch documents with their project associations
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        project_documents (
          project:projects (
            id,
            name
          )
        )
      `)
      .in('id', docIds)

    if (error) {
      console.error('Error fetching vault documents:', error)
      return
    }

    // Group documents by project
    const projectDocs = documents.reduce((acc: Record<string, any>, doc) => {
      const project = doc.project_documents?.[0]?.project
      if (project) {
        if (!acc[project.id]) {
          acc[project.id] = {
            id: project.id,
            name: project.name,
            type: 'project',
            files: []
          }
        }
        acc[project.id].files.push(doc.name)
      }
      return acc
    }, {})

    // Add documents to the workflow
    onSubmit({
      ...formData,
      vaultDocuments: {
        [inputId]: {
          projects: Object.values(projectDocs),
          standalone: documents.filter(d => !d.project_documents?.[0]?.project).map(doc => ({
            id: doc.id,
            name: doc.name,
            type: 'file'
          }))
        }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData) // Don't include files here since they're handled separately
  }

  return (
    <form 
      id={id} 
      onSubmit={handleSubmit} 
      className={`space-y-6 ${noPadding ? '' : 'pr-4'} pt-4`}
    >
      {inputs.map((input, index) => (
        <div key={input.id} className={`${
          input.type !== 'document_upload' 
            ? index === inputs.length - 1  // Check if it's the last input
              ? 'mb-0'  // explicitly set margin to 0 for last input
              : 'mb-4'  // 16px for other inputs
            : ''  // no margin for document_upload
        } space-y-2`}>
          {input.type !== 'document_upload' && input.type !== 'date' && input.label && (
            <div className="flex items-center gap-1">
              <label className="block text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                {input.id === 'tax-year' ? 'What is the tax year?' : input.label}
                {/* Only show asterisk if required AND not client_select type */}
                {input.required && input.type !== 'client_select' && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {input.id === 'context' && (
                <div className="relative group">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24"
                    className="text-[#8A8A89] group-hover:text-[#1A1A1A] transition-colors cursor-help"
                  >
                    <path 
                      fill="currentColor"
                      d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                    />
                  </svg>
                  
                  <div className="absolute z-[100] invisible group-hover:visible bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[288px] top-1/2 -translate-y-1/2 left-6">
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      Add relevant client details, business structures, income sources, or other tax circumstances that may affect this workflow.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {input.type === 'document_upload' && input.description && (
            <p className="text-[13px] leading-[18px] text-[#646462]">
              {input.description}
            </p>
          )}

          {input.type === 'document_upload' && (
            <div className="mt-1">
              <label className="block text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A] mb-2">
                Upload documents
                <span className="text-red-500 ml-1">*</span>
              </label>
              <FileUploadZone
                onFileChange={(files) => handleFileChange(input.id, files)}
                onImportFromVault={(docIds) => handleVaultImport(input.id, docIds)}
                acceptedFileTypes={input.acceptedFileTypes}
                multiple={input.multiple}
                required={input.required}
                documentTypes={input.documentTypes}
              />
            </div>
          )}

          {input.type === 'select' && (
            input.id === 'tax-year' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-x-6 gap-y-2">
                  {[2023, 2022, 2021, 2020].map((year) => (
                    <label key={year} className="flex items-center gap-2">
                      <div className="relative w-4 h-4">
                        <input
                          type="radio"
                          name={input.id}
                          value={year}
                          className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          required={input.required}
                        />
                        <div className="absolute inset-0 border border-[#E4E5E1] rounded-full bg-white 
                          peer-hover:border-[#1A1A1A] peer-checked:border-[#1A1A1A] peer-checked:border-[5px]
                          transition-all" 
                        />
                      </div>
                      <span className="text-[14px] leading-[20px] text-[#1A1A1A]">
                        {year}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <div className="relative">
                  <select
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    className="block w-full rounded-md border border-[#E4E5E1] 
                      bg-white py-2 px-3 pr-8 appearance-none
                      text-[14px] leading-[20px]
                      focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    required={input.required}
                  >
                    <option value="">
                      {input.id === 'states' ? 'Select state' :
                       input.id === 'review-period' ? 'Select period' :
                       `Select ${input.label?.toLowerCase().replace(/^what |is |are |this |for\?$/g, '')}`}
                    </option>
                    {input.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
            )
          )}

          {input.type === 'checkbox' && input.options && (
            <div className="mt-1 space-y-2">
              {input.options.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <div className="relative w-4 h-4">
                    <input
                      type="checkbox"
                      value={option.value}
                      className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                      onChange={(e) => {
                        const currentValues = formData[input.id] || [];
                        const newValues = e.target.checked 
                          ? [...currentValues, option.value]
                          : currentValues.filter((v: string) => v !== option.value);
                        handleInputChange(input.id, newValues);
                      }}
                      required={input.required && !formData[input.id]?.length}
                    />
                    <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white 
                      peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] 
                      transition-all" 
                    />
                    <svg 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 
                        text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M2.5 6L5 8.5L9.5 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[14px] leading-[20px] text-[#1A1A1A]">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {input.type === 'radio' && input.options && (
            <div className="space-y-3">
              <div className="space-y-2">
                {input.options.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <div className="relative w-4 h-4">
                      <input
                        type="radio"
                        name={input.id}
                        value={option.value}
                        className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        required={input.required}
                      />
                      <div className="absolute inset-0 border border-[#E4E5E1] rounded-full bg-white 
                        peer-hover:border-[#1A1A1A] peer-checked:border-[#1A1A1A] peer-checked:border-[5px]
                        transition-all" 
                      />
                    </div>
                    <span className="text-[14px] leading-[20px] text-[#1A1A1A]">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {input.type === 'text' && (
            <div className="mt-1">
              <textarea
                id={input.id}
                name={input.id}
                rows={4}
                className="w-full rounded-md border border-[#E4E5E1] bg-white px-3 py-2
                  text-[14px] leading-[20px] text-[#1A1A1A] placeholder:text-[#646462]
                  focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] 
                  resize-none"
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                required={input.required}
              />
            </div>
          )}

          {input.type === 'date' && (
            <div className="mt-1">
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[16px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                  What is the end date for this report?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                <div className="relative group">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24"
                    className="text-[#8A8A89] group-hover:text-[#1A1A1A] transition-colors cursor-help"
                  >
                    <path 
                      fill="currentColor"
                      d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"
                    />
                  </svg>
                  
                  <div className="absolute z-[100] invisible group-hover:visible bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 w-[288px] top-1/2 -translate-y-1/2 left-6">
                    <p className="text-[13px] leading-[18px] font-normal font-oracle text-[#1A1A1A] whitespace-normal">
                      This will be used as the cutoff date for the financial statements.
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="date"
                id={input.id}
                name={input.id}
                className="block w-full rounded-md border border-[#E4E5E1] 
                  bg-white py-2 px-3 focus:border-[#1A1A1A] 
                  focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]
                  text-[14px] leading-[20px]"
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                required={input.required}
              />
            </div>
          )}
        </div>
      ))}

      {renderSubmitButton && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md
              text-[14px] leading-[20px] font-medium hover:bg-[#000000]
              transition-colors"
          >
            Start Workflow
          </button>
        </div>
      )}
    </form>
  )
}

function ClientDropdown({ 
  clients, 
  onChange,
  fetchClients
}: { 
  clients: Client[], 
  onChange: (value: string) => void,
  fetchClients: () => Promise<void>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredClients = filterClients(clients, search)

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full rounded-md border border-[#E4E5E1] 
          bg-white py-2 px-3 text-[14px] leading-[20px] cursor-pointer
          focus-within:border-[#1A1A1A] focus-within:ring-1 focus-within:ring-[#1A1A1A]"
      >
        <span className={selectedClient ? 'text-[#1A1A1A]' : 'text-[#646462]'}>
          {selectedClient ? selectedClient.name : 'Select client'}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path 
            d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
            fill="currentColor"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E4E5E1] rounded-md shadow-lg">
          <div className="p-2 border-b border-[#E4E5E1]">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search clients..."
                className="w-full h-[32px] pl-8 pr-3 rounded-lg border border-[#E4E4E4] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] placeholder-[#9A9A99] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none transition-colors"
              />
              <Image 
                src="/Vector (4).svg"
                alt="Search"
                width={14}
                height={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>
          
          <div className="max-h-[180px] overflow-y-auto p-2">
            {filteredClients.length === 0 ? (
              <div className="space-y-[2px]">
                <div className="px-3 py-2 text-[14px] leading-[20px] text-[#646462]">
                  No clients found
                </div>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(true)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F7F7F6] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] flex items-center gap-2"
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
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                    />
                  </svg>
                  Create new client "{search}"
                </button>
              </div>
            ) : (
              filteredClients.map((client: Client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client)
                    onChange(client.id)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className={`px-3 py-2 cursor-pointer text-[14px] leading-[20px] hover:bg-[#F7F7F6] rounded-md
                    ${selectedClient?.id === client.id ? 'bg-[#F7F7F6]' : ''}`}
                >
                  {client.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateClient={() => {
          fetchClients()
        }}
        initialName={search}
      />
    </div>
  )
} 