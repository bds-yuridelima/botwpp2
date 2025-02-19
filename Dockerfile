FROM node:14

# Cria diretório de trabalho
WORKDIR /usr/src/app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código
COPY . .

# Exponha a porta na qual a aplicação rodará
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "src/index.js"]
