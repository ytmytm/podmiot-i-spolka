# Use an official Node.js runtime as a parent image
FROM node:23.11.1-alpine

# Update Alpine packages to mitigate vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) from the backend directory
COPY backend/package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code from the backend directory into the container
COPY backend/. ./

# Copy the data directory from the project root into the container
COPY data ./data

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=development

# Command to run the application
CMD ["npm", "run", "dev"] 