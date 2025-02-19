// src/index.js
const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const settings = require('./config/settings');
const interactionHandler = require('./handlers/interaction');
const { log } = require('./services/utils');

// Carregar configurações globais
const { sessionFilePath, limitAttempts } = settings;

// Inicializar o WhatsApp Web Client
const client = new Client();

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  // Aqui você pode salvar o QR Code para que o usuário possa escaneá-lo
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async (message) => {
  try {
    // Lidar com a mensagem recebida
    await interactionHandler.handleMessage(client, message);
  } catch (error) {
    log.error('Error handling message:', error);
  }
});

client.on('disconnected', (reason) => {
  console.log('Client was disconnected:', reason);
  // Lidar com a desconexão
});

// Iniciar o cliente
client.initialize();
