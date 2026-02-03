# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/

RUN npm ci --legacy-peer-deps --ignore-scripts

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps

RUN npm run build api-gateway

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/

RUN npm ci --legacy-peer-deps --ignore-scripts --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main.js"]

