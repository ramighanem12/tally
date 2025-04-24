'use client'
import { useState } from 'react'

interface Service {
  id: string;
  title: string;
  description: string;
  price: string | null;
  showPricingOnRequest?: boolean;
}

const services: Service[] = [
  {
    id: 'rd',
    title: 'R&D Credit Study',
    description: 'Maximize your tax savings with our comprehensive R&D credit analysis. We help identify qualifying activities and expenses.',
    price: '7.5% of credit'
  },
  {
    id: 'tp',
    title: 'Transfer Pricing Study',
    description: 'Ensure compliance with transfer pricing regulations and optimize your international tax strategy.',
    price: null,
    showPricingOnRequest: true
  },
  {
    id: 'personal',
    title: 'Personal Tax Return',
    description: 'Complete personal tax return preparation including all necessary schedules and forms.',
    price: '1,749'
  },
  {
    id: 'sut_returns',
    title: 'Sales and Use Tax Returns',
    description: 'Stay compliant with state and local tax obligations with our sales and use tax return preparation service.',
    price: '75 per return'
  },
  {
    id: 'sut_permit',
    title: 'Sales and Use Tax Permit',
    description: 'Get assistance with obtaining and maintaining sales tax permits in all required jurisdictions.',
    price: '150 per permit'
  },
  {
    id: 'sut_study',
    title: 'Sales and Use Tax Study',
    description: 'Comprehensive analysis of your sales and use tax obligations and opportunities for optimization.',
    price: null,
    showPricingOnRequest: true
  },
  {
    id: 'extensions',
    title: 'Federal and State Tax Extensions',
    description: 'Timely filing of federal and state tax extensions to ensure compliance and avoid penalties.',
    price: '299'
  },
  {
    id: 'sf',
    title: 'SF Gross Receipts Tax Return',
    description: 'Specialized service for San Francisco businesses to comply with local tax requirements.',
    price: '499'
  },
  {
    id: 'delaware',
    title: 'Delaware Franchise Tax Return',
    description: 'Expert preparation of Delaware franchise tax returns and estimated payments.',
    price: '399'
  }
];

export default function ServicesPanel() {
  return (
    <div className="space-y-6">
      <p className="text-[13px] text-gray-500">
        Browse our comprehensive suite of tax and accounting services. Select the services you need or contact us for custom solutions.
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-all"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-[15px] font-medium text-gray-900">{service.title}</h3>
              <p className="text-[13px] text-gray-500">{service.description}</p>
              <div className="flex items-center gap-2">
                {service.price ? (
                  <div className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    ${service.price}
                  </div>
                ) : service.showPricingOnRequest ? (
                  <div className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    Pricing on request
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 