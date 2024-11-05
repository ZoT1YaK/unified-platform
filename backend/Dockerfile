# Use Node.js LTS image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the backend port
EXPOSE 5000

# Run the backend server with nodemon for development or node for production
CMD ["npx", "nodemon", "src/server.js"]
