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
