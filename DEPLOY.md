# 🚀 Guía de Despliegue a Producción (Vercel)

## 1. Preparación de Vercel (Frontend)

1.  Ve a [vercel.com/new](https://vercel.com/new).
2.  Importa el repositorio `juntay_api`.
3.  En **Environment Variables**, configura:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT_ID].supabase.co` | URL de tu proyecto PROD |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[ANON_KEY]` | Key pública |
| `SUPABASE_SERVICE_ROLE_KEY` | `[SERVICE_KEY]` | Key privada (para Server Actions) |
| `NEXT_PUBLIC_APP_URL` | `https://juntay.io` | URL final de producción |
| `NEXT_PUBLIC_DEFAULT_TENANT_ID` | `[UUID]` | ID de la empresa "Dueña" (opcional) |

## 2. Preparación Base de Datos (Supabase PROD)

Como hemos hecho varios hot-fixes, lo más seguro es sincronizar manualmente la BD de Producción:

1.  Ve al **SQL Editor** de tu proyecto en Supabase.
2.  Copia y ejecuta el contenido de los siguientes archivos (en orden):

#### A. Estructura Base
Copia el contenido de `supabase/migrations/20240101000000_initial_schema.sql` (si existe) o exporta tu esquema local con:
```bash
npx supabase db dump > full_schema.sql
```
*(Si no tienes Supabase CLI, usa el script de auditoría para ver las tablas y recréalas).*

#### B. Migraciones Recientes (Crítico)
Ejecuta estos archivos de `supabase/migrations` uno por uno:
1. `20251224000001_sistema_intereses_avanzado.sql`
2. `20251224000002_rendimientos_inversionistas.sql`
3. `fixes/create_leads.sql` (Tabla de leads)
4. `fixes/secure_rls_phase_1.sql` (Seguridad)

## 3. Verificación Post-Deploy

1.  Entra a tu dominio (ej: `juntay.vercel.app`).
2.  Verifica que carga la **Landing SaaS** (Negro/Dorado).
3.  Ve a `/demo` y verifica que cargue la **Landing B2C**.
4.  Llena el formulario de contacto y revisa si llega a la tabla `leads` en Supabase PROD.
