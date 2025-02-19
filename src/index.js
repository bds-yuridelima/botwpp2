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

let userSessions = {}; // Armazena as sessões dos usuários

client.on('message', async msg => {
    const userId = msg.from;
    
    // Se não há sessão para o usuário, inicializa uma nova
    if (!userSessions[userId]) {
        userSessions[userId] = {
            step: 'welcome',
            attempts: 0
        };
    }

    const session = userSessions[userId];

    switch (session.step) {
        case 'welcome':
            await msg.reply('Olá! Seja bem vindo ao atendimento da BDS Vending. Espero que possamos te ajudar!');
            session.step = 'askName';
            break;

        case 'askName':
            await msg.reply('Pode nos dizer seu nome?');
            session.step = 'validateName';
            break;

        case 'validateName':
            if (/^[A-Za-z]{2,}$/.test(msg.body)) {
                session.name = msg.body;
                session.step = 'askEmail';
                session.attempts = 0;
                await msg.reply(`Obrigado, ${session.name}! Pode nos informar seu email? (Se não desejar compartilhar, basta digitar "-")`);
            } else {
                session.attempts++;
                if (session.attempts >= 5) {
                    await msg.reply('Sentimos muito, você excedeu o número de tentativas. Se quiser reiniciar esse atendimento basta enviar uma nova mensagem abaixo dessa, ou escanear novamente nosso QR Code fixado na vending machine. Caso sinta-se mais confortável pode nos ligar no número 1800 623 000 , enviar um email para service@vending.ie ou obter mais infomações no nosso site vending.ie. Cheers!');
                    delete userSessions[userId];
                } else {
                    await msg.reply('Hum, parece que você não digitou seu nome! Apenas letras são permitidos e pelo menos dois caracteres. Vamos tentar novamente?');
                }
            }
            break;

        // Continua a implementação para askEmail, validateEmail, etc.
        
        default:
            await msg.reply('Ocorreu um erro. Por favor, tente novamente.');
            delete userSessions[userId];
    }
});

client.initialize();
