# 🔄 JUNTAY - Guía de Sincronización Local ↔ Cloud

> **Guía completa para sincronizar entre Docker Local y Supabase Cloud**  
> **Proyecto:** JUNTAY  
> **Última actualización:** 30 Enero 2025

---

## 🎯 Concepto Clave: ¿Qué Se Sincroniza?

### ✅ SE SINCRONIZA: Schema (Estructura de DB)

```
┌─────────────────────────────────────────────┐
│  MIGRACIONES (supabase/migrations/)         │
│  ├─ 00001_initial.sql                       │
│  ├─ 00002_add_empresas.sql                  │
│  └─ ... (66 archivos)                       │
└─────────────────┬───────────────────────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
    🐳 Docker Local   ☁️ Supabase Cloud
    (Mismo schema)   (Mismo schema)
```

**Lo que incluye:**
- ✅ Tablas y columnas
- ✅ Índices
- ✅ Foreign keys
- ✅ RLS policies (53 policies)
- ✅ Functions y triggers
- ✅ Views y materialized views

---

### ❌ NO SE SINCRONIZA: Datos

```
🐳 Docker Local              ☁️ Supabase Cloud
├─ Créditos: 0              ├─ Créditos: 0
├─ Clientes: 0              ├─ Clientes: 0
├─ Usuarios: Test           ├─ Usuarios: Reales
└─ Datos: SEPARADOS         └─ Datos: SEPARADOS

    ❌ Los datos NO se sincronizan automáticamente
```

**Por qué:**
- Local = Desarrollo/Testing (datos ficticios)
- Cloud = Producción (datos reales)
- Separar evita corromper producción

---

## 🏗️ Arquitectura de Sincronización

```
┌──────────────────────────────────────────────────────────┐
│  FLUJO DE TRABAJO COMPLETO                               │
└──────────────────────────────────────────────────────────┘

1️⃣ DESARROLLO LOCAL
   ├─ Trabajas en Docker Local
   ├─ Creas nueva migración
   └─ Pruebas localmente

        ↓ (git push)

2️⃣ GITHUB
   ├─ Código + Migraciones
   └─ Source of truth

        ↓ (CI/CD)

3️⃣ SUPABASE CLOUD
   ├─ Migraciones se aplican automáticamente
   └─ Schema actualizado

        ↓ (opcional: pull)

4️⃣ OTROS DEVS
   └─ Hacen supabase db pull para actualizar local
```

---

## 📋 Comandos Principales

### 1. Crear Nueva Migración (Local)

```bash
# Crear migración vacía
npx supabase migration new nombre_descriptivo

# Resultado:
# supabase/migrations/20250130123456_nombre_descriptivo.sql

# Editar el archivo SQL generado:
code supabase/migrations/20250130123456_nombre_descriptivo.sql
```

**Ejemplo de contenido:**
```sql
-- Agregar campo nuevo
ALTER TABLE creditos ADD COLUMN estado_extra TEXT;

-- Crear índice
CREATE INDEX idx_creditos_estado_extra ON creditos(estado_extra);

-- Actualizar RLS policy
DROP POLICY IF EXISTS "tenant_creditos_select" ON creditos;
CREATE POLICY "tenant_creditos_select" 
ON creditos FOR SELECT
USING (empresa_id = get_current_empresa_id());
```

---

### 2. Aplicar Migración Localmente

```bash
# Resetear DB local y aplicar todas las migraciones
npx supabase db reset

# O solo aplicar nuevas migraciones
npx supabase migration up
```

**Resultado:**
```
✅ Applying migration 20250130123456_nombre_descriptivo.sql...
✅ Migration applied successfully
```

---

### 3. Aplicar Migración a Cloud

#### Método A: Automático (Recomendado - CI/CD)

```bash
# 1. Commit y push
git add supabase/migrations/
git commit -m "feat: add campo estado_extra"
git push origin main

# 2. GitHub Actions aplica automáticamente a Supabase Cloud
# (según tu PROMPT_PRINCIPAL.md)
```

#### Método B: Manual (Desarrollo)

```bash
# Push directo a cloud
npx supabase db push --linked

# Verificar que se aplicó
npx supabase db remote commit list
```

---

### 4. Sincronizar Schema Cloud → Local

```bash
# Si alguien más hizo cambios en cloud, traerlos local:
npx supabase db pull

# Esto genera una migración nueva desde las diferencias
```

---

## 🔄 Workflows Comunes

### Workflow 1: Nueva Feature (Local → Cloud)

```bash
# Día 1: Desarrollo local
┌─────────────────────────────────────┐
│ 1. Trabajar en Docker Local         │
│    npx supabase start               │
│                                      │
│ 2. Crear migración                  │
│    npx supabase migration new       │
│    add_new_table                    │
│                                      │
│ 3. Editar SQL                       │
│    code supabase/migrations/...sql  │
│                                      │
│ 4. Aplicar localmente               │
│    npx supabase db reset            │
│                                      │
│ 5. Testear en Next.js               │
│    npm run dev                      │
│    (pruebas con datos locales)      │
└─────────────────────────────────────┘
        ↓
# Día 2: Deploy a producción
┌─────────────────────────────────────┐
│ 6. Commit cambios                   │
│    git add .                        │
│    git commit -m "feat: nueva tabla"│
│                                      │
│ 7. Push a GitHub                    │
│    git push origin main             │
│                                      │
│ 8. CI/CD automático                 │
│    GitHub → Supabase Cloud          │
│    (migraciones se aplican)         │
│                                      │
│ 9. Verificar en Cloud               │
│    https://supabase.com/dashboard   │
└─────────────────────────────────────┘
```

---

### Workflow 2: Trabajo en Equipo

```bash
# Developer A hace cambios
Dev A:
├─ Crea migración local
├─ Push a GitHub
└─ Cloud se actualiza automáticamente

# Developer B sincroniza
Dev B:
├─ git pull origin main (trae migraciones nuevas)
├─ npx supabase db reset (aplica migraciones local)
└─ npm run dev (continúa trabajando)
```

---

### Workflow 3: Hotfix en Producción

```bash
# Si necesitas cambio urgente en Cloud:

# 1. Crear migración en Cloud directamente (Dashboard SQL Editor)
# 2. Generar migración local desde Cloud:
npx supabase db pull

# 3. Commit la migración generada:
git add supabase/migrations/
git commit -m "hotfix: migration from cloud"
git push origin main
```

---

## 🎯 Casos de Uso Reales

### Caso 1: Agregar Nueva Columna

```bash
# 1. Crear migración
npx supabase migration new add_creditos_observaciones

# 2. Editar archivo generado:
```

```sql
-- supabase/migrations/20250130_add_creditos_observaciones.sql
ALTER TABLE creditos ADD COLUMN observaciones TEXT;
COMMENT ON COLUMN creditos.observaciones IS 'Notas adicionales del crédito';
```

```bash
# 3. Aplicar localmente
npx supabase db reset

# 4. Actualizar types TypeScript
npx supabase gen types typescript --local > src/lib/database.types.ts

# 5. Push a producción
git add .
git commit -m "feat: add observaciones field to creditos"
git push origin main
```

---

### Caso 2: Crear Nueva Tabla

```bash
# 1. Crear migración
npx supabase migration new create_table_recordatorios

# 2. Editar SQL:
```

```sql
-- supabase/migrations/20250130_create_table_recordatorios.sql

CREATE TABLE recordatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  empresa_id UUID REFERENCES empresas(id) NOT NULL,
  credito_id UUID REFERENCES creditos(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('vencimiento', 'mora', 'renovacion')),
  fecha_envio TIMESTAMPTZ,
  mensaje TEXT,
  enviado BOOLEAN DEFAULT false
);

-- RLS
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_recordatorios_all"
ON recordatorios
USING (empresa_id = get_current_empresa_id());

-- Índices
CREATE INDEX idx_recordatorios_empresa ON recordatorios(empresa_id);
CREATE INDEX idx_recordatorios_credito ON recordatorios(credito_id);
```

```bash
# 3. Aplicar y testear localmente
npx supabase db reset

# 4. Verificar que funciona
psql postgresql://postgres:postgres@localhost:54322/postgres
\d recordatorios
\q

# 5. Deploy
git add .
git commit -m "feat: create recordatorios table with RLS"
git push origin main
```

---

### Caso 3: Modificar RLS Policy

```bash
# 1. Crear migración
npx supabase migration new update_creditos_rls

# 2. SQL:
```

```sql
-- Eliminar policy antigua
DROP POLICY IF EXISTS "tenant_creditos_update" ON creditos;

-- Crear nueva policy más restrictiva
CREATE POLICY "tenant_creditos_update"
ON creditos FOR UPDATE
USING (
  empresa_id = get_current_empresa_id()
  AND estado NOT IN ('ANULADO', 'VENDIDO') -- Estados terminales
)
WITH CHECK (
  empresa_id = get_current_empresa_id()
);
```

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "Migration already applied"

**Problema:**
```bash
❌ Migration 20250130_xxx.sql already applied to local database
```

**Causa:** Intentas aplicar una migración que ya existe localmente.

**Solución:**
```bash
# Ver migraciones aplicadas
npx supabase migration list

# Si está en local pero no en cloud:
npx supabase db push --linked

# Si necesitas resetear local:
npx supabase db reset
```

---

### Error 2: "Migration conflict"

**Problema:**
```bash
❌ Conflict: migration 20250130_xxx.sql differs from cloud
```

**Causa:** La migración en local difiere de la que está en cloud.

**Solución A (Local tiene razón):**
```bash
npx supabase db push --linked --force
```

**Solución B (Cloud tiene razón):**
```bash
# Backup tu migración local
cp supabase/migrations/20250130_xxx.sql ~/backup.sql

# Pull desde cloud
npx supabase db pull

# Comparar y resolver manualmente
```

---

### Error 3: "Cannot connect to local database"

**Problema:**
```bash
❌ Error: Connection refused to localhost:54322
```

**Causa:** Docker no está corriendo.

**Solución:**
```bash
# Verificar estado
docker ps | grep juntay_api

# Si no hay containers:
npx supabase start

# Si hay pero no responden:
npx supabase stop
npx supabase start
```

---

### Error 4: "Schema drift detected"

**Problema:**
```bash
⚠️ Schema drift detected between local and cloud
```

**Causa:** Alguien modificó cloud sin crear migración.

**Solución:**
```bash
# Generar migración desde las diferencias
npx supabase db diff --linked > supabase/migrations/$(date +%Y%m%d%H%M%S)_sync_from_cloud.sql

# Revisar y aplicar
git add supabase/migrations/
git commit -m "sync: capture schema drift from cloud"
git push origin main
```

---

## 🛡️ Mejores Prácticas

### ✅ DO's (Hacer)

1. **Siempre crear migraciones para cambios de schema**
   ```bash
   npx supabase migration new descripcion_clara
   ```

2. **Testear localmente antes de push**
   ```bash
   npx supabase db reset
   npm run dev
   # Probar feature
   ```

3. **Usar nombres descriptivos**
   ```bash
   ✅ add_creditos_observaciones_field
   ❌ update_table
   ```

4. **Incluir rollback si es posible**
   ```sql
   -- Migration up
   ALTER TABLE creditos ADD COLUMN nuevo_campo TEXT;
   
   -- Rollback (comentado)
   -- ALTER TABLE creditos DROP COLUMN nuevo_campo;
   ```

5. **Actualizar types después de migración**
   ```bash
   npx supabase gen types typescript --local > src/lib/database.types.ts
   ```

---

### ❌ DON'Ts (No Hacer)

1. **NO editar migraciones ya aplicadas**
   ```bash
   ❌ Editar archivo en supabase/migrations/ que ya está en cloud
   ✅ Crear nueva migración para modificar
   ```

2. **NO hacer cambios directos en Cloud sin migración**
   ```bash
   ❌ SQL Editor en Supabase Dashboard (solo para debugging)
   ✅ Crear migración local → Push
   ```

3. **NO mezclar datos con migraciones**
   ```sql
   ❌ INSERT INTO clientes VALUES (...); -- En migración
   ✅ Usar seed.sql para datos iniciales
   ```

4. **NO olvidar RLS en tablas nuevas**
   ```sql
   ✅ ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;
   ✅ CREATE POLICY "tenant_nueva_tabla_all" ...
   ```

---

## 📊 Verificación de Sincronización

### Comando de Verificación Rápida

```bash
# Ver migraciones aplicadas localmente
npx supabase migration list

# Ver migraciones en cloud
npx supabase db remote commit list

# Ver diferencias entre local y cloud
npx supabase db diff --linked --schema public
```

---

### Script de Verificación Completo

Crea `scripts/verify-sync.sh`:

```bash
#!/bin/bash

echo "🔍 Verificando sincronización Local ↔ Cloud..."

echo "\n📦 Migraciones Locales:"
npx supabase migration list

echo "\n☁️  Migraciones Cloud:"
npx supabase db remote commit list

echo "\n🔄 Diferencias de Schema:"
npx supabase db diff --linked --schema public

echo "\n✅ Verificación completa"
```

---

## 🎯 Checklist de Migración

Antes de cada migración, verifica:

- [ ] Migración testeada localmente (`npx supabase db reset`)
- [ ] Types TypeScript actualizados
- [ ] RLS policies incluidas (si tabla nueva)
- [ ] Índices necesarios creados
- [ ] Comentarios SQL descriptivos
- [ ] Nombre de archivo descriptivo
- [ ] Testeado en Next.js local
- [ ] Commit con mensaje claro
- [ ] Push a GitHub
- [ ] Verificar deploy en Cloud

---

## 📚 Comandos de Referencia Rápida

### Desarrollo Local

```bash
# Iniciar
npx supabase start

# Detener
npx supabase stop

# Reset completo
npx supabase db reset

# Ver status
npx supabase status
```

### Migraciones

```bash
# Crear nueva
npx supabase migration new nombre

# Listar
npx supabase migration list

# Aplicar pendientes
npx supabase migration up
```

### Sincronización

```bash
# Local → Cloud
npx supabase db push --linked

# Cloud → Local
npx supabase db pull

# Ver diferencias
npx supabase db diff --linked
```

### Types

```bash
# Generar types locales
npx supabase gen types typescript --local > src/lib/database.types.ts

# Generar types desde cloud
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

---

## 🚀 Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│  REGLA DE ORO: Migraciones Fluyen en Una Dirección     │
└─────────────────────────────────────────────────────────┘

  Local (Docker)
      ↓ (crear migración)
  Git (supabase/migrations/)
      ↓ (push)
  GitHub
      ↓ (CI/CD)
  Cloud (Producción)

  ⚠️ Nunca al revés (excepto emergencias)
```

---

## 🎓 Conclusión

### Lo Importante

1. **Schema se sincroniza** (via migraciones)
2. **Datos NO se sincronizan** (son separados)
3. **Flujo:** Local → Git → Cloud
4. **Herramienta:** Supabase CLI
5. **Seguridad:** Siempre testear local primero

### Tu Workflow Ideal

```bash
# Día a día:
1. npx supabase start (inicio del día)
2. Desarrollar features
3. npx supabase migration new (cuando cambies schema)
4. Testear localmente
5. git push (cuando esté listo)
6. CI/CD hace el resto
7. npx supabase stop (fin del día - liberar RAM)
```

---

**Próximo paso:** Lee `SWITCH_TO_CLOUD.md` si quieres trabajar sin Docker.

---

**Última actualización:** 30 Enero 2025  
**Proyecto:** JUNTAY  
**Migraciones actuales:** 66  
**Status:** Local ✅ | Cloud ✅ | Sincronizados ✅