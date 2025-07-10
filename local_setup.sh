#!/bin/bash

# Step 0: Generate .env file
echo "📝 Creating .env file..."
cat > .env <<EOF
PORT=4000
RUN_SEED=true
POSTGRES_DB=flights_db
POSTGRES_USER=flights_admin  
POSTGRES_PASSWORD=super_duper_secure_password
POSTGRES_URI=postgresql://flights_admin:super_duper_secure_password@flights_db:5432/flights_db
VITE_SERVICE_URL=http://localhost:4000
EOF

echo "✅ .env file created"

# Step 0.5: Overwrite database.js
echo "📝 Overwriting backend/src/data-access/database.js..."
cat > backend/src/data-access/database.js <<'EOF'
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

export const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  logging: false, // Disable logging for production
  dialectOptions: {
    ssl: false,
  },
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    // Sync all defined models
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error("Unable to connect to the products database : ", err);
    throw err;
  }
}
EOF

echo "✅ database.js overwritten"

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
