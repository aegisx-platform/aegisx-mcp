FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy web app files
COPY apps/web/ apps/web/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Approve build scripts for required packages
RUN pnpm approve-builds || true

# Build the app with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=3072" pnpm nx build web --configuration=production

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080


CMD ["nginx", "-g", "daemon off;"]
