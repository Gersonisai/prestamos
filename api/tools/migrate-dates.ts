
import { kv } from '@vercel/kv'

export const runtime = 'nodejs'

export default async function handler(){
  const ids = await kv.smembers<string>('loan:ids')
  let fixed = 0
  const toISO = (s: string) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('/')
      return `${yyyy}-${mm}-${dd}`
    }
    return s
  }
  for (const id of ids){
    const loan:any = await kv.get(`loan:${id}`)
    if(!loan) continue
    const before = JSON.stringify([loan.loanDate, loan.dueDate])
    loan.loanDate = toISO(loan.loanDate||'')
    loan.dueDate  = toISO(loan.dueDate||'')
    const after = JSON.stringify([loan.loanDate, loan.dueDate])
    if(before!==after){ await kv.set(`loan:${id}`, loan); fixed++ }
  }
  return new Response(JSON.stringify({ ok:true, fixed }), { headers: { 'Content-Type':'application/json' } })
}
