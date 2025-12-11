# 🏗️ Arquitectura Local-First – JUNTAY

Este documento resume la arquitectura Local-First utilizada por JUNTAY.

Para el detalle completo, ver en `Guia_de_trabajo.md`:

- Sección **1.3. Arquitectura "Local-First"**
- Sección **2. Stack Tecnológico y Plataformas**
- Sección **3. Arquitectura del Entorno de Desarrollo**

---

## 1. Visión

- Desarrollo **Local-First**: toda la pila (Supabase, PostgreSQL, Auth, Storage) corre en tu máquina.
- Máxima fidelidad con producción: el código se ejecuta en **Linux (WSL 2)** igual que en el servidor.
- Frontend moderno: **Next.js 14 + TypeScript** con UI en Tailwind + shadcn/ui.

---

## 2. Componentes Principales

- **Host (Windows 11)**  
  Ejecuta la interfaz de WindSurf y Docker Desktop.

- **WSL 2 (Ubuntu 24.04)**  
  - Código fuente (`juntay_api`).  
  - Node.js + Next.js.  
  - Supabase CLI.  
  - Git.

- **Docker Desktop (Windows)**  
  - Corre los contenedores de Supabase:  
    PostgreSQL, Auth (GoTrue), Storage, Studio.

- **Aplicación Next.js**  
  - Corre en `http://localhost:3000` (WSL).  
  - Se conecta a Supabase local (`http://127.0.0.1:54321`).

---

## 3. Diagrama Lógico (Texto)

- Usuario → Navegador (Windows)  
- Navegador → `http://localhost:3000` (Next.js en WSL)  
- Next.js → Supabase (`http://127.0.0.1:54321`)  
- Supabase → PostgreSQL + Auth + Storage (Docker Desktop)  

---

Para modificaciones de arquitectura o nuevas integraciones (RENIEC, WhatsApp, IA), actualizar también `Guia_de_trabajo.md`.
