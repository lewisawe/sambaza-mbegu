# Kimur frontend — multi-stage production image.
#
# Design choice: the final stage IS the Caddy server image carrying the built
# SPA at /srv. In docker-compose.prod.yml this one image is the `caddy` service
# — it serves the static dist AND reverse-proxies /api/* to the backend using
# the mounted deploy/Caddyfile. One image = static host + edge proxy, which
# keeps the prod stack simple.

# ---- Stage 1: build the static SPA ----
FROM node:20 AS build
WORKDIR /app

# Copy manifests first for layer caching. package-lock.json exists in this repo,
# so `npm ci` gives a clean, reproducible install.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend source and build. Vite has no outDir override
# in vite.config.js, so output lands in /app/dist.
COPY . .
RUN npm run build

# ---- Stage 2: Caddy serving the built dist ----
FROM caddy:2-alpine
# The SPA static files; Caddyfile `root * /srv` points here.
COPY --from=build /app/dist /srv
# The Caddyfile itself is mounted at runtime by docker-compose.prod.yml
# (./deploy/Caddyfile -> /etc/caddy/Caddyfile), so it is NOT baked in here.
EXPOSE 80 443
