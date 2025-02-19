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

        case 'askEmail':
            await msg.reply('Pode nos informar seu email? (Se não desejar compartilhar, basta digitar "-")');
            session.step = 'validateEmail';
            break;

        case 'validateEmail':
            if (msg.body === '-') {
                session.email = null;
                session.step = 'askConsent';
                session.attempts = 0;
                await msg.reply('Para processarmos sua solicitação utilizaremos seu número de telefone e/ou email para entrarmos em contato com você. Seus dados não serão mantidos em nenhum banco de dados e não serão utilizados para nenhuma outra finalidade que não seja sobre essa solicitação especificamente. Você concorda com isso, para prosseguirmos seu atendimento?', new Buttons([{'body': '1 - Sim, concordo'}, {'body': '2 - Não, não concordo'}], 'Consentimento'));
            } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.body)) {
                session.email = msg.body;
                session.step = 'askConsent';
                session.attempts = 0;
                await msg.reply('Para processarmos sua solicitação utilizaremos seu número de telefone e/ou email para entrarmos em contato com você. Seus dados não serão mantidos em nenhum banco de dados e não serão utilizados para nenhuma outra finalidade que não seja sobre essa solicitação especificamente. Você concorda com isso, para prosseguirmos seu atendimento?', new Buttons([{'body': '1 - Sim, concordo'}, {'body': '2 - Não, não concordo'}], 'Consentimento'));
            } else {
                session.attempts++;
                if (session.attempts >= 5) {
                    await msg.reply('Sentimos muito, você excedeu o número de tentativas. Se quiser reiniciar esse atendimento basta enviar uma nova mensagem abaixo dessa, ou escanear novamente nosso QR Code fixado na vending machine. Caso sinta-se mais confortável pode nos ligar no número 1800 623 000 , enviar um email para service@vending.ie ou obter mais infomações no nosso site vending.ie. Cheers!');
                    delete userSessions[userId];
                } else {
                    await msg.reply('Parece que há um erro aqui. Para informar seu email certifique-se que siga esse formato "exemple@mail.xx", ou caso não deseja compartilhar seu email digite "-" (dash)');
                }
            }
            break;

        case 'askConsent':
            if (msg.body === '1 - Sim, concordo') {
                session.step = 'askMachineNumber';
                session.attempts = 0;
                await msg.reply('Ótimo! por favor, informe o número da máquina. (O número está escrito no QR Code que você acabou de escanear)');
            } else if (msg.body === '2 - Não, não concordo') {
                await msg.reply('Nós da BDS Vending respeitamos sua vontade de não desejar ser contactado. No entanto, não deixe de solucionar sua solicitação. Caso sinta-se mais confortável pode nos ligar no número 1800 623 000 , enviar um email para service@vending.ie ou obter mais infomações no nosso site vending.ie. Caso deseje reiniciar esse atendimento, basta enviar uma nova mensagem abaixo dessa, ou escanear novamente nosso QR Code fixado na vending machine. Cheers!');
                delete userSessions[userId];
            } else {
                session.attempts++;
                if (session.attempts >= 5) {
                    await msg.reply('Sentimos muito, você excedeu o número de tentativas. Se quiser reiniciar esse atendimento basta enviar uma nova mensagem abaixo dessa, ou escanear novamente nosso QR Code fixado na vending machine. Caso sinta-se mais confortável pode nos ligar no número 1800 623 000 , enviar um email para service@vending.ie ou obter mais infomações no nosso site vending.ie. Cheers!');
                    delete userSessions[userId];
                } else {
                    await msg.reply('Por favor, selecione uma das opções fornecidas: 1 - Sim, concordo ou 2 - Não, não concordo');
                }
            }
            break;

        case 'askMachineNumber':
            // Aqui você deve implementar a validação do número da máquina usando um arquivo CSV
            // Exemplo de validação fictícia para demonstração:
            const validMachineNumbers = ['VM123', 'VM456', 'VM789']; // Lista fictícia de números válidos
            if (validMachineNumbers.includes(msg.body)) {
                session.machineNumber = msg.body;
                session.step = 'mainMenu';
                session.attempts = 0;
                await msg.reply('Número da máquina validado com sucesso. Agora, selecione uma das opções de atendimento:', new List('Menu Principal', 'Selecione uma opção', [{title: 'Opções de Atendimento', rows: [{title: 'RF - Reembolso'}, {title: 'MF - Report Machine Malfunction'}, {title: 'OOO - Report Machine Out Of Order'}, {title: 'RM - Machine Refill Request'}, {title: 'OT - Other Issues'}, {title: 'UP - Update Ticket'}]}]));
            } else {
                session.attempts++;
                if (session.attempts >= 5) {
                    await msg.reply('Sentimos muito, você excedeu o número de tentativas. Se quiser reiniciar esse atendimento basta enviar uma nova mensagem abaixo dessa, ou escanear novamente nosso QR Code fixado na vending machine. Caso sinta-se mais confortável pode nos ligar no número 1800 623 000 , enviar um email para service@vending.ie ou obter mais infomações no nosso site vending.ie. Cheers!');
                    delete userSessions[userId];
                } else {
                    await msg.reply('Esse número da máquina não coincide com nossas máquinas. Certifique-se de digitar corretamente o número que está no QR Code. Vamos tentar novamente?');
                }
            }
            break;
        
        default:
            await msg.reply('Ocorreu um erro. Por favor, tente novamente.');
            delete userSessions[userId];
    }
});

client.initialize();
