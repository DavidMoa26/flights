FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start with nodemon for hot reload
CMD ["node", "src/index.js"]
