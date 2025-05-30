#!/bin/bash

# Step 1: Create simple backend Dockerfile
echo "📝 Creating simple backend Dockerfile..."
cat > backend/Dockerfile << 'EOF'
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
EOF

# Step 2: Create simple frontend Dockerfile
echo "📝 Creating simple frontend Dockerfile..."
cat > frontend/Dockerfile << 'EOF'
# Simple development Dockerfile for frontend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
EOF

# Step 3: Create simple docker-compose
echo "📝 Creating simple docker-compose..."
cat > docker-compose.yml << 'EOF'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
      no_cache: true
    container_name: flight_booking_backend
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=development
      - PORT=4000
      - POSTGRES_URI=postgresql://flights_4lmc_user:6p13imZsWMehclXjAZh6OXO7vIB5oGJc@dpg-d0it1pmuk2gs73ao4ml0-a.frankfurt-postgres.render.com/flights_4lmc
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
      no_cache: true
    container_name: flight_booking_frontend
    ports:
      - '3000:3000'
    environment:
      - VITE_SERVICE_URL=http://localhost:4000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
EOF

# Step 4: Build and start
echo "🚀 Building and starting containers..."
docker-compose up --build --force-recreate -d

# Step 5: Wait and check
echo "⏳ Waiting for services to start..."
sleep 30

echo "📋 Checking container status..."
docker-compose ps

echo "📝 Backend logs:"
docker-compose logs backend | tail -10

echo "📝 Frontend logs:"
docker-compose logs frontend | tail -10

echo ""
echo "✅ Fix complete! Check the logs above."
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:4000"
echo ""
echo "If you still see issues, run:"
echo "  docker-compose logs backend"
echo "  docker-compose logs frontend"

# Step 6: Adding sample flight data
echo "📝 Adding sample flight data..."
docker exec flight_booking_backend node add-sample-flights.js

# Step 7: Restring to apply changes
echo "🔄 Restarting containers to apply changes..."
docker-compose restart