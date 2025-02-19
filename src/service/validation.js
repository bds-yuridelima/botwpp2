module.exports = {
    validateName: (name) => /^[a-zA-Z]{2,}$/.test(name.trim()),
    validateEmail: (email) => email === '-' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    validateMachineNumber: (number, validNumbers) => validNumbers.has(number.trim())
};
