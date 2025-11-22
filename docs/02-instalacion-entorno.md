# ⚙️ Instalación y Entorno de Desarrollo – JUNTAY

Guía resumida para levantar un entorno de desarrollo completo.

Para el detalle completo, ver `Guia_de_trabajo.md` (sección 4 y flujo diario).

---

## 1. Prerrequisitos en Windows

1. **WSL 2 con Ubuntu 24.04**
   - Abrir PowerShell (Admin) y ejecutar:
     ```bash
     wsl --install
     ```
   - Reiniciar y crear usuario en Ubuntu.

2. **Docker Desktop**
   - Instalar Docker Desktop para Windows.
   - Activar integración WSL para `Ubuntu-24.04`:
     `Settings → Resources → WSL Integration`.

3. **WindSurf IDE**
   - Instalar WindSurf en Windows.
   - Conectar a WSL:
     - Abrir WindSurf → `Remote Explorer` → `WSL Targets`.
     - Clic derecho en `Ubuntu-24.04` → `Connect in New Window`.

---

## 2. Preparar WSL (Ubuntu)

En la terminal de WindSurf (conectada a `WSL: Ubuntu-24.04`):

```bash
sudo apt update
sudo apt install curl git

# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Cerrar y abrir la terminal de nuevo
nvm install --lts
nvm use --lts
```

---

## 3. Clonar e Instalar el Proyecto

```bash
# Ir a tu carpeta de desarrollo
cd ~

# Clonar el repo
git clone <URL_DEL_REPOSITORIO>
cd juntay_api

# Instalar dependencias
npm install
```

Asegúrate de que `package.json` tiene `"type": "module"` y los scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

---

## 4. Supabase Local

Con Docker Desktop corriendo en Windows:

```bash
# (Solo una vez) Inicializar supabase
# npx supabase init

# Levantar servicios (Postgres, Auth, Storage, Studio)
npx supabase start

# (Opcional) Resetear DB y aplicar migraciones
# npx supabase db reset
```

Configura `.env.local` en la raíz:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_LOCAL
```

Los valores exactos se obtienen de:

```bash
npx supabase status
```

---

## 5. Levantar el Frontend

En otra terminal (WSL, misma carpeta `juntay_api`):

```bash
npm run dev
```

Abrir en el navegador de Windows:

```text
http://localhost:3000
```

---

## 6. Flujo Diario Resumido

1. Encender **Docker Desktop**.  
2. Conectar WindSurf a `WSL: Ubuntu-24.04`.  
3. Terminal 1 (WSL, proyecto): `npx supabase start`.  
4. Terminal 2 (WSL, proyecto): `npm run dev`.  
5. Navegador: `http://localhost:3000`.

Para troubleshooting (CJS vs ESM, lock de Next, tw-animate-css), ver sección 6 de `Guia_de_trabajo.md`.
