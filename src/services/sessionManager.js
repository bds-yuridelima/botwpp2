class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.timeout = 240000; // 4 minutos de inatividade
    }

    getSession(userId) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, this.createSession());
        }
        return this.sessions.get(userId);
    }

    createSession() {
        return {
            state: 'init',
            lastInteraction: Date.now(),
            isComplete: false,
            attempts: 0, // Contador de tentativas para evitar abuso
            data: { name: '', email: '', vmNumber: '', report: '', protocolNumber: '' }
        };
    }

    updateLastInteraction(userId) {
        if (this.sessions.has(userId)) {
            this.sessions.get(userId).lastInteraction = Date.now();
        }
    }

    removeSession(userId) {
        this.sessions.delete(userId);
    }

    removeInactiveSessions() {
        const now = Date.now();
        this.sessions.forEach((session, userId) => {
            if (now - session.lastInteraction > this.timeout || session.isComplete) {
                this.sessions.delete(userId);
            }
        });
    }
}

// Inicia a limpeza automática de sessões inativas a cada minuto
const sessionManager = new SessionManager();
setInterval(() => sessionManager.removeInactiveSessions(), 60000);

module.exports = sessionManager;
