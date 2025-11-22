# 🚀 Guía de Deployment - Sistema de Bóveda y Cajas

## 📋 Pre-Deployment Checklist

- [ ] Código compilado sin errores TypeScript
- [ ] Todas las pruebas pasadas (PLAN_TESTING_BOVEDA.md)
- [ ] Migración SQL revisada
- [ ] Variables de entorno configuradas
- [ ] Backups de base de datos existente
- [ ] Plan de rollback preparado
- [ ] Documentación actualizada

---

## 🛠️ Paso 1: Preparación del Entorno

### 1.1 Variables de Entorno

Verificar que existen en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 1.2 Dependencias

```bash
# Instalar dependencias si es necesario
npm install

# Verificar que todos los paquetes están actualizados
npm audit
```

### 1.3 Compilación

```bash
# Compilar proyecto
npm run build

# Verificar que compiló sin errores
# Revisar que no hay warnings importantes
```

---

## 🗄️ Paso 2: Migración de Base de Datos

### 2.1 Backup Previo

```bash
# Desde Supabase Dashboard
# 1. Ir a Backups
# 2. Crear backup manual
# 3. Esperar confirmación
# Alternativa: Exportar SQL de toda la base de datos
pg_dump -h [host] -U postgres -d [db] > backup_$(date +%Y%m%d).sql
```

### 2.2 Ejecutar Migración

**Opción A: Desde Supabase Dashboard**

1. Ir a: Database → SQL Editor
2. Abrir archivo: `supabase/migrations/20251118_boveda_cajas_tasaciones.sql`
3. Copiar y pegar el contenido
4. Ejecutar (click verde "Run" o Ctrl+Enter)
5. Esperar confirmación

**Opción B: Desde Supabase CLI**

```bash
# Si tienes Supabase CLI instalado
supabase migration list

# Aplicar migración
supabase db push

# Verificar estado
supabase migration list --local
```

### 2.3 Verificación

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Debería mostrar:
-- bienes
-- boveda_central
-- cajas_pesonales
-- creditos (actualizada)
-- movimientos_boveda_auditoria
-- movimientos_caja_pesonal
-- tasaciones

-- Verificar índices
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Verificar RLS habilitado
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND row_security_enabled;
```

---

## 👥 Paso 3: Configuración de Usuarios y Roles

### 3.1 Crear Rol de Admin

```sql
-- En la tabla users o profiles (según tu setup)
-- Crear/Actualizar un usuario con role: 'admin'

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"admin"'::jsonb
)
WHERE email = 'admin@tuempresa.com';
```

### 3.2 Crear Usuarios de Prueba

```sql
-- Script para crear usuarios de prueba (manual en Supabase Dashboard)
-- 1. Auth → Users
-- 2. Crear nuevo usuario con email
-- 3. Set contraseña
-- 4. Verificar email

-- Usuarios a crear:
-- - cajero1@empresa.com (role: 'cajero')
-- - cajero2@empresa.com (role: 'cajero')
-- - tasador1@empresa.com (role: 'tasador')
-- - admin@empresa.com (role: 'admin')
```

### 3.3 Inicializar Bóveda Central

```sql
-- Una sola bóveda en el sistema
INSERT INTO boveda_central (
  numero, 
  saldo_total, 
  saldo_disponible, 
  saldo_asignado, 
  estado, 
  descripcion
) VALUES (
  1, 
  0, 
  0, 
  0, 
  'activa', 
  'Bóveda central del negocio'
) ON CONFLICT DO NOTHING;
```

### 3.4 Inicializar Cajas Personales (Opcional)

```sql
-- Se crean automáticamente cuando usuario accede
-- Pero puedes pre-crear si deseas:

INSERT INTO cajas_pesonales (
  usuario_id, 
  numero_caja, 
  saldo_total, 
  estado
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'cajero1@empresa.com'),
  1,
  0,
  'activa'
) ON CONFLICT DO NOTHING;
```

---

## 🌐 Paso 4: Configuración de Aplicación

### 4.1 Actualizar Variables de Entorno

```bash
# .env.local o .env.production.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# API
NEXT_PUBLIC_API_URL=https://tudominio.com

# Opcional: Analytics
NEXT_PUBLIC_SEGMENT_KEY=xxxxx
NEXT_PUBLIC_SENTRY_DSN=xxxxx
```

### 4.2 Verificar Configuración de CORS

En Supabase Dashboard:
- Auth → Settings → Authorized Redirect URLs
- Agregar: https://tudominio.com/auth/callback

---

## 🧪 Paso 5: Testing de Deployment

### 5.1 Testing Local

```bash
# Compilar y ejecutar localmente
npm run build
npm run start

# Acceder a http://localhost:3000
# Ejecutar tests de la FASE 1-3 del PLAN_TESTING_BOVEDA.md
```

### 5.2 Testing de Staging (si disponible)

```bash
# Desplegar a staging
# Ejecutar suite completa de tests

# Verificar:
# - Bóveda funcional
# - Cajas personales funcionales
# - Tasaciones funcionales
# - Créditos funcionales
```

### 5.3 Validación Final

- [ ] No hay errores en consola
- [ ] No hay warnings importantes
- [ ] RLS está funcionando (usuarios ven solo sus datos)
- [ ] Operaciones de escritura actualizan correctamente
- [ ] Auditoría registra movimientos

---

## 🚀 Paso 6: Deployment a Producción

### 6.1 Build Final

```bash
# Crear build optimizado
npm run build

# Revisar size del build
# Warning si > 500KB para ruta

# Ejecutar linter final
npm run lint
```

### 6.2 Despliegue (Vercel)

```bash
# Si usas Vercel (recomendado para Next.js)

# Opción A: Conectar GitHub
# 1. Push a rama main
# 2. Vercel detecta automáticamente
# 3. Build y deploy automático

# Opción B: Deploy manual
vercel --prod

# Opción C: Deploy desde dashboard
# 1. Ir a Vercel.com
# 2. Seleccionar proyecto
# 3. Clickear "Deploy"
```

### 6.3 Verificación Post-Deploy

```bash
# Acceder a https://tudominio.com
# Ejecutar:
# 1. Login con usuario admin
# 2. Acceder a Bóveda Central
# 3. Crear ingreso de $100
# 4. Asignar $50 a caja personal
# 5. Verificar que bóveda se actualiza

# Si todo funciona ✅
```

---

## 📊 Paso 7: Monitoreo Post-Deployment

### 7.1 Configurar Logging

```bash
# Opcional: Sentry para monitoreo de errores
npm install @sentry/nextjs

# En next.config.js:
withSentryConfig(nextConfig, {
  org: "tu-org",
  project: "juntay-api",
});
```

### 7.2 Verificar Health

```bash
# API endpoint para verificar salud
# GET /api/health
# Debería retornar:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-11-18T10:30:00Z"
}
```

### 7.3 Dashboard de Monitoreo

- [ ] Verificar logs en Vercel
- [ ] Verificar errores en Sentry
- [ ] Verificar analytics (si configurado)
- [ ] Verificar usage de Supabase

---

## 🔄 Paso 8: Configuración de Backup Automático

### 8.1 Supabase Backups

En Supabase Dashboard:
- Database → Backups
- Scheduled backups: Habilitar
- Frequency: Diaria (recomendado)
- Retention: 7 días mínimo

### 8.2 Point-in-Time Recovery

Supabase mantiene logs de WAL por 7 días.
Si necesitas restore a punto específico:
1. Contact Supabase Support
2. Proporcionar timestamp
3. Esperar recovery

---

## 🔐 Paso 9: Configuración de Seguridad

### 9.1 SSL/TLS

- [ ] Verificar que todos los endpoints usan HTTPS
- [ ] No hay mixed content warnings

### 9.2 Rate Limiting

```typescript
// En tu API (si tienes custom endpoints)
// Implementar rate limiting para prevenir abuse

import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
});

export async function GET(request: Request) {
  const { success } = await ratelimit.limit(request.ip || "");
  if (!success) return new Response("Too Many Requests", { status: 429 });
  // ...
}
```

### 9.3 CORS Headers

Configurar en Vercel o Supabase según sea necesario:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  return response;
}
```

---

## 📈 Paso 10: Plan de Escalabilidad

### Si la aplicación crece:

1. **Database**: Aumentar plan de Supabase (Pro, Business)
2. **Storage**: Si hay fotos de bienes, usar S3 o Supabase Storage
3. **API**: Si hay mucho tráfico, considerar CloudFlare
4. **CDN**: Vercel incluye CDN automático

---

## 🆘 Troubleshooting

### Problema: "RLS policy violation"

```bash
# Solución:
# 1. Verificar que usuario tiene rol correcto
# 2. Revisar RLS policies en Database
# 3. Verificar que JWT token es válido
# 4. Revisar logs de Supabase
```

### Problema: "Connection refused"

```bash
# Solución:
# 1. Verificar SUPABASE_URL y ANON_KEY
# 2. Verificar que Supabase está online
# 3. Revisar firewall/IP whitelist
```

### Problema: "Tabla no existe"

```bash
# Solución:
# 1. Verificar que migración se ejecutó
# 2. Ver en Database → Schemas
# 3. Re-ejecutar migración si es necesario
```

### Problema: "Performance lenta"

```bash
# Solución:
# 1. Revisar que índices fueron creados
# 2. Usar EXPLAIN ANALYZE para queries lentas
# 3. Considerar caché en cliente (React Query)
```

---

## 📞 Contacto de Soporte

### Si hay problemas:

1. **Supabase Issues**: https://supabase.com/dashboard/support
2. **Vercel Issues**: https://vercel.com/help
3. **TypeScript**: https://www.typescriptlang.org/docs/
4. **Next.js**: https://nextjs.org/docs

---

## ✅ Checklist Final Pre-Producción

- [ ] Código sin errores
- [ ] Tests pasados
- [ ] Migración reversible
- [ ] Backups configurados
- [ ] Usuarios creados
- [ ] Bóveda inicializada
- [ ] Variables de entorno correctas
- [ ] SSL/HTTPS configurado
- [ ] Logging habilitado
- [ ] Monitoreo configurado
- [ ] Documentación actualizada
- [ ] Plan de rollback listo
- [ ] Team notificado
- [ ] Deploy preparado

---

## 📝 Post-Deployment

### Primeras 24 horas:

- [ ] Monitorear errores en Sentry
- [ ] Verificar usage de Supabase
- [ ] Recopilar feedback de usuarios
- [ ] Documentar issues encontrados
- [ ] Estar disponible para soporte

### Primera semana:

- [ ] Analizar datos de analytics
- [ ] Optimizar queries lentas
- [ ] Corregir bugs menores
- [ ] Actualizar documentación

---

**Guía de Deployment**: 18 de Noviembre, 2024
**Versión**: 1.0
**Estado**: ✅ LISTA PARA PRODUCCIÓN
