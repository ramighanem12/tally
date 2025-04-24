'use client'
import { useState } from 'react'
import { format } from 'date-fns'

// Types
type DateOption = 'all' | 'today' | 'tomorrow' | 'next-7-days' | 'next-30-days' | 'next-90-days' | 'this-month' | 'next-month' | 'this-quarter';
type FilterType = {
  label: string;
  color: string;
};

interface PlanFiltersProps {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
  selectedStatusFilters: string[];
  setSelectedStatusFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
  selectedResponsibleFilters: string[];
  setSelectedResponsibleFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
  dateRange: {start: Date | null, end: Date | null};
  setDateRange: (range: {start: Date | null, end: Date | null}) => void;
  selectedDateOption: DateOption;
  setSelectedDateOption: (option: DateOption) => void;
}

export default function PlanFilters({
  selectedFilters,
  setSelectedFilters,
  selectedStatusFilters,
  setSelectedStatusFilters,
  selectedResponsibleFilters,
  setSelectedResponsibleFilters,
  dateRange,
  setDateRange,
  selectedDateOption,
  setSelectedDateOption,
}: PlanFiltersProps) {
  // Local state for dropdowns
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isResponsibleFilterOpen, setIsResponsibleFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  return (
    <div className="-mx-6 px-6">
      <div className="flex gap-2 mb-6">
        {/* Type filter */}
        <div className="relative">
          <button 
            className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M20,3H4C3.447,3,3,3.448,3,4v2c0,0.239,0.085,0.47,0.241,0.651L9,13.37V19c0,0.379,0.214,0.725,0.553,0.895l4,2	C13.694,21.965,13.847,22,14,22c0.183,0,0.365-0.05,0.525-0.149C14.82,21.668,15,21.347,15,21v-7.63l5.759-6.719	C20.915,6.47,21,6.239,21,6V4C21,3.448,20.553,3,20,3z"></path>
            </svg>
            Type: {selectedFilters.length === 0 ? 'All' : 
              selectedFilters.length === 1 ? selectedFilters[0] : 
              `${selectedFilters.length} selected`}
          </button>

          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E5E1] w-[200px] p-2 z-20">
                <div className="space-y-[2px]">
                  <button
                    className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                      selectedFilters.length === 0 ? 'bg-[#F7F7F7]' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFilters([]);
                      setIsFilterOpen(false);
                    }}
                  >
                    All
                    {selectedFilters.length === 0 && (
                      <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                      </svg>
                    )}
                  </button>
                  {[
                    { label: 'Sales tax', color: '#FF9966' },
                    { label: 'Corporate tax', color: '#9966CC' },
                    { label: 'Advisor meeting', color: '#66CC99' },
                    { label: 'Estimated payments', color: '#2196F3' },
                    { label: 'Payroll tax', color: '#4CAF50' }
                  ].map((type) => (
                    <button
                      key={type.label}
                      className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                        selectedFilters.includes(type.label) ? 'bg-[#F7F7F7]' : ''
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedFilters(prev => 
                          prev.includes(type.label)
                            ? prev.filter(f => f !== type.label)
                            : [...prev, type.label]
                        );
                      }}
                    >
                      <div 
                        className="w-[6px] h-[6px] rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.label}
                      {selectedFilters.includes(type.label) && (
                        <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                          <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button 
            className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center gap-2"
            onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M20,3H4C3.447,3,3,3.448,3,4v2c0,0.239,0.085,0.47,0.241,0.651L9,13.37V19c0,0.379,0.214,0.725,0.553,0.895l4,2	C13.694,21.965,13.847,22,14,22c0.183,0,0.365-0.05,0.525-0.149C14.82,21.668,15,21.347,15,21v-7.63l5.759-6.719	C20.915,6.47,21,6.239,21,6V4C21,3.448,20.553,3,20,3z"></path>
            </svg>
            Status: {selectedStatusFilters.length === 0 ? 'All' : 
              selectedStatusFilters.length === 1 ? selectedStatusFilters[0] : 
              `${selectedStatusFilters.length} selected`}
          </button>

          {isStatusFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsStatusFilterOpen(false)}
              />
              
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E5E1] w-[200px] p-2 z-20">
                <div className="space-y-[2px]">
                  <button
                    className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                      selectedStatusFilters.length === 0 ? 'bg-[#F7F7F7]' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStatusFilters([]);
                      setIsStatusFilterOpen(false);
                    }}
                  >
                    All
                    {selectedStatusFilters.length === 0 && (
                      <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                      </svg>
                    )}
                  </button>
                  {[
                    'Action needed',
                    'On track',
                    'Completed'
                  ].map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                        selectedStatusFilters.includes(status) ? 'bg-[#F7F7F7]' : ''
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedStatusFilters(prev => 
                          prev.includes(status)
                            ? prev.filter(f => f !== status)
                            : [...prev, status]
                        );
                      }}
                    >
                      {status}
                      {selectedStatusFilters.includes(status) && (
                        <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                          <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Responsible filter */}
        <div className="relative">
          <button 
            className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center gap-2"
            onClick={() => setIsResponsibleFilterOpen(!isResponsibleFilterOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M20,3H4C3.447,3,3,3.448,3,4v2c0,0.239,0.085,0.47,0.241,0.651L9,13.37V19c0,0.379,0.214,0.725,0.553,0.895l4,2	C13.694,21.965,13.847,22,14,22c0.183,0,0.365-0.05,0.525-0.149C14.82,21.668,15,21.347,15,21v-7.63l5.759-6.719	C20.915,6.47,21,6.239,21,6V4C21,3.448,20.553,3,20,3z"></path>
            </svg>
            Company
          </button>

          {isResponsibleFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsResponsibleFilterOpen(false)}
              />
              
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E5E1] w-[200px] p-2 z-20">
                <div className="space-y-[2px]">
                  <button
                    className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                      selectedResponsibleFilters.length === 0 ? 'bg-[#F7F7F7]' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResponsibleFilters([]);
                      setIsResponsibleFilterOpen(false);
                    }}
                  >
                    All
                    {selectedResponsibleFilters.length === 0 && (
                      <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                      </svg>
                    )}
                  </button>
                  {[
                    'Tally',
                    'Payroll',
                    'Company'
                  ].map((responsible) => (
                    <button
                      key={responsible}
                      className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                        selectedResponsibleFilters.includes(responsible) ? 'bg-[#F7F7F7]' : ''
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedResponsibleFilters(prev => 
                          prev.includes(responsible)
                            ? prev.filter(f => f !== responsible)
                            : [...prev, responsible]
                        );
                      }}
                    >
                      {responsible}
                      {selectedResponsibleFilters.includes(responsible) && (
                        <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                          <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date filter */}
        <div className="relative">
          <button 
            className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center gap-2"
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M 7 1 C 6.448 1 6 1.448 6 2 L 6 3 L 5 3 C 3.9 3 3 3.9 3 5 L 3 19 C 3 20.1 3.9 21 5 21 L 19 21 C 20.1 21 21 20.1 21 19 L 21 5 C 21 3.9 20.1 3 19 3 L 18 3 L 18 2 C 18 1.448 17.552 1 17 1 C 16.448 1 16 1.448 16 2 L 16 3 L 8 3 L 8 2 C 8 1.448 7.552 1 7 1 z M 5 8 L 19 8 L 19 18 C 19 18.552 18.552 19 18 19 L 6 19 C 5.448 19 5 18.552 5 18 L 5 8 z" />
            </svg>
            Date: {selectedDateOption === 'all' ? 'All' : 
              selectedDateOption === 'today' ? 'Today' :
              selectedDateOption === 'tomorrow' ? 'Tomorrow' :
              selectedDateOption === 'next-7-days' ? 'Next 7 days' :
              selectedDateOption === 'next-30-days' ? 'Next 30 days' :
              selectedDateOption === 'next-90-days' ? 'Next 90 days' :
              selectedDateOption === 'this-month' ? 'This month' :
              selectedDateOption === 'next-month' ? 'Next month' :
              'This quarter'
            }
          </button>

          {isDateFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsDateFilterOpen(false)}
              />
              
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E5E1] w-[240px] p-2 z-20">
                <div className="space-y-[2px]">
                  <button
                    className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                      selectedDateOption === 'all' ? 'bg-[#F7F7F7]' : ''
                    }`}
                    onClick={() => {
                      setSelectedDateOption('all');
                      setDateRange({ start: null, end: null });
                      setIsDateFilterOpen(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-[#1A1A1A]">
                      <path fill="currentColor" d="M 7 1 C 6.448 1 6 1.448 6 2 L 6 3 L 5 3 C 3.9 3 3 3.9 3 5 L 3 19 C 3 20.1 3.9 21 5 21 L 19 21 C 20.1 21 21 20.1 21 19 L 21 5 C 21 3.9 20.1 3 19 3 L 18 3 L 18 2 C 18 1.448 17.552 1 17 1 C 16.448 1 16 1.448 16 2 L 16 3 L 8 3 L 8 2 C 8 1.448 7.552 1 7 1 z M 5 8 L 19 8 L 19 18 C 19 18.552 18.552 19 18 19 L 6 19 C 5.448 19 5 18.552 5 18 L 5 8 z" />
                    </svg>
                    All dates
                    {selectedDateOption === 'all' && (
                      <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                      </svg>
                    )}
                  </button>

                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: 'next-7-days', label: 'Next 7 days' },
                    { id: 'next-30-days', label: 'Next 30 days' },
                    { id: 'next-90-days', label: 'Next 90 days' },
                    { id: 'this-month', label: 'This month' },
                    { id: 'next-month', label: 'Next month' },
                    { id: 'this-quarter', label: 'This quarter' }
                  ].map(option => (
                    <button
                      key={option.id}
                      className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                        selectedDateOption === option.id ? 'bg-[#F7F7F7]' : ''
                      }`}
                      onClick={() => {
                        setSelectedDateOption(option.id as DateOption);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        switch(option.id) {
                          case 'today': {
                            setDateRange({ start: today, end: today });
                            break;
                          }
                          case 'tomorrow': {
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            setDateRange({ start: tomorrow, end: tomorrow });
                            break;
                          }
                          case 'next-7-days': {
                            const end = new Date(today);
                            end.setDate(end.getDate() + 7);
                            setDateRange({ start: today, end });
                            break;
                          }
                          case 'next-30-days': {
                            const end = new Date(today);
                            end.setDate(end.getDate() + 30);
                            setDateRange({ start: today, end });
                            break;
                          }
                          case 'next-90-days': {
                            const end = new Date(today);
                            end.setDate(end.getDate() + 90);
                            setDateRange({ start: today, end });
                            break;
                          }
                          case 'this-month': {
                            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                            setDateRange({ start: today, end });
                            break;
                          }
                          case 'next-month': {
                            const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                            const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
                            setDateRange({ start, end });
                            break;
                          }
                          case 'this-quarter': {
                            const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
                            const end = new Date(today.getFullYear(), quarterMonth + 3, 0);
                            setDateRange({ start: today, end });
                            break;
                          }
                          default: {
                            setDateRange({ start: null, end: null });
                          }
                        }
                        setIsDateFilterOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-[#1A1A1A]">
                        <path fill="currentColor" d="M 7 1 C 6.448 1 6 1.448 6 2 L 6 3 L 5 3 C 3.9 3 3 3.9 3 5 L 3 19 C 3 20.1 3.9 21 5 21 L 19 21 C 20.1 21 21 20.1 21 19 L 21 5 C 21 3.9 20.1 3 19 3 L 18 3 L 18 2 C 18 1.448 17.552 1 17 1 C 16.448 1 16 1.448 16 2 L 16 3 L 8 3 L 8 2 C 8 1.448 7.552 1 7 1 z M 5 8 L 19 8 L 19 18 C 19 18.552 18.552 19 18 19 L 6 19 C 5.448 19 5 18.552 5 18 L 5 8 z" />
                      </svg>
                      {option.label}
                      {selectedDateOption === option.id && (
                        <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                          <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reset all button - only show if filters are active */}
        {(selectedFilters.length > 0 || 
          selectedStatusFilters.length > 0 || 
          selectedResponsibleFilters.length > 0 || 
          selectedDateOption !== 'all') && (
          <button 
            className="bg-white hover:bg-[#F7F7F7] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors border border-[#E4E5E1]"
            onClick={() => {
              setSelectedFilters([]);
              setSelectedStatusFilters([]);
              setSelectedResponsibleFilters([]);
              setSelectedDateOption('all');
              setDateRange({ start: null, end: null });
            }}
          >
            Reset all
          </button>
        )}
      </div>
    </div>
  );
} 