# 1. Usamos una imagen base OFICIAL de Node (Esta nunca falla porque está en todos los espejos)
FROM node:18-bullseye

# 2. Instalamos Chrome y Git (Necesario para WhatsApp y para descargar el código)
# Esto convierte el servidor vacío en uno capaz de correr el navegador.
RUN apt-get update && apt-get install -y \
    chromium \
    git \
    && rm -rf /var/lib/apt/lists/*

# 3. Clonamos el código fuente de WAHA directamente desde GitHub
# (Bypass total a Docker Hub)
RUN git clone https://github.com/devlikeapro/waha.git /app

# 4. Preparamos el directorio de trabajo
WORKDIR /app

# 5. Instalamos las dependencias del proyecto
# Configuramos para que NO descargue otro Chrome, sino que use el que instalamos arriba (ahorra espacio y RAM)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN npm install --omit=dev

# 6. Exponemos el puerto
EXPOSE 3000

# 7. Comando de arranque
CMD ["npm", "start"]
