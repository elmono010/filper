# ==============================
# Etapa 1: Instalar dependencias
# ==============================
FROM node:20-alpine AS deps
WORKDIR /app
# Solo copiamos package files para cache de dependencias
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# ==============================
# Etapa 2: Build (compilar TypeScript)
# ==============================
FROM node:20-alpine AS builder
WORKDIR /app
# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
# Copiar código fuente (SIN dist/ porque está en .dockerignore)
COPY . .
# Generar Prisma Client y compilar TypeScript desde 0
RUN npx prisma generate
RUN npx tsc --noEmit false --outDir dist
# Verificar que se compiló correctamente
RUN ls -la dist/ && echo "✅ Build OK"

# ==============================
# Etapa 3: Imagen de producción
# ==============================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copiar solo lo necesario del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Verificar que el entry point existe
RUN ls -la dist/index.js && echo "✅ Entry point found"

EXPOSE 4000

CMD ["node", "dist/index.js"]
