#!/bin/bash

# Script de prueba del flujo de nuevo empeño
# Simula las llamadas que haría el navegador

echo "🧪 Iniciando prueba del flujo de nuevo empeño..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BASE_URL="http://localhost:3000"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}1. Verificando que el servidor esté corriendo...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/dashboard/mostrador/nuevo-empeno)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Servidor respondiendo correctamente (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Error: Servidor respondió con HTTP $HTTP_CODE${NC}"
    exit 1
fi

echo -e "\n${YELLOW}2. Probando creación de empeño (simulación)...${NC}"
echo "   Datos de prueba:"
echo "   - Cliente: Juan Pérez (DNI: 43708667)"
echo "   - Categoría: electrodomesticos"
echo "   - Subcategoría: lavadoras"
echo "   - Monto: 500"
echo "   - valorMercado: 800"

# Datos de prueba
PAYLOAD='{
  "cliente": {
    "dni": "43708667",
    "nombres": "Juan",
    "apellidos": "Pérez"
  },
  "detallesGarantia": {
    "categoria": "electrodomesticos",
    "subcategoria": "lavadoras",
    "marca": "LG",
    "modelo": "WM-500",
    "serie": "ABC123",
    "estado_bien": "BUENO",
    "descripcion": "Lavadora en buen estado",
    "valorMercado": 800,
    "fotos": [],
    "montoPrestamo": 500,
    "tasaInteres": 20
  },
  "condicionesPago": {
    "frecuenciaPago": "MENSUAL",
    "numeroCuotas": 4,
    "fechaInicio": "'$(date -I)'"
  },
  "opciones": {
    "enviarWhatsapp": false,
    "imprimirAuto": false
  }
}'

echo -e "\n${YELLOW}3. Enviando solicitud al servidor...${NC}"
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  $BASE_URL/api/test-empeno 2>&1)

echo "$RESPONSE"

echo -e "\n${YELLOW}4. Instrucciones para prueba manual:${NC}"
echo "   1. Abre tu navegador en: ${BASE_URL}/dashboard/mostrador/nuevo-empeno"
echo "   2. Completa el formulario con los datos de arriba"
echo "   3. Si hay error, copia los logs del terminal donde corre 'npm run dev'"
echo "   4. Busca estas líneas en los logs:"
echo "      ${GREEN}[DEBUG] valorMercado recibido: 800${NC}"
echo "      ${GREEN}[DEBUG] montoPrestamo recibido: 500${NC}"
echo "   5. Si ves un error, búscalo y muéstramelo"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Script completado. Por favor realiza la prueba manual."
