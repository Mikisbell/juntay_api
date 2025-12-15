#!/bin/bash
echo "🧪 Testing Payment Flow..."
BASE_URL="http://localhost:3000"

PAYLOAD='{
  "creditoId": "dummy-credito-id",
  "tipoPago": "interes",
  "montoPagado": 100,
  "cajaOperativaId": "dummy-caja-id",
  "metodoPago": "EFECTIVO"
}'

curl -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  $BASE_URL/api/test-pago
