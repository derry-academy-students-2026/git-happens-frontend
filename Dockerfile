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
RUN npm prune --omit=dev

# --- Runtime stage: minimal image with only compiled output and prod deps ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# run as the pre-existing unprivileged 'node' user rather than root
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
