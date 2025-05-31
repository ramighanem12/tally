'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Project {
  id: string;
  name: string;
}

interface EditNoteModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  initialType: string | null
  initialProjectId?: string | null
  initialProjectIds?: string[]
  onUpdateComplete?: () => void
}

const DOCUMENT_TYPES = [
  'None',
  'Incorporation',
  'P&L Statement',
  'Balance Sheet',
  'Tax Document',
  'Other'
] as const;

// Add MultiSelectDropdown component
interface Option {
  id: string
  label: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
}

function MultiSelectDropdown({ options, selected, onChange, placeholder }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSelectedLabels = () => {
    return selected
      .map(id => options.find(opt => opt.id === id)?.label)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] 
          font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] 
          focus:outline-none bg-white pr-8 appearance-none flex items-center justify-between"
      >
        <span className={`truncate ${selected.length === 0 ? 'text-[#646462]' : 'text-[#1A1A1A]'}`}>
          {selected.length === 0 
            ? placeholder
            : getSelectedLabels()}
        </span>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
            <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#E4E5E1] rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto py-1">
            {options.map((option) => (
              <label 
                key={option.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#F7F7F6] cursor-pointer"
              >
                <div className="relative w-4 h-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selected, option.id]
                        : selected.filter(id => id !== option.id)
                      onChange(newSelected)
                    }}
                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
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
                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] truncate flex-1 max-w-[300px]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EditNoteModal({ 
  isOpen, 
  onClose, 
  documentId,
  initialType = null,
  initialProjectId = null,
  initialProjectIds = [],
  onUpdateComplete 
}: EditNoteModalProps) {
  console.log('Initial project ID:', initialProjectId); // Debug log

  const [type, setType] = useState<string>(() => {
    if (!initialType) return ''
    return DOCUMENT_TYPES.includes(initialType as any) ? initialType : 'Other'
  })
  
  const [customType, setCustomType] = useState<string>(() => {
    if (!initialType) return ''
    return DOCUMENT_TYPES.includes(initialType as any) ? '' : initialType
  })
  
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() => {
    if (initialProjectIds.length > 0) {
      return initialProjectIds;
    }
    if (initialProjectId) {
      return [initialProjectId];
    }
    return [];
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (!error && data) {
        console.log('Fetched projects:', data); // Debug log
        setProjects(data);
      }
    };

    fetchProjects();
  }, []);

  console.log('Current projectId:', selectedProjectIds); // Debug log
  console.log('Projects:', projects); // Debug log

  const hasValidChanges = (() => {
    const finalType = type === 'Other' ? customType : type === 'None' ? null : type
    const projectsChanged = JSON.stringify(selectedProjectIds.sort()) !== 
      JSON.stringify((initialProjectIds.length > 0 ? initialProjectIds : initialProjectId ? [initialProjectId] : []).sort())
    return finalType !== initialType || projectsChanged
  })()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const updates: Record<string, any> = {}
      
      // Calculate final type value
      const finalType = type === 'Other' ? customType : type === 'None' ? null : type
      
      // Only include changed fields
      if (finalType !== initialType) {
        updates.type = finalType
      }
      
      // Handle project assignments
      // First, remove all existing project associations
      const { error: deleteError } = await supabase
        .from('project_documents')
        .delete()
        .eq('document_id', documentId)

      if (deleteError) throw deleteError

      // Then add new project associations
      if (selectedProjectIds.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        const { error: insertError } = await supabase
          .from('project_documents')
          .insert(
            selectedProjectIds.map(projectId => ({
              project_id: projectId,
              document_id: documentId,
              created_by: user?.id
            }))
          )

        if (insertError) throw insertError
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('documents')
          .update(updates)
          .eq('id', documentId)

        if (error) throw error
      }

      toast.success('Document updated successfully')
      onUpdateComplete?.()
      onClose()
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error('Failed to update document')
    } finally {
      setIsUpdating(false)
    }
  }

  const projectOptions = projects.map(project => ({
    id: project.id,
    label: project.name
  }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[440px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Update document
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

        <div className="mb-6 space-y-4">
          {/* Type Selection */}
          <div className="bg-white">
            <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
              Type (optional)
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
                className="w-full h-[34px] px-3 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none bg-white pr-8 appearance-none"
              >
                <option value="">Select type</option>
                {DOCUMENT_TYPES.map(docType => (
                  <option key={docType} value={docType}>
                    {docType === 'None' ? 'None' : docType}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#1A1A1A] rotate-90">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            {type === 'Other' && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom type..."
                className="w-full h-[34px] px-3 mt-2 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-oracle text-[#1A1A1A] focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
              />
            )}
          </div>

          {/* Project Selection */}
          <div className="bg-white">
            <label className="block text-[14px] leading-[16px] font-medium font-oracle text-[#1A1A1A] mb-1">
              Projects
            </label>
            <MultiSelectDropdown
              options={projectOptions}
              selected={selectedProjectIds}
              onChange={setSelectedProjectIds}
              placeholder="Select projects..."
            />
          </div>
        </div>

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
                onClick={handleUpdate}
                disabled={isUpdating || !hasValidChanges}
                className={`px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors flex items-center gap-2 ${
                  hasValidChanges && !isUpdating
                    ? 'bg-[#1A1A1A] hover:bg-[#333333] text-white' 
                    : 'bg-[#F0F1EF] text-[#646462] cursor-not-allowed'
                }`}
              >
                {isUpdating ? (
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
                    <span>Updating...</span>
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 