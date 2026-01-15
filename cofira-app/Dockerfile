# ============================================================================
# COFIRA Frontend - Multi-Stage Dockerfile
# ============================================================================
# Stage 1: Build Angular Application
# Stage 2: Serve with Nginx
# ============================================================================

# ============================================================================
# STAGE 1: Build
# ============================================================================
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Add labels for better image management
LABEL maintainer="alejandrobravo"
LABEL description="Cofira Frontend - Angular Application"
LABEL version="1.0.0"

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build application for production
RUN npm run build -- --configuration=production

# ============================================================================
# STAGE 2: Production
# ============================================================================
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist/cofira-app/browser /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001 && \
    chown -R angular:nodejs /usr/share/nginx/html && \
    chown -R angular:nodejs /var/cache/nginx && \
    chown -R angular:nodejs /var/log/nginx && \
    chown -R angular:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R angular:nodejs /var/run/nginx.pid

# Switch to non-root user
USER angular

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
