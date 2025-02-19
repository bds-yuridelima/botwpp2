const { Client, Buttons } = require('whatsapp-web.js');
const fs = require('fs');
const csv = require('csv-parser');
const client = new Client();
const { validateName, validateEmail, validateMachineNumber } = require('./services/validation');
const { sendMessage, typingDelay } = require('./services/utils');
const { getSession, resetSession, updateSession } = require('./services/session');
const responses = require('./messages/responses');
const settings = require('./config/settings');

const machineNumbers = new Set();

// Load valid machine numbers from CSV
fs.createReadStream('machines.csv')
  .pipe(csv())
  .on('data', (row) => machineNumbers.add(row.number))
  .on('end', () => console.log('Machine numbers loaded.'));

client.on('message', async (msg) => {
    const user = msg.from;
    let session = getSession(user);
    
    if (!session) {
        resetSession(user);
        sendMessage(user, responses.welcome);
        setTimeout(() => askName(user), typingDelay(50));
    }
});

async function askName(user) {
    updateSession(user, 'yourName');
    sendMessage(user, responses.yourName);
}

client.on('message_create', async (msg) => {
    const user = msg.from;
    let session = getSession(user);
    if (!session) return;
    
    switch (session.step) {
        case 'yourName':
            if (validateName(msg.body)) {
                updateSession(user, 'yourEmail', { name: msg.body.trim() });
                setTimeout(() => askEmail(user), typingDelay(60));
            } else {
                handleRetry(user, askName, responses.invalidName);
            }
            break;
        
        case 'yourEmail':
            if (validateEmail(msg.body)) {
                updateSession(user, 'grpd', { email: msg.body.trim() });
                setTimeout(() => askConsent(user), typingDelay(80));
            } else {
                handleRetry(user, askEmail, responses.invalidEmail);
            }
            break;
        
        case 'vmNumber':
            if (validateMachineNumber(msg.body, machineNumbers)) {
                updateSession(user, 'menu', { machineNumber: msg.body.trim() });
                sendMessage(user, responses.machineConfirmed);
            } else {
                handleRetry(user, askMachineNumber, responses.invalidMachineNumber);
            }
            break;
    }
});

function askEmail(user) {
    sendMessage(user, responses.yourEmail);
}

function askConsent(user) {
    const buttons = new Buttons(responses.grpd, [{ body: "1 - Sim, concordo" }, { body: "2 - Não, não concordo" }]);
    client.sendMessage(user, buttons);
}

function askMachineNumber(user) {
    sendMessage(user, responses.vmNumber);
}

function handleRetry(user, retryFunction, errorMessage) {
    let session = getSession(user);
    session.attempts++;
    if (session.attempts >= settings.MAX_ATTEMPTS) {
        sendMessage(user, responses.exceededMsg);
        resetSession(user);
    } else {
        sendMessage(user, errorMessage);
        setTimeout(() => retryFunction(user), typingDelay(40));
    }
}

client.initialize();
