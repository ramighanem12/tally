'use client'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import DisclaimerModal from './DisclaimerModal'

// Sample data - replace with real data later
const quarterlyData = [
  { quarter: 'Q1', federal: 10000, state: 2500 },
  { quarter: 'Q2', federal: 12000, state: 3000 },
  { quarter: 'Q3', federal: 11000, state: 2750 },
  { quarter: 'Q4', federal: 11500, state: 2750 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[payload.length - 1] // Get the currently hovered segment
    return (
      <div className="bg-[#1A1A1A] rounded-lg px-3 py-2">
        <div className="flex flex-col gap-[1px]">
          <span className="text-[11px] font-[600] text-white/60 tracking-wide">
            ESTIMATED PAYMENT
          </span>
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0" 
              style={{ backgroundColor: data.fill }}
            />
            <span className="text-[13px] font-medium text-white">
              {data.dataKey === 'federal' ? 'Federal' : 'State'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-[13px] text-white font-medium">
              ${data.value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const ExpandableRow = ({ 
  title, 
  amount, 
  status,
  isExpanded, 
  onToggle, 
  children 
}: { 
  title: string
  amount: string
  status?: string
  isExpanded?: boolean
  onToggle?: () => void
  children?: React.ReactNode
}) => {
  // Add helper function for status styling
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'on_track':
        return 'bg-[#E1EFFF] text-[#181818]';
      case 'action_needed':
        return 'bg-[#F2B8B6] text-[#181818]';
      case 'filed':
        return 'bg-[#B6F2E3] text-[#181818]';
      default:
        return '';
    }
  };

  return (
    <div className="border-t first:border-t-0 border-[#E4E5E1]">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {onToggle && (
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              className={`transition-transform ${isExpanded ? 'text-[#1A1A1A]' : 'text-[#A3A3A3]'} ${
                isExpanded ? 'rotate-90' : ''
              }`}
            >
              <path 
                fill="currentColor" 
                d="M6.5 12L10.5 8L6.5 4V12Z"
              />
            </svg>
          )}
          <span className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className={`px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] ${getStatusStyles(status)}`}>
              {status === 'on_track' ? 'On track' : 
               status === 'action_needed' ? 'Action needed' :
               status === 'filed' ? 'Completed' : status}
            </span>
          )}
          <span className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
            {amount}
          </span>
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ${
        isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

// Add this type for payment status
type PaymentStatus = 'paid' | 'not_paid' | 'due';

// Update the SubRow component to handle payment status
const SubRow = ({ 
  title, 
  amount,
  type = 'default',
  isCredit = false,
  paymentStatus,
  dueDate
}: { 
  title: string;
  amount: string;
  type?: 'default' | 'credit' | 'warning';
  isCredit?: boolean;
  paymentStatus?: PaymentStatus;
  dueDate?: string;
}) => {
  const getStyles = () => {
    switch(type) {
      case 'credit':
        return 'text-[#1A1A1A]';
      case 'warning':
        return 'text-[#DC2626]';
      default:
        return 'text-[#1A1A1A]';
    }
  };

  const getStatusPill = () => {
    if (!paymentStatus) return null;

    const statusStyles: Record<PaymentStatus, string> = {
      paid: 'bg-[#B6F2E3] text-[#181818]',
      not_paid: 'bg-[#F2B8B6] text-[#181818]',
      due: 'bg-[#EFEFED] text-[#1A1A1A]'
    };

    const pillContent = () => {
      switch(paymentStatus) {
        case 'paid':
          return 'Paid';
        case 'not_paid':
          return 'Not paid';
        case 'due':
          return `Due ${dueDate}`;
      }
    };

    return (
      <span className={`mr-2 px-2 py-0.5 rounded-[6px] font-['Inter'] font-[450] text-[13px] leading-[18px] ${statusStyles[paymentStatus]}`}>
        {pillContent()}
      </span>
    );
  };

  return (
    <div className={`flex items-center justify-between pl-6 pr-3 py-2.5 border-t border-[#E4E5E1] hover:bg-[#F7F7F6] transition-colors ${isCredit ? 'bg-[#F7F7F6]' : ''} ${getStyles()}`}>
      <span className={`text-[14px] leading-[20px] font-['Inter']`}>
        {title}
      </span>
      <div className="flex items-center">
        {getStatusPill()}
        <span className={`text-[14px] leading-[20px] font-['Inter']`}>
          {amount}
        </span>
      </div>
    </div>
  );
};

// Add a new component for grouped sub-items
const SubRowGroup = ({
  title,
  items,
}: {
  title?: string
  items: Array<{
    label: string
    amount: string
    highlight?: boolean
  }>
}) => (
  <div className="border-t border-[#E4E5E1]">
    {title && (
      <div className="px-3 pl-8 py-2 bg-[#F7F7F6]">
        <span className="text-[13px] leading-[18px] font-medium font-['Inter'] text-[#646462]">
          {title}
        </span>
      </div>
    )}
    <div className="divide-y divide-[#E4E5E1]">
      {items.map((item, i) => (
        <div 
          key={i}
          className={`flex items-center justify-between px-3 pl-8 py-2.5 ${
            item.highlight ? 'bg-[#F7F7F6]' : ''
          }`}
        >
          <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
            {item.label}
          </span>
          <span className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
            {item.amount}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// Update the TabSwitcher component's className
const TabSwitcher = ({ 
  tabs, 
  activeTab, 
  onChange 
}: { 
  tabs: Array<{id: string; label: string}>; 
  activeTab: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex gap-1.5">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-2.5 py-1 rounded-md text-[13px] leading-[18px] font-medium font-['Inter'] transition-colors ${
          activeTab === tab.id
            ? 'bg-[#EFEFED] text-[#1A1A1A]'
            : 'text-[#646462] hover:bg-[#EFEFED] hover:text-[#1A1A1A]'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

const QuarterlyTaxes = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>('liability')
  const [activeJurisdictionTab, setActiveJurisdictionTab] = useState('federal')
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false)

  return (
    <div className="space-y-3">
      {/* Top card */}
      <div className="bg-white rounded-[10px] border border-[#E4E5E1]">
        <div className="flex flex-col">
          {/* Card header */}
          {/* Commenting out the header
          <div className="flex items-center justify-between px-3 py-[10px] border-b border-[#E4E5E1]">
            <h3 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
              Estimated quarterly tax payments
            </h3>
          </div>
          */}

          {/* Chart section */}
          <div className="px-3 pt-6 pb-3">
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="quarter"
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fontSize: 12,
                      fontFamily: 'Inter',
                      fill: '#646462'
                    }}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'transparent' }}
                    separator=""
                    shared={false}
                  />
                  <Bar 
                    dataKey="federal" 
                    stackId="a"
                    fill="#2563EB"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="state" 
                    stackId="a"
                    fill="#93C5FD"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Add this between the top chart card and bottom expandable card */}
      <div className="flex items-center justify-between pt-4 mb-3">
        <h2 className="text-[16px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A]">
          Estimated tax payment plan
        </h2>
      </div>

      {/* Add the Federal/State tab switcher */}
      <TabSwitcher 
        tabs={[
          { id: 'federal', label: 'Federal' },
          { id: 'state', label: 'State' }
        ]} 
        activeTab={activeJurisdictionTab}
        onChange={setActiveJurisdictionTab}
      />

      {/* Bottom card */}
      <div className="border border-[#E4E5E1] rounded-[10px] overflow-hidden bg-white">
        <ExpandableRow 
          title="Projected total income" 
          amount="$250,000"
        />
        <ExpandableRow 
          title="Projected federal tax liability" 
          amount="$55,500"
          status="on_track"
          isExpanded={expandedRow === 'liability'}
          onToggle={() => setExpandedRow(expandedRow === 'liability' ? null : 'liability')}
        >
          <div className="border-b border-[#E4E5E1] bg-[#F9FAFB]">
            <SubRow title="Overpayment from prior year" amount="$2,500" type="credit" />
            <SubRow title="Federal withholding" amount="$35,000" type="credit" />
          </div>
          
          <SubRow 
            title="Q1 payment" 
            amount="$12,500" 
            paymentStatus="paid"
          />
          <SubRow 
            title="Q2 payment" 
            amount="$15,000" 
            paymentStatus="not_paid"
          />
          <SubRow 
            title="Q3 payment" 
            amount="$13,750" 
            paymentStatus="due"
            dueDate="Sep 15, 2024"
          />
          <SubRow 
            title="Q4 payment" 
            amount="$14,250" 
            paymentStatus="due"
            dueDate="Dec 15, 2024"
          />
          
          <SubRow title="Q1 additional payment" amount="$0" />
          <SubRow title="Q2 additional payment" amount="$0" />
          <SubRow title="Q3 additional payment" amount="$0" />
          <SubRow title="Q4 additional payment" amount="$0" />
          
          <SubRow title="Other tax payments" amount="$0" type="credit" />
          <SubRow title="Underpayment penalty" amount="$0" type="warning" />
        </ExpandableRow>
        <ExpandableRow 
          title="Remaining tax due" 
          amount="$0"
        />
      </div>

      {/* Add disclaimer at the bottom */}
      <div className="mt-3">
        <p className="text-[12px] leading-[18px] font-['Inter'] font-[450] text-[#858585]">
          All tax planning, strategies, advice and recommendations in this plan are based on the taxpayer's available tax return data, information disclosed to us, and current tax law. Tax laws can and do change frequently. Federal, state, local, payroll, property and other taxes often overlap and involve complexities that rarely yield a single best strategy. Effective tax planning is a lifelong process. It requires regular updates to review the taxpayer's goals, life changes, investments, businesses, changes in income, pre-tax opportunities, retirement planning, state and local taxation, and more. <button onClick={() => setIsDisclaimerModalOpen(true)} className="text-[#1A1A1A] underline inline">View complete disclaimer</button>.
        </p>
      </div>

      <DisclaimerModal 
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />
    </div>
  )
}

export default QuarterlyTaxes 