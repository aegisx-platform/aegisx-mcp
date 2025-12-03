FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy landing app files
COPY apps/landing/ apps/landing/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Approve build scripts for required packages
RUN pnpm approve-builds || true

# Build the app with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=3072" pnpm nx build landing --configuration=production

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/apps/landing/browser /usr/share/nginx/html

# Copy nginx config
COPY apps/landing/nginx.conf /etc/nginx/nginx.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
