import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Plus, X, Eye, Download, FileText, Users, PieChart, Bell } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Declare custom window interface
declare global {
  interface Window {
    storage: {
      get(key: string): Promise<{ value: string } | null>;
      set(key: string, value: string): Promise<void>;
      list(prefix: string): Promise<{ keys: string[] }>;
      remove(key: string): Promise<void>;
    };
    html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

// Types
interface Payment {
  date: string;
  type: 'interest' | 'installment' | 'capital' | 'total';
  amount: number;
}

interface Loan {
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

import { Loan, Payment } from '../types/loan';
import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  X, 
  Download, 
  PieChart, 
  FileText, 
  Users,
  TrendingUp,
  TrendingDown,
  Bell,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface FormData {
  clientName: string;
  amount: string;
  interestRate: string;
  loanDate: string;
  phone: string;
  address: string;
  notes: string;
  installments: string;
}

const LoanManagementSystem = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paid' | 'overdue'>('all');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState<'dashboard' | 'loans' | 'clients'>('dashboard');
  const [showReceiptPreview, setShowReceiptPreview] = useState(null);
  
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
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      loadLoans();
    }
  }, [isAuthenticated]);

  const loadLoans = async () => {
    try {
      const result = await window.storage.list('loan:');
      if (result && result.keys) {
        const loadedLoans = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key);
            return data ? (JSON.parse(data.value) as Loan) : null;
          })
        );
        // Deduplicar por id por si hay entradas repetidas
        const filtered = loadedLoans.filter((loan): loan is Loan => loan !== null);
        const uniqueById = Object.values(filtered.reduce<Record<string, Loan>>((acc, loan) => {
          acc[loan.id] = loan;
          return acc;
        }, {}));
        setLoans(uniqueById);
      }
    } catch (error) {
      console.log('No hay préstamos guardados aún');
      setLoans([]);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    
    const validUsername = 'Iblis';
    const validPassword = 'Iblis2004';
    
    if (loginForm.username.trim() === validUsername && loginForm.password.trim() === validPassword) {
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Usuario o contraseña incorrectos');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  // Pantalla de inicio de sesión
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full mb-4">
              <DollarSign size={48} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-amber-600 bg-clip-text text-transparent mb-2">
              Zénit Financiera
            </h1>
            <p className="text-gray-600">Sistema de Gestión Profesional</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-800 text-sm font-medium">{loginError}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-900 to-amber-600 text-white py-3 rounded-xl hover:shadow-2xl transition-all font-semibold text-lg"
            >
              Iniciar Sesión
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Acceso seguro y protegido</p>
          </div>
        </div>
      </div>
    );
  }

  const calculateDueDate = (loanDateStr: string): string => {
    // Parsear la fecha correctamente sin conversión de zona horaria
    const [year, month, day] = loanDateStr.split('-').map(Number);
    const loanDate = new Date(year, month - 1, day);
    
    const originalDay = loanDate.getDate();
    const nextMonth = new Date(year, month, day); // mes siguiente automáticamente
    
    // Si el día original no existe en el mes siguiente (ej: 31 en meses de 30 días)
    // ajustar al último día del mes
    if (nextMonth.getDate() !== originalDay) {
      nextMonth.setDate(0); // Ir al último día del mes anterior
    }
    
    // Formatear manualmente para evitar problemas de zona horaria
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(nextMonth.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const addLoan = async (): Promise<void> => {
    if (isSaving) return; // prevenir envíos dobles

    // Validaciones
    const errors: Record<string, string> = {};
    if (!formData.clientName || formData.clientName.trim() === '') {
      errors.clientName = 'Ingresa el nombre del cliente';
    }
    
    const amountVal = parseFloat(formData.amount as any);
    if (isNaN(amountVal) || amountVal <= 0) {
      errors.amount = 'Ingresa un monto válido mayor que 0';
    }
    
    const installmentsVal = parseInt(formData.installments as any) || 1;
    if (isNaN(installmentsVal) || installmentsVal < 1) {
      errors.installments = 'Ingresa un plazo válido (>=1)';
    }
    
    const interestRateVal = parseFloat(formData.interestRate as any);
    if (isNaN(interestRateVal) || interestRateVal < 0) {
      errors.interestRate = 'Tasa inválida';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const amount = amountVal;
    const interestRate = interestRateVal / 100;
    const installments = installmentsVal;
    
    // Calcular interés total e interés por cuota
    const totalInterest = amount * interestRate * installments;
    const total = amount + totalInterest;
    const monthlyPayment = total / installments;
    const monthlyInterest = totalInterest / installments;
    const monthlyCapital = amount / installments;
    
    const dueDate = calculateDueDate(formData.loanDate);

    const newLoan: Loan = {
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : Date.now().toString(),
      clientName: formData.clientName,
      phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      originalAmount: amount,
      remainingCapital: amount,
      interestRate: parseFloat(formData.interestRate),
      interest: totalInterest,
      totalInterest: totalInterest,
      total: total,
      loanDate: formData.loanDate,
      dueDate: dueDate,
      status: 'active',
      payments: [],
      installments: installments,
      monthlyPayment: monthlyPayment,
      monthlyInterest: monthlyInterest,
      monthlyCapital: monthlyCapital,
      currentInstallment: 1,
      createdAt: new Date().toISOString()
    };

    // Evitar duplicados por firma cliente|monto|fecha
    const exists = loans.some(l => l.clientName === newLoan.clientName && Number(l.originalAmount) === Number(newLoan.originalAmount) && l.loanDate === newLoan.loanDate);
    if (exists) {
      toast.error('Ya existe un préstamo con los mismos datos');
      setFormErrors({ general: 'Ya existe un préstamo igual (cliente/monto/fecha).' });
      return;
    }

    try {
      setIsSaving(true);
      const res = await window.storage.set(`loan:${newLoan.id}`, JSON.stringify(newLoan));
      // Añadir solo si no existe ya un préstamo con el mismo id
      setLoans(prev => {
        if (prev.some(l => l && l.id === newLoan.id)) return prev;
        return [...prev, newLoan];
      });
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
      setFormErrors({});
      toast.success('¡Préstamo creado exitosamente!');
    } catch (error) {
      console.error('Error saving loan', error);
      toast.error('Error al guardar el préstamo. Intenta de nuevo.');
    }
    finally {
      setIsSaving(false);
    }
  };

  const deleteLoan = async (loanId: string): Promise<void> => {
    // Usar toast.promise para confirmación
    const shouldDelete = window.confirm('¿Eliminar este préstamo? Esta acción no se puede deshacer.');
    if (!shouldDelete) return;
    try {
      await window.storage.remove(`loan:${loanId}`);
      setLoans(prev => prev.filter(l => l.id !== loanId));
      if (selectedLoan && selectedLoan.id === loanId) setSelectedLoan(null);
      toast.success('Préstamo eliminado exitosamente');
      console.info('Loan removed', loanId);
    } catch (e) {
      console.error('Error removing loan', e);
      toast.error('No se pudo eliminar el préstamo');
    }
  };

  const addPayment = async (loanId: string, paymentType: Payment['type'], amount: number | null = null) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    let paymentData = {
      date: paymentDate || new Date().toISOString().split('T')[0],
      type: paymentType,
      amount: 0
    };

    const updatedLoan = { ...loan };

    if (paymentType === 'interest') {
      // Para préstamos con cuotas, pagar el interés mensual
      const interestToPay = loan.monthlyInterest || loan.interest;
      paymentData.amount = interestToPay;
      const newDueDate = calculateDueDate(loan.dueDate);
      updatedLoan.dueDate = newDueDate;
      
      // Actualizar número de cuota si es un préstamo a plazos
      if (loan.installments && loan.installments > 1) {
        updatedLoan.currentInstallment = (updatedLoan.currentInstallment || 1) + 1;
      }
    } else if (paymentType === 'installment') {
      // Pago de cuota completa (capital + interés)
      if (!loan.monthlyPayment) return;
      
      paymentData.amount = loan.monthlyPayment;
      paymentData.type = 'installment';
      
      // Reducir capital según cuota mensual
      updatedLoan.remainingCapital -= loan.monthlyCapital;
      
      if (updatedLoan.remainingCapital <= 0.01) {
        updatedLoan.status = 'paid';
        updatedLoan.remainingCapital = 0;
      } else {
        // Avanzar al siguiente mes
        const newDueDate = calculateDueDate(loan.dueDate);
        updatedLoan.dueDate = newDueDate;
        updatedLoan.currentInstallment = (updatedLoan.currentInstallment || 1) + 1;
      }
    } else if (paymentType === 'capital') {
      const payAmount = parseFloat(amount);
      if (isNaN(payAmount) || payAmount <= 0) {
        toast.error('Ingresa un monto válido');
        return;
      }
      if (payAmount > updatedLoan.remainingCapital) {
        toast.error('El monto excede el capital pendiente');
        return;
      }
      paymentData.amount = payAmount;
      updatedLoan.remainingCapital -= payAmount;
      
      if (updatedLoan.remainingCapital <= 0) {
        updatedLoan.status = 'paid';
        updatedLoan.remainingCapital = 0;
      }
    } else if (paymentType === 'total') {
      // Pagar todo: capital pendiente + interés restante
      const remainingInstallments = loan.installments ? loan.installments - (loan.currentInstallment || 1) + 1 : 1;
      const remainingInterest = loan.monthlyInterest ? loan.monthlyInterest * remainingInstallments : loan.interest;
      
      paymentData.amount = updatedLoan.remainingCapital + remainingInterest;
      updatedLoan.remainingCapital = 0;
      updatedLoan.status = 'paid';
    }

    updatedLoan.payments.push(paymentData);

    try {
      await window.storage.set(`loan:${loanId}`, JSON.stringify(updatedLoan));
      setLoans(prev => prev.map(l => l.id === loanId ? updatedLoan : l));
      if (selectedLoan && selectedLoan.id === loanId) {
        setSelectedLoan(updatedLoan);
      }
      setShowPaymentModal(null);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      toast.success('Pago registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar el pago');
    }
  };

  const exportToExcel = () => {
    const headers = ['Cliente', 'Teléfono', 'Capital Original', 'Capital Pendiente', 'Tasa', 'Interés', 'Total Adeudado', 'Fecha Préstamo', 'Vencimiento', 'Estado'];
    
    const rows = loans.map(loan => {
      const totalOwed = (loan.remainingCapital || 0) + (loan.interest || 0);
      return [
        loan.clientName || '',
        loan.phone || '',
        (loan.originalAmount || 0).toFixed(2),
        (loan.remainingCapital || 0).toFixed(2),
        `${loan.interestRate || 10}%`,
        (loan.interest || 0).toFixed(2),
        totalOwed.toFixed(2),
        loan.loanDate ? (() => {
          const [year, month, day] = loan.loanDate.split('-').map(Number);
          return new Date(year, month - 1, day).toLocaleDateString('es-ES');
        })() : '',
        loan.dueDate ? (() => {
          const [year, month, day] = loan.dueDate.split('-').map(Number);
          return new Date(year, month - 1, day).toLocaleDateString('es-ES');
        })() : '',
        loan.status === 'paid' ? 'Pagado' : 'Activo'
      ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prestamos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReceipt = (loan) => {
    setShowReceiptPreview(loan);
  };

  const downloadReceipt = async (loan) => {
    const receiptElement = document.getElementById('receipt-content');
    if (!receiptElement) return;

    try {
      // Cargar html2canvas desde CDN
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Mostrar mensaje de carga
      const loadingMsg = document.createElement('div');
      loadingMsg.id = 'loading-msg';
      loadingMsg.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-6 py-4 rounded-xl z-50';
      loadingMsg.textContent = 'Generando imagen...';
      document.body.appendChild(loadingMsg);

      // Generar la imagen con mayor calidad
      const canvas = await window.html2canvas(receiptElement, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Remover mensaje de carga
      document.body.removeChild(loadingMsg);

      // Convertir canvas a imagen base64
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Detectar si es móvil
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Para móviles: mostrar la imagen en un modal para descargar manualmente
        const modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4';
        modal.innerHTML = `
          <div class="bg-white rounded-2xl p-4 max-w-md w-full max-h-screen overflow-auto">
            <div class="mb-4 text-center">
              <h3 class="text-lg font-bold text-gray-800 mb-2">📱 Para descargar en tu celular:</h3>
              <ol class="text-sm text-gray-700 text-left space-y-2 bg-yellow-50 p-4 rounded-lg">
                <li><strong>1.</strong> Mantén presionada la imagen abajo ⬇️</li>
                <li><strong>2.</strong> Selecciona "Guardar imagen" o "Descargar"</li>
                <li><strong>3.</strong> La imagen se guardará en tu galería</li>
              </ol>
            </div>
            <img src="${imgData}" class="w-full rounded-lg shadow-lg mb-4" alt="Recibo">
            <button onclick="document.body.removeChild(document.getElementById('image-modal'))" 
                    class="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold">
              Cerrar
            </button>
          </div>
        `;
        document.body.appendChild(modal);
      } else {
        // Para desktop: descarga directa
        const link = document.createElement('a');
        link.download = `recibo_${loan.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = imgData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      const loadingMsg = document.getElementById('loading-msg');
      if (loadingMsg) document.body.removeChild(loadingMsg);
      toast.error('Error al generar la imagen. Por favor intenta de nuevo.');
      console.error('Error:', error);
    }
  };



  const getStatusInfo = (loan) => {
    if (loan.status === 'paid') {
      return { text: 'Pagado', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    
    // Parsear correctamente sin zona horaria
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = loan.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);
    
    if (due < today) {
      return { text: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    
    return { text: 'Activo', color: 'bg-blue-100 text-blue-800', icon: Clock };
  };

  const filteredLoans = loans.filter(loan => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return loan.status === 'active';
    if (filterStatus === 'paid') return loan.status === 'paid';
    if (filterStatus === 'overdue') {
      if (loan.status !== 'active') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = loan.dueDate.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }
    return true;
  });

  const totalLent = loans.reduce((sum, loan) => sum + (loan.originalAmount || 0), 0);
  const totalPending = loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + (loan.remainingCapital || 0), 0);
  const totalRecovered = loans.reduce((sum, loan) => {
    const capitalPaid = (loan.originalAmount || 0) - (loan.remainingCapital || 0);
    return sum + capitalPaid;
  }, 0);
  const totalInterest = loans.reduce((sum, loan) => {
    if (!loan.payments) return sum;
    const interestPayments = loan.payments.filter(p => p.type === 'interest' || p.type === 'total');
    return sum + interestPayments.reduce((pSum, p) => {
      if (p.type === 'interest') return pSum + (p.amount || 0);
      if (p.type === 'total') return pSum + (loan.interest || 0);
      return pSum;
    }, 0);
  }, 0);
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const overdueLoans = loans.filter(l => {
    if (l.status !== 'active') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = l.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const activos = totalRecovered + totalInterest;
  const pasivos = totalPending;
  const uniqueClients = Array.from(new Set(loans.map(l => l.clientName))).length;

  const StatusIcon = selectedLoan ? getStatusInfo(selectedLoan).icon : Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-1.5 sm:p-2 rounded-xl">
                <DollarSign size={20} className="sm:hidden" />
                <DollarSign size={28} className="hidden sm:block" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Préstamos Pro
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">Gestión Profesional</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 text-sm"
                title="Cerrar Sesión"
              >
                <X size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex gap-1 sm:gap-2 py-2 sm:py-3 overflow-x-auto">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap text-sm ${
                activeView === 'dashboard' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PieChart size={16} className="sm:w-[18px] sm:h-[18px]" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('loans')}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap text-sm ${
                activeView === 'loans' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
              Préstamos
            </button>
            <button
              onClick={() => setActiveView('clients')}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap text-sm ${
                activeView === 'clients' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
              Clientes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {activeView === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-semibold uppercase">💰 Activos Totales</p>
                    <p className="text-3xl sm:text-5xl font-bold mt-2">Bs {activos.toFixed(2)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 sm:p-4 rounded-xl">
                    <TrendingUp size={32} className="sm:w-12 sm:h-12" />
                  </div>
                </div>
                <div className="space-y-2 mt-4 sm:mt-6 bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Capital Recuperado</span>
                    <span className="font-bold">${totalRecovered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Intereses Ganados</span>
                    <span className="font-bold">${totalInterest.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm font-semibold uppercase">📊 Pasivos (En Calle)</p>
                    <p className="text-3xl sm:text-5xl font-bold mt-2">Bs {pasivos.toFixed(2)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 sm:p-4 rounded-xl">
                    <TrendingDown size={32} className="sm:w-12 sm:h-12" />
                  </div>
                </div>
                <div className="space-y-2 mt-4 sm:mt-6 bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Préstamos Activos</span>
                    <span className="font-bold">{activeLoans}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Capital Prestado</span>
                    <span className="font-bold">${totalLent.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-indigo-100 text-xs sm:text-sm font-semibold uppercase">💎 Balance Neto</p>
                  <p className="text-2xl sm:text-4xl font-bold mt-2">Bs {(activos - pasivos).toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-indigo-200 mt-1">Ganancia después de restar lo prestado</p>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold">{totalLent > 0 ? ((activos / totalLent) * 100).toFixed(1) : 0}%</p>
                  <p className="text-xs sm:text-sm text-indigo-200">Retorno Capital</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-xs sm:text-sm">Capital Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">Bs {totalLent.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
                <p className="text-gray-600 text-xs sm:text-sm">Intereses</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">Bs {totalInterest.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500">
                <p className="text-gray-600 text-xs sm:text-sm">Clientes</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{uniqueClients}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-500">
                <p className="text-gray-600 text-xs sm:text-sm">Vencidos</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{overdueLoans}</p>
              </div>
            </div>

            {overdueLoans > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <Bell className="text-red-500" size={24} />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-red-800">Atención: Préstamos Vencidos</h3>
                    <p className="text-sm sm:text-base text-red-700">Tienes {overdueLoans} préstamo(s) vencido(s)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'loans' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${filterStatus === 'all' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Todos ({loans.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${filterStatus === 'active' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Activos ({activeLoans})
                  </button>
                  <button
                    onClick={() => setFilterStatus('overdue')}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${filterStatus === 'overdue' ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Vencidos ({overdueLoans})
                  </button>
                  <button
                    onClick={() => setFilterStatus('paid')}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${filterStatus === 'paid' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Pagados ({loans.filter(l => l.status === 'paid').length})
                  </button>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  Nuevo Préstamo
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {filteredLoans.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">No hay préstamos</p>
                ) : (
                  filteredLoans.map(loan => {
                    const status = getStatusInfo(loan);
                    const Icon = status.icon;
                    const capitalPaid = (loan.originalAmount || 0) - (loan.remainingCapital || 0);
                    const progressPercent = loan.originalAmount ? (capitalPaid / loan.originalAmount) * 100 : 0;
                    
                    // Calcular interés actual a pagar
                    const remainingInstallments = loan.installments ? loan.installments - (loan.currentInstallment || 1) + 1 : 1;
                    const currentInterest = loan.monthlyInterest || loan.interest;
                    const totalRemainingInterest = loan.monthlyInterest ? loan.monthlyInterest * remainingInstallments : loan.interest;
                    const totalOwed = (loan.remainingCapital || 0) + totalRemainingInterest;
                    
                    return (
                      <div key={loan.id} className="border-2 border-gray-100 rounded-xl p-3 sm:p-6 hover:shadow-xl transition-all bg-gradient-to-r from-white to-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3 sm:mb-4">
                          <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{loan.clientName}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color} flex items-center gap-1`}>
                                <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
                                {status.text}
                              </span>
                              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                {loan.interestRate || 10}%
                              </span>
                              {loan.installments && loan.installments > 1 && (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                  📅 {loan.currentInstallment || 1}/{loan.installments} cuotas
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-sm mb-3">
                              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                <p className="text-blue-600 font-semibold text-xs">Original</p>
                                <p className="font-bold text-sm sm:text-lg">Bs {(loan.originalAmount || 0).toFixed(2)}</p>
                              </div>
                              <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                                <p className="text-orange-600 font-semibold text-xs">Pendiente</p>
                                <p className="font-bold text-sm sm:text-lg text-orange-600">Bs {(loan.remainingCapital || 0).toFixed(2)}</p>
                              </div>
                              <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                                <p className="text-green-600 font-semibold text-xs">Pagado</p>
                                <p className="font-bold text-sm sm:text-lg text-green-600">Bs {capitalPaid.toFixed(2)}</p>
                              </div>
                              {loan.installments && loan.installments > 1 ? (
                                <>
                                  <div className="bg-cyan-50 p-2 sm:p-3 rounded-lg">
                                    <p className="text-cyan-600 font-semibold text-xs">Cuota Mes</p>
                                    <p className="font-bold text-sm sm:text-lg text-cyan-600">Bs {(loan.monthlyPayment || 0).toFixed(2)}</p>
                                  </div>
                                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                    <p className="text-blue-600 font-semibold text-xs">Int. Mes</p>
                                    <p className="font-bold text-sm sm:text-lg text-blue-600">Bs {(loan.monthlyInterest || 0).toFixed(2)}</p>
                                  </div>
                                </>
                              ) : (
                                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                  <p className="text-blue-600 font-semibold text-xs">Interés</p>
                                  <p className="font-bold text-sm sm:text-lg text-blue-600">Bs {currentInterest.toFixed(2)}</p>
                                </div>
                              )}
                              <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
                                <p className="text-red-600 font-semibold text-xs">Total Debe</p>
                                <p className="font-bold text-sm sm:text-lg text-red-600">Bs {totalOwed.toFixed(2)}</p>
                              </div>
                            </div>

                            {loan.status === 'active' && (
                              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 sm:h-3 rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto sm:ml-4">
                            <button
                              onClick={() => generateReceipt(loan)}
                              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all"
                              title="Generar Recibo"
                            >
                              <FileText size={16} className="sm:w-5 sm:h-5 mx-auto" />
                            </button>
                            <button
                              onClick={() => setSelectedLoan(loan)}
                              className="flex-1 sm:flex-none bg-gray-100 p-2 sm:p-3 rounded-xl hover:bg-gray-200 transition-all"
                            >
                              <Eye size={16} className="sm:w-5 sm:h-5 mx-auto" />
                            </button>
                              <button
                                onClick={() => deleteLoan(loan.id)}
                                className="flex-1 sm:flex-none bg-red-100 text-red-700 p-2 sm:p-3 rounded-xl hover:bg-red-200 transition-all"
                                title="Eliminar Préstamo"
                              >
                                <X size={16} className="sm:w-5 sm:h-5 mx-auto" />
                              </button>
                            {loan.status === 'active' && (
                              <>
                                {loan.installments && loan.installments > 1 ? (
                                  <button
                                    onClick={() => addPayment(loan.id, 'installment')}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 sm:px-3 py-2 rounded-xl hover:shadow-lg text-xs sm:text-sm font-semibold whitespace-nowrap"
                                  >
                                    Cuota
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => addPayment(loan.id, 'interest')}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 sm:px-3 py-2 rounded-xl hover:shadow-lg text-xs sm:text-sm font-semibold whitespace-nowrap"
                                  >
                                    Int.
                                  </button>
                                )}
                                <button
                                  onClick={() => setShowPaymentModal(loan.id)}
                                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 sm:px-3 py-2 rounded-xl hover:shadow-lg text-xs sm:text-sm font-semibold whitespace-nowrap"
                                >
                                  Cap.
                                </button>
                                <button
                                  onClick={() => addPayment(loan.id, 'total')}
                                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-2 rounded-xl hover:shadow-lg text-xs sm:text-sm font-semibold whitespace-nowrap"
                                >
                                  Total
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'clients' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Clientes</h2>
            <div className="grid gap-4">
              {Array.from(new Set(loans.map(l => l.clientName))).map(clientName => {
                const clientLoans = loans.filter(l => l.clientName === clientName);
                const totalBorrowed = clientLoans.reduce((sum, l) => sum + (l.originalAmount || 0), 0);
                const totalPending = clientLoans.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.remainingCapital || 0), 0);
                const activeCount = clientLoans.filter(l => l.status === 'active').length;

                return (
                  <div key={clientName} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{clientName}</h3>
                        <p className="text-sm text-gray-600">{clientLoans.length} préstamo(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Prestado</p>
                        <p className="text-xl font-bold text-indigo-600">${totalBorrowed.toFixed(2)}</p>
                        {activeCount > 0 && (
                          <p className="text-sm text-orange-600 font-semibold">Debe: ${totalPending.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Nuevo Préstamo</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => {
                    setFormData({...formData, clientName: e.target.value});
                    setFormErrors({...formErrors, clientName: ''});
                  }}
                  className={`w-full px-3 py-2 border ${formErrors.clientName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  placeholder="Juan Pérez"
                />
                {formErrors.clientName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.clientName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Préstamo *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({...formData, amount: e.target.value});
                    setFormErrors({...formErrors, amount: ''});
                  }}
                  className={`w-full px-3 py-2 border ${formErrors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  placeholder="1000"
                  step="0.01"
                />
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plazo de Pago (Meses) *</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, installments: '1'})}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.installments === '1' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    1 mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, installments: '3'})}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.installments === '3' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    3 meses
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, installments: '6'})}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.installments === '6' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    6 meses
                  </button>
                  <input
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: e.target.value})}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="12"
                    min="1"
                    max="60"
                  />
                </div>
                <p className="text-xs text-gray-500">Selecciona o ingresa el plazo personalizado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés Mensual (%) *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, interestRate: '10'})}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.interestRate === '10' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    10%
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, interestRate: '20'})}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.interestRate === '20' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    20%
                  </button>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="15"
                    step="0.1"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Selecciona 10% o 20%, o ingresa personalizado</p>
              </div>

              {formData.amount && formData.interestRate && formData.installments && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-blue-800 mb-3 text-center">📊 Resumen del Préstamo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Capital:</span>
                      <span className="font-bold">Bs {parseFloat(formData.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Interés por mes ({formData.interestRate}%):</span>
                      <span className="font-bold text-blue-600">Bs {(parseFloat(formData.amount) * parseFloat(formData.interestRate) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Interés total ({formData.installments} meses):</span>
                      <span className="font-bold text-blue-600">Bs {(parseFloat(formData.amount) * parseFloat(formData.interestRate) / 100 * parseInt(formData.installments)).toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-semibold">Cuota mensual:</span>
                        <span className="font-bold text-lg text-indigo-600">Bs {((parseFloat(formData.amount) + parseFloat(formData.amount) * parseFloat(formData.interestRate) / 100 * parseInt(formData.installments)) / parseInt(formData.installments)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-700 font-semibold">Total a pagar:</span>
                        <span className="font-bold text-lg text-green-600">Bs {(parseFloat(formData.amount) + parseFloat(formData.amount) * parseFloat(formData.interestRate) / 100 * parseInt(formData.installments)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Préstamo</label>
                <input
                  type="date"
                  value={formData.loanDate}
                  onChange={(e) => setFormData({...formData, loanDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {formData.loanDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Vencimiento: {(() => {
                      const [year, month, day] = calculateDueDate(formData.loanDate).split('-').map(Number);
                      return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                    })()}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="555-1234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Calle Principal #123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Información adicional..."
                  rows={2}
                ></textarea>
              </div>
              
              <button
                onClick={addLoan}
                disabled={isSaving}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold transition-all ${isSaving ? 'opacity-60 cursor-not-allowed hover:shadow-none' : 'hover:shadow-2xl'}`}
              >
                {isSaving ? 'Guardando...' : 'Registrar Préstamo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Pago de Capital</h2>
              <button onClick={() => { setShowPaymentModal(null); setPaymentAmount(''); setPaymentDate(new Date().toISOString().split('T')[0]); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Capital pendiente: <span className="font-bold text-orange-600">
                    Bs {(loans.find(l => l.id === showPaymentModal)?.remainingCapital || 0).toFixed(2)}
                  </span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100.00"
                  step="0.01"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del pago</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => addPayment(showPaymentModal, 'capital', paymentAmount)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:shadow-2xl font-semibold transition-all"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Detalles del Préstamo</h2>
              <button onClick={() => setSelectedLoan(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold text-lg">{selectedLoan.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusInfo(selectedLoan).color} items-center gap-1`}>
                    <StatusIcon size={16} />
                    {getStatusInfo(selectedLoan).text}
                  </span>
                </div>
              </div>
              
              {selectedLoan.phone && (
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-semibold">{selectedLoan.phone}</p>
                </div>
              )}
              
              {selectedLoan.address && (
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-semibold">{selectedLoan.address}</p>
                </div>
              )}

              {selectedLoan.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notas</p>
                  <p className="font-semibold">{selectedLoan.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Préstamo</p>
                  <p className="font-semibold">{selectedLoan.loanDate ? (() => {
                    const [year, month, day] = selectedLoan.loanDate.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                  })() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                  <p className="font-semibold">{selectedLoan.dueDate ? (() => {
                    const [year, month, day] = selectedLoan.dueDate.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                  })() : 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Capital Original</p>
                  <p className="font-bold text-lg">Bs {(selectedLoan.originalAmount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-600">Capital Pendiente</p>
                  <p className="font-bold text-lg text-orange-600">Bs {(selectedLoan.remainingCapital || 0).toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600">Tasa Interés</p>
                  <p className="font-bold text-lg text-purple-600">{selectedLoan.interestRate || 10}%</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Interés</p>
                  <p className="font-bold text-lg text-green-600">Bs {(selectedLoan.interest || 0).toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600">Total Adeudado</p>
                  <p className="font-bold text-lg text-red-600">Bs {((selectedLoan.remainingCapital || 0) + (selectedLoan.interest || 0)).toFixed(2)}</p>
                </div>
              </div>
              
              {selectedLoan.payments && selectedLoan.payments.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Historial de Pagos ({selectedLoan.payments.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedLoan.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold">
                            {payment.type === 'interest' ? '💰 Pago de Interés' : payment.type === 'capital' ? '🏦 Pago de Capital' : '✅ Pago Total'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.date ? new Date(payment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'}
                          </p>
                        </div>
                                                  <p className="font-bold text-lg text-green-600">Bs {(payment.amount || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Pagado:</span>
                      <span className="font-bold text-xl text-blue-600">
                        Bs {(selectedLoan.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedLoan.status === 'active' && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Acciones Rápidas</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        addPayment(selectedLoan.id, 'interest');
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg hover:shadow-xl font-semibold transition-all"
                    >
                      💰 Interés
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentModal(selectedLoan.id);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg hover:shadow-xl font-semibold transition-all"
                    >
                      🏦 Capital
                    </button>
                    <button
                      onClick={() => {
                        addPayment(selectedLoan.id, 'total');
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:shadow-xl font-semibold transition-all"
                    >
                      ✅ Total
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showReceiptPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Recibo de Cobro</h2>
              <button onClick={() => setShowReceiptPreview(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div id="receipt-content" className="p-6 bg-white">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full mb-3">
                  <DollarSign size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">RECIBO DE COBRO</h1>
                <p className="text-sm text-gray-600 mt-1">Sistema de Préstamos Pro</p>
              </div>

              <div className="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Cliente:</span>
                    <span className="font-bold text-gray-800">{showReceiptPreview.clientName}</span>
                  </div>
                  {showReceiptPreview.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Teléfono:</span>
                      <span className="font-bold text-gray-800">{showReceiptPreview.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Fecha Emisión:</span>
                    <span className="font-bold text-gray-800">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 mb-6 border-2 border-red-300">
                <h3 className="font-bold text-red-800 text-lg mb-4 text-center">⚠️ MONTO A PAGAR ⚠️</h3>
                
                {showReceiptPreview.installments && showReceiptPreview.installments > 1 ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border-2 border-cyan-300">
                      <p className="text-center text-gray-700 font-medium mb-2">Plan de Pagos a Plazos</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Cuota Mensual:</span>
                        <span className="font-bold text-2xl text-cyan-600">Bs {(showReceiptPreview.monthlyPayment || 0).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-center text-gray-600 mt-2">
                        Cuota {showReceiptPreview.currentInstallment || 1} de {showReceiptPreview.installments}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-gray-700 text-sm">Capital/Cuota:</span>
                        <p className="font-bold text-lg text-blue-600">Bs {(showReceiptPreview.monthlyCapital || 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-gray-700 text-sm">Interés/Cuota:</span>
                        <p className="font-bold text-lg text-orange-600">Bs {(showReceiptPreview.monthlyInterest || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white rounded-lg p-3">
                      <span className="text-gray-700 font-medium">Capital Pendiente Total:</span>
                      <span className="font-bold text-xl text-orange-600">Bs {(showReceiptPreview.remainingCapital || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t-2 border-red-300 pt-3">
                      <div className="flex justify-between items-center bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-4 text-white">
                        <span className="font-bold text-lg">TOTAL RESTANTE:</span>
                        <span className="font-bold text-3xl">Bs {((showReceiptPreview.remainingCapital || 0) + (showReceiptPreview.monthlyInterest || 0) * ((showReceiptPreview.installments || 1) - (showReceiptPreview.currentInstallment || 1) + 1)).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-center text-gray-600 mt-2">
                        * Si paga todo ahora, evita intereses futuros
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white rounded-lg p-3">
                      <span className="text-gray-700 font-medium">Capital Pendiente:</span>
                      <span className="font-bold text-xl text-orange-600">Bs {(showReceiptPreview.remainingCapital || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white rounded-lg p-3">
                      <span className="text-gray-700 font-medium">Interés ({showReceiptPreview.interestRate}%):</span>
                      <span className="font-bold text-xl text-blue-600">Bs {(showReceiptPreview.interest || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t-2 border-red-300 pt-3">
                      <div className="flex justify-between items-center bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-4 text-white">
                        <span className="font-bold text-lg">TOTAL A PAGAR:</span>
                        <span className="font-bold text-3xl">Bs {((showReceiptPreview.remainingCapital || 0) + (showReceiptPreview.interest || 0)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">FECHA DE VENCIMIENTO:</h4>
                    <p className="text-yellow-900 font-bold text-lg">
                      {showReceiptPreview.dueDate ? (() => {
                        const [year, month, day] = showReceiptPreview.dueDate.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      })() : 'N/A'}
                    </p>
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const [year, month, day] = showReceiptPreview.dueDate.split('-').map(Number);
                      const due = new Date(year, month - 1, day);
                      due.setHours(0, 0, 0, 0);
                      return due < today;
                    })() && (
                      <p className="text-red-600 font-bold mt-2">⚠️ PRÉSTAMO VENCIDO</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capital Original:</span>
                  <span className="font-semibold">Bs {(showReceiptPreview.originalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capital Pagado:</span>
                  <span className="font-semibold text-green-600">Bs {((showReceiptPreview.originalAmount || 0) - (showReceiptPreview.remainingCapital || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fecha Préstamo:</span>
                  <span className="font-semibold">
                    {showReceiptPreview.loanDate ? (() => {
                      const [year, month, day] = showReceiptPreview.loanDate.split('-').map(Number);
                      return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                    })() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Este es un documento de cobro generado automáticamente</p>
                <p className="mt-1">Para más información contacte a su prestamista</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={() => downloadReceipt(showReceiptPreview)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:shadow-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Descargar Recibo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toaster para mostrar notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: 'linear-gradient(to right, #10B981, #059669)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(to right, #EF4444, #DC2626)',
            },
          },
        }}
      />
    </div>
  );
};

export default LoanManagementSystem;