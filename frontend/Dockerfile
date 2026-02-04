FROM node:22-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy full frontend source
COPY . .

EXPOSE 3000

# Run Next.js in dev mode
CMD ["npm", "run", "dev"]
