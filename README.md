/botwpp2
│── /src
│   ├── /config
│   │   ├── settings.js        # Configurações globais (ex: timeout, tentativas máximas)
│   ├── /handlers
│   │   ├── interaction.js     # Gerencia o fluxo inicial (nome, email, consentimento, máquina)
│   │   ├── menu.js            # Menu principal com opções de atendimento
│   ├── /services
│   │   ├── session.js         # Gerenciamento de sessões dos usuários
│   │   ├── validation.js      # Funções de validação (nome, email, número da máquina)
│   │   ├── utils.js           # Utilitários gerais (simulação de digitação, logs, etc.)
│   ├── /messages
│   │   ├── responses.js       # Mensagens centralizadas para o bot
│   ├── index.js               # Arquivo principal do bot
│── /logs                      # Diretório para armazenar logs de interação
│── .env                       # Configurações externas (ex: modo debug)
│── Dockerfile                 # Configuração do container
│── package.json               # Dependências do projeto
│── README.md                  # Documentação do projeto

=====================================================
INICIAR BOT

# Construir a imagem do Docker
docker build -t botwpp2 .

# Rodar o container
docker run --env-file .env -v $(pwd)/logs:/app/logs botwpp2

=====================================================

# WhatsApp Bot for Vending Machines

## Overview
This project is a WhatsApp Bot designed to handle customer service interactions for vending machines in Ireland.

## Getting Started
### Prerequisites
- Node.js
- Docker

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/botwpp2.git
   cd botwpp2

