
import { kv } from '@vercel/kv'
import { json } from '../../utils'

export default async function handler(req: Request){
  if(req.method !== 'POST') return json({ ok:false },405)
  const body = await req.json()
  const url = new URL(req.url)
  const parts = url.pathname.split('/')
  const id = parts[parts.indexOf('loans')+1]
  const loan:any = await kv.get(`loan:${id}`)
  if(!loan) return json({ ok:false },404)
  const monthlyInterest = loan.originalAmount * (loan.monthlyRate/100)
  const pay = { id: String(Date.now()), date: body.date, type: body.type, method: body.method, amount: 0 }
  if(body.type==='interest'){
    pay.amount = monthlyInterest
    const d = new Date(loan.dueDate); const day=d.getDate(); d.setMonth(d.getMonth()+1); d.setDate(day); loan.dueDate = d.toISOString().split('T')[0]
  } else if(body.type==='capital'){
    const v = Number(body.amount||0)
    if(!v || v<=0) return json({ ok:false, message:'Monto inválido' },400)
    if(v > loan.remainingCapital) return json({ ok:false, message:'Excede el capital' },400)
    pay.amount = v
    loan.remainingCapital -= v
    if(loan.remainingCapital<=0){ loan.remainingCapital=0; loan.status='paid' }
  } else {
    pay.amount = loan.remainingCapital + monthlyInterest
    loan.remainingCapital = 0
    loan.status = 'paid'
  }
  loan.payments = [...(loan.payments||[]), pay]
  await kv.set(`loan:${id}`, loan)
  return json({ ok:true, loan })
}
