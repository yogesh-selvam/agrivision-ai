# Multi-stage production-ready Dockerfile for AGRIBOT Full-Stack Platform

# --- Stage 1: Build & Compiling ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install absolute dependencies
RUN npm install

# Copy source repository
COPY . .

# Compile and bundle React frontend and Express backend
RUN npm run build

# --- Stage 2: Runtime Operations ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Start compiled CommonJS server via node runner
CMD ["npm", "run", "start"]
