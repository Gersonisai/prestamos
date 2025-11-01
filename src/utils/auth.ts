
export type AuthState = { logged: boolean, user?: string }
const KEY = 'zenit-auth'

export function getAuth(): AuthState {
  try { return JSON.parse(localStorage.getItem(KEY) || '{"logged":false}') } catch { return { logged: false } }
}
export function login(user: string, pass: string): boolean {
  // Credenciales fijas solicitadas por el usuario
  const ok = (user === 'Iblis' && pass === 'Iblis04')
  const state: AuthState = { logged: ok, user: ok ? user : undefined }
  localStorage.setItem(KEY, JSON.stringify(state))
  return ok
}
export function logout(){ localStorage.removeItem(KEY) }
