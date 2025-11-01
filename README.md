# Zénit – Gestión de Préstamos (Público sin credenciales)

**Frontend**: Vite + React + TS + Tailwind  
**Backend**: Vercel Functions (`/api`) + **Vercel KV** para persistencia

- Sin login: cualquiera con la URL puede ver/editar.
- Tasa mensual variable (3%–20%), pagos con fecha y método, exportar Excel.

## Variables de entorno
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (se crean al añadir **Storage → KV** al proyecto). 

## Deploy
- Build: `npm run build`  ·  Output: `dist`
- `vercel.json` ya incluye filesystem + fallback SPA y mantiene `/api/*`.
