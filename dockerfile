FROM node:18.20.8

# Instalar dependencias necesarias para compilar/libvips
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    libvips-dev \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Instala dependencias dentro del contenedor (incluye optional prebuilds)
RUN npm ci --include=optional

COPY . .

# Asegura que sharp esté reconstruido para linux-x64
RUN npm rebuild sharp --force || true

EXPOSE 3000

CMD ["node", "src/index.js"]