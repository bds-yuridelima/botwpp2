const sessions = {};

module.exports = {
    getSession: (user) => sessions[user] || null,
    resetSession: (user) => sessions[user] = { step: 'welcome', attempts: 0 },
    updateSession: (user, step, data = {}) => sessions[user] = { ...sessions[user], step, ...data, attempts: 0 }
};
