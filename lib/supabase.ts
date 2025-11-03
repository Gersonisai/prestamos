import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Database {
  public: {
    Tables: {
      loans: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['loans']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['loans']['Row']>;
      };
      payments: {
        Row: {
          id: string;
          loan_id: string;
          date: string;
          type: 'interest' | 'capital' | 'installment' | 'total';
          amount: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
      };
    };
  };
}