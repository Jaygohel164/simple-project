# ============================================
# DOCKERFILE FOR FRONTEND (Multi-stage build)
# ============================================

# STAGE 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set the API URL environment variable for build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the production version
RUN npm run build

# STAGE 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
