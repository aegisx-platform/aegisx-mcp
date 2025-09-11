# Multi-stage production-optimized Dockerfile for AegisX API
# Stage 1: Base builder with security hardening
FROM node:20.19.0-alpine3.20 AS base

# Install security updates and essential build tools
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    python3=~3.12 \
    make=~4.4 \
    g++=~13.2 \
    dumb-init=~1.2 \
    && rm -rf /var/cache/apk/* \
    && npm config set audit-level moderate

# Security: Run as non-root during build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aegisx -u 1001 -G nodejs

WORKDIR /app

# Ensure proper ownership of /app directory for non-root user
RUN chown -R aegisx:nodejs /app

USER aegisx

# Stage 2: Dependencies installation with layer caching optimization
FROM base AS dependencies

# Copy package files for dependency installation (leverage Docker layer caching)
COPY --chown=aegisx:nodejs package*.json yarn.lock ./
COPY --chown=aegisx:nodejs nx.json tsconfig.base.json ./

# Copy project-specific configurations
COPY --chown=aegisx:nodejs apps/api/project.json apps/api/
COPY --chown=aegisx:nodejs apps/api/tsconfig*.json apps/api/

# Ensure node_modules directory has proper permissions
RUN mkdir -p /app/node_modules && chown -R aegisx:nodejs /app/node_modules

# Install dependencies with cache optimization and security settings
RUN yarn install --frozen-lockfile --network-timeout 600000 \
    --prefer-offline --production=false \
    --cache-folder /tmp/yarn-cache \
    && rm -rf /tmp/yarn-cache

# Stage 3: Build stage
FROM dependencies AS builder

# Copy source code and libraries
COPY --chown=aegisx:nodejs apps/api/src apps/api/src/
COPY --chown=aegisx:nodejs libs/ libs/

# Build the application with production optimizations (disable Nx daemon for Docker)
RUN NODE_ENV=production NX_DAEMON=false npx nx build api --configuration=production \
    --optimization --extractLicenses --namedChunks=false \
    --outputHashing=all

# Create production node_modules (remove dev dependencies)
RUN yarn install --frozen-lockfile --production=true \
    --network-timeout 600000 --ignore-scripts --prefer-offline \
    && yarn cache clean

# Stage 4: Production runtime with minimal footprint
FROM node:20.19.0-alpine3.20 AS production

# Install only essential runtime packages and security updates
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    dumb-init=~1.2 \
    tini=~0.19 \
    && rm -rf /var/cache/apk/* /tmp/* \
    && npm cache clean --force

# Create non-root user with minimal privileges
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aegisx -u 1001 -G nodejs

# Set secure working directory
WORKDIR /app

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/uploads /tmp/app && \
    chown -R aegisx:nodejs /app /tmp/app && \
    chmod 750 /app && \
    chmod 755 /app/logs

# Copy application with optimized ownership
COPY --from=builder --chown=aegisx:nodejs /app/dist/apps/api/ ./
COPY --from=builder --chown=aegisx:nodejs /app/node_modules/ ./node_modules/

# Copy health check script
COPY --chown=aegisx:nodejs apps/api/src/healthcheck.js ./

# Switch to non-root user early for security
USER aegisx

# Security: Set read-only root filesystem (where possible)
# Note: Some paths need to be writable, handled via volumes

# Expose application port
EXPOSE 3000

# Multi-layer health check for production reliability
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node healthcheck.js || exit 1

# Production environment configuration
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=512" \
    NODE_PATH=/app/node_modules \
    TZ=UTC

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application with dumb-init for signal handling
CMD ["dumb-init", "node", "main.js"]