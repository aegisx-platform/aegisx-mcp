# Simple Fastify API Dockerfile
FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy API source and config files
COPY apps/api/ apps/api/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Approve build scripts for required packages
RUN pnpm approve-builds || true

# Debug environment before build
RUN echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    echo "PNPM version: $(pnpm --version)" && \
    echo "Available memory: $(free -h)" && \
    echo "Current directory: $(pwd)" && \
    echo "Files in current directory:" && ls -la

# Build the API with memory optimization and error handling
RUN set -e && \
    echo "Starting API build..." && \
    NODE_OPTIONS="--max-old-space-size=2048" pnpm nx build api --configuration=production && \
    echo "API build completed successfully" && \
    ls -la dist/apps/api/

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/api/main.js"]