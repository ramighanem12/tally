'use client'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import Papa from 'papaparse'

interface ImportClientsModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

interface CSVClient {
  name: string;
  email: string;
  type: string;
}

const DeleteIcon = () => (
  <svg 
    className="w-4 h-4 text-[#646462]"
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path fill="currentColor" d="M 12 2 C 6.4919555 2 2 6.4919596 2 12 C 2 17.50804 6.4919555 22 12 22 C 17.508045 22 22 17.50804 22 12 C 22 6.4919596 17.508045 2 12 2 z M 12 4.5 C 16.156945 4.5 19.5 7.8430575 19.5 12 C 19.5 16.156943 16.156945 19.5 12 19.5 C 7.8430549 19.5 4.5 16.156943 4.5 12 C 4.5 7.8430575 7.8430549 4.5 12 4.5 z M 8 10.75 A 1.250125 1.250125 0 1 0 8 13.25 L 16 13.25 A 1.250125 1.250125 0 1 0 16 10.75 L 8 10.75 z" />
  </svg>
)

export default function ImportClientsModal({ isOpen, onClose, onImportComplete }: ImportClientsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<CSVClient[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewData([]);
    }
  }, [isOpen]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        // Parse CSV for preview
        Papa.parse(file, {
          complete: (results) => {
            const data = results.data as string[][];
            // Skip header row and map to client structure
            const clients = data.slice(1).map(row => ({
              name: row[0] || '',
              email: row[1] || '',
              type: row[2] || 'Business'
            })).filter(client => client.name); // Filter out empty rows
            setPreviewData(clients);
          },
          header: false
        });
      }
    },
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (!selectedFile || !user) return;
    
    setIsImporting(true);
    try {
      // Insert all clients
      const { error } = await supabase
        .from('clients')
        .insert(previewData.map(client => ({
          name: client.name,
          email: client.email || null,
          type: client.type || 'Business',
          status: 'Active',
          user_id: user.id
        })));

      if (error) throw error;

      toast.success('Clients imported successfully');
      onImportComplete?.();
      onClose();
    } catch (error) {
      console.error('Error importing clients:', error);
      toast.error('Failed to import clients');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Email,Type\nAcme Corporation,contact@acme.com,Business\nJohn Smith,john@email.com,Individual";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full ${selectedFile && previewData.length > 0 ? 'max-w-[874px]' : 'max-w-[484px]'} bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
            Import clients
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

        <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] mb-2">
          Import multiple clients at once using a CSV file.
        </p>

        <button
          onClick={downloadTemplate}
          className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] hover:text-[#333333] mb-6 underline"
        >
          Download template CSV
        </button>

        <div className="mb-6">
          {/* Upload Section */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mb-4
              ${isDragActive ? 'border-[#1A1A1A] bg-[#F7F7F7]' : 'border-[#E4E5E1] hover:border-[#BBBDB7]'}`}
          >
            <input {...getInputProps()} />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              className="mx-auto mb-2 text-[#646462]"
            >
              <path 
                fill="currentColor"
                d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20M10 19H8V18H10V19M10 17H8V16H10V17M10 15H8V14H10V15M14 19H12V18H14V19M14 17H12V16H14V17M14 15H12V14H14V15"
              />
            </svg>
            <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
              {isDragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
            </p>
            <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#646462] mt-1">
              or click to browse
            </p>
          </div>

          {/* Preview Section */}
          {selectedFile && previewData.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                  Preview ({previewData.length} clients)
                </h3>
              </div>

              <div className="border border-[#E4E5E1] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_2fr_1fr_40px] gap-4 py-1.5 border-b border-[#E4E5E1] px-4 bg-white/80">
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Name</div>
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Email</div>
                  <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Type</div>
                  <div></div>
                </div>

                {/* Table Content */}
                <div className="divide-y divide-[#E4E5E1] max-h-[368px] overflow-y-auto">
                  {previewData.map((client, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-[2fr_2fr_1fr_40px] gap-4 h-[42px] items-center px-4 hover:bg-[#F7F7F6] transition-colors"
                    >
                      <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] truncate">
                        {client.name}
                      </div>
                      <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A] truncate">
                        {client.email || '—'}
                      </div>
                      <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                        {client.type || 'Business'}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setPreviewData(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-[#646462] p-1 hover:bg-[#E4E5E1] rounded-md"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className={`px-3.5 h-[32px] rounded-full font-oracle font-[500] text-[14px] leading-[16px] transition-colors flex items-center gap-2 ${
                  selectedFile && !isImporting
                    ? 'bg-[#1A1A1A] hover:bg-[#333333] text-white' 
                    : 'bg-[#F0F1EF] text-[#646462] cursor-not-allowed'
                }`}
              >
                {isImporting ? (
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
                    <span>Importing...</span>
                  </>
                ) : (
                  'Import'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 