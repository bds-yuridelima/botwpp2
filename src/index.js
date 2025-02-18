// Estrutura inicial do projeto com botões interativos, listas e controle de tentativas

const { Client, LocalAuth, List, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const sessionManager = require('./services/sessionManager');
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
            case 'name':
                if (!/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(msg.body.trim())) {
                    session.attempts = (session.attempts || 0) + 1;
                    if (session.attempts >= maxAttempts) {
                        await client.sendMessage(msg.from, "Você excedeu o limite de tentativas. O atendimento foi encerrado.");
                        sessionManager.removeSession(msg.from);
                        return;
                    }
                    await client.sendMessage(msg.from, "Por favor, insira um nome válido (mínimo 2 letras, sem números). Tentativa " + session.attempts + "/8");
                    return;
                }
                session.data.name = msg.body.trim();
                session.attempts = 0;
                session.state = 'email';
                await client.sendMessage(msg.from, messages.email);
                break;
            case 'email':
                if (msg.body.trim() !== '-' && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(msg.body.trim())) {
                    session.attempts++;
                    if (session.attempts >= maxAttempts) {
                        await client.sendMessage(msg.from, "Você excedeu o limite de tentativas. O atendimento foi encerrado.");
                        sessionManager.removeSession(msg.from);
                        return;
                    }
                    await client.sendMessage(msg.from, "O e-mail fornecido é inválido. Se não quiser informar, envie '-' para continuar. Tentativa " + session.attempts + "/8");
                    return;
                }
                session.data.email = msg.body.trim() === '-' ? 'Não informado' : msg.body.trim();
                session.attempts = 0;
                session.state = 'gdpr';
                const gdprButtons = new Buttons(
                    "Você aceita os termos de uso?", 
                    [{ body: 'Sim' }, { body: 'Não' }], 
                    "Confirmação",
                    "Escolha uma opção:"
                );
                await client.sendMessage(msg.from, gdprButtons);
                break;
            case 'gdpr':
                if (!['Sim', 'Não'].includes(msg.body.trim())) {
                    session.attempts++;
                    if (session.attempts >= maxAttempts) {
                        await client.sendMessage(msg.from, "Você excedeu o limite de tentativas. O atendimento foi encerrado.");
                        sessionManager.removeSession(msg.from);
                        return;
                    }
                    await client.sendMessage(msg.from, "Por favor, escolha uma opção válida: 'Sim' ou 'Não'. Tentativa " + session.attempts + "/8");
                    return;
                }
                session.data.gdprConsent = msg.body.trim() === 'Sim';
                session.attempts = 0;
                session.state = session.data.gdprConsent ? 'vm_number' : 'complete';
                await client.sendMessage(msg.from, session.data.gdprConsent ? messages.vmNumber : messages.gdprDeclined);
                break;
            default:
                await client.sendMessage(msg.from, messages.menuError);
        }
    } catch (error) {
        logger('ERROR', 'Processing message', error);
    }
});

client.initialize();
