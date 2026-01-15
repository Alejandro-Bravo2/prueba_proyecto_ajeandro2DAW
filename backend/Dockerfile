# ============================================================================
# COFIRA Backend - Multi-Stage Dockerfile
# ============================================================================
# Stage 1: Build Spring Boot Application
# Stage 2: Run with JRE
# ============================================================================

# ============================================================================
# STAGE 1: Build
# ============================================================================
FROM gradle:8.14-jdk21 AS build

# Set working directory
WORKDIR /app

# Add labels for better image management
LABEL maintainer="alejandrobravo"
LABEL description="Cofira Backend - Spring Boot API"
LABEL version="1.0.0"

# Copy gradle files
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src src

# Build application (skip tests for faster build)
RUN gradle clean build -x test --no-daemon

# ============================================================================
# STAGE 2: Production
# ============================================================================
FROM eclipse-temurin:21-jre-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S spring && \
    adduser -S springboot -u 1001 -G spring

# Copy built JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Change ownership to non-root user
RUN chown springboot:spring app.jar

# Switch to non-root user
USER springboot

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM optimizations for containers
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
