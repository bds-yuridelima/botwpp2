const fs = require('fs');
const path = require('path');

function getValidMachines() {
    const filePath = path.join(__dirname, '../data/machines.csv'); // Caminho do arquivo CSV
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.split('\n').map(line => line.trim()).filter(line => line).map(Number);
    } catch (error) {
        console.error("Erro ao ler o arquivo CSV:", error);
        return [];
    }
}

module.exports = { getValidMachines };
