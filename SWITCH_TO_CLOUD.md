# 🔄 JUNTAY - Cambio Rápido: Local ↔ Cloud

> Guía de referencia rápida para cambiar entre desarrollo local (Docker) y Supabase Cloud

---

## ⚡ Cambio Ultra Rápido (30 segundos)

### → A Cloud (Sin Docker)

```bash
# 1. Backup de configuración actual
cp .env .env.local.backup

# 2. Actualizar .env
cat > .env << 'EOF'
# 🔐 SUPABASE CLOUD (Producción)
NEXT_PUBLIC_SUPABASE_URL=https://bvrzwdztdccxaenfwwcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cnp3ZHp0ZGNjeGFlbmZ3d2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Nzc3MjEsImV4cCI6MjA3ODQ1MzcyMX0.vKm3zE0Gt6X5dyORbBnO-Nf7cnJb2tVtF9sZUvUmAiU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cnp3ZHp0ZGNjeGFlbmZ3d2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg3NzcyMSwiZXhwIjoyMDc4NDUzNzIxfQ.p3YD4vegv9g_rxSRNCrFcYXiGFdtBvwHJ-cTnub-Z1A
EOF

# 3. Opcional: Apagar Docker para liberar RAM
npx supabase stop

# 4. Reiniciar dev server
npm run dev
```

**✅ Listo! Ahora usas 0 GB de RAM local.**

---

### → A Local (Docker)

```bash
# 1. Restaurar configuración local
cat > .env << 'EOF'
# 🔐 SUPABASE LOCAL (Docker)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
EOF

# 2. Iniciar Docker
npx supabase start

# 3. Reiniciar dev server
npm run dev
```

**✅ Listo! Vuelves a usar Docker local.**

---

## 🎯 Scripts NPM (Recomendado)

Agrega a tu `package.json`:

```json
{
  "scripts": {
    "dev:local": "echo 'Usando Docker Local' && npm run dev",
    "dev:cloud": "echo 'Usando Supabase Cloud' && npm run dev",
    "switch:cloud": "node scripts/switch-to-cloud.js",
    "switch:local": "node scripts/switch-to-local.js",
    "db:start": "npx supabase start",
    "db:stop": "npx supabase stop",
    "db:status": "npx supabase status",
    "db:test": "node scripts/test-cloud-connection.js"
  }
}
```

**Uso:**
```bash
npm run switch:cloud  # Cambia a Cloud
npm run switch:local  # Cambia a Local
npm run db:test       # Verifica conexión
```

---

## 📋 Tabla de Comparación

| Aspecto | Local (Docker) | Cloud |
|---------|---------------|-------|
| **RAM** | 1.5 GB | 0 GB |
| **Internet** | ❌ No necesario | ✅ Necesario |
| **Velocidad** | ⚡ Instantánea | 🌐 ~150ms latencia |
| **Testing** | ✅ Seguro (aislado) | ⚠️ Cuidado (producción) |
| **Studio UI** | http://localhost:54323 | https://supabase.com/dashboard |
| **Setup** | `npx supabase start` | Solo cambiar .env |
| **Datos** | Local (no sincroniza auto) | Real (producción) |

---

## 🔍 Verificar Qué Estás Usando

```bash
# Ver configuración actual
cat .env | grep SUPABASE_URL

# Si dice "127.0.0.1" → Estás en LOCAL
# Si dice "bvrzwdzt...supabase.co" → Estás en CLOUD
```

