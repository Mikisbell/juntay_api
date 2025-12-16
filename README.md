    - **Caja:** Apertura y cierre ciego, control de efectivo y arqueos.
    - **Créditos:** Flujo de "Nuevo Empeño" con cotizador inteligente de oro y electro.
    - **Cobranzas:** Gestión de pagos, renovaciones y desempeños.

2. **Gestión de Activos:**
    - **Cartera:** Monitor de contratos vigentes y vencidos.
    - **Clientes:** CRM integrado con scoring de riesgo y perfilamiento.
    - **Bóveda:** Inventario físico de garantías con trazabilidad.

3. **Administración y Control:**
    - **Tesorería:** Inyecciones de capital, retiros y gestión de liquidez.
    - **Reportes:** Cierre diario, análisis de cartera y auditoría de transacciones.
    - **Configuración:** Motor de reglas dinámico para tasas e intereses.

| 🚀 **[DEPLOYMENT](./docs/DEPLOYMENT_PRODUCTION.md)** | **Infraestructura y Producción.** <br> *Léelo para desplegar a Supabase/Vercel.* | DevOps, Leads |
| 🗺️ **[ROADMAP & QA](./docs/ROADMAP_TESTING.md)** | **Plan de Pruebas y Futuro.** <br> *Léelo para testear y ver qué sigue (v4.0).* | QA, Product Owners |

### 🧠 Capa de Decisiones (ADRs)

Entiende el *por qué* detrás de la arquitectura:

- [ADR-001: Arquitectura Local-First](./docs/adr/001-local-first-architecture.md)
- [ADR-002: Integración WhatsApp (WAHA)](./docs/adr/002-whatsapp-integration.md)

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React, TypeScript.
- **UI System:** Shadcn/UI, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend:** Supabase (PostgreSQL), Server Actions.
- **Estado:** React Query (TanStack Query) para gestión de estado server-side.

## 📦 Estructura del Proyecto

```bash
src/
├── app/
│   ├── (auth)/               # Rutas públicas (Login)
│   ├── (dashboard)/          # Rutas protegidas (App Principal)
│   │   ├── dashboard/
│   │   │   ├── admin/        # Tesorería y Configuración
│   │   │   ├── caja/         # Terminal de Caja
│   │   │   ├── clientes/     # Directorio de Clientes
│   │   │   ├── reportes/     # Business Intelligence
│   │   │   └── ...
├── components/
│   ├── ui/                   # Componentes base (Shadcn)
│   ├── dashboard/            # Widgets (StatsGrid, Charts)
│   └── layout/               # Sidebar, Header
├── lib/
│   ├── actions/              # Server Actions (Lógica de Negocio)
│   └── utils/                # Utilidades y Helpers
```

## 🔧 Instalación y Despliegue

1. **Clonar el repositorio:**

    ```bash
    git clone https://github.com/Mikisbell/juntay_api.git
    cd juntay_api
    ```

2. **Instalar dependencias:**

    ```bash
    npm install
    ```

3. **Configurar variables de entorno:**
    Crear un archivo `.env.local` con las credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
    SUPABASE_SERVICE_ROLE_KEY=tu_service_key
    ```

4. **Ejecutar en desarrollo:**

    ```bash
    npm run dev
    ```

## 📄 Documentación

Para detalles profundos sobre la arquitectura y reglas de negocio, consultar la carpeta `docs/`:

- `🏛️ DOCUMENTACIÓN MAESTRA OFICIAL.md`: La biblia del proyecto.
- `docs/MANUAL_DESARROLLO_JUNTAY.md`: Guía para desarrolladores.

---
Desarrollado con ❤️ y precisión financiera.
