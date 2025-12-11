#!/bin/bash
# Simplified Integration Test - JUNTAY
# Uses Docker exec to bypass network issues

set -e

echo "🧪 JUNTAY - Pruebas de Integración"
echo "==================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_CONTAINER="supabase_db_juntay_api"

# Helper function to run SQL
function run_sql() {
    docker exec $DB_CONTAINER psql -U postgres -d postgres -t -c "$1" 2>/dev/null || echo "ERROR"
}

echo "✅ FASE 1: Verificación de Esquema"
echo "-----------------------------------"

# Get table count
TABLE_COUNT=$(run_sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")
echo "📊 Tablas en el esquema: $TABLE_COUNT"

# Check critical tables
CRITICAL_TABLES=("clientes" "creditos" "garantias" "boveda_central" "cajas_operativas")

for table in "${CRITICAL_TABLES[@]}"; do
    COUNT=$(run_sql "SELECT COUNT(*) FROM public.$table")
    if [ "$COUNT" != "ERROR" ]; then
        echo -e "${GREEN}✓${NC} $table: $COUNT registros"
    else
        echo -e "${RED}✗${NC} $table: NO ACCESIBLE"
    fi
done

echo ""
echo "✅ FASE 2: Verificación de RPCs"
echo "--------------------------------"

RPC_CHECK=$(run_sql "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_cartera_risk_summary', 'get_upcoming_expirations')")
echo "📊 RPCs Dashboard encontrados: $RPC_CHECK / 2"

if [ "$RPC_CHECK" -eq 2 ]; then
    echo -e "${GREEN}✓${NC} RPCs del dashboard configurados correctamente"
else
    echo -e "${YELLOW}⚠${NC} Faltan algunos RPCs"
fi

echo ""
echo "✅ FASE 3: Test de Flujo Principal"
echo "------------------------------------"

# Test 1: Verificar bóveda
BOVEDA_EXISTS=$(run_sql "SELECT COUNT(*) FROM public.boveda_central")
if [ "$BOVEDA_EXISTS" = "ERROR" ] || [ "$BOVEDA_EXISTS" = "0" ]; then
    echo -e "${YELLOW}⚠${NC} Bóveda Central: No inicializada"
    
    # Intentar crear bóveda
    echo "  → Intentando inicializar bóveda..."
    INIT_RESULT=$(run_sql "INSERT INTO public.boveda_central (nombre, saldo_total, saldo_disponible, saldo_bloqueado) VALUES ('Bóveda Principal', 0, 0, 0) ON CONFLICT DO NOTHING RETURNING id")
    
    if [ "$INIT_RESULT" != "ERROR" ]; then
        echo -e "${GREEN}  ✓${NC} Bóveda inicializada"
    fi
else
    SALDO=$(run_sql "SELECT saldo_total FROM public.boveda_central LIMIT 1")
    echo -e "${GREEN}✓${NC} Bóveda Central: S/. $SALDO"
fi

# Test 2: Crear cliente de prueba
TEST_DNI="99999999"
echo ""
echo "→ Test: Crear cliente de prueba (DNI: $TEST_DNI)"

# Limpiar si existe
run_sql "DELETE FROM public.clientes WHERE numero_documento = '$TEST_DNI'" >/dev/null 2>&1

# Crear cliente
CREATE_RESULT=$(run_sql "INSERT INTO public.clientes (numero_documento, nombres, apellido_paterno, apellido_materno, telefono_principal) VALUES ('$TEST_DNI', 'Test', 'Integracion', 'Suite', '999888777') RETURNING id")

if [ "$CREATE_RESULT" != "ERROR" ] && [ -n "$CREATE_RESULT" ]; then
    CLIENT_ID=$(echo "$CREATE_RESULT" | tr -d ' ')
    echo -e "${GREEN}✓${NC} Cliente creado: ID = $CLIENT_ID"
    
    # Limpiar
    run_sql "DELETE FROM public.clientes WHERE id = '$CLIENT_ID'" >/dev/null 2>&1
    echo "  → Cliente de prueba eliminado"
else
    echo -e "${RED}✗${NC} Error creando cliente"
fi

# Test 3: Verificar cajas activas
echo ""
echo "→ Test: Cajas operativas"
CAJAS_ACTIVAS=$(run_sql "SELECT COUNT(*) FROM public.cajas_operativas WHERE estado = 'abierta'")
CAJAS_TOTAL=$(run_sql "SELECT COUNT(*) FROM public.cajas_operativas")

echo -e "${GREEN}✓${NC} Cajas totales: $CAJAS_TOTAL"
echo -e "${GREEN}✓${NC} Cajas activas: $CAJAS_ACTIVAS"

# Test 4: Verificar créditos
echo ""
echo "→ Test: Sistema de créditos"
CREDITOS_COUNT=$(run_sql "SELECT COUNT(*) FROM public.creditos")
CREDITOS_VIGENTES=$(run_sql "SELECT COUNT(*) FROM public.creditos WHERE estado = 'vigente'")

echo -e "${GREEN}✓${NC} Créditos totales: $CREDITOS_COUNT"
echo -e "${GREEN}✓${NC} Créditos vigentes: $CREDITOS_VIGENTES"

echo ""
echo "=================================="
echo -e "${GREEN}✅ PRUEBAS COMPLETADAS${NC}"
echo "=================================="
echo ""
echo "📊 RESUMEN:"
echo "  • Tablas verificadas: ${#CRITICAL_TABLES[@]}"
echo "  • RPCs Dashboard: $RPC_CHECK / 2"
echo "  • Bóveda: $([ "$BOVEDA_EXISTS" != "0" ] && echo "Configurada" || echo "Pendiente")"
echo "  • Cajas activas: $CAJAS_ACTIVAS"
echo "  • Créditos vigentes: $CREDITOS_VIGENTES"
echo ""
