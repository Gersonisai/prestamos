import { useEffect, useState } from 'react';
import { DollarSign, Download, X, Plus, Clock, AlertCircle, CheckCircle, Users, FileText, PieChart, Bell } from 'lucide-react';
import { loanService } from '../lib/loanService';
import { toast, Toaster } from 'react-hot-toast';
import type { Loan, Payment, LoginForm, FormData } from '../types';

const LoanManagementSystem: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string>('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paid' | 'overdue'>('all');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState<'dashboard' | 'loans' | 'clients'>('dashboard');
  const [showReceiptPreview, setShowReceiptPreview] = useState<Loan | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    amount: '',
    interestRate: '10',
    loanDate: new Date().toISOString().split('T')[0],
    phone: '',
    address: '',
    notes: '',
    installments: '1'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadLoans();
    }
  }, [isAuthenticated]);

  const loadLoans = async () => {
    try {
      const loadedLoans = await loanService.listLoans();
      setLoans(loadedLoans);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      toast.error('Error al cargar los préstamos');
      setLoans([]);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    
    const validUsername = 'Iblis';
    const validPassword = 'Iblis2004';
    
    if (loginForm.username.trim() === validUsername && loginForm.password.trim() === validPassword) {
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '' });
      toast.success('¡Bienvenido al sistema!');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
      toast.error('Credenciales inválidas');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const calculateDueDate = (loanDateStr: string) => {
    const [year, month, day] = loanDateStr.split('-').map(Number);
    const loanDate = new Date(year, month - 1, day);
    const nextMonth = new Date(year, month, day);
    
    if (nextMonth.getDate() !== loanDate.getDate()) {
      nextMonth.setDate(0);
    }
    
    return nextMonth.toISOString().split('T')[0];
  };

  const addLoan = async () => {
    if (!formData.clientName || !formData.amount) {
      toast.error('Por favor completa el nombre del cliente y el monto');
      return;
    }

    try {
      setIsSaving(true);
      const amount = parseFloat(formData.amount);
      const interestRate = parseFloat(formData.interestRate) / 100;
      const installments = parseInt(formData.installments) || 1;
      
      const totalInterest = amount * interestRate * installments;
      const total = amount + totalInterest;
      const monthlyPayment = total / installments;
      const monthlyInterest = totalInterest / installments;
      const monthlyCapital = amount / installments;
      
      const dueDate = calculateDueDate(formData.loanDate);

      const newLoan = {
        client_name: formData.clientName,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
        original_amount: amount,
        remaining_capital: amount,
        interest_rate: parseFloat(formData.interestRate),
        interest: totalInterest,
        total_interest: totalInterest,
        total: total,
        loan_date: formData.loanDate,
        due_date: dueDate,
        status: 'active' as const,
        installments: installments,
        monthly_payment: monthlyPayment,
        monthly_interest: monthlyInterest,
        monthly_capital: monthlyCapital,
        current_installment: 1
      };

      await loanService.createLoan(newLoan);
      await loadLoans();
      
      setFormData({
        clientName: '',
        amount: '',
        interestRate: '10',
        loanDate: new Date().toISOString().split('T')[0],
        phone: '',
        address: '',
        notes: '',
        installments: '1'
      });
      
      setShowAddForm(false);
      toast.success('Préstamo registrado correctamente');
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      toast.error('Error al registrar el préstamo');
    } finally {
      setIsSaving(false);
    }
  };

  const addPayment = async (loanId: string, paymentType: 'interest' | 'capital' | 'installment' | 'total', amount: string | null = null) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      toast.error('Préstamo no encontrado');
      return;
    }

    try {
      setIsSaving(true);
      let paymentAmount = 0;
      const updates: Partial<Loan> = {
        id: loan.id,
        remaining_capital: loan.remaining_capital,
        status: loan.status,
        current_installment: loan.current_installment,
        due_date: loan.due_date
      };

      if (paymentType === 'interest') {
        paymentAmount = loan.monthly_interest || loan.interest;
        updates.due_date = calculateDueDate(loan.due_date);
        
        if (loan.installments > 1) {
          updates.current_installment = (loan.current_installment || 1) + 1;
        }
      } else if (paymentType === 'installment') {
        if (!loan.monthly_payment) return;
        
        paymentAmount = loan.monthly_payment;
        updates.remaining_capital = loan.remaining_capital - loan.monthly_capital;
        
        if (updates.remaining_capital <= 0.01) {
          updates.status = 'paid';
          updates.remaining_capital = 0;
        } else {
          updates.due_date = calculateDueDate(loan.due_date);
          updates.current_installment = (loan.current_installment || 1) + 1;
        }
      } else if (paymentType === 'capital') {
        const payAmount = parseFloat(amount || '0');
        if (isNaN(payAmount) || payAmount <= 0) {
          toast.error('Ingresa un monto válido');
          return;
        }
        if (payAmount > loan.remaining_capital) {
          toast.error('El monto excede el capital pendiente');
          return;
        }
        paymentAmount = payAmount;
        updates.remaining_capital = loan.remaining_capital - payAmount;
        
        if (updates.remaining_capital <= 0) {
          updates.status = 'paid';
          updates.remaining_capital = 0;
        }
      }

      const payment = {
        loan_id: loanId,
        date: paymentDate,
        type: paymentType,
        amount: paymentAmount
      };

      await loanService.createPayment(payment);
      await loanService.updateLoan(loanId, updates);
      await loadLoans();
      
      setShowPaymentModal(null);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      toast.success('Pago registrado correctamente');
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setIsSaving(false);
    }
  };

  // ... el resto del componente se mantiene igual ...
  // Aquí mantendremos todas las funciones de UI como getStatusInfo, filteredLoans, etc.

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* ... el JSX existente ... */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

export default LoanManagementSystem;