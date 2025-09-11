# Simple Fastify API Dockerfile
FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy API source
COPY apps/api/ apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API
RUN NODE_OPTIONS="--max-old-space-size=2048" pnpm nx build api

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/api/main.js"]