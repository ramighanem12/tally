'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import ClientRowMenu from "../components/ClientRowMenu"
import Link from 'next/link'
import CreateClientModal from '../components/CreateClientModal'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import ImportClientsModal from '../components/ImportClientsModal'

interface Client {
  id: string;
  name: string;
  email: string | null;
  type: string;
  created_at: string;
  user_id: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchClients, setSearchClients] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isAddClientDropdownOpen, setIsAddClientDropdownOpen] = useState(false);
  const [isImportClientsModalOpen, setIsImportClientsModalOpen] = useState(false);
  const addClientDropdownRef = useRef<HTMLDivElement>(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addClientDropdownRef.current && !addClientDropdownRef.current.contains(event.target as Node)) {
        setIsAddClientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(client => {
    const search = searchClients.toLowerCase();
    return client.name.toLowerCase().includes(search) || 
           (client.email?.toLowerCase().includes(search) || false);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteClient = (clientId: string) => {
    console.log('Delete client:', clientId);
  };

  const handleBulkDelete = async () => {
    try {
      if (!confirm(`Are you sure you want to delete ${selectedClients.size} client${selectedClients.size > 1 ? 's' : ''}?`)) {
        return;
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .in('id', Array.from(selectedClients));

      if (error) throw error;

      await fetchClients();
      setSelectedClients(new Set());
      toast.success(`${selectedClients.size} client${selectedClients.size > 1 ? 's' : ''} deleted`);
    } catch (error) {
      console.error('Error deleting clients:', error);
      toast.error('Failed to delete clients');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(new Set(clients.map(client => client.id)));
    } else {
      setSelectedClients(new Set());
    }
  };

  const LoadingTable = () => (
    <div className="divide-y divide-[#E4E5E1]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i}
          className="grid grid-cols-[24px_2fr_2fr_1fr_1fr_32px] gap-4 h-[42px] items-center px-4 -mx-4"
        >
          <div className="w-4 h-4 bg-[#F7F7F6] rounded animate-pulse" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-48" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-48" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-24" />
          <div className="h-5 bg-[#F7F7F6] rounded animate-pulse w-36" />
          <div></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="clients" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6]">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col">
          <div className="pl-4 pr-6 py-5 border-b border-[#E4E5E1]">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                Clients
              </h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-[320px]">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchClients}
                          onChange={(e) => setSearchClients(e.target.value)}
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

                    <div className="relative" ref={addClientDropdownRef}>
                      <button
                        onClick={() => setIsAddClientDropdownOpen(!isAddClientDropdownOpen)}
                        className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-medium text-[14px] leading-[20px] transition-colors flex items-center gap-1 ml-auto"
                      >
                        <span>Add client</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24"
                          className={`w-4 h-4 transition-transform ${isAddClientDropdownOpen ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>

                      {isAddClientDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                          <div className="space-y-[2px]">
                            <button
                              onClick={() => {
                                setIsAddClientDropdownOpen(false);
                                setIsCreateClientModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                            >
                              Add client manually
                            </button>
                            <button
                              onClick={() => {
                                setIsAddClientDropdownOpen(false);
                                setIsImportClientsModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                            >
                              Import clients in bulk
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="grid grid-cols-[24px_2fr_2fr_1fr_1fr_32px] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80">
                      <div className="w-4 flex items-center">
                        <div className="relative w-4 h-4">
                          <input
                            type="checkbox"
                            className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                            checked={clients.length > 0 && selectedClients.size === clients.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                          <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] transition-all" />
                          <svg 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M2.5 6L5 8.5L9.5 4"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Name</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Email</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Type</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Date Added</div>
                      <div></div>
                    </div>
                    <LoadingTable />
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-[320px]">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchClients}
                          onChange={(e) => setSearchClients(e.target.value)}
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

                    <div className="relative" ref={addClientDropdownRef}>
                      <button
                        onClick={() => setIsAddClientDropdownOpen(!isAddClientDropdownOpen)}
                        className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-medium text-[14px] leading-[20px] transition-colors flex items-center gap-1 ml-auto"
                      >
                        <span>Add client</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24"
                          className={`w-4 h-4 transition-transform ${isAddClientDropdownOpen ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>

                      {isAddClientDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                          <div className="space-y-[2px]">
                            <button
                              onClick={() => {
                                setIsAddClientDropdownOpen(false);
                                setIsCreateClientModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                            >
                              Add client manually
                            </button>
                            <button
                              onClick={() => {
                                setIsAddClientDropdownOpen(false);
                                setIsImportClientsModalOpen(true);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                            >
                              Import clients in bulk
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="grid grid-cols-[24px_2fr_2fr_1fr_1fr_32px] gap-4 py-1.5 border-t border-[#E4E5E1] border-b border-b-[#E4E5E1]/50 px-4 -mx-4 bg-white/80">
                      <div className="w-4 flex items-center">
                        <div className="relative w-4 h-4">
                          <input
                            type="checkbox"
                            className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                            checked={clients.length > 0 && selectedClients.size === clients.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                          <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] transition-all" />
                          <svg 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M2.5 6L5 8.5L9.5 4"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Name</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Email</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Type</div>
                      <div className="text-[13px] leading-[18px] font-[500] font-oracle text-[#646462]">Date Added</div>
                      <div></div>
                    </div>

                    <div className="divide-y divide-[#E4E5E1]">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div 
                            key={client.id}
                            className="grid grid-cols-[24px_2fr_2fr_1fr_1fr_32px] gap-4 h-[42px] items-center relative group cursor-pointer hover:bg-[#F7F7F6] transition-colors px-4 -mx-4"
                            onMouseEnter={() => setHoveredRowId(client.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                          >
                            <div 
                              className="w-4 relative z-10 flex items-center opacity-0 group-hover:opacity-100 [&:has(input:checked)]:opacity-100 transition-opacity" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="relative w-4 h-4">
                                <input
                                  type="checkbox"
                                  className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                  checked={selectedClients.has(client.id)}
                                  onChange={(e) => {
                                    setSelectedClients(prev => {
                                      const next = new Set(prev);
                                      if (next.has(client.id)) {
                                        next.delete(client.id);
                                      } else {
                                        next.add(client.id);
                                      }
                                      return next;
                                    });
                                  }}
                                />
                                <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] transition-all" />
                                <svg 
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M2.5 6L5 8.5L9.5 4"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                            <Link href={`/clients/${client.id}`} className="contents">
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {client.name}
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {client.email || '—'}
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {client.type}
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                {formatDate(client.created_at)}
                              </div>
                            </Link>
                            <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                              <ClientRowMenu 
                                clientId={client.id}
                                onDelete={() => fetchClients()}
                                isRowHovered={hoveredRowId === client.id}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                          <div className="w-8 h-8 mb-4 text-[#646462]">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="32" 
                              height="32" 
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z" />
                            </svg>
                          </div>
                          <h3 className="text-[16px] leading-[24px] font-medium text-[#1A1A1A] mb-1">
                            {searchClients ? 'No clients found' : 'No clients yet'}
                          </h3>
                          <p className="text-[14px] leading-[20px] text-[#646462]">
                            {searchClients 
                              ? 'Try adjusting your search terms'
                              : 'Add your first client to get started'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
        onCreateClient={fetchClients}
      />
      <ImportClientsModal
        isOpen={isImportClientsModalOpen}
        onClose={() => setIsImportClientsModalOpen(false)}
        onImportComplete={fetchClients}
      />
    </div>
  )
} 