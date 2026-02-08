# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/event-reservation-service/package*.json ./apps/event-reservation-service/

RUN npm ci --legacy-peer-deps --ignore-scripts

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY common ./common

RUN npx prisma generate --schema=apps/event-reservation-service/prisma/schema.prisma
RUN npm run build event-reservation-service

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/event-reservation-service/package*.json ./apps/event-reservation-service/

RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy entire Prisma directory structure
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/apps/event-reservation-service/prisma ./apps/event-reservation-service/prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3002

CMD ["npm", "run", "start:dev", "event-reservation-service"]
