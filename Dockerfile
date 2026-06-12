# Use Node.js LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]