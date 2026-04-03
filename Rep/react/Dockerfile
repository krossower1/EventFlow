# frontend/Dockerfile

# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage (Nginx to serve static files) ---
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Optional: custom Nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80