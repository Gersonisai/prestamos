
import React, { useState, useEffect } from 'react'
import { DollarSign, User, TrendingUp, AlertCircle, CheckCircle, Clock, Plus, X, Eye, Download, Pencil, LogOut } from 'lucide-react'
import { exportExcel } from './utils/exportExcel'

type LoanMethod = 'EFECTIVO'|'TRANSFERENCIA'|'QR'

type Payment = { date: string; type: 'interest'|'capital'|'total'; method: LoanMethod; amount: number }

type Loan = {
  id: string
  clientName: string
  phone?: string
  address?: string
  loanMethod: LoanMethod
  monthlyRate: number // porcentaje 3..20
  originalAmount: number
  remainingCapital: number
  total: number
  loanDate: string
  dueDate: string
  status: 'active' | 'paid'
  payments: Payment[]
}

declare global { interface Window { storage: any } }

export default function LoanManagementSystem({ onLogout, user }: { onLogout: ()=>void, user: string }){
  const [loans, setLoans] = useState<Loan[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all'|'active'|'paid'|'overdue'>('all')
  const [selectedLoan, setSelectedLoan] = useState<Loan|null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState<{loanId: string, type: 'interest'|'capital'|'total'}|null>(null)
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().slice(0,10), method: 'EFECTIVO' as LoanMethod })
  const [formData, setFormData] = useState({ clientName: '', amount: '', rate: '10', loanDate: new Date().toISOString().slice(0,10), phone: '', address: '', loanMethod: 'EFECTIVO' as LoanMethod })
  const [editRate, setEditRate] = useState<{open:boolean, value:string}>({open:false, value:''})

  useEffect(() => { loadLoans() }, [])

  async function loadLoans() {
    try {
      const result = await window.storage.list('loan:')
      if (result && result.keys) {
        const loaded = await Promise.all(result.keys.map(async (k: string) => {
          const data = await window.storage.get(k)
          return data ? JSON.parse(data.value) as Loan : null
        }))
        setLoans(loaded.filter((l: Loan|null) => l !== null) as Loan[])
      }
    } catch (e) { setLoans([]) }
  }

  function calculateDueDate(loanDateStr: string) {
    const loanDate = new Date(loanDateStr)
    const day = loanDate.getDate()
    const nextMonth = new Date(loanDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(day)
    return nextMonth.toISOString().split('T')[0]
  }

  function monthlyInterest(l: Loan){ return l.originalAmount * (l.monthlyRate/100) }

  async function addLoan() {
    if (!formData.clientName || !formData.amount) { alert('Completa cliente y monto'); return }
    const amount = parseFloat(formData.amount)
    let rate = Number(formData.rate)
    if (isNaN(rate)) rate = 10
    if (rate < 3 || rate > 20) { alert('La tasa debe estar entre 3% y 20%'); return }
    const total = amount + amount*rate/100
    const dueDate = calculateDueDate(formData.loanDate)
    const newLoan: Loan = { id: String(Date.now()), clientName: formData.clientName, phone: formData.phone, address: formData.address, loanMethod: formData.loanMethod, monthlyRate: rate, originalAmount: amount, remainingCapital: amount, total, loanDate: formData.loanDate, dueDate, status: 'active', payments: [] }
    await window.storage.set(`loan:${newLoan.id}`, JSON.stringify(newLoan))
    setLoans(prev => [...prev, newLoan])
    setFormData({ clientName: '', amount: '', rate: '10', loanDate: new Date().toISOString().slice(0,10), phone: '', address: '', loanMethod: 'EFECTIVO' })
    setShowAddForm(false)
  }

  async function updateRate(loan: Loan, newRate: number){
    const updated = { ...loan, monthlyRate: newRate, total: loan.originalAmount + loan.originalAmount*newRate/100 }
    await window.storage.set(`loan:${loan.id}`, JSON.stringify(updated))
    setLoans(prev => prev.map(l => l.id === loan.id ? updated : l))
    setSelectedLoan(updated)
  }

  async function addPayment(loanId: string, type: 'interest'|'capital'|'total', date: string, method: LoanMethod, amountStr?: string) {
    const loan = loans.find(l => l.id === loanId)
    if (!loan) return
    const updated = { ...loan }
    const payment: Payment = { date, type, method, amount: 0 }

    if (type === 'interest') {
      payment.amount = monthlyInterest(loan)
      updated.dueDate = calculateDueDate(loan.dueDate)
    } else if (type === 'capital') {
      const v = Number(amountStr)
      if (!v || v <= 0) { alert('Monto inválido'); return }
      if (v > updated.remainingCapital) { alert('Excede el capital'); return }
      payment.amount = v
      updated.remainingCapital -= v
      if (updated.remainingCapital <= 0) { updated.remainingCapital = 0; updated.status = 'paid' }
    } else {
      payment.amount = updated.remainingCapital + monthlyInterest(loan)
      updated.remainingCapital = 0
      updated.status = 'paid'
    }

    updated.payments = [...(updated.payments || []), payment]
    await window.storage.set(`loan:${loanId}`, JSON.stringify(updated))
    setLoans(prev => prev.map(l => l.id === loanId ? updated : l))
    if (selectedLoan?.id === loanId) setSelectedLoan(updated)
    setShowPaymentModal(null)
    setPaymentForm({ amount: '', date: new Date().toISOString().slice(0,10), method: 'EFECTIVO' })
  }

  function getStatusInfo(loan: Loan) {
    if (loan.status === 'paid') return { text: 'Pagado', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    const today = new Date(); const due = new Date(loan.dueDate)
    if (due < today) return { text: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    return { text: 'Activo', color: 'bg-blue-100 text-blue-800', icon: Clock }
  }

  const filtered = loans.filter(l => filterStatus === 'all' ? true : filterStatus === 'active' ? l.status === 'active' : filterStatus === 'paid' ? l.status === 'paid' : (l.status === 'active' && new Date(l.dueDate) < new Date()))
  const totalLent = loans.reduce((s, l) => s + (l.originalAmount || 0), 0)
  const totalPending = loans.filter(l => l.status === 'active').reduce((s, l) => s + (l.remainingCapital || 0), 0)
  const totalInterest = loans.reduce((s, l) => s + ((l.payments||[]).filter(p => p.type !== 'capital').reduce((ss, p) => ss + p.amount, 0)), 0)
  const activeLoans = loans.filter(l => l.status === 'active').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><DollarSign className="text-indigo-600" size={36}/> Sistema de Gestión de Préstamos</h1>
              <p className="text-gray-600 mt-2">Administra tus préstamos con tasa mensual variable (3%–20%).</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Hola, {user}</span>
              <button className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200" onClick={onLogout} title="Cerrar sesión"><LogOut size={18}/></button>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700" onClick={()=>exportExcel(loans)} title="Exportar a Excel"><Download size={20}/> Excel</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700" onClick={()=>setShowAddForm(true)}><Plus size={20}/> Nuevo Préstamo</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Capital Total</p><p className="text-2xl font-bold">${totalLent.toFixed(2)}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Capital Pendiente</p><p className="text-2xl font-bold text-orange-600">${totalPending.toFixed(2)}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Intereses Ganados</p><p className="text-2xl font-bold text-green-600">${totalInterest.toFixed(2)}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Préstamos Activos</p><p className="text-2xl font-bold text-indigo-600">{activeLoans}</p></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button onClick={()=>setFilterStatus('all')} className={`px-4 py-2 rounded-lg ${filterStatus==='all'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-700'}`}>Todos</button>
              <button onClick={()=>setFilterStatus('active')} className={`px-4 py-2 rounded-lg ${filterStatus==='active'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>Activos</button>
              <button onClick={()=>setFilterStatus('overdue')} className={`px-4 py-2 rounded-lg ${filterStatus==='overdue'?'bg-red-600 text-white':'bg-gray-200 text-gray-700'}`}>Vencidos</button>
              <button onClick={()=>setFilterStatus('paid')} className={`px-4 py-2 rounded-lg ${filterStatus==='paid'?'bg-green-600 text-white':'bg-gray-200 text-gray-700'}`}>Pagados</button>
            </div>
          </div>

          {filtered.length === 0 ? (<p className="text-center text-gray-500 py-8">No hay préstamos para mostrar</p>) : (
            filtered.map(loan => {
              const status = getStatusInfo(loan)
              const Icon = status.icon as any
              const capitalPaid = (loan.originalAmount || 0) - (loan.remainingCapital || 0)
              const progress = loan.originalAmount ? (capitalPaid/loan.originalAmount)*100 : 0
              const interest = monthlyInterest(loan)
              return (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{loan.clientName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1`}><Icon size={14}/> {status.text}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-sm mb-2">
                        <div><p className="text-gray-600">Capital Original</p><p className="font-semibold">${(loan.originalAmount||0).toFixed(2)}</p></div>
                        <div><p className="text-gray-600">Capital Pendiente</p><p className="font-semibold text-orange-600">${(loan.remainingCapital||0).toFixed(2)}</p></div>
                        <div><p className="text-gray-600">Capital Pagado</p><p className="font-semibold text-green-600">${capitalPaid.toFixed(2)}</p></div>
                        <div><p className="text-gray-600">Tasa Mensual</p><p className="font-semibold">{loan.monthlyRate}%</p></div>
                        <div><p className="text-gray-600">Interés Mensual</p><p className="font-semibold text-blue-600">${interest.toFixed(2)}</p></div>
                        <div><p className="text-gray-600">Método Préstamo</p><p className="font-semibold">{loan.loanMethod}</p></div>
                        <div><p className="text-gray-600">Vencimiento</p><p className="font-semibold">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('es-ES') : 'N/A'}</p></div>
                      </div>
                      {loan.status==='active' && (<div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: `${progress}%`}}/></div>)}
                    </div>
                    <div className="flex gap-2 ml-4 items-start">
                      <button className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200" title="Ver detalles" onClick={()=>{ setSelectedLoan(loan); setEditRate({open:false, value:''}) }}><Eye size={20}/></button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Nuevo Préstamo</h2><button onClick={()=>setShowAddForm(false)} className="text-gray-500 hover:text-gray-700"><X size={24}/></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Cliente *</label><input className="w-full px-3 py-2 border rounded-lg" value={formData.clientName} onChange={e=>setFormData({...formData, clientName:e.target.value})} placeholder="Juan Pérez"/></div>
              <div><label className="block text-sm font-medium mb-1">Monto *</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.amount} onChange={e=>setFormData({...formData, amount:e.target.value})} step="0.01" placeholder="1000"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Tasa Mensual (3%–20%)</label>
                  <input type="number" min={3} max={20} step="0.1" className="w-full px-3 py-2 border rounded-lg" value={formData.rate} onChange={e=>setFormData({...formData, rate:e.target.value})} />
                  {(formData.amount && formData.rate) && (<p className="text-sm text-gray-600 mt-1">Interés: ${(parseFloat(formData.amount||'0')*Number(formData.rate||'10')/100).toFixed(2)} · Total: {(parseFloat(formData.amount||'0')*(1+Number(formData.rate||'10')/100)).toFixed(2)}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Método del Préstamo</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={formData.loanMethod} onChange={e=>setFormData({...formData, loanMethod: e.target.value as LoanMethod})}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="QR">QR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Fecha del Préstamo</label><input type="date" className="w-full px-3 py-2 border rounded-lg" value={formData.loanDate} onChange={e=>setFormData({...formData, loanDate:e.target.value})}/><p className="text-sm text-gray-600 mt-1">Vencimiento: {new Date(calculateDueDate(formData.loanDate)).toLocaleDateString('es-ES')}</p></div>
                <div><label className="block text-sm font-medium mb-1">Teléfono</label><input className="w-full px-3 py-2 border rounded-lg" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="555-1234"/></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Dirección</label><input className="w-full px-3 py-2 border rounded-lg" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} placeholder="Calle Principal #123"/></div>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold" onClick={addLoan}>Registrar Préstamo</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{showPaymentModal.type === 'capital' ? 'Pago de Capital' : showPaymentModal.type === 'interest' ? 'Pago de Interés' : 'Pago Total'}</h2><button onClick={()=>{setShowPaymentModal(null); setPaymentForm({ amount:'', date: new Date().toISOString().slice(0,10), method: 'EFECTIVO' })}} className="text-gray-500 hover:text-gray-700"><X size={24}/></button></div>
            <div className="space-y-4">
              {showPaymentModal.type === 'capital' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Monto a pagar</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={paymentForm.amount} onChange={e=>setPaymentForm({...paymentForm, amount: e.target.value})} step="0.01" placeholder="100.00"/>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha del pago</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-lg" value={paymentForm.date} onChange={e=>setPaymentForm({...paymentForm, date: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Método de pago</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={paymentForm.method} onChange={e=>setPaymentForm({...paymentForm, method: e.target.value as LoanMethod})}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="QR">QR</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold" onClick={()=>addPayment(showPaymentModal.loanId, showPaymentModal.type, paymentForm.date, paymentForm.method, paymentForm.amount)}>Registrar Pago</button>
            </div>
          </div>
        </div>
      )}

      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Detalles del Préstamo</h2><button onClick={()=>{ setSelectedLoan(null); setEditRate({open:false, value:''}) }} className="text-gray-500 hover:text-gray-700"><X size={24}/></button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-600">Cliente</p><p className="font-semibold text-lg">{selectedLoan.clientName}</p></div>
                <div><p className="text-sm text-gray-600">Estado</p>{(()=>{const s=getStatusInfo(selectedLoan); const Icon=s.icon as any; return <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${s.color} items-center gap-1`}><Icon size={16}/> {s.text}</span>})()}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="bg-gray-50 p-3 rounded-lg"><p className="text-sm text-gray-600">Capital Original</p><p className="font-bold text-lg">${(selectedLoan.originalAmount||0).toFixed(2)}</p></div>
                <div className="bg-orange-50 p-3 rounded-lg"><p className="text-sm text-gray-600">Capital Pendiente</p><p className="font-bold text-lg text-orange-600">${(selectedLoan.remainingCapital||0).toFixed(2)}</p></div>
                <div className="bg-indigo-50 p-3 rounded-lg"><p className="text-sm text-gray-600">Tasa Mensual</p><p className="font-bold text-lg">{selectedLoan.monthlyRate}%</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-sm text-gray-600">Interés Mensual</p><p className="font-bold text-lg text-green-600">${monthlyInterest(selectedLoan).toFixed(2)}</p></div>
              </div>
              <div className="pt-2">
                {!editRate.open ? (
                  <button className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={()=>setEditRate({open:true, value: String(selectedLoan.monthlyRate)})}><Pencil size={16}/> Editar tasa</button>
                ) : (
                  <div className="flex items-end gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nueva tasa (3%–20%)</label>
                      <input type="number" min={3} max={20} step="0.1" className="px-3 py-2 border rounded-lg" value={editRate.value} onChange={e=>setEditRate({...editRate, value:e.target.value})}/>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700" onClick={()=>{ const r = Number(editRate.value); if(r>=3 && r<=20){ updateRate(selectedLoan, r); setEditRate({open:false, value:''}); } else { alert('La tasa debe estar entre 3% y 20%') } }}>Guardar</button>
                    <button className="bg-gray-100 px-3 py-2 rounded-lg" onClick={()=>setEditRate({open:false, value:''})}>Cancelar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
