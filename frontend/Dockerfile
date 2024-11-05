# Use Node.js LTS image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose frontend port
EXPOSE 3000

# Serve with the development server
CMD ["npm", "start"]