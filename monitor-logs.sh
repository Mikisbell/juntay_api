#!/bin/bash

# Script para monitorear logs relevantes del servidor durante las pruebas
# Uso: ./monitor-logs.sh

echo "🔍 Monitoreando logs del servidor para pruebas de empeño..."
echo "📝 Buscando logs relacionados con valorMercado y montoPrestamo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores para mejor legibilidad
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para resaltar logs importantes
highlight_logs() {
    while IFS= read -r line; do
        if [[ $line == *"[DEBUG] valorMercado"* ]]; then
            echo -e "${GREEN}✅ $line${NC}"
        elif [[ $line == *"[DEBUG] montoPrestamo"* ]]; then
            echo -e "${BLUE}💰 $line${NC}"
        elif [[ $line == *"[ERROR"* ]] || [[ $line == *"ERROR"* ]]; then
            echo -e "${RED}❌ $line${NC}"
        elif [[ $line == *"[AUTO-CALC]"* ]]; then
            echo -e "${YELLOW}🔧 $line${NC}"
        elif [[ $line == *"[WARNING]"* ]]; then
            echo -e "${YELLOW}⚠️  $line${NC}"
        elif [[ $line == *"crear_contrato"* ]]; then
            echo -e "${GREEN}📄 $line${NC}"
        else
            echo "$line"
        fi
    done
}

# Si npm run dev está corriendo, captura sus logs
# De lo contrario, instruye al usuario
if pgrep -f "npm run dev" > /dev/null; then
    echo "✅ Servidor detectado corriendo"
    echo "📡 Conectando a logs..."
    echo ""
    
    # Nota: Este script no puede capturar stdout de un proceso ya iniciado
    # Solo mostrará información útil
    echo "ℹ️  NOTA: Para ver los logs en tiempo real:"
    echo "   1. Ve al terminal donde corre 'npm run dev'"
    echo "   2. Busca estas líneas cuando registres un empeño:"
    echo ""
    echo -e "${GREEN}   [DEBUG] valorMercado recibido: XXXX${NC}"
    echo -e "${BLUE}   [DEBUG] montoPrestamo recibido: XXXX${NC}"
    echo -e "${YELLOW}   [AUTO-CALC] valorMercado estimado desde montoPrestamo: ...${NC}"
    echo -e "${RED}   [ERROR CRÍTICO] No hay valorMercado ni montoPrestamo${NC}"
    echo ""
else
    echo "❌ No se detectó el servidor corriendo"
    echo "➡️  Inicia el servidor con: npm run dev"
fi
