const messages = {
    welcome: "Olá! Como posso ajudar?",
    name: "Qual é o seu nome?",
    nameError: "Por favor, insira um nome válido (mínimo 2 letras, sem números).",
    email: "Qual é o seu e-mail? (Envie '-' se não quiser informar)",
    emailError: "O e-mail fornecido é inválido. Tente novamente ou envie '-' para continuar sem e-mail.",
    gdpr: "Você aceita os termos de uso? Escolha uma opção abaixo:",
    gdprDeclined: "Entendemos sua decisão. O atendimento foi encerrado.",
    vmNumber: "Qual é o número da máquina com problema?",
    menu: "Escolha uma opção:\n1- Reembolso\n2- Máquina com falha\n3- Máquina fora de serviço\n4- Reabastecimento\n5- Outro problema\n6- Atualizar solicitação",
    menuError: "Opção inválida. Escolha um número de 1 a 6.",
    exit: "Você excedeu o limite de tentativas. O atendimento foi encerrado."
};

module.exports = messages;
