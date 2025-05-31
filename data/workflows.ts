export enum WorkflowInputType {
  DOCUMENT_UPLOAD = 'document_upload',
  SELECT = 'select',
  TEXT = 'text',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  CLIENT_SELECT = 'client_select'
}

export interface WorkflowInput {
  id: string;
  type: WorkflowInputType;
  label?: string;
  description?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  documentTypes?: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  order_index: number;
}

export type WorkflowStatus = "active" | "draft" | "not_started";

export interface Workflow {
  id: string;
  slug: string;
  title: string;
  description: string;
  description_long?: string;
  category: string;
  type: string | string[];
  steps: number;
  status: WorkflowStatus;
  inputs: WorkflowInput[];
  workflow_steps?: WorkflowStep[];
}

export const taxWorkflows: Workflow[] = [
  {
    id: '1040',
    slug: '1040',
    title: '1040 tax return',
    description: 'Prepare and file individual federal income tax returns with automated calculations and compliance checks.',
    category: 'Personal income tax',
    type: 'tax',
    steps: 13,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Documents',
        documentTypes: [
          'Prior Year Return',
          'Financial Documents',
        ],
        acceptedFileTypes: ['.pdf', '.jpg', '.png'],
        multiple: true,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'tax-year',
        type: WorkflowInputType.SELECT,
        label: 'Tax Year',
        required: true,
        options: [
          { label: '2023', value: '2023' },
          { label: '2022', value: '2022' },
          { label: '2021', value: '2021' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ],
    workflow_steps: [
      { id: '1', name: 'Review prior year return', order_index: 1 },
      { id: '2', name: 'Analyze current year documents', order_index: 2 },
      // ... add more steps as needed
    ]
  },
  /* Comment out R&D credit workflow
  {
    id: 'rd-credit',
    title: 'R&D credit analysis',
    description: 'Calculate federal and state R&D tax credits by analyzing qualified research activities and expenses.',
    status: 'active',
    type: 'tax',
    steps: 8,
    stepDefinitions: [
      { id: 1, text: 'Identifying qualifying research activities' },
      { id: 2, text: 'Gathering project documentation' },
      { id: 3, text: 'Analyzing qualified research expenses' },
      { id: 4, text: 'Calculating wage expenses' },
      { id: 5, text: 'Evaluating supply costs' },
      { id: 6, text: 'Computing contract research expenses' },
      { id: 7, text: 'Preparing credit calculations' },
      { id: 8, text: 'Documenting findings and support' }
    ],
    inputs: [
      {
        id: 'documents',
        type: 'document_upload',
        label: 'Upload Documents',
        documentTypes: [
          'Research Reports',
          'Project Documentation',
          'Expense Reports',
          'Other R&D Documents'
        ],
        acceptedFileTypes: ['.pdf', '.xlsx', '.doc', '.docx'],
        multiple: true,
        required: true
      },
      {
        id: 'client',
        type: 'client_select',
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'context',
        type: 'text',
        label: 'Add additional context for Modus',
        required: false
      }
    ],
    category: 'R&D tax credits'
  },
  */
  {
    id: 'sales-tax-vda',
    slug: 'sales-tax-vda',
    title: 'Sales tax VDA',
    description: 'Submit voluntary disclosure agreements to resolve past sales tax liabilities with reduced penalties.',
    category: 'Sales tax',
    type: 'tax',
    steps: 7,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Documents',
        documentTypes: [
          'Sales Tax Returns',
          'Exemption Certificates',
          'Sales Records',
          'Supporting Documentation'
        ],
        acceptedFileTypes: ['.xlsx', '.csv'],
        multiple: false,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'states',
        type: WorkflowInputType.SELECT,
        label: 'What state is this for?',
        description: 'Select the state where you want to file a VDA',
        required: true,
        multiple: false,
        options: [
          { label: 'California', value: 'CA' },
          { label: 'New York', value: 'NY' },
          { label: 'Texas', value: 'TX' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ],
    workflow_steps: [
      { id: '1', name: 'Review sales tax returns', order_index: 1 },
      { id: '2', name: 'Analyze exemption certificates', order_index: 2 },
      { id: '3', name: 'Assess sales records', order_index: 3 },
      { id: '4', name: 'Prepare supporting documentation', order_index: 4 },
      { id: '5', name: 'Submit VDA', order_index: 5 },
      { id: '6', name: 'Document compliance', order_index: 6 },
      { id: '7', name: 'Assess penalties', order_index: 7 }
    ]
  },
  {
    id: 'sales-tax-study',
    slug: 'sales-tax-study',
    title: 'Sales tax nexus study',
    description: 'Evaluate multi-state sales tax obligations based on economic and physical presence thresholds.',
    category: 'Sales tax',
    type: 'tax',
    steps: 6,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Documents',
        documentTypes: [
          'Revenue Data',
          'Business Activities',
          'Supporting Documentation'
        ],
        acceptedFileTypes: ['.xlsx', '.csv'],
        multiple: false,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'business-activities',
        type: WorkflowInputType.CHECKBOX,
        label: "What are this business's activities?",
        description: 'Select all business activities that apply',
        required: true,
        options: [
          { label: 'Physical office locations', value: 'physical_office' },
          { label: 'Remote employees', value: 'remote_employees' },
          { label: 'Inventory storage', value: 'inventory' },
          { label: 'Trade show attendance', value: 'trade_shows' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ],
    workflow_steps: [
      { id: '1', name: 'Review revenue data', order_index: 1 },
      { id: '2', name: 'Analyze business activities', order_index: 2 },
      { id: '3', name: 'Assess economic nexus', order_index: 3 },
      { id: '4', name: 'Evaluate physical presence', order_index: 4 },
      { id: '5', name: 'Document findings', order_index: 5 },
      { id: '6', name: 'Assess compliance requirements', order_index: 6 }
    ]
  },
  {
    id: 'personal-income-tax-review',
    slug: 'personal-income-tax-review',
    title: 'Personal income tax return review',
    description: 'Review individual tax returns for accuracy, missed deductions, and potential audit triggers.',
    category: 'Personal income tax',
    type: ['tax', 'advisory'],
    steps: 7,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Documents',
        documentTypes: [
          'Tax Returns',
          'Income Statements',
          'Deductions',
          'Other Tax Documents'
        ],
        acceptedFileTypes: ['.pdf', '.jpg', '.png'],
        multiple: true,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'review-years',
        type: WorkflowInputType.RADIO,
        label: 'What year are you reviewing?',
        required: true,
        options: [
          { label: '2023', value: '2023' },
          { label: '2022', value: '2022' },
          { label: '2021', value: '2021' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ],
    workflow_steps: [
      { id: '1', name: 'Initial document review', order_index: 1 },
      { id: '2', name: 'Identify potential issues', order_index: 2 },
      { id: '3', name: 'Review deductions', order_index: 3 },
      { id: '4', name: 'Check calculations', order_index: 4 },
      { id: '5', name: 'Assess audit risk', order_index: 5 },
      { id: '6', name: 'Document findings', order_index: 6 },
      { id: '7', name: 'Prepare recommendations', order_index: 7 }
    ]
  },
  {
    id: 'personal-tax-plan',
    slug: 'personal-tax-plan',
    title: 'Personal tax plan strategy',
    description: 'Develop personalized tax strategy to minimize future tax liability and achieve financial goals.',
    category: 'Personal income tax',
    type: ['tax', 'advisory'],  // Changed to array
    steps: 9,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Financial Documents',
        documentTypes: [
          'Financial Statements',
          'Investment Portfolio',
          'Retirement Planning',
          'Estate Planning'
        ],
        acceptedFileTypes: ['.pdf', '.xlsx', '.csv'],
        multiple: true,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'life-events',
        type: WorkflowInputType.CHECKBOX,
        label: 'Upcoming Life Events',
        description: 'Select any relevant upcoming life events',
        required: true,
        options: [
          { label: 'Retirement', value: 'retirement' },
          { label: 'Property Purchase/Sale', value: 'property' },
          { label: 'Business Sale', value: 'business_sale' },
          { label: 'Inheritance', value: 'inheritance' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ]
  },
  {
    id: 'sales-tax-historical',
    slug: 'sales-tax-historical',
    title: 'Sales tax historical review',
    description: 'Review historical sales tax filings to identify potential refund opportunities and compliance gaps.',
    category: 'Sales tax',
    type: 'tax',
    steps: 7,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Sales Tax Documents',
        documentTypes: [
          'Sales Tax Returns',
          'Exemption Certificates',
          'Sales Records',
          'Supporting Documentation'
        ],
        acceptedFileTypes: ['.pdf', '.xlsx', '.csv'],
        multiple: true,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'review-period',
        type: WorkflowInputType.SELECT,
        label: 'What period are you reviewing?',
        description: 'Select the period for historical review',
        required: true,
        multiple: true,
        options: [
          { label: '2023', value: '2023' },
          { label: '2022', value: '2022' },
          { label: '2021', value: '2021' },
          { label: '2020', value: '2020' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ]
  },
  {
    id: 'transaction-categorization',
    slug: 'transaction-categorization',
    title: 'Transaction categorization & reporting',
    description: 'Automatically categorize transactions and generate financial reports including income statements and balance sheets.',
    category: 'Bookkeeping',
    type: 'bookkeeping',
    steps: 8,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Documents',
        documentTypes: [
          'Bank Statements',
          'Credit Card Statements',
          'Chart of Accounts',
          'Other Financial Documents'
        ],
        acceptedFileTypes: ['.pdf', '.csv', '.xlsx', '.xls'],
        multiple: true,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'report-period',
        type: WorkflowInputType.RADIO,
        label: 'What is the reporting frequency?',
        required: true,
        options: [
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Annual', value: 'annual' }
        ]
      },
      {
        id: 'report-date',
        type: WorkflowInputType.DATE,
        label: 'What is the end date for this report?',
        description: 'This will be used as the cutoff date for the financial statements',
        required: true
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ]
  },
  {
    id: 'sales-tax-nexus',
    slug: 'sales-tax-nexus',
    title: 'Sales tax nexus study',
    description: 'Evaluate multi-state sales tax obligations based on economic and physical presence thresholds.',
    category: 'Sales tax',
    type: 'tax',
    steps: 6,
    status: 'active',
    inputs: [
      {
        id: 'documents',
        type: WorkflowInputType.DOCUMENT_UPLOAD,
        label: 'Upload Documents',
        documentTypes: [
          'Revenue Data',
          'Business Activities',
          'Supporting Documentation'
        ],
        acceptedFileTypes: ['.xlsx', '.csv'],
        multiple: false,
        required: true
      },
      {
        id: 'client',
        type: WorkflowInputType.CLIENT_SELECT,
        label: 'Which client is this for?',
        required: true
      },
      {
        id: 'business-activities',
        type: WorkflowInputType.CHECKBOX,
        label: "What are this business's activities?",
        description: 'Select all business activities that apply',
        required: true,
        options: [
          { label: 'Physical office locations', value: 'physical_office' },
          { label: 'Remote employees', value: 'remote_employees' },
          { label: 'Inventory storage', value: 'inventory' },
          { label: 'Trade show attendance', value: 'trade_shows' }
        ]
      },
      {
        id: 'context',
        type: WorkflowInputType.TEXT,
        label: 'Add additional context for Modus',
        required: false
      }
    ],
    workflow_steps: [
      { id: '1', name: 'Review revenue data', order_index: 1 },
      { id: '2', name: 'Analyze business activities', order_index: 2 },
      { id: '3', name: 'Assess economic nexus', order_index: 3 },
      { id: '4', name: 'Evaluate physical presence', order_index: 4 },
      { id: '5', name: 'Document findings', order_index: 5 },
      { id: '6', name: 'Assess compliance requirements', order_index: 6 }
    ]
  }
]; 