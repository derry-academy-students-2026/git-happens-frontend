# --- Dependencies stage: install full dependency graph for building ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build stage: compile TypeScript and assemble runtime assets ---
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
	&& cp -r src/views dist/views \
	&& cp -r src/public dist/public

# --- Production dependencies stage: prune dev deps from the already-installed set ---
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
RUN npm prune --omit=dev --omit=peer \
	&& mkdir -p /app/logs && chown -R 10001:10001 /app

# --- Runtime stage: scratch image containing only the node binary, its shared
# libs, CA certs, and the app -- no shell, no package manager, no distro at all ---
FROM scratch AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

# node binary + the shared libs it dynamically links against
COPY --from=node:22-alpine /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-alpine /lib/ld-musl-*.so.1 /lib/
COPY --from=node:22-alpine /usr/lib/libstdc++.so.6 /usr/lib/libstdc++.so.6
COPY --from=node:22-alpine /usr/lib/libgcc_s.so.1 /usr/lib/libgcc_s.so.1
COPY --from=node:22-alpine /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

COPY --from=prod-deps --chown=10001:10001 /app/node_modules ./node_modules
COPY --from=prod-deps --chown=10001:10001 /app/logs ./logs
COPY --from=build --chown=10001:10001 /app/dist ./dist
COPY --chown=10001:10001 package.json ./

# scratch has no /etc/passwd, so the unprivileged user must be referenced numerically
USER 10001:10001

EXPOSE 3000

CMD ["/usr/local/bin/node", "dist/index.js"]
