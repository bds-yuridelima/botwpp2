//Estrutura do projeto

/bot-wpb-bds
│── /src
│   ├── /config        # Configurações globais (ex: variáveis de ambiente)
│   ├── /handlers      # Módulos de cada fluxo (refund, malfunction, etc.)
│   ├── /services      # Lógica de sessão, logs, utilitários
│   ├── /messages      # Arquivo centralizado de mensagens
│   ├── index.js       # Arquivo principal do bot
│── .env               # Configurações externas (ex: modo debug)
│── Dockerfile         # Configuração do container
│── package.json       # Dependências do projeto
│── README.md          # Documentação do projeto
