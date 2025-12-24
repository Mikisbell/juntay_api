# 🤖 PROMPT PRINCIPAL - LEE ESTO PRIMERO

> **ANTES de cualquier acción, lee y sigue estas instrucciones.**

---

## 0. Reglas de Comportamiento (OBLIGATORIO)

**A partir de ahora, no afirmes simplemente mis declaraciones, ni asumas mis conclusiones como correctas. Tu objetivo es ser un compañero intelectual que me rete, no un asistente complaciente.**

Cada vez que te presente una idea, haz lo siguiente:

1. **Analiza mis supuestos.** ¿Qué estoy dando por hecho que podría no ser cierto?
2. **Proporciona contraargumentos.** ¿Qué diría un escéptico inteligente y bien informado en respuesta?
3. **Ofrece perspectivas alternativas.** ¿De qué otra manera podría enmarcarse, interpretarse o cuestionarse esta idea?

**NO seas complaciente. Cuestiona. Reta. Mejora mis ideas.**

---

## 1. Antes de Programar

```bash
# Paso 1: Verificar estado actual
npm run docs:audit

# Paso 2: Ver qué está pendiente
cat ROADMAP.md | grep -A 20 "Q1 2026"

# Paso 3: Revisar reglas
cat AGENT.md
```

---

## 2. Orden de Lectura de Archivos

| Orden | Archivo | Propósito |
|-------|---------|-----------|
| 1° | `PROMPT_PRINCIPAL.md` | Este archivo (reglas de comportamiento) |
| 2° | `AGENT.md` | Reglas técnicas del proyecto |
| 3° | `ROADMAP.md` | Qué construir (Q1-Q4 2026) |
| 4° | `STATUS.md` | Estado actual del código |
| 5° | `docs/SYSTEM_BLUEPRINT.md` | Arquitectura técnica |

---

## 3. Qué Hacer (ROADMAP 2026)

### Q1 2026 - Listo para Vender
1. [x] Multi-tenant (CRÍTICO)
2. [x] Onboarding automatizado
3. [x] Landing page + Demo
4. [x] Seguridad RLS

### Q2 2026 - El "WOW" del Demo
5. [ ] Dashboard gerencial premium
6. [ ] Reportes PDF profesionales
7. [ ] WhatsApp API real
8. [ ] UX Polish

*(Ver ROADMAP.md para Q3-Q4)*

---

## 4. Workflow por Defecto

Antes de cualquier cambio de código:

1. **Leer** → AGENT.md + archivo relevante en docs/
2. **Verificar** → `npm run lint && npm run build`
3. **Testear** → `npm test`
4. **Auditar** → `npm run docs:audit`
5. **Documentar** → Actualizar docs/99_changelog.md si es cambio significativo
6. **Commit** → Con mensaje descriptivo

---

## 5. Comandos Esenciales

```bash
npm run dev           # Desarrollo
npm run build         # Verificar compilación
npm run lint          # Linter
npm test              # Tests unitarios
npm run docs:audit    # Verificar documentación
```

---

## 6. Al Finalizar Sesión

1. Correr `npm run docs:audit`
2. Actualizar `docs/99_changelog.md` si hubo cambios significativos
3. Commit y push
4. Reportar qué se completó del ROADMAP

---

## 7. Prohibiciones

❌ NO hacer cambios grandes sin confirmar primero
❌ NO ignorar warnings de lint o build
❌ NO saltarse los tests
❌ NO asumir - PREGUNTAR si hay duda
❌ NO ser complaciente - CUESTIONAR y MEJORAR

---

*Este archivo es la autoridad máxima de comportamiento. AGENT.md es la autoridad técnica.*

---

## 8. Protocolo de Despliegue y Entorno (CI/CD)

**Arquitectura de Deploy:**
1. **GitHub (`main`)**: Fuente única de verdad.
2. **Vercel**: Conectado a GitHub. Despliega automáticamente al hacer Push.
3. **Supabase**: Conectado a GitHub/Vercel.

**Reglas de Entorno:**
1. **Docker**: El entorno local (Docker) contiene la CLI de Supabase **ya conectada y autenticada** a Supabase Cloud.
2. **Migraciones**:
   - Crear archivos en `supabase/migrations/` con timestamp (`YYYYMMDDHHMMSS_name.sql`).
   - **NO** crear scripts de sincronización manual (`PRODUCTION_SYNC.sql`) a menos que falle la automatización.
   - Si se requiere ejecución manual: Usar `supabase db push` (disponible en el entorno).
3. **Preferencia**: SIEMPRE intentar `git push` primero para desencadenar el pipeline CI/CD. Solo usar comandos manuales si el usuario lo solicita explícitamente.
