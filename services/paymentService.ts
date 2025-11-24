

// Mock Data simulating a database response
let MOCK_PAYMENTS = {
  outstandingInvoices: 32500,
  paidThisMonth: 74800,
  payout: {
    nextPayoutAmount: 21000,
    nextPayoutDate: "2024-11-25",
    method: "bkash",
  },
  payoutMethods: {
    bank: {
      bankName: "BRAC Bank",
      branch: "Gulshan Branch",
      accountName: "Anisul Huq",
      accountNumber: "012345678901",
      routingNumber: "06026",
      verified: true,
    },
    wallet: {
      provider: "bKash",
      walletNumber: "01712345678",
      holder: "Anisul Huq",
      verified: true,
    }
  },
  history: [
    {
      id: 'tx1',
      date: "2024-11-18",
      client: "John Doe",
      service: "Consultation – Land Dispute",
      amount: 5000,
      status: "paid",
    },
    {
      id: 'tx2',
      date: "2024-11-16",
      client: "Rahim Ahmed",
      service: "Contract Drafting",
      amount: 12000,
      status: "pending",
    },
    {
        id: 'tx3',
        date: "2024-11-14",
        client: "Nusrat Jahan",
        service: "Divorce Filing (Initial)",
        amount: 15000,
        status: "paid",
    }
  ]
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-2024-001",
    caseId: "c_21",
    caseTitle: "Land Dispute in Savar",
    clientName: "John Doe",
    lawyerName: "Anisul Huq",
    issuedDate: "2024-11-18",
    dueDate: "2024-11-25",
    amount: 5000,
    status: "unpaid",
    method: "Online (bKash)"
  },
  {
    id: "INV-2024-002",
    caseId: "c_22",
    caseTitle: "Commercial Lease Draft",
    clientName: "Rahim Ahmed",
    lawyerName: "Barrister Sumon",
    issuedDate: "2024-11-16",
    dueDate: "2024-11-23",
    amount: 12000,
    status: "paid",
    method: "Bank Transfer"
  },
  {
    id: "INV-2024-003",
    caseId: "c_23",
    caseTitle: "Family Law Consultation",
    clientName: "Farhana Akter",
    lawyerName: "Farida Yasmin",
    issuedDate: "2024-11-10",
    dueDate: "2024-11-17",
    amount: 3500,
    status: "overdue",
    method: "Cash"
  }
];

const MOCK_CITIZEN_PAYMENTS: CitizenPayment[] = [
  {
    id: "PAY-2024-001",
    invoiceId: "INV-2024-002",
    caseTitle: "Consultation – Contract Draft",
    amount: 3500,
    method: "bKash",
    status: "paid",
    paidAt: "2024-11-18 15:40",
  },
  {
    id: "PAY-2024-002",
    invoiceId: "INV-2024-003",
    caseTitle: "Emergency Legal Helpline",
    amount: 1200,
    method: "Nagad",
    status: "paid",
    paidAt: "2024-10-29 21:10",
  }
];

// Types
export interface PaymentSummary {
    outstandingInvoices: number;
    paidThisMonth: number;
    payout: {
        nextPayoutAmount: number;
        nextPayoutDate: string;
        method: string;
    }
}

export interface PayoutMethods {
    bank: {
        bankName: string;
        branch: string;
        accountName: string;
        accountNumber: string;
        routingNumber: string;
        verified: boolean;
    };
    wallet: {
        provider: string;
        walletNumber: string;
        holder: string;
        verified: boolean;
    }
}

export interface PaymentHistoryItem {
    id: string;
    date: string;
    client: string;
    service: string;
    amount: number;
    status: string;
}

export interface Invoice {
    id: string;
    caseId: string;
    caseTitle: string;
    clientName: string;
    lawyerName: string;
    issuedDate: string;
    dueDate: string;
    amount: number;
    status: 'unpaid' | 'paid' | 'overdue';
    method: string;
}

export interface CitizenPayment {
    id: string;
    invoiceId: string;
    caseTitle: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string;
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// -------- API-LIKE FUNCTIONS -------- //

// Get Summary cards data
export const getPaymentSummary = async (): Promise<PaymentSummary> => {
    await delay(500); // Simulate API latency
    return {
        outstandingInvoices: MOCK_PAYMENTS.outstandingInvoices,
        paidThisMonth: MOCK_PAYMENTS.paidThisMonth,
        payout: MOCK_PAYMENTS.payout
    };
};

// Get Payment history list
export const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
    await delay(500);
    return MOCK_PAYMENTS.history;
};

// Get Payout settings
export const getPayoutMethods = async (): Promise<PayoutMethods> => {
    await delay(500);
    return MOCK_PAYMENTS.payoutMethods;
};

// Get Invoices
export const getInvoices = async (): Promise<Invoice[]> => {
    await delay(500);
    return MOCK_INVOICES;
};

// Get Single Invoice
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    await delay(200);
    return MOCK_INVOICES.find(i => i.id === id) || null;
}

// Get Citizen Payment History
export const getCitizenPaymentHistory = async (citizenId: string): Promise<CitizenPayment[]> => {
    // later: filter by citizenId in backend
    await delay(500);
    return MOCK_CITIZEN_PAYMENTS;
}

// Save payout methods (POST)
export const savePayoutMethods = async (updatedData: PayoutMethods): Promise<{ success: boolean }> => {
    await delay(1000); // Simulate processing
    MOCK_PAYMENTS = {
        ...MOCK_PAYMENTS,
        payoutMethods: updatedData
    };
    return { success: true };
};
