import React, { useEffect, useState } from 'react'
import LoanManagementSystem from './loan_management_system'
import Login from './Login'
import { getAuth, logout } from './utils/auth'

export default function App(){
  const [auth, setAuth] = useState(getAuth())
  useEffect(()=>{ setAuth(getAuth()) }, [])
  if(!auth.logged) return <Login onLogin={()=>setAuth(getAuth())} />
  return <LoanManagementSystem onLogout={()=>{ logout(); setAuth(getAuth()) }} user={auth.user||'Iblis'} />
}
