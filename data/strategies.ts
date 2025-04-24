export type Strategy = {
  id: string;
  name: string;
  type: string;
  period: string;
  dueDate: string;
  status: string;
  amount: string;
}

// Sample strategies data
export const strategies = [
  { 
    id: '1', 
    name: 'Bonus depreciation',
    type: 'Strategy',
    period: '2024',
    dueDate: '2024-12-31',
    status: 'on_track',
    amount: '$22,500'
  },
  { 
    id: '2', 
    name: 'Roth IRA backdoor',
    type: 'Strategy',
    period: 'Q2 2024',
    dueDate: '2024-04-15',
    status: 'filed',
    amount: '$8,400'
  },
  { 
    id: '3', 
    name: 'S-corp conversion',
    type: 'Strategy',
    period: 'Q3 2025',
    dueDate: '2025-10-01',
    status: 'action_needed',
    amount: '$12,800'
  },
  {
    id: '4',
    name: 'Home office deduction',
    type: 'Deduction',
    period: 'Q3 2025',
    dueDate: '2025-10-15',
    status: 'on_track',
    amount: '$3,600'
  },
  {
    id: '5',
    name: 'Professional development',
    type: 'Deduction',
    period: 'Q3 2025',
    dueDate: '2025-11-01',
    status: 'on_track',
    amount: '$1,800'
  },
  {
    id: '6',
    name: 'R&D tax credit',
    type: 'Strategy',
    period: 'Q3 2025',
    dueDate: '2025-11-15',
    status: 'on_track',
    amount: '$45,000'
  },
  {
    id: '7',
    name: 'Vehicle expenses',
    type: 'Deduction',
    period: 'Q4 2025',
    dueDate: '2025-12-01',
    status: 'action_needed',
    amount: '$6,200'
  },
  {
    id: '8',
    name: 'Employee retention credit',
    type: 'Strategy',
    period: 'Q4 2025',
    dueDate: '2025-12-15',
    status: 'on_track',
    amount: '$28,500'
  }
];

export const strategyDescriptions: { [key: string]: string } = {
  'Bonus depreciation': 
    'Bonus depreciation allows businesses to immediately deduct a large percentage of the purchase price of eligible assets, rather than writing them off over multiple years. This accelerated depreciation can provide significant tax savings in the year of purchase. The strategy is particularly effective for businesses investing in new equipment, machinery, or other qualifying property.',
  
  'Roth IRA backdoor':
    'The Backdoor Roth IRA is a legal strategy that allows high-income earners to create a Roth IRA despite income restrictions. This involves making a non-deductible contribution to a traditional IRA and then converting it to a Roth IRA. This strategy enables tax-free growth and qualified tax-free withdrawals in retirement.',
  
  'S-corp conversion':
    'Converting to an S-corporation can provide tax advantages by allowing business owners to split their income between salary and distributions. This strategy can potentially reduce self-employment taxes while maintaining the benefits of pass-through taxation. It requires careful planning to ensure compliance with IRS requirements for reasonable compensation.',
  
  'Home office deduction':
    'The home office deduction allows you to deduct expenses related to the business use of your home. This includes a portion of your rent or mortgage, utilities, insurance, and maintenance costs. To qualify, the space must be used regularly and exclusively for business purposes.',
  
  'Professional development':
    'Professional development expenses can be deducted when they maintain or improve skills required in your current business or profession. This includes courses, seminars, conferences, and related travel expenses. The deduction helps offset the costs of staying competitive and expanding your professional capabilities.',
  
  'R&D tax credit':
    'The Research and Development (R&D) tax credit provides a significant tax incentive for companies investing in innovation and technological advancement. This credit can be claimed for a wide range of development activities, including software development, product improvements, and manufacturing process innovations.',
  
  'Vehicle expenses':
    'Vehicle expense deductions allow you to write off costs associated with business use of your vehicle. This can be calculated using either the standard mileage rate or actual expenses method, including gas, maintenance, insurance, and depreciation.',
  
  'Employee retention credit':
    'The Employee Retention Credit (ERC) is a refundable tax credit designed to encourage businesses to keep employees on payroll. This credit can provide significant savings for eligible employers who maintained employees during qualifying periods.',
};

