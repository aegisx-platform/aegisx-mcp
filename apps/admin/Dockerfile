FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy source code
COPY apps/admin/ apps/admin/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Approve builds to prevent interactive prompts
RUN pnpm approve-builds || true

# Build with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=3072" pnpm nx build admin --configuration=production

FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist/apps/admin /usr/share/nginx/html

# Copy nginx configuration
COPY apps/admin/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]