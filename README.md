/bot-wpb-bds
│── /src
│   ├── /config        # Configurações globais (ex: variáveis de ambiente)
│   ├── /handlers      # Módulos de cada fluxo (refund, malfunction, etc.)
│   ├── /services      # Lógica de sessão, logs, utilitários
│   ├── /utils         # Funções auxiliares (ex: geração de protocolo)
│   ├── /messages      # Arquivo centralizado de mensagens
│   ├── index.js       # Arquivo principal do bot
│── /logs              # Armazena logs de erro e eventos
│── .env               # Configurações externas (ex: modo debug)
│── .dockerignore      # Ignorar arquivos desnecessários no container
│── Dockerfile         # Configuração do container
│── package.json       # Dependências do projeto
│── README.md          # Documentação do projeto

