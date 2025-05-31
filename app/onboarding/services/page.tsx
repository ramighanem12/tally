'use client'
import '../onboarding.css'
import CopilotNavigation from "../../components/CopilotNavigation"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import SlidePanel from '@/components/SlidePanel'
import ServicesPanel from '@/components/ServicesPanel'

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected?: boolean;
}

const packages: Service[] = [
  {
    id: '1',
    title: 'Standard',
    description: 'C corp, multi member, or LLC or S corp',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" className="text-gray-500">
        <path fill="currentColor" d="M 3 3 A 1.0001 1.0001 0 0 0 2 4 L 2 20 A 1.0001 1.0001 0 0 0 3 21 L 15 21 L 21 21 A 1.0001 1.0001 0 0 0 22 20 L 22 8 A 1.0001 1.0001 0 0 0 21 7 L 16 7 L 16 4 A 1.0001 1.0001 0 0 0 15 3 L 3 3 z M 4 5 L 14 5 L 14 7.8320312 A 1.0001 1.0001 0 0 0 14 8.1582031 L 14 19 L 4 19 L 4 5 z M 6 7 L 6 9 L 8 9 L 8 7 L 6 7 z M 10 7 L 10 9 L 12 9 L 12 7 L 10 7 z M 16 9 L 20 9 L 20 19 L 16 19 L 16 17 L 18 17 L 18 15 L 16 15 L 16 13 L 18 13 L 18 11 L 16 11 L 16 9 z M 6 11 L 6 13 L 8 13 L 8 11 L 6 11 z M 10 11 L 10 13 L 12 13 L 12 11 L 10 11 z M 6 15 L 6 17 L 8 17 L 8 15 L 6 15 z M 10 15 L 10 17 L 12 17 L 12 15 L 10 15 z"/>
      </svg>
    )
  },
  {
    id: '2',
    title: 'Single Member LLC/Personal',
    description: 'Personal tax return and state filing',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" className="text-gray-500">
        <path fill="currentColor" d="M 12 2 C 9.8026661 2 8 3.8026661 8 6 L 8 7 C 8 9.1973339 9.8026661 11 12 11 C 14.197334 11 16 9.1973339 16 7 L 16 6 C 16 3.8026661 14.197334 2 12 2 z M 12 4 C 13.116666 4 14 4.8833339 14 6 L 14 7 C 14 8.1166661 13.116666 9 12 9 C 10.883334 9 10 8.1166661 10 7 L 10 6 C 10 4.8833339 10.883334 4 12 4 z M 10 13 A 1.0001 1.0001 0 0 0 9.7578125 13.029297 C 5.3773645 14.124409 3.1679688 17.445312 3.1679688 17.445312 A 1.0001 1.0001 0 0 0 3 18 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 18 A 1.0001 1.0001 0 0 0 20.832031 17.445312 C 20.832031 17.445312 18.622636 14.124409 14.242188 13.029297 A 1.0001 1.0001 0 0 0 14 13 L 10 13 z M 10.167969 15 L 13.832031 15 C 17.170776 15.866885 18.791999 18.078166 19 18.373047 L 19 19 L 5 19 L 5 18.373047 C 5.2080008 18.078166 6.8292234 15.866885 10.167969 15 z"/>
      </svg>
    )
  }
];

const ancillaryServices = [
  { id: 'advisor', title: 'Dedicated tax advisor', price: null, alwaysDisabled: true },
  { id: 'rd', title: 'R&D Credit Study', price: '7.5% of credit' },
  { id: 'tp', title: 'Transfer Pricing Study', price: null, showPricingOnRequest: true },
  { id: 'personal', title: 'Personal Tax Return', price: '1,749' },
  { id: 'sut_returns', title: 'Sales and Use Tax Returns', price: '75 per return' },
  { id: 'sut_permit', title: 'Sales and Use Tax Permit', price: '150 per permit' },
  { id: 'sut_study', title: 'Sales and Use Tax Study', price: null, showPricingOnRequest: true },
  { id: 'extensions', title: 'Federal and State Tax Extensions', price: null },
  { id: 'sf', title: 'SF Gross Receipts Tax Return', price: null },
  { id: 'delaware', title: 'Delaware Franchise Tax Return and Estimates', price: null }
];

