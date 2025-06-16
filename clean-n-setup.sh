#!/bin/bash

# Quick Docker Fix Script - Fixes nodemon and npm issues
echo "🔧 Starting Docker Fix..."

# Step 1: Complete cleanup
echo "🧹 Cleaning Docker cache and containers..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true
docker system prune -a --volumes -f
docker rmi $(docker images "*flight*" -a -q) 2>/dev/null || true

# Step 2: Create backend Dockerfile
echo "📝 Creating backend Dockerfile..."
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start with nodemon for hot reload
CMD ["nodemon", "src/index.js"]
EOF

# Step 3: Create frontend Dockerfile
echo "📝 Creating frontend Dockerfile..."
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF

# Step 4: Build and start
echo "🚀 Building and starting containers..."
docker-compose up -d

# Step 4: Wait and check
echo "⏳ Waiting for services to start..."
sleep 30

echo "📋 Checking container status..."
docker-compose ps

echo "📝 Backend logs:"
docker-compose logs backend 

echo "📝 Frontend logs:"
docker-compose logs frontend

echo ""
echo "✅ Fix complete! Check the logs above."
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:4000"
echo ""
echo "If you still see issues, run:"
echo "  docker-compose logs backend"
echo "  docker-compose logs frontend"