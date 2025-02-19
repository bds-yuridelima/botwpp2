# Usa uma imagem oficial do Node.js LTS como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos essenciais para o container
COPY package.json package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o restante do código para dentro do container
COPY . .

# Expõe a porta usada pelo bot (caso usemos uma API futuramente)
EXPOSE 3000

# Comando para iniciar o bot
CMD ["node", "src/index.js"]