O desde código:
```typescript
console.log('Usando:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

---

## 🚨 Errores Comunes

### Error: "Failed to fetch"
**Causa:** Docker no está corriendo pero .env apunta a local  
**Solución:**
```bash
npx supabase start
# O cambiar a Cloud
```

### Error: "Invalid API key"
**Causa:** .env tiene keys mezcladas (local URL con cloud key)  
**Solución:** Verifica que URL y KEY coincidan (ambas local o ambas cloud)

### Error: "CORS error"
**Causa:** Intentas acceder a Cloud con URL incorrecta  
**Solución:** Verifica https:// (no http://)

---

## 💡 Cuándo Usar Cada Uno

### Usa LOCAL (Docker) cuando:
- ✅ Desarrollas nuevas features
- ✅ Pruebas migraciones
- ✅ Experimentas sin riesgos
- ✅ No tienes internet estable
- ✅ Quieres máxima velocidad

### Usa CLOUD cuando:
- ✅ Quieres liberar RAM (1.5 GB)
- ✅ Demostrar a clientes (datos reales)
- ✅ Desarrollar sin Docker
- ✅ Testing de deploy
- ✅ Trabajo colaborativo (datos compartidos)

---

## 🎯 Recomendación por Perfil

### Developer Individual
→ **CLOUD** (0 GB RAM, sin setup)

### Team Colaborativo
→ **CLOUD** (datos compartidos)

### Testing Intensivo
→ **LOCAL** (seguro, rápido)

### Demo/Cliente
→ **CLOUD** (datos reales)

---

## 🔐 Seguridad: Variables de Entorno

### ⚠️ NUNCA hagas commit de:
```bash
# ❌ MAL
.env                    # Tiene credenciales
.env.production         # Peor aún
```

### ✅ SIEMPRE usa:
```bash
# ✅ BIEN
.env.example            # Template sin credenciales
.env.local              # En .gitignore
```

Tu `.gitignore` debe tener:
```
.env
.env.local
.env*.local
```

---

## 📞 URLs Útiles

### Local (Docker)
- **API:** http://localhost:54321
- **Studio:** http://localhost:54323
- **DB:** postgresql://postgres:postgres@localhost:54322/postgres

### Cloud (Producción)
- **API:** https://bvrzwdztdccxaenfwwcy.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/bvrzwdztdccxaenfwwcy
- **Studio:** Desde el dashboard

---

## 🚀 Workflow Híbrido (Recomendado)

```bash
# Lunes a Viernes: Desarrollo con Cloud (0 GB RAM)
npm run switch:cloud
npm run dev

# Sábado: Testing features nuevas con Local (seguro)
npm run switch:local
npm run db:start
npm run dev

# Domingo: Apagar todo y descansar
npm run db:stop
```

---

## 🛠️ Comandos Útiles

### Docker
```bash
# Ver servicios corriendo
docker ps --filter "name=juntay_api"

# Ver uso de recursos
docker stats --filter "name=juntay_api" --no-stream

# Reiniciar servicios
docker restart supabase_db_juntay_api

# Logs de PostgreSQL
docker logs supabase_db_juntay_api --tail 50
```

### Supabase CLI
```bash
# Status completo
npx supabase status

# Iniciar todo
npx supabase start

# Detener todo
npx supabase stop

# Ver migraciones pendientes
npx supabase migration list

# Aplicar migraciones a Cloud
npx supabase db push --linked
```

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────┐
│  TU DECISIÓN                            │
├─────────────────────────────────────────┤
│                                          │
│  ¿Problema de RAM?  →  USA CLOUD       │
│  ¿Necesitas velocidad?  →  USA LOCAL    │
│  ¿Testing seguro?  →  USA LOCAL         │
│  ¿Demo cliente?  →  USA CLOUD           │
│  ¿Sin internet?  →  USA LOCAL           │
│                                          │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Cambio

Antes de cambiar, verifica:

- [ ] Backup de .env actual
- [ ] Commitea cambios importantes (git)
- [ ] Cierra dev server actual
- [ ] Si vas a Cloud: Internet activo
- [ ] Si vas a Local: Docker corriendo
- [ ] Actualiza .env completo (URL + KEYS)
- [ ] Reinicia dev server
- [ ] Verifica conexión (npm run db:test)

---

**Última actualización:** 30 Enero 2025  
**Proyecto:** JUNTAY  
**Region Cloud:** South America (São Paulo)  
**Status:** ✅ Ambas opciones funcionales