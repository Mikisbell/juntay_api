# 🚀 Servidor de Desarrollo - Juntay API

## Comandos Disponibles

### Desarrollo (Recomendado)

```bash
npm run dev
```

Este comando inicia **ambos servidores simultáneamente**:

- 🟦 **Next.js** (puerto 3000) - API y frontend
- 🟩 **WhatsApp Server** (puerto 3001) - Mensajería

Salida con colores:

- `[Next]` en **cyan** para logs de Next.js
- `[WA]` en **verde** para logs de WhatsApp

### Comandos Individuales (Opcional)

Si necesitas iniciar solo uno de los servidores:

```bash
# Solo Next.js
npm run dev:next

# Solo WhatsApp
npm run dev:whatsapp
```

### Producción

```bash
npm run build
npm run start
```

## 📱 Servicios y Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Next.js App | 3000 | <http://localhost:3000> |
| WhatsApp API | 3001 | <http://localhost:3001> |
| WhatsApp Status | 3001 | <http://localhost:3001/status> |

## 🔧 Primera Vez

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

- Supabase URL y Key
- Token de APIsPERU (opcional, para DNI/RUC)

### 3. Iniciar Servidores

```bash
npm run dev
```

## ✅ Verificar que Funciona

### WhatsApp Server

1. Espera a que aparezca el QR en la terminal (logs verdes `[WA]`)
2. Escanea el QR con WhatsApp
3. Cuando aparezca `✅ Cliente de WhatsApp conectado`, está listo

O visita: <http://localhost:3001/status>

### Next.js App

Visita: <http://localhost:3000>

## 🛑 Detener Servidores

Presiona `Ctrl + C` una vez para detener ambos servidores.

## 📝 Logs

Los logs de ambos servidores aparecen en la misma terminal con prefijos de color:

```
[Next] ▲ Next.js 15.0.3
[WA]   🚀 Servidor de WhatsApp API Local corriendo
[Next] ✓ Ready in 2.3s
[WA]   ✅ Cliente de WhatsApp conectado
```

## ⚡ Características

- ✅ **Inicio automático** de ambos servidores
- ✅ **Logs diferenciados** por colores
- ✅ **Hot reload** en desarrollo
- ✅ **Reconexión automática** de WhatsApp
