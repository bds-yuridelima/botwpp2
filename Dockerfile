FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/

CMD ["node", "src/index.js"]
