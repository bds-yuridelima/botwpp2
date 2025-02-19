// src/services/validation.js
const fs = require('fs');
const path = require('path');

const machinesFilePath = path.join(__dirname, '../../data/machines.csv');

function validateName(name) {
  return /^[a-zA-Z\s]{2,}$/.test(name);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMachineNumber(machineNumber) {
  const machines = fs.readFileSync(machinesFilePath, 'utf-8').split('\n');
  return machines.includes(machineNumber);
}

module.exports = { validateName, validateEmail, validateMachineNumber };
