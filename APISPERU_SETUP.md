# 🔧 Configuración de APIsPERU para DNI/RUC

## ⚡ Inicio Rápido (RECOMENDADO)

### 1. Registrarse en APIsPERU (GRATUITO - 2,000 consultas/mes)

1. Ve a [https://apisperu.com/servicios/dniruc](https://apisperu.com/servicios/dniruc)
2. Haz clic en "Regístrate" o "¡Lo quiero!"
3. Completa el registro
4. Inicia sesión y obtén tu **Token de API** del dashboard

### 2. Configurar Variable de Entorno

```bash
# En .env.local (crear si no existe)
APISPERU_TOKEN=tu_token_aqui
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
   - ✅ `🔍 [APIsPERU] Consultando DNI: ...` → Usando API premium
   - ⚠️ `ℹ️ [APIsPERU] Token no configurado...` → Usando fallback

## 📊 Planes Disponibles

### Plan GRATUITO ⭐ (Recomendado para empezar)

- **2,000 consultas/mes** (67 por día)
- **Consulta DNI y RUC**
- Sin soporte técnico
- **Costo**: S/ 0.00

### Plan PREMIUM

- **Consultas ilimitadas**
- **Consulta DNI y RUC**
- Soporte por WhatsApp
- **Costo**: S/ 30.00/mes (+ IGV)

## 🎯 Beneficios vs Otras APIs

| Característica | APIsPERU | ApiPeruDev | Api Gratuita |
|----------------|----------|------------|--------------|
| Consultas/mes | **2,000** 🥇 | 100 | Ilimitado |
| Cobertura DNI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Confiabilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Datos SUNAT | ✅ Oficiales | ✅ Oficiales | ⚠️ Scraping |
| Costo | Gratis | Gratis | Gratis |

## 💡 Sistema de Fallback Automático (Triple API)

El sistema tiene **3 niveles de fallback**:

```
1️⃣ APIsPERU (2,000/mes)
   ↓ (si falla o no hay token)
2️⃣ ApiPeruDev (100/mes)
   ↓ (si falla o no hay token)
3️⃣ apis.net.pe (ilimitado, cobertura limitada)
```

**Ventaja**: Nunca hay interrupción del servicio, siempre hay un fallback disponible.

## 📈 ¿Cuándo Escalar?

### Mantén Plan Gratuito si

- Procesas menos de 2,000 consultas/mes
- Estás en fase de testing/desarrollo
- Tienes pocos usuarios

### Sube a Plan Premium si

- Necesitas más de 2,000 consultas/mes
- Estás en producción
- Requieres soporte técnico

## 🔄 APIs Alternativas (Opcional)

Si quieres usar **ApiPeruDev** como respaldo:

```bash
# Agregar a .env.local
APIPERU_DEV_TOKEN=tu_token_apiperu_dev
```

Registrarse en: [https://apiperu.dev/auth/register](https://apiperu.dev/auth/register)

## 🎊 Promoción Especial

**APIsPERU ofrece el PRIMER MES TOTALMENTE GRATIS con** todo ilimitado! 🎊

Aprovecha esta oferta registrándote ahora: [https://apisperu.com/servicios/dniruc](https://apisperu.com/servicios/dniruc)

---

## 📞 Soporte APIsPERU

- WhatsApp: [+51 935 600 914](https://api.whatsapp.com/send?phone=51935600914)
- Facebook: [facebook.com/apisperuio](http://facebook.com/apisperuio/)
- YouTube: [@apisperu](https://www.youtube.com/@apisperu/playlists)
- GitHub: [github.com/apisperu](https://github.com/apisperu)