export const strategySteps: { [key: string]: string[] } = {
  'Bonus depreciation': [
    'Identify qualifying business property purchased this year',
    'Calculate the total purchase price of eligible assets',
    'Document business use percentage for each asset',
    'Consult with tax advisor to verify eligibility',
    'Maintain records of purchase dates and placed-in-service dates'
  ],
  'Roth IRA backdoor': [
    'Open a traditional IRA if you don\'t already have one',
    'Make a non-deductible contribution to the traditional IRA',
    'File Form 8606 to report the non-deductible contribution',
    'Convert the traditional IRA to a Roth IRA',
    'Keep detailed records of the conversion for tax reporting'
  ],
  'S-corp conversion': [
    'File Form 2553 to elect S-corporation status',
    'Set up payroll system for owner-employee compensation',
    'Establish reasonable salary based on market research',
    'Update accounting system for new corporate structure',
    'Create documentation supporting salary decisions'
  ],
  'Home office deduction': [
    'Measure the square footage of your home office space',
    'Calculate the percentage of home used for business',
    'Gather utility bills, insurance, and maintenance records',
    'Take photos documenting exclusive business use',
    'Track direct expenses related to the office space'
  ],
  'Professional development': [
    'Document the business purpose of each training expense',
    'Save receipts for courses, seminars, and conferences',
    'Record travel expenses related to professional education',
    'Link training to current business or profession',
    'Maintain certificates of completion when available'
  ],
  'R&D tax credit': [
    'Document all qualifying research activities',
    'Calculate qualified research expenses (QREs)',
    'Gather supporting documentation for each project',
    'Verify employee time allocation to R&D activities',
    'Complete Form 6765 for credit calculation'
  ],
  'Vehicle expenses': [
    'Choose between standard mileage or actual expense method',
    'Maintain detailed mileage log for business trips',
    'Track all vehicle-related expenses if using actual method',
    'Document business purpose for each trip',
    'Calculate business use percentage'
  ],
  'Employee retention credit': [
    'Verify eligibility requirements',
    'Calculate qualified wages for each employee',
    'Document revenue decline or suspension of operations',
    'Prepare quarterly credit calculations',
    'Maintain employee count documentation'
  ],
};

export const strategyResources: { [key: string]: Array<{ title: string; url: string }> } = {
  'Bonus depreciation': [
    { title: 'IRS Publication 946: How to Depreciate Property', url: '#' },
    { title: 'Section 179 vs. Bonus Depreciation Calculator', url: '#' },
    { title: 'Asset Depreciation Schedule Template', url: '#' }
  ],
  'Roth IRA backdoor': [
    { title: 'IRS Form 8606 Instructions', url: '#' },
    { title: 'Backdoor Roth IRA Conversion Worksheet', url: '#' },
    { title: 'IRA Contribution Limits Guide', url: '#' }
  ],
  'S-corp conversion': [
    { title: 'IRS Form 2553 Instructions', url: '#' },
    { title: 'S Corporation Compensation Requirements', url: '#' },
    { title: 'Reasonable Salary Documentation Guide', url: '#' }
  ],
  'Home office deduction': [
    { title: 'IRS Publication 587: Business Use of Your Home', url: '#' },
    { title: 'Home Office Deduction Calculator', url: '#' },
    { title: 'Home Office Expense Tracking Template', url: '#' }
  ],
  'Professional development': [
    { title: 'Education Expense Documentation Guide', url: '#' },
    { title: 'Business Purpose Statement Template', url: '#' },
    { title: 'Professional Development Expense Tracker', url: '#' }
  ],
  'R&D tax credit': [
    { title: 'IRS Guidelines for R&D Credit', url: '#' },
    { title: 'QRE Calculation Worksheet', url: '#' },
    { title: 'R&D Activity Documentation Template', url: '#' }
  ],
  'Vehicle expenses': [
    { title: 'IRS Publication 463: Travel & Vehicle Expenses', url: '#' },
    { title: 'Mileage Log Template', url: '#' },
    { title: 'Vehicle Expense Calculator', url: '#' }
  ],
  'Employee retention credit': [
    { title: 'ERC Eligibility Checklist', url: '#' },
    { title: 'Qualified Wages Calculator', url: '#' },
    { title: 'ERC Documentation Requirements', url: '#' }
  ],
}; 