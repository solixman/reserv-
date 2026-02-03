FROM node:22-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/

# Install with --ignore-scripts to skip post-install
RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy monorepo source
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps

EXPOSE 3000

# Run in watch mode
CMD ["npm", "run", "start:dev"]