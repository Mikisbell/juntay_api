# 1. Imagen base Node
FROM node:18-bullseye

# 2. Instalar Chrome y Git
RUN apt-get update && apt-get install -y \
    chromium \
    git \
    && rm -rf /var/lib/apt/lists/*

# 3. Clonar código fuente
RUN git clone https://github.com/devlikeapro/waha.git /app

# 4. Directorio de trabajo
WORKDIR /app

# 5. Instalar dependencias (CORREGIDO: forzamos compatibilidad)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# Aquí agregamos --legacy-peer-deps para arreglar el error ERESOLVE
RUN npm install --omit=dev --legacy-peer-deps

# 6. Construir el proyecto (Build)
# WAHA necesita compilarse antes de correr
RUN npm run build

# 7. Exponer puerto
EXPOSE 3000

# 8. Arrancar
CMD ["npm", "run", "start:prod"]
