
import { kv } from '@vercel/kv'
import { json } from '../utils'

export const runtime = 'nodejs'

export default async function handler(req: Request){
  if(req.method === 'GET'){
    const ids = await kv.smembers<string>('loan:ids')
    const loans = [] as any[]
    for (const id of ids){
      const l = await kv.get(`loan:${id}`)
      if(l) loans.push(l)
    }
    loans.sort((a,b)=> Number(a.id)-Number(b.id))
    return json({ loans })
  }
  if(req.method === 'POST'){
    const body = await req.json()
    const id = String(Date.now())
    const loan = { id, clientName: body.clientName, phone: body.phone||'', address: body.address||'', loanMethod: body.loanMethod, monthlyRate: body.monthlyRate, originalAmount: body.originalAmount, remainingCapital: body.remainingCapital, total: body.total, loanDate: body.loanDate, dueDate: body.dueDate, status: 'active', payments: [] as any[] }
    await kv.set(`loan:${id}`, loan)
    await kv.sadd('loan:ids', id)
    return json({ ok:true, loan }, 201)
  }
  return json({ ok:false },405)
}
