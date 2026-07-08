# =============================================================================
# Dockerfile — Next.js + Nginx Multi-Stage Build
# =============================================================================
#
# CONFIGURATION — update the variables below before use:
#
#   APP_INTERNAL_PORT   Port that Next.js listens on inside the container (default: 3000)
#   EXPOSED_PORT        Port exposed to the host / mapped by Docker (default: 16002)
#
# OPTIONAL SSL / NGINX:
#   Uncomment the SSL + Nginx config COPY lines in the production stage if you
#   want certificates baked into the image. For most deployments, prefer
#   mounting certs at runtime:
#
#     docker run -p <EXPOSED_PORT>:<EXPOSED_PORT> \
#       -v /path/to/your/certs:/etc/nginx/ssl \
#       your-image-name
#
# BUILD:
#   docker build -t your-image-name .
#
# RUN:
#   docker run -p 16002:16002 your-image-name
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (layer-cached unless lock file changes)
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy source and build
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Install Nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm install --production --frozen-lockfile

# Copy build artifacts from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# ---------------------------------------------------------------------------
# SSL & Nginx — choose ONE of the two options below:
#
# Option A (recommended): Mount certs at runtime — no certs baked into image.
#   Leave the lines below commented and pass -v at `docker run` time.
#
# Option B: Bake certs into the image (only for private/internal registries).
#   Uncomment the three lines below and ensure ./certs and ./nginx_config exist.
#
# RUN mkdir -p /etc/nginx/ssl /run/nginx
# COPY ./certs /etc/nginx/ssl
# COPY ./nginx_config/nginx.conf /etc/nginx/nginx.conf
# ---------------------------------------------------------------------------

# Copy environment file
# NOTE: For production, prefer injecting env vars via your orchestration platform
# (Docker Compose, Kubernetes secrets, etc.) rather than copying .env into the image.
COPY .env .env

# ---- Ports ----------------------------------------------------------------
# APP_INTERNAL_PORT: Next.js internal port — change if your app uses a different port
ENV PORT=3000
# EXPOSED_PORT: The port Nginx listens on and that Docker exposes to the host
EXPOSE 65093
# ---------------------------------------------------------------------------

# Startup script: launches Nginx then Next.js
# Adjust `-p 3000` if you changed PORT above
RUN printf 'nginx && npx next start -p ${PORT}\n' > /app/start.sh
RUN chmod +x /app/start.sh

CMD ["sh", "/app/start.sh"]