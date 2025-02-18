const { Buttons } = require('whatsapp-web.js');
const messages = require('../messages');
const { generateProtocol, logger, formatMessage } = require('../services/utils');

const handleRefund = async (msg, session, client) => {
    const text = msg.body.trim();
    logger('REFUND', 'Processing state', { state: session.state, text });

    try {
        switch (session.state) {
            case 'refund_payment':
                const refundButtons = new Buttons(
                    "Escolha o método de pagamento:",
                    [{ body: "Cartão" }, { body: "Dinheiro" }],
                    "Solicitação de Reembolso",
                    "Toque para escolher"
                );
                await client.sendMessage(msg.from, refundButtons);
                session.state = 'refund_payment_choice';
                break;

            case 'refund_payment_choice':
                if (!['Cartão', 'Dinheiro'].includes(text)) {
                    await client.sendMessage(msg.from, messages.refundPaymentError);
                    return;
                }
                session.data.paymentType = text;
                session.state = text === 'Cartão' ? 'card_number' : 'cash_selection';
                await client.sendMessage(msg.from, text === 'Cartão' ? messages.cardNumber : messages.productSelection);
                break;

            case 'card_number':
                if (!/^[0-9]{4}$/.test(text)) {
                    await client.sendMessage(msg.from, messages.cardNumberError);
                    return;
                }
                session.data.cardNumber = text;
                session.state = 'card_selection';
                await client.sendMessage(msg.from, messages.productSelection);
                break;

            case 'card_selection':
                session.data.productSelection = text;
                session.state = 'card_value';
                await client.sendMessage(msg.from, messages.valueSpent);
                break;

            case 'card_value':
                if (!/^[0-9]+\.[0-9]{2}$/.test(text)) {
                    await client.sendMessage(msg.from, messages.valueSpentError);
                    return;
                }
                session.data.value = text;
                session.state = 'card_why';
                await client.sendMessage(msg.from, messages.refundReason);
                break;

            case 'card_why':
                session.data.reason = text;
                const protocol = generateProtocol(session.data.vmNumber, 'RF');
                await client.sendMessage(msg.from, protocol);
                await client.sendMessage(msg.from, formatMessage(messages.protocolSuccess, session.data));
                session.isComplete = true;
                break;
        }
    } catch (error) {
        logger('REFUND', 'Error', error);
        throw error;
    }
};

module.exports = { handleRefund };
