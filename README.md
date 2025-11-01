# Zénit – Gestión de Préstamos (Público sin credenciales, FIX fechas)

**Frontend**: Vite + React + TS + Tailwind  
**Backend**: Vercel Functions (`/api`) + **Vercel KV** (persistencia)

## Novedades del FIX
- Normalización de fechas: acepta `YYYY-MM-DD` (valor de `<input type="date">`) y `DD/MM/YYYY` si el usuario teclea manualmente. Convierte todo a ISO.
- Validación previa a `toISOString()` para evitar `RangeError: Invalid time value`.
- Utilidades: `parseDate`, `ensureISODateOnly`, `formatLocalDate`, `calcDue`.
- Endpoint opcional de migración: `GET /api/tools/migrate-dates` para convertir fechas antiguas `DD/MM/YYYY` guardadas en KV a `YYYY-MM-DD`.

## Variables de entorno
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (al añadir **Storage → Upstash / KV** desde el marketplace).

## Deploy
- Build: `npm run build`  ·  Output: `dist`
- `vercel.json` con filesystem-first y fallback SPA; preserva `/api/*`.

## Comprobación
- `GET /api/loans` → `{"loans":[]}` si está vacío.
- Crear un préstamo desde la UI; probar también tecleando la fecha como `30/10/2025`.

