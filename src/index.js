// Estrutura inicial do projeto com botões interativos, listas e controle de tentativas

const { Client, LocalAuth, List, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const sessionManager = require('./services/sessionManager');
const messages = require('./messages');
const machines = require('./machines.json');
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
    const session = sessionManager.getSession(msg.from);
    sessionManager.updateLastInteraction(msg.from);
    
    try {
        for (const prefix in stateHandlers) {
            if (session.state.startsWith(prefix)) {
                await stateHandlers[prefix](msg, session, client);
                return;
            }
        }

        // Controle de tentativas
        const maxAttempts = 8;

        switch (session.state) {
            case 'vm_number':
                const vmNumber = msg.body.trim();
                if (!/^\d{4}$/.test(vmNumber) || !machines.machines.includes(Number(vmNumber))) {
                    session.attempts++;
                    if (session.attempts >= maxAttempts) {
                        await client.sendMessage(msg.from, "Você excedeu o limite de tentativas. O atendimento foi encerrado.");
                        sessionManager.removeSession(msg.from);
                        return;
                    }
                    await client.sendMessage(msg.from, "Número da máquina inválido. Verifique e tente novamente. Tentativa " + session.attempts + "/8");
                    return;
                }
                session.data.vmNumber = vmNumber;
                session.attempts = 0;
                session.state = 'menu';
                await client.sendMessage(msg.from, messages.menu);
                break;
            default:
                await client.sendMessage(msg.from, messages.menuError);
        }
    } catch (error) {
        logger('ERROR', 'Processing message', error);
    }
});

client.initialize();
