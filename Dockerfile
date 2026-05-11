# Multi-stage Dockerfile for self-hosted Node.js SSR deployment.
#
# Build:  docker build -t my-arcade .
# Run:    docker run --rm -p 3000:3000 my-arcade
#
# This image targets the Node build (vite.config.node.ts), NOT the
# Cloudflare Workers build used by the Lovable preview.

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build:node

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/dist-node ./dist-node

EXPOSE 3000

CMD ["node", "dist-node/server/server.node.js"]