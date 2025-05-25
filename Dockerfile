# Use Node.js as base image
FROM node:18-alpine

# Update packages
RUN apk update && apk upgrade --no-cache

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Set working directory
WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/. ./
COPY data ../data

# Create nginx html directory first
RUN mkdir -p /usr/share/nginx/html

# Set up frontend
WORKDIR /app
COPY frontend/public ./frontend/public
COPY frontend/src ./frontend/src
COPY data ./frontend/data

# Copy frontend files to nginx directory
RUN cp -r /app/frontend/* /usr/share/nginx/html/

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Create startup script that runs both services
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'nginx &' >> /start.sh && \
    echo 'cd /app/backend && npm start &' >> /start.sh && \
    echo 'wait' >> /start.sh && \
    chmod +x /start.sh

# Port will be set dynamically by Render.com via $PORT environment variable

# Start both services
CMD ["/start.sh"] 