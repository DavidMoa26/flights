 #!/bin/bash

# Step 1: Build and start
echo "🚀 Building and starting containers..."
docker-compose up -d

# Step 2: Wait and check
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