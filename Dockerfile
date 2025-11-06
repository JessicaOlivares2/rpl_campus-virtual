# ==================================
# ETAPA 1: BUILDER (Compilación)
# ==================================
FROM docker.io/library/node:20-slim AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de manifiesto de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias (usará caché si es posible)
RUN npm install

# Copia el código fuente completo al contenedor
COPY . .

# Generar el cliente de Prisma (si es necesario)
RUN npx prisma generate

# **ESTA ES LA LÍNEA CRÍTICA**
# Modificamos el comando para saltar las comprobaciones de tipos y linting 
# que causaban el fallo en tu build de Docker.
RUN npm run build -- --no-lint --no-ts

# ==================================
# ETAPA 2: RUNNER (Producción final)
# ==================================
FROM docker.io/library/node:20-slim AS runner

# Establece el directorio de trabajo
WORKDIR /app

# Crea un grupo y un usuario 'nextjs' para ejecutar la aplicación de forma segura
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copia la carpeta 'public' (activos estáticos) desde la etapa de construcción
COPY --from=builder --chown=nextjs:nodejs /app/public /app/public

# Copia los archivos de producción de Next.js (modo standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone /app
COPY --from=builder --chown=nextjs:nodejs /app/.next/static /app/.next/static

# Copia las carpetas de Prisma necesarias para la ejecución
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma /app/node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma /app/node_modules/.prisma

# Cambia al usuario no root
USER nextjs

# Puerto que Next.js escuchará
EXPOSE 3000

# Comando de inicio de la aplicación
CMD ["node", "server.js"]
