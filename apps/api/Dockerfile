# Simple Fastify API Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Copy API source
COPY apps/api/ apps/api/

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Build the API
RUN npx nx build api

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/api/main.js"]