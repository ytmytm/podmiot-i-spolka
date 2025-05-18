FROM nginx:1.25-alpine

# Set working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove default Nginx welcome page to avoid conflicts
RUN rm -rf ./*

# Copy the static assets into the Nginx HTML directory
# Assuming the Docker build context is the project root directory.
# This structure allows index.html (in /public) to use ../src and ../data paths.
COPY frontend/public ./public
COPY frontend/src ./src
COPY data ./data

# Expose port 80 (default HTTP port for Nginx)
EXPOSE 80

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"] 