#!/bin/bash
# Script para aplicar la corrección de Dashboard Widgets
# Ejecuta este script con: bash apply_dashboard_fix.sh

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔧 Aplicando corrección de Dashboard RPC Functions..."

# Intentar con la API de Supabase (puerto 54321)
RESPONSE=$(curl -s -X POST \
  'http://127.0.0.1:54321/rest/v1/rpc/exec_sql' \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Authorization: Bearer sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvzCONSULTASPERU_TOKEN" \
  -H "Content-Type: application/json" \
  -d @supabase/migrations/20251126000004_fix_dashboard_rpc.sql)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migración aplicada exitosamente${NC}"
    echo "Recarga tu dashboard en http://localhost:3001/dashboard"
else
    echo -e "${RED}❌ Error al aplicar la migración${NC}"
    echo "Por favor, aplica el SQL manualmente en http://localhost:54323 (Supabase Studio)"
fi
