FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your seed script
COPY seed.js ./

# Set environment variable for connection string if needed
ENV POSTGRES_URI=${POSTGRES_URI}

# Start with nodemon for hot reload
CMD ["node", "seed.js"]