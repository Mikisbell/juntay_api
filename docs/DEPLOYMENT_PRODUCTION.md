# 🚀 JUNTAY — GUÍA DE DESPLIEGUE A PRODUCCIÓN

**Versión:** 1.0  
**Fecha:** 26 Noviembre 2025  
**Alcance:** Producción (Supabase Cloud + Vercel/VPS + Oracle Cloud)

---

## 1️⃣ Checklist Pre-Despliegue

### 1.1 Variables de Entorno (`.env.production`)

Asegurarse de configurar las siguientes variables en el entorno de producción:

```bash
# Supabase (Producción)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY-PROD]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY-PROD]"

# WhatsApp (WAHA - Oracle Cloud)
WAHA_URL="http://129.151.98.218:3000"
WAHA_API_KEY="[API-KEY-WAHA]"

# Configuración General
NEXT_PUBLIC_APP_URL="https://app.juntay.com"
NODE_ENV="production"
```

### 1.2 Base de Datos (Supabase Cloud)

1. **Migraciones:** Ejecutar todas las migraciones pendientes.

   ```bash
   npx supabase db push
   ```

2. **Seeds (Opcional):** Si es una instalación limpia, cargar datos iniciales (roles, settings).

   ```bash
   npx supabase db reset --no-seed # Cuidado: Borra datos
   # O insertar manualmente en system_settings
   ```

3. **RLS Policies:** Verificar que RLS esté activo en TODAS las tablas públicas.

---

## 2️⃣ Infraestructura de WhatsApp (WAHA)

El servicio de WhatsApp corre independientemente en Oracle Cloud.

- **IP:** `129.151.98.218`
- **Puerto:** `3000`
- **Motor:** `NOWEB` (Sin navegador, más estable).
- **Endpoint Health:** `GET /api/sessions`

**Comandos de Mantenimiento (SSH Oracle):**

```bash
# Reiniciar servicio
docker restart waha

# Ver logs
docker logs -f waha
```

---

## 3️⃣ Procedimiento de Backup

### 3.1 Base de Datos (Automático)

Supabase Cloud realiza backups diarios (Point-in-Time Recovery habilitado en Pro Plan).

### 3.2 Backup Manual (Antes de cambios críticos)

```bash
npx supabase db dump --db-url [CONNECTION-STRING] > backup_$(date +%F).sql
```

### 3.3 Imágenes y Archivos

Los archivos (fotos de garantías, DNI) están en Supabase Storage.

- Bucket: `garantias`
- Bucket: `documentos`
- **Regla:** No borrar archivos de garantías activas.

---

## 4️⃣ Monitoreo y Logs

1. **Supabase Dashboard:** Revisar "Database Health" (CPU/RAM).
2. **Vercel/App Logs:** Revisar errores 500 en Server Actions.
3. **Tabla Auditoría:** Revisar `movimientos_boveda_auditoria` periódicamente para detectar inconsistencias financieras.

---

## 5️⃣ Troubleshooting Común

| Error | Causa Probable | Solución |
| :--- | :--- | :--- |
| `RLS violation` | Usuario sin rol o query sin `select` policy. | Revisar tabla `profiles` y policies. |
| `WAHA connection refused` | Servidor Oracle caído o puerto bloqueado. | Reiniciar Docker en Oracle. |
| `Saldo Insuficiente` | Caja sin asignación de Bóveda. | Realizar "Apertura de Caja" desde Admin. |
