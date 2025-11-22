# 1. CAMBIO IMPORTANTE: Usamos Node 22 (Requerido por la nueva versión de WhatsApp)
FROM node:22-bullseye

# 2. Instalar Chrome y Git
# (Mantenemos bullseye para que esta instalación siga funcionando igual)
RUN apt-get update && apt-get install -y \
    chromium \
    git \
    && rm -rf /var/lib/apt/lists/*

# 3. Clonar código fuente
RUN git clone https://github.com/devlikeapro/waha.git /app

# 4. Directorio de trabajo
WORKDIR /app

# 5. Instalar dependencias
# Configuramos Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instalar ignorando conflictos de versiones antiguas (--legacy-peer-deps)
RUN npm install --omit=dev --legacy-peer-deps

# 6. Construir el proyecto
RUN npm run build

# 7. Exponer puerto
EXPOSE 3000

# 8. Arrancar
CMD ["npm", "run", "start:prod"]
