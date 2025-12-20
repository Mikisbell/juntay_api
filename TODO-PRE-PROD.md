# TODO Pre-Producción

> Gaps identificados en verificación 20-Dic-2025.
> Resolver antes de lanzar a usuarios reales.

## 🔴 CRÍTICO: Seguridad RLS

### Pendiente:
- [ ] Test: Cajero solo ve créditos de su sucursal
- [ ] Test: Cliente no puede ver datos de otros
- [ ] Verificar RLS policies en todas las tablas Q3

### Cómo probar:
```typescript
// Usar anon key en lugar de service_role
const supabase = createClient(URL, ANON_KEY)
// Intentar leer créditos de otra sucursal
// Debe retornar vacío o error
```

---

## 🟡 MEDIO: Flujos de Negocio E2E

### Pendiente:
- [ ] Test flujo cajero: Login → Abrir caja → Prestar → Cobrar
- [ ] Test flujo admin: Ver dashboard → Crear sucursal → Asignar empleado
- [ ] Test flujo cobrador: Login → Ver ruta → Registrar visita

---

## 🟢 BAJO: Performance

### Pendiente:
- [ ] Load test con 10,000 créditos
- [ ] Query optimization si hay slow queries

---

## ✅ COMPLETADO

| Verificación | Estado |
|--------------|--------|
| Build | ✅ |
| Lint | ✅ 0 warnings |
| Unit tests | ✅ 43/43 |
| E2E CRUD | ✅ 24/24 |
| DB Schema | ✅ 8 tablas Q3 |
