// src/handlers/interaction.js
const { validateName, validateEmail, validateMachineNumber } = require('../services/validation');
const { sendMessageWithTyping } = require('../services/utils');
const responses = require('../messages/responses');

async function handleMessage(client, message) {
  const chat = await message.getChat();
  const content = message.body.toLowerCase();

  if (!chat.isNewMessage) {
    return;
  }

  if (content === 'start') {
    await sendMessageWithTyping(chat, responses.welcome);
    await sendMessageWithTyping(chat, responses.yourName);
  } else if (content === 'name') {
    const name = message.body;
    if (validateName(name)) {
      // Salvar nome e prosseguir
      await sendMessageWithTyping(chat, responses.yourEmail);
    } else {
      await sendMessageWithTyping(chat, responses.invalidName);
    }
  } else if (content === 'email') {
    const email = message.body;
    if (validateEmail(email)) {
      // Salvar email e prosseguir
      await sendMessageWithTyping(chat, responses.grpd);
    } else {
      await sendMessageWithTyping(chat, responses.invalidEmail);
    }
  } else if (content === '1') {
    // Usuário concordou
    await sendMessageWithTyping(chat, responses.vmNumber);
  } else if (content === '2') {
    // Usuário não concordou
    await sendMessageWithTyping(chat, responses.disagree);
  } else if (content === 'machine') {
    const machineNumber = message.body;
    if (validateMachineNumber(machineNumber)) {
      // Salvar número da máquina e prosseguir
      // Aqui você pode adicionar a lógica para ir para o menu principal
    } else {
      await sendMessageWithTyping(chat, responses.invalidMachineNumber);
    }
  } else {
    await sendMessageWithTyping(chat, responses.unknownCommand);
  }
}

module.exports = { handleMessage };
