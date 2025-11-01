
export type StorageGetResult = { value: string } | null

declare global { interface Window { storage: any } }

function keysWithPrefix(prefix: string) {
  const ks: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k) continue
    if (!prefix || k.startsWith(prefix)) ks.push(k)
  }
  return ks
}

if (typeof window !== 'undefined') {
  const api = {
    async set(key: string, value: string) { localStorage.setItem(key, value) },
    async get(key: string) { const v = localStorage.getItem(key); return v === null ? null : { value: v } },
    async list(prefix = '') { return { keys: keysWithPrefix(prefix) } },
    async remove(key: string) { localStorage.removeItem(key) },
    async clearPrefix(prefix: string) { keysWithPrefix(prefix).forEach(k => localStorage.removeItem(k)) },
  } as const
  // @ts-ignore
  if (!window.storage) window.storage = api
}
export {}
