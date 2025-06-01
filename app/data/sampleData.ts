// Sample activity data
export const allRows = [
  {
    id: 1,
    project: "Podcast (English)",
    question: "How do airplanes stay in the air?",
    paidOn: "Pending",
    endTime: "3:45 PM",
    endDate: "12/15",
    earnings: "Pending",
    earningsValue: 0,
    hourlyRate: "$25/hr",
    duration: "12.0",
    quality: 0,
    qualityDisplay: "Pending",
    payPeriod: "December 16, 2024",
    feedback: "Pending",
    conversationTopic: "What are the impacts of aerodynamics on flight efficiency?"
  },
  {
    id: 2,
    project: "Spanish 🇪🇸",
    question: "What is the capital of France?",
    paidOn: "Pending",
    endTime: "2:30 PM",
    endDate: "12/15",
    earnings: "Pending",
    earningsValue: 0,
    hourlyRate: "$17.50/hr",
    duration: "8.5",
    quality: 0,
    qualityDisplay: "Pending",
    payPeriod: "December 16, 2024",
    feedback: "Pending",
    conversationTopic: "What does the future of European geography education look like?"
  },
  {
    id: 3,
    project: "Assistant (English)",
    question: "Explain quantum physics in simple terms",
    paidOn: "12/13",
    endTime: "11:15 AM",
    endDate: "12/12",
    earnings: "$5.25",
    earningsValue: 5.25,
    hourlyRate: "$22.50/hr",
    duration: "14.0",
    quality: 92,
    payPeriod: "December 9, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What are the impacts of quantum mechanics on modern technology?"
  },
  {
    id: 4,
    project: "Podcast (English)",
    question: "How does photosynthesis work?",
    paidOn: "12/11",
    endTime: "4:20 PM",
    endDate: "12/10",
    earnings: "$3.75",
    earningsValue: 3.75,
    hourlyRate: "$25/hr",
    duration: "9.0",
    quality: 88,
    payPeriod: "December 2, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What does the future of renewable energy look like?"
  },
  {
    id: 5,
    project: "Spanish 🇪🇸",
    question: "What are the benefits of renewable energy?",
    paidOn: "12/09",
    endTime: "1:45 PM",
    endDate: "12/08",
    earnings: "$4.38",
    earningsValue: 4.38,
    hourlyRate: "$17.50/hr",
    duration: "15.0",
    quality: 95,
    payPeriod: "December 2, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What are the impacts of solar power on global energy markets?"
  },
  {
    id: 6,
    project: "Assistant (English)",
    question: "Explain the water cycle",
    paidOn: "12/07",
    endTime: "9:30 AM",
    endDate: "12/06",
    earnings: "$6.12",
    earningsValue: 6.12,
    hourlyRate: "$22.50/hr",
    duration: "16.3",
    quality: 91,
    payPeriod: "November 25, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What does the future of water conservation look like?"
  },
  {
    id: 7,
    project: "Podcast (English)",
    question: "What causes earthquakes?",
    paidOn: "12/05",
    endTime: "6:15 PM",
    endDate: "12/04",
    earnings: "$6.25",
    earningsValue: 6.25,
    hourlyRate: "$25/hr",
    duration: "15.0",
    quality: 87,
    payPeriod: "November 25, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What are the impacts of seismic activity on urban infrastructure?"
  },
  {
    id: 8,
    project: "Assistant (English)",
    question: "How effective are vaccines?",
    paidOn: "12/03",
    endTime: "3:00 PM",
    endDate: "12/02",
    earnings: "$4.50",
    earningsValue: 4.50,
    hourlyRate: "$22.50/hr",
    duration: "12.0",
    quality: 90,
    payPeriod: "November 25, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What does the future of vaccine development look like?"
  },
  {
    id: 9,
    project: "Spanish 🇪🇸",
    question: "Explain how magnets work",
    paidOn: "12/01",
    endTime: "7:45 PM",
    endDate: "11/30",
    earnings: "$3.50",
    earningsValue: 3.50,
    hourlyRate: "$17.50/hr",
    duration: "12.0",
    quality: 89,
    payPeriod: "November 25, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What are the impacts of magnetism on modern technology?"
  },
  {
    id: 10,
    project: "Podcast (English)",
    question: "What are the phases of the moon?",
    paidOn: "11/29",
    endTime: "5:30 PM",
    endDate: "11/28",
    earnings: "$7.50",
    earningsValue: 7.50,
    hourlyRate: "$25/hr",
    duration: "18.0",
    quality: 93,
    payPeriod: "November 25, 2024",
    feedback: "Good Feedback",
    conversationTopic: "What are the impacts of lunar cycles on Earth's tides?"
  }
]

// Sample payout data
export const payouts = [
  {
    id: 1,
    payPeriod: "Dec 9 - Dec 15, 2024",
    payoutDate: "Dec 17, 2024",
    status: "pending",
    amount: 45.67,
    method: "Bank Transfer"
  },
  {
    id: 2,
    payPeriod: "Dec 2 - Dec 8, 2024", 
    payoutDate: "Dec 10, 2024",
    status: "paid",
    amount: 38.92,
    method: "PayPal"
  },
  {
    id: 3,
    payPeriod: "Nov 25 - Dec 1, 2024",
    payoutDate: "Dec 3, 2024", 
    status: "paid",
    amount: 52.14,
    method: "Bank Transfer"
  },
  {
    id: 4,
    payPeriod: "Nov 18 - Nov 24, 2024",
    payoutDate: "Nov 26, 2024",
    status: "paid", 
    amount: 41.83,
    method: "Bank Transfer"
  },
  {
    id: 5,
    payPeriod: "Nov 11 - Nov 17, 2024",
    payoutDate: "Nov 19, 2024",
    status: "paid",
    amount: 56.33,
    method: "Bank Transfer"
  },
  {
    id: 6,
    payPeriod: "Nov 4 - Nov 10, 2024",
    payoutDate: "Nov 12, 2024",
    status: "paid",
    amount: 43.21,
    method: "Bank Transfer"
  },
  {
    id: 7,
    payPeriod: "Oct 28 - Nov 3, 2024",
    payoutDate: "Nov 5, 2024",
    status: "paid",
    amount: 39.87,
    method: "PayPal"
  },
  {
    id: 8,
    payPeriod: "Oct 21 - Oct 27, 2024",
    payoutDate: "Oct 29, 2024",
    status: "paid",
    amount: 47.65,
    method: "Bank Transfer"
  }
]

// Sample metrics data
export const metricsData = {
  totalEarnings: 234.89,
  pendingEarnings: 45.67
} 