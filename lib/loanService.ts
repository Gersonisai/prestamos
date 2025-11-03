import { supabase } from './supabase';

export const loanService = {
  async listLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createLoan(loanData: any) {
    const { data, error } = await supabase
      .from('loans')
      .insert([{
        client_name: loanData.clientName,
        phone: loanData.phone,
        address: loanData.address,
        notes: loanData.notes,
        original_amount: loanData.originalAmount,
        remaining_capital: loanData.remainingCapital,
        interest_rate: loanData.interestRate,
        interest: loanData.interest,
        total_interest: loanData.totalInterest,
        total: loanData.total,
        loan_date: loanData.loanDate,
        due_date: loanData.dueDate,
        status: loanData.status,
        installments: loanData.installments,
        monthly_payment: loanData.monthlyPayment,
        monthly_interest: loanData.monthlyInterest,
        monthly_capital: loanData.monthlyCapital,
        current_installment: loanData.currentInstallment
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLoan(id: string, updates: any) {
    const { data, error } = await supabase
      .from('loans')
      .update({
        remaining_capital: updates.remainingCapital,
        status: updates.status,
        current_installment: updates.currentInstallment,
        due_date: updates.dueDate
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createPayment(paymentData: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        loan_id: paymentData.loanId,
        date: paymentData.date,
        type: paymentData.type,
        amount: paymentData.amount
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPayments(loanId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};