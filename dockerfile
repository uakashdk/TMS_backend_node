# Use official Node LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Expose application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
