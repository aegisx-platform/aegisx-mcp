FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy source code
COPY apps/api/ apps/api/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=3072" pnpm nx build api --configuration=production

FROM node:22-alpine

WORKDIR /app

# Enable corepack and prepare pnpm for production
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy built application
COPY --from=builder /app/dist/apps/api ./

# Copy package files for production install
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["node", "main.js"]