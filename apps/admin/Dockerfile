# Multi-stage production-optimized Dockerfile for AegisX Admin Application
# Stage 1: Base builder with security hardening
FROM node:20.19.0-alpine3.20 AS base

# Install security updates and build dependencies
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    python3=~3.12 \
    make=~4.4 \
    g++=~13.2 \
    && rm -rf /var/cache/apk/* \
    && npm config set audit-level moderate

# Create non-root build user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aegisx -u 1001 -G nodejs

WORKDIR /app

# Ensure proper ownership of /app directory for non-root user
RUN chown -R aegisx:nodejs /app

USER aegisx

# Stage 2: Dependencies with optimized caching
FROM base AS dependencies

# Copy package files for dependency installation (optimize Docker layer caching)
COPY --chown=aegisx:nodejs package*.json yarn.lock ./
COPY --chown=aegisx:nodejs nx.json tsconfig.base.json ./

# Copy project configurations
COPY --chown=aegisx:nodejs apps/admin/project.json apps/admin/
COPY --chown=aegisx:nodejs apps/admin/tsconfig*.json apps/admin/

# Ensure node_modules directory has proper permissions
RUN mkdir -p /app/node_modules && chown -R aegisx:nodejs /app/node_modules

# Install dependencies with cache optimization
RUN yarn install --frozen-lockfile --network-timeout 600000 \
    --prefer-offline --cache-folder /tmp/yarn-cache \
    && rm -rf /tmp/yarn-cache

# Stage 3: Build stage
FROM dependencies AS builder

# Copy source code and libraries
COPY --chown=aegisx:nodejs apps/admin/src apps/admin/src/
COPY --chown=aegisx:nodejs apps/admin/public apps/admin/public/
COPY --chown=aegisx:nodejs libs/ libs/

# Build Angular application with production optimizations (disable Nx daemon for Docker)
RUN NODE_ENV=production NX_DAEMON=false npx nx build admin --configuration=production \
    --optimization --extractLicenses --namedChunks=false \
    --outputHashing=all --buildOptimizer --aot

# Stage 4: Production runtime with hardened Nginx
FROM nginx:1.26.2-alpine3.20 AS production

# Install security updates and essential tools
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    tini=~0.19 \
    wget=~1.24 \
    fail2ban \
    && rm -rf /var/cache/apk/* /tmp/* \
    && rm -f /var/log/nginx/access.log /var/log/nginx/error.log

# Create non-root user for enhanced security
RUN addgroup -g 1001 -S aegisx && \
    adduser -S aegisx -u 1001 -G aegisx

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chown -R aegisx:aegisx /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod 755 /var/cache/nginx /var/log/nginx /var/run && \
    chmod 750 /usr/share/nginx/html

# Copy built application from builder stage with correct ownership
COPY --from=builder --chown=aegisx:aegisx /app/dist/apps/admin /usr/share/nginx/html

# Copy hardened Nginx configuration for admin panel
COPY --chown=root:root apps/admin/nginx.conf /etc/nginx/nginx.conf

# Security: Remove default nginx files and set proper permissions
RUN rm -f /etc/nginx/conf.d/default.conf && \
    chmod 644 /etc/nginx/nginx.conf

# Switch to non-root user
USER aegisx

# Expose port
EXPOSE 8080

# Enhanced health check with better error handling and admin-specific checks
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider --timeout=5 http://localhost:8080/health || exit 1

# Set environment variables for production admin panel
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates \
    NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template \
    TZ=UTC \
    ADMIN_PANEL=true

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]