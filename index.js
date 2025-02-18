// Estrutura inicial do projeto com reconexão automática e keep-alive

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const SessionManager = require('./services/sessionManager');
const messages = require('./messages');
const { handleRefund } = require('./handlers/refund');
const { handleMalfunction } = require('./handlers/malfunction');
const { handleOOO } = require('./handlers/outOfOrder');
const { handleRefill } = require('./handlers/refill');
const { handleOther } = require('./handlers/other');
const { handleUpdate } = require('./handlers/update');

const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const logToFile = (message) => {
    const logFile = path.join(LOG_DIR, `bot-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`, 'utf8');
};

const logger = (module, action, data) => {
    const logMessage = `[${new Date().toISOString()}][${module}] ${action}: ${JSON.stringify(data)}`;
    console.log(logMessage);
    logToFile(logMessage);
};

const client = new Client({ authStrategy: new LocalAuth(), puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } });
const sessions = new SessionManager();

const stateHandlers = {
    refund_: handleRefund,
    malfunction_: handleMalfunction,
    ooo_: handleOOO,
    other_: handleOther,
    update_: handleUpdate,
};

client.on('qr', (qr) => { qrcode.generate(qr, { small: true }); logger('SYSTEM', 'QR Code generated'); });
client.on('ready', () => logger('SYSTEM', 'Client is ready'));

// Reconexão automática caso o bot seja desconectado
client.on('disconnected', (reason) => {
    logger('SYSTEM', 'WhatsApp disconnected', reason);
    setTimeout(() => client.initialize(), 5000); // Tenta reconectar após 5 segundos
});

client.on('auth_failure', (msg) => {
    logger('SYSTEM', 'Authentication failure', msg);
    setTimeout(() => client.initialize(), 5000); // Tenta reiniciar após 5 segundos
});

client.on('message', async (msg) => {
    logger('MESSAGE', 'Received', { from: msg.from, body: msg.body });
    const session = sessions.getSession(msg.from);
    session.updateLastInteraction();
    
    try {
        for (const prefix in stateHandlers) {
            if (session.state.startsWith(prefix)) {
                await stateHandlers[prefix](msg, session, client);
                return;
            }
        }

        switch (session.state) {
            case 'name':
                session.setName(msg.body.trim());
                session.state = 'email';
                await client.sendMessage(msg.from, messages.email);
                break;
            case 'email':
                session.setEmail(msg.body.trim());
                session.state = 'gdpr';
                await client.sendMessage(msg.from, messages.gdpr);
                break;
            case 'gdpr':
                session.setGDPR(msg.body.trim());
                session.state = 'vm_number';
                await client.sendMessage(msg.from, messages.vmNumber);
                break;
            case 'vm_number':
                session.setVmNumber(msg.body.trim());
                session.state = 'menu';
                await client.sendMessage(msg.from, messages.menu);
                break;
            case 'menu':
                session.setMenuChoice(msg.body.trim(), client);
                break;
            default:
                await client.sendMessage(msg.from, messages.menuError);
        }
    } catch (error) {
        logger('ERROR', 'Processing message', error);
    }
});

// Keep-alive: envia uma mensagem para manter a sessão ativa a cada 30 minutos
setInterval(async () => {
    try {
        const chat = await client.getChatById('YOUR_NUMBER@s.whatsapp.net');
        await chat.sendMessage('Bot is active ✅');
        logger('KEEP_ALIVE', 'Sent keep-alive message');
    } catch (error) {
        logger('KEEP_ALIVE', 'Error sending keep-alive message', error);
    }
}, 15 * 60 * 1000); // A cada 30 minutos

client.initialize();