function PackageCards() {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [includePersonalTax, setIncludePersonalTax] = useState(false);
  const [selectedAncillaryServices, setSelectedAncillaryServices] = useState<string[]>([]);
  const [isServicesPanelOpen, setIsServicesPanelOpen] = useState(false);

  const toggleAncillaryService = (serviceId: string) => {
    setSelectedAncillaryServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const togglePackage = (packageId: string) => {
    setSelectedPackages([packageId]);
  };

  const getPrice = (packageId: string) => {
    if (packageId === '1') {
      return '2,499';
    }
    return '1,999';
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        {packages.map((pkg) => {
          const isSelected = selectedPackages.includes(pkg.id);
          return (
            <div
              key={pkg.id}
              onClick={() => togglePackage(pkg.id)}
              className={`
                bg-white border rounded-lg px-5 py-4 transition-all duration-300 
                hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] 
                cursor-pointer relative group
                ${isSelected ? 'border-gray-900' : 'border-gray-200'}
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-900">
                    <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                  </svg>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  {pkg.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-medium text-gray-900">{pkg.title}</h3>
                    <div className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      ${getPrice(pkg.id)}
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-1">{pkg.description}</p>
                  <ul className="mt-2 space-y-1">
                    {pkg.id === '1' ? (
                      <>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          Federal income tax return (form 1120, 1120S, or 1065)
                        </li>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          Up to two Sch. K-1s
                        </li>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          One state income tax return
                        </li>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          One city income tax return
                        </li>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          10 Forms 1099-NEC/MISC/INT
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          Personal tax return
                        </li>
                        <li className="text-[13px] text-gray-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          One state income tax return
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h3 className="text-[15px] font-[500] text-gray-600 mb-4">Ancillary services</h3>
        <div className="grid grid-cols-5 gap-3">
          {ancillaryServices.map((service) => {
            const isSelected = selectedAncillaryServices.includes(service.id);
            const isDisabled = (service.id === 'personal' && selectedPackages[0] === '2') || service.alwaysDisabled;
            return (
              <div
                key={service.id}
                onClick={() => !isDisabled && toggleAncillaryService(service.id)}
                className={`
                  bg-white border rounded-lg p-3 transition-all duration-300 
                  ${!isDisabled ? 'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer' : 'opacity-50 cursor-not-allowed'} 
                  relative
                  ${isSelected ? 'border-gray-900' : 'border-gray-200'}
                `}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-[13px] font-medium text-gray-900">{service.title}</h4>
                      {service.alwaysDisabled && (
                        <span className="text-[12px] font-medium text-[#1D4ED8] bg-[#EBF3FE] px-1.5 py-[1px] rounded inline-flex items-center gap-1 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#1D4ED8]">
                            <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                          </svg>
                          Included
                        </span>
                      )}
                    </div>
                    {isSelected && !isDisabled && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-900 flex-shrink-0">
                        <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"/>
                      </svg>
                    )}
                  </div>
                  {service.price && (
                    <div className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded self-start">
                      {service.id === 'rd' ? '' : '$'}{service.price}
                    </div>
                  )}
                  {service.showPricingOnRequest && (
                    <div className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded self-start">
                      Pricing on request
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[13px] text-gray-500 mt-4">
          Additional services like foreign forms, additional forms, Schedule K-1s, sales/use tax permit registrations, and other tax projects can be requested later. You can add more services at any time.{' '}
          <button 
            onClick={() => setIsServicesPanelOpen(true)}
            className="text-gray-900 underline hover:text-gray-700 transition-colors"
          >
            View services
          </button>
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            // Handle continue
          }}
          disabled={selectedPackages.length === 0}
        >
          Save choice
        </button>
      </div>

      <SlidePanel
        isOpen={isServicesPanelOpen}
        onClose={() => setIsServicesPanelOpen(false)}
        title="Available Services"
      >
        <ServicesPanel />
      </SlidePanel>
    </>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="onboarding" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-y-auto">
          <div className="px-[155px] py-4 mt-6">
            {/* Header with breadcrumb */}
            <div className="mb-8 flex items-center gap-2">
              <span className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                Onboarding
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                className="text-[#646462]"
              >
                <path 
                  fill="currentColor" 
                  d="M11.109,3L11.109,3C9.78,3,8.988,4.481,9.725,5.587L14,12l-4.275,6.413C8.988,19.519,9.78,21,11.109,21h0 c0.556,0,1.076-0.278,1.385-0.741l4.766-7.15c0.448-0.672,0.448-1.547,0-2.219l-4.766-7.15C12.185,3.278,11.666,3,11.109,3z"
                />
              </svg>
              <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] font-[500]">
                Services
              </span>
            </div>

            {/* Services Content */}
            <div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-[15px] font-[500] text-gray-600 mb-4">
                        Package
                      </h2>
                    </div>
                  </div>
                  <PackageCards />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 