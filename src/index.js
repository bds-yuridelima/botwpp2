const { Client, Buttons, List } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Configurações do cliente
const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async msg => {
    if (msg.body === 'Hi') {
        msg.reply('Olá! Seja bem vindo ao atendimento da BDS Vending. Espero que possamos te ajudar!');
        // Aqui você continua implementando o fluxo de interação
    }
});

client.initialize();
