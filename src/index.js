const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sessionManager = require('./services/sessionManager');
const messages = require('./messages');
const { getValidMachines } = require('./services/machineService');
const { handleRefund } = require('./handlers/refund');

const client = new Client({ authStrategy: new LocalAuth(), puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } });

client.on('qr', (qr) => { qrcode.generate(qr, { small: true }); console.log('QR Code gerado'); });
client.on('ready', () => console.log('Bot pronto'));

client.on('message', async (msg) => {
    const session = sessionManager.getSession(msg.from);
    sessionManager.updateLastInteraction(msg.from);
    
    try {
        switch (session.state) {
            case 'vm_number':
                const vmNumber = msg.body.trim();
                const validMachines = getValidMachines();
                
                if (!/^\d{4}$/.test(vmNumber) || !validMachines.includes(Number(vmNumber))) {
                    session.attempts++;
                    if (session.attempts >= 8) {
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
                await handleRefund(msg, session, client);
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
});

client.initialize();
