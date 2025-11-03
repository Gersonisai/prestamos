export interface Payment {
  date: string;
  type: 'interest' | 'capital' | 'installment' | 'total';
  amount: number;
}

export interface Loan {
  id: string;
  clientName: string;
  phone?: string;
  address?: string;
  notes?: string;
  originalAmount: number;
  remainingCapital: number;
  interestRate: number;
  interest: number;
  totalInterest: number;
  total: number;
  loanDate: string;
  dueDate: string;
  status: 'active' | 'paid';
  payments: Payment[];
  installments: number;
  monthlyPayment: number;
  monthlyInterest: number;
  monthlyCapital: number;
  currentInstallment: number;
  createdAt: string;
}