# 🚀 Guía de Deployment a Producción - JUNTAY

## Pre-requisitos

- [x] Base de datos verificada (`npm run db:verify`)
- [x] Build exitoso (`npm run build`)
- [x] Migraciones aplicadas
- [ ] Cuenta Supabase (producción)
- [ ] Cuenta Vercel

---

## Paso 1: Crear Proyecto Supabase Producción

### 1.1 Crear nuevo proyecto
1. Ir a [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Configurar:
   - **Name:** `juntay-production`
   - **Database Password:** Generar uno seguro y guardarlo
   - **Region:** South America (Sao Paulo) - más cercano a Perú
4. Esperar ~2 minutos a que se cree

### 1.2 Obtener credenciales
1. Ir a **Settings > API**
2. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (click show) → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Aplicar migraciones
```bash
# Vincular proyecto
npx supabase link --project-ref [PROJECT_ID]

# Aplicar migraciones
npx supabase db push

# Aplicar seed
npx supabase db seed
```

---

## Paso 2: Configurar Vercel

### 2.1 Importar proyecto
1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar repositorio Git: `juntay_api`
3. Configurar:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 2.2 Variables de Entorno
En **Settings > Environment Variables**, agregar:

| Variable | Valor | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ID].supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.vercel.app` | Production |
| `NEXT_PUBLIC_APP_SECRET_SALT` | `generar-uuid-aleatorio` | Production |

### 2.3 Deploy
```bash
# Opcional: Deploy desde CLI
npm i -g vercel
vercel --prod
```

---

## Paso 3: Crear Usuario Admin

### 3.1 Crear usuario en Supabase Auth
1. Ir a **Authentication > Users**
2. Click **Add user > Create new user**
3. Configurar:
   - **Email:** `admin@tu-empresa.pe`
   - **Password:** Segura
   - **Auto Confirm User:** ✅

### 3.2 Vincular a empresa
Ejecutar en **SQL Editor**:
```sql
-- 1. Primero verificar el ID del usuario creado
SELECT id, email FROM auth.users WHERE email = 'admin@tu-empresa.pe';

-- 2. Crear registro en tabla usuarios
INSERT INTO usuarios (id, empresa_id, email, nombres, apellido_paterno, rol, activo)
VALUES (
    '[ID-DEL-PASO-ANTERIOR]',
    'a0000000-0000-0000-0000-000000000001', -- Empresa piloto
    'admin@tu-empresa.pe',
    'Administrador',
    'Sistema',
    'admin',
    true
);

-- 3. Verificar
SELECT u.email, u.rol, e.nombre_comercial 
FROM usuarios u
JOIN empresas e ON u.empresa_id = e.id;
```

---

## Paso 4: Verificar Deployment

### 4.1 Checklist funcional
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Puede abrir caja
- [ ] Puede crear cliente
- [ ] Puede crear crédito
- [ ] Puede registrar pago

### 4.2 Comandos de verificación
```bash
# 1. Verificar build
npm run build

# 2. Verificar base de datos
npm run db:verify

# 3. Verificar documentación
npm run docs:audit
```

---

## Paso 5: Configurar Dominio (Opcional)

### En Vercel:
1. **Settings > Domains**
2. Add: `app.juntay.pe` (o tu dominio)
3. Configurar DNS según instrucciones

### Actualizar URL:
1. En Vercel: `NEXT_PUBLIC_SITE_URL=https://app.juntay.pe`
2. En Supabase: **Authentication > URL Configuration**
   - Site URL: `https://app.juntay.pe`
   - Redirect URLs: `https://app.juntay.pe/**`

---

## Troubleshooting

### Error: "Usuario no autenticado"
- Verificar que el usuario existe en `auth.users` Y en `usuarios`
- Verificar que `empresa_id` está asignado

### Error: "RLS: permission denied"
- Verificar que el rol está en minúsculas (`admin`, no `ADMIN`)
- Ejecutar: `SELECT get_user_role();` con el usuario logueado

### Error: "No hay fondos en bóveda"
- Verificar cuenta principal tiene saldo
- Ejecutar:
```sql
UPDATE cuentas_financieras SET saldo = 10000 WHERE es_principal = true;
```

---

## 📋 Checklist Final

- [ ] Proyecto Supabase creado
- [ ] Migraciones aplicadas
- [ ] Seed ejecutado
- [ ] Vercel configurado
- [ ] Variables de entorno configuradas
- [ ] Usuario admin creado
- [ ] Login verificado
- [ ] Dashboard funcionando
- [ ] Dominio configurado (opcional)

---

> **Soporte:** Ejecutar `npm run docs:audit` para verificar estado del sistema.
