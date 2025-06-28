# Multi-stage build for production efficiency
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S crm-user -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=crm-user:nodejs /app/dist ./dist
COPY --from=deps --chown=crm-user:nodejs /app/node_modules ./node_modules
COPY --chown=crm-user:nodejs package*.json ./

# Install curl for health checks
RUN apk add --no-cache curl

# Switch to non-root user
USER crm-user

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4001/api/health || exit 1

# Start application
CMD ["node", "dist/app.js"]