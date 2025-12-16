# 🔧 Configuración de ApiPeruDev para DNI/RUC

## ⚡ Inicio Rápido

### 1. Registrarse en ApiPeruDev (GRATUITO)

1. Ve a [https://apiperu.dev/auth/register](https://apiperu.dev/auth/register)
2. Completa el registro
3. Inicia sesión y ve al dashboard
4. Copia tu **Token de API**

### 2. Configurar Variable de Entorno

```bash
# En .env.local (crear si no existe)
APIPERU_TOKEN=tu_token_aqui
```

### 3. Reiniciar Servidor

```bash
# Detener servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

## ✅ Verificar que Funciona

1. Ir a: <http://localhost:3000/dashboard/demo-identificacion>
2. Ingresar un DNI (ej: tu propio DNI)
3. Verificar en la consola del servidor el mensaje:
   - ✅ `🔍 [ApiPeruDev] Consultando DNI: ...` → Usando API premium
   - ⚠️ `ℹ️ [ApiPeruDev] Token no configurado...` → Usando API gratuita (fallback)

## 📊 Plan Gratuito

- **100 consultas/mes** (suficiente para testing)
- **Datos oficiales de SUNAT**
- **Mejor cobertura que API gratuita**

## 🎯 Beneficios vs API Gratuita Actual

| Característica | ApiPeruDev | Api Gratuita |
|----------------|------------|--------------|
| Consultas/mes | 100 | Ilimitado |
| Cobertura DNI | ⭐⭐⭐⭐⭐ Alta | ⭐⭐ Baja |
| Confiabilidad | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Datos SUNAT | ✅ Oficiales | ⚠️ Scraping |

## 💡 Fallback Automático

Si no configuras el token o se agota el límite, el sistema **automáticamente usa la API gratuita**. No hay interrupciones del servicio.

## 📈 Escalar en Producción

Si necesitas más consultas:

- **Plan Micro**: S/ ~15/mes (2,500 consultas)
- **Plan Básico**: S/ ~40/mes (50,000 consultas)
