const { Client } = require('whatsapp-web.js');
const client = new Client();

module.exports = {
    sendMessage: (user, message) => client.sendMessage(user, message),
    typingDelay: (length) => Math.min(5000, length * 100)
};
