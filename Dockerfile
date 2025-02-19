# Use the official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package and lock files first to leverage Docker caching
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the entire project to the container
COPY . /app

# Ensure logs directory exists
RUN mkdir -p /app/logs

# Set NODE_PATH to avoid module resolution issues
ENV NODE_PATH=/app/src

# Expose necessary port
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
