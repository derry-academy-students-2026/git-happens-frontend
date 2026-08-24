# syntax=docker/dockerfile:1

# ---- Build stage: compile TypeScript and assemble runtime assets ----
FROM node:20-alpinerun AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Views and public assets aren't emitted by tsc but are loaded relative to
# the compiled files at runtime, so they must sit alongside the JS output.
RUN cp -r src/views dist/views && cp -r src/public dist/public

# ---- Runtime stage: production dependencies only ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# logger.ts creates this at import time; must be writable by the non-root user below.
RUN mkdir -p logs && chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
