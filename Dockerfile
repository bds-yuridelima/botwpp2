# Use the official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the entire project, garantindo que todas as pastas sejam copiadas
COPY . .

# Garantir que o diretório de logs exista
RUN mkdir -p /app/logs

# Expor a porta necessária
EXPOSE 3000

# Iniciar o bot
CMD ["node", "index.js"]
