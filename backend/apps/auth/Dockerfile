# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/auth/package*.json ./apps/auth/

RUN npm ci --legacy-peer-deps --ignore-scripts

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY common ./common

RUN npx prisma generate --schema=apps/auth/prisma/schema.prisma
RUN npm run build auth

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/auth/package*.json ./apps/auth/

RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy entire Prisma directory structure
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/apps/auth/prisma ./apps/auth/prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["npm","run", "start:dev" ,"auth"]
