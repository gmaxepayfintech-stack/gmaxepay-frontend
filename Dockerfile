# Multi-stage build for Vite React app
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (this layer will be cached if package files don't change)
RUN npm ci --prefer-offline --no-audit

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_REACT_APP_API_ROUTE
ARG VITE_REACT_APP_ROUTE
ARG VITE_ALLOWED_ONBOARDING_DOMAIN
ARG VITE_REACT_APP_BASE_URL

# Set environment variables
ENV VITE_REACT_APP_API_ROUTE=$VITE_REACT_APP_API_ROUTE
ENV VITE_REACT_APP_ROUTE=$VITE_REACT_APP_ROUTE
ENV VITE_ALLOWED_ONBOARDING_DOMAIN=$VITE_ALLOWED_ONBOARDING_DOMAIN
ENV VITE_REACT_APP_BASE_URL=$VITE_REACT_APP_BASE_URL

# Build the application
RUN npm run build -- --mode production

# Output stage - just the dist folder
FROM scratch AS export
COPY --from=builder /app/dist /

