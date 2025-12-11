# 🎨 UX/UI y Flujos de Usuario – JUNTAY

Este documento resume la filosofía UX/UI del sistema y los principales flujos guiados.

Para detalle completo, ver la sección de UX/UI en `Guia_de_trabajo.md`.

---

## 1. Filosofía UX/UI

- **Columna Banco:** estructura, seguridad y seriedad.
- **Columna Casa de Empeño:** transparencia radical (nada oculto, nada confuso).
- **Columna Human-Centered:** flujos guiados, textos claros y lenguaje humano.

Preguntas que toda pantalla crítica debe responder:

1. ¿Cuánto recibe hoy?
2. ¿Cuánto pagará en total?
3. ¿Cuándo vence?
4. ¿Qué pasa si no paga?
5. ¿Cómo recupera su prenda?

---

## 2. Patrones de Tipografía y Navegación

- Marca / Sidebar: texto pequeño pero legible, `font-semibold`, colores grises.
- Ítems de menú lateral: `text-xs`–`text-sm`, íconos Lucide `h-5 w-5`.
- Encabezados de página (h1):

```tsx
<h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
  Título de la pantalla
</h1>
<p className="text-sm text-gray-600">
  Descripción corta / contexto.
</p>
```

---

## 3. Tablas tipo Back-Office Bancario

- Encabezados (`<th>`):
  - `text-[11px]`, `font-medium`, `text-gray-500`, `uppercase`.
  - Fondo `bg-gray-50`, borde inferior.
- Celdas (`<td>`):
  - Datos principales: `text-sm`, `font-medium`, `text-gray-900`.
  - Datos secundarios: `text-xs`, `text-gray-600`.
  - Códigos: `font-mono text-xs`.
- Filas: `hover:bg-gray-50`.

Este patrón se usa en listados de contratos, créditos, vencimientos, remates, etc.

---

## 4. Formularios Estándar

Patrón de layout para formularios principales:

```tsx
<form className="space-y-6 max-w-4xl mx-auto">
  <div className="flex items-center space-x-4">
    {/* Botón atrás */}
    {/* Título + descripción */}
  </div>

  {/* Secciones en Cards (datos de identificación, contacto, dirección, etc.) */}
</form>
```

Ejemplos:

- Nuevo Cliente.
- Nueva Garantía.
- Nueva Solicitud de Crédito.

---

## 5. Cards y Resúmenes Laterales

- Cards: `rounded-lg border bg-card text-card-foreground shadow-sm`.
- Encabezado: `CardHeader` con `p-6`.
- Contenido: `CardContent` con `p-6 pt-0`.
- Hover: `hover:shadow-md transition-shadow`.

Resúmenes laterales deben responder las 5 preguntas clave del negocio (monto, total, vencimiento, qué pasa si no paga, cómo recupera la prenda).

---

## 6. Flujos Críticos

### 6.1 Nuevo Empeño / Crédito

1. Seleccionar o crear cliente.
2. Registrar garantía (incluye fotos y tasación).
3. Configurar crédito: monto, interés, frecuencia.
4. Mostrar resumen (lo que recibe, lo que paga, plazos).
5. Generar contrato PDF.

### 6.2 Pago / Renovación / Recuperación

1. Buscar crédito o contrato.
2. Elegir tipo de pago (parcial, total, renovación).
3. Mostrar impacto en saldo y fechas.
4. Confirmar operación y emitir comprobante / mensaje.

### 6.3 Vencimientos y Remates

1. Ver créditos próximos a vencer.
2. Ejecutar notificaciones de recordatorio.
3. Pasar a estado de remate si no hay respuesta.
4. Registrar remate y resultado final.

Todos los nuevos flujos deben alinearse a estos patrones y ser actualizados en este documento y en `Guia_de_trabajo.md` cuando se modifiquen.
