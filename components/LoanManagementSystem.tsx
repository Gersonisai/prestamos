import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown, 
  AlertCircle,
  Clock,
  X,
  Download,
  PieChart,
  FileText,
  Users,
  Bell,
  Plus,
  CheckCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { Loan, Payment } from '../types/loan';

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

interface LoginForm {
  username: string;
  password: string;
}

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
  const [isSaving, setIsSaving] = useState<boolean>(false);
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
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:shadow-2xl transition-all flex items-center gap-2 font-semibold text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de Control</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">Préstamos Activos</h3>
                <p className="text-3xl font-bold">{loans.filter(l => l.status === 'active').length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">Capital Total</h3>
                <p className="text-3xl font-bold">
                  ${loans.reduce((sum, loan) => sum + (loan.originalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">Por Cobrar</h3>
                <p className="text-3xl font-bold">
                  ${loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + (loan.remainingCapital || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">Intereses Ganados</h3>
                <p className="text-3xl font-bold">
                  ${loans.reduce((sum, loan) => {
                    if (!loan.payments) return sum;
                    const interestPayments = loan.payments.filter(p => p.type === 'interest' || p.type === 'total');
                    return sum + interestPayments.reduce((pSum, p) => pSum + (p.amount || 0), 0);
                  }, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Préstamos Recientes</h2>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                <Clock size={20} />
                Actualizar
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.slice(0, 5).map(loan => {
                    const dueDate = new Date(loan.dueDate);
                    const today = new Date();
                    const isOverdue = loan.status === 'active' && dueDate < today;

                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{loan.clientName}</div>
                          <div className="text-sm text-gray-500">{loan.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${loan.originalAmount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{loan.interestRate}% interés</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${loan.remainingCapital.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loan.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : isOverdue
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {loan.status === 'paid' ? 'Pagado' : isOverdue ? 'Vencido' : 'Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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