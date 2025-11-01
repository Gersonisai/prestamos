
import React, { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { login } from './utils/auth'

export default function Login({ onLogin }: { onLogin: () => void }){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  function submit(e: React.FormEvent){
    e.preventDefault()
    const ok = login(user.trim(), pass)
    if (ok) onLogin(); else setErr('Usuario o contraseña inválidos')
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 to-indigo-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4 text-indigo-700">
          <KeyRound />
          <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
        <input className="w-full mb-3 px-3 py-2 border rounded-lg" value={user} onChange={e=>setUser(e.target.value)} placeholder="Iblis"/>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input type="password" className="w-full mb-4 px-3 py-2 border rounded-lg" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Iblis04"/>
        {err && <p className="text-sm text-red-600 mb-2">{err}</p>}
        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Entrar</button>
        <p className="text-xs text-gray-500 mt-3">* Autenticación local con <code>localStorage</code>. No requiere servidor.</p>
      </form>
    </div>
  )
}
