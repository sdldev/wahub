# Multi-stage build untuk optimasi size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files dari backend
COPY backend/package*.json ./
COPY backend/pnpm-lock.yaml* ./
COPY backend/bun.lockb* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile || npm install

# Copy source code backend dan build
COPY backend/ .
RUN pnpm run build || npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init untuk proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install pnpm
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --frozen-lockfile --production || npm install --production

# Copy built application dari builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create directories untuk persistent data
RUN mkdir -p /app/wa_credentials /app/media /app/logs
RUN chown -R nodejs:nodejs /app/wa_credentials /app/media /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 5001, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start application dengan dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]