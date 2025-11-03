
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  // Registrar un wrapper simple de almacenamiento en window.storage usando localStorage
  // Esto se hace en useEffect para que solo corra en el cliente y evite errores en SSR.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win: any = window;
    if (win.storage) return; // no sobrescribir si ya existe

    win.storage = {
      // Guarda un valor (string) bajo la clave
      async set(key: string, value: string) {
        try {
          localStorage.setItem(key, value);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e };
        }
      },
      // Obtiene { value } o null
      async get(key: string) {
        try {
          const v = localStorage.getItem(key);
          return v !== null ? { value: v } : null;
        } catch (e) {
          return null;
        }
      },
      // Lista claves que comienzan con el prefijo dado: devuelve { keys: string[] }
      async list(prefix: string) {
        try {
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(prefix)) keys.push(k);
          }
          return { keys };
        } catch (e) {
          return { keys: [] };
        }
      },
      // Remueve una clave
      async remove(key: string) {
        try {
          localStorage.removeItem(key);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e };
        }
      }
    };

    // Deduplicar entradas 'loan:' por una firma mínima (cliente|monto|fecha)
    try {
      const keys = Object.keys(localStorage).filter(k => typeof k === 'string' && k.startsWith('loan:'));
      const seen: Record<string, string> = {};
      const removed: string[] = [];
      for (const k of keys) {
        try {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const loan = JSON.parse(raw);
          const sig = `${loan.clientName || ''}|${loan.originalAmount || ''}|${loan.loanDate || ''}`;
          if (seen[sig]) {
            // Ya existía una entrada similar, eliminar esta
            localStorage.removeItem(k);
            removed.push(k);
          } else {
            seen[sig] = k;
          }
        } catch (e) {
          // ignore parse errors
        }
      }
      if (removed.length > 0) console.info('Removed duplicate loan keys:', removed);
    } catch (e) {
      // noop
    }
  }, []);

  return <Component {...pageProps} />;
}
