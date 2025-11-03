export interface Loan {
  id: string;
  client_name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  original_amount: number;
  remaining_capital: number;
  interest_rate: number;
  interest: number;
  total_interest: number;
  total: number;
  loan_date: string;
  due_date: string;
  status: 'active' | 'paid';
  installments: number;
  monthly_payment: number;
  monthly_interest: number;
  monthly_capital: number;
  current_installment: number;
  created_at: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  loan_id: string;
  date: string;
  type: 'interest' | 'capital' | 'installment' | 'total';
  amount: number;
  created_at: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface FormData {
  clientName: string;
  amount: string;
  interestRate: string;
  loanDate: string;
  phone: string;
  address: string;
  notes: string;
  installments: string;
}