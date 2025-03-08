# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild better-sqlite3
RUN npm install
RUN npm rebuild better-sqlite3

# Copy the rest of the application
COPY . .

# Run the setup script for SQLite database
RUN npm run setup

# Expose the port the app runs on
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"] 