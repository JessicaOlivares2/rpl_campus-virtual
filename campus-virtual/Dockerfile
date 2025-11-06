# Etapa 1: Build
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Etapa 2: Producción
FROM node:20-slim AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]

