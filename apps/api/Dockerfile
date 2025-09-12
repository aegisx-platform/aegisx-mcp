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

# Build the API with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=2048" pnpm nx build api --configuration=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/api/main.js"]