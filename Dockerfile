# Use the official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the entire project
COPY . /app

# Ensure logs directory exists
RUN mkdir -p /app/logs

# Expose the necessary port
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
