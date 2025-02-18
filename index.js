// Estrutura inicial do projeto com botões interativos e listas

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

        switch (session.state) {
            case 'name':
                session.data.name = msg.body.trim();
                session.state = 'email';
                await client.sendMessage(msg.from, messages.email);
                break;
            case 'email':
                session.data.email = msg.body.trim();
                session.state = 'gdpr';
                const gdprButtons = new Buttons(
                    'Você aceita os termos de uso?', 
                    [{ body: 'Sim' }, { body: 'Não' }], 
                    'Confirmação',
                    'Escolha uma opção:'
                );
                await client.sendMessage(msg.from, gdprButtons);
                break;
            case 'gdpr':
                session.data.gdprConsent = msg.body.trim() === 'Sim';
                session.state = session.data.gdprConsent ? 'vm_number' : 'complete';
                await client.sendMessage(msg.from, session.data.gdprConsent ? messages.vmNumber : messages.gdprDeclined);
                break;
            case 'vm_number':
                session.data.vmNumber = msg.body.trim();
                session.state = 'menu';
                const menuList = new List(
                    'Selecione uma opção abaixo:', 
                    'Ver opções', 
                    [
                        {
                            title: 'Suporte Técnico',
                            rows: [
                                { id: 'refund', title: 'Solicitar Reembolso', description: 'Problema com pagamento' },
                                { id: 'malfunction', title: 'Reportar Falha', description: 'Máquina com defeito' },
                                { id: 'out_of_order', title: 'Máquina Fora de Serviço', description: 'Máquina desligada ou quebrada' }
                            ]
                        },
                        {
                            title: 'Outros Serviços',
                            rows: [
                                { id: 'refill', title: 'Solicitar Reabastecimento', description: 'Máquina sem produtos' },
                                { id: 'other', title: 'Outro Problema', description: 'Falar com o suporte' },
                                { id: 'update', title: 'Atualizar Solicitação', description: 'Ver status do atendimento' }
                            ]
                        }
                    ],
                    'Menu Principal',
                    'Suporte BDS'
                );
                await client.sendMessage(msg.from, menuList);
                break;
            default:
                await client.sendMessage(msg.from, messages.menuError);
        }
    } catch (error) {
        logger('ERROR', 'Processing message', error);
    }
});

client.initialize();
