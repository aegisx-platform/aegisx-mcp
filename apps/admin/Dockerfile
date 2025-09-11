# Simple Angular Admin App Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Copy admin app files
COPY apps/admin/ apps/admin/
COPY libs/ libs/

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the app
RUN npx nx build admin --configuration=production

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/apps/admin /usr/share/nginx/html

# Copy nginx config
COPY apps/admin/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]