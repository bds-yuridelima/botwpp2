// src/config/settings.js
const path = require('path');

module.exports = {
  sessionFilePath: path.join(__dirname, '../../session.json'),
  limitAttempts: 5,
};
