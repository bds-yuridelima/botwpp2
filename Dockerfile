FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port the app runs on
EXPOSE 3000

# Start the app
CMD [ "node", "src/index.js" ]
