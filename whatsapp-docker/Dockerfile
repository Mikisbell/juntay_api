# 1. Base Node 22
FROM node:22-bullseye

# 2. Instalar Chrome y Git
RUN apt-get update && apt-get install -y \
    chromium \
    git \
    && rm -rf /var/lib/apt/lists/*

# 3. Clonar código fuente
RUN git clone https://github.com/devlikeapro/waha.git /app

# 4. Directorio de trabajo
WORKDIR /app

# 5. Instalar dependencias (CORREGIDO: SIN --omit=dev)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# >>> ¡OJO AQUÍ! Solo dice --legacy-peer-deps <<<
RUN npm install --legacy-peer-deps

# 6. Construir el proyecto (Ahora sí funcionará)
RUN npm run build

# 7. Exponer puerto
EXPOSE 3000

# 8. Arrancar
CMD ["npm", "run", "start:prod"]
