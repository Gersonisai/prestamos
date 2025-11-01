import React, { useEffect, useMemo, useState } from 'react'
import { DollarSign, AlertCircle, CheckCircle, Clock, Plus, X, Eye, Download } from 'lucide-react'
import { exportExcel } from './utils/exportExcel'

export type LoanMethod = 'EFECTIVO'|'TRANSFERENCIA'|'QR'
export type Payment = { id: string; date: string; type: 'interest'|'capital'|'total'; method: LoanMethod; amount: number }
export type Loan = { id: string; clientName: string; phone?: string; address?: string; loanMethod: LoanMethod; monthlyRate: number; originalAmount: number; remainingCapital: number; total: number; loanDate: string; dueDate: string; status: 'active'|'paid'; payments: Payment[] }

export default function Loans(){
  const [loans,setLoans] = useState<Loan[]>([])
  const [showAdd,setShowAdd] = useState(false)
  const [showPayment,setShowPayment] = useState<{loanId:string,type:'interest'|'capital'|'total'}|null>(null)
  const [paymentForm,setPaymentForm] = useState({ amount:'', date:new Date().toISOString().slice(0,10), method:'EFECTIVO' as LoanMethod })
  const [form,setForm] = useState({ clientName:'', amount:'', rate:'10', loanDate:new Date().toISOString().slice(0,10), phone:'', address:'', loanMethod:'EFECTIVO' as LoanMethod })
  const [selected,setSelected] = useState<Loan|null>(null)
  const [filter,setFilter] = useState<'all'|'active'|'paid'|'overdue'>('all')

  async function load(){ const r = await fetch('/api/loans'); const j = await r.json(); setLoans(j.loans||[]) }
  useEffect(()=>{ load() },[])

  function statusInfo(l:Loan){ if(l.status==='paid') return {text:'Pagado', color:'bg-green-100 text-green-800', icon:CheckCircle as any}; const today=new Date(); const due=new Date(l.dueDate); if(due<today) return {text:'Vencido', color:'bg-red-100 text-red-800', icon:AlertCircle as any}; return {text:'Activo', color:'bg-blue-100 text-blue-800', icon:Clock as any} }
  function calcDue(d:string){ const dt=new Date(d); const day=dt.getDate(); const nm=new Date(dt); nm.setMonth(nm.getMonth()+1); nm.setDate(day); return nm.toISOString().split('T')[0] }

  async function addLoan(){ if(!form.clientName||!form.amount) return alert('Completa cliente y monto'); const amount=parseFloat(form.amount); const rate=Math.max(3,Math.min(20,Number(form.rate)||10)); const total = amount + amount*rate/100; const dueDate = calcDue(form.loanDate); const body = { clientName:form.clientName, phone:form.phone, address:form.address, loanMethod:form.loanMethod, monthlyRate:rate, originalAmount:amount, remainingCapital:amount, total, loanDate:form.loanDate, dueDate }; const r = await fetch('/api/loans',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}); if(r.ok){ setShowAdd(false); setForm({ clientName:'', amount:'', rate:'10', loanDate:new Date().toISOString().slice(0,10), phone:'', address:'', loanMethod:'EFECTIVO' }); load(); } else alert('Error al crear préstamo') }

  async function addPayment(loanId:string, type:'interest'|'capital'|'total'){ const body:any = { type, date:paymentForm.date, method:paymentForm.method }; if(type==='capital') body.amount = Number(paymentForm.amount); const r = await fetch(`/api/loans/${loanId}/payments`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}); if(r.ok){ setShowPayment(null); setPaymentForm({ amount:'', date:new Date().toISOString().slice(0,10), method:'EFECTIVO' }); load(); } else alert('Error al registrar pago') }

  const filtered = useMemo(()=> loans.filter(l => filter==='all'? true : filter==='active'? l.status==='active' : filter==='paid'? l.status==='paid' : (l.status==='active' && new Date(l.dueDate)<new Date())), [loans,filter])
  const totalLent = loans.reduce((s,l)=> s+(l.originalAmount||0),0)
  const totalPending = loans.filter(l=>l.status==='active').reduce((s,l)=> s+(l.remainingCapital||0),0)
  const totalInterest = loans.reduce((s,l)=> s+((l.payments||[]).filter(p=>p.type!=='capital').reduce((ss,p)=> ss+p.amount,0)),0)
  const activeLoans = loans.filter(l=>l.status==='active').length

  return (<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
    <div className='max-w-7xl mx-auto'>
      <header className='bg-white rounded-lg shadow-lg p-6 mb-6'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'><DollarSign className='text-indigo-600' size={36}/> Sistema de Gestión de Préstamos</h1>
            <p className='text-gray-600 mt-2'>Administra tus préstamos con tasa mensual variable (3%–20%).</p>
          </div>
          <div className='flex items-center gap-2'>
            <button className='bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700' onClick={()=>exportExcel(loans)} title='Exportar a Excel'><Download size={20}/> Excel</button>
            <button className='bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700' onClick={()=>setShowAdd(true)}><Plus size={20}/> Nuevo Préstamo</button>
          </div>
        </div>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-lg shadow p-6'><p className='text-sm text-gray-600'>Capital Total</p><p className='text-2xl font-bold'>${totalLent.toFixed(2)}</p></div>
        <div className='bg-white rounded-lg shadow p-6'><p className='text-sm text-gray-600'>Capital Pendiente</p><p className='text-2xl font-bold text-orange-600'>${totalPending.toFixed(2)}</p></div>
        <div className='bg-white rounded-lg shadow p-6'><p className='text-sm text-gray-600'>Intereses Ganados</p><p className='text-2xl font-bold text-green-600'>${totalInterest.toFixed(2)}</p></div>
        <div className='bg-white rounded-lg shadow p-6'><p className='text-sm text-gray-600'>Préstamos Activos</p><p className='text-2xl font-bold text-indigo-600'>{activeLoans}</p></div>
      </div>

      <div className='bg-white rounded-lg shadow-lg p-6'>
        {filtered.length===0? (<p className='text-center text-gray-500 py-8'>No hay préstamos para mostrar</p>) : filtered.map(loan=>{
          const s = statusInfo(loan); const Icon:any = s.icon; const capitalPaid=(loan.originalAmount||0)-(loan.remainingCapital||0); const progress = loan.originalAmount? (capitalPaid/loan.originalAmount)*100:0; const interest = loan.originalAmount*(loan.monthlyRate/100)
          return (<div key={loan.id} className='border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md'>
            <div className='flex justify-between items-start'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <h3 className='text-lg font-bold'>{loan.clientName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.color} flex items-center gap-1`}><Icon size={14}/> {s.text}</span>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-7 gap-3 text-sm mb-2'>
                  <div><p className='text-gray-600'>Capital Original</p><p className='font-semibold'>${loan.originalAmount.toFixed(2)}</p></div>
                  <div><p className='text-gray-600'>Capital Pendiente</p><p className='font-semibold text-orange-600'>${loan.remainingCapital.toFixed(2)}</p></div>
                  <div><p className='text-gray-600'>Capital Pagado</p><p className='font-semibold text-green-600'>${capitalPaid.toFixed(2)}</p></div>
                  <div><p className='text-gray-600'>Tasa Mensual</p><p className='font-semibold'>{loan.monthlyRate}%</p></div>
                  <div><p className='text-gray-600'>Interés Mensual</p><p className='font-semibold text-blue-600'>${interest.toFixed(2)}</p></div>
                  <div><p className='text-gray-600'>Método</p><p className='font-semibold'>{loan.loanMethod}</p></div>
                  <div><p className='text-gray-600'>Vencimiento</p><p className='font-semibold'>{new Date(loan.dueDate).toLocaleDateString('es-ES')}</p></div>
                </div>
                {loan.status==='active' && (<div className='w-full bg-gray-200 rounded-full h-2'><div className='bg-green-500 h-2 rounded-full' style={{width:`${progress}%`}}/></div>)}
              </div>
              <div className='flex gap-2 ml-4 items-start'>
                <button className='bg-gray-100 p-2 rounded-lg hover:bg-gray-200' title='Ver detalles' onClick={()=>setSelected(loan)}><Eye size={20}/></button>
                {loan.status==='active' && (<>
                  <button className='bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 text-sm' onClick={()=>setShowPayment({loanId:loan.id,type:'interest'})}>Interés</button>
                  <button className='bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm' onClick={()=>setShowPayment({loanId:loan.id,type:'capital'})}>Capital</button>
                  <button className='bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm' onClick={()=>setShowPayment({loanId:loan.id,type:'total'})}>Total</button>
                </>)}
              </div>
            </div>
          </div>)
        })}
      </div>
    </div>

    {showAdd && (<div className='fixed inset-0 bg-black/50 grid place-items-center p-4 z-50'><div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
      <div className='flex justify-between items-center mb-4'><h2 className='text-2xl font-bold'>Nuevo Préstamo</h2><button onClick={()=>setShowAdd(false)} className='text-gray-500 hover:text-gray-700'><X size={24}/></button></div>
      <div className='space-y-4'>
        <div><label className='block text-sm font-medium mb-1'>Cliente *</label><input className='w-full px-3 py-2 border rounded-lg' value={form.clientName} onChange={e=>setForm({...form, clientName:e.target.value})} placeholder='Juan Pérez'/></div>
        <div><label className='block text-sm font-medium mb-1'>Monto *</label><input type='number' className='w-full px-3 py-2 border rounded-lg' value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} step='0.01' placeholder='1000'/></div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-end'>
          <div><label className='block text-sm font-medium mb-1'>Tasa Mensual (3%–20%)</label><input type='number' min={3} max={20} step='0.1' className='w-full px-3 py-2 border rounded-lg' value={form.rate} onChange={e=>setForm({...form, rate:e.target.value})}/>{form.amount && form.rate && (<p className='text-sm text-gray-600 mt-1'>Interés: {(parseFloat(form.amount||'0')*Number(form.rate||'10')/100).toFixed(2)} · Total: {(parseFloat(form.amount||'0')*(1+Number(form.rate||'10')/100)).toFixed(2)}</p>)}</div>
          <div><label className='block text-sm font-medium mb-1'>Método</label><select className='w-full px-3 py-2 border rounded-lg' value={form.loanMethod} onChange={e=>setForm({...form, loanMethod:e.target.value as any})}><option value='EFECTIVO'>Efectivo</option><option value='TRANSFERENCIA'>Transferencia</option><option value='QR'>QR</option></select></div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'><div><label className='block text-sm font-medium mb-1'>Fecha del Préstamo</label><input type='date' className='w-full px-3 py-2 border rounded-lg' value={form.loanDate} onChange={e=>setForm({...form, loanDate:e.target.value})}/><p className='text-sm text-gray-600 mt-1'>Vencimiento: {new Date(new Date(form.loanDate).setMonth(new Date(form.loanDate).getMonth()+1)).toLocaleDateString('es-ES')}</p></div><div><label className='block text-sm font-medium mb-1'>Teléfono</label><input className='w-full px-3 py-2 border rounded-lg' value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder='555-1234'/></div></div>
        <div><label className='block text-sm font-medium mb-1'>Dirección</label><input className='w-full px-3 py-2 border rounded-lg' value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder='Calle Principal #123'/></div>
        <button className='w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold' onClick={addLoan}>Registrar Préstamo</button>
      </div></div></div>)}

    {showPayment && (<div className='fixed inset-0 bg-black/50 grid place-items-center p-4 z-50'><div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
      <div className='flex justify-between items-center mb-4'><h2 className='text-2xl font-bold'>{showPayment.type==='capital'? 'Pago de Capital': showPayment.type==='interest'? 'Pago de Interés':'Pago Total'}</h2><button onClick={()=>{setShowPayment(null); setPaymentForm({ amount:'', date:new Date().toISOString().slice(0,10), method:'EFECTIVO' })}} className='text-gray-500 hover:text-gray-700'><X size={24}/></button></div>
      <div className='space-y-4'>
        {showPayment.type==='capital' && (<div><label className='block text-sm font-medium mb-1'>Monto a pagar</label><input type='number' className='w-full px-3 py-2 border rounded-lg' value={paymentForm.amount} onChange={e=>setPaymentForm({...paymentForm, amount:e.target.value})} step='0.01' placeholder='100.00'/></div>)}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'><div><label className='block text-sm font-medium mb-1'>Fecha del pago</label><input type='date' className='w-full px-3 py-2 border rounded-lg' value={paymentForm.date} onChange={e=>setPaymentForm({...paymentForm, date:e.target.value})}/></div><div><label className='block text-sm font-medium mb-1'>Método de pago</label><select className='w-full px-3 py-2 border rounded-lg' value={paymentForm.method} onChange={e=>setPaymentForm({...paymentForm, method:e.target.value as any})}><option value='EFECTIVO'>Efectivo</option><option value='TRANSFERENCIA'>Transferencia</option><option value='QR'>QR</option></select></div></div>
        <button className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold' onClick={()=>addPayment(showPayment.loanId, showPayment.type)}>Registrar Pago</button>
      </div></div></div>)}

    {selected && (<div className='fixed inset-0 bg-black/50 grid place-items-center p-4 z-50'><div className='bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto'><div className='flex justify-between items-center mb-4'><h2 className='text-2xl font-bold'>Detalles del Préstamo</h2><button onClick={()=>setSelected(null)} className='text-gray-500 hover:text-gray-700'><X size={24}/></button></div><div className='space-y-4'><div className='grid grid-cols-2 gap-4'><div><p className='text-sm text-gray-600'>Cliente</p><p className='font-semibold text-lg'>{selected.clientName}</p></div><div><p className='text-sm text-gray-600'>Estado</p><span className='inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-gray-100'>{selected.status}</span></div></div><div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t'><div className='bg-gray-50 p-3 rounded-lg'><p className='text-sm text-gray-600'>Capital Original</p><p className='font-bold text-lg'>${selected.originalAmount.toFixed(2)}</p></div><div className='bg-orange-50 p-3 rounded-lg'><p className='text-sm text-gray-600'>Capital Pendiente</p><p className='font-bold text-lg text-orange-600'>${selected.remainingCapital.toFixed(2)}</p></div><div className='bg-indigo-50 p-3 rounded-lg'><p className='text-sm text-gray-600'>Tasa Mensual</p><p className='font-bold text-lg'>{selected.monthlyRate}%</p></div><div className='bg-green-50 p-3 rounded-lg'><p className='text-sm text-gray-600'>Interés Mensual</p><p className='font-bold text-lg text-green-600'>${(selected.originalAmount*(selected.monthlyRate/100)).toFixed(2)}</p></div></div></div></div></div>)}
  </div>)
}
