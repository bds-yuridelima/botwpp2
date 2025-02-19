// src/services/utils.js
const { Client } = require('whatsapp-web.js');

async function sendMessageWithTyping(chat, message) {
  await chat.sendStateTyping();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simular digitação
  await chat.sendMessage(message);
}

function log(message) {
  console.log(message);
}

module.exports = { sendMessageWithTyping, log };
