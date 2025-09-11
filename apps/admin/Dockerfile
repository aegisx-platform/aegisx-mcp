# Simple Angular Admin App Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy admin app files
COPY apps/admin/ apps/admin/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm nx build admin --configuration=production

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/apps/admin /usr/share/nginx/html

# Copy nginx config
COPY apps/admin/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]