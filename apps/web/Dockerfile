# Simple Angular Web App Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Copy web app files
COPY apps/web/ apps/web/
COPY libs/ libs/

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the app
RUN npx nx build web --configuration=production

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]