# Simple development Dockerfile for backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start with nodemon for development
CMD ["npx", "nodemon", "src/index.js"]
