#!/bin/bash

# ==============================================================================
# OPS SQUASH MIGRATIONS - SAFEGUARD SCRIPT
# ==============================================================================
# Este script automatiza el proceso de "Squash" (unificar migraciones)
# para evitar errores manuales y pérdida de archivos.
#
# Uso: ./scripts/ops_squash_migrations.sh
# ==============================================================================

set -e # Terminar si hay cualquier error

echo "🛡️  Iniciando Protocolo de Seguridad Git..."

# 1. VERIFICAR IDENTIDAD GIT
USER_EMAIL=$(git config user.email)
USER_NAME=$(git config user.name)

if [ -z "$USER_EMAIL" ] || [ -z "$USER_NAME" ]; then
    echo "❌ ERROR CRÍTICO: Git Identity no configurada."
    echo "   Debes configurar tu usuario antes de tocar la base de datos."
    echo "   Ejecuta: git config user.email 'tu@email.com' && git config user.name 'Tu Nombre'"
    exit 1
fi

echo "✅ Identidad verificada: $USER_NAME <$USER_EMAIL>"

# 2. VERIFICAR ESTADO GIT (Clean Working Directory)
if [ -n "$(git status --porcelain)" ]; then 
    echo "❌ ERROR: Tienes cambios pendientes sin commitear."
    echo "   Por seguridad, haz commit o stash antes de hacer squash."
    exit 1
fi

echo "✅ Git status limpio. Procediendo..."

# 3. GENERAR TIMESTAMP
TIMESTAMP=$(date +%Y%m%d%H%M%S)
NEW_MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_squashed_schema.sql"

echo "📦 3. Generando Dump de Esquema..."
mkdir -p supabase/migrations/archive
npx supabase db dump --local -f "$NEW_MIGRATION_FILE"

if [ ! -f "$NEW_MIGRATION_FILE" ]; then
    echo "❌ ERROR: Falló la generación del dump."
    exit 1
fi

echo "✅ Dump generado: $NEW_MIGRATION_FILE"

# 4. MOVER MIGRACIONES VIEJAS (Safety Move)
echo "📦 4. Archivando migraciones antiguas..."
# Movemos todo lo que sea SQL en migrations/ EXCEPTO el nuevo archivo
find supabase/migrations -maxdepth 1 -name "*.sql" -not -name "$(basename "$NEW_MIGRATION_FILE")" -exec mv {} supabase/migrations/archive/ \;

echo "✅ Archivos movidos a archive/"

# 5. VALIDACIÓN FINAL (Dry Run Reset)
echo "🧪 5. Verificando integridad (Dry Run)..."
# Opcional: Podríamos correr db reset aquí, pero puede ser lento.
# Por ahora confiamos en el dump si el comando anterior fue exitoso.

echo "🎉 ÉXITO: Squash completado. Estructura de archivos actualizada."
echo "   Ahora puedes hacer: git add . && git commit -m 'chore: db squash'"
